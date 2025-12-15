from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.book import Book
from app.schemas.book import BookCreate, BookUpdate


class BookService:
    """Service for book management operations"""
    
    @staticmethod
    def get_by_id(db: Session, book_id: int) -> Optional[Book]:
        """Get book by ID"""
        return db.query(Book).filter(Book.id == book_id).first()
    
    @staticmethod
    def get_by_isbn(db: Session, isbn: str) -> Optional[Book]:
        """Get book by ISBN"""
        return db.query(Book).filter(Book.isbn == isbn).first()
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 20) -> list[Book]:
        """Get all books with pagination"""
        return db.query(Book).filter(Book.is_active == True).offset(skip).limit(limit).all()
    
    @staticmethod
    def search(
        db: Session,
        query: Optional[str] = None,
        category: Optional[str] = None,
        author: Optional[str] = None,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[list[Book], int]:
        """Search books with filters and pagination"""
        db_query = db.query(Book).filter(Book.is_active == True)
        
        # Apply search query filter
        if query:
            search_filter = or_(
                Book.title.ilike(f"%{query}%"),
                Book.author.ilike(f"%{query}%"),
                Book.description.ilike(f"%{query}%"),
                Book.tags.ilike(f"%{query}%")
            )
            db_query = db_query.filter(search_filter)
        
        # Apply category filter
        if category:
            db_query = db_query.filter(Book.category == category)
        
        # Apply author filter
        if author:
            db_query = db_query.filter(Book.author.ilike(f"%{author}%"))
        
        # Get total count
        total = db_query.count()
        
        # Apply pagination
        books = db_query.offset(skip).limit(limit).all()
        
        return books, total
    
    @staticmethod
    def create(db: Session, book_in: BookCreate) -> Book:
        """Create a new book"""
        db_book = Book(
            **book_in.model_dump(),
            available_copies=book_in.total_copies  # Initially all copies are available
        )
        db.add(db_book)
        db.commit()
        db.refresh(db_book)
        return db_book
    
    @staticmethod
    def update(db: Session, db_book: Book, book_in: BookUpdate) -> Book:
        """Update a book"""
        update_data = book_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_book, field, value)
        
        db.commit()
        db.refresh(db_book)
        return db_book
    
    @staticmethod
    def delete(db: Session, book_id: int) -> bool:
        """Soft delete a book (set is_active to False)"""
        book = db.query(Book).filter(Book.id == book_id).first()
        if book:
            book.is_active = False
            db.commit()
            return True
        return False
    
    @staticmethod
    def update_available_copies(db: Session, book_id: int, delta: int) -> Optional[Book]:
        """
        Update available copies count
        delta: positive for returns, negative for loans
        """
        book = db.query(Book).filter(Book.id == book_id).first()
        if book:
            new_count = book.available_copies + delta
            if new_count < 0 or new_count > book.total_copies:
                return None  # Invalid operation
            
            book.available_copies = new_count
            db.commit()
            db.refresh(book)
            return book
        return None
    
    @staticmethod
    def is_available(db: Session, book_id: int) -> bool:
        """Check if book has available copies"""
        book = db.query(Book).filter(Book.id == book_id).first()
        return book and book.available_copies > 0 and book.is_active
