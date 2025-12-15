import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, TrendingUp, Shield } from 'lucide-react';
import Button from '../components/common/Button';

const Home = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="page-container py-20">
                <div className="max-w-4xl mx-auto text-center animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 border border-primary-500/30 rounded-full mb-6">
                        <Sparkles className="text-primary-400" size={16} />
                        <span className="text-sm text-primary-300 font-semibold">AI-Powered Library</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-display font-bold text-gradient mb-6">
                        Your Gateway to
                        <br />
                        Infinite Knowledge
                    </h1>

                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Experience the future of library management with AI-powered recommendations,
                        automated loan tracking, and seamless book discovery.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register">
                            <Button variant="primary" size="lg">
                                Get Started Free
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" size="lg">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="page-container py-20">
                <h2 className="section-header text-center mb-12">
                    Powerful Features
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="card text-center animate-slide-up">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4">
                            <Sparkles className="text-white" size={32} />
                        </div>
                        <h3 className="text-xl font-display font-bold text-white mb-2">
                            AI Recommendations
                        </h3>
                        <p className="text-gray-400">
                            Get personalized book suggestions powered by advanced AI using RAG pipeline and Ollama models
                        </p>
                    </div>

                    <div className="card text-center animate-slide-up animation-delay-200">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl mb-4">
                            <TrendingUp className="text-white" size={32} />
                        </div>
                        <h3 className="text-xl font-display font-bold text-white mb-2">
                            Automated Tracking
                        </h3>
                        <p className="text-gray-400">
                            Smart loan management with automatic due date reminders and renewal options
                        </p>
                    </div>

                    <div className="card text-center animate-slide-up animation-delay-400">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl mb-4">
                            <Shield className="text-white" size={32} />
                        </div>
                        <h3 className="text-xl font-display font-bold text-white mb-2">
                            Secure & Scalable
                        </h3>
                        <p className="text-gray-400">
                            Role-based access control with JWT authentication and MySQL database
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="page-container py-20">
                <div className="glass-card p-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div>
                            <p className="text-5xl font-bold text-gradient mb-2">10,000+</p>
                            <p className="text-gray-400">Books Available</p>
                        </div>
                        <div>
                            <p className="text-5xl font-bold text-gradient mb-2">5,000+</p>
                            <p className="text-gray-400">Active Users</p>
                        </div>
                        <div>
                            <p className="text-5xl font-bold text-gradient mb-2">99.9%</p>
                            <p className="text-gray-400">Uptime</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="page-container py-20">
                <div className="card text-center max-w-3xl mx-auto">
                    <BookOpen className="text-primary-400 mx-auto mb-6" size={64} />
                    <h2 className="text-3xl font-display font-bold text-gradient mb-4">
                        Ready to Transform Your Reading Experience?
                    </h2>
                    <p className="text-gray-300 mb-8">
                        Join thousands of readers who have discovered the power of AI-assisted library management
                    </p>
                    <Link to="/register">
                        <Button variant="primary" size="lg">
                            Create Your Account
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
