"""Create/remove only explicitly tracked, temporary HTTP/browser test data."""
import json
import os
from pathlib import Path
import sys
import uuid

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()
from django.db import transaction
from shop.models import Category, Product

manifest = ROOT / "node_modules" / "integration-catalogue.json"
with transaction.atomic():
    if sys.argv[1] == "create":
        if manifest.exists():
            raise SystemExit("Existing integration manifest must be cleaned up first.")
        slug = "integration-probe-" + uuid.uuid4().hex[:12]
        category = Category.objects.create(name="Integration test category", slug=slug)
        product = Product.objects.create(name="Integration test product " + slug[-12:], slug=slug, category=category,
                                         description="Temporary browser verification record; removed after testing.",
                                         price="123.45", stock=3, is_featured=True, is_trending=True)
        data = {"category_id": category.pk, "product_id": product.pk, "slug": slug, "name": product.name}
        manifest.write_text(json.dumps(data), encoding="utf-8")
        print(json.dumps(data))
    elif sys.argv[1] == "cleanup":
        data = json.loads(manifest.read_text(encoding="utf-8"))
        Product.objects.filter(pk=data["product_id"], slug=data["slug"]).delete()
        Category.objects.filter(pk=data["category_id"], slug=data["slug"]).delete()
        transaction.on_commit(manifest.unlink)
        print("Temporary integration product and category removed.")
    else:
        raise SystemExit("Use create or cleanup")
