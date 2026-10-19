from decimal import Decimal
from urllib.parse import urlsplit
from django.contrib.auth import authenticate, password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.text import slugify
from rest_framework import serializers
from .models import Category, Product, User, Order, OrderItem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description"]


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(source="category", queryset=Category.objects.all(), write_only=True)
    slug = serializers.SlugField(required=False)
    images = serializers.ListField(child=serializers.CharField(max_length=2048), required=False)

    def validate_images(self, images):
        for url in images:
            parsed = urlsplit(url)
            if not (url.startswith("/") and not url.startswith("//")) and not (parsed.scheme in {"http", "https"} and parsed.netloc):
                raise serializers.ValidationError("Use an http(s) URL or a relative path starting with /.")
        return images

    def create(self, validated_data):
        if not validated_data.get("slug"):
            base = slugify(validated_data["name"])[:200] or "product"
            slug, suffix = base, 1
            while Product.objects.filter(slug=slug).exists():
                suffix += 1
                slug = f"{base}-{suffix}"
            validated_data["slug"] = slug
        return super().create(validated_data)

    class Meta:
        model = Product
        fields = ["id", "name", "slug", "description", "price", "stock", "category", "category_id", "images", "is_featured", "is_trending", "is_active"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "is_staff"]
        read_only_fields = ["id", "email", "is_staff"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate(self, data):
        user = User(email=data["email"], first_name=data.get("first_name", ""), last_name=data.get("last_name", ""))
        try:
            password_validation.validate_password(data["password"], user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": exc.messages})
        return data

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name"]


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(trim_whitespace=False, write_only=True)

    def validate(self, data):
        user = authenticate(request=self.context["request"], email=data["email"].lower(), password=data["password"])
        if not user:
            raise serializers.ValidationError("Unable to log in with provided credentials.")
        return {"user": user}


class StrictPositiveInteger(serializers.IntegerField):
    def to_internal_value(self, data):
        if isinstance(data, bool):
            self.fail("invalid")
        return super().to_internal_value(data)


class CartMutationSerializer(serializers.Serializer):
    product_id = StrictPositiveInteger(min_value=1, required=False)
    quantity = StrictPositiveInteger(min_value=1, max_value=2147483647)


def totals(subtotal):
    shipping = Decimal("0.00") if subtotal == 0 or subtotal >= 2500 else Decimal("99.00")
    return {"subtotal": subtotal, "shipping": shipping, "tax": Decimal("0.00"), "total": subtotal + shipping}


def cart_data(cart):
    items = list(cart.items.select_related("product__category"))
    subtotal = sum((item.product.price * item.quantity for item in items), Decimal("0.00"))
    return {
        "id": cart.pk,
        "items": [{"id": i.pk, "product": ProductSerializer(i.product).data, "quantity": i.quantity,
                   "unit_price": str(i.product.price), "line_total": f"{i.product.price * i.quantity:.2f}"} for i in items],
        "item_count": sum(i.quantity for i in items),
        **{key: f"{value:.2f}" for key, value in totals(subtotal).items()},
    }


class AddressSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=200)
    phone = serializers.RegexField(r"^[0-9+ ]{10,15}$")
    line1 = serializers.CharField(max_length=255)
    line2 = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")
    city = serializers.CharField(max_length=120)
    state = serializers.CharField(max_length=120)
    postal_code = serializers.RegexField(r"^[0-9]{6}$")
    country = serializers.ChoiceField(choices=["IN"])


class OrderCreateSerializer(serializers.Serializer):
    shipping_address = AddressSerializer()
    payment_method = serializers.ChoiceField(choices=["cod", "upi", "card"])
    client_reference = serializers.CharField(max_length=128)


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "product_id", "product_name", "quantity", "unit_price", "line_total"]


class OrderSerializer(serializers.ModelSerializer):
    number = serializers.ReadOnlyField()
    items = OrderItemSerializer(many=True, read_only=True)
    customer_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Order
        fields = ["id", "number", "status", "payment_method", "payment_status", "created_at", "shipping_address", "items", "subtotal", "shipping", "tax", "total", "customer_email"]
