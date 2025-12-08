# E-Library Management System Backend

AI-powered e-library management system built with FastAPI, MySQL, and Ollama.

## Features

- 🔐 **Secure Authentication**: JWT-based authentication with role-based access control
- 📚 **Book Management**: Comprehensive CRUD operations for books
- 🔄 **Loan Tracking**: Automated loan management with due date tracking and renewals
- 🤖 **AI Recommendations**: Intelligent book suggestions using RAG pipeline with Ollama
- 📊 **Reading History**: Track user reading patterns for personalized recommendations
- 🔍 **Advanced Search**: Full-text search across books with filters

## Tech Stack

- **Framework**: FastAPI 0.104+
- **Database**: MySQL with SQLAlchemy ORM
- **Authentication**: JWT (python-jose)
- **AI/ML**: Ollama, LangChain, ChromaDB, Sentence Transformers
- **Validation**: Pydantic V2

## Setup

### Prerequisites

- Python 3.10+
- MySQL 8.0+
- Ollama installed and running

### Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create MySQL database:
```sql
CREATE DATABASE elibrary_db;
```

4. Copy `.env.example` to `.env` and configure:
```bash
cp ../.env.example .env
```

5. Update `.env` with your settings:
```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/elibrary_db
SECRET_KEY=your-super-secret-key-here
```

6. Pull Ollama model:
```bash
ollama pull llama2
```

### Run the Application

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at: http://localhost:8000

API Documentation: http://localhost:8000/docs

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get token
- `GET /api/v1/auth/me` - Get current user

### Books
- `GET /api/v1/books` - List books with search/filters
- `GET /api/v1/books/{id}` - Get book details
- `POST /api/v1/books` - Create book (Librarian/Admin)
- `PUT /api/v1/books/{id}` - Update book (Librarian/Admin)
- `DELETE /api/v1/books/{id}` - Delete book (Librarian/Admin)

### Loans
- `POST /api/v1/loans` - Borrow a book
- `GET /api/v1/loans/my-loans` - Get user's loans
- `GET /api/v1/loans` - Get all loans (Librarian/Admin)
- `POST /api/v1/loans/{id}/return` - Return a book
- `POST /api/v1/loans/{id}/renew` - Renew a loan

### Recommendations
- `POST /api/v1/recommendations/query` - Get AI recommendations by query
- `GET /api/v1/recommendations/personalized` - Get personalized recommendations

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update current user
- `GET /api/v1/users` - Get all users (Admin)

## User Roles

- **Admin**: Full system access
- **Librarian**: Book and loan management
- **Faculty**: Regular user with extended privileges
- **Student**: Basic user access

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── dependencies/    # Auth dependencies
│   │   └── endpoints/       # API routes
│   ├── core/               # Config & security
│   ├── db/                 # Database setup
│   ├── models/             # SQLAlchemy models
│   ├── schemas/            # Pydantic schemas
│   ├── services/           # Business logic
│   └── utils/              # Utilities
├── tests/                  # Tests
├── main.py                 # Application entry
└── requirements.txt        # Dependencies
```
