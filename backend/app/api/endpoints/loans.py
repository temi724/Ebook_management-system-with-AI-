from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.schemas.loan import Loan, LoanCreate, LoanList, LoanWithDetails
from app.models.loan import LoanStatus
from app.services.loan_service import LoanService
from app.api.dependencies.auth import get_current_user, get_current_librarian
from datetime import datetime

router = APIRouter()


@router.post("/", response_model=Loan, status_code=status.HTTP_201_CREATED)
def create_loan(
    loan_in: LoanCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Borrow a book"""
    loan = LoanService.create_loan(db, current_user.id, loan_in)
    return loan


@router.get("/my-loans", response_model=list[Loan])
def get_my_loans(
    status: Optional[LoanStatus] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get current user's loans"""
    loans = LoanService.get_user_loans(db, current_user.id, status)
    return loans


@router.get("/", response_model=LoanList)
def get_all_loans(
    skip: int = 0,
    limit: int = 20,
    status: Optional[LoanStatus] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_librarian)
):
    """Get all loans (Librarian/Admin only)"""
    loans, total = LoanService.get_all_loans(db, skip, limit, status)
    
    # Convert to LoanWithDetails
    loans_with_details = []
    for loan in loans:
        is_overdue = (
            loan.status in [LoanStatus.ACTIVE, LoanStatus.RENEWED] and 
            loan.due_date < datetime.utcnow()
        )
        
        loan_detail = LoanWithDetails(
            **loan.__dict__,
            book_title=loan.book.title,
            book_author=loan.book.author,
            user_name=loan.user.full_name,
            user_email=loan.user.email,
            is_overdue=is_overdue
        )
        loans_with_details.append(loan_detail)
    
    page = (skip // limit) + 1 if limit > 0 else 1
    
    return LoanList(
        total=total,
        page=page,
        page_size=limit,
        loans=loans_with_details
    )


@router.post("/{loan_id}/return", response_model=Loan)
def return_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Return a borrowed book"""
    loan = LoanService.return_loan(db, loan_id)
    
    # Verify user owns this loan or is librarian
    if loan.user_id != current_user.id and current_user.role not in ["admin", "librarian"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to return this loan"
        )
    
    return loan


@router.post("/{loan_id}/renew", response_model=Loan)
def renew_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Renew a loan"""
    loan = LoanService.renew_loan(db, loan_id)
    
    # Verify user owns this loan
    if loan.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to renew this loan"
        )
    
    return loan


@router.post("/check-overdue")
def check_overdue(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_librarian)
):
    """Check and update overdue loans (Librarian/Admin only)"""
    count = LoanService.check_overdue_loans(db)
    return {"message": f"Updated {count} overdue loans"}
