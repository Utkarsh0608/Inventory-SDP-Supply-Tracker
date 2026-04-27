"""
Script to create SDP user
Run this script to create a test SDP user
"""
from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.models.user import User, UserRole
from app.utils.auth import get_password_hash

def create_sdp_user():
    """Create SDP user if not exists"""
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Delete existing sdp if any
        existing = db.query(User).filter(User.email == "sdp@example.com").first()
        if existing:
            db.delete(existing)
            db.commit()
            print(f"[INFO] Deleted existing sdp: sdp@example.com")
        
        # Create new SDP user
        sdp = User(
            name="SDP User",
            email="sdp@example.com",
            password=get_password_hash("sdp123"),
            role=UserRole.SDP
        )
        
        db.add(sdp)
        db.commit()
        db.refresh(sdp)
        
        print(f"[OK] SDP user created successfully!")
        print(f"     Email: {sdp.email}")
        print(f"     Password: sdp123")
        print(f"     Role: {sdp.role.value}")
        
    except Exception as e:
        print(f"[ERROR] Failed to create SDP user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    from sqlalchemy.orm import sessionmaker
    create_sdp_user()
