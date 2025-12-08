from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.schemas.book import Book, BookCreate, BookUpdate, BookList
from app.services.book_service import BookService
from app.api.dependencies.auth import get_current_librarian, get_current_user
from app.core.config import settings
import shutil
import os
from pathlib import Path

router = APIRouter()


@router.get("/", response_model=BookList)
def get_books(
    skip: int = 0,
    limit: int = 20,
    query: Optional[str] = None,
    category: Optional[str] = None,
    author: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all books with search and filters"""
    books, total = BookService.search(
        db, query=query, category=category, author=author, skip=skip, limit=limit
    )
    
    page = (skip // limit) + 1 if limit > 0 else 1
    
    return BookList(
        total=total,
        page=page,
        page_size=limit,
        books=books
    )


@router.get("/{book_id}", response_model=Book)
def get_book(
    book_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific book by ID"""
    book = BookService.get_by_id(db, book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    return book


@router.post("/", response_model=Book, status_code=status.HTTP_201_CREATED)
def create_book(
    book_in: BookCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_librarian)
):
    """Create a new book (Librarian/Admin only)"""
    # Check if ISBN already exists
    if book_in.isbn:
        existing = BookService.get_by_isbn(db, book_in.isbn)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Book with this ISBN already exists"
            )
    
    book = BookService.create(db, book_in)
    return book


@router.put("/{book_id}", response_model=Book)
def update_book(
    book_id: int,
    book_in: BookUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_librarian)
):
    """Update a book (Librarian/Admin only)"""
    book = BookService.get_by_id(db, book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    updated_book = BookService.update(db, book, book_in)
    return updated_book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_librarian)
):
    """Delete a book (Librarian/Admin only)"""
    success = BookService.delete(db, book_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )


@router.post("/{book_id}/upload-cover")
def upload_cover_image(
    book_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_librarian)
):
    """Upload book cover image"""
    book = BookService.get_by_id(db, book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Create upload directory
    upload_dir = Path(settings.UPLOAD_DIR) / "covers"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_extension = file.filename.split(".")[-1]
    filename = f"book_{book_id}_cover.{file_extension}"
    file_path = upload_dir / filename
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update book
    book.cover_image = str(file_path)
    db.commit()
    
    return {"message": "Cover uploaded successfully", "path": str(file_path)}


@router.post("/{book_id}/upload-pdf")
def upload_pdf(
    book_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_librarian)
):
    """Upload book PDF file"""
    book = BookService.get_by_id(db, book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Validate file type
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a PDF"
        )
    
    # Create upload directory
    upload_dir = Path(settings.UPLOAD_DIR) / "pdfs"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    filename = f"book_{book_id}.pdf"
    file_path = upload_dir / filename
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update book
    book.pdf_file = str(file_path)
    db.commit()
    
    return {"message": "PDF uploaded successfully", "path": str(file_path)}
