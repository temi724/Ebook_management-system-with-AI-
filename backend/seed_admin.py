"""
Seed script to create initial admin user
"""
from app.db.base import SessionLocal
from app.services.user_service import UserService
from app.schemas.user import UserCreate
from app.models.user import UserRole
# Import all models to ensure relationships are properly set up
from app.models import user, book, loan, reading_history

def seed_admin():
    """Create admin user if it doesn't exist"""
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        existing_admin = UserService.get_by_username(db, "admin")
        
        if existing_admin:
            print("✓ Admin user already exists")
            return
        
        # Create admin user
        admin_data = UserCreate(
            email="admin@elibrary.com",
            username="admin",
            full_name="Admin User",
            password="admin123",
            role=UserRole.ADMIN
        )
        
        admin_user = UserService.create(db, admin_data)
        print(f"✓ Admin user created successfully!")
        print(f"  Username: {admin_user.username}")
        print(f"  Email: {admin_user.email}")
        print(f"  Role: {admin_user.role}")
        
    except Exception as e:
        print(f"✗ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Seeding database with admin user...")
    seed_admin()
    print("\nDone!")

