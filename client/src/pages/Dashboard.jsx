import { Link } from 'react-router-dom';
import { MessageSquare, FileText, HeartPulse, BarChart2, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

const pillars = [
    {
        icon: FileText,
        color: 'from-blue-500 to-cyan-400',
        glow: 'rgba(59,130,246,0.4)',
        title: 'Admissions',
        desc: 'Track your application status and manage required documents.',
        path: '/admissions',
    },
    {
        icon: MessageSquare,
        color: 'from-violet-500 to-purple-400',
        glow: 'rgba(139,92,246,0.4)',
        title: 'AI Assistant',
        desc: 'Get instant answers 24/7 in your language with our AI chatbot.',
        path: '/chat',
        featured: true,
    },
    {
        icon: HeartPulse,
        color: 'from-rose-500 to-pink-400',
        glow: 'rgba(244,63,94,0.4)',
        title: 'Wellbeing',
        desc: 'Confidential mental health support and counseling resources.',
        path: '/mental-health',
    },
    {
        icon: BarChart2,
        color: 'from-emerald-500 to-teal-400',
        glow: 'rgba(16,185,129,0.4)',
        title: 'Admin Panel',
        desc: 'Manage queries, FAQs and view real-time chatbot analytics.',
        path: '/admin',
    },
];

const features = [
    { icon: Zap,      label: 'Instant AI Responses'       },
    { icon: Shield,   label: 'Sentiment-Aware Support'    },
    { icon: Sparkles, label: 'Multilingual (6 languages)' },
];

const Dashboard = () => {
    return (
        <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">

            {/* Animated Background blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
                <div className="float-anim absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
                <div className="float-anim-delay absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
                <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl" />
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-20">

                {/* Hero Section */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-violet-300 border border-violet-500/30 bg-violet-500/10 mb-4">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        AI-Powered Student Support System
                    </div>

                    <h1 className="text-5xl sm:text-7xl font-black font-[Outfit] leading-tight tracking-tight">
                        Your Campus,{' '}
                        <span className="gradient-text">Smarter</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg sm:text-xl text-white/60 leading-relaxed">
                        Get instant academic support, mental health resources, and campus guidance — powered by AI, available 24/7.
                    </p>

                    <div className="flex flex-wrap gap-3 justify-center pt-4">
                        <Link to="/chat" className="btn-primary text-base gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Start Chatting
                        </Link>
                        <Link to="/admissions" className="btn-ghost text-base gap-2">
                            View My Application
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-3 justify-center pt-2">
                        {features.map(({ icon: Icon, label }) => (
                            <div key={label} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-white/50 bg-white/5 border border-white/10">
                                <Icon className="w-3.5 h-3.5 text-violet-400" />
                                {label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Support Pillars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {pillars.map(({ icon: Icon, color, glow, title, desc, path, featured }) => (
                        <Link
                            key={path}
                            to={path}
                            className={`glass-card p-6 flex flex-col gap-4 cursor-pointer ${featured ? 'sm:col-span-2 lg:col-span-1' : ''}`}
                            style={{ '--glow': glow }}
                        >
                            <div
                                className={`self-start p-3 rounded-xl bg-gradient-to-br ${color}`}
                                style={{ boxShadow: `0 6px 20px ${glow}` }}
                            >
                                <Icon className="w-6 h-6 text-white" />
                            </div>

                            <div>
                                <h3 className="font-bold text-lg font-[Outfit] text-white">{title}</h3>
                                <p className="text-sm text-white/50 mt-1 leading-relaxed">{desc}</p>
                            </div>

                            <div className="flex items-center gap-1 text-sm font-semibold mt-auto text-white/40 group-hover:text-white/70 transition-colors">
                                Explore <ArrowRight className="w-4 h-4" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Stats Row */}
                <div className="glass-card p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '24/7', label: 'Support Available' },
                            { value: '6',    label: 'Languages Supported' },
                            { value: '<1s',  label: 'Avg. Response Time' },
                            { value: '99%',  label: 'Student Satisfaction' },
                        ].map(({ value, label }) => (
                            <div key={label}>
                                <p className="text-4xl font-black font-[Outfit] gradient-text">{value}</p>
                                <p className="text-sm text-white/50 mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
