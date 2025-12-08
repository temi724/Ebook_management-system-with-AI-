# E-Library Management System - Frontend

Modern, AI-powered e-library management system built with React, Vite, Tailwind CSS 3, and Zustand.

## Features

- 🎨 **Modern UI**: Beautiful glassmorphism design with Tailwind CSS 3
- 🔐 **Authentication**: Secure JWT-based authentication
- 📚 **Book Management**: Browse, search, and borrow books
- 🤖 **AI Recommendations**: Personalized suggestions powered by AI
- 📊 **Dashboard**: Track your loans and reading history
- 📱 **Responsive Design**: Works seamlessly on all devices
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development

## Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS 3
- **State Management**: Zustand
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Development

Run the development server:
```bash
npm run dev
```

Application will be available at: http://localhost:5173

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   ├── stores/          # Zustand state stores
│   ├── services/        # API services
│   ├── App.jsx          # Main component
│   └── index.css        # Global styles
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
