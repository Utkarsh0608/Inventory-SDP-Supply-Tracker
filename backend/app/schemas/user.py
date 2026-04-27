"""
Pydantic schemas for user management
Handles validation for user registration, login, and responses
"""
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole

class UserBase(BaseModel):
    """Base user schema with common fields"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    state: str = Field(..., min_length=2, max_length=100)
    city: str = Field(..., min_length=2, max_length=100)
    pincode: str = Field(..., min_length=6, max_length=6)

class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    """Schema for user response (excludes password)"""
    id: int
    name: str
    email: EmailStr
    role: UserRole
    state: str = Field('', min_length=0, max_length=100)
    city: str = Field('', min_length=0, max_length=100)
    pincode: str = Field('', min_length=0, max_length=20)

    class Config:
        from_attributes = True
