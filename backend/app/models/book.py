from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Book(Base):
    __tablename__ = "books"
    
    id = Column(Integer, primary_key=True, index=True)
    isbn = Column(String(20), unique=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    author = Column(String(255), nullable=False, index=True)
    publisher = Column(String(255))
    publication_year = Column(Integer)
    category = Column(String(100), index=True)
    description = Column(Text)
    cover_image = Column(String(500))
    pdf_file = Column(String(500))
    total_copies = Column(Integer, default=1)
    available_copies = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    language = Column(String(50), default="English")
    pages = Column(Integer)
    rating = Column(Float, default=0.0)
    tags = Column(String(500))  # Comma-separated tags
    department = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    loans = relationship("Loan", back_populates="book", cascade="all, delete-orphan")
    reading_history = relationship("ReadingHistory", back_populates="book", cascade="all, delete-orphan")
