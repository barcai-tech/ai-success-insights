"""
Lambda handler for FastAPI application using Mangum adapter.

This allows the existing FastAPI app to run on AWS Lambda with minimal changes.
Mangum handles the conversion between API Gateway events and ASGI format.
"""
# Import unzip_requirements first to unpack dependencies from .requirements.zip
try:
    import unzip_requirements  # noqa
except ImportError:
    pass

from mangum import Mangum
from app.main import app

# Create Lambda handler
# lifespan="off" prevents startup/shutdown events (Lambda handles lifecycle)
handler = Mangum(app, lifespan="off")
