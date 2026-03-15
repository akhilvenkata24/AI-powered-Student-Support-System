import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, MessageSquare, Loader2, ArrowRight, Sparkles, ShieldCheck, Volume2, Play, Trash2 } from 'lucide-react';
import api from '../services/api';
import ParticleBackground from '../components/common/ParticleBackground';

const STUDENT_ID_STORAGE_KEY = 'campus_student_id';
const VIRTUAL_COUNSELOR_SESSION_KEY = 'campus_virtual_counselor_session';
const DEFAULT_CHAT_HISTORY = [
    { role: 'bot', text: 'Hello! I am here to support your mental wellbeing. How are you feeling today?' },
];

const getSavedSession = () => {
    try {
        const savedSession = localStorage.getItem(VIRTUAL_COUNSELOR_SESSION_KEY);
        return savedSession ? JSON.parse(savedSession) : null;
    } catch {
        return null;
    }
};

const VirtualCounselor = () => {
    const savedSession = getSavedSession();
    const [hasEnteredRoom, setHasEnteredRoom] = useState(() => !!savedSession?.hasEnteredRoom);
    const [isDoorOpening, setIsDoorOpening] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [audioBlocked, setAudioBlocked] = useState(false);
    const pendingAudioRef = useRef(null);

    // Identity Verification State
    const [studentIdInput, setStudentIdInput] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState('');
    const [profile, setProfile] = useState(() => savedSession?.profile || null);

    const [chatHistory, setChatHistory] = useState(() => savedSession?.chatHistory || DEFAULT_CHAT_HISTORY);

    const recognitionRef = useRef(null);
    const responseAudioRef = useRef(null);
    const loopVideoRef = useRef(null);
    const chatEndRef = useRef(null);
    const finalTranscriptRef = useRef('');
    const latestTranscriptRef = useRef('');
    const sendQuestionRef = useRef(null);

    useEffect(() => {
        localStorage.setItem(
            VIRTUAL_COUNSELOR_SESSION_KEY,
            JSON.stringify({
                hasEnteredRoom,
                profile,
                chatHistory,
            })
        );
    }, [chatHistory, hasEnteredRoom, profile]);

    useEffect(() => {
        const clearStoredSession = () => {
            localStorage.removeItem(VIRTUAL_COUNSELOR_SESSION_KEY);
        };

        window.addEventListener('beforeunload', clearStoredSession);
        return () => window.removeEventListener('beforeunload', clearStoredSession);
    }, []);

    useEffect(() => {
        if (!isDoorOpening) return;
        const timer = setTimeout(() => {
            setHasEnteredRoom(true);
            setIsDoorOpening(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, [isDoorOpening]);

    const handleVerify = async (e) => {
        e.preventDefault();
        const normalizedId = studentIdInput.trim().toUpperCase();
        if (!normalizedId) return;

        setVerifying(true);
        setVerifyError('');

        try {
            const res = await api.get(`/user/validate/${normalizedId}`);
            setProfile(res.data.data);
            setStudentIdInput(normalizedId);
            localStorage.setItem(STUDENT_ID_STORAGE_KEY, normalizedId);
            setIsDoorOpening(true);
        } catch (err) {
            setVerifyError(err.response?.data?.error || 'Student ID not found. Verification failed.');
        } finally {
            setVerifying(false);
        }
    };

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech recognition not supported.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let finalText = '';
            let interimText = '';
            for (let i = 0; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) finalText += t;
                else interimText += t;
            }
            finalTranscriptRef.current = finalText;
            latestTranscriptRef.current = finalText + interimText;
            setTranscript(finalText + interimText);
        };

        recognition.onend = () => {
            setIsListening(false);
            const text = (finalTranscriptRef.current || latestTranscriptRef.current).trim();
            finalTranscriptRef.current = '';
            latestTranscriptRef.current = '';
            setTranscript('');
            if (text) sendQuestionRef.current?.(text);
        };

        recognitionRef.current = recognition;
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isProcessing]);

    const handleSendQuestion = async (question) => {
        if (!question.trim() || isProcessing) return;
        if (!profile?.externalId) {
            setError('Student verification required.');
            return;
        }

        setChatHistory((prev) => [...prev, { role: 'user', text: question }]);
        setIsProcessing(true);
        setError('');

        try {
            const res = await api.post('/counselor/ask', {
                question,
                studentId: profile.externalId,
            });
            const { text, audioUrl } = res.data.data;
            setChatHistory((prev) => [...prev, { role: 'bot', text }]);

            if (responseAudioRef.current && audioUrl) {
                responseAudioRef.current.src = audioUrl;
                try {
                    await responseAudioRef.current.play();
                    setIsAudioPlaying(true);
                    setAudioBlocked(false);
                } catch (playErr) {
                    pendingAudioRef.current = audioUrl;
                    setAudioBlocked(true);
                }
            }
        } catch (err) {
            const nextError = err.response?.data?.error || 'Assistant temporarily unavailable.';
            setError(nextError);
            setChatHistory((prev) => [...prev, { role: 'bot', text: nextError }]);
        } finally {
            setIsProcessing(false);
        }
    };

    sendQuestionRef.current = handleSendQuestion;

    const handlePlayBlockedAudio = async () => {
        if (!pendingAudioRef.current || !responseAudioRef.current) return;
        responseAudioRef.current.src = pendingAudioRef.current;
        pendingAudioRef.current = null;
        setAudioBlocked(false);
        try {
            await responseAudioRef.current.play();
            setIsAudioPlaying(true);
        } catch (e) {}
    };

    const toggleListening = () => {
        if (isProcessing) return;
        if (isListening) recognitionRef.current?.stop();
        else {
            setError('');
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (err) {
                setError('Could not start microphone.');
            }
        }
    };

    const handleAudioEnded = () => {
        setIsAudioPlaying(false);
        const videoEl = loopVideoRef.current;
        if (!videoEl) return;
        videoEl.pause();
        videoEl.currentTime = 0.1;
    };

    const handleResetSession = () => {
        recognitionRef.current?.stop();
        responseAudioRef.current?.pause();
        if (responseAudioRef.current) {
            responseAudioRef.current.currentTime = 0;
            responseAudioRef.current.src = '';
        }
        pendingAudioRef.current = null;
        setHasEnteredRoom(false);
        setIsDoorOpening(false);
        setIsListening(false);
        setTranscript('');
        setIsProcessing(false);
        setError('');
        setIsAudioPlaying(false);
        setAudioBlocked(false);
        setVerifyError('');
        setProfile(null);
        setChatHistory(DEFAULT_CHAT_HISTORY);
        localStorage.removeItem(VIRTUAL_COUNSELOR_SESSION_KEY);

        const videoEl = loopVideoRef.current;
        if (videoEl) {
            videoEl.pause();
            videoEl.currentTime = 0.1;
        }
    };

    useEffect(() => {
        const videoEl = loopVideoRef.current;
        if (!videoEl) return;
        if (isAudioPlaying) videoEl.play().catch(() => {});
        else videoEl.pause();
    }, [isAudioPlaying]);

    if (!hasEnteredRoom) {
        return (
            <div className="pt-24 md:pt-32 pb-20 px-4 h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
                <ParticleBackground variant="low" />
                <div className="w-full max-w-5xl card-base p-12 md:p-20 text-center relative overflow-hidden min-h-[600px] flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 z-10">
                    
                    {/* Interior Background */}
                    <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-950/50 -z-20" />
                    
                    {/* Left Door */}
                    <div className={`absolute top-0 left-0 w-1/2 h-full bg-slate-50 dark:bg-slate-900 z-20 transition-transform duration-[1200ms] ease-in-out border-r border-slate-200 dark:border-slate-800 flex items-center justify-end pr-8 md:pr-48 ${isDoorOpening ? '-translate-x-full shadow-2xl' : ''}`}>
                         <div className="w-1 md:w-1.5 h-24 md:h-32 bg-slate-200 dark:bg-slate-700 rounded-full shadow-inner" />
                    </div>

                    {/* Right Door */}
                    <div className={`absolute top-0 right-0 w-1/2 h-full bg-slate-50 dark:bg-slate-900 z-20 transition-transform duration-[1200ms] ease-in-out border-l border-slate-200 dark:border-slate-800 flex items-center justify-start pl-8 md:pl-48 ${isDoorOpening ? 'translate-x-full shadow-2xl' : ''}`}>
                         <div className="w-1 md:w-1.5 h-24 md:h-32 bg-slate-200 dark:bg-slate-700 rounded-full shadow-inner" />
                    </div>

                    {/* Entry Content */}
                    <div className={`space-y-12 relative z-30 transition-all duration-1000 flex flex-col items-center ${isDoorOpening ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                        <div className="w-20 h-20 bg-brand-primary/10 dark:bg-brand-secondary/20 border border-brand-primary/20 dark:border-brand-secondary/30 rounded-2xl flex items-center justify-center mx-auto mb-4 relative shadow-sm">
                            <ShieldCheck className="w-10 h-10 text-brand-primary dark:text-brand-secondary" />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                                Virtual <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Counseling</span>
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-sm mx-auto font-medium leading-relaxed">
                                Step into a private, AI-powered space dedicated to your mental clarity.
                            </p>
                        </div>
                        <div className="pt-2 w-full">
                            <form onSubmit={handleVerify} autoComplete="off" className="w-full max-w-xs mx-auto space-y-4">
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="w-full input-base text-center text-lg font-bold tracking-widest placeholder:tracking-normal placeholder:font-medium uppercase pl-4 pr-12 shadow-sm" 
                                        placeholder="STUXXXXXX"
                                        name="virtual-counselor-student-id"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="characters"
                                        spellCheck={false}
                                        value={studentIdInput}
                                        onChange={(e) => {
                                            setStudentIdInput(e.target.value.toUpperCase());
                                            if (verifyError) setVerifyError('');
                                        }}
                                        disabled={verifying}
                                        required
                                    />
                                    <button 
                                        type="submit"
                                        disabled={verifying || !studentIdInput.trim()}
                                        className="absolute right-1.5 top-1/2 h-10 w-10 -translate-y-1/2 bg-brand-primary hover:bg-brand-hover text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                                    >
                                        {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                    </button>
                                </div>
                                {verifyError && (
                                    <div className="p-3 justify-center flex rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                                        {verifyError}
                                    </div>
                                )}
                            </form>
                        </div>
                        <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-4">
                            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure</span>
                            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-brand-primary dark:text-brand-secondary" /> Private</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 md:pt-28 pb-6 px-4 md:px-8 h-[calc(100vh-64px)] flex flex-col lg:flex-row gap-6 bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
            
            {/* Main Visual Node */}
            <div className="flex-1 flex flex-col gap-6 relative rounded-2xl md:rounded-[2rem] overflow-hidden bg-slate-900 dark:bg-black shadow-lg border border-slate-200 dark:border-slate-800">
                <video
                    ref={loopVideoRef}
                    src="/counselor-loop.mp4"
                    muted
                    playsInline
                    loop
                    className="w-full h-full object-cover opacity-90"
                />
                <audio ref={responseAudioRef} onEnded={handleAudioEnded} className="hidden" />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none opacity-80" />
                
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none z-10">
                    <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        Encrypted
                    </div>
                    <div className="flex gap-2">
                        {isProcessing && <div className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 animate-pulse text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg">Processing...</div>}
                        {isListening && <div className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 animate-pulse text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1.5"><Mic className="w-3 h-3" /> Listening</div>}
                    </div>
                </div>

                {audioBlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-md z-40">
                         <button onClick={handlePlayBlockedAudio} className="btn-primary flex items-center gap-3 shadow-xl">
                            <Play className="w-5 h-5 fill-current" /> Enable Voice Stream
                         </button>
                    </div>
                )}

                <div className="absolute bottom-28 left-8 right-8 text-center z-10 pointer-events-none">
                    {transcript && (
                        <div className="inline-block px-6 py-3 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white font-medium text-lg max-w-2xl shadow-lg animate-in zoom-in">
                            {transcript}
                        </div>
                    )}
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
                    <button 
                        onClick={toggleListening}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${isListening ? 'bg-rose-600 hover:bg-rose-700 ring-4 ring-rose-600/20 text-white' : 'bg-brand-primary hover:bg-brand-hover ring-4 ring-brand-primary/20 text-white'}`}
                    >
                        {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Transcription & Controls Sidebar */}
            <div className="w-full lg:w-[400px] flex flex-col gap-4">
                <div className="card-base flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-brand-primary/10 dark:bg-brand-secondary/20 border border-brand-primary/20 dark:border-brand-secondary/30 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-brand-primary dark:text-brand-secondary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Transcript</h3>
                                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Session Log</p>
                            </div>
                        </div>
                        <Volume2 className={`w-5 h-5 ${isAudioPlaying ? 'text-brand-primary dark:text-brand-secondary animate-pulse' : 'text-slate-400 dark:text-slate-600'}`} />
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/30">
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-brand-secondary text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm'}`}>
                                    {msg.text}
                                </div>
                                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1 px-1">
                                    {msg.role === 'user' ? 'You' : 'Counselor'}
                                </p>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Encrypted Node</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Audio and logs are private.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button 
                        onClick={() => setHasEnteredRoom(false)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 py-4 rounded-xl font-semibold shadow-sm transition-colors"
                    >
                        End Session
                    </button>
                    <button 
                        onClick={handleResetSession}
                        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 py-4 rounded-xl font-semibold shadow-sm transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Reset Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VirtualCounselor;
