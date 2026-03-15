import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Globe, Bot, Sparkles, Heart, Trash2, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MessageInput from '../components/chat/MessageInput';
import { sendChatMessage } from '../services/api';
import ParticleBackground from '../components/common/ParticleBackground';

const CHATBOT_SESSION_KEY = 'campus_ai_chat_session';
const DEFAULT_MESSAGES = [
    {
        id: 1,
        role: 'bot',
        content: 'Hi! I am CampusAI, your intelligent student support assistant. How can I support your success today?',
    },
];

const getSavedChatSession = () => {
    try {
        const savedSession = localStorage.getItem(CHATBOT_SESSION_KEY);
        return savedSession ? JSON.parse(savedSession) : null;
    } catch {
        return null;
    }
};

const QUICK_ACTIONS = [
    { label: '🎓 Admission Info',     query: 'What are the admission requirements?' },
    { label: '📚 Academic Support',   query: 'Where can I find academic tutoring?' },
    { label: '💰 Fee Details',        query: 'What are the tuition fees?' },
    { label: '🏠 Hostel Information', query: 'What are the hostel facilities?' },
    { label: '💬 Counseling Support', query: 'What mental health resources are available?' },
];

const LANGUAGES = ['English', 'Spanish', 'French', 'Mandarin', 'Hindi', 'Arabic'];

const BOT_MARKDOWN_COMPONENTS = {
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    h1: ({ children }) => <h1 className="text-base font-bold mb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-sm font-bold mb-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-semibold mb-2">{children}</h3>,
    ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-2">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 mb-2">{children}</ol>,
    li: ({ children }) => <li>{children}</li>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
};

const ChatBot = () => {
    const savedSession = getSavedChatSession();
    const location = useLocation();
    const [language, setLanguage] = useState(() => savedSession?.language || 'English');
    const [isStressed, setIsStressed] = useState(() => savedSession?.isStressed || false);
    const [messages, setMessages] = useState(() => savedSession?.messages || DEFAULT_MESSAGES);
    const [isLoading, setIsLoading] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(() => savedSession?.showQuickActions ?? true);
    const messagesEndRef = useRef(null);
    const initialPromptSentRef = useRef(false);

    useEffect(() => {
        localStorage.setItem(
            CHATBOT_SESSION_KEY,
            JSON.stringify({
                language,
                isStressed,
                messages,
                showQuickActions,
            })
        );
    }, [isStressed, language, messages, showQuickActions]);

    useEffect(() => {
        const clearStoredSession = () => {
            localStorage.removeItem(CHATBOT_SESSION_KEY);
        };

        window.addEventListener('beforeunload', clearStoredSession);
        return () => window.removeEventListener('beforeunload', clearStoredSession);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        if (location.state?.initialPrompt && !initialPromptSentRef.current) {
            initialPromptSentRef.current = true;
            handleSendMessage(location.state.initialPrompt);
        }
    }, [location.state]);

    const handleSendMessage = async (content) => {
        if (!content.trim()) return;
        if (showQuickActions) setShowQuickActions(false);
        setMessages(prev => [...prev, { id: Date.now(), role: 'user', content }]);
        setIsLoading(true);
        try {
            const result = await sendChatMessage(content, language);
            const data = result.data;
            if (data.sentiment) {
                if (data.sentiment === 'urgent' || data.sentiment === 'negative') setIsStressed(true);
                else if (data.sentiment === 'positive') setIsStressed(false);
            }
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'bot',
                content: data.aiResponse || 'I had trouble processing that. Please try again.',
            }]);
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Unable to connect to the server. Please ensure the backend is running.';
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'bot',
                content: errorMessage,
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{ id: 1, role: 'bot', content: 'Chat cleared. How else can I help?' }]);
        setIsStressed(false);
        setShowQuickActions(true);
        localStorage.removeItem(CHATBOT_SESSION_KEY);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] pt-24 md:pt-28 pb-6 px-4 md:px-8 gap-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
            <ParticleBackground variant="low" />
            
            {/* ── Left Sidebar ─────────────────── */}
            <div className="hidden lg:flex w-80 flex-col gap-6 relative z-10">
                <div className="card-base p-6 space-y-6 flex-1 flex flex-col bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 dark:bg-brand-secondary/20 flex items-center justify-center border border-brand-primary/20 dark:border-brand-secondary/30">
                            <Bot className="w-6 h-6 text-brand-primary dark:text-brand-secondary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">CampusAI</h3>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live Assistant
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800" />

                    <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Knowledge Access</p>
                            <div className="space-y-2">
                                {QUICK_ACTIONS.map(qa => (
                                    <button
                                        key={qa.label}
                                        onClick={() => handleSendMessage(qa.query)}
                                        className="w-full text-left text-sm font-medium px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-brand-primary/20 dark:hover:border-brand-secondary/30 transition-all hover:shadow-sm"
                                    >
                                        {qa.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {isStressed && (
                        <div className="card-base bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/50 p-5 space-y-4 animate-in fade-in zoom-in">
                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                                <Heart className="w-4 h-4" /> 
                                Support Node Active
                            </div>
                            <p className="text-sm text-rose-800 dark:text-rose-200/80 leading-relaxed font-medium">
                                It looks like you're going through a tough time. Our wellbeing experts are here to help.
                            </p>
                            <button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors">
                                Talk to Counselor
                            </button>
                        </div>
                    )}

                    <button 
                        onClick={clearChat}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-800/50"
                    >
                        <Trash2 className="w-4 h-4" />
                        Reset Session
                    </button>
                </div>
            </div>

            {/* ── Main Chat Room ─────────────────────────────────── */}
            <div className="flex-1 flex flex-col card-base overflow-hidden relative bg-white dark:bg-slate-900 z-10">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex w-10 h-10 rounded-full bg-brand-primary/10 dark:bg-brand-secondary/20 items-center justify-center border border-brand-primary/20 dark:border-brand-secondary/30">
                             <Sparkles className="w-5 h-5 text-brand-primary dark:text-brand-secondary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Smart Assistant</h2>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Online and ready to help</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2">
                            <Globe className="w-4 h-4 text-brand-primary dark:text-brand-secondary" />
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                            >
                                {LANGUAGES.map(l => <option key={l} value={l} className="bg-white dark:bg-slate-800">{l}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scroll-smooth custom-scrollbar bg-slate-50 dark:bg-slate-950/50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {msg.role !== 'user' && (
                                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-brand-primary/10 dark:bg-brand-secondary/20 border border-brand-primary/20 dark:border-brand-secondary/30 text-brand-primary dark:text-brand-secondary">
                                       <Bot className="w-4 h-4" />
                                    </div>
                                )}
                                <div className={`space-y-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                    <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-brand-secondary text-white rounded-tr-sm' 
                                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                                    }`}>
                                        {msg.role === 'bot' ? (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={BOT_MARKDOWN_COMPONENTS}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        ) : (
                                            <p>{msg.content}</p>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 px-1">
                                        {msg.role === 'user' ? 'You' : 'CampusAI'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start animate-in fade-in">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-primary/10 dark:bg-brand-secondary/20 border border-brand-primary/20 dark:border-brand-secondary/30 flex items-center justify-center text-brand-primary dark:text-brand-secondary">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-[48px]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Control */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="max-w-4xl mx-auto flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                             <ShieldCheck className="w-3.5 h-3.5" />
                             End-to-end Encrypted Session
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;
