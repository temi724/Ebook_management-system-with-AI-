from typing import Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status
from app.models.loan import Loan, LoanStatus
from app.models.book import Book
from app.models.user import User
from app.schemas.loan import LoanCreate
from app.services.book_service import BookService
import qrcode
import io
import base64
import json


def _generate_qr_code(loan: Loan, book: Book, user: User) -> str:
    """Generate a QR code for an approved loan and return base64 PNG."""
    qr_data = json.dumps({
        "loan_id": loan.id,
        "book_id": book.id,
        "book_title": book.title,
        "book_isbn": book.isbn or "",
        "user_name": user.full_name,
        "user_email": user.email,
        "due_date": loan.due_date.strftime("%Y-%m-%d"),
    })
    qr = qrcode.QRCode(version=1, box_size=8, border=4)
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


class LoanService:
    """Service for loan management operations"""

    DEFAULT_LOAN_DAYS = 14
    MAX_RENEWALS = 2
    RENEWAL_DAYS = 7

    @staticmethod
    def get_by_id(db: Session, loan_id: int) -> Optional[Loan]:
        """Get loan by ID"""
        return db.query(Loan).filter(Loan.id == loan_id).first()

    @staticmethod
    def get_user_loans(
        db: Session,
        user_id: int,
        status_filter: Optional[LoanStatus] = None
    ) -> list[Loan]:
        """Get all loans for a specific user"""
        query = db.query(Loan).filter(Loan.user_id == user_id)
        if status_filter:
            query = query.filter(Loan.status == status_filter)
        return query.order_by(Loan.loan_date.desc()).all()

    @staticmethod
    def get_pending_loans(db: Session) -> list[Loan]:
        """Get all pending loan requests (admin view)"""
        return (
            db.query(Loan)
            .filter(Loan.status == LoanStatus.PENDING)
            .order_by(Loan.created_at.asc())
            .all()
        )

    @staticmethod
    def get_return_requests(db: Session) -> list[Loan]:
        """Get all loans where the user has requested a return (admin view)"""
        return (
            db.query(Loan)
            .filter(Loan.status == LoanStatus.RETURN_REQUESTED)
            .order_by(Loan.updated_at.asc())
            .all()
        )
    @staticmethod
    def get_all_loans(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        status_filter: Optional[LoanStatus] = None
    ) -> Tuple[list[Loan], int]:
        """Get all loans with pagination"""
        query = db.query(Loan)
        if status_filter:
            query = query.filter(Loan.status == status_filter)
        total = query.count()
        loans = query.order_by(Loan.loan_date.desc()).offset(skip).limit(limit).all()
        return loans, total

    @staticmethod
    def create_loan(db: Session, user_id: int, loan_in: LoanCreate) -> Loan:
        """Create a borrow request (status: PENDING). Copies are NOT decremented yet."""
        existing = db.query(Loan).filter(
            and_(
                Loan.user_id == user_id,
                Loan.book_id == loan_in.book_id,
                Loan.status.in_([
                    LoanStatus.PENDING,
                    LoanStatus.APPROVED,
                    LoanStatus.ACTIVE,
                    LoanStatus.RENEWED,
                    LoanStatus.OVERDUE,
                    LoanStatus.RETURN_REQUESTED,
                ])
            )
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have an active or pending request for this book"
            )

        due_date = datetime.utcnow() + timedelta(days=LoanService.DEFAULT_LOAN_DAYS)
        db_loan = Loan(
            user_id=user_id,
            book_id=loan_in.book_id,
            due_date=due_date,
            status=LoanStatus.PENDING,
            notes=loan_in.notes,
        )
        db.add(db_loan)
        db.commit()
        db.refresh(db_loan)
        return db_loan

    @staticmethod
    def approve_loan(db: Session, loan_id: int) -> Loan:
        """Approve a pending loan request, generate a QR code, decrement available copies."""
        loan = db.query(Loan).filter(Loan.id == loan_id).first()
        if not loan:
            raise HTTPException(status_code=404, detail="Loan not found")
        if loan.status != LoanStatus.PENDING:
            raise HTTPException(status_code=400, detail="Only pending requests can be approved")

        book = db.query(Book).filter(Book.id == loan.book_id).first()
        if not book or book.available_copies < 1:
            raise HTTPException(status_code=400, detail="Book is not available")

        user = db.query(User).filter(User.id == loan.user_id).first()

        book.available_copies -= 1
        loan.qr_code = _generate_qr_code(loan, book, user)
        loan.status = LoanStatus.APPROVED

        db.commit()
        db.refresh(loan)
        return loan

    @staticmethod
    def reject_loan(db: Session, loan_id: int) -> Loan:
        """Reject a pending loan request."""
        loan = db.query(Loan).filter(Loan.id == loan_id).first()
        if not loan:
            raise HTTPException(status_code=404, detail="Loan not found")
        if loan.status != LoanStatus.PENDING:
            raise HTTPException(status_code=400, detail="Only pending requests can be rejected")
        loan.status = LoanStatus.REJECTED
        db.commit()
        db.refresh(loan)
        return loan

    @staticmethod
    def request_return(db: Session, loan_id: int, user_id: int) -> Loan:
        """User indicates they have physically returned the book."""
        loan = db.query(Loan).filter(Loan.id == loan_id).first()
        if not loan:
            raise HTTPException(status_code=404, detail="Loan not found")
        if loan.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not your loan")
        if loan.status not in (LoanStatus.APPROVED, LoanStatus.ACTIVE, LoanStatus.OVERDUE, LoanStatus.RENEWED):
            raise HTTPException(status_code=400, detail="Cannot request return for this loan")
        loan.status = LoanStatus.RETURN_REQUESTED
        db.commit()
        db.refresh(loan)
        return loan

    @staticmethod
    def confirm_return(db: Session, loan_id: int) -> Loan:
        """Admin confirms the book has been returned and increments available copies."""
        loan = db.query(Loan).filter(Loan.id == loan_id).first()
        if not loan:
            raise HTTPException(status_code=404, detail="Loan not found")
        if loan.status != LoanStatus.RETURN_REQUESTED:
            raise HTTPException(status_code=400, detail="Only return-requested loans can be confirmed")

        loan.status = LoanStatus.RETURNED
        loan.return_date = datetime.utcnow()

        book = BookService.update_available_copies(db, loan.book_id, 1)
        if not book:
            raise HTTPException(status_code=500, detail="Failed to update book availability")

        db.commit()
        db.refresh(loan)
        return loan

    @staticmethod
    def return_loan(db: Session, loan_id: int) -> Loan:
        """Admin direct return override."""
        loan = db.query(Loan).filter(Loan.id == loan_id).first()
        if not loan:
            raise HTTPException(status_code=404, detail="Loan not found")
        if loan.status == LoanStatus.RETURNED:
            raise HTTPException(status_code=400, detail="Book already returned")

        loan.return_date = datetime.utcnow()
        loan.status = LoanStatus.RETURNED

        book = BookService.update_available_copies(db, loan.book_id, 1)
        if not book:
            raise HTTPException(status_code=500, detail="Failed to update book availability")

        db.commit()
        db.refresh(loan)
        return loan

    @staticmethod
    def renew_loan(db: Session, loan_id: int) -> Loan:
        """Renew a loan"""
        loan = db.query(Loan).filter(Loan.id == loan_id).first()
        if not loan:
            raise HTTPException(status_code=404, detail="Loan not found")
        if loan.status == LoanStatus.RETURNED:
            raise HTTPException(status_code=400, detail="Cannot renew a returned book")
        if loan.renewal_count >= LoanService.MAX_RENEWALS:
            raise HTTPException(status_code=400, detail=f"Maximum renewals ({LoanService.MAX_RENEWALS}) reached")
        if loan.due_date < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Cannot renew an overdue loan")

        loan.due_date = loan.due_date + timedelta(days=LoanService.RENEWAL_DAYS)
        loan.renewal_count += 1
        loan.status = LoanStatus.RENEWED
        db.commit()
        db.refresh(loan)
        return loan

    @staticmethod
    def check_overdue_loans(db: Session) -> int:
        """Check and update status of overdue loans"""
        current_time = datetime.utcnow()
        overdue_loans = db.query(Loan).filter(
            and_(
                Loan.status.in_([LoanStatus.APPROVED, LoanStatus.ACTIVE, LoanStatus.RENEWED]),
                Loan.due_date < current_time
            )
        ).all()
        for loan in overdue_loans:
            loan.status = LoanStatus.OVERDUE
        db.commit()
        return len(overdue_loans)

    @staticmethod
    def get_overdue_loans(db: Session) -> list[Loan]:
        """Get all overdue loans"""
        return db.query(Loan).filter(Loan.status == LoanStatus.OVERDUE).all()

