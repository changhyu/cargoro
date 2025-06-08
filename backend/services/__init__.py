"""
Services package initialization.
This file makes the services directory a proper Python package.
"""

# Import all service modules to make them available
try:
    # Core services with underscore directory names (Python importable)
    from . import core_api

    print("✅ core_api imported successfully")
except ImportError as e:
    print(f"❌ Failed to import core_api: {e}")

try:
    from . import auth

    print("✅ auth imported successfully")
except ImportError as e:
    print(f"❌ Failed to import auth: {e}")

try:
    from . import repair

    print("✅ repair imported successfully")
except ImportError as e:
    print(f"❌ Failed to import repair: {e}")

try:
    from . import vehicle

    print("✅ vehicle imported successfully")
except ImportError as e:
    print(f"❌ Failed to import vehicle: {e}")

try:
    from . import fleet_api

    print("✅ fleet_api imported successfully")
except ImportError as e:
    print(f"❌ Failed to import fleet_api: {e}")

try:
    from . import admin_api

    print("✅ admin_api imported successfully")
except ImportError as e:
    print(f"❌ Failed to import admin_api: {e}")

try:
    from . import delivery_api

    print("✅ delivery_api imported successfully")
except ImportError as e:
    print(f"❌ Failed to import delivery_api: {e}")

try:
    from . import fastapi_api

    print("✅ fastapi_api imported successfully")
except ImportError as e:
    print(f"❌ Failed to import fastapi_api: {e}")

try:
    from . import parts_api

    print("✅ parts_api imported successfully")
except ImportError as e:
    print(f"❌ Failed to import parts_api: {e}")

try:
    from . import repair_api

    print("✅ repair_api imported successfully")
except ImportError as e:
    print(f"❌ Failed to import repair_api: {e}")

__all__ = [
    "core_api",
    "auth",
    "repair",
    "vehicle",
    "fleet_api",
    "admin_api",
    "delivery_api",
    "fastapi_api",
    "parts_api",
    "repair_api",
]
