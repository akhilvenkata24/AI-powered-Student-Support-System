import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { GraduationCap, MessageSquare, Home, HeartPulse, FileText, Settings, Menu, X } from 'lucide-react';

const navItems = [
    { path: '/',              name: 'Home',          icon: Home         },
    { path: '/admissions',   name: 'Admissions',    icon: FileText     },
    { path: '/chat',         name: 'AI Chat',       icon: MessageSquare},
    { path: '/mental-health',name: 'Wellbeing',     icon: HeartPulse   },
    { path: '/admin',        name: 'Admin',         icon: Settings     },
];

const Navbar = () => {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'backdrop-blur-2xl border-b border-white/10' : ''}`}
             style={{ background: scrolled ? 'rgba(15,14,23,0.85)' : 'transparent' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-violet-500 rounded-xl blur-lg opacity-60 group-hover:opacity-90 transition-opacity" />
                            <div className="relative bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl p-2">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <span className="text-xl font-bold font-[Outfit] gradient-text tracking-tight">
                            CampusAI
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`nav-pill inline-flex items-center gap-2 text-sm font-medium ${isActive ? 'nav-pill-active' : ''}`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.name}
                                </Link>
                            );
                        })}
                        <Link to="/virtual-counselor" className="ml-3 btn-primary text-sm py-2 px-5">
                            Virtual Counselling
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-white/70 hover:text-white transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 py-3 space-y-1 border-t border-white/10 backdrop-blur-2xl bg-[#0f0e17]/90">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-violet-500/20 text-violet-300' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                            >
                                <Icon className="w-4 h-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
