from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.services.recommendation_service import get_recommendation_service
from app.api.dependencies.auth import get_current_user
from typing import Optional

router = APIRouter()


@router.post("/query", response_model=RecommendationResponse)
def get_recommendations_by_query(
    request: RecommendationRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get AI-powered book recommendations based on query"""
    if not request.query:
        raise HTTPException(
            status_code=400,
            detail="Query is required"
        )
    
    try:
        return get_recommendation_service().get_recommendations_by_query(
            db, request.query, request.limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail="Recommendation service is temporarily unavailable. Please try again later."
        )


@router.get("/personalized", response_model=RecommendationResponse)
def get_personalized_recommendations(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get personalized recommendations based on reading history"""
    try:
        return get_recommendation_service().get_personalized_recommendations(
            db, current_user.id, limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail="Recommendation service is temporarily unavailable. Please try again later."
        )


@router.post("/initialize-vector-store")
def initialize_vector_store(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Initialize or refresh the vector store with current books"""
    try:
        get_recommendation_service().initialize_vector_store(db)
        return {"message": "Vector store initialized successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize vector store: {str(e)}"
        )
