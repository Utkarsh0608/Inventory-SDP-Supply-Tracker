"""
Script to create initial admin user
Run this script to create the first admin user
"""
from sqlalchemy.orm import Session
from app.database import engine
from app.models.user import User, UserRole
from app.utils.auth import get_password_hash

def create_admin():
    """Create admin user if not exists"""
    from sqlalchemy.orm import sessionmaker
    
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Delete existing admin if any
        existing = db.query(User).filter(User.email == "admin@example.com").first()
        if existing:
            db.delete(existing)
            db.commit()
            print(f"[INFO] Deleted existing admin: admin@example.com")
        
        # Create new admin user
        admin = User(
            name="Admin",
            email="admin@example.com",
            password=get_password_hash("admin123"),
            role=UserRole.ADMIN
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print(f"[OK] Admin user created successfully!")
        print(f"     Email: {admin.email}")
        print(f"     Password: admin123")
        print(f"     Role: {admin.role.value}")
        
    except Exception as e:
        print(f"[ERROR] Failed to create admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
