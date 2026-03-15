import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Command } from "lucide-react";

const MessageInput = ({ onSendMessage, isLoading }) => {
    const [message, setMessage] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(true);
    const textareaRef = useRef(null);
    const recognitionRef = useRef(null);
    const dictationBaseRef = useRef("");

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSpeechSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
            let finalText = "";
            let interimText = "";

            for (let i = 0; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) finalText += transcript;
                else interimText += transcript;
            }

            const merged = `${finalText} ${interimText}`.replace(/\s+/g, " ").trim();
            const base = dictationBaseRef.current.trim();
            if (!merged) {
                setMessage(base);
                return;
            }

            setMessage(base ? `${base} ${merged}` : merged);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, []);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [message]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !isLoading) {
            onSendMessage(message);
            setMessage("");
            dictationBaseRef.current = "";
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const toggleListening = () => {
        if (!speechSupported || isLoading) return;
        if (isListening) {
            recognitionRef.current?.stop();
            return;
        }

        try {
            dictationBaseRef.current = message.trim();
            recognitionRef.current?.start();
            setIsListening(true);
        } catch {
            setIsListening(false);
        }
    };

    return (
        <form 
            onSubmit={handleSubmit} 
            className="relative flex items-end gap-3 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full transition-all focus-within:border-brand-primary/50 focus-within:ring-4 focus-within:ring-brand-primary/10 shadow-sm"
        >
            <button
                type="button"
                onClick={toggleListening}
                disabled={!speechSupported || isLoading}
                className={`flex items-center justify-center w-11 h-11 rounded-full border transition-all ml-1 ${
                    isListening
                        ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/30 dark:border-rose-800/50 dark:text-rose-400"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-secondary"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={speechSupported ? "Speech to text" : "Speech recognition not supported"}
            >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <div className="flex-1 min-h-[50px] flex items-center px-4">
                <textarea
                    ref={textareaRef}
                    rows="1"
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                        if (!isListening) {
                            dictationBaseRef.current = e.target.value;
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your question here..."
                    className="w-full bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 py-3 resize-none max-h-40 font-medium text-sm scrollbar-hide outline-none"
                    disabled={isLoading}
                />
            </div>

            <div className="flex items-center gap-2 p-1.5 translate-x-1">
                <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border border-transparent">
                    <Command className="w-3 h-3" /> enter to send
                </div>
                <button
                    type="submit"
                    disabled={!message.trim() || isLoading}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 shadow-sm ${
                        message.trim() && !isLoading 
                        ? "bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white scale-100 shadow-brand-primary/20 hover:shadow-md" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 scale-95 shadow-none"
                    }`}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Send className="w-5 h-5 translate-x-0.5 -translate-y-0.5" />
                    )}
                </button>
            </div>
        </form>
    );
};

export default MessageInput;
