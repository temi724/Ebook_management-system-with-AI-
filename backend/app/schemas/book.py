from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime


class BookBase(BaseModel):
    isbn: Optional[str] = None
    title: str
    author: str
    publisher: Optional[str] = None
    publication_year: Optional[int] = None
    category: Optional[str] = None
    description: Optional[str] = None
    total_copies: int = 1
    language: str = "English"
    pages: Optional[int] = None
    tags: Optional[str] = None
    
    @validator('publication_year')
    def validate_year(cls, v):
        if v and (v < 1000 or v > datetime.now().year):
            raise ValueError('Invalid publication year')
        return v


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    isbn: Optional[str] = None
    title: Optional[str] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    publication_year: Optional[int] = None
    category: Optional[str] = None
    description: Optional[str] = None
    total_copies: Optional[int] = None
    available_copies: Optional[int] = None
    is_active: Optional[bool] = None
    language: Optional[str] = None
    pages: Optional[int] = None
    tags: Optional[str] = None


class BookInDB(BookBase):
    id: int
    cover_image: Optional[str] = None
    pdf_file: Optional[str] = None
    available_copies: int
    is_active: bool
    rating: float
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class Book(BookInDB):
    pass


class BookList(BaseModel):
    total: int
    page: int
    page_size: int
    books: list[Book]
