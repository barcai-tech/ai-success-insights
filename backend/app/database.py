from sqlmodel import create_engine, SQLModel, Session
from sqlalchemy.pool import StaticPool, NullPool
from dotenv import load_dotenv
import os

# Load environment variables FIRST (before reading DATABASE_URL)
load_dotenv()

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ai_success_insights.db")

# Create engine with Lambda-friendly configuration
if DATABASE_URL.startswith("sqlite"):
    # SQLite for local development
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False  # Set to True for SQL debugging
    )
elif DATABASE_URL.startswith("postgresql"):
    # PostgreSQL for production (Neon, AWS RDS, etc.)
    # NullPool is Lambda-friendly - creates new connections per invocation
    engine = create_engine(
        DATABASE_URL,
        poolclass=NullPool,  # No connection pooling for Lambda
        echo=False,
        connect_args={
            "connect_timeout": 10,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5,
        }
    )
else:
    # Fallback for other databases
    engine = create_engine(DATABASE_URL, echo=False)


def init_db():
    """Initialize database tables"""
    SQLModel.metadata.create_all(engine)


def get_db():
    """Dependency for getting database session"""
    with Session(engine) as session:
        yield session
