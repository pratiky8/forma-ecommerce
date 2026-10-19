from io import StringIO
from pathlib import Path
from tempfile import TemporaryDirectory
from django.core.cache import cache
from django.core.management import call_command
from django.test import override_settings
from rest_framework.test import APITestCase
from .models import Category, Product, Order, Cart, User
from .sample_catalogue import PRODUCTS


class SeedCatalogueTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.media = TemporaryDirectory()
        self.addCleanup(self.media.cleanup)
        self.settings_override = override_settings(MEDIA_ROOT=Path(self.media.name))
        self.settings_override.enable()
        self.addCleanup(self.settings_override.disable)

    def seed(self, **options):
        call_command("seed_catalogue", stdout=StringIO(), **options)

    def test_idempotent_and_preserves_edits_and_unrelated_records(self):
        category = Category.objects.create(slug="home", name="Custom home")
        unrelated = Product.objects.create(slug="real-product", name="Existing", price=100, stock=2, category=category)
        self.seed()
        sample = Product.objects.get(slug="sample-stoneware-mug")
        sample.stock, sample.price, sample.is_active = 1, "999.00", False
        sample.save()
        self.seed()
        self.assertEqual(Product.objects.count(), 13)
        self.assertEqual(Category.objects.count(), 4)
        sample.refresh_from_db()
        self.assertEqual(sample.stock, 1)
        self.assertEqual(str(sample.price), "999.00")
        self.assertFalse(sample.is_active)
        category.refresh_from_db()
        self.assertEqual(category.name, "Custom home")
        unrelated.refresh_from_db()
        self.assertEqual(unrelated.stock, 2)
        self.assertEqual(User.objects.count() + Cart.objects.count() + Order.objects.count(), 0)

    def test_dry_run_changes_neither_database_nor_images(self):
        self.seed(dry_run=True)
        self.assertEqual(Product.objects.count(), 0)
        self.assertEqual(Category.objects.count(), 0)
        self.assertEqual(list(Path(self.media.name).iterdir()), [])

    def test_seeded_api_shape_pagination_and_images(self):
        self.seed()
        response = self.client.get("/api/products/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 12)
        self.assertEqual(len(response.data["results"]), 8)
        self.assertIsNotNone(response.data["next"])
        second = self.client.get("/api/products/?page=2")
        self.assertEqual(len(second.data["results"]), 4)
        self.assertIsNone(second.data["next"])
        first = response.data["results"][0]
        self.assertEqual(first["price"], "890.00")
        self.assertEqual(first["stock"], 32)
        self.assertEqual(first["category"]["slug"], "home")
        self.assertEqual(first["images"], ["/media/sample-products/p-mug.jpg"])
        self.assertEqual(self.client.get(f'/api/products/{first["id"]}/').data, first)
        for row in PRODUCTS:
            self.assertTrue((Path(self.media.name) / "sample-products" / row[5]).is_file())

    def test_seeded_category_filters_and_homepage_flags(self):
        self.seed()
        categories = self.client.get("/api/categories/")
        self.assertEqual(categories.status_code, 200)
        self.assertEqual({c["slug"] for c in categories.data}, {"home", "tech", "carry", "accessories"})
        for category in categories.data:
            response = self.client.get("/api/products/", {"category": category["slug"]})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data["count"], 3)
            self.assertTrue(all(p["category"]["id"] == category["id"] for p in response.data["results"]))
        for flag in ["is_featured", "is_trending"]:
            self.assertEqual(self.client.get("/api/products/", {flag: "true"}).data["count"], 4)
