

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AIGirlfriendProfile, ChatMessage, UserProfile, MessageAuthor, GeneratedImage } from '../types';
import { HeartIcon, ChevronLeftIcon, ImageIcon, XIcon, ChevronRightIcon } from './icons';

// Reusable Avatar Component
const GirlfriendAvatar: React.FC<{ avatar: string; name: string; className?: string }> = ({ avatar, name, className = 'w-10 h-10' }) => {
    const isUrl = avatar?.startsWith('http') || avatar?.startsWith('data:');
    if (isUrl) return <img src={avatar} alt={name} className={`${className} flex-shrink-0 rounded-full object-cover`} />;
    const isEmoji = avatar && /\p{Emoji}/u.test(avatar);
    if (isEmoji) return <div className={`${className} flex-shrink-0 flex items-center justify-center rounded-full bg-rose-400/20`}><span className={className.includes('w-10') ? 'text-2xl' : 'text-lg'}>{avatar}</span></div>;
    return <div className={`${className} flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white font-bold`}><span className={className.includes('w-10') ? 'text-xl' : 'text-md'}>{(name?.charAt(0) || 'G').toUpperCase()}</span></div>;
};

// Reusable Message Content Component
const MessageContent: React.FC<{ message: ChatMessage }> = ({ message }) => (
    <>
        {message.imageFile && (
            <img src={message.imageFile.data} alt="AI generated content" className="rounded-lg max-w-xs md:max-w-sm max-h-80 object-contain bg-slate-900 mb-2"/>
        )}
        {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
    </>
);

// Chat Message Component with conditional styling
const ChatBubble: React.FC<{ message: ChatMessage; isUser: boolean; is18PlusMode: boolean; }> = ({ message, isUser, is18PlusMode }) => {
    if (isUser) {
        const userBubbleClass = is18PlusMode ? 'bg-[var(--gf-user-bubble-bg)] text-rose-100' : 'bg-horizon-accent text-white';
        return (
            <div className={`max-w-md p-4 rounded-2xl shadow-md ${userBubbleClass}`}>
                <MessageContent message={message} />
            </div>
        );
    }

    // AI Message
    if (is18PlusMode) {
        const aiBubbleClass = 'bg-[var(--gf-ai-bubble-bg)] text-rose-200';
        return (
            <div className={`max-w-md p-4 rounded-2xl shadow-md ${aiBubbleClass}`}>
                <MessageContent message={message} />
            </div>
        );
    }
    
    // AI Message - Non 18+
    return (
        <div className="max-w-md">
            <div className="message-glass-wrapper rounded-xl rounded-bl-none">
                <div className="message-glass-effect"></div>
                <div className="message-glass-tint bg-white/10 dark:bg-black/20"></div>
                <div className="message-glass-shine"></div>
                <div className="message-glass-content p-4 text-slate-200">
                    <MessageContent message={message} />
                </div>
            </div>
        </div>
    );
};

const LightboxViewer: React.FC<{
    images: GeneratedImage[];
    startIndex: number;
    onClose: () => void;
}> = ({ images, startIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, onClose]);

    const currentImage = images[currentIndex];
    if (!currentImage) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 ui-blur-effect flex flex-col items-center justify-center animate-fade-in-up" onClick={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-10"><XIcon className="w-8 h-8" /></button>
            <div className="relative w-full h-full flex items-center justify-center p-4 md:p-16">
                <button onClick={handlePrev} className="absolute left-4 text-white/70 hover:text-white p-2 bg-black/20 rounded-full hidden md:block"><ChevronLeftIcon className="w-8 h-8" /></button>
                <div className="max-w-full max-h-full flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
                    <img src={currentImage.url} alt={currentImage.prompt} className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl" />
                </div>
                <button onClick={handleNext} className="absolute right-4 text-white/70 hover:text-white p-2 bg-black/20 rounded-full hidden md:block"><ChevronRightIcon className="w-8 h-8" /></button>
            </div>
        </div>
    );
};


// Main Chat Page Component
interface AIGirlfriendChatPageProps {
    girlfriend: AIGirlfriendProfile;
    onSendMessage: (prompt: string) => void;
    isLoading: boolean;
    userProfile: UserProfile | null;
    onBack: () => void;
}

const AIGirlfriendChatPage: React.FC<AIGirlfriendChatPageProps> = ({ girlfriend, onSendMessage, isLoading, userProfile, onBack }) => {
    const [prompt, setPrompt] = useState('');
    const chatViewRef = useRef<HTMLDivElement>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    useEffect(() => {
        if (chatViewRef.current) {
            chatViewRef.current.scrollTop = chatViewRef.current.scrollHeight;
        }
    }, [girlfriend.chatHistory, isLoading]);

    const handleSend = () => {
        if (prompt.trim() && !isLoading) {
            onSendMessage(prompt.trim());
            setPrompt('');
        }
    };
    
    const themeClass = girlfriend.is18PlusMode ? 'aigf-18-plus-theme' : '';

    return (
        <div className={`flex-1 flex flex-col relative overflow-y-auto custom-scrollbar ${themeClass}`}>
            {lightboxIndex !== null && <LightboxViewer images={girlfriend.gallery} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />}
            {/* Header */}
            <header className={`header flex-shrink-0 h-20 flex items-center justify-between px-6 border-b z-10 ${girlfriend.is18PlusMode ? 'bg-slate-900/50 backdrop-blur-md' : 'ui-blur-effect border-horizon-item'}`} 
                style={girlfriend.is18PlusMode ? { backgroundColor: 'var(--gf-header-bg)', borderColor: 'var(--gf-header-border)' } : {}}>
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10"><ChevronLeftIcon className="w-6 h-6"/></button>
                    <GirlfriendAvatar avatar={girlfriend.avatar} name={girlfriend.name} />
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                           {girlfriend.name}
                           <span className="text-xs font-semibold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">{girlfriend.personality}</span>
                        </h1>
                        <p className="text-sm text-pink-300 flex items-center gap-1.5"><HeartIcon className="w-3 h-3"/> {girlfriend.relationshipStatus}</p>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex min-h-0">
                {/* Chat View */}
                <main className="flex-1 flex flex-col">
                    <div ref={chatViewRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {girlfriend.chatHistory.map(msg => (
                            <div key={msg.id} className={`flex items-start gap-3 ${msg.author === MessageAuthor.USER ? 'justify-end' : ''}`}>
                                {msg.author !== MessageAuthor.USER && <GirlfriendAvatar avatar={girlfriend.avatar} name={girlfriend.name} />}
                                <div className={`${msg.author === MessageAuthor.USER ? 'ml-auto' : ''}`}>
                                  <ChatBubble message={msg} isUser={msg.author === MessageAuthor.USER} is18PlusMode={girlfriend.is18PlusMode} />
                                </div>
                                {msg.author === MessageAuthor.USER && <img src={userProfile?.avatarUrl || ''} alt="User" className="w-10 h-10 rounded-full" />}
                            </div>
                        ))}
                        {isLoading && girlfriend.chatHistory[girlfriend.chatHistory.length - 1]?.author === MessageAuthor.USER && (
                             <div className="flex items-start gap-3">
                                <GirlfriendAvatar avatar={girlfriend.avatar} name={girlfriend.name} />
                                <div className={`p-4 rounded-2xl flex items-center space-x-2 ${girlfriend.is18PlusMode ? 'bg-[var(--gf-ai-bubble-bg)]' : 'bg-slate-800'}`}>
                                    <div className="w-2 h-2 bg-rose-300 rounded-full animate-dot-wave" style={{ animationDelay: '-0.4s' }}></div>
                                    <div className="w-2 h-2 bg-rose-300 rounded-full animate-dot-wave" style={{ animationDelay: '-0.2s' }}></div>
                                    <div className="w-2 h-2 bg-rose-300 rounded-full animate-dot-wave"></div>
                                </div>
                             </div>
                        )}
                    </div>
                    {/* Prompt Input */}
                    <div className="prompt-input p-4 border-t" style={girlfriend.is18PlusMode ? { backgroundColor: 'var(--gf-prompt-bg)', borderColor: 'var(--gf-prompt-border)' } : { borderColor: 'var(--horizon-item, #2a3532)'}}>
                        <div className="relative">
                            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => {if(e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); handleSend();}}} placeholder={`Message ${girlfriend.name}...`} rows={1} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 pr-14 resize-none focus:outline-none focus:ring-1 focus:ring-rose-500" 
                                style={girlfriend.is18PlusMode ? { backgroundColor: 'var(--gf-prompt-bg)', borderColor: 'var(--gf-prompt-border)' } : { backgroundColor: 'var(--horizon-sidebar, #1d2321)', borderColor: 'var(--horizon-item, #2a3532)' }}/>
                            <button onClick={handleSend} disabled={isLoading || !prompt.trim()} 
                                className="send-button absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-white hover:brightness-110 disabled:opacity-50 transition-all" 
                                style={girlfriend.is18PlusMode ? { backgroundColor: 'var(--gf-send-button-bg)' } : { backgroundColor: 'var(--horizon-accent, #8b5cf6)' }}>
                                {isLoading ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"/> : <HeartIcon className="w-5 h-5"/>}
                            </button>
                        </div>
                    </div>
                </main>

                {/* Gallery Sidebar */}
                <aside 
                    className={`gallery-sidebar w-64 flex-shrink-0 border-l flex flex-col transition-colors duration-300 ${girlfriend.is18PlusMode ? '' : 'bg-horizon-sidebar/80 ui-blur-effect'}`}
                    style={girlfriend.is18PlusMode 
                        ? { backgroundColor: 'var(--gf-gallery-bg)', borderColor: 'var(--gf-gallery-border)' } 
                        : { borderColor: 'var(--horizon-item)' }
                    }
                >
                    <h2 className="p-4 text-lg font-semibold border-b flex items-center gap-2" 
                        style={girlfriend.is18PlusMode ? {borderColor: 'var(--gf-gallery-border)'} : {borderColor: 'var(--horizon-item)'}}>
                        <ImageIcon className="w-5 h-5 text-horizon-accent"/> Her Gallery
                    </h2>
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        {girlfriend.gallery.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                                {girlfriend.gallery.map((image, index) => (
                                    <button key={image.id} onClick={() => setLightboxIndex(index)} className="aspect-square rounded-md overflow-hidden bg-black/20 group focus:outline-none focus:ring-2 ring-rose-500">
                                        <img src={image.url} alt={image.prompt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"/>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 text-sm p-4">Ask her to send you a picture to start her gallery!</div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default AIGirlfriendChatPage;