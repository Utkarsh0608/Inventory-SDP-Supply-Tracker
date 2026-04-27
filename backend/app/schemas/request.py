"""
Pydantic schemas for request management
Handles validation for creating requests, items, and approval/rejection
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List
from app.models.request import RequestStatus

class RequestItemBase(BaseModel):
    """Base request item schema"""
    item_id: int
    quantity: int = Field(..., gt=0)

class RequestItemCreate(RequestItemBase):
    """Schema for creating request items"""
    pass

class RequestItemResponse(RequestItemBase):
    """Schema for request item response"""
    id: int
    item_name: str = None

    class Config:
        from_attributes = True

class RequestBase(BaseModel):
    """Base request schema"""
    pass

class RequestCreate(RequestBase):
    """Schema for creating a new request"""
    items: List[RequestItemCreate] = Field(..., min_length=1)

class RequestResponse(BaseModel):
    """Schema for request response"""
    id: int
    sdp_id: int
    sdp_name: str
    sdp_state: str
    sdp_city: str
    sdp_pincode: str
    status: RequestStatus
    created_at: datetime
    items: List[RequestItemResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True

class RequestApprove(BaseModel):
    """Schema for approving/rejecting a request"""
    request_id: int
    approved: bool
    reason: str = Field(None, max_length=500)
