from decimal import Decimal
from django.core.cache import cache
from rest_framework.test import APITestCase
from .models import Category, Product, User


class CatalogueTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.category = Category.objects.create(name="Home", slug="home")
        self.product = Product.objects.create(name="Stoneware Mug", slug="mug", description="Handmade ceramic", price="890.00", stock=5, category=self.category, images=["/media/mug.jpg"], is_featured=True)

    def test_category_shape(self):
        response = self.client.get("/api/categories/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0], {"id": self.category.pk, "name": "Home", "slug": "home", "description": ""})

    def test_product_shape_and_pagination(self):
        for i in range(9):
            Product.objects.create(name=f"Other {i}", slug=f"other-{i}", price=10, category=self.category)
        response = self.client.get("/api/products/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 10)
        self.assertEqual(len(response.data["results"]), 8)
        self.assertIsNotNone(response.data["next"])
        first = response.data["results"][0]
        self.assertEqual(first["price"], "890.00")
        self.assertEqual(first["category"]["slug"], "home")
        self.assertEqual(first["images"], ["/media/mug.jpg"])
        self.assertEqual(len(self.client.get("/api/products/?page=2").data["results"]), 2)

    def test_inactive_products_hidden(self):
        self.product.is_active = False
        self.product.save()
        self.assertEqual(self.client.get("/api/products/").data["count"], 0)
        self.assertEqual(self.client.get(f"/api/products/{self.product.pk}/").status_code, 404)

    def test_detail(self):
        response = self.client.get(f"/api/products/{self.product.pk}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Stoneware Mug")

    def test_filters(self):
        response = self.client.get("/api/products/", {"search": "ceramic", "category": "home", "min_price": 800, "max_price": 900, "is_featured": "true"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(self.client.get("/api/products/?is_featured=false").data["count"], 0)
        self.assertEqual(self.client.get("/api/products/?is_trending=true").data["count"], 0)
        self.assertEqual(self.client.get("/api/products/?category=missing").data["count"], 0)

    def test_ordering_and_invalid_filters(self):
        Product.objects.create(name="Expensive", slug="expensive", price=2000, category=self.category)
        self.assertEqual(self.client.get("/api/products/?ordering=-price").data["results"][0]["name"], "Expensive")
        for query in ["min_price=NaN", "max_price=-1", "ordering=password", "is_featured=yes", "page=999"]:
            self.assertIn(self.client.get("/api/products/?" + query).status_code, [400, 404])

    def test_public_cannot_write_and_staff_can(self):
        payload = {"name": "Lamp", "price": "500.00", "stock": 3, "category_id": self.category.pk, "images": []}
        self.assertEqual(self.client.post("/api/products/", payload, format="json").status_code, 405)
        self.assertEqual(self.client.post("/api/admin/products/", payload, format="json").status_code, 401)
        shopper = User.objects.create_user("shopper@example.com", "Strong!password42")
        self.client.force_authenticate(shopper)
        self.assertEqual(self.client.post("/api/admin/products/", payload, format="json").status_code, 403)
        shopper.is_staff = True
        shopper.save()
        response = self.client.post("/api/admin/products/", payload, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["slug"], "lamp")
        pk = response.data["id"]
        self.assertEqual(self.client.patch(f"/api/admin/products/{pk}/", {"price": "-1.00"}, format="json").status_code, 400)
        self.assertEqual(self.client.patch(f"/api/admin/products/{pk}/", {"stock": 8}, format="json").status_code, 200)
        self.assertEqual(self.client.delete(f"/api/admin/products/{pk}/").status_code, 204)
        self.assertEqual(self.client.get(f"/api/products/{pk}/").status_code, 404)

    def test_category_staff_crud_and_protection(self):
        self.client.force_authenticate(User.objects.create_user("staff@example.com", "Strong!password42", is_staff=True))
        response = self.client.post("/api/admin/categories/", {"name": "Tech", "slug": "tech"})
        self.assertEqual(response.status_code, 201)
        pk = response.data["id"]
        self.assertEqual(self.client.patch(f"/api/admin/categories/{pk}/", {"name": "Technology"}).status_code, 200)
        self.assertEqual(self.client.delete(f"/api/admin/categories/{pk}/").status_code, 204)
        self.assertEqual(self.client.delete(f"/api/admin/categories/{self.category.pk}/").status_code, 409)

    def test_cors(self):
        response = self.client.options("/api/products/", HTTP_ORIGIN="http://localhost:5173", HTTP_ACCESS_CONTROL_REQUEST_METHOD="GET", HTTP_ACCESS_CONTROL_REQUEST_HEADERS="authorization,idempotency-key")
        self.assertEqual(response["Access-Control-Allow-Origin"], "http://localhost:5173")
        self.assertIn("idempotency-key", response["Access-Control-Allow-Headers"])
        denied = self.client.get("/api/products/", HTTP_ORIGIN="https://unknown.example")
        self.assertNotIn("Access-Control-Allow-Origin", denied)

    def test_production_frontend_cors(self):
        origin = "https://forma-ecommerce.vercel.app"
        for path in ["/api/products/", "/api/categories/", "/api/auth/me/"]:
            response = self.client.get(path, HTTP_ORIGIN=origin)
            self.assertEqual(response["Access-Control-Allow-Origin"], origin)
        preflight = self.client.options(
            "/api/orders/", HTTP_ORIGIN=origin,
            HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS="authorization,content-type,idempotency-key",
        )
        self.assertEqual(preflight.status_code, 200)
        self.assertEqual(preflight["Access-Control-Allow-Origin"], origin)
        self.assertIn("authorization", preflight["Access-Control-Allow-Headers"])
        self.assertIn("idempotency-key", preflight["Access-Control-Allow-Headers"])
        denied = self.client.get("/api/products/", HTTP_ORIGIN="https://forma-ecommerce.vercel.app.attacker.example")
        self.assertNotIn("Access-Control-Allow-Origin", denied)
