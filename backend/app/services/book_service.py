from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.book import Book
from app.schemas.book import BookCreate, BookUpdate


class BookService:
    """Service for book operations"""
    
    @staticmethod
    def get_by_id(db: Session, book_id: int) -> Optional[Book]:
        """Get book by ID"""
        return db.query(Book).filter(Book.id == book_id).first()
    
    @staticmethod
    def get_by_isbn(db: Session, isbn: str) -> Optional[Book]:
        """Get book by ISBN"""
        return db.query(Book).filter(Book.isbn == isbn).first()
    
    @staticmethod
    def create(db: Session, book_in: BookCreate) -> Book:
        """Create new book"""
        db_book = Book(**book_in.dict())
        db_book.available_copies = book_in.total_copies
        db.add(db_book)
        db.commit()
        db.refresh(db_book)
        return db_book
    
    @staticmethod
    def update(db: Session, book: Book, book_in: BookUpdate) -> Book:
        """Update book"""
        update_data = book_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(book, field, value)
        
        db.add(book)
        db.commit()
        db.refresh(book)
        return book
    
    @staticmethod
    def delete(db: Session, book_id: int) -> bool:
        """Soft delete book"""
        book = BookService.get_by_id(db, book_id)
        if book:
            book.is_active = False
            db.commit()
            return True
        return False
    
    @staticmethod
    def search(
        db: Session,
        query: Optional[str] = None,
        category: Optional[str] = None,
        author: Optional[str] = None,
        skip: int = 0,
        limit: int = 20
    ) -> tuple[List[Book], int]:
        """Search books with filters"""
        db_query = db.query(Book).filter(Book.is_active == True)
        
        if query:
            search_filter = or_(
                Book.title.ilike(f"%{query}%"),
                Book.author.ilike(f"%{query}%"),
                Book.description.ilike(f"%{query}%"),
                Book.tags.ilike(f"%{query}%")
            )
            db_query = db_query.filter(search_filter)
        
        if category:
            db_query = db_query.filter(Book.category == category)
        
        if author:
            db_query = db_query.filter(Book.author.ilike(f"%{author}%"))
        
        total = db_query.count()
        books = db_query.offset(skip).limit(limit).all()
        
        return books, total
    
    @staticmethod
    def update_availability(db: Session, book_id: int, delta: int) -> bool:
        """Update available copies (delta: +1 for return, -1 for loan)"""
        book = BookService.get_by_id(db, book_id)
        if book:
            new_available = book.available_copies + delta
            if 0 <= new_available <= book.total_copies:
                book.available_copies = new_available
                db.commit()
                return True
        return False
