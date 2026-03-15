import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { GraduationCap, MessageSquare, Home, HeartPulse, FileText, Settings, Menu, X, Video, Sun, Moon } from "lucide-react";

const navItems = [
    { path: "/home",          name: "Home",      icon: Home          },
    { path: "/admissions",   name: "Admissions", icon: FileText      },
    { path: "/chat",         name: "AI Chat",    icon: MessageSquare },
    { path: "/mental-health",name: "Wellbeing",  icon: HeartPulse    },
    { path: "/admin",        name: "Admin Hub",  icon: Settings      },
];

const Navbar = () => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
    // Theme state
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    return (
        <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 shadow-sm' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center h-16 px-6 md:px-8">

                    {/* Logo Section */}
                    <Link to="/" className="flex items-center gap-3">
                        <div className="bg-brand-primary p-2 rounded-xl text-white">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                            Student AI Assistant
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-2">
                        {navItems.map(({ path, name, icon: Icon }) => {
                            const active = location.pathname === path;
                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 rounded-lg 
                                        ${active 
                                            ? "bg-brand-primary/10 text-brand-primary dark:bg-brand-secondary/20 dark:text-brand-secondary" 
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {name}
                                </Link>
                            );
                        })}
                        
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-4" />
                        
                        <Link
                            to="/virtual-counselor"
                            className="bg-brand-primary hover:bg-brand-hover text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-colors"
                        >
                            <Video className="w-4 h-4" />
                            Live Room
                        </Link>

                        {/* Desktop Theme Switcher */}
                        <button 
                            onClick={() => setIsDark(!isDark)}
                            className="ml-4 p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Toggle Dark Mode"
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </nav>

                    {/* Mobile Menu Trigger & Theme Toggle */}
                    <div className="lg:hidden flex items-center gap-2">
                        <button 
                            onClick={() => setIsDark(!isDark)}
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {menuOpen && (
                    <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 shadow-lg animate-in slide-in-from-top-2">
                        <div className="p-4 space-y-2">
                            {navItems.map(({ path, name, icon: Icon }) => {
                                const active = location.pathname === path;
                                return (
                                    <Link
                                        key={path}
                                        to={path}
                                        onClick={() => setMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                                            ${active 
                                                ? "bg-brand-primary/10 text-brand-primary dark:bg-brand-secondary/20 dark:text-brand-secondary" 
                                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {name}
                                    </Link>
                                );
                            })}
                            <Link
                                to="/virtual-counselor"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-center gap-2 w-full mt-4 bg-brand-primary hover:bg-brand-hover text-white rounded-lg px-4 py-3 text-sm font-semibold transition-colors"
                            >
                                <Video className="w-5 h-5" />
                                Enter Live Room
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
