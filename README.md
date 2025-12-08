# 📚 E-Library Management System with AI

A comprehensive, AI-powered e-library management system that provides efficient book management, automated loan tracking, and intelligent book recommendations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)

## 🌟 Features

### Core Functionality
- ✅ **Secure Authentication**: JWT-based authentication with role-based access control (Admin, Librarian, Faculty, Student)
- 📖 **Book Management**: Comprehensive CRUD operations for books with search and filtering
- 🔄 **Automated Loan Tracking**: Smart loan management with due date tracking, renewals, and overdue notifications
- 🤖 **AI-Powered Recommendations**: Intelligent book suggestions using RAG pipeline with Ollama models
- 📊 **Reading History**: Track user reading patterns for personalized recommendations
- 🔍 **Advanced Search**: Full-text search across books with category and author filters
- 📱 **Responsive Design**: Modern, beautiful UI that works on all devices

### Technical Features
- 🏗️ **Clean Architecture**: Well-organized backend and frontend structure
- 🎨 **Modern UI**: Glassmorphism design with Tailwind CSS 3
- ⚡ **High Performance**: Optimized queries and efficient state management
- 🔐 **Security**: Password hashing, JWT tokens, CORS configuration
- 📝 **API Documentation**: Auto-generated with FastAPI Swagger UI

## 🏛️ Architecture

### Backend Stack
- **Framework**: FastAPI
- **Database**: MySQL with SQLAlchemy ORM
- **Authentication**: JWT (python-jose)
- **AI/ML**: Ollama, LangChain, ChromaDB, Sentence Transformers
- **Validation**: Pydantic V2

### Frontend Stack
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS 3
- **State Management**: Zustand
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0+
- Ollama (for AI recommendations)

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Create MySQL database**:
```sql
CREATE DATABASE elibrary_db;
```

5. **Configure environment**:
```bash
cp ../.env.example .env
# Edit .env with your database credentials and secret key
```

6. **Install and run Ollama**:
```bash
# Install Ollama from https://ollama.ai
ollama pull llama2
```

7. **Run the backend**:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000  
API Documentation: http://localhost:8000/docs

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
# .env file already created with:
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

4. **Run the frontend**:
```bash
npm run dev
```

Frontend will be available at: http://localhost:5173

## 📁 Project Structure

```
Ebook_management-system-with-AI-/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dependencies/    # Auth dependencies
│   │   │   └── endpoints/       # API routes
│   │   ├── core/               # Config & security
│   │   ├── db/                 # Database setup
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/           # Business logic
│   │   └── utils/              # Utilities
│   ├── main.py                 # FastAPI app
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Reusable components
│   │   │   ├── layout/         # Layout components
│   │   │   ├── books/          # Book components
│   │   │   ├── loans/          # Loan components
│   │   │   └── recommendations/# AI components
│   │   ├── pages/              # Page components
│   │   ├── stores/             # Zustand stores
│   │   ├── services/           # API services
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## 🎯 User Roles

1. **Admin**: Full system access, user management
2. **Librarian**: Book and loan management
3. **Faculty**: Extended borrowing privileges
4. **Student**: Basic borrowing access

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get token
- `GET /api/v1/auth/me` - Get current user

### Books
- `GET /api/v1/books` - List books (with search/filters)
- `GET /api/v1/books/{id}` - Get book details
- `POST /api/v1/books` - Create book (Librarian/Admin)
- `PUT /api/v1/books/{id}` - Update book (Librarian/Admin)
- `DELETE /api/v1/books/{id}` - Delete book (Librarian/Admin)

### Loans
- `POST /api/v1/loans` - Borrow a book
- `GET /api/v1/loans/my-loans` - Get user's loans
- `POST /api/v1/loans/{id}/return` - Return a book
- `POST /api/v1/loans/{id}/renew` - Renew a loan

### AI Recommendations
- `POST /api/v1/recommendations/query` - Get recommendations by query
- `GET /api/v1/recommendations/personalized` - Get personalized recommendations

## 🎨 Design Theme

The UI is inspired by modern university library systems with:
- **Color Palette**: Blues (primary), reds (secondary), purples (accent)
- **Design Style**: Glassmorphism with gradient accents
- **Typography**: Inter for body, Poppins for headings
- **Animations**: Smooth transitions and micro-interactions

## 🔧 Development

### Backend Development
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Building for Production

**Backend**:
```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend**:
```bash
npm run build
npm run preview
```

## 🧪 Testing

Create sample data by registering users and adding books through the API documentation interface at `http://localhost:8000/docs`.

**Demo Credentials** (create these users first):
- Admin: `admin / admin123`
- Student: `student / student123`

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/elibrary_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

Built with ❤️ for modern library management

## 🙏 Acknowledgments

- FastAPI for the amazing web framework
- Ollama for local AI model inference
- Tailwind CSS for the beautiful styling system
- React team for the excellent frontend framework

---

**Note**: Make sure to change the `SECRET_KEY` in production and use secure passwords for the database.
