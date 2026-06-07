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


def _to_loan_with_details(loan) -> LoanWithDetails:
    """Helper: convert Loan ORM object to LoanWithDetails schema."""
    is_overdue = (
        loan.status in [LoanStatus.APPROVED, LoanStatus.ACTIVE, LoanStatus.RENEWED]
        and loan.due_date < datetime.utcnow()
    )
    return LoanWithDetails(
        **{c.name: getattr(loan, c.name) for c in loan.__table__.columns},
        book_title=loan.book.title,
        book_author=loan.book.author,
        book_isbn=loan.book.isbn,
        user_name=loan.user.full_name,
        user_email=loan.user.email,
        is_overdue=is_overdue,
    )


@router.post("/", response_model=Loan, status_code=status.HTTP_201_CREATED)
def create_loan(
    loan_in: LoanCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Submit a borrow request (creates a PENDING loan)"""
    return LoanService.create_loan(db, current_user.id, loan_in)


@router.get("/my-loans", response_model=list[LoanWithDetails])
def get_my_loans(
    status: Optional[LoanStatus] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get current user's loans"""
    loans = LoanService.get_user_loans(db, current_user.id, status_filter=status)
    return [_to_loan_with_details(l) for l in loans]


@router.get("/pending", response_model=list[LoanWithDetails])
def get_pending_loans(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_librarian)
):
    """Get all pending loan requests (Admin/Librarian only)"""
    loans = LoanService.get_pending_loans(db)
    return [_to_loan_with_details(l) for l in loans]


@router.get("/return-requests", response_model=list[LoanWithDetails])
def get_return_requests(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_librarian)
):
    """Get all return requests (Admin/Librarian only)"""
    loans = LoanService.get_return_requests(db)
    return [_to_loan_with_details(l) for l in loans]


@router.get("/", response_model=LoanList)
def get_all_loans(
    skip: int = 0,
    limit: int = 20,
    status: Optional[LoanStatus] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_librarian)
):
    """Get all loans with pagination (Admin/Librarian only)"""
    loans, total = LoanService.get_all_loans(db, skip, limit, status_filter=status)
    loans_with_details = [_to_loan_with_details(l) for l in loans]
    page = (skip // limit) + 1 if limit > 0 else 1
    return LoanList(total=total, page=page, page_size=limit, loans=loans_with_details)


@router.post("/{loan_id}/approve", response_model=LoanWithDetails)
def approve_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_librarian)
):
    """Approve a pending borrow request and generate a QR code (Admin/Librarian only)"""
    loan = LoanService.approve_loan(db, loan_id)
    return _to_loan_with_details(loan)


@router.post("/{loan_id}/reject", response_model=Loan)
def reject_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_librarian)
):
    """Reject a pending borrow request (Admin/Librarian only)"""
    return LoanService.reject_loan(db, loan_id)


@router.post("/{loan_id}/request-return", response_model=Loan)
def request_return(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """User marks a book as returned (triggers admin confirmation)"""
    return LoanService.request_return(db, loan_id, current_user.id)


@router.post("/{loan_id}/confirm-return", response_model=Loan)
def confirm_return(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_librarian)
):
    """Admin confirms the return and restores book copies (Admin/Librarian only)"""
    return LoanService.confirm_return(db, loan_id)


@router.post("/{loan_id}/return", response_model=Loan)
def return_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_librarian)
):
    """Admin direct return override"""
    return LoanService.return_loan(db, loan_id)


@router.post("/{loan_id}/renew", response_model=Loan)
def renew_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Renew a loan"""
    loan = LoanService.renew_loan(db, loan_id)
    if loan.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to renew this loan")
    return loan


@router.post("/check-overdue")
def check_overdue(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_librarian)
):
    """Check and update overdue loans (Admin/Librarian only)"""
    count = LoanService.check_overdue_loans(db)
    return {"message": f"Updated {count} overdue loans"}

