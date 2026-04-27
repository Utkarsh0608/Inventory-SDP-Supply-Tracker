"""
Request routes for SDP inventory requests
Handles request creation, viewing, and management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.request import Request, RequestStatus, request_items
from app.models.inventory import Inventory
from app.models.user import User
from app.schemas.request import RequestCreate, RequestResponse, RequestItemResponse
from app.routes.auth import get_current_user, get_current_admin
from app.services.email_service import EmailService
from app.services.alert_service import AlertService

router = APIRouter(prefix="/requests", tags=["Requests"])


def serialize_request(request_obj: Request, db: Session):
    """Serialize request with item and SDP details for the response model."""
    items = db.execute(
        request_items.select().where(request_items.c.request_id == request_obj.id)
    ).fetchall()

    serialized_items = []
    for row in items:
        inventory_item = db.query(Inventory).filter(Inventory.id == row.item_id).first()
        serialized_items.append({
            "id": row.id,
            "item_id": row.item_id,
            "quantity": row.quantity,
            "item_name": inventory_item.item_name if inventory_item else None
        })

    sdp_user = db.query(User).filter(User.id == request_obj.sdp_id).first()

    return {
        "id": request_obj.id,
        "sdp_id": request_obj.sdp_id,
        "sdp_name": sdp_user.name if sdp_user else None,
        "sdp_state": sdp_user.state if sdp_user else None,
        "sdp_city": sdp_user.city if sdp_user else None,
        "sdp_pincode": sdp_user.pincode if sdp_user else None,
        "status": request_obj.status,
        "created_at": request_obj.created_at,
        "items": serialized_items
    }

@router.post("/", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(request_data: RequestCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new inventory request (SDP user)"""
    # Verify user is SDP
    if current_user.role.value != "sdp":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only SDP users can create requests"
        )
    
    # Create new request
    new_request = Request(
        sdp_id=current_user.id,
        status=RequestStatus.PENDING
    )
    
    db.add(new_request)
    db.flush()
    
    # Add items to request
    for item_data in request_data.items:
        # Verify item exists
        item = db.query(Inventory).filter(Inventory.id == item_data.item_id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with id {item_data.item_id} not found"
            )
        
        db.execute(
            request_items.insert().values(
                request_id=new_request.id,
                item_id=item_data.item_id,
                quantity=item_data.quantity
            )
        )
    
    db.commit()
    db.refresh(new_request)
    
    return serialize_request(new_request, db)

@router.get("/", response_model=List[RequestResponse])
def get_my_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all requests for current SDP user"""
    requests = db.query(Request).filter(Request.sdp_id == current_user.id).all()
    return [serialize_request(request, db) for request in requests]

@router.get("/{request_id}", response_model=RequestResponse)
def get_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific request by ID"""
    # SDP users can only view their own requests
    if current_user.role.value == "sdp":
        request_obj = db.query(Request).filter(
            Request.id == request_id,
            Request.sdp_id == current_user.id
        ).first()
    else:
        # Admins can view any request
        request_obj = db.query(Request).filter(Request.id == request_id).first()
    
    if not request_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Request with id {request_id} not found"
        )
    
    return serialize_request(request_obj, db)

@router.get("/all/", response_model=List[RequestResponse])
def get_all_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    status_filter: Optional[RequestStatus] = None
):
    """Get all requests (Admin only)"""
    query = db.query(Request)
    
    if status_filter:
        query = query.filter(Request.status == status_filter)
    
    requests = query.all()
    return [serialize_request(request, db) for request in requests]

@router.post("/approve/{request_id}", response_model=RequestResponse)
def approve_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """Approve a request and deduct inventory (Admin only)"""
    # Get the request
    request = db.query(Request).filter(Request.id == request_id).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Request with id {request_id} not found"
        )
    
    if request.status != RequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Request is already {request.status.value}"
        )
    
    # Get request items
    from app.models.request import request_items as ri
    items = db.execute(
        ri.select().where(ri.c.request_id == request_id)
    ).fetchall()
    
    # Validate and deduct inventory
    approved_items = []
    for item in items:
        inventory_item = db.query(Inventory).filter(Inventory.id == item.item_id).first()
        
        if not inventory_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with id {item.item_id} not found"
            )
        
        if inventory_item.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {inventory_item.item_name}. Available: {inventory_item.quantity}, Requested: {item.quantity}"
            )
        
        # Deduct inventory
        inventory_item.quantity -= item.quantity
        approved_items.append({
            "name": inventory_item.item_name,
            "quantity": item.quantity
        })
    
    # Update request status
    request.status = RequestStatus.APPROVED
    db.commit()
    db.refresh(request)
    
    # Check for low stock alerts after deduction
    AlertService.trigger_low_stock_alerts(db)
    
    # Send approval email notification
    sdp_user = db.query(User).filter(User.id == request.sdp_id).first()
    if sdp_user:
        try:
            email_service = EmailService()
            email_service.send_request_approval_notification(
                user_email=sdp_user.email,
                user_name=sdp_user.name,
                request_id=request_id,
                items=approved_items
            )
        except Exception as e:
            print(f"[ERROR] Failed to send approval email: {e}")
    
    return serialize_request(request, db)

@router.post("/reject/{request_id}", response_model=RequestResponse)
def reject_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """Reject a request (Admin only)"""
    # Get the request
    request = db.query(Request).filter(Request.id == request_id).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Request with id {request_id} not found"
        )
    
    if request.status != RequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Request is already {request.status.value}"
        )
    
    # Update request status
    request.status = RequestStatus.REJECTED
    db.commit()
    db.refresh(request)
    
    # Send rejection email notification
    sdp_user = db.query(User).filter(User.id == request.sdp_id).first()
    if sdp_user:
        try:
            email_service = EmailService()
            email_service.send_request_rejection_notification(
                user_email=sdp_user.email,
                user_name=sdp_user.name,
                request_id=request_id
            )
        except Exception as e:
            print(f"[ERROR] Failed to send rejection email: {e}")
    
    return serialize_request(request, db)
