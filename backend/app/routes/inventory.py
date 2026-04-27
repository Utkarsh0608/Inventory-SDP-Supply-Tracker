"""
Inventory routes for managing stock items
Provides CRUD operations for inventory management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.inventory import Inventory
from app.models.user import User
from app.schemas.inventory import InventoryCreate, InventoryUpdate, InventoryResponse
from app.routes.auth import get_current_admin, get_current_user
from app.services.alert_service import AlertService

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/", response_model=List[InventoryResponse])
def get_all_items(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all inventory items for authenticated users"""
    items = db.query(Inventory).all()
    return [InventoryResponse.from_orm_with_flag(item) for item in items]

@router.get("/{item_id}", response_model=InventoryResponse)
def get_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a single inventory item by ID for authenticated users"""
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found"
        )
    return InventoryResponse.from_orm_with_flag(item)

@router.post("/", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
def create_item(item_data: InventoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """Create a new inventory item (Admin only)"""
    existing_item = db.query(Inventory).filter(
        Inventory.item_name == item_data.item_name
    ).first()
    
    if existing_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item with this name already exists"
        )
    
    new_item = Inventory(
        item_name=item_data.item_name,
        quantity=item_data.quantity,
        threshold=item_data.threshold
    )
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return InventoryResponse.from_orm_with_flag(new_item)

@router.put("/{item_id}", response_model=InventoryResponse)
def update_item(
    item_id: int,
    item_data: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update an existing inventory item (Admin only)"""
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found"
        )
    
    # Deduct inventory or update details
    if item_data.item_name is not None:
        item.item_name = item_data.item_name
    if item_data.quantity is not None:
        item.quantity = item_data.quantity
    if item_data.threshold is not None:
        item.threshold = item_data.threshold
    
    db.commit()
    db.refresh(item)
    
    # Check for low stock after update and trigger alerts
    AlertService.trigger_low_stock_alerts(db)
    
    return InventoryResponse.from_orm_with_flag(item)

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """Delete an inventory item (Admin only)"""
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found"
        )
    
    db.delete(item)
    db.commit()
    
    return None

@router.get("/low-stock/", response_model=List[InventoryResponse])
def get_low_stock_items(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """Get all items that are at or below their threshold (Admin only)"""
    all_items = db.query(Inventory).all()
    low_stock_items = [item for item in all_items if item.is_low_stock()]
    return [InventoryResponse.from_orm_with_flag(item) for item in low_stock_items]

@router.get("/low-stock/report/")
def get_low_stock_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """Get detailed low stock report (Admin only)"""
    report = AlertService.get_low_stock_report(db)
    return report
