const Footer = () => {
    return (
        <footer className="mt-auto py-8 border-t border-white/10">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-gray-400 text-sm">
                            &copy; {new Date().getFullYear()} E-Library Management System. All rights reserved.
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                            Powered by AI • Built with FastAPI & React
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                            Terms of Service
                        </a>
                        <a href="#" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
