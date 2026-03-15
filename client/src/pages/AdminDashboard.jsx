import { useState, useEffect } from 'react';
import { Users, FileText, MessageSquare, Calendar, Activity, AlertCircle, Bot, Plus, X, TrendingUp, Search, Zap, Pencil, Trash2, Flag, Save, LogIn, LogOut, Lock, User } from 'lucide-react';
import api, { setAdminToken, getAdminToken, clearAdminToken } from '../services/api';
import ParticleBackground from '../components/common/ParticleBackground';

const tabButtonClass = (isActive) => `flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${isActive
    ? 'bg-brand-primary text-white shadow-sm'
    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
}`;

const badgeClass = (tone = 'default') => {
    if (tone === 'danger') {
        return 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/40';
    }

    if (tone === 'brand') {
        return 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-brand-primary/10 dark:bg-brand-secondary/20 text-brand-primary dark:text-brand-secondary border border-brand-primary/15 dark:border-brand-secondary/30';
    }

    return 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
};

const StatCard = ({ icon: Icon, label, value, accent, delay }) => (
    <div className={`card-base p-8 md:p-10 flex flex-col gap-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-primary/25 dark:hover:border-brand-secondary/25 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both ${delay}`}>
        <div className="flex items-center justify-between">
            <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 ${accent}`}>
                <Icon className="w-7 h-7" />
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800/30">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
        </div>
        <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{label}</p>
            <p className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tabular-nums">{value || 0}</p>
        </div>
    </div>
);

const parseAppointmentField = (notes, fieldLabel) => {
    if (!notes) return '';
    const regex = new RegExp(`${fieldLabel}:\\s*([^|]+)`, 'i');
    const match = notes.match(regex);
    return match ? match[1].trim() : '';
};

const humanizeType = (type) => {
    if (!type) return 'Not specified';
    return type.replace(/_/g, ' ');
};

const getAppointmentReason = (appointment) => {
    return appointment.requestReason || parseAppointmentField(appointment.notes, 'Reason') || humanizeType(appointment.type);
};

const getAppointmentEmail = (appointment) => {
    return appointment.contactEmail || appointment.email || parseAppointmentField(appointment.notes, 'Contact Email') || appointment.studentId?.email || '';
};

const AdminLogin = ({ onLogin }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/admin-auth/login', credentials);
            const { token, admin } = res.data?.data || {};
            if (token) {
                setAdminToken(token);
                onLogin(admin);
            } else {
                setError('Login failed. Please try again.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden px-4">
            <ParticleBackground variant="low" />
            <div className="relative z-10 w-full max-w-md">
                <div className="card-base p-10 md:p-14 space-y-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
                    {/* Logo / Header */}
                    <div className="space-y-5 text-center">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Admin Access</h1>
                            <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm font-medium">Sign in to the Operations Hub</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-4">Username</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        autoComplete="username"
                                        placeholder="admin"
                                        value={credentials.username}
                                        onChange={(e) => setCredentials((p) => ({ ...p, username: e.target.value }))}
                                        className="input-base !pl-12 w-full"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-4">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials((p) => ({ ...p, password: e.target.value }))}
                                        className="input-base !pl-12 w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-sm font-semibold">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full !py-4 !rounded-2xl text-base font-bold disabled:opacity-60">
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-3">
                                    <LogIn className="w-5 h-5" /> Sign In
                                </span>
                            )}
                        </button>

                        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            Sample credentials: <span className="font-bold text-slate-600 dark:text-slate-300">admin</span> / <span className="font-bold text-slate-600 dark:text-slate-300">Admin@123</span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAdminToken());
    const [adminInfo, setAdminInfo] = useState(null);
    const [stats, setStats] = useState({ totalQueries: 0, urgentQueries: 0, flaggedAppointments: 0, faqCount: 0, activeUsers: 0 });
    const [queries, setQueries] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'general', tags: '' });
    const [showFaqForm, setShowFaqForm] = useState(false);
    const [querySearch, setQuerySearch] = useState('');
    const [editingFaqId, setEditingFaqId] = useState(null);
    const [faqDraft, setFaqDraft] = useState({ question: '', answer: '', category: 'general', tags: '' });
    const [savingFaq, setSavingFaq] = useState(false);
    const [updatingAppointmentId, setUpdatingAppointmentId] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const sR = await api.get('/admin/stats').catch(() => ({ data: { data: { totalQueries: 0, urgentQueries: 0, flaggedAppointments: 0, faqCount: 0, activeUsers: 0 } } }));
                const qR = await api.get('/admin/queries').catch(() => ({ data: { data: [] } }));
                const fR = await api.get('/admin/faqs').catch(() => ({ data: { data: [] } }));
                const aR = await api.get('/admin/appointments').catch(() => ({ data: { data: [] } }));

                setStats(sR.data?.data || { totalQueries: 0, urgentQueries: 0, flaggedAppointments: 0, faqCount: 0, activeUsers: 0 });
                setQueries(qR.data?.data || []);
                setFaqs(fR.data?.data || []);
                setAppointments(aR.data?.data || []);
            } catch (err) {
                console.error("Admin data load failure", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [isAuthenticated]);

    const handleCreateFaq = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/faqs', {
                ...newFaq,
                tags: newFaq.tags.split(',').map(t => t.trim()).filter(Boolean)
            });
            if (res.data?.data) {
                setFaqs([res.data.data, ...faqs]);
                setNewFaq({ question: '', answer: '', category: 'general', tags: '' });
                setShowFaqForm(false);
            }
        } catch { 
            alert('DB Connection Error.'); 
        }
    };

    const handleStartEditFaq = (faq) => {
        setEditingFaqId(faq._id);
        setFaqDraft({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            tags: (faq.tags || []).join(', '),
        });
    };

    const handleCancelEditFaq = () => {
        setEditingFaqId(null);
        setFaqDraft({ question: '', answer: '', category: 'general', tags: '' });
    };

    const handleSaveFaq = async (faqId) => {
        setSavingFaq(true);
        try {
            const res = await api.put(`/admin/faqs/${faqId}`, {
                question: faqDraft.question,
                answer: faqDraft.answer,
                category: faqDraft.category,
                tags: faqDraft.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
            });

            const updatedFaq = res.data?.data;
            if (updatedFaq) {
                setFaqs((prev) => prev.map((faq) => (faq._id === faqId ? updatedFaq : faq)));
            }
            handleCancelEditFaq();
        } catch (error) {
            alert(error.response?.data?.error || 'Unable to update FAQ.');
        } finally {
            setSavingFaq(false);
        }
    };

    const handleDeleteFaq = async (faqId) => {
        if (!window.confirm('Delete this FAQ?')) return;

        try {
            await api.delete(`/admin/faqs/${faqId}`);
            setFaqs((prev) => prev.filter((faq) => faq._id !== faqId));
            if (editingFaqId === faqId) {
                handleCancelEditFaq();
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Unable to delete FAQ.');
        }
    };

    const handleToggleAppointmentFlag = async (appointmentId, nextFlag) => {
        setUpdatingAppointmentId(appointmentId);
        try {
            const res = await api.patch(`/admin/appointments/${appointmentId}/flag`, {
                flaggedForReview: nextFlag,
            });

            const updatedAppointment = res.data?.data;
            if (updatedAppointment) {
                setAppointments((prev) => prev.map((appointment) => (
                    appointment._id === appointmentId ? updatedAppointment : appointment
                )));
                setStats((prev) => ({
                    ...prev,
                    urgentQueries: prev.urgentQueries + (nextFlag ? 1 : -1),
                    flaggedAppointments: (prev.flaggedAppointments || 0) + (nextFlag ? 1 : -1),
                }));
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Unable to update appointment flag.');
        } finally {
            setUpdatingAppointmentId(null);
        }
    };

    const handleLogout = () => {
        clearAdminToken();
        setIsAuthenticated(false);
        setAdminInfo(null);
    };

    const normalizedSearch = querySearch.trim().toLowerCase();
    const filteredQueries = queries.filter((query) => {
        if (!normalizedSearch) return true;
        return [query.question, query.aiResponse, query.sentiment?.label]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedSearch));
    });
    const urgentQueries = queries.filter((query) => query.sentiment?.label === 'urgent').slice(0, 4);
    const recentAppointments = appointments.slice(0, 4);
    const overviewSignals = [
        {
            label: 'Query Volume',
            value: stats.totalQueries,
            detail: stats.totalQueries > 0 ? 'Student conversations recorded in the system.' : 'No student conversations recorded yet.',
        },
        {
            label: 'Urgent Cases',
            value: stats.urgentQueries,
            detail: stats.urgentQueries > 0 ? 'Urgent AI cases and flagged appointments needing review.' : 'No urgent cases or flagged appointments are currently present.',
        },
        {
            label: 'Knowledge Base',
            value: stats.faqCount,
            detail: stats.faqCount > 0 ? 'Published FAQ entries available to the assistant.' : 'No FAQ entries have been published yet.',
        },
        {
            label: 'Appointments',
            value: appointments.length,
            detail: appointments.length > 0 ? 'Counseling appointments stored in the admin queue.' : 'No counseling appointments have been scheduled yet.',
        },
    ];

    const tabs = [
        { id: 'overview',      label: 'Ops Monitor', icon: Activity      },
        { id: 'queries',       label: 'AI Stream',   icon: MessageSquare },
        { id: 'faqs',          label: 'Knowledge', icon: FileText      },
        { id: 'appointments',  label: 'Care Log',   icon: Calendar      },
    ];

    if (!isAuthenticated) return (
        <AdminLogin onLogin={(admin) => { setAdminInfo(admin); setIsAuthenticated(true); }} />
    );

    if (isLoading) return (
        <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
             <div className="w-16 h-16 border-[6px] border-brand-primary/15 border-t-brand-primary rounded-full animate-spin shadow-inner" />
        </div>
    );

    return (
        <div className="pt-24 md:pt-32 pb-20 px-4 md:px-8 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
            <ParticleBackground variant="low" />
            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-6">
                        <div className={badgeClass('brand')}>
                             <Zap className="w-4 h-4" />
                             System Master Control
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.05]">
                            Operations <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Hub</span>
                        </h1>
                        <p className="max-w-2xl text-slate-600 dark:text-slate-400 text-base md:text-lg font-medium leading-relaxed">
                            Administrative monitoring, AI support logs, knowledge management, and counseling records inside the same visual system as the student-facing workspace.
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-4 self-start md:self-auto">
                        {/* Logout */}
                        <button onClick={handleLogout} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <LogOut className="w-4 h-4" />
                            {adminInfo?.name ? `Sign out (${adminInfo.name})` : 'Sign out'}
                        </button>
                        {/* Tabs */}
                        <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            {tabs.map(({ id, icon: Icon, label }) => (
                                <button 
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={tabButtonClass(activeTab === id)}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Node */}
                <div className="space-y-10">
                    {activeTab === 'overview' && (
                        <div className="space-y-10 animate-in fade-in duration-700">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard icon={MessageSquare} label="AI Inquiries" value={stats.totalQueries} accent="text-brand-primary dark:text-brand-secondary" delay="delay-0" />
                                <StatCard icon={AlertCircle} label="Priority Cases" value={stats.urgentQueries} accent="text-rose-600 dark:text-rose-400" delay="delay-100" />
                                <StatCard icon={FileText} label="Asset Index" value={stats.faqCount} accent="text-emerald-600 dark:text-emerald-400" delay="delay-200" />
                                <StatCard icon={Users} label="Auth Students" value={stats.activeUsers} accent="text-cyan-600 dark:text-cyan-400" delay="delay-300" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 card-base p-8 md:p-10 space-y-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                     <div className="flex items-center justify-between">
                                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-none">System Pulse</h3>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800/30">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Operational
                                        </div>
                                     </div>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {overviewSignals.map((signal) => (
                                            <div key={signal.label} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 p-6 space-y-3">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{signal.label}</p>
                                                <p className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{signal.value}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{signal.detail}</p>
                                            </div>
                                        ))}
                                     </div>
                                </div>
                                <div className="card-base p-8 md:p-10 space-y-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-none">Urgent Queue</h3>
                                    {urgentQueries.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 p-6 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                            No urgent student conversations are currently flagged.
                                        </div>
                                    ) : (
                                        <div className="space-y-5">
                                            {urgentQueries.map((query, index) => (
                                                <div key={query._id || `${query.createdAt}-${index}`} className="flex gap-4 pb-5 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                                                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 flex items-center justify-center flex-shrink-0">
                                                        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                                    </div>
                                                    <div className="space-y-2 min-w-0">
                                                        <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">Urgent</p>
                                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed line-clamp-3">{query.question}</p>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{new Date(query.createdAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="card-base p-8 md:p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Appointments</h3>
                                    <div className={badgeClass()}>{appointments.length} Recorded</div>
                                </div>
                                {recentAppointments.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 p-6 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                        No counseling appointments are stored yet.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {recentAppointments.map((app, index) => (
                                            <div key={app._id || `${app.email}-${index}`} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 p-5 space-y-2">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{app.studentId?.name || app.studentName || app.email}</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">{getAppointmentEmail(app)}</p>
                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{new Date(app.appointmentDate).toLocaleString()}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{getAppointmentReason(app)}</p>
                                                {app.flaggedForReview && <div className={badgeClass('danger')}>Flagged</div>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Queries Control */}
                    {activeTab === 'queries' && (
                        <div className="card-base overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-500">
                             <div className="p-8 md:p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50 dark:bg-slate-950/40">
                                <div className="space-y-2">
                                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">AI Logic Stream</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring real-time student interactions and AI synthesis.</p>
                                </div>
                                <div className="relative group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-brand-primary transition-colors" />
                                    <input type="text" placeholder="Search logs..." value={querySearch} onChange={(e) => setQuerySearch(e.target.value)} className="input-base !pl-14 !rounded-xl !shadow-sm !w-full md:!w-80" />
                                </div>
                             </div>

                             <div>
                                {filteredQueries.length === 0 ? (
                                    <div className="p-20 md:p-32 text-center text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                        No query records are available.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredQueries.map((q, i) => (
                                            <div key={i} className="p-8 md:p-10 hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-colors group">
                                                 <div className="flex items-center justify-between mb-6">
                                                                     <div className={badgeClass(q.sentiment?.label === 'urgent' ? 'danger' : 'brand')}>{q.sentiment?.label || 'unclassified'}</div>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{new Date(q.createdAt).toLocaleTimeString()} @ Local</span>
                                                 </div>
                                                 <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-6 group-hover:translate-x-1 transition-transform">"{q.question}"</p>
                                                 <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium shadow-sm italic">
                                                    <Bot className="inline w-5 h-5 mr-3 mb-1 text-brand-primary dark:text-brand-secondary" />{q.aiResponse}
                                                 </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                             </div>
                        </div>
                    )}

                    {/* Knowledge Manager */}
                    {activeTab === 'faqs' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                             <div className="flex items-center justify-between">
                                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Knowledge Index</h3>
                                <button onClick={() => setShowFaqForm(!showFaqForm)} className="btn-primary !px-8 !py-3.5 shadow-sm">
                                    {showFaqForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    {showFaqForm ? 'Cancel Operation' : 'Sync New Asset'}
                                </button>
                             </div>

                             {showFaqForm && (
                                <form onSubmit={handleCreateFaq} className="card-base p-8 md:p-12 space-y-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-4">Core Question</label>
                                            <input required placeholder="Define the inquiry..." value={newFaq.question} onChange={e => setNewFaq({...newFaq, question: e.target.value})} className="input-base !rounded-xl" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-4">Classification</label>
                                            <select value={newFaq.category} onChange={e => setNewFaq({...newFaq, category: e.target.value})} className="input-base !rounded-xl appearance-none">
                                                <option value="general">Standard Knowledge</option>
                                                <option value="admission">Admissions Logistics</option>
                                            </select>
                                        </div>
                                        <div className="space-y-4 md:col-span-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-4">AI Output Definition</label>
                                            <textarea required placeholder="Craft the official response..." rows="4" value={newFaq.answer} onChange={e => setNewFaq({...newFaq, answer: e.target.value})} className="w-full rounded-2xl px-5 py-4 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none transition-all duration-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 shadow-sm" />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-primary !px-12">Commit to System</button>
                                </form>
                             )}

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {faqs.map((faq, i) => (
                                    <div key={faq._id || i} className="card-base p-8 md:p-10 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-primary/25 dark:hover:border-brand-secondary/25 transition-all shadow-sm group">
                                        {editingFaqId === faq._id ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className={badgeClass('brand')}>Editing</div>
                                                    <div className="flex gap-2">
                                                        <button type="button" onClick={() => handleSaveFaq(faq._id)} disabled={savingFaq} className="btn-primary !px-4 !py-2 text-sm disabled:opacity-60">
                                                            <Save className="w-4 h-4" /> Save
                                                        </button>
                                                        <button type="button" onClick={handleCancelEditFaq} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                                                            <X className="w-4 h-4" /> Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                                <input value={faqDraft.question} onChange={(e) => setFaqDraft((prev) => ({ ...prev, question: e.target.value }))} className="input-base !rounded-xl" />
                                                <select value={faqDraft.category} onChange={(e) => setFaqDraft((prev) => ({ ...prev, category: e.target.value }))} className="input-base !rounded-xl appearance-none">
                                                    <option value="general">Standard Knowledge</option>
                                                    <option value="admission">Admissions Logistics</option>
                                                    <option value="academic">Academic</option>
                                                    <option value="financial">Financial</option>
                                                    <option value="campus">Campus</option>
                                                    <option value="mental_health">Mental Health</option>
                                                </select>
                                                <textarea rows="5" value={faqDraft.answer} onChange={(e) => setFaqDraft((prev) => ({ ...prev, answer: e.target.value }))} className="w-full rounded-2xl px-5 py-4 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none transition-all duration-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 shadow-sm" />
                                                <input value={faqDraft.tags} onChange={(e) => setFaqDraft((prev) => ({ ...prev, tags: e.target.value }))} placeholder="Comma-separated tags" className="input-base !rounded-xl" />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className={badgeClass('brand')}>{faq.category}</div>
                                                    <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <button type="button" onClick={() => handleStartEditFaq(faq)} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                                                            <Pencil className="w-4 h-4" /> Edit
                                                        </button>
                                                        <button type="button" onClick={() => handleDeleteFaq(faq._id)} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-800/40 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                                                            <Trash2 className="w-4 h-4" /> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                                <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-brand-primary dark:group-hover:text-brand-secondary transition-colors tracking-tight">{faq.question}</h4>
                                                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">{faq.answer}</p>
                                                {(faq.tags || []).length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {faq.tags.map((tag) => (
                                                            <span key={tag} className={badgeClass()}>{tag}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                    {/* Wellness Care Log */}
                    {activeTab === 'appointments' && (
                        <div className="card-base bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-500">
                             <div className="p-8 md:p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                <h3 className="text-2xl md:text-3xl font-bold">Care Records</h3>
                                <div className={badgeClass('danger')}>{appointments.length} Total Cases</div>
                             </div>
                             <div>
                                {appointments.length === 0 ? (
                                    <div className="p-20 md:p-32 text-center text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                        No appointment records are available.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {appointments.map((app, i) => (
                                            <div key={i} className="p-8 md:p-10 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-colors">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm">
                                                        <Users className="w-7 h-7" />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">{app.studentId?.name || app.studentName || app.email}</p>
                                                        <p className="text-[10px] text-brand-primary dark:text-brand-secondary font-bold uppercase tracking-widest italic">{getAppointmentEmail(app)}</p>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{getAppointmentReason(app)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-2">
                                                    <p className="text-base md:text-lg text-slate-900 dark:text-white font-bold">{new Date(app.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                    <div className={app.flaggedForReview ? badgeClass('danger') : badgeClass()}>
                                                        {app.flaggedForReview ? 'Flagged' : 'Not Flagged'}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleAppointmentFlag(app._id, !app.flaggedForReview)}
                                                        disabled={updatingAppointmentId === app._id}
                                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-60 ${app.flaggedForReview
                                                            ? 'border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                                                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                        }`}
                                                    >
                                                        <Flag className="w-4 h-4" />
                                                        {updatingAppointmentId === app._id
                                                            ? 'Updating...'
                                                            : app.flaggedForReview
                                                                ? 'Remove Flag'
                                                                : 'Flag Request'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
