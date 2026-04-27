"""
Schemas package
Exports all Pydantic schemas for API validation
"""
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.inventory import InventoryCreate, InventoryUpdate, InventoryResponse
from app.schemas.request import RequestCreate, RequestResponse, RequestApprove, RequestItemCreate
from app.schemas.token import Token, TokenData

# List of all schemas to be exported
__all__ = [
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "InventoryCreate",
    "InventoryUpdate",
    "InventoryResponse",
    "RequestCreate",
    "RequestResponse",
    "RequestApprove",
    "RequestItemCreate",
    "Token",
    "TokenData"
]
