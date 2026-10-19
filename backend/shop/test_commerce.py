from django.core.cache import cache
from rest_framework.test import APITestCase
from .models import User, Product, Category, Cart, CartItem, Order


class CommerceTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user("buyer@example.com", "Unique!passphrase42")
        self.other = User.objects.create_user("other@example.com", "Unique!passphrase42")
        self.category = Category.objects.create(name="Home", slug="home")
        self.product = Product.objects.create(name="Mug", slug="mug", category=self.category, price="890.00", stock=5)
        self.client.force_authenticate(self.user)
        self.payload = {"client_reference": "ref-1", "payment_method": "cod", "shipping_address": {"full_name": "Buyer", "phone": "9876543210", "line1": "Street", "city": "Pune", "state": "Maharashtra", "postal_code": "411001", "country": "IN"}}

    def add(self, quantity=2):
        return self.client.post("/api/cart/items/", {"product_id": self.product.pk, "quantity": quantity}, format="json")

    def order(self, payload=None):
        return self.client.post("/api/orders/", payload or self.payload, format="json", HTTP_IDEMPOTENCY_KEY="ref-1")

    def test_cart_lifecycle_and_totals(self):
        self.assertEqual(self.client.get("/api/cart/").data["total"], "0.00")
        response = self.add()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total"], "1879.00")
        pk = response.data["items"][0]["id"]
        response = self.client.patch(f"/api/cart/items/{pk}/", {"quantity": 3}, format="json")
        self.assertEqual(response.data["total"], "2670.00")
        self.assertEqual(self.client.delete(f"/api/cart/items/{pk}/").data["items"], [])

    def test_cart_quantity_validation(self):
        for quantity in [0, -1, 1.5, True, 6]:
            self.assertEqual(self.add(quantity).status_code, 400)
        self.add(3)
        self.assertEqual(self.add(3).status_code, 400)
        self.assertEqual(self.client.get("/api/cart/").data["item_count"], 3)

    def test_cart_ownership_and_auth(self):
        pk = self.add().data["items"][0]["id"]
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.patch(f"/api/cart/items/{pk}/", {"quantity": 1}).status_code, 404)
        self.assertEqual(self.client.delete(f"/api/cart/items/{pk}/").status_code, 404)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get("/api/cart/").status_code, 401)
        self.assertEqual(self.client.get("/api/orders/").status_code, 401)

    def test_cod_order_and_replay(self):
        self.add()
        response = self.order()
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["number"].startswith("FRM-"))
        self.assertEqual(response.data["payment_status"], "unpaid")
        self.assertEqual(response.data["total"], "1879.00")
        self.assertEqual(response.data["items"][0]["product_id"], self.product.pk)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)
        self.assertEqual(CartItem.objects.count(), 0)
        replay = self.order()
        self.assertEqual(replay.status_code, 200)
        self.assertEqual(replay.data["id"], response.data["id"])
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(self.client.get("/api/orders/").data["count"], 1)
        self.assertEqual(self.client.get(f'/api/orders/{response.data["id"]}/').status_code, 200)

    def test_order_owner_and_reference_conflict(self):
        self.add()
        pk = self.order().data["id"]
        self.assertEqual(self.order({**self.payload, "shipping_address": {**self.payload["shipping_address"], "city": "Mumbai"}}).status_code, 409)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(f"/api/orders/{pk}/").status_code, 404)
        self.assertEqual(self.client.get("/api/orders/").data["count"], 0)

    def test_stock_conflict_rolls_back(self):
        self.add()
        self.product.stock = 1
        self.product.save()
        self.assertEqual(self.order().status_code, 409)
        self.assertEqual(Order.objects.count(), 0)
        self.assertEqual(CartItem.objects.count(), 1)

    def test_price_change_requires_cart_refresh(self):
        self.add()
        self.product.price = "900.00"
        self.product.save()
        self.assertEqual(self.order().status_code, 409)
        self.assertEqual(Order.objects.count(), 0)
        self.assertEqual(self.client.get("/api/cart/").data["total"], "1899.00")
        self.assertEqual(self.order().status_code, 201)

    def test_online_payment_does_not_fake_success(self):
        self.add()
        for method in ["upi", "card"]:
            self.assertEqual(self.order({**self.payload, "payment_method": method}).status_code, 400)
        self.assertEqual(Order.objects.count(), 0)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 5)

    def test_invalid_order(self):
        self.assertEqual(self.order().status_code, 400)
        self.add()
        invalid = {**self.payload, "shipping_address": {**self.payload["shipping_address"], "postal_code": "1"}}
        self.assertEqual(self.order(invalid).status_code, 400)
        self.assertEqual(self.client.post("/api/orders/", self.payload, format="json").status_code, 400)

    def test_staff_order_transitions(self):
        self.add()
        pk = self.order().data["id"]
        url = f"/api/admin/orders/{pk}/"
        self.assertEqual(self.client.get("/api/admin/orders/").status_code, 403)
        self.user.is_staff = True
        self.user.save()
        self.assertEqual(self.client.get("/api/admin/orders/").status_code, 200)
        self.assertEqual(self.client.patch(url, {"status": "paid"}).status_code, 400)
        self.assertEqual(self.client.patch(url, {"status": "processing"}).status_code, 200)
        self.assertEqual(self.client.patch(url, {"status": "cancelled"}).status_code, 200)
        self.assertEqual(self.client.patch(url, {"status": "cancelled"}).status_code, 400)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 5)


class AuthTests(APITestCase):
    def setUp(self):
        cache.clear()

    def test_register_login_me_logout(self):
        payload = {"email": "NEW@example.com", "password": "Unique!passphrase42", "first_name": "Buyer", "is_staff": True}
        response = self.client.post("/api/auth/register/", payload, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertNotIn("password", response.data["user"])
        user = User.objects.get(email="new@example.com")
        self.assertTrue(user.check_password(payload["password"]))
        self.assertFalse(user.is_staff)
        self.assertEqual(self.client.post("/api/auth/register/", payload, format="json").status_code, 400)
        login = self.client.post("/api/auth/login/", {"email": "NEW@example.com", "password": payload["password"]})
        self.assertEqual(login.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION="Token " + login.data["token"])
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 200)
        response = self.client.patch("/api/auth/me/", {"first_name": "Updated", "is_staff": True})
        self.assertEqual(response.data["first_name"], "Updated")
        user.refresh_from_db()
        self.assertFalse(user.is_staff)
        self.assertEqual(self.client.post("/api/auth/logout/").status_code, 204)
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 401)

    def test_invalid_credentials_and_weak_password(self):
        self.assertEqual(self.client.post("/api/auth/register/", {"email": "buyer@example.com", "password": "123"}).status_code, 400)
        self.assertEqual(self.client.post("/api/auth/login/", {"email": "missing@example.com", "password": "wrong"}).status_code, 400)
        user = User.objects.create_user("inactive@example.com", "Unique!passphrase42", is_active=False)
        self.assertEqual(self.client.post("/api/auth/login/", {"email": user.email, "password": "Unique!passphrase42"}).status_code, 400)
