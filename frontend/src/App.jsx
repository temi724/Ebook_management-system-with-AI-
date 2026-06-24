import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import MyLoans from './pages/MyLoans';
import AdminLoans from './pages/AdminLoans';
import Recommendations from './pages/Recommendations';
import useAuthStore from './stores/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  const routes = (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
      <Route path="/my-loans" element={<ProtectedRoute><MyLoans /></ProtectedRoute>} />
      <Route path="/admin/loans" element={<ProtectedRoute><AdminLoans /></ProtectedRoute>} />
      <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  // Authenticated users get the sidebar layout; public pages keep the top navbar.
  if (isAuthenticated) {
    return (
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          <div className="lg:pl-64 pt-14 lg:pt-0 flex flex-col min-h-screen">
            <main className="flex-1">{routes}</main>
            <Footer />
          </div>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{routes}</main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

