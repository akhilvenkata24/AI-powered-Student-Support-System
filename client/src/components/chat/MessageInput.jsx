import { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';

const MessageInput = ({ onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SR();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.onresult = (e) => {
                const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
                setInput(transcript);
            };
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    const handleSend = () => {
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
            if (isListening) {
                recognitionRef.current?.stop();
                setIsListening(false);
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleVoice = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        const ta = textareaRef.current;
        if (ta) {
            ta.style.height = 'auto';
            ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
        }
    }, [input]);

    return (
        <div className={`flex items-end gap-3 p-3 rounded-2xl border transition-all duration-300 ${
            isListening
                ? 'border-rose-500/50 bg-rose-500/5 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                : 'border-white/10 bg-white/5'
        }`}>
            {/* Voice Button */}
            <button
                onClick={toggleVoice}
                className={`flex-shrink-0 p-2.5 rounded-xl transition-all duration-300 ${
                    isListening
                        ? 'bg-rose-500 text-white animate-pulse-glow'
                        : 'text-white/40 hover:text-white hover:bg-white/10'
                }`}
            >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? '🎙 Listening…' : 'Ask anything about campus…'}
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-white/30 outline-none resize-none text-sm leading-relaxed max-h-28 py-1.5"
            />

            {/* Send Button */}
            <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 p-2.5 rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                    background: input.trim() && !isLoading ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'rgba(255,255,255,0.08)',
                    boxShadow: input.trim() && !isLoading ? '0 4px 15px rgba(102,126,234,0.5)' : 'none',
                }}
            >
                {isLoading
                    ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                    : <Send className="w-5 h-5 text-white" />
                }
            </button>
        </div>
    );
};

export default MessageInput;
