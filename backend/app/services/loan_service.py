from typing import Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status
from app.models.loan import Loan, LoanStatus
from app.models.book import Book
from app.schemas.loan import LoanCreate
from app.services.book_service import BookService


class LoanService:
    """Service for loan management operations"""
    
    # Constants
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
        status: Optional[LoanStatus] = None
    ) -> list[Loan]:
        """Get all loans for a specific user"""
        query = db.query(Loan).filter(Loan.user_id == user_id)
        
        if status:
            query = query.filter(Loan.status == status)
        
        return query.order_by(Loan.loan_date.desc()).all()
    
    @staticmethod
    def get_all_loans(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        status: Optional[LoanStatus] = None
    ) -> Tuple[list[Loan], int]:
        """Get all loans with pagination"""
        query = db.query(Loan)
        
        if status:
            query = query.filter(Loan.status == status)
        
        total = query.count()
        loans = query.order_by(Loan.loan_date.desc()).offset(skip).limit(limit).all()
        
        return loans, total
    
    @staticmethod
    def create_loan(db: Session, user_id: int, loan_in: LoanCreate) -> Loan:
        """Create a new loan (borrow a book)"""
        # Check if book is available
        if not BookService.is_available(db, loan_in.book_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Book is not available for borrowing"
            )
        
        # Check if user already has an active loan for this book
        existing_loan = db.query(Loan).filter(
            and_(
                Loan.user_id == user_id,
                Loan.book_id == loan_in.book_id,
                Loan.status.in_([LoanStatus.ACTIVE, LoanStatus.RENEWED])
            )
        ).first()
        
        if existing_loan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have an active loan for this book"
            )
        
        # Create loan
        due_date = datetime.utcnow() + timedelta(days=LoanService.DEFAULT_LOAN_DAYS)
        db_loan = Loan(
            user_id=user_id,
            book_id=loan_in.book_id,
            due_date=due_date,
            notes=loan_in.notes
        )
        
        # Update book availability
        book = BookService.update_available_copies(db, loan_in.book_id, -1)
        if not book:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update book availability"
            )
        
        db.add(db_loan)
        db.commit()
        db.refresh(db_loan)
        return db_loan
    
    @staticmethod
    def return_loan(db: Session, loan_id: int) -> Loan:
        """Return a borrowed book"""
        loan = db.query(Loan).filter(Loan.id == loan_id).first()
        
        if not loan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan not found"
            )
        
        if loan.status == LoanStatus.RETURNED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Book has already been returned"
            )
        
        # Update loan
        loan.return_date = datetime.utcnow()
        loan.status = LoanStatus.RETURNED
        
        # Update book availability
        book = BookService.update_available_copies(db, loan.book_id, 1)
        if not book:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update book availability"
            )
        
        db.commit()
        db.refresh(loan)
        return loan
    
    @staticmethod
    def renew_loan(db: Session, loan_id: int) -> Loan:
        """Renew a loan"""
        loan = db.query(Loan).filter(Loan.id == loan_id).first()
        
        if not loan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan not found"
            )
        
        if loan.status == LoanStatus.RETURNED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot renew a returned book"
            )
        
        if loan.renewal_count >= LoanService.MAX_RENEWALS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximum renewals ({LoanService.MAX_RENEWALS}) reached"
            )
        
        # Check if overdue
        if loan.due_date < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot renew an overdue loan"
            )
        
        # Renew loan
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
        
        # Find all active/renewed loans that are overdue
        overdue_loans = db.query(Loan).filter(
            and_(
                Loan.status.in_([LoanStatus.ACTIVE, LoanStatus.RENEWED]),
                Loan.due_date < current_time
            )
        ).all()
        
        # Update status to overdue
        for loan in overdue_loans:
            loan.status = LoanStatus.OVERDUE
        
        db.commit()
        return len(overdue_loans)
    
    @staticmethod
    def get_overdue_loans(db: Session) -> list[Loan]:
        """Get all overdue loans"""
        return db.query(Loan).filter(Loan.status == LoanStatus.OVERDUE).all()
