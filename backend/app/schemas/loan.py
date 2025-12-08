from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.loan import LoanStatus


class LoanBase(BaseModel):
    book_id: int
    notes: Optional[str] = None


class LoanCreate(LoanBase):
    user_id: Optional[int] = None  # Set by backend for current user


class LoanUpdate(BaseModel):
    status: Optional[LoanStatus] = None
    return_date: Optional[datetime] = None
    notes: Optional[str] = None


class LoanInDB(LoanBase):
    id: int
    user_id: int
    loan_date: datetime
    due_date: datetime
    return_date: Optional[datetime] = None
    status: LoanStatus
    renewal_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class Loan(LoanInDB):
    pass


class LoanWithDetails(Loan):
    """Loan with book and user details"""
    book_title: str
    book_author: str
    user_name: str
    user_email: str
    is_overdue: bool


class LoanList(BaseModel):
    total: int
    page: int
    page_size: int
    loans: list[LoanWithDetails]
