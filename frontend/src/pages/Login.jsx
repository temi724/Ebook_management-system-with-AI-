import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import useAuthStore from '../stores/authStore';
import authService from '../services/authService';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuthStore();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('Login form submitted');
        setIsLoading(true);

        try {
            console.log('Attempting login with username:', formData.username);
            const tokenData = await authService.login(formData);
            console.log('Login successful, token received');

            // IMPORTANT: Save token to store BEFORE calling getCurrentUser
            // so the axios interceptor can add it to the Authorization header
            const tempToken = tokenData.access_token;
            useAuthStore.getState().setToken(tempToken);

            const userData = await authService.getCurrentUser();
            console.log('User data received:', userData);

            // Now properly set both user and token
            login(userData, tempToken);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            console.error('Error response:', err.response);

            const errorMessage = err.response?.data?.detail || err.message || 'Login failed. Please check your credentials and try again.';
            console.log('Showing error toast:', errorMessage);

            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 8000,
                pauseOnHover: true,
                closeOnClick: true,
            });
        } finally {
            setIsLoading(false);
        }

        return false; // Prevent any default form submission
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <img
                        src="/logo.jpeg"
                        alt="Crescent University"
                        className="w-20 h-20 object-contain mx-auto mb-4"
                    />
                    <h1 className="text-4xl font-display font-bold text-gradient mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-400">
                        Sign in to access your e-library account
                    </p>
                </div>

                {/* Form */}
                <div className="card animate-scale-in">

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Username"
                            name="username"
                            type="text"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={handleChange}
                            icon={UserIcon}
                            required
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            icon={Lock}
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-center text-gray-400">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                            >
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
