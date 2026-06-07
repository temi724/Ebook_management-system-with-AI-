# CHAPTER THREE: DESIGN AND METHODOLOGY

## 3.1 Introduction

This chapter explains the design and methodology used in developing the AI-powered e-library system for Crescent University. It presents the processes followed from the planning stage to the final implementation of the system. The chapter discusses the development approach, the system architecture, the hardware and software requirements, and the functional and non-functional requirements that guided the system design. It also describes the proposed solution, the relationships between the main system variables, and the ethical considerations taken into account during development.

The aim of this chapter is to demonstrate how the system was carefully planned and structured to meet the needs of students, librarians, and administrators. It provides a detailed explanation of how the backend, frontend, database, and AI components work together to deliver secure book management services and intelligent recommendations. By presenting each step of the design and development process, this chapter ensures that the system is transparent, well-documented, and aligned with the overall objectives of the project.

---

## 3.2 Development Approach

This study adopts an **iterative development approach**, which allows the system to be designed, built, tested, and refined in multiple cycles. This method is suitable for software projects that require continuous improvement, integration of AI components, and frequent validation of system features. The iterative approach also ensures that user needs, technical requirements, and system performance are considered throughout the development process.

The development process used in this project is divided into the following stages:

### 3.2.1 Requirement Analysis

At the initial stage, the functional and non-functional requirements of the e-library system were identified. This included understanding the needs of different user roles, such as administrators, librarians, and students. The analysis focused on the features the system must provide—including user management, book management, secure authentication, and AI-driven recommendations—and the standards it must meet in terms of security, performance, scalability, and usability.

### 3.2.2 System Design

The design phase involved creating the system architecture and defining how the backend, frontend, database, and AI components work together. The database schema was designed to support efficient data storage and retrieval, while the API structure was planned to ensure smooth communication between the frontend and backend. The AI pipeline, including RAG (Retrieval-Augmented Generation) integration with the Llama 2 language model, was also mapped out during this stage. Interface sketches and layout structures were developed to guide frontend implementation.

### 3.2.3 Backend Development (FastAPI)

In this stage, the backend of the system was implemented using FastAPI. Key functionalities developed include:
- User authentication using JWT
- Role-based access control
- CRUD operations for books and users
- Search capabilities
- Loan and reservation management
- API endpoints for interacting with the frontend

The backend was designed to be modular, secure, and scalable.

### 3.2.4 AI Pipeline Development

This phase involved integrating the Llama 2 model via Ollama and constructing the RAG pipeline. The pipeline retrieves relevant book information from the database and uses AI to generate context-aware recommendations based on user queries or research topics. The goal of this stage was to ensure that the AI component delivers accurate, relevant, and intelligent suggestions to support academic research.

### 3.2.5 Frontend Development (React JS)

Using React JS, the user interface was developed to provide a modern, responsive, and intuitive experience. Frontend features include:
- Login and signup pages
- User dashboards
- Book catalog views
- Search and filtering options
- Dedicated interface for AI-powered recommendations

The frontend interacts with the backend through RESTful APIs to ensure smooth data exchange.

### 3.2.6 Database Implementation (MySQL)

The database was implemented using MySQL, with tables designed for users, books, authors, categories, loans, and reservations. Proper indexing was applied to improve query performance, particularly during book searches and RAG data retrieval. Relationships between tables were established to maintain data integrity and support efficient transaction processing.

### 3.2.7 Testing and Validation

Multiple tests were conducted to ensure the system functions as expected. These include:
- **Functional testing** for each feature
- **Integration testing** for frontend–backend communication
- **Performance testing** for search and recommendation requests
- **User acceptance testing** to verify usability

Errors and inconsistencies discovered during testing were corrected in subsequent development iterations.

### 3.2.8 Deployment

The final stage involved deploying the system and ensuring that all components—backend, frontend, and database—work correctly in the production environment. Deployment also included configuring server connections, environment variables, and security settings to guarantee system stability and accessibility.

---

## 3.3 System Architecture

The architecture of the proposed AI-powered e-library system is designed using a modern, modular, and scalable structure. The system is divided into four major tiers: the **frontend**, the **backend**, the **database**, and the **AI recommendation pipeline**. Each tier performs a specific role, and together they form a complete, efficient, and intelligent digital library platform suitable for academic use.

### 3.3.1 Backend Architecture (FastAPI Layer)

The backend is developed using **FastAPI**, a high-performance Python framework. It serves as the central logic layer where all server-side processes are executed. The backend structure follows clean architecture practices to improve readability, maintenance, and scalability.

It is organized into the following modules:

#### I. API Endpoints
These handle incoming requests from the frontend and include routes for:
- Authentication
- Book management
- Loan management
- AI recommendation queries

Each endpoint communicates with services and returns standardized JSON responses.

#### II. Models
The backend uses **SQLAlchemy ORM** models to represent database tables such as:
- Users
- Books
- Loans
- Reading history entries

These models ensure consistent mapping between Python objects and database records.

#### III. Schemas
**Pydantic V2** schemas are used for input validation and response formatting. They help guarantee that only valid data passes through the system.

#### IV. Services
All core business logic is stored inside the services module. This includes:
- Processing book loans and returns
- Checking overdue books
- Generating user-specific recommendations
- Applying borrowing rules based on user roles

#### V. Authentication and Security
The backend implements:
- **JWT (JSON Web Tokens)** for secure login sessions
- **Password hashing** for safe credential storage
- **Role-based access control** (Admin, Librarian, Faculty, Student)
- **CORS configuration** for frontend access

This ensures that all sensitive operations—such as updating books or approving loans—are protected.

### 3.3.2 Frontend Architecture (React Layer)

The frontend is developed using **React (Vite)** to provide a fast, interactive, and visually appealing user interface. The interface follows a modern glassmorphism design, making it clean, professional, and responsive across mobile and desktop devices.

The structure includes:

#### I. Components
Reusable UI elements such as:
- Navigation bars
- Form elements
- Book cards
- Notification alerts
- AI suggestion widgets

These components improve modularity and allow easy updates.

#### II. Pages
Each major section of the platform has a dedicated page, including:
- Login and registration
- Dashboard views
- Book listings
- Borrowing and loan history
- AI recommendation interface

#### III. State Management
The system uses **Zustand**, a lightweight state management library, to handle:
- User authentication state
- Book data
- Loan records
- Loading and UI states

This ensures smooth navigation and reduces data inconsistencies.

#### IV. Styling
Styling is implemented using **Tailwind CSS**, which provides:
- Utility-based classes
- Responsive layouts
- Clean spacing and alignment
- Consistent typography

This makes the frontend sleek, modern, and easy to maintain.

### 3.3.3 Database Architecture (MySQL)

The backend interacts with a **MySQL 8.0** database for structured data storage. SQLAlchemy ORM is used for communication between the backend and the database.

The key tables include:

- **Users**: Stores login credentials, roles, and identity information
- **Books**: Stores metadata such as title, author, category, and ISBN
- **Loans**: Tracks borrowing activities, due dates, and return status
- **Reading History**: Stores user interactions for personalized recommendations

MySQL was chosen because it is reliable, scalable, easy to deploy, and widely supported in production environments.

### 3.3.4 AI Recommendation Pipeline (RAG + Ollama)

One of the core features of the system is its ability to provide intelligent, personalized book recommendations. This is achieved through a **Retrieval-Augmented Generation (RAG)** pipeline implemented using the following technologies:

#### I. Ollama + Llama 2 Model
Ollama is a local AI inference engine used to run the Llama 2 language model. Llama 2 is an open-source large language model (LLM) developed by Meta AI. The system uses Ollama to provide quick and secure natural language processing without relying on external servers, ensuring data privacy and offline capability.

#### II. LangChain
LangChain is used to:
- Connect the LLM with the database
- Structure the recommendation prompts
- Manage the flow of information between components

#### III. ChromaDB
ChromaDB stores document embeddings for:
- Books
- Categories
- Summaries
- Search queries

This helps the system retrieve relevant books when a user searches or requests recommendations.

#### IV. Sentence Transformers
Used to generate vectors (embeddings) for book descriptions and user search queries. These embeddings enable similarity matching and intelligent ranking.

#### V. Recommendation Types
The system supports:
- **Query-based recommendations** (based on user search text)
- **Personalized recommendations** (based on reading history)

The pipeline ensures recommendations remain accurate, fast, and privacy-preserving.

### 3.3.5 Interaction Between System Components

The entire architecture works as follows:

1. **User interacts with frontend**  
   The user performs actions such as login, search for books, or views the dashboard.

2. **Frontend sends request to backend**  
   Uses Axios to call FastAPI endpoints.

3. **Backend processes the request**  
   - Validates input using Pydantic
   - Applies business rules through the service layer
   - Interacts with the database through SQLAlchemy

4. **AI pipeline executes when needed**  
   - Retrieves relevant documents
   - Generates responses through Ollama
   - Sends recommendation results back to the backend

5. **Backend sends structured JSON back to frontend**  
   Frontend displays results through React components.

This flow ensures efficiency, security, and a smooth user experience.

---

## 3.4 Hardware and Software Requirements

This section outlines the essential hardware and software resources required for the successful development, deployment, and operation of the AI-powered e-library management system. The requirements cover both the development environment used during implementation and the production environment where the system will run after deployment. Ensuring that these requirements are met helps guarantee smooth performance, system stability, and efficient access for all users.

### 3.4.1 Hardware Requirements

#### I. Development Environment Hardware
The developers require systems with sufficient processing power to run FastAPI, MySQL, React, and the AI models locally during development. Minimum hardware specifications include:

- **Processor**: Intel Core i5 (8th generation) or AMD Ryzen 5 equivalent
- **RAM**: At least 8 GB (16 GB recommended for running AI models and multiple services)
- **Storage**: Minimum 256 GB SSD
- **Graphics**: Integrated graphics is sufficient, since the project does not involve GPU-based training
- **Network**: Stable broadband internet (for package installations and documentation access)

These resources ensure fast compilation, smooth local testing, and efficient handling of the RAG pipeline components.

#### II. Server / Deployment Hardware
If the system is to be hosted on a physical or cloud server, additional resources are required:

- **Processor**: Quad-core CPU or higher
- **RAM**: 16 GB or more (AI inference benefits from additional memory)
- **Storage**: 512 GB SSD or higher for storing:
  - Database records
  - Book embeddings
  - User activity logs
- **Backup Storage**: External or cloud-based backup option
- **Availability**: 24/7 internet connectivity with stable uptime

For cloud deployment (e.g., DigitalOcean, AWS, Azure), a virtual machine with at least:
- 4 vCPUs
- 16 GB RAM

is recommended to support AI inference and multiple concurrent users.

### 3.4.2 Software Requirements

#### I. Backend Software (FastAPI & Tools)
The backend utilizes a Python-based environment with additional libraries and frameworks. Required software includes:

- Python 3.10+
- FastAPI Framework
- SQLAlchemy ORM
- Pydantic V2 (for validation)
- Python-Jose (for JWT authentication)
- Uvicorn (for running the API server)
- MySQL Connector / PyMySQL
- LangChain (for AI workflow)
- ChromaDB (for vector storage)
- Sentence Transformers (for embeddings)

These tools allow the backend to process requests, manage users, execute book operations, and interface with the AI recommendation engine.

#### II. AI/ML Software Requirements
Since the e-library integrates an AI system for intelligent recommendations, the following tools are required:

- Ollama (local AI inference engine)
- Llama 2 language model
- Sentence Transformers (specifically all-MiniLM-L6-v2 for embedding generation)
- ChromaDB local vector store

Ollama enables secure, offline model inference without relying on external cloud AI services, making it suitable for university and academic environments.

#### III. Frontend Software (React Environment)
The frontend requires modern JavaScript tools for a responsive and interactive user interface:

- Node.js 18+
- React (Version 18 with Vite)
- Tailwind CSS 3
- Axios (for API communication)
- Zustand (for state management)
- React Router DOM (for navigation)
- Lucide React (icons)

These tools help build a dynamic, mobile-friendly interface with fast loading times and clean component structures.

#### IV. Database Software
The system uses a relational database to store structured data:

- MySQL 8.0+
- MySQL Workbench (optional, for table visualization and manual queries)

MySQL supports indexing, relationships, and fast search queries required by the e-library platform.

#### V. Server & Deployment Tools
For deployment and hosting, the system may require:

- Uvicorn or Gunicorn (production server for FastAPI)
- Nginx or Apache (reverse proxy)
- PM2 or systemctl (for frontend process management)
- Docker (optional, for containerized deployment)
- Git (for version control)

These tools enable stable hosting, load balancing, and continuous deployment practices.

### 3.4.3 User-End Hardware and Software Requirements

#### I. Hardware Requirements for End Users
Students, librarians, and administrators can access the system with any modern device:

- Smartphones (Android or iOS)
- Laptops
- Desktop computers
- Tablets

Only a basic internet connection is required, since the system is lightweight and optimized for web access.

#### II. Software Requirements for End Users
No installation is required. A modern web browser is sufficient:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari

The system is fully browser-based, making it accessible from anywhere with an internet connection.

---

**End of Chapter Three**
