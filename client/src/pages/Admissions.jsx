import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, FilePlus, MessageSquare, Activity } from 'lucide-react';
import api, { getStudentProfile } from '../services/api';

const Admissions = () => {
    const [profile, setProfile] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    useEffect(() => {
        console.log("Admissions Portal Mounted. Profile verified:", isVerified);
        setIsLoading(false);
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadError('');
        
        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const content = event.target.result;
                try {
                    const res = await api.post('/user/verify-document', { content });
                    console.log("Verification success:", res.data.data.externalId);
                    setProfile(res.data.data);
                    setIsVerified(true);
                } catch (err) {
                    setUploadError(err.response?.data?.error || 'Verification failed');
                } finally {
                    setUploading(false);
                }
            };
            reader.readAsText(file);
        } catch (err) {
            setUploadError('Failed to read file');
            setUploading(false);
        }
    };

    const STATUS_MAP = {
        applied: { label: 'Application Submitted', color: 'blue' },
        under_review: { label: 'Application Under Review', color: 'yellow' },
        accepted: { label: 'Accepted!', color: 'emerald' },
        rejected: { label: 'Decision Released', color: 'rose' },
    };

    if (isLoading) return (
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
            <Activity className="w-8 h-8 animate-spin text-blue-400" />
        </div>
    );

    const status = STATUS_MAP[profile?.admissionStatus || 'applied'];
    const docs = profile?.documents || [];
    const completedCount = docs.filter(d => d.status === 'received').length;

    return (
        <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="float-anim absolute -top-20 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl" />
                <div className="float-anim-delay absolute bottom-0 left-10 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-8">
                
                {/* Initial Instruction (Shown when no profile is verified) */}
                {!isVerified && (
                    <div className="text-center space-y-4 py-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 bg-blue-500/10 border border-blue-500/20 shadow-2xl">
                            <FilePlus className="w-10 h-10 text-blue-400" />
                        </div>
                        <h1 className="text-5xl font-black font-[Outfit] text-white tracking-tight">Admissions Portal</h1>
                        <p className="text-white/40 max-w-lg mx-auto leading-relaxed">
                            To track your application progress, please verify your identity by uploading your 
                            <span className="text-blue-400 font-semibold px-1">Official Application Summary</span> document.
                        </p>
                    </div>
                )}

                {/* Upload Section (Always visible or prominent when no profile) */}
                <div className={`glass-card p-8 border-dashed border-2 transition-all text-center ${!isVerified ? 'border-blue-500/40 bg-blue-500/5' : 'border-white/10 opacity-60 hover:opacity-100'}`}>
                    <h3 className="font-bold text-white mb-2 font-[Outfit]">Verify Application Status</h3>
                    <p className="text-white/40 text-sm mb-6 max-w-md mx-auto">Upload your .txt application summary from the university to unlock your live tracking dashboard.</p>
                    <div className="flex flex-col items-center gap-3">
                        <label className="btn-primary cursor-pointer gap-2 px-8 py-3 rounded-2xl shadow-xl hover:shadow-blue-500/20">
                            <FilePlus className="w-5 h-5" />
                            {uploading ? 'Verifying Student ID...' : 'Upload Summary Document'}
                            <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                        </label>
                        {uploadError && (
                            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
                                ⚠️ {uploadError}
                            </div>
                        )}
                    </div>
                </div>

                {isVerified && profile && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
                        {/* Status Card */}
                        <div className="glass-card p-10 border-l-8 border-blue-600 shadow-[0_20px_50px_rgba(37,99,235,0.15)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Activity className="w-40 h-40" />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-${status.color}-300 bg-${status.color}-500/10 border border-${status.color}-500/20 mb-6`}>
                                        <Clock className="w-4 h-4" /> {status.label}
                                    </div>
                                    <h2 className="text-4xl font-black font-[Outfit] text-white">Student Dashboard</h2>
                                    <p className="text-white/50 mt-3 text-lg">
                                        Welcome, <span className="text-blue-400 font-black">{profile.name}</span>
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                                        Verified Identity · <span className="text-blue-500/50">{profile.externalId}</span>
                                    </div>
                                </div>
                                <div className="hidden lg:block">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Decision Status</p>
                                        <p className={`text-2xl font-black font-[Outfit] text-${status.color}-400`}>{profile.admissionStatus.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { label: 'Deadline', val: 'Jan 15', sub: 'Priority Admission' },
                                { label: 'Progress', val: `${Math.round((completedCount/docs.length)*100)}%`, sub: 'Files Received' },
                                { label: 'Decision', val: 'Mar 31', sub: 'Final Notification' }
                            ].map((s, i) => (
                                <div key={i} className="glass-card p-6 text-center border-b-4 border-blue-500/20 hover:border-blue-500 transition-colors">
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">{s.label}</p>
                                    <p className="text-3xl font-black font-[Outfit] text-white">{s.val}</p>
                                    <p className="text-[10px] font-medium text-blue-400/60 mt-2 uppercase">{s.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* Checklist */}
                        <div className="glass-card overflow-hidden shadow-2xl">
                            <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                                <div>
                                    <h3 className="font-black text-white text-xl font-[Outfit]">Documentation Checklist</h3>
                                    <p className="text-white/30 text-xs mt-1">Official University Document Verification Status</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-tighter">
                                        {completedCount} of {docs.length} Filed
                                    </span>
                                </div>
                            </div>

                            <div className="px-8 py-5">
                                <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
                                    <div className="h-full rounded-full transition-all duration-1000 ease-out" 
                                        style={{ width: `${(completedCount / (docs.length || 1)) * 100}%`, background: 'linear-gradient(90deg,#2563eb,#9333ea)' }} />
                                </div>
                            </div>

                            <ul className="px-8 pb-8 space-y-4">
                                {docs.map((doc, i) => (
                                    <li key={i} className={`flex items-center gap-5 p-4 rounded-2xl transition-all group ${doc.status === 'received' ? 'bg-emerald-500/[0.03] border border-emerald-500/10' : 'bg-white/[0.02] border border-white/5 opacity-50'}`}>
                                        <div className={`p-2 rounded-xl ${doc.status === 'received' ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-white/5 text-white/20'}`}>
                                            {doc.status === 'received' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1">
                                            <span className={`text-sm font-bold tracking-tight ${doc.status === 'received' ? 'text-white' : 'text-white/40'}`}>{doc.name}</span>
                                            <p className="text-[10px] text-white/20 uppercase font-black mt-0.5">{doc.status === 'received' ? 'Verification Complete' : 'Awaiting Submission'}</p>
                                        </div>
                                        {doc.status === 'received' ? (
                                            <div className="text-emerald-400/60 font-black text-[10px] uppercase tracking-widest hidden sm:block">Verified ✓</div>
                                        ) : (
                                            <button className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest hover:text-blue-400 transition-colors">Upload Now →</button>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            <div className="px-8 py-6 bg-white/[0.01] border-t border-white/5 flex flex-col sm:flex-row items-center gap-4">
                                <Link to="/chat" className="w-full sm:w-auto btn-primary text-xs gap-2 px-6">
                                    <MessageSquare className="w-4 h-4" /> Discuss with Admission AI
                                </Link>
                                <p className="text-[10px] text-white/20 font-medium italic">Missing a document? The AI can help explain alternative proof requirements.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admissions;
