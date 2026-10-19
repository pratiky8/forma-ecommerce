from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from unittest import skipUnless
from django.db import close_old_connections, connection
from django.test import TransactionTestCase
from rest_framework.test import APIClient
from .models import User, Category, Product, Cart, CartItem, Order


@skipUnless(connection.vendor == "mysql", "Requires real MySQL row locking and separate connections")
class CheckoutConcurrencyTests(TransactionTestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Home", slug="home")
        self.product = Product.objects.create(name="Last mug", slug="last-mug", price="100.00", stock=1, category=self.category)
        self.users = [User.objects.create_user(f"buyer{i}@example.com", "Unique!passphrase42") for i in range(2)]
        for user in self.users:
            cart = Cart.objects.create(user=user)
            CartItem.objects.create(cart=cart, product=self.product, quantity=1, unit_price="100.00")

    def place_orders(self, users):
        barrier = Barrier(2, timeout=15)

        def checkout(user_id):
            close_old_connections()
            try:
                client = APIClient()
                client.force_authenticate(User.objects.get(pk=user_id))
                barrier.wait()
                response = client.post("/api/orders/", {
                    "client_reference": "concurrent", "payment_method": "cod",
                    "shipping_address": {"full_name": "Buyer", "phone": "9876543210", "line1": "Street", "city": "Pune", "state": "Maharashtra", "postal_code": "411001", "country": "IN"},
                }, format="json", HTTP_IDEMPOTENCY_KEY="concurrent")
                return response.status_code, response.data.get("id")
            finally:
                close_old_connections()

        with ThreadPoolExecutor(max_workers=2) as pool:
            return list(pool.map(checkout, [user.pk for user in users]))

    def test_two_buyers_cannot_oversell_last_item(self):
        results = self.place_orders(self.users)
        self.assertEqual(sorted(status for status, _ in results), [201, 409])
        self.assertEqual(Order.objects.count(), 1)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 0)

    def test_concurrent_same_reference_creates_only_one_order(self):
        results = self.place_orders([self.users[0], self.users[0]])
        self.assertEqual(sorted(status for status, _ in results), [200, 201])
        self.assertEqual(results[0][1], results[1][1])
        self.assertEqual(Order.objects.count(), 1)
