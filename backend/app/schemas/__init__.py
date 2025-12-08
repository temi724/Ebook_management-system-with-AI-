from app.schemas.user import (
    User,
    UserCreate,
    UserUpdate,
    UserInDB,
    Token,
    TokenPayload,
    LoginRequest
)
from app.schemas.book import Book, BookCreate, BookUpdate, BookInDB, BookList
from app.schemas.loan import Loan, LoanCreate, LoanUpdate, LoanWithDetails, LoanList
from app.schemas.recommendation import (
    RecommendationRequest,
    BookRecommendation,
    RecommendationResponse
)

__all__ = [
    "User",
    "UserCreate",
    "UserUpdate",
    "UserInDB",
    "Token",
    "TokenPayload",
    "LoginRequest",
    "Book",
    "BookCreate",
    "BookUpdate",
    "BookInDB",
    "BookList",
    "Loan",
    "LoanCreate",
    "LoanUpdate",
    "LoanWithDetails",
    "LoanList",
    "RecommendationRequest",
    "BookRecommendation",
    "RecommendationResponse"
]
