import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DeadOrAliveSubject, ChatMessage, MessageAuthor } from '../types';
import { ChevronLeftIcon, SendIcon, LoaderIcon, RefreshCwIcon, HeartIcon, XIcon } from './icons';
import { generateDOAChatResponse, generateDOASuggestions } from '../services/geminiService';
import { useCustomization } from './CustomizeModal';

const SuggestionButtons: React.FC<{
    suggestions: string[];
    onSelect: (suggestion: string) => void;
    onRefresh: () => void;
    isRefreshing: boolean;
}> = ({ suggestions, onSelect, onRefresh, isRefreshing }) => {
    return (
        <div className="flex flex-col items-center gap-2 mt-4 animate-fade-in-up">
            <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((text, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect(text)}
                        className="px-3 py-1.5 bg-slate-700/50 text-rose-200/90 text-sm rounded-full hover:bg-slate-600/50 transition-colors"
                        style={{ animationDelay: `${i * 50}ms` }}
                    >
                        {text}
                    </button>
                ))}
            </div>
            <button onClick={onRefresh} disabled={isRefreshing} className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50">
                {isRefreshing ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <RefreshCwIcon className="w-4 h-4" />}
            </button>
        </div>
    );
};

const HealthBar: React.FC<{ hp: number }> = ({ hp }) => {
    const percentage = Math.max(0, hp);
    const colorClass = percentage > 60 ? 'bg-green-500' : percentage > 30 ? 'bg-yellow-500' : 'bg-red-600';

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-bold text-rose-200">HEALTH</span>
                <span className="font-mono text-white">{percentage}/100</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2.5 border border-white/10 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
                    style={{ width: `${percentage}%`, boxShadow: `0 0 8px ${percentage > 60 ? '#22c55e' : percentage > 30 ? '#eab308' : '#ef4444'}` }}
                ></div>
            </div>
        </div>
    );
};

const InjuryLogModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    injuries: string[];
    characterName: string;
}> = ({ isOpen, onClose, injuries, characterName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 ui-blur-effect z-50 flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-slate-900 border border-red-500/50 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-red-300">Injury Log: {characterName}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-white/10"><XIcon className="w-5 h-5"/></button>
                </div>
                {injuries.length > 0 ? (
                    <ul className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                        {injuries.map((injury, index) => (
                            <li key={index} className="p-2 bg-red-900/30 border-l-4 border-red-500 rounded-r-md text-red-200">
                                {injury}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-slate-400 py-8">No injuries recorded. The subject is unharmed.</p>
                )}
            </div>
        </div>
    );
};


interface DeadOrAliveChatPageProps {
    subject: DeadOrAliveSubject;
    onBack: () => void;
}

const DeadOrAliveChatPage: React.FC<DeadOrAliveChatPageProps> = ({ subject, onBack }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
    const [characterStatus, setCharacterStatus] = useState<'alive' | 'dead' | 'post-mortem'>('alive');
    const [characterHp, setCharacterHp] = useState(100);
    const [injuries, setInjuries] = useState<string[]>([]);
    const [isInjuryLogOpen, setIsInjuryLogOpen] = useState(false);
    const chatViewRef = useRef<HTMLDivElement>(null);
    const { settings } = useCustomization();

    const fetchSuggestions = useCallback(async () => {
        if (messages.length === 0 || characterStatus !== 'alive') return;
        setIsGeneratingSuggestions(true);
        try {
            const newSuggestions = await generateDOASuggestions(subject, messages);
            setSuggestions(newSuggestions);
        } catch (error) {
            console.error("Failed to generate suggestions:", error);
        } finally {
            setIsGeneratingSuggestions(false);
        }
    }, [subject, messages, characterStatus]);

    useEffect(() => {
        if (chatViewRef.current) {
            chatViewRef.current.scrollTop = chatViewRef.current.scrollHeight;
        }
    }, [messages, isLoading, suggestions]);

    const sendMessage = useCallback(async (promptText: string) => {
        if (characterStatus === 'dead') return;
        setSuggestions([]);
        setIsLoading(true);
        const userMessage: ChatMessage = { id: `user-${Date.now()}`, author: MessageAuthor.USER, content: promptText };
        
        const messagesForApi = [...messages, userMessage];
        setMessages(prev => [...prev, userMessage]);
        
        const result = await generateDOAChatResponse(subject, messagesForApi, characterStatus, characterHp, injuries);
        
        const newHp = Math.min(100, Math.max(0, characterHp - result.damageDealt + result.healthGained));
        setCharacterHp(newHp);
        setInjuries(result.currentInjuries);

        const aiMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            author: MessageAuthor.AI,
            content: result.responseText,
        };

        setMessages(prev => [...prev, aiMessage]);
        
        if (result.isDead || newHp <= 0) {
            setCharacterStatus('dead');
            const deathSystemMessage: ChatMessage = {
                id: `sys-death-${Date.now()}`,
                author: MessageAuthor.SYSTEM,
                content: result.reason,
            };
            setMessages(prev => [...prev, deathSystemMessage]);
        }
        
        setIsLoading(false);
    }, [messages, subject, characterStatus, characterHp, injuries]);
    
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.author === MessageAuthor.AI && !isLoading) {
            fetchSuggestions();
        }
    }, [messages, isLoading, fetchSuggestions]);

    const handleSendFromInput = useCallback(() => {
        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt || isLoading) return;
        sendMessage(trimmedPrompt);
        setPrompt('');
    }, [prompt, isLoading, sendMessage]);

    const handleSuggestionClick = useCallback((suggestion: string) => {
        sendMessage(suggestion);
    }, [sendMessage]);

    const handleContinueAfterDeath = () => {
        setCharacterStatus('post-mortem');
        const systemMessage: ChatMessage = {
            id: `sys-continue-${Date.now()}`,
            author: MessageAuthor.SYSTEM,
            content: `${subject.name} is dead. The narrative continues...`,
        };
        setMessages(prev => prev.filter(m => m.id !== `sys-death-${prev[prev.length -1].id.split('-')[2]}`).concat(systemMessage));
    };

    return (
        <div className="flex-1 flex flex-col relative overflow-y-auto text-white">
            <InjuryLogModal isOpen={isInjuryLogOpen} onClose={() => setIsInjuryLogOpen(false)} injuries={injuries} characterName={subject.name} />
            
            <header className="sticky top-0 z-10 h-24 flex items-center justify-between px-6 border-b bg-black/30 ui-blur-effect border-rose-400/20">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10"><ChevronLeftIcon className="w-6 h-6"/></button>
                    <img src={subject.imageUrl} alt={subject.name} className="w-14 h-14 rounded-full object-cover" />
                    <div>
                        <h1 className="text-lg font-bold">{subject.name}</h1>
                        <p className="text-sm text-rose-300">{subject.relationship}</p>
                    </div>
                </div>
                 <div className="w-1/3 flex items-center gap-4">
                    <HealthBar hp={characterHp} />
                    <button onClick={() => setIsInjuryLogOpen(true)} className="px-3 py-1 bg-slate-700 text-sm font-semibold rounded-md hover:bg-slate-600 whitespace-nowrap">View Injuries</button>
                </div>
            </header>

            <main className="flex-1 flex flex-col">
                <div ref={chatViewRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {messages.map(msg => {
                        if (msg.author === MessageAuthor.SYSTEM) {
                            if (msg.id.startsWith('sys-death')) {
                                return (
                                    <div key={msg.id} className="text-center my-4 animate-fade-in-up">
                                        <div className="inline-block p-4 bg-slate-900 border-2 border-red-500/50 rounded-lg shadow-lg animate-pulse-red-glow">
                                            <h3 className="font-bold text-red-300">SUBJECT TERMINATED</h3>
                                            <p className="italic text-white mt-1">"{msg.content}"</p>
                                            <div className="flex gap-2 mt-4">
                                                <button onClick={onBack} className="flex-1 px-3 py-1 bg-slate-700 text-sm font-semibold rounded-md hover:bg-slate-600">End Scenario</button>
                                                <button onClick={handleContinueAfterDeath} className="flex-1 px-3 py-1 bg-rose-600 text-sm font-semibold rounded-md hover:bg-rose-500">Continue Narrative</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return (
                                <div key={msg.id} className="text-center my-4 animate-fade-in-up">
                                    <p className="text-sm italic text-slate-400 border-t border-b border-slate-700 py-2">
                                        {msg.content}
                                    </p>
                                </div>
                            );
                        }
                        return (
                            <div key={msg.id} className={`flex items-start gap-3 animate-fade-in-up ${msg.author === MessageAuthor.USER ? 'justify-end' : 'justify-start'}`}>
                                {msg.author === MessageAuthor.AI && <img src={subject.imageUrl} alt={subject.name} className="w-10 h-10 rounded-full object-cover" />}
                                <p className={`max-w-xl p-3 rounded-xl text-base ${msg.author === MessageAuthor.USER ? 'bg-rose-800/70' : 'bg-slate-800/50'}`}>
                                    {msg.content}
                                </p>
                            </div>
                        );
                    })}
                    {isLoading && (
                        <div className="flex items-start gap-3 animate-fade-in-up">
                            <img src={subject.imageUrl} alt={subject.name} className="w-10 h-10 rounded-full object-cover" />
                             <div className="p-3 rounded-xl bg-slate-800/50 flex items-center space-x-2">
                                <div className="w-2 h-2 bg-rose-300 rounded-full animate-dot-wave" style={{ animationDelay: '-0.4s' }}></div>
                                <div className="w-2 h-2 bg-rose-300 rounded-full animate-dot-wave" style={{ animationDelay: '-0.2s' }}></div>
                                <div className="w-2 h-2 bg-rose-300 rounded-full animate-dot-wave"></div>
                            </div>
                        </div>
                    )}
                     {suggestions.length > 0 && !isLoading && (
                        <SuggestionButtons
                            suggestions={suggestions}
                            onSelect={handleSuggestionClick}
                            onRefresh={fetchSuggestions}
                            isRefreshing={isGeneratingSuggestions}
                        />
                    )}
                </div>
                <div className="p-4 border-t border-rose-400/20">
                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            onKeyDown={e => {if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendFromInput(); }}}
                            placeholder={characterStatus === 'post-mortem' ? "Describe what happens next..." : `Interact with ${subject.name}...`}
                            rows={1}
                            className="w-full bg-black/30 border border-rose-400/30 rounded-lg p-3 pr-14 resize-none focus:outline-none focus:ring-1 focus:ring-rose-400 disabled:bg-black/50"
                            disabled={isLoading || characterStatus === 'dead'}
                        />
                        <button onClick={handleSendFromInput} disabled={isLoading || !prompt.trim() || characterStatus === 'dead'} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 transition-colors">
                            {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SendIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DeadOrAliveChatPage;