import hashlib
import json
from decimal import Decimal, InvalidOperation
from django.db import transaction
from django.db.models import Q
from django.db.models.deletion import ProtectedError
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from .models import Cart, CartItem, Category, Order, OrderItem, Product
from .serializers import (CategorySerializer, ProductSerializer, UserSerializer, RegisterSerializer,
                          LoginSerializer, CartMutationSerializer, OrderCreateSerializer, OrderSerializer, cart_data, totals)


class Conflict(APIException):
    status_code = 409


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductSerializer

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True).select_related("category")
        q = self.request.query_params
        if q.get("search"):
            qs = qs.filter(Q(name__icontains=q["search"]) | Q(description__icontains=q["search"]))
        if q.get("category"):
            qs = qs.filter(category__slug=q["category"])
        for key, lookup in [("min_price", "price__gte"), ("max_price", "price__lte")]:
            if key in q:
                try:
                    value = Decimal(q[key])
                    if not value.is_finite() or value < 0:
                        raise ValueError
                except (ValueError, InvalidOperation):
                    raise ValidationError({key: ["Enter a finite nonnegative price."]})
                qs = qs.filter(**{lookup: value})
        for key in ["is_featured", "is_trending"]:
            if key in q:
                if q[key] not in {"true", "false"}:
                    raise ValidationError({key: ["Use true or false."]})
                qs = qs.filter(**{key: q[key] == "true"})
        ordering = q.get("ordering") or "id"
        if ordering not in {"id", "price", "-price", "name", "-name", "-created_at"}:
            raise ValidationError({"ordering": ["Unsupported ordering."]})
        return qs.order_by(ordering, "pk")


class CategoryList(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    pagination_class = None


class AuthView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            user = serializer.save() if self.serializer_class == RegisterSerializer else serializer.validated_data["user"]
            token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": UserSerializer(user).data}, status=201 if self.serializer_class == RegisterSerializer else 200)


class RegisterView(AuthView):
    serializer_class = RegisterSerializer


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    def post(self, request):
        request.auth.delete()
        return Response(status=204)


class CartView(APIView):
    @transaction.atomic
    def get(self, request):
        Cart.objects.get_or_create(user=request.user)
        cart = Cart.objects.select_for_update().get(user=request.user)
        for line in cart.items.select_related("product"):
            if line.unit_price != line.product.price:
                line.unit_price = line.product.price
                line.save(update_fields=["unit_price"])
        return Response(cart_data(cart))


class CartItemsView(APIView):
    @transaction.atomic
    def mutate(self, request, pk=None, delete=False):
        Cart.objects.get_or_create(user=request.user)
        cart = Cart.objects.select_for_update().get(user=request.user)
        if pk is not None:
            item = get_object_or_404(CartItem, pk=pk, cart=cart)
            if delete:
                item.delete()
                return Response(cart_data(cart))
        serializer = CartMutationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if pk is None:
            if "product_id" not in data:
                raise ValidationError({"product_id": ["This field is required."]})
            product = get_object_or_404(Product, pk=data["product_id"], is_active=True)
            item = cart.items.filter(product=product).first()
            quantity = data["quantity"] + (item.quantity if item else 0)
        else:
            product = item.product
            quantity = data["quantity"]
        if not product.is_active or quantity > product.stock:
            raise ValidationError({"quantity": [f"Only {product.stock if product.is_active else 0} available."]})
        if item:
            item.quantity = quantity
            item.unit_price = product.price
            item.save(update_fields=["quantity", "unit_price"])
        else:
            CartItem.objects.create(cart=cart, product=product, quantity=quantity, unit_price=product.price)
        return Response(cart_data(cart))

    def post(self, request):
        return self.mutate(request)


class CartItemView(CartItemsView):
    http_method_names = ["patch", "delete", "options"]

    def patch(self, request, pk):
        return self.mutate(request, pk)

    def delete(self, request, pk):
        return self.mutate(request, pk, delete=True)


class OrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items").select_related("user")

    @transaction.atomic
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        reference = request.headers.get("Idempotency-Key")
        if reference != data["client_reference"]:
            raise ValidationError({"client_reference": ["Must match the Idempotency-Key header."]})
        if data["payment_method"] != "cod":
            raise ValidationError({"payment_method": ["Online payments require a configured payment provider. Choose cash on delivery."]})
        fingerprint = hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()
        Cart.objects.get_or_create(user=request.user)
        cart = Cart.objects.select_for_update().get(user=request.user)
        existing = Order.objects.filter(user=request.user, client_reference=reference).first()
        if existing:
            if existing.request_fingerprint != fingerprint:
                raise Conflict("This reference was already used with different order details.")
            return Response(OrderSerializer(existing).data)
        lines = list(cart.items.order_by("product_id"))
        if not lines:
            raise ValidationError({"detail": "Your cart is empty."})
        products = {p.pk: p for p in Product.objects.select_for_update().filter(pk__in=[i.product_id for i in lines]).order_by("pk")}
        subtotal = Decimal("0.00")
        for line in lines:
            product = products[line.product_id]
            if not product.is_active or product.stock < line.quantity:
                raise Conflict("Stock has changed. Refresh your cart.")
            if line.unit_price != product.price:
                raise Conflict("Prices have changed. Refresh your cart before ordering.")
            subtotal += product.price * line.quantity
        if subtotal > Decimal("999999999900.00"):
            raise ValidationError({"detail": "Order total exceeds the supported limit."})
        order = Order.objects.create(user=request.user, client_reference=reference, request_fingerprint=fingerprint,
                                     shipping_address=data["shipping_address"], payment_method="cod", **totals(subtotal))
        for line in lines:
            product = products[line.product_id]
            OrderItem.objects.create(order=order, product=product, product_name=product.name,
                                     quantity=line.quantity, unit_price=product.price, line_total=product.price * line.quantity)
            product.stock -= line.quantity
            product.save(update_fields=["stock"])
        cart.items.all().delete()
        return Response(OrderSerializer(order).data, status=201)


class OrderDetail(generics.RetrieveAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items").select_related("user")


class AdminProductViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = ProductSerializer
    queryset = Product.objects.select_related("category").all()

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class AdminCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise Conflict("This category still has products.")


class AdminOrderViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = OrderSerializer
    queryset = Order.objects.select_related("user").prefetch_related("items")

    @transaction.atomic
    def partial_update(self, request, pk=None):
        order = get_object_or_404(Order.objects.select_for_update(), pk=pk)
        transitions = {"pending": {"processing", "cancelled"}, "processing": {"shipped", "cancelled"}, "shipped": {"delivered"}}
        new = request.data.get("status")
        if set(request.data) != {"status"} or new not in transitions.get(order.status, set()):
            raise ValidationError({"status": ["Invalid order status transition."]})
        if new == "cancelled":
            for line in order.items.order_by("product_id"):
                product = Product.objects.select_for_update().get(pk=line.product_id)
                product.stock += line.quantity
                product.save(update_fields=["stock"])
        order.status = new
        order.save(update_fields=["status"])
        return Response(OrderSerializer(order).data)
