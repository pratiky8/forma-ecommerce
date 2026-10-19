from django.core.management.base import BaseCommand, CommandError
from django.db import connection


class Command(BaseCommand):
    help = "Verify the configured database without displaying credentials."

    def handle(self, *args, **options):
        try:
            connection.ensure_connection()
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                if cursor.fetchone()[0] != 1:
                    raise CommandError("Database probe returned an unexpected result.")
        except Exception:
            raise CommandError("Database connection failed. Check backend/.env and database provisioning. Credentials were not printed.") from None
        self.stdout.write(self.style.SUCCESS(f"Database connection verified ({connection.vendor})."))
