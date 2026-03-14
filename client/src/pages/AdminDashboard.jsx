import { useState, useEffect } from 'react';
import { Users, FileText, MessageSquare, Calendar, Activity, AlertCircle, Bot, Plus, X } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StatCard = ({ icon: Icon, label, value, color, glow }) => (
    <div className="glass-card p-5 flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`} style={{ boxShadow: `0 6px 20px ${glow}` }}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-white/40">{label}</p>
            <p className="text-2xl font-black font-[Outfit] text-white">{value}</p>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalQueries: 0, urgentQueries: 0, faqCount: 0, activeUsers: 0 });
    const [queries, setQueries] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'general', tags: '' });
    const [showFaqForm, setShowFaqForm] = useState(false);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const [sR, qR, fR, aR] = await Promise.all([
                    axios.get(`${API_URL}/admin/stats`).catch(() => ({ data: { data: { totalQueries: 0, urgentQueries: 0, faqCount: 0, activeUsers: 0 } } })),
                    axios.get(`${API_URL}/admin/queries`).catch(() => ({ data: { data: [] } })),
                    axios.get(`${API_URL}/admin/faqs`).catch(() => ({ data: { data: [] } })),
                    axios.get(`${API_URL}/admin/appointments`).catch(() => ({ data: { data: [] } })),
                ]);
                setStats(sR.data.data);
                setQueries(qR.data.data);
                setFaqs(fR.data.data);
                setAppointments(aR.data.data);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const handleCreateFaq = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/admin/faqs`, {
                ...newFaq,
                tags: newFaq.tags.split(',').map(t => t.trim()).filter(Boolean)
            });
            setFaqs([res.data.data, ...faqs]);
            setNewFaq({ question: '', answer: '', category: 'general', tags: '' });
            setShowFaqForm(false);
        } catch { alert('Error creating FAQ. Is MongoDB running?'); }
    };

    const tabs = [
        { id: 'overview',      label: 'Overview',    icon: Activity      },
        { id: 'queries',       label: 'Queries',      icon: MessageSquare },
        { id: 'faqs',          label: 'Knowledge',    icon: FileText      },
        { id: 'appointments',  label: 'Appointments', icon: Calendar      },
    ];

    if (isLoading) return (
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
            <Activity className="w-8 h-8 animate-spin text-violet-400" />
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-64px)]">

            {/* Sidebar */}
            <div className="hidden md:flex w-60 flex-col p-5 border-r border-white/10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-white font-[Outfit]">Admin Panel</p>
                        <p className="text-xs text-white/30">CampusAI System</p>
                    </div>
                </div>
                <nav className="space-y-1 flex-1">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setActiveTab(id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === id ? 'nav-pill-active' : 'nav-pill'}`}>
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </nav>
                <div className="mt-auto glass-card p-4 !hover:transform-none">
                    <p className="text-xs text-white/30 mb-1">Connected to</p>
                    <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        MongoDB · Local
                    </p>
                </div>
            </div>

            {/* Mobile Tabs */}
            <div className="md:hidden sticky top-16 z-10 flex overflow-x-auto border-b border-white/10 bg-[#0f0e17]/90 backdrop-blur-xl">
                {tabs.map(({ id, label }) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                        className={`px-4 py-3 whitespace-nowrap text-sm font-medium flex-shrink-0 transition-colors ${activeTab === id ? 'text-violet-400 border-b-2 border-violet-400' : 'text-white/40'}`}>
                        {label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">

                {/* OVERVIEW */}
                {activeTab === 'overview' && (
                    <>
                        <h3 className="text-2xl font-black font-[Outfit] text-white">System Overview</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard icon={MessageSquare} label="Total Queries"    value={stats.totalQueries}  color="from-violet-500 to-indigo-500" glow="rgba(139,92,246,0.4)" />
                            <StatCard icon={AlertCircle}   label="Urgent / Stress" value={stats.urgentQueries} color="from-rose-500 to-pink-500"    glow="rgba(244,63,94,0.4)"  />
                            <StatCard icon={FileText}      label="FAQs in DB"      value={stats.faqCount}      color="from-emerald-500 to-teal-400" glow="rgba(16,185,129,0.4)" />
                            <StatCard icon={Users}         label="Active Students" value={stats.activeUsers}   color="from-blue-500 to-cyan-400"    glow="rgba(59,130,246,0.4)"  />
                        </div>
                        <div className="glass-card p-8 text-center">
                            <Activity className="mx-auto h-10 w-10 text-white/20 mb-3" />
                            <p className="text-white/40">Connect MongoDB to see live interaction stream.</p>
                        </div>
                    </>
                )}

                {/* QUERIES */}
                {activeTab === 'queries' && (
                    <>
                        <h3 className="text-2xl font-black font-[Outfit] text-white">Student AI Queries</h3>
                        <div className="glass-card overflow-hidden">
                            {queries.length === 0 ? (
                                <div className="p-12 text-center text-white/30">No queries yet. Start chatting as a student!</div>
                            ) : (
                                <ul className="divide-y divide-white/5">
                                    {queries.map((q, i) => (
                                        <li key={i} className="p-5 hover:bg-white/3 transition-colors">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                                                    q.sentiment?.label === 'urgent'   ? 'text-rose-300 bg-rose-500/10 border-rose-500/20' :
                                                    q.sentiment?.label === 'negative' ? 'text-orange-300 bg-orange-500/10 border-orange-500/20' :
                                                    'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                                                }`}>
                                                    {q.sentiment?.label || 'neutral'}
                                                </span>
                                                <span className="text-xs text-white/30">{new Date(q.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-white/80 font-medium text-sm">Q: "{q.question}"</p>
                                            <p className="text-white/40 text-sm mt-2 bg-white/3 px-3 py-2 rounded-xl border border-white/8">
                                                <span className="text-violet-400 font-semibold">AI: </span>{q.aiResponse}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}

                {/* FAQS */}
                {activeTab === 'faqs' && (
                    <>
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black font-[Outfit] text-white">Knowledge Base</h3>
                            <button onClick={() => setShowFaqForm(!showFaqForm)} className="btn-primary text-sm gap-2">
                                {showFaqForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                {showFaqForm ? 'Cancel' : 'Add FAQ'}
                            </button>
                        </div>

                        {showFaqForm && (
                            <form onSubmit={handleCreateFaq} className="glass-card p-6 space-y-4">
                                <h4 className="font-bold text-white font-[Outfit]">Add New FAQ</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input required placeholder="Question…" value={newFaq.question} onChange={e => setNewFaq({...newFaq, question: e.target.value})} className="dark-input md:col-span-2" />
                                    <textarea required placeholder="Answer…" rows="3" value={newFaq.answer} onChange={e => setNewFaq({...newFaq, answer: e.target.value})} className="dark-input md:col-span-2 resize-none" />
                                    <select value={newFaq.category} onChange={e => setNewFaq({...newFaq, category: e.target.value})} className="dark-input">
                                        <option value="general">General</option>
                                        <option value="admission">Admissions</option>
                                        <option value="financial">Financial</option>
                                        <option value="academic">Academics</option>
                                        <option value="campus">Campus</option>
                                        <option value="mental_health">Mental Health</option>
                                    </select>
                                    <input placeholder="Tags (comma separated)" value={newFaq.tags} onChange={e => setNewFaq({...newFaq, tags: e.target.value})} className="dark-input" />
                                </div>
                                <button type="submit" className="btn-primary">Save FAQ</button>
                            </form>
                        )}

                        <div className="glass-card overflow-hidden">
                            {faqs.length === 0 ? (
                                <div className="p-12 text-center text-white/30">No FAQs yet. Click "Add FAQ" to start building the knowledge base.</div>
                            ) : (
                                <ul className="divide-y divide-white/5">
                                    {faqs.map((faq, i) => (
                                        <li key={i} className="p-5 hover:bg-white/3 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <h5 className="font-semibold text-white/90 text-sm">{faq.question}</h5>
                                                <span className="ml-4 flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">{faq.category}</span>
                                            </div>
                                            <p className="text-white/40 text-sm">{faq.answer}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}

                {/* APPOINTMENTS */}
                {activeTab === 'appointments' && (
                    <>
                        <h3 className="text-2xl font-black font-[Outfit] text-white">Counseling Appointments</h3>
                        <div className="glass-card overflow-hidden">
                            {appointments.length === 0 ? (
                                <div className="p-12 text-center text-white/30">
                                    <Calendar className="mx-auto h-12 w-12 text-white/10 mb-4" />
                                    No upcoming appointments.
                                </div>
                            ) : (
                                <ul className="divide-y divide-white/5">
                                    {appointments.map((app, i) => (
                                        <li key={i} className="p-5 hover:bg-white/3 transition-colors flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-white">{app.studentId?.name || app.studentName}</p>
                                                <p className="text-xs text-white/40">ID: {app.studentId?.externalId || 'Unknown'} • {app.email}</p>
                                                <p className="text-sm text-violet-300 mt-1">{app.notes || `Reason: ${app.reason}`}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs uppercase tracking-widest text-white/30 mb-1">Date & Time</p>
                                                <p className="text-sm font-medium text-white">{new Date(app.appointmentDate).toLocaleString()}</p>
                                                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 uppercase">
                                                    {app.status || 'Confirmed'}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default AdminDashboard;
