import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Sun, Moon } from 'lucide-react';

const EntryPortal = () => {
    const navigate = useNavigate();
    const [isLaunching, setIsLaunching] = useState(false);
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const handleLaunch = () => {
        if (isLaunching) return;
        setIsLaunching(true);
        window.setTimeout(() => {
            navigate('/home');
        }, 560);
    };

    return (
        <div className={`entry-scene min-h-screen px-4 py-8 md:py-12 flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden relative ${isLaunching ? 'is-launching' : ''}`}>
            <button
                type="button"
                onClick={() => setIsDark(!isDark)}
                className="absolute top-5 right-5 z-30 p-3 rounded-full border border-slate-300/80 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-brand-primary/40 dark:hover:border-brand-secondary/50 transition-colors"
                aria-label="Toggle Theme"
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="entry-aurora" />
            <div className="entry-grid" />
            <div className="entry-orb entry-orb-a" />
            <div className="entry-orb entry-orb-b" />
            <div className="entry-orb entry-orb-c" />

            <div className="pointer-events-none absolute inset-0">
                <div className="entry-ring entry-ring-a" />
                <div className="entry-ring entry-ring-b" />
            </div>

            <div className="w-full max-w-4xl relative z-10 text-center">
                <div className="entry-content space-y-8 md:space-y-10 px-4 md:px-8 lg:px-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 dark:bg-brand-secondary/20 border border-brand-primary/20 dark:border-brand-secondary/30 text-brand-primary dark:text-brand-secondary text-[11px] font-bold uppercase tracking-[0.14em]">
                        <Sparkles className="w-4 h-4" />
                        Student AI Platform
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-[2.2rem] md:text-6xl font-bold leading-[1.05] tracking-tight text-slate-900 dark:text-white">
                            Enter Your
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-cyan-500 to-brand-secondary">
                                AI Assistant
                            </span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-base md:text-lg font-medium leading-relaxed">
                            A single intelligent hub for admissions, wellbeing, counseling, and campus support.
                        </p>
                    </div>

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={handleLaunch}
                            disabled={isLaunching}
                            className="inline-flex items-center gap-3 btn-primary !px-10 !py-4 !rounded-full text-base md:text-lg shadow-lg hover:scale-[1.02] transition-transform"
                        >
                            {isLaunching ? 'Launching...' : 'Launch Home'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            Secure
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                            Adaptive Experience
                        </span>
                    </div>
                </div>
            </div>

            <div className="entry-launch-wipe" />
        </div>
    );
};

export default EntryPortal;