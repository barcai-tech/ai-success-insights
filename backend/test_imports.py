#!/usr/bin/env python3
"""
Quick test to verify the v2 implementation is working correctly
"""
import sys
import os

print("🔍 Checking imports...")
print("=" * 60)

try:
    import sqlmodel
    print("✅ SQLModel imported successfully")
    print(f"   Version: {sqlmodel.__version__}")
except ImportError as e:
    print(f"❌ SQLModel import failed: {e}")
    sys.exit(1)

try:
    import fastapi
    print("✅ FastAPI imported successfully")
    print(f"   Version: {fastapi.__version__}")
except ImportError as e:
    print(f"❌ FastAPI import failed: {e}")
    sys.exit(1)

try:
    import pandas
    print("✅ Pandas imported successfully")
    print(f"   Version: {pandas.__version__}")
except ImportError as e:
    print(f"❌ Pandas import failed: {e}")
    sys.exit(1)

print("\n🧪 Testing app imports...")
print("=" * 60)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

try:
    from app import models
    print("✅ Models imported successfully")
    print(f"   - Account model: {models.Account.__name__}")
    print(f"   - AccountMetricsDaily model: {models.AccountMetricsDaily.__name__}")
    print(f"   - HealthSnapshot model: {models.HealthSnapshot.__name__}")
except ImportError as e:
    print(f"❌ Models import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    from app import schemas
    print("✅ Schemas imported successfully")
    print(f"   - AccountResponse: {schemas.AccountResponse.__name__}")
    print(f"   - PortfolioSummary: {schemas.PortfolioSummary.__name__}")
except ImportError as e:
    print(f"❌ Schemas import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    from app import health_scoring
    print("✅ Health scoring module imported successfully")
    # Test that key functions exist
    assert hasattr(health_scoring, 'calculate_health_score'), "calculate_health_score not found"
    assert hasattr(health_scoring, 'save_health_snapshot'), "save_health_snapshot not found"
    print("   - calculate_health_score: available")
    print("   - save_health_snapshot: available")
except ImportError as e:
    print(f"❌ Health scoring import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    from app import database
    print("✅ Database module imported successfully")
    # Test that key functions exist
    assert hasattr(database, 'get_db'), "get_db not found"
    assert hasattr(database, 'init_db'), "init_db not found"
    print("   - get_db: available")
    print("   - init_db: available")
except ImportError as e:
    print(f"❌ Database import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    from app.main import app
    print("✅ Main FastAPI app imported successfully")
    print(f"   - Title: {app.title}")
    print(f"   - Version: {app.version}")
    
    # Count routes
    routes = [route for route in app.routes if hasattr(route, 'methods')]
    print(f"   - Total API routes: {len(routes)}")
    
    print("\n📋 Available Routes:")
    print("=" * 60)
    for route in sorted(routes, key=lambda r: r.path):
        methods = ', '.join(route.methods)
        print(f"   {methods:10} {route.path}")
    
except ImportError as e:
    print(f"❌ Main app import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 60)
print("✅ ALL IMPORTS SUCCESSFUL!")
print("=" * 60)
print("\n🚀 Ready to start the server with:")
print("   uvicorn app.main:app --reload")
print("\n📚 API Documentation will be available at:")
print("   http://localhost:8000/docs")
print("   http://localhost:8000/redoc")
