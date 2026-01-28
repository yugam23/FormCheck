
import { Activity } from 'lucide-react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

const MainLayout = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans relative overflow-x-hidden">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-20 animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Navigation Bar */}
            <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-white/5 px-6 py-4 supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link
                        to="/"
                        className="flex items-center space-x-3 cursor-pointer group"
                    >
                        <div className="w-10 h-10 bg-gradient-to-tr from-primary to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                            <Activity size={22} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-display font-bold tracking-tight leading-none group-hover:text-primary transition-colors">FormCheck</span>
                            <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">AI Coach</span>
                        </div>
                    </Link>

                    <div className="flex items-center space-x-1 bg-white/5 rounded-full p-1 border border-white/5 backdrop-blur-md">
                        <Link
                            to="/"
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
                                currentPath === '/' 
                                    ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(16,185,129,0.2)] border border-primary/20" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )}
                        >
                            Exercises
                        </Link>
                        <Link
                            to="/dashboard"
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
                                currentPath === '/dashboard' 
                                    ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(16,185,129,0.2)] border border-primary/20" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )}
                        >
                            Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="relative z-10 pt-28 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
