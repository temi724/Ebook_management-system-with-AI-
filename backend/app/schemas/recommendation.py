from pydantic import BaseModel
from typing import List, Optional


class RecommendationRequest(BaseModel):
    user_id: Optional[int] = None
    query: Optional[str] = None
    category: Optional[str] = None
    limit: int = 5


class BookRecommendation(BaseModel):
    book_id: int
    title: str
    author: str
    category: str
    similarity_score: float
    reason: str


class RecommendationResponse(BaseModel):
    recommendations: List[BookRecommendation]
    query_understood: str
    total_results: int
