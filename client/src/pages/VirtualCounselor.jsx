import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, AlertCircle, Bot, User, Activity } from 'lucide-react';
import api from '../services/api';

const VirtualCounselor = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    
    const [chatHistory, setChatHistory] = useState([
        { role: 'bot', text: "Hello. I'm your Virtual AI Counselor. How can I support you today?", videoUrl: null, audioUrl: null }
    ]);

    const recognitionRef = useRef(null);

    // Initialize Web Speech API
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            
            recognitionRef.current.onresult = (event) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setError("Speech recognition failed. Please try again.");
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        } else {
            setError("Your browser completely does not support the Web Speech API. Please try Chrome or Edge.");
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            if (transcript.trim()) {
                handleSendQuestion(transcript);
            }
        } else {
            setError('');
            setTranscript('');
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (err) {
                console.error("Speech API start error", err);
            }
        }
    };

    const handleSendQuestion = async (question) => {
        setTranscript('');
        if (!question.trim()) return;

        // Add user question to chat
        setChatHistory(prev => [...prev, { role: 'user', text: question }]);
        setIsProcessing(true);
        setError('');

        try {
            const res = await api.post('/counselor/ask', { question });
            
            // Add bot response and video URL to chat
            const { text, videoUrl, audioUrl } = res.data.data;
            setChatHistory(prev => [...prev, { role: 'bot', text, videoUrl, audioUrl }]);
            
        } catch (err) {
            console.error("Virtual Counselor error:", err);
            setError("The counselor is currently unavailable. Please try again.");
            setChatHistory(prev => [...prev, { role: 'bot', text: 'Sorry, I am having trouble connecting.' }]);
        } finally {
            setIsProcessing(false);
        }
    };

    // Auto-scroll chat
    const chatEndRef = useRef(null);
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const latestMediaMsg = chatHistory.slice().reverse().find(msg => msg.videoUrl || msg.audioUrl);
    const latestVideoUrl = latestMediaMsg?.videoUrl;
    const latestAudioUrl = latestMediaMsg?.audioUrl;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-64px)]">
            
            {/* Avatar Video Section */}
            <div className="lg:w-1/2 flex flex-col gap-6">
                <div className="glass-card p-6 flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-black/40">
                    <h2 className="absolute top-6 left-6 font-bold text-white font-[Outfit] flex items-center gap-2">
                        <Bot className="w-5 h-5 text-violet-400" /> Virtual Counseling Room
                    </h2>
                    
                    <div className="w-full max-w-sm aspect-square bg-white/5 rounded-3xl border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden mb-8 mt-12 relative group">
                        
                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
                                <Activity className="w-10 h-10 text-violet-400 animate-spin mb-4" />
                                <p className="text-white/80 font-semibold text-sm animate-pulse">Generating Response...</p>
                                <p className="text-white/40 text-[10px] mt-2 max-w-[80%] text-center">Rendering AI Avatar video via SadTalker (approx 10-15s)</p>
                            </div>
                        )}

                        {latestVideoUrl ? (
                            <video 
                                src={latestVideoUrl} 
                                autoPlay 
                                className="w-full h-full object-cover rounded-3xl" 
                                onEnded={(e) => {
                                    // Resetting or doing something else when finished could go here
                                }}
                            />
                        ) : (
                            <>
                                <img 
                                    src="/avatar.png" 
                                    alt="AI Counselor"
                                    className="w-full h-full object-cover rounded-3xl bg-[#1a1a1a]"
                                />
                                {latestAudioUrl && (
                                    <audio src={latestAudioUrl} autoPlay className="hidden" />
                                )}
                            </>
                        )}

                        <div className="absolute inset-0 border-inset border-2 border-white/5 rounded-3xl pointer-events-none" />
                    </div>

                    {/* Microphone Controls */}
                    <div className="w-full max-w-sm">
                        <button 
                            onClick={toggleListening}
                            disabled={isProcessing}
                            className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold transition-all ${
                                isProcessing ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10' :
                                isListening ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.3)]' : 
                                'bg-violet-600 hover:bg-violet-500 text-white shadow-xl hover:shadow-violet-500/25'
                            }`}
                        >
                            {isListening ? (
                                <><Mic className="w-6 h-6" /> Stop Recording</>
                            ) : (
                                <><MicOff className="w-6 h-6" /> Hold to Speak</>
                            )}
                        </button>
                        
                        {transcript && (
                            <div className="mt-4 p-4 rounded-xl bg-white/5 text-white/80 text-sm border border-white/10">
                                <span className="text-white/40 font-semibold mb-1 block text-xs">I heard:</span>
                                "{transcript}"
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat Transcript Section */}
            <div className="lg:w-1/2 glass-card flex flex-col overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-white/5">
                    <h3 className="font-bold text-lg text-white font-[Outfit]">Session Transcript</h3>
                    <p className="text-xs text-white/40">Private and confidential AI counseling log.</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`p-2 rounded-xl shrink-0 h-fit ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gradient-to-br from-violet-500 to-purple-500'}`}>
                                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                            </div>
                            <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                                msg.role === 'user' 
                                    ? 'bg-blue-500/10 border border-blue-500/20 text-blue-100 rounded-tr-sm' 
                                    : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-sm'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isProcessing && (
                         <div className="flex gap-4">
                             <div className="p-2 rounded-xl shrink-0 h-fit bg-gradient-to-br from-violet-500 to-purple-500">
                                 <Bot className="w-5 h-5 text-white" />
                             </div>
                             <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 rounded-tl-sm text-sm italic flex items-center gap-2">
                                 Analyzing your response...
                             </div>
                         </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </div>

        </div>
    );
};

export default VirtualCounselor;
