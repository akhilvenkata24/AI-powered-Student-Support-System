import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Languages, Mic, Command } from "lucide-react";

const MessageInput = ({ onSendMessage, isLoading }) => {
    const [message, setMessage] = useState("");
    const textareaRef = useRef(null);

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
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form 
            onSubmit={handleSubmit} 
            className="relative flex items-end gap-3 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full transition-all focus-within:border-brand-primary/50 focus-within:ring-4 focus-within:ring-brand-primary/10 shadow-sm"
        >
            <div className="flex-1 min-h-[50px] flex items-center px-4">
                <textarea
                    ref={textareaRef}
                    rows="1"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your question here..."
                    className="w-full bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 py-3 resize-none max-h-40 font-medium text-sm scrollbar-hide outline-none"
                    disabled={isLoading}
                />
            </div>

            <div className="flex items-center gap-2 p-1.5 translate-x-1">
                <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border border-transparent">
                    <Command className="w-3 h-3" /> return to send
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
