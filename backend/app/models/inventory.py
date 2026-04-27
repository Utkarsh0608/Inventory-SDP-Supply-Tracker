"""
Inventory model for tracking items and stock levels
Manages item quantities and low stock thresholds
"""
from sqlalchemy import Column, Integer, String, Numeric
from app.database import Base

class Inventory(Base):
    """Inventory model representing items in stock"""
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String(100), nullable=False, unique=True)
    quantity = Column(Integer, nullable=False, default=0)
    threshold = Column(Integer, nullable=False, default=10)

    def __repr__(self):
        return f"<Inventory(id={self.id}, item='{self.item_name}', qty={self.quantity}, threshold={self.threshold})>"

    def is_low_stock(self):
        """Check if item quantity is at or below threshold"""
        return self.quantity <= self.threshold
