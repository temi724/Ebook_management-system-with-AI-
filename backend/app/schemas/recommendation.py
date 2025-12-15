from pydantic import BaseModel
from typing import List, Optional


# Schema for a single book recommendation
class BookRecommendation(BaseModel):
    book_id: int
    title: str
    author: str
    category: str
    similarity_score: float
    reason: str


# Schema for recommendation request
class RecommendationRequest(BaseModel):
    query: str
    limit: int = 5


# Schema for recommendation response
class RecommendationResponse(BaseModel):
    recommendations: List[BookRecommendation]
    query_understood: str
    total_results: int
