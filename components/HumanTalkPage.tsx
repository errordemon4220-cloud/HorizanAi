import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserProfile, AIProfile, MessageAuthor, HaniyaEmotion, HaniyaEmotionScores, HaniyaRelationshipStatus, HaniyaRelationshipProposal, HANIYA_RELATIONSHIP_STATUSES, HaniyaPersonaProposal } from '../types';
import { ChevronLeftIcon, SendIcon, LoaderIcon, BrainCircuitIcon, HeartIcon, CheckIcon, XIcon, InfoIcon, UsersIcon, BookOpenIcon, ShieldIcon } from './icons';

// --- Helper & Sub-Components ---

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

const TrustBar: React.FC<{ trust: number }> = ({ trust }) => {
    const percentage = Math.max(0, trust);
    
    const getTrustDescription = (level: number) => {
        if (level < 20) return "Wary & Untrusting";
        if (level < 40) return "Cautious";
        if (level < 60) return "Opening Up";
        if (level < 80) return "Trusting";
        return "Deeply Trusts You";
    };

    return (
        <div className="w-full" title={getTrustDescription(percentage)}>
            <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-bold text-cyan-200">TRUST</span>
                <span className="font-mono text-white">{percentage}/100</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2.5 border border-white/10 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out bg-cyan-500`}
                    style={{ width: `${percentage}%`, boxShadow: `0 0 8px #22d3ee` }}
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


const HaniyaAvatar: React.FC<{ profile: AIProfile, className?: string }> = ({ profile, className }) => (
    <img src={profile.avatarUrl} alt={profile.name} className={`${className || 'w-10 h-10'} rounded-full object-cover shadow-md`} />
);
const UserAvatar: React.FC<{ profile: UserProfile | null, className?: string }> = ({ profile, className }) => (
    <img src={profile?.avatarUrl || 'https://i.pravatar.cc/40?u=default'} alt="User" className={`${className || 'w-10 h-10'} rounded-full object-cover shadow-md`} />
);
const PersonaAvatar: React.FC<{ persona: { role: string; name?: string }, className?: string }> = ({ persona, className }) => {
    const icon = persona.role.toLowerCase().includes('teacher') ? <BookOpenIcon className="w-5 h-5"/> : <UsersIcon className="w-5 h-5"/>;
    return (
        <div className={`${className || 'w-8 h-8'} rounded-full bg-slate-600 flex items-center justify-center text-white`}>
            {icon}
        </div>
    );
};


const relationshipDescriptions: Record<HaniyaRelationshipStatus, string> = {
    'Stranger': "Reserved and cautious. Haniya will maintain distance and avoid discussing personal topics.",
    'Acquaintance': "More open but still casual. She will share opinions but not deep feelings.",
    'Curious Acquaintance': "Shows more interest in getting to know you, asking more personal questions.",
    'Friends': "Warm, friendly, and shares jokes. She's comfortable with friendly gestures but might be shy about romantic advances.",
    'Good Friends': "Shares more personal stories and offers genuine support.",
    'Close Friends': "Trusts you with her secrets and offers deep emotional support. Your opinion is highly valued.",
    'Best Friends': "Deeply trusts you and shares almost everything. She considers you a core part of her life.",
    'Platonic Soulmates': "An unbreakable, non-romantic bond built on deep understanding and mutual support.",
    'Protective Friend': "Feels a strong need to look out for you and ensure your well-being.",
    'Rivals': "A competitive but respectful dynamic. She sees you as a benchmark and is driven to impress you.",
    'Flirting': "Playful, teasing, and drops hints of romantic interest.",
    'Crush': "Becomes shy, blushes easily, and gets flustered by romantic topics. She might drop subtle hints about her feelings.",
    'Secret Admirer': "Admires you from a distance, possibly leaving anonymous compliments.",
    'Dating': "Openly affectionate and romantic. Comfortable with romantic touch like holding hands or kissing.",
    'Romantic Partners': "A committed, loving relationship. She shares future plans and deep emotions with you.",
    'In Love': "Deeply in love and physically intimate. She speaks with passion and vulnerability.",
    'Passionate Lovers': "The relationship is intensely physical and emotional, a focal point of her life.",
    'Committed Partner': "Views the relationship as long-term and serious, actively discussing a future together.",
    'Soulmates': "Believes you are destined to be together. An unbreakable romantic and emotional bond.",
    'It\'s Complicated': "The relationship status is unclear, with mixed signals and undefined boundaries.",
    // 18+
    'Friends with Benefits': "Maintains a friendly, casual demeanor but is open to explicit sexual conversation and role-play without romantic commitment.",
    'Secret Affair': "Interactions are filled with passion, risk, and secrecy. Conversations may be intense and explicit.",
    'Pet': "A dynamic of submission where Haniya is eager to please and follow your lead.",
    'Master/Pet': "A dynamic of submission and dominance. Haniya's behavior reflects this power exchange.",
    'Breeding Partner': "Interactions are primal, focused on fertility and creating offspring. Conversations are direct and can be explicit."
};


const RelationshipLevelsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    currentStatus: HaniyaRelationshipStatus;
}> = ({ isOpen, onClose, currentStatus }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black/70 ui-blur-effect z-50 flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-slate-900 border border-horizon-accent/50 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-horizon-accent">Relationship Tiers</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-white/10"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                    {HANIYA_RELATIONSHIP_STATUSES.map(status => (
                        <div key={status} className={`p-3 rounded-lg border transition-all ${status === currentStatus ? 'bg-horizon-accent/15 border-horizon-accent/50' : 'bg-black/20 border-white/10'}`}>
                            <h3 className={`font-semibold ${status === currentStatus ? 'text-horizon-accent' : 'text-white'}`}>{status}</h3>
                            <p className="text-sm text-slate-400 mt-1">{relationshipDescriptions[status] || 'No description available.'}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};


const RelationshipChangeToast: React.FC<{ proposal: HaniyaRelationshipProposal }> = ({ proposal }) => (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4">
        <div className="bg-horizon-sidebar/80 ui-blur-effect border border-horizon-accent/50 rounded-xl shadow-2xl p-4 flex items-center gap-4 animate-fade-in-up">
            <div className="flex-shrink-0 p-2 bg-horizon-accent/20 rounded-full">
                <HeartIcon className="w-6 h-6 text-horizon-accent animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-horizon-text-primary">Relationship Update</p>
                <p className="text-sm text-horizon-text-secondary truncate">Haniya wants to be your <span className="font-bold text-horizon-accent">{proposal.proposedStatus}</span>.</p>
                <p className="text-xs italic text-horizon-text-tertiary mt-1">"{proposal.reason}"</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
                <button onClick={proposal.onAccept} className="px-3 py-1.5 bg-horizon-accent text-white rounded-lg text-sm font-semibold hover:bg-horizon-accent-hover transition-colors flex items-center gap-1.5">
                    <CheckIcon className="w-4 h-4" />
                    Accept
                </button>
                <button onClick={proposal.onReject} className="p-2 rounded-lg text-horizon-text-tertiary hover:bg-horizon-item-hover transition-colors" title="Reject">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
);

const PersonaChangeToast: React.FC<{ proposal: HaniyaPersonaProposal }> = ({ proposal }) => {
    const personaName = proposal.persona.name || proposal.persona.role;
    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4">
            <div className="bg-horizon-sidebar/80 ui-blur-effect border border-sky-500/50 rounded-xl shadow-2xl p-4 flex items-center gap-4 animate-fade-in-up">
                <div className="flex-shrink-0 p-2 bg-sky-500/20 rounded-full">
                    <UsersIcon className="w-6 h-6 text-sky-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-horizon-text-primary">Switch Persona?</p>
                    <p className="text-sm text-horizon-text-secondary truncate">Do you want to speak as the <span className="font-bold text-sky-400 capitalize">{personaName}</span>?</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                    <button onClick={proposal.onAccept} className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-500 transition-colors flex items-center gap-1.5">
                        <CheckIcon className="w-4 h-4" />
                        Yes, Switch
                    </button>
                    <button onClick={proposal.onReject} className="p-2 rounded-lg text-horizon-text-tertiary hover:bg-horizon-item-hover transition-colors" title="No">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};


const EmotionOrb: React.FC<{ emotion: HaniyaEmotion; value: number }> = React.memo(({ emotion, value }) => {
    const getEmotionColor = (emotion: HaniyaEmotion): string => {
        const mapping: Record<HaniyaEmotion, string> = {
            happiness: '#facc15', anger: '#f87171', sadness: '#60a5fa', shyness: '#f9a8d4',
            surprise: '#a78bfa', love: '#f472b6', horniness: '#ef4444', wetness: '#38bdf8', shock: '#fb923c',
            fear: '#9333ea', uncomfortable: '#9ca3af', blackmail: '#b91c1c',
            jealousy: '#10b981', care: '#22d3ee', lust_satisfaction: '#c026d3', intimacy: '#fb7185', trust: '#22d3ee'
        };
        return mapping[emotion] || '#94a3b8';
    };
    const color = getEmotionColor(emotion);

    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center" title={`${emotion}: ${value}%`}>
            <svg className="w-14 h-14" viewBox="0 0 50 50">
                <circle className="text-white/10" strokeWidth="3" stroke="currentColor" fill="transparent" r={radius} cx="25" cy="25"/>
                <circle
                    className="progress-ring__circle"
                    strokeWidth="3"
                    stroke={color}
                    fill="transparent"
                    r={radius}
                    cx="25"
                    cy="25"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={offset}
                    style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                />
            </svg>
            <div className="absolute flex flex-col items-center pointer-events-none">
                <span className="text-xs font-semibold" style={{ color }}>{emotion.slice(0, 4).toUpperCase()}</span>
                <span className="text-sm font-mono text-white">{value}</span>
            </div>
        </div>
    );
});

const EmotionPanel: React.FC<{ emotions: HaniyaEmotionScores; isOpen: boolean; }> = ({ emotions, isOpen }) => (
    <aside className={`absolute top-0 right-0 h-full bg-horizon-sidebar/90 ui-blur-effect border-l border-white/10 transition-transform duration-500 ease-in-out z-10 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 h-full overflow-y-auto custom-scrollbar">
            <h3 className="text-lg font-bold mb-4 text-center text-horizon-text-primary">Emotion Matrix</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                {Object.entries(emotions).map(([key, value]) => (
                    <EmotionOrb key={key} emotion={key as HaniyaEmotion} value={value} />
                ))}
            </div>
        </div>
    </aside>
);

const ThoughtBubble: React.FC<{ thought: string }> = ({ thought }) => (
    <div className="mt-3 pt-3 border-t border-white/10">
        <p className="font-sans italic text-sm text-horizon-text-secondary whitespace-pre-wrap leading-relaxed">{thought}</p>
    </div>
);

const HaniyaMessageBubble: React.FC<{ message: ChatMessage; haniyaProfile: AIProfile; }> = ({ message, haniyaProfile }) => {
    const [isThoughtVisible, setIsThoughtVisible] = useState(false);
    return (
        <div className="flex items-start gap-3 animate-fade-in-up group">
            <div className="flex-shrink-0 animate-breathing rounded-full">
                <HaniyaAvatar profile={haniyaProfile} className="w-8 h-8" />
            </div>
            <div className="max-w-xl w-full" style={{ perspective: '800px' }}>
                <div className="[transform-style:preserve-3d] transition-transform duration-500 ease-in-out group-hover:[transform:rotateY(5deg)]">
                    <div className="message-glass-wrapper rounded-xl rounded-bl-none">
                        <div className="message-glass-effect"></div>
                        <div className="message-glass-tint bg-white/10 dark:bg-black/20"></div>
                        <div className="message-glass-shine"></div>
                        <div className="message-glass-content p-4 text-horizon-light-text-primary dark:text-horizon-text-primary">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            {message.innerThought && (
                                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isThoughtVisible ? 'max-h-96' : 'max-h-0'}`}>
                                    <ThoughtBubble thought={message.innerThought} />
                                </div>
                            )}
                        </div>
                        {message.innerThought && (
                            <button
                                onClick={() => setIsThoughtVisible(p => !p)}
                                className="absolute bottom-1 right-1 z-10 p-1.5 bg-horizon-accent/50 rounded-full text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 hover:bg-horizon-accent"
                                title={isThoughtVisible ? "Hide thought" : "Reveal thought"}
                            >
                                <BrainCircuitIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CurrentPersonaBar: React.FC<{
    persona: { role: string; name?: string };
    userName: string;
    onSwitchBack: () => void;
}> = ({ persona, userName, onSwitchBack }) => {
    const personaName = persona.name || persona.role;
    return (
        <div className="mx-auto max-w-4xl mb-2 animate-fade-in-up">
            <div className="bg-slate-700/50 ui-blur-effect border border-slate-600/50 rounded-lg p-2 flex items-center justify-between text-sm">
                <p className="text-slate-300">
                    You are currently speaking as: <strong className="text-white capitalize">{personaName}</strong>
                </p>
                <button onClick={onSwitchBack} className="px-3 py-1 bg-slate-600/80 rounded-md font-semibold text-slate-200 hover:bg-slate-500/80 transition-colors">
                    Switch back to {userName}
                </button>
            </div>
        </div>
    );
};

const PersonaSelectorBar: React.FC<{
    personas: { role: string; name?: string }[];
    onSelect: (persona: { role: string; name?: string }) => void;
}> = ({ personas, onSelect }) => {
    if (personas.length === 0) return null;

    return (
        <div className="mx-auto max-w-4xl mb-2 animate-fade-in-up">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                <span className="text-sm font-semibold text-slate-400 flex-shrink-0">Speak as:</span>
                {personas.map((persona, index) => {
                    const name = persona.name || persona.role;
                    return (
                        <button
                            key={index}
                            onClick={() => onSelect(persona)}
                            className="flex-shrink-0 px-3 py-1.5 bg-slate-700/50 text-slate-200 text-sm font-semibold rounded-full hover:bg-slate-600/80 transition-colors capitalize"
                        >
                            {name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};


// --- Main Page Component ---

interface HumanTalkPageProps {
    messages: ChatMessage[];
    onSendMessage: (prompt: string) => void;
    isLoading: boolean;
    userProfile: UserProfile | null;
    haniyaProfile: AIProfile;
    haniyaEmotions: HaniyaEmotionScores;
    onBack: () => void;
    haniyaRelationshipStatus: HaniyaRelationshipStatus;
    haniyaRelationshipProposal: HaniyaRelationshipProposal | null;
    haniyaPersonaProposal: HaniyaPersonaProposal | null;
    activePersona: { role: string; name?: string } | null;
    onPersonaChange: (persona: { role: string; name?: string } | null) => void;
    haniyaDiscoveredPersonas: { role: string; name?: string }[];
    haniyaHealth: number;
    haniyaInjuries: string[];
}

export const HumanTalkPage: React.FC<HumanTalkPageProps> = ({ messages, onSendMessage, isLoading, userProfile, haniyaProfile, haniyaEmotions, onBack, haniyaRelationshipStatus, haniyaRelationshipProposal, haniyaPersonaProposal, activePersona, onPersonaChange, haniyaDiscoveredPersonas, haniyaHealth, haniyaInjuries }) => {
    const [prompt, setPrompt] = useState('');
    const [isEmotionPanelOpen, setIsEmotionPanelOpen] = useState(false);
    const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
    const [isInjuryLogOpen, setIsInjuryLogOpen] = useState(false);
    const chatViewRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        chatViewRef.current?.scrollTo({ top: chatViewRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, isLoading]);

     useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [prompt]);

    const handleSend = () => {
        if (prompt.trim() && !isLoading) {
            onSendMessage(prompt.trim());
            setPrompt('');
        }
    };
    
    const initialGreeting: ChatMessage = {
        id: 'haniya-greeting',
        author: MessageAuthor.AI,
        content: "Oh, hey... Didn't see you there. What's up?",
    };
    
    const hasContent = prompt.trim().length > 0;

    return (
        <div className="flex-1 flex flex-col relative overflow-hidden">
            <RelationshipLevelsModal
                isOpen={isRelationshipModalOpen}
                onClose={() => setIsRelationshipModalOpen(false)}
                currentStatus={haniyaRelationshipStatus}
            />
            <InjuryLogModal 
                isOpen={isInjuryLogOpen}
                onClose={() => setIsInjuryLogOpen(false)}
                injuries={haniyaInjuries}
                characterName={haniyaProfile.name}
            />


            <header className="flex-shrink-0 flex items-center justify-between p-4 bg-horizon-sidebar/80 ui-blur-effect border-b border-horizon-item z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 text-horizon-text-tertiary"><ChevronLeftIcon className="w-6 h-6"/></button>
                    <HaniyaAvatar profile={haniyaProfile} />
                    <div>
                        <h1 className="text-lg font-bold text-horizon-text-primary">{haniyaProfile.name}</h1>
                        <div className="flex items-center gap-1.5">
                            <p className="text-sm text-horizon-accent font-semibold">{haniyaRelationshipStatus}</p>
                            <button onClick={() => setIsRelationshipModalOpen(true)} title="View Relationship Tiers">
                                <InfoIcon className="w-4 h-4 text-horizon-text-tertiary hover:text-white transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-40"><HealthBar hp={haniyaHealth} /></div>
                    <div className="w-40"><TrustBar trust={haniyaEmotions.trust || 0} /></div>
                     <button onClick={() => setIsInjuryLogOpen(true)} className="px-3 py-1 bg-slate-700 text-sm font-semibold rounded-md hover:bg-slate-600 whitespace-nowrap">Injuries</button>
                    <button onClick={() => setIsEmotionPanelOpen(p => !p)} className="p-2 rounded-full hover:bg-white/10 text-horizon-text-tertiary" title="Toggle Emotion Matrix">
                        <HeartIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <div className="relative flex-1 flex min-h-0">
                <main className="flex-1 flex flex-col min-w-0">
                    <div ref={chatViewRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {messages.length === 0 && !isLoading && <HaniyaMessageBubble message={initialGreeting} haniyaProfile={haniyaProfile} />}
                        {messages.map((msg) => (
                            msg.author === MessageAuthor.USER ? (
                                <div key={msg.id} className="flex items-start gap-3 justify-end animate-fade-in-up group">
                                     <div className="max-w-xl w-full" style={{ perspective: '800px' }}>
                                         <div className="float-right [transform-style:preserve-3d] transition-transform duration-500 ease-in-out group-hover:[transform:rotateY(-5deg)]">
                                            {msg.persona ? (
                                                 <div className="message-glass-wrapper rounded-xl rounded-br-none">
                                                    <div className="message-glass-effect"></div>
                                                    <div className="message-glass-tint !bg-slate-600/30"></div>
                                                    <div className="message-glass-shine"></div>
                                                    <div className="message-glass-content p-4 text-white">
                                                         <p className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Speaking as {msg.persona.name || msg.persona.role}</p>
                                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                 <div className="message-glass-wrapper rounded-xl rounded-br-none">
                                                    <div className="message-glass-effect"></div>
                                                    <div className="message-glass-tint !bg-horizon-accent/20 dark:!bg-horizon-accent/30"></div>
                                                    <div className="message-glass-shine"></div>
                                                    <div className="message-glass-content p-4 text-horizon-light-text-primary dark:text-horizon-text-primary">
                                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {msg.persona ? <PersonaAvatar persona={msg.persona} className="w-8 h-8"/> : <UserAvatar profile={userProfile} className="w-8 h-8" />}
                                </div>
                            ) : (
                                <HaniyaMessageBubble key={msg.id} message={msg} haniyaProfile={haniyaProfile} />
                            )
                        ))}
                        {isLoading && messages[messages.length - 1]?.author === MessageAuthor.USER && (
                             <div className="flex items-start gap-3 animate-fade-in-up">
                                <div className="flex-shrink-0 animate-breathing rounded-full">
                                    <HaniyaAvatar profile={haniyaProfile} className="w-8 h-8" />
                                </div>
                                <div className="p-4 rounded-xl bg-black/20 flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-horizon-accent rounded-full animate-dot-wave" style={{ animationDelay: '-0.4s' }}></div>
                                    <div className="w-2 h-2 bg-horizon-accent rounded-full animate-dot-wave" style={{ animationDelay: '-0.2s' }}></div>
                                    <div className="w-2 h-2 bg-horizon-accent rounded-full animate-dot-wave"></div>
                                </div>
                             </div>
                        )}
                    </div>

                    <div className="flex-shrink-0 p-4 border-t border-horizon-item">
                        {activePersona && <CurrentPersonaBar persona={activePersona} userName={userProfile?.name || 'You'} onSwitchBack={() => onPersonaChange(null)} />}
                        
                        {!activePersona && <PersonaSelectorBar personas={haniyaDiscoveredPersonas} onSelect={onPersonaChange} />}
                        
                        <div className="relative mx-auto max-w-4xl">
                            <textarea
                                ref={textareaRef}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => {if(e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); handleSend();}}}
                                placeholder={`Message Haniya...`}
                                rows={1}
                                className="w-full bg-horizon-sidebar border border-horizon-item rounded-lg p-3 pr-14 resize-none focus:outline-none focus:ring-1 focus:ring-horizon-accent text-horizon-text-primary"
                                disabled={isLoading}
                            />
                            <button onClick={handleSend} disabled={isLoading || !hasContent} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-horizon-accent text-white hover:bg-horizon-accent-hover disabled:opacity-50 transition-all">
                                {isLoading ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"/> : <SendIcon className="w-5 h-5"/>}
                            </button>
                        </div>
                    </div>
                </main>

                <EmotionPanel emotions={haniyaEmotions} isOpen={isEmotionPanelOpen} />
            </div>

            {haniyaRelationshipProposal && <RelationshipChangeToast proposal={haniyaRelationshipProposal} />}
            {haniyaPersonaProposal && <PersonaChangeToast proposal={haniyaPersonaProposal} />}

        </div>
    );
};