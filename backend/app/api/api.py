from fastapi import APIRouter
from app.api.endpoints import auth, books, loans, recommendations, stats, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(books.router, prefix="/books", tags=["Books"])
api_router.include_router(loans.router, prefix="/loans", tags=["Loans"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
api_router.include_router(stats.router, prefix="/stats", tags=["Statistics"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
