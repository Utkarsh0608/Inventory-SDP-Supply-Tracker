"""
Request models for SDP (Service Delivery Point) inventory requests
Handles request headers and individual request items
"""
from sqlalchemy import Column, Integer, String, Enum as SQLEnum, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum

class RequestStatus(str, enum.Enum):
    """Enum for request statuses"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

# Association table for many-to-many relationship between requests and items
request_items = Table(
    'request_items',
    Base.metadata,
    Column('id', Integer, primary_key=True, index=True),
    Column('request_id', Integer, ForeignKey('requests.id'), nullable=False),
    Column('item_id', Integer, ForeignKey('inventory.id'), nullable=False),
    Column('quantity', Integer, nullable=False)
)

class Request(Base):
    """Request model representing SDP inventory requests"""
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    sdp_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    status = Column(SQLEnum(RequestStatus), nullable=False, default=RequestStatus.PENDING)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    sdp = relationship("User", backref="requests")
    items = relationship("Inventory", secondary=request_items, backref="requests")

    def __repr__(self):
        return f"<Request(id={self.id}, sdp_id={self.sdp_id}, status='{self.status}')>"
