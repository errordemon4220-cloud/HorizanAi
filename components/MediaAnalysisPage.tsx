
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { askAboutImage } from '../services/geminiService';
import { ChatMessage, MessageAuthor } from '../types';
import { CameraIcon, PlayIcon, SendIcon, LoaderIcon, AlertTriangleIcon, PauseIcon, TelescopeIcon } from './icons';

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.author === MessageAuthor.USER;
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            {!isUser && (
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-slate-700 rounded-full">
                    <TelescopeIcon className="w-5 h-5 text-slate-300"/>
                </div>
            )}
            <div className={`max-w-md p-3 rounded-xl shadow-md ${isUser ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-200'}`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
        </div>
    );
};

const MediaAnalysisPage: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'initializing' | 'streaming' | 'paused' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [chatPrompt, setChatPrompt] = useState('');
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const chatViewRef = useRef<HTMLDivElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startStream = useCallback(async () => {
        setStatus('initializing');
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: 'environment' } });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setStatus('streaming');
            }
        } catch (err) {
            // Fallback to user-facing camera
            try {
                const frontStream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: 'user' } });
                streamRef.current = frontStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = frontStream;
                    videoRef.current.play();
                    setStatus('streaming');
                    return;
                }
            } catch (frontErr) {
                setStatus('error');
                setErrorMessage("Could not access any camera. Please check permissions.");
            }
        }
    }, []);
    
    const stopStream = useCallback(() => {
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        setStatus('idle');
    }, []);

    useEffect(() => {
        startStream();
        return () => stopStream();
    }, [startStream, stopStream]);

    useEffect(() => {
        if (chatViewRef.current) {
            chatViewRef.current.scrollTop = chatViewRef.current.scrollHeight;
        }
    }, [chatHistory, isChatLoading]);

    const handleTogglePause = () => {
        if (status === 'streaming') {
            videoRef.current?.pause();
            setStatus('paused');
        } else if (status === 'paused') {
            videoRef.current?.play();
            setStatus('streaming');
        }
    };
    
    const handleSendChat = async () => {
        const prompt = chatPrompt.trim();
        if (!prompt || isChatLoading || (status !== 'streaming' && status !== 'paused')) return;

        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64Frame = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
        if (!base64Frame) return;

        const userMessage: ChatMessage = { id: `user-${Date.now()}`, author: MessageAuthor.USER, content: prompt };
        const newHistory = [...chatHistory, userMessage];
        setChatHistory(newHistory);
        setChatPrompt('');
        setIsChatLoading(true);
        
        try {
            const responseText = await askAboutImage(base64Frame, prompt, newHistory);
            const aiMessage: ChatMessage = { id: `ai-${Date.now()}`, author: MessageAuthor.AI, content: responseText };
            setChatHistory(prev => [...prev, aiMessage]);
        } catch (e) {
            const errorMessage: ChatMessage = { id: `ai-err-${Date.now()}`, author: MessageAuthor.AI, content: "Sorry, I couldn't process that question." };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 bg-slate-900 text-slate-200 overflow-hidden">
            <header className="flex-shrink-0 flex items-center justify-between mb-4 animate-fade-in-up">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-sky-400">Smart Vision</h1>
                 <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold uppercase tracking-widest text-red-500 animate-pulse">● LIVE</span>
                    <button onClick={handleTogglePause} className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full hover:bg-slate-700 transition-colors">
                        {status === 'streaming' ? <PauseIcon className="w-5 h-5"/> : <PlayIcon className="w-5 h-5"/>}
                        {status === 'streaming' ? 'Pause' : 'Resume'}
                    </button>
                </div>
            </header>
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                <div className="lg:col-span-2 relative min-h-0 bg-black rounded-xl border-2 border-slate-700 shadow-2xl animate-fade-in-up" style={{animationDelay: '100ms'}}>
                    <video ref={videoRef} muted className="w-full h-full object-contain transform scale-x-[-1]" />
                    {status === 'initializing' && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><LoaderIcon className="w-12 h-12 text-sky-400 animate-spin"/></div>}
                    {status === 'error' && <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 p-4 text-center"><AlertTriangleIcon className="w-12 h-12 text-red-300 mb-4"/><p className="font-semibold">{errorMessage}</p></div>}
                </div>
                <div className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl min-h-0 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                    <h2 className="p-3 border-b border-slate-700 font-semibold text-lg">Contextual Chat</h2>
                    <div ref={chatViewRef} className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                         {chatHistory.length === 0 && <p className="text-slate-500 text-center text-sm pt-4">Ask a question about what the camera sees.</p>}
                         {chatHistory.map(msg => <ChatBubble key={msg.id} message={msg} />)}
                         {isChatLoading && (
                            <div className="flex items-start gap-3 justify-start animate-fade-in-up">
                                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-slate-700 rounded-full"><TelescopeIcon className="w-5 h-5 text-slate-300"/></div>
                                <div className="max-w-md p-3 rounded-xl bg-slate-800 flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-horizon-accent rounded-full animate-dot-wave" style={{ animationDelay: '-0.4s' }}></div>
                                    <div className="w-2 h-2 bg-horizon-accent rounded-full animate-dot-wave" style={{ animationDelay: '-0.2s' }}></div>
                                    <div className="w-2 h-2 bg-horizon-accent rounded-full animate-dot-wave"></div>
                                </div>
                            </div>
                         )}
                    </div>
                    <div className="p-3 border-t border-slate-700">
                         <div className="relative">
                            <input
                                type="text"
                                value={chatPrompt}
                                onChange={(e) => setChatPrompt(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSendChat(); }}
                                placeholder="e.g., What color is the object on the left?"
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-full py-2 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                disabled={isChatLoading || (status !== 'streaming' && status !== 'paused')}
                            />
                            <button onClick={handleSendChat} disabled={isChatLoading || !chatPrompt.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-sky-500 text-white hover:bg-sky-400 disabled:opacity-50"><SendIcon className="w-4 h-4"/></button>
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MediaAnalysisPage;
