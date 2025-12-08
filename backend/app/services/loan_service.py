from typing import Optional, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status
from app.models.loan import Loan, LoanStatus
from app.models.book import Book
from app.models.user import User
from app.schemas.loan import LoanCreate, LoanUpdate, LoanWithDetails
from app.services.book_service import BookService


class LoanService:
    """Service for loan operations"""
    
    @staticmethod
    def create_loan(db: Session, user_id: int, loan_in: LoanCreate) -> Loan:
        """Create new loan"""
        # Check book availability
        book = BookService.get_by_id(db, loan_in.book_id)
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found"
            )
        
        if book.available_copies < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Book not available"
            )
        
        # Check if user already has this book
        existing_loan = db.query(Loan).filter(
            and_(
                Loan.user_id == user_id,
                Loan.book_id == loan_in.book_id,
                Loan.status == LoanStatus.ACTIVE
            )
        ).first()
        
        if existing_loan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have this book on loan"
            )
        
        # Create loan
        db_loan = Loan(
            user_id=user_id,
            book_id=loan_in.book_id,
            notes=loan_in.notes
        )
        db.add(db_loan)
        
        # Update book availability
        BookService.update_availability(db, loan_in.book_id, -1)
        
        db.commit()
        db.refresh(db_loan)
        return db_loan
    
    @staticmethod
    def return_loan(db: Session, loan_id: int) -> Loan:
        """Return a loan"""
        loan = db.query(Loan).filter(Loan.id == loan_id).first()
        if not loan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan not found"
            )
        
        if loan.status != LoanStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Loan is not active"
            )
        
        loan.status = LoanStatus.RETURNED
        loan.return_date = datetime.utcnow()
        
        # Update book availability
        BookService.update_availability(db, loan.book_id, 1)
        
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
        
        if loan.status != LoanStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only renew active loans"
            )
        
        if loan.renewal_count >= 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum renewals reached"
            )
        
        loan.due_date = loan.due_date + timedelta(days=14)
        loan.renewal_count += 1
        loan.status = LoanStatus.RENEWED
        
        db.commit()
        db.refresh(db_loan)
        return loan
    
    @staticmethod
    def get_user_loans(
        db: Session,
        user_id: int,
        status: Optional[LoanStatus] = None
    ) -> List[Loan]:
        """Get user's loans"""
        query = db.query(Loan).filter(Loan.user_id == user_id)
        if status:
            query = query.filter(Loan.status == status)
        return query.all()
    
    @staticmethod
    def get_all_loans(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        status: Optional[LoanStatus] = None
    ) -> tuple[List[Loan], int]:
        """Get all loans with pagination"""
        query = db.query(Loan)
        if status:
            query = query.filter(Loan.status == status)
        
        total = query.count()
        loans = query.offset(skip).limit(limit).all()
        return loans, total
    
    @staticmethod
    def check_overdue_loans(db: Session):
        """Check and update overdue loans"""
        overdue_loans = db.query(Loan).filter(
            and_(
                Loan.status.in_([LoanStatus.ACTIVE, LoanStatus.RENEWED]),
                Loan.due_date < datetime.utcnow()
            )
        ).all()
        
        for loan in overdue_loans:
            loan.status = LoanStatus.OVERDUE
        
        if overdue_loans:
            db.commit()
        
        return len(overdue_loans)
