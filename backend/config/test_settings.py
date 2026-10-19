"""Explicit portable tests only; never a fallback for the live MySQL database."""
from .settings import *  # noqa: F403
DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}}
