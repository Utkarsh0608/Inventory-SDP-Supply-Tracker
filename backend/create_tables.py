"""
Script to create all database tables
Run this script after Step 3 to create tables in the database
"""
from sqlalchemy import text
from app.database import engine, Base
from app.models import User, Inventory, Request, RequestStatus, request_items

LOCATION_COLUMNS = [
    ("state", "VARCHAR(100) NOT NULL DEFAULT ''"),
    ("city", "VARCHAR(100) NOT NULL DEFAULT ''"),
    ("pincode", "VARCHAR(20) NOT NULL DEFAULT ''")
]

def ensure_user_location_columns():
    """Ensure the users table has the new SDP location columns."""
    with engine.begin() as conn:
        for column_name, column_def in LOCATION_COLUMNS:
            conn.execute(
                text(
                    f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {column_name} {column_def}"
                )
            )


def create_tables():
    """Create all database tables and add missing user columns."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("[OK] All tables created successfully!")

    print("Ensuring user location columns exist...")
    ensure_user_location_columns()
    print("[OK] User location columns verified.")

    print("\nCreated tables:")
    print("  - users")
    print("  - inventory")
    print("  - requests")
    print("  - request_items")

if __name__ == "__main__":
    create_tables()
