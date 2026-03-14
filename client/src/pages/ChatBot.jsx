import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Globe, Bot, Sparkles, Heart } from 'lucide-react';
import ChatBubble from '../components/chat/ChatBubble';
import MessageInput from '../components/chat/MessageInput';
import { sendChatMessage } from '../services/api';

const QUICK_ACTIONS = [
    { label: '🎓 Admission Info',      query: 'What are the admission requirements?' },
    { label: '📚 Academic Support',    query: 'Where can I find academic tutoring?' },
    { label: '💰 Fee Details',         query: 'What are the tuition fees?' },
    { label: '🏠 Hostel Information',  query: 'What are the hostel facilities?' },
    { label: '💬 Counseling Support',  query: 'What mental health resources are available?' },
];

const LANGUAGES = ['English', 'Spanish', 'French', 'Mandarin', 'Hindi', 'Arabic'];

const ChatBot = () => {
    const location = useLocation();
    const [language, setLanguage] = useState('English');
    const [sentiment, setSentiment] = useState(null);
    const [isStressed, setIsStressed] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'bot',
            content: "Hi! I'm **CampusAI**, your intelligent student support assistant. I can help you with admissions, financial aid, campus life, and much more. How can I support you today?",
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(true);
    const messagesEndRef = useRef(null);
    const initialPromptSentRef = useRef(false);

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
            const data = result.data; // Standardized { success, data }
            
            // Update sentiment status
            if (data.sentiment) {
                setSentiment(data.sentiment);
                if (data.sentiment === 'urgent' || data.sentiment === 'negative') {
                    setIsStressed(true);
                } else if (data.sentiment === 'positive') {
                    setIsStressed(false);
                }
            }

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'bot',
                content: data.aiResponse || 'I had trouble processing that. Please try again.',
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'bot',
                content: '⚠️ Unable to connect to the server. Please ensure the backend is running on port 5000.',
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)]" style={{ background: 'transparent' }}>

            {/* Sidebar Info */}
            <div className="hidden lg:flex w-64 flex-col p-6 border-r border-white/10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 glow-purple">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-white">CampusAI</h3>
                        <p className="text-xs text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Online
                        </p>
                    </div>
                </div>

                <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">Quick Actions</p>
                <div className="space-y-2">
                    {QUICK_ACTIONS.map(qa => (
                        <button
                            key={qa.label}
                            onClick={() => handleSendMessage(qa.query)}
                            className="w-full text-left text-sm px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/8 transition-all duration-200 border border-transparent hover:border-white/10"
                        >
                            {qa.label}
                        </button>
                    ))}
                </div>

                {isStressed && (
                    <div className="mt-auto glass-card p-4 border-rose-500/30 bg-rose-500/5 animate-pulse">
                        <p className="text-[10px] font-bold uppercase text-rose-400 mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Stress Detected
                        </p>
                        <p className="text-xs text-white/50 leading-tight">I've noticed you might be feeling overwhelmed. Need to talk to someone?</p>
                    </div>
                )}
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 overflow-hidden">

                {/* Chat Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 backdrop-blur-2xl bg-white/3">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="font-bold text-white tracking-tight flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-violet-400" />
                                AI Student Support
                            </h2>
                            <p className="text-xs text-white/40 mt-0.5">
                                {isStressed ? 'Focusing on support...' : 'Responses powered by OpenAI'}
                            </p>
                        </div>
                        {isStressed && (
                            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-black uppercase text-rose-400 tracking-wider">
                                <Heart className="w-3 h-3" /> High Support Priority
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                            <Globe className="w-4 h-4 text-violet-400" />
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-transparent text-sm text-white/80 outline-none cursor-pointer"
                            >
                                {LANGUAGES.map(l => <option key={l} value={l} className="bg-[#1a1a2e] text-white">{l}</option>)}
                            </select>
                        </div>
                        <button className="text-white/40 hover:text-white/70 transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                    {messages.map((msg) => (
                        <ChatBubble key={msg.id} message={msg} />
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                        <div className="flex items-end gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="glass-card px-5 py-4 !rounded-2xl !rounded-bl-sm flex items-center gap-2">
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                            </div>
                        </div>
                    )}

                    {/* Mobile quick actions */}
                    {showQuickActions && (
                        <div className="lg:hidden flex flex-wrap gap-2 pt-2">
                            {QUICK_ACTIONS.map(qa => (
                                <button
                                    key={qa.label}
                                    onClick={() => handleSendMessage(qa.query)}
                                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    {qa.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                    <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
};

export default ChatBot;
