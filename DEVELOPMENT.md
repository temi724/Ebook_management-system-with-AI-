# 🎯 E-Library System - Development Guide

## 📋 Project Summary

A comprehensive AI-powered e-library management system built with:
- **Backend**: FastAPI + MySQL + Ollama AI
- **Frontend**: React 18 + Vite + Tailwind CSS 3 + Zustand
- **Features**: Book management, loan tracking, AI recommendations

## 🏗️ Architecture Overview

### Backend Structure (Clean Architecture)
```
backend/app/
├── api/
│   ├── dependencies/     # Reusable dependencies (auth)
│   ├── endpoints/        # API routes
│   └── api.py           # Router aggregation
├── core/                # App configuration
├── db/                  # Database setup
├── models/              # SQLAlchemy models
├── schemas/             # Pydantic schemas
└── services/            # Business logic layer
```

### Frontend Structure
```
frontend/src/
├── components/
│   ├── common/          # Reusable UI components
│   └── layout/          # Layout components
├── pages/               # Page components
├── stores/              # Zustand state management
├── services/            # API integration
└── App.jsx              # Main app with routing
```

## 🔑 Key Files

### Backend
- `main.py` - FastAPI application entry point
- `app/core/config.py` - Configuration management
- `app/core/security.py` - Authentication utilities
- `app/api/api.py` - API router
- `app/services/*_service.py` - Business logic
- `.env` - Environment variables

### Frontend
- `src/App.jsx` - Main application with React Router
- `src/index.css` - Tailwind configuration
- `src/stores/*Store.js` - Zustand state stores
- `src/services/*.js` - API service layer
- `tailwind.config.js` - Tailwind customization

## 🚀 Quick Start Commands

### Development
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# Or use the start script
./start.sh
```

### Production Build
```bash
# Frontend
cd frontend
npm run build
npm run preview
```

## 📊 Database Schema

### Users Table
- id, email, username, full_name, hashed_password
- role (admin, librarian, faculty, student)
- is_active, created_at, updated_at

### Books Table
- id, isbn, title, author, publisher, publication_year
- category, description, cover_image, pdf_file
- total_copies, available_copies, rating, tags
- is_active, created_at, updated_at

### Loans Table
- id, user_id (FK), book_id (FK)
- loan_date, due_date, return_date
- status (active, returned, overdue, renewed)
- renewal_count, notes

### Reading History Table
- id, user_id (FK), book_id (FK)
- read_date, rating, reading_time_minutes

## 🔐 Authentication Flow

1. User registers/logs in → receives JWT token
2. Token stored in Zustand store (persisted)
3. Axios interceptor adds token to requests
4. Backend validates JWT and returns user data
5. Protected routes check authentication state

## 🎨 Design System

### Colors (Tailwind)
- Primary: Blue (#0ea5e9)
- Secondary: Red (#ef4444)
- Accent: Purple (#d946ef)
- Dark: Slate grays

### Components
- Glass cards with backdrop blur
- Gradient buttons with hover effects
- Animated page transitions
- Custom scrollbars
- Badge system for status

## 🤖 AI Recommendations (RAG Pipeline)

1. **Vector Store**: ChromaDB with sentence transformers
2. **Embeddings**: HuggingFace all-MiniLM-L6-v2
3. **LLM**: Ollama with Llama2 model
4. **Process**:
   - Book metadata embedded into vector store
   - User query → similarity search
   - Top results + context → Ollama
   - Intelligent recommendations returned

## 📝 API Documentation

Access Swagger UI at: `http://localhost:8000/docs`

### Key Endpoints
- **Auth**: `/api/v1/auth/register`, `/login`
- **Books**: `/api/v1/books` (CRUD, search)
- **Loans**: `/api/v1/loans` (borrow, return, renew)
- **Recommendations**: `/api/v1/recommendations/query`
- **Users**: `/api/v1/users/me` (profile)

## 🧪 Testing

### Manual Testing
1. Register a new user
2. Create books (as librarian/admin)
3. Borrow books
4. Get AI recommendations
5. Return books

### Test Users (Create these first)
```python
# Admin
{
  "email": "admin@library.com",
  "username": "admin",
  "full_name": "System Administrator",
  "password": "admin123",
  "role": "admin"
}

# Student
{
  "email": "student@library.com",
  "username": "student",
  "full_name": "John Student",
  "password": "student123",
  "role": "student"
}
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/elibrary_db
SECRET_KEY=your-secret-key
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

**Frontend (.env)**:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
# Create database
mysql -u root -p
CREATE DATABASE elibrary_db;
# Update .env with correct credentials
```

**2. Ollama Not Running**
```bash
# Start Ollama
ollama serve
ollama pull llama2
```

**3. CORS Errors**
- Check `BACKEND_CORS_ORIGINS` in .env
- Ensure frontend URL is whitelisted

**4. Package Installation Issues**
```bash
# Backend
pip install --upgrade pip
pip install -r requirements.txt

# Frontend
rm -rf node_modules package-lock.json
npm install
```

## 📈 Future Enhancements

1. **Loans Page**: Complete UI for managing loans
2. **Book Details**: Modal/page with full book information
3. **Advanced Search**: Filters by year, language, rating
4. **Notifications**: Email/push for due dates
5. **Analytics**: Reading statistics and trends
6. **Mobile App**: React Native version
7. **PDF Viewer**: Inline book reading
8. **Reviews**: User ratings and comments

## 🎓 Learning Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Ollama](https://ollama.ai/)

## 📞 Support

For issues or questions:
1. Check the README files
2. Review API documentation
3. Inspect browser console (frontend)
4. Check backend logs (terminal)

---

**Built with ❤️ for university library management**
