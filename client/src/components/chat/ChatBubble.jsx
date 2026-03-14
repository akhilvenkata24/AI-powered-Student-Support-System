import { Bot, User } from 'lucide-react';

const ChatBubble = ({ message }) => {
    const isBot = message.role === 'bot';

    // Simple inline markdown: **bold** and *italic*
    const renderContent = (text) => {
        const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={i}>{part.slice(1, -1)}</em>;
            }
            return part;
        });
    };

    return (
        <div className={`flex items-end gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 p-2 rounded-xl ${
                isBot 
                    ? 'bg-gradient-to-br from-violet-500 to-indigo-600'
                    : 'bg-gradient-to-br from-blue-500 to-cyan-400'
            }`} style={{ boxShadow: isBot ? '0 4px 15px rgba(139,92,246,0.4)' : '0 4px 15px rgba(59,130,246,0.4)' }}>
                {isBot ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
            </div>

            {/* Bubble */}
            <div
                className={`max-w-[75%] px-5 py-3.5 text-sm leading-relaxed ${
                    isBot
                        ? 'glass-card !rounded-2xl !rounded-bl-sm text-white/85'
                        : 'rounded-2xl rounded-br-sm text-white'
                }`}
                style={!isBot ? {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 20px rgba(102,126,234,0.3)',
                } : {}}
            >
                {renderContent(message.content)}
            </div>
        </div>
    );
};

export default ChatBubble;
