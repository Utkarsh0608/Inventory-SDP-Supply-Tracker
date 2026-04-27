"""
User model for authentication and authorization
Handles both Admin and SDP (Service Delivery Point) roles
"""
from sqlalchemy import Column, Integer, String, Enum as SQLEnum
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    """Enum for user roles"""
    ADMIN = "admin"
    SDP = "sdp"

class User(Base):
    """User model representing admins and service delivery points"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.SDP)
    state = Column(String(100), nullable=False, default='')
    city = Column(String(100), nullable=False, default='')
    pincode = Column(String(20), nullable=False, default='')

    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', role='{self.role}', state='{self.state}', city='{self.city}', pincode='{self.pincode}')>"
