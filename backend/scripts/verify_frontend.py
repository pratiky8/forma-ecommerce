"""Compare frontend files against hashes captured before backend setup."""
import hashlib
import json
from pathlib import Path

backend = Path(__file__).resolve().parents[1]
root = backend.parent
baseline = json.loads((backend / "frontend-baseline.json").read_text())
changed = [name for name, digest in baseline.items() if not (root / name).exists() or hashlib.sha256((root / name).read_bytes()).hexdigest() != digest]
if changed:
    raise SystemExit("Frontend files changed: " + ", ".join(changed))
print(f"Verified {len(baseline)} existing frontend/project files unchanged.")
