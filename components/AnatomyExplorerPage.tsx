
import React, { useState, useMemo } from 'react';
import { AnatomyExplorerSetup, AnatomyExplorerGender, ChatMessage, MessageAuthor } from '../types';
import { ZapIcon, SparklesIcon, LoaderIcon, SendIcon } from './icons';

// Constants for body parts
const MALE_PARTS = ['Head', 'Eyes', 'Mouth', 'Chest', 'Abs', 'Arms', 'Hands', 'Groin', 'Penis', 'Testicles', 'Ass', 'Legs', 'Feet'];
const FEMALE_PARTS = ['Head', 'Eyes', 'Mouth', 'Breasts', 'Nipples', 'Stomach', 'Arms', 'Hands', 'Groin', 'Vagina', 'Clitoris', 'Ass', 'Legs', 'Feet'];

// Simple Chat Input
const ChatInput: React.FC<{
    onSend: (prompt: string) => void;
    isLoading: boolean;
}> = ({ onSend, isLoading }) => {
    const [prompt, setPrompt] = useState('');

    const handleSend = () => {
        if (prompt.trim() && !isLoading) {
            onSend(prompt.trim());
            setPrompt('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    return (
        <div className="relative mt-4">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a follow-up question..."
                rows={1}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pr-12 resize-none focus:outline-none focus:ring-1 focus:ring-rose-400 text-sm"
                disabled={isLoading}
            />
            <button
                onClick={handleSend}
                disabled={isLoading || !prompt.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 transition-colors"
            >
                {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SendIcon className="w-5 h-5" />}
            </button>
        </div>
    );
};

// Main Component
interface AnatomyExplorerPageProps {
    setup: AnatomyExplorerSetup;
    onSetupChange: React.Dispatch<React.SetStateAction<AnatomyExplorerSetup>>;
    onGenerate: () => void;
    isLoadingAnalysis: boolean;
    analysisResult: string | null;
    chatMessages: ChatMessage[];
    onSendMessage: (prompt: string) => void;
    isLoadingChat: boolean;
}

const AnatomyExplorerPage: React.FC<AnatomyExplorerPageProps> = ({ setup, onSetupChange, onGenerate, isLoadingAnalysis, analysisResult, chatMessages, onSendMessage, isLoadingChat }) => {
    const bodyParts = setup.gender === 'Male' ? MALE_PARTS : setup.gender === 'Female' ? FEMALE_PARTS : [];

    const parsedHtmlResult = useMemo(() => {
        if (!analysisResult) return '';
        // A very basic sanitizer
        const sanitized = analysisResult.replace(/<script.*?>.*?<\/script>/gi, '')
                                      .replace(/<.*?>/g, (match) => {
                                          const allowedTags = ['<h3>', '</h3>', '<li>', '</li>', '<ul>', '</ul>', '<b>', '</b>', '<i>', '</i>'];
                                          return allowedTags.includes(match.toLowerCase()) ? match : '';
                                      });
        return sanitized
            .replace(/### (.*)/g, '<h3 class="text-lg font-semibold text-rose-200 mt-4 first:mt-0">$1</h3>')
            .replace(/\* (.*)/g, '<li class="ml-4 list-disc">$1</li>');
    }, [analysisResult]);

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 relative overflow-y-auto custom-scrollbar bg-[var(--gf-bg)] text-white">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-rose-900/50 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-purple-900/40 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <header className="text-center mb-8 animate-fade-in-up relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-400">
                    Anatomy Explorer
                </h1>
                <p className="mt-3 text-lg text-rose-200/80">An uncensored guide to the human body.</p>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                {/* Left Panel: Setup */}
                <div className="flex flex-col space-y-4 bg-black/20 ui-blur-effect border border-rose-400/10 rounded-2xl p-6 overflow-y-auto shadow-2xl animate-fade-in-up custom-scrollbar">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-rose-200">Selection</h2>
                    
                    <div>
                        <label className="block text-sm font-medium text-rose-200/70 mb-1.5">1. Select Gender</label>
                        <div className="flex w-full bg-black/30 rounded-lg p-1">
                            {(['Male', 'Female'] as AnatomyExplorerGender[]).map(gender => (
                                <button
                                    key={gender}
                                    onClick={() => onSetupChange(prev => ({ ...prev, gender, selectedPart: null }))}
                                    className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-all duration-300 ${setup.gender === gender ? 'bg-rose-600 text-white shadow-md' : 'text-rose-200/70 hover:bg-white/5'}`}
                                >
                                    {gender}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {setup.gender && (
                        <div className="animate-fade-in-up">
                            <label className="block text-sm font-medium text-rose-200/70 mb-1.5">2. Select Body Part</label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {bodyParts.map(part => (
                                    <button
                                        key={part}
                                        onClick={() => onSetupChange(prev => ({ ...prev, selectedPart: part }))}
                                        className={`p-2 text-xs font-semibold rounded-md transition-all duration-200 ${setup.selectedPart === part ? 'bg-rose-600 text-white' : 'bg-black/20 hover:bg-black/40 text-rose-200/80'}`}
                                    >
                                        {part}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onGenerate}
                        disabled={!setup.gender || !setup.selectedPart || isLoadingAnalysis}
                        className="w-full flex items-center justify-center gap-3 py-3 mt-auto bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoadingAnalysis ? <LoaderIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                        Analyze
                    </button>
                </div>
                
                {/* Right Panel: Results & Chat */}
                <div className="flex flex-col bg-black/20 ui-blur-effect border border-rose-400/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    {isLoadingAnalysis ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-rose-200/60">
                            <LoaderIcon className="w-16 h-16 animate-spin text-rose-400" />
                            <h3 className="mt-4 text-xl font-semibold text-rose-200/80">Kama is Researching...</h3>
                            <p className="mt-1">Compiling a detailed, uncensored analysis.</p>
                        </div>
                    ) : !analysisResult ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-rose-200/60">
                            <ZapIcon className="w-20 h-20 opacity-10" />
                            <h3 className="mt-4 text-xl font-semibold text-rose-200/80">Analysis Awaits</h3>
                            <p className="mt-1">Your detailed guide will appear here.</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col p-6 min-h-0">
                            <h2 className="text-2xl font-bold text-rose-200 flex-shrink-0 mb-4">Analysis: {setup.gender}'s {setup.selectedPart}</h2>
                            <div
                                className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 text-rose-200/90 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: parsedHtmlResult }}
                            ></div>
                            
                            {/* Chat section */}
                            <div className="mt-4 pt-4 border-t border-rose-400/20">
                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                    {chatMessages.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.author === MessageAuthor.USER ? 'justify-end' : 'justify-start'}`}>
                                            <p className={`p-2 rounded-lg text-sm max-w-xs ${msg.author === MessageAuthor.USER ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                                                {msg.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <ChatInput onSend={onSendMessage} isLoading={isLoadingChat} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnatomyExplorerPage;
