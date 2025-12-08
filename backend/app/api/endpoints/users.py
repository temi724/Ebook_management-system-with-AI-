from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.schemas.user import User, UserUpdate
from app.services.user_service import UserService
from app.api.dependencies.auth import get_current_user, get_current_admin
from app.models.user import UserRole

router = APIRouter()


@router.get("/me", response_model=User)
def get_current_user_profile(
    current_user = Depends(get_current_user)
):
    """Get current user profile"""
    return current_user


@router.put("/me", response_model=User)
def update_current_user(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update current user profile"""
    # Prevent role escalation
    if user_in.role and user_in.role != current_user.role:
        user_in.role = current_user.role
    
    updated_user = UserService.update(db, current_user, user_in)
    return updated_user


@router.get("/", response_model=list[User])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """Get all users (Admin only)"""
    users = UserService.get_all(db, skip, limit)
    return users


@router.get("/{user_id}", response_model=User)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """Get specific user (Admin only)"""
    user = UserService.get_by_id(db, user_id)
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/{user_id}", response_model=User)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """Update user (Admin only)"""
    user = UserService.get_by_id(db, user_id)
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    updated_user = UserService.update(db, user, user_in)
    return updated_user
