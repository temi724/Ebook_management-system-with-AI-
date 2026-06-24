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

- **Python 3.11** (required — see note below)
- Node.js 18+
- MySQL 8.0+ (e.g. via XAMPP)
- Ollama (optional — for full AI text generation)

> ⚠️ **Use Python 3.11.** The pinned dependencies (numpy, pydantic-core, etc.) do **not** have prebuilt wheels for Python 3.13 / 3.14, so newer versions fail to install (they try to compile from source and error out). Python 3.10–3.12 work; 3.11 is the validated version.

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create the virtual environment with Python 3.11**:
```bash
# macOS / Linux
python3.11 -m venv venv
source venv/bin/activate

# Windows
py -3.11 -m venv venv
venv\Scripts\activate
```
Confirm the venv is on the right version — this **must** print `Python 3.11.x`:
```bash
python --version
```

3. **Install dependencies**:
```bash
pip install --upgrade pip
pip install -r requirements.txt
# Fix: the pinned sentence-transformers is incompatible with the modern
# transformers/huggingface_hub it pulls in — upgrade to a working combination:
pip install -U sentence-transformers huggingface_hub
```

4. **Create the MySQL database** (XAMPP defaults to port **3307** on macOS, **3306** on Windows):
```bash
mysql -u root -h 127.0.0.1 -P 3307 -e "CREATE DATABASE IF NOT EXISTS elibrary_db;"
```

5. **Configure environment** — edit `backend/.env` so `DATABASE_URL` matches your MySQL host/port/password, e.g.:
```env
DATABASE_URL=mysql+pymysql://root@127.0.0.1:3307/elibrary_db
```

6. **Seed the initial admin user** (creates `admin` / `admin123`):
```bash
python seed_admin.py
```

7. **(Optional) Install and run Ollama** for AI-generated text:
```bash
# Install Ollama from https://ollama.com
ollama pull llama2
```

8. **Run the backend** — launch it through the venv's interpreter:
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> ⚠️ Always run the backend from the activated venv (or via `venv/bin/python -m uvicorn …`). Running a bare `uvicorn` can pick up a different system/Anaconda Python where the AI dependencies aren't installed — in that case the embedding model fails to load and AI recommendations silently return nothing.

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

### Running the Backend with Docker

A `Dockerfile` (Python 3.11, with the dependency fixes baked in) is provided in `backend/`.

1. **Build the image** (from the repo root):
```bash
docker build -t elibrary-backend ./backend
```
> The image is large (~2–3 GB) — it includes PyTorch and the AI stack.

2. **Run it**, pointing at your host's MySQL and Ollama (`host.docker.internal` on Docker Desktop; on Linux add `--add-host=host.docker.internal:host-gateway`):
```bash
docker run -d --name elibrary-backend -p 8000:8000 \
  -e DATABASE_URL="mysql+pymysql://root@host.docker.internal:3307/elibrary_db" \
  -e SECRET_KEY="change-me-to-a-random-string" \
  -e OLLAMA_BASE_URL="http://host.docker.internal:11434" \
  -e BACKEND_CORS_ORIGINS="http://localhost:5173,http://localhost:5174" \
  -v elibrary_hf_cache:/app/.cache/huggingface \
  elibrary-backend
```

3. **Seed the admin user** inside the container:
```bash
docker exec -it elibrary-backend python seed_admin.py
```
> Connecting a container to host MySQL can require granting the `root` user access from non-localhost hosts. For a fully self-contained setup, a `docker-compose` file (backend + MySQL) is the cleaner option.

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
source venv/bin/activate            # Windows: venv\Scripts\activate
python -m uvicorn main:app --reload
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
# XAMPP MySQL defaults to port 3307 on macOS, 3306 on Windows
DATABASE_URL=mysql+pymysql://root@127.0.0.1:3307/elibrary_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=http://localhost:5173,http://localhost:5174
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 🛠️ Troubleshooting

| Symptom | Cause & Fix |
|---|---|
| `pip install` tries to **compile numpy/pydantic-core** and fails (`Unknown compiler`, `metadata-generation-failed`) | The venv is on Python 3.13/3.14, which has no prebuilt wheels for these pins. **Recreate the venv with Python 3.11** (`py -3.11 -m venv venv` / `python3.11 -m venv venv`) and reinstall. |
| AI search returns nothing; logs show `Embeddings not available` / `'NoneType' object has no attribute 'similarity_search_with_score'` | The backend is running under the **wrong Python** (e.g. system/Anaconda) where the AI deps aren't installed. Start it from the venv: `venv/bin/python -m uvicorn main:app …`. |
| `ImportError: cannot import name 'cached_download' from 'huggingface_hub'` | Old `sentence-transformers` vs. modern `huggingface_hub`. Run `pip install -U sentence-transformers huggingface_hub`. |
| AI search shows **all books** for an unrelated query, or **no books** for a newly added one | Results are filtered by a relevance threshold (`RELEVANCE_THRESHOLD` in `recommendation_service.py`); the vector index auto-refreshes when books are added/edited/deleted. |
| Backend 404 on `/api/v1/books` etc. | Trailing-slash handling — ensure `redirect_slashes=True` in `main.py` (the default). |
| Browser **CORS** error / preflight blocked | Add your frontend origin to `BACKEND_CORS_ORIGINS` in `.env` (Vite uses 5174 if 5173 is taken). |
| First AI search is slow | The ~80 MB embedding model downloads once, then is cached. |

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
