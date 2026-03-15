import { Link } from 'react-router-dom';
import { MessageSquare, FileText, HeartPulse, ArrowRight, Sparkles, Zap, Shield, Video, GraduationCap, Globe, Users } from 'lucide-react';
import ParticleBackground from '../components/common/ParticleBackground';

const pillars = [
    {
        icon: FileText,
        color: 'text-brand-primary dark:text-brand-secondary',
        bg: 'bg-brand-primary/10 dark:bg-brand-secondary/20',
        border: 'border-brand-primary/20 dark:border-brand-secondary/30',
        title: 'Admissions',
        desc: 'Track your application status and manage required documents with real-time updates.',
        path: '/admissions',
    },
    {
        icon: MessageSquare,
        color: 'text-brand-primary dark:text-brand-secondary',
        bg: 'bg-brand-primary/10 dark:bg-brand-secondary/20',
        border: 'border-brand-primary/20 dark:border-brand-secondary/30',
        title: 'AI Assistant',
        desc: 'Get instant answers 24/7 in your language. Our AI knows everything about campus life.',
        path: '/chat',
        featured: true,
    },
    {
        icon: HeartPulse,
        color: 'text-brand-primary dark:text-brand-secondary',
        bg: 'bg-brand-primary/10 dark:bg-brand-secondary/20',
        border: 'border-brand-primary/20 dark:border-brand-secondary/30',
        title: 'Wellbeing',
        desc: 'Confidential mental health support and counseling resources whenever you need them.',
        path: '/mental-health',
    },
    {
        icon: Video,
        color: 'text-brand-primary dark:text-brand-secondary',
        bg: 'bg-brand-primary/10 dark:bg-brand-secondary/20',
        border: 'border-brand-primary/20 dark:border-brand-secondary/30',
        title: 'Virtual Counseling',
        desc: 'Talk face-to-face with a virtual AI counselor for personalized academic guidance.',
        path: '/virtual-counselor',
    }
];

const stats = [
    { value: '24/7', label: 'Availability', icon: Sparkles },
    { value: '6+', label: 'Languages', icon: Globe },
    { value: '<1s', label: 'Response', icon: Zap },
    { value: '10k+', label: 'Students', icon: Users },
];

const Dashboard = () => {
    return (
        <div className="pt-24 md:pt-28 pb-20 px-4 relative min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
            
            <ParticleBackground variant="high" />

            <div className="max-w-7xl mx-auto space-y-24 relative z-10">
                
                {/* ── Minimal Hero Section ────────────────────────── */}
                <div className="text-center space-y-8 py-10 md:py-16 min-h-[calc(100vh-180px)] md:min-h-[calc(100vh-220px)] flex flex-col justify-center relative">
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-12 duration-1000">
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-brand-primary dark:text-brand-secondary bg-brand-primary/10 dark:bg-brand-secondary/10 border border-brand-primary/20 dark:border-brand-secondary/20 mb-4">
                            <Sparkles className="w-4 h-4" />
                            Next-Generation Campus Intelligence
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white leading-[1.1] tracking-tight max-w-4xl mx-auto">
                            Your Smart <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary drop-shadow-sm">AI Assistant.</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium px-4">
                            Experience university support reimagined. Admissions, mental health, and academic aid within one clean, AI-powered workspace.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in zoom-in duration-1000 delay-300">
                        <Link to="/chat" className="btn-primary !px-10 !py-4 !rounded-xl !text-lg">
                            Launch Assistant
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/admissions" className="btn-pill !px-10 !py-4 !rounded-xl !text-lg">
                            Admissions Hub
                        </Link>
                    </div>
                </div>

                {/* Quick Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-8">
                    {stats.map(({ value, label, icon: Icon }) => (
                        <div key={label} className="card-base p-6 md:p-8 flex flex-col items-center gap-3 text-center transition-all hover:border-brand-primary/30 group">
                            <Icon className="w-6 h-6 text-brand-primary dark:text-brand-secondary opacity-60 group-hover:opacity-100 transition-opacity" />
                            <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</div>
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Pillars section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pillars.map((pillar) => (
                        <Link 
                            key={pillar.path} 
                            to={pillar.path}
                            className={`group card-base p-8 md:p-10 flex flex-col gap-6 relative overflow-hidden transition-all duration-300 hover:border-brand-primary/30 hover:shadow-md ${pillar.featured ? 'border-brand-primary/20 dark:border-brand-secondary/30 ring-1 ring-brand-primary/5 dark:ring-brand-secondary/5' : ''}`}
                        >
                            {pillar.featured && (
                                <div className="absolute top-0 right-0 px-4 py-1.5 bg-brand-primary text-[10px] font-bold text-white uppercase tracking-widest rounded-bl-xl shadow-sm">
                                    Popular
                                </div>
                            )}

                            <div className={`w-14 h-14 rounded-xl ${pillar.bg} border ${pillar.border} flex items-center justify-center transition-transform group-hover:scale-105 duration-300`}>
                                <pillar.icon className={`w-7 h-7 ${pillar.color}`} />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xl md:text-2xl font-semibold flex items-center justify-between text-slate-900 dark:text-white tracking-tight">
                                    {pillar.title}
                                    <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-primary dark:text-brand-secondary" />
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                    {pillar.desc}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="card-base p-10 md:p-16 relative overflow-hidden text-center space-y-8 bg-white dark:bg-slate-900">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent dark:from-brand-primary/10 -z-10" />

                    <div className="w-16 h-16 bg-brand-primary/10 dark:bg-brand-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-brand-primary/20 dark:border-brand-secondary/30">
                         <GraduationCap className="w-8 h-8 text-brand-primary dark:text-brand-secondary" />
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Ready to Simplify Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Academic Journey?</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                        Join thousands of students who are already using CampusAI to streamline their academics and 
                        improve their wellbeing.
                    </p>
                    <div className="pt-6">
                        <Link to="/chat" className="btn-primary">
                            Start Exploring
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
