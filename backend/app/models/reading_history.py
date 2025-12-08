from sqlalchemy import Column, Integer, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class ReadingHistory(Base):
    """Track user reading patterns for AI recommendations"""
    __tablename__ = "reading_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False, index=True)
    read_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    rating = Column(Float)  # User rating 1-5
    reading_time_minutes = Column(Integer)  # Time spent reading
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="reading_history")
    book = relationship("Book", back_populates="reading_history")
