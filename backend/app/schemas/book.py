from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


# Base schema
class BookBase(BaseModel):
    isbn: Optional[str] = None
    title: str
    author: str
    publisher: Optional[str] = None
    publication_year: Optional[int] = None
    category: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = "English"
    pages: Optional[int] = None
    total_copies: int = 1
    tags: Optional[str] = None


# Schema for creating a book
class BookCreate(BookBase):
    pass


# Schema for updating a book
class BookUpdate(BaseModel):
    isbn: Optional[str] = None
    title: Optional[str] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    publication_year: Optional[int] = None
    category: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    pdf_file: Optional[str] = None
    language: Optional[str] = None
    pages: Optional[int] = None
    total_copies: Optional[int] = None
    available_copies: Optional[int] = None
    is_active: Optional[bool] = None
    rating: Optional[float] = None
    tags: Optional[str] = None


# Schema for reading a book (response)
class Book(BookBase):
    id: int
    cover_image: Optional[str] = None
    pdf_file: Optional[str] = None
    available_copies: int
    is_active: bool
    rating: float
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Schema for book list with pagination
class BookList(BaseModel):
    total: int
    page: int
    page_size: int
    books: list[Book]
