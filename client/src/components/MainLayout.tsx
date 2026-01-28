
import { Activity } from 'lucide-react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const MainLayout = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-green-500/30">
            {/* Navigation Bar */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link
                        to="/"
                        className="flex items-center space-x-2 cursor-pointer"
                    >
                        <div className="w-8 h-8 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
                            <Activity size={20} className="text-black" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">FormCheck<span className="text-green-400">.AI</span></span>
                    </Link>

                    <div className="flex space-x-6">
                        <Link
                            to="/"
                            className={`text-sm font-medium transition-colors ${currentPath === '/' ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                        >
                            Exercises
                        </Link>
                        <Link
                            to="/dashboard"
                            className={`text-sm font-medium transition-colors ${currentPath === '/dashboard' ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                        >
                            Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="pt-24 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
