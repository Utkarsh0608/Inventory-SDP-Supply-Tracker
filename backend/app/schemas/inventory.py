"""
Pydantic schemas for inventory management
Handles validation for item creation, updates, and responses
"""
from pydantic import BaseModel, Field

class InventoryBase(BaseModel):
    """Base inventory schema with common fields"""
    item_name: str = Field(..., min_length=1, max_length=100)
    quantity: int = Field(..., ge=0)
    threshold: int = Field(..., ge=0)

class InventoryCreate(InventoryBase):
    """Schema for creating a new inventory item"""
    pass

class InventoryUpdate(BaseModel):
    """Schema for updating inventory (partial update allowed)"""
    item_name: str = Field(None, min_length=1, max_length=100)
    quantity: int = Field(None, ge=0)
    threshold: int = Field(None, ge=0)

class InventoryResponse(InventoryBase):
    """Schema for inventory response"""
    id: int
    is_low_stock: bool = False

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_flag(cls, item):
        """Create response with low stock flag from ORM object"""
        return cls(
            id=item.id,
            item_name=item.item_name,
            quantity=item.quantity,
            threshold=item.threshold,
            is_low_stock=item.is_low_stock()
        )
