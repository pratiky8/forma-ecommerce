from pathlib import Path
import shutil
from decimal import Decimal
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from shop.models import Category, Product
from shop.sample_catalogue import CATEGORIES, PRODUCTS


class Command(BaseCommand):
    help = "Create 12 sample products without overwriting existing inventory or edits."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Preview database changes, then roll them back; copy no images.")

    def handle(self, *args, **options):
        source = settings.BASE_DIR.parent / "src" / "assets"
        for row in PRODUCTS:
            if not (source / row[5]).is_file():
                raise CommandError(f"Missing catalogue image: {row[5]}; database unchanged.")
        created_categories = created_products = 0
        with transaction.atomic():
            categories = {}
            for slug, (name, description) in CATEGORIES.items():
                category, created = Category.objects.get_or_create(slug=slug, defaults={"name": name, "description": description})
                categories[slug] = category
                created_categories += int(created)
            for index, (slug, name, category, price, stock, image, description) in enumerate(PRODUCTS):
                _, created = Product.objects.get_or_create(slug=f"sample-{slug}", defaults={
                    "name": name, "category": categories[category], "price": Decimal(price),
                    "stock": stock, "description": description,
                    "images": [f"{settings.MEDIA_URL}sample-products/{image}"],
                    "is_active": True, "is_featured": index in {0, 3, 6, 9},
                    "is_trending": index in {1, 4, 7, 10},
                })
                created_products += int(created)
            if options["dry_run"]:
                transaction.set_rollback(True)
            else:
                destination = Path(settings.MEDIA_ROOT) / "sample-products"
                destination.mkdir(parents=True, exist_ok=True)
                for row in PRODUCTS:
                    target = destination / row[5]
                    if not target.exists():
                        shutil.copyfile(source / row[5], target)
        prefix = "Dry run (rolled back)" if options["dry_run"] else "Seed complete"
        self.stdout.write(self.style.SUCCESS(
            f"{prefix}: {created_categories} categories and {created_products} products created; "
            f"{len(PRODUCTS) - created_products} existing sample products preserved."
        ))
