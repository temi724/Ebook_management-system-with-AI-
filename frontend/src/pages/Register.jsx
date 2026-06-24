import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, BookOpen } from 'lucide-react';
import { toast } from 'react-toastify';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import authService from '../services/authService';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        full_name: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        department: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match', {
                position: "top-right",
                autoClose: 8000,
                pauseOnHover: true,
            });
            return;
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters long', {
                position: "top-right",
                autoClose: 8000,
                pauseOnHover: true,
            });
            return;
        }

        setIsLoading(true);

        try {
            const { confirmPassword, ...registerData } = formData;
            await authService.register(registerData);

            // Account created — send the user to the login page to sign in.
            toast.success('Account created successfully! Please sign in.', {
                position: "top-right",
                autoClose: 5000,
                pauseOnHover: true,
            });
            navigate('/login');
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Registration failed. Please try again.';
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 8000,
                pauseOnHover: true,
                closeOnClick: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-4">
                        <BookOpen className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-gradient mb-2">
                        Join E-Library
                    </h1>
                    <p className="text-gray-400">
                        Create your account and start exploring
                    </p>
                </div>

                {/* Form */}
                <div className="card animate-scale-in">

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Full Name"
                            name="full_name"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.full_name}
                            onChange={handleChange}
                            icon={UserIcon}
                            required
                        />

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            icon={Mail}
                            required
                        />

                        <Input
                            label="Username"
                            name="username"
                            type="text"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            icon={UserIcon}
                            required
                        />

                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="input-field"
                                required
                            >
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                            </select>
                        </div>

                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Department
                            </label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="input-field"
                                required
                            >
                                <option value="">Select your department</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Electrical Engineering">Electrical Engineering</option>
                                <option value="Mechanical Engineering">Mechanical Engineering</option>
                                <option value="Civil Engineering">Civil Engineering</option>
                                <option value="Medicine & Health Sciences">Medicine &amp; Health Sciences</option>
                                <option value="Law">Law</option>
                                <option value="Business Administration">Business Administration</option>
                                <option value="Economics">Economics</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Biology">Biology</option>
                                <option value="Arts & Humanities">Arts &amp; Humanities</option>
                                <option value="Social Sciences">Social Sciences</option>
                                <option value="Education">Education</option>
                                <option value="Architecture">Architecture</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Create a password (min. 8 characters)"
                            value={formData.password}
                            onChange={handleChange}
                            icon={Lock}
                            required
                        />

                        <Input
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
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
                            Create Account
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-center text-gray-400">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
