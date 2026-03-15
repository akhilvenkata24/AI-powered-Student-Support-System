import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, FilePlus, MessageSquare, Activity, UserCheck, ArrowRight, ShieldCheck, Download, Info, GraduationCap, Bot } from 'lucide-react';
import api from '../services/api';
import ParticleBackground from '../components/common/ParticleBackground';

const Admissions = () => {
    const [profile, setProfile] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [studentIdInput, setStudentIdInput] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(false);
    }, []);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!studentIdInput.trim()) return;

        setUploading(true);
        setUploadError('');
        
        try {
            const res = await api.get(`/user/profile/${studentIdInput}`);
            setProfile(res.data.data);
            setIsVerified(true);
        } catch (err) {
            setUploadError(err.response?.data?.error || 'Account not found. Verify your ID.');
        } finally {
            setUploading(false);
        }
    };

    const STATUS_MAP = {
        applied: { label: 'Application Filed', color: 'indigo', icon: Clock },
        under_review: { label: 'Review Pending', color: 'amber', icon: Activity },
        accepted: { label: 'Admission Offered', color: 'emerald', icon: CheckCircle },
        rejected: { label: 'Decision Released', color: 'rose', icon: Info },
    };

    const handleDiscuss = () => {
        if (!profile) return;
        const pendingDocs = (profile.documents || []).filter(d => d.status !== 'received').map(d => d.name);
        let initialPrompt = `Hi, I'm checking my status (ID: ${profile.externalId}). Status: ${profile.admissionStatus.replace('_', ' ')}. `;
        if (pendingDocs.length > 0) initialPrompt += `I need help with these documents: ${pendingDocs.join(', ')}.`;
        navigate('/chat', { state: { initialPrompt } });
    };

    if (isLoading) return (
        <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
        </div>
    );

    const status = STATUS_MAP[profile?.admissionStatus || 'applied'];
    const docs = profile?.documents || [];
    const completedCount = docs.filter(d => d.status === 'received').length;
    const progress = Math.round((completedCount / (docs.length || 1)) * 100);

    return (
        <div className="pt-24 md:pt-32 pb-20 px-4 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
            <ParticleBackground variant="low" />
            <div className="max-w-5xl mx-auto space-y-12 relative z-10">
                
                {/* ── Header ─────────────────────────────────────────── */}
                {!isVerified ? (
                    <div className="text-center space-y-6 animate-in fade-in slide-in-from-top-10 duration-700">
                        <div className="w-20 h-20 bg-brand-primary/10 dark:bg-brand-secondary/20 border border-brand-primary/20 dark:border-brand-secondary/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <ShieldCheck className="w-10 h-10 text-brand-primary dark:text-brand-secondary" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Admissions <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Portal</span>
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto font-medium leading-relaxed">
                            Access secure records and real-time application tracking using your University Credentials.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 card-base p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-brand-primary/10 dark:bg-brand-secondary/20 border border-brand-primary/20 dark:border-brand-secondary/30 rounded-xl flex items-center justify-center">
                                <GraduationCap className="w-7 h-7 text-brand-primary dark:text-brand-secondary" />
                            </div>
                            <div className="space-y-1">
                                <div className={`badge-${status.color} mb-1 inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md`}>
                                    <status.icon className="w-3.5 h-3.5" />
                                    {status.label}
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Hi, {profile.name.split(' ')[0]}
                                </h1>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    Student ID: {profile.externalId}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsVerified(false)} className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                            Logout Portal
                        </button>
                    </div>
                )}

                {/* ── Identity Verification ──────────────────────────── */}
                {!isVerified && (
                    <div className="card-base p-10 md:p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden max-w-2xl mx-auto">
                        <div className="space-y-8 relative z-10">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Secure Access Required</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm px-4">Enter the 9-digit Student ID sent to your registered email address.</p>
                            </div>
                            <form onSubmit={handleVerify} className="space-y-6">
                                <input 
                                    type="text" 
                                    className="input-base text-center text-xl font-bold tracking-[0.2em] placeholder:tracking-normal placeholder:font-medium uppercase" 
                                    placeholder="STUXXXXXX"
                                    value={studentIdInput}
                                    onChange={(e) => setStudentIdInput(e.target.value)}
                                    disabled={uploading}
                                    required
                                />
                                <button 
                                    type="submit"
                                    className="btn-primary w-full group py-4 text-base"
                                    disabled={uploading || !studentIdInput.trim()}
                                >
                                    {uploading ? 'Authenticating...' : 'Access Dashboard'}
                                    {!uploading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </form>
                            {uploadError && (
                                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
                                    {uploadError}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Portal Dashboard ──────────────────────────────── */}
                {isVerified && profile && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
                        
                        {/* Highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Live Status', value: profile.admissionStatus.replace('_', ' '), border: 'bg-emerald-500', icon: Activity },
                                { label: 'Documents', value: `${completedCount} / ${docs.length}`, border: 'bg-brand-primary', icon: FilePlus },
                                { label: 'Deadline', value: 'Jan 15, 2026', border: 'bg-amber-500', icon: Clock }
                            ].map((stat, i) => (
                                <div key={i} className="card-base p-8 text-center space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-primary/30 dark:hover:border-brand-secondary/30 transition-all shadow-sm">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-2">
                                        <stat.icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{stat.value}</p>
                                    <div className={`h-1 w-8 mx-auto rounded-full ${stat.border}`} />
                                </div>
                            ))}
                        </div>

                        {/* Checklist */}
                        <div className="card-base overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50 dark:bg-slate-950/50">
                                <div className="space-y-1 text-center md:text-left">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Fulfillment Center</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">Manage and track your required verification documents.</p>
                                </div>
                                <div className="text-center md:text-right">
                                    <div className="text-4xl font-bold text-brand-primary dark:text-brand-secondary tabular-nums">{progress}%</div>
                                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Progress</div>
                                </div>
                            </div>
                            
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 relative">
                                <div 
                                    className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <div className="p-8 space-y-4">
                                {docs.map((doc, i) => (
                                    <div key={i} className={`flex items-center gap-6 p-6 rounded-2xl border transition-all ${doc.status === 'received' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-brand-primary/20'}`}>
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.status === 'received' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                                            {doc.status === 'received' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-base font-semibold ${doc.status === 'received' ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>{doc.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className={`w-1.5 h-1.5 rounded-full ${doc.status === 'received' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                                    {doc.status === 'received' ? 'Verified' : 'Pending'}
                                                </p>
                                            </div>
                                        </div>
                                        {doc.status !== 'received' && (
                                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-brand-primary dark:hover:border-brand-secondary hover:text-brand-primary dark:hover:text-brand-secondary transition-colors shadow-sm">
                                                Upload <Download className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl shadow-sm flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                        <Bot className="w-6 h-6 text-brand-primary dark:text-brand-secondary" />
                                    </div>
                                    <div className="space-y-0.5 text-center md:text-left">
                                        <p className="text-slate-900 dark:text-white font-bold">Need assistance?</p>
                                        <p className="text-slate-600 dark:text-slate-400 text-xs">Ask AI for documentation requirements.</p>
                                    </div>
                                </div>
                                <button onClick={handleDiscuss} className="btn-primary w-full md:w-auto px-6 py-3 text-sm">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Help Desk AI
                                </button>
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};

export default Admissions;
