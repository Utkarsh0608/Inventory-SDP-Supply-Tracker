"""
Alert service for low stock detection
Automatically checks and alerts when inventory falls below threshold
"""
from sqlalchemy.orm import Session
from app.models.inventory import Inventory
from app.models.user import User
from app.services.email_service import EmailService
from typing import List

class AlertService:
    """Service to handle low stock alerts"""
    
    @staticmethod
    def check_low_stock(db: Session) -> List[Inventory]:
        """
        Check all inventory items and return those below threshold
        
        Args:
            db: Database session
            
        Returns:
            List of Inventory items that are at or below threshold
        """
        all_items = db.query(Inventory).all()
        low_stock_items = [
            item for item in all_items 
            if item.is_low_stock()
        ]
        return low_stock_items
    
    @staticmethod
    def get_low_stock_report(db: Session) -> dict:
        """
        Generate a detailed low stock report
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with low stock details
        """
        low_stock_items = AlertService.check_low_stock(db)
        
        report = {
            "total_low_stock_items": len(low_stock_items),
            "items": []
        }
        
        for item in low_stock_items:
            report["items"].append({
                "id": item.id,
                "item_name": item.item_name,
                "current_quantity": item.quantity,
                "threshold": item.threshold,
                "shortage": item.threshold - item.quantity,
                "severity": "critical" if item.quantity == 0 else "warning"
            })
        
        return report

    @staticmethod
    def trigger_low_stock_alerts(db: Session):
        """
        Check for low stock and send emails to all admins
        """
        report = AlertService.get_low_stock_report(db)
        if report["total_low_stock_items"] > 0:
            # Get all admins
            from app.models.user import UserRole
            admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
            if not admins:
                print("[WARNING] No admins found to receive low stock alerts")
                return

            email_service = EmailService()
            for admin in admins:
                try:
                    email_service.send_low_stock_alert(
                        admin_email=admin.email,
                        low_stock_items=report["items"]
                    )
                except Exception as e:
                    print(f"[ERROR] Failed to send low stock alert to {admin.email}: {e}")
