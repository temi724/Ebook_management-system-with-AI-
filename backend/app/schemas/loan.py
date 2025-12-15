from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.loan import LoanStatus


# Base schema
class LoanBase(BaseModel):
    book_id: int
    notes: Optional[str] = None


# Schema for creating a loan
class LoanCreate(LoanBase):
    pass


# Schema for reading a loan (response)
class Loan(LoanBase):
    id: int
    user_id: int
    loan_date: datetime
    due_date: datetime
    return_date: Optional[datetime] = None
    status: LoanStatus
    renewal_count: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Schema with book and user details
class LoanWithDetails(Loan):
    book_title: str
    book_author: str
    user_name: str
    user_email: str
    is_overdue: bool


# Schema for loan list with pagination
class LoanList(BaseModel):
    total: int
    page: int
    page_size: int
    loans: list[LoanWithDetails]
