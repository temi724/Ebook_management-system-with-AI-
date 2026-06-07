from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import enum
from app.db.base import Base


class LoanStatus(str, enum.Enum):
    PENDING = "pending"           # User requested borrow
    APPROVED = "approved"         # Admin approved, QR generated
    RETURN_REQUESTED = "return_requested"  # User marked as returned
    RETURNED = "returned"         # Admin confirmed return
    REJECTED = "rejected"         # Admin rejected request
    OVERDUE = "overdue"           # Past due date
    ACTIVE = "active"             # Legacy
    RENEWED = "renewed"           # Legacy


class Loan(Base):
    __tablename__ = "loans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False, index=True)
    loan_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    due_date = Column(DateTime, nullable=False)
    return_date = Column(DateTime)
    status = Column(Enum(LoanStatus), default=LoanStatus.PENDING, nullable=False)
    renewal_count = Column(Integer, default=0)
    notes = Column(Text)
    qr_code = Column(Text, nullable=True)  # Base64 encoded QR code PNG
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="loans")
    book = relationship("Book", back_populates="loans")
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.due_date:
            self.due_date = datetime.utcnow() + timedelta(days=14)  # Default 14 days
