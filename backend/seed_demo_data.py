"""
Seed script for demo data.
Creates admin and SDP accounts plus sample inventory items.
"""
from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.models.user import User, UserRole
from app.models.inventory import Inventory
from app.utils.auth import get_password_hash

SessionLocal = sessionmaker(bind=engine)

def create_demo_users(db):
    users = [
        {
            "name": "Admin",
            "email": "admin@example.com",
            "password": "admin123",
            "role": UserRole.ADMIN
        },
        {
            "name": "SDP User",
            "email": "sdp@example.com",
            "password": "sdp123",
            "role": UserRole.SDP
        }
    ]

    for user_data in users:
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if existing:
            print(f"[INFO] User already exists: {existing.email}")
            continue
        user = User(
            name=user_data["name"],
            email=user_data["email"],
            password=get_password_hash(user_data["password"]),
            role=user_data["role"]
        )
        db.add(user)
    db.commit()
    print("[OK] Demo users created or already present.")


def create_demo_inventory(db):
    items = [
        {"item_name": "Surgical Masks", "quantity": 120, "threshold": 25},
        {"item_name": "Medical Gloves", "quantity": 250, "threshold": 50},
        {"item_name": "Disinfectant Spray", "quantity": 40, "threshold": 20},
        {"item_name": "Hand Sanitizer", "quantity": 70, "threshold": 30},
        {"item_name": "Protective Gowns", "quantity": 15, "threshold": 10}
    ]

    for item_data in items:
        existing = db.query(Inventory).filter(Inventory.item_name == item_data["item_name"]).first()
        if existing:
            print(f"[INFO] Inventory item already exists: {existing.item_name}")
            continue
        item = Inventory(
            item_name=item_data["item_name"],
            quantity=item_data["quantity"],
            threshold=item_data["threshold"]
        )
        db.add(item)
    db.commit()
    print("[OK] Demo inventory created or already present.")


def seed_demo_data():
    db = SessionLocal()
    try:
        create_demo_users(db)
        create_demo_inventory(db)
    except Exception as e:
        print(f"[ERROR] Failed to seed demo data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
