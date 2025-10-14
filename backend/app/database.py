from sqlmodel import create_engine, SQLModel, Session
from sqlalchemy.pool import StaticPool
import os

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ai_success_insights.db")

# Create engine
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False  # Set to True for SQL debugging
    )
else:
    engine = create_engine(DATABASE_URL, echo=False)


def init_db():
    """Initialize database tables"""
    SQLModel.metadata.create_all(engine)


def get_db():
    """Dependency for getting database session"""
    with Session(engine) as session:
        yield session
