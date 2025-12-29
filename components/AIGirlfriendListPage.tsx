

import React from 'react';
import { AIGirlfriendProfile } from '../types';
import { PlusIcon, HeartIcon, TrashIcon, MessageSquareIcon } from './icons';

const GirlfriendAvatar: React.FC<{ avatar: string; name: string; className?: string }> = ({ avatar, name, className = 'w-20 h-20' }) => {
    const avatarStyle = { transform: 'translateZ(40px)' };
    const isUrl = avatar?.startsWith('http') || avatar?.startsWith('data:');
    const isEmoji = !isUrl && avatar && /\p{Emoji}/u.test(avatar);

    if (isUrl) {
        return <img src={avatar} alt={name} style={avatarStyle} className={`${className} flex-shrink-0 rounded-full object-cover shadow-lg`} />;
    }
    if (isEmoji) {
        return <div style={avatarStyle} className={`${className} flex-shrink-0 flex items-center justify-center rounded-full bg-rose-400/20 shadow-lg`}><span className="text-4xl">{avatar}</span></div>;
    }
    return <div style={avatarStyle} className={`${className} flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white font-bold text-3xl shadow-lg`}>{(name?.charAt(0) || 'G').toUpperCase()}</div>;
};

const GirlfriendCard: React.FC<{
    girlfriend: AIGirlfriendProfile;
    onChat: (id: string) => void;
    onEdit: (girlfriend: AIGirlfriendProfile) => void;
    onDelete: (id: string) => void;
    style: React.CSSProperties;
}> = ({ girlfriend, onChat, onEdit, onDelete, style }) => {
    const hasVideo = girlfriend.is18PlusMode && girlfriend.cardVideoUrl;

    return (
        <div style={style} className="opacity-0 animate-fade-in-up cursor-pointer">
            <div className={`liquid-glass-card group relative aspect-[4/5] rounded-2xl transition-transform duration-300 hover:-translate-y-1 ${girlfriend.is18PlusMode ? 'aigf-18-plus-card animate-pulse-red-glow' : ''}`} onClick={() => onChat(girlfriend.id)}>
                {hasVideo ? (
                    <video
                        src={girlfriend.cardVideoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-all duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="liquid-glass--bend"></div>
                )}
                <div className="liquid-glass--face" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}></div>
                <div className="liquid-glass--edge"></div>
                <div className="relative w-full h-full p-6 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start [transform:translateZ(20px)]">
                        {girlfriend.is18PlusMode && (
                            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full z-20">18+</span>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); onDelete(girlfriend.id); }} className="p-2 text-slate-400 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/50 hover:text-white transition-all ml-auto z-20"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                    <div className="flex flex-col items-center text-center" onClick={(e) => { e.stopPropagation(); onEdit(girlfriend); }}>
                        <GirlfriendAvatar avatar={girlfriend.avatar} name={girlfriend.name} />
                        <h2 className="mt-4 text-xl font-bold text-white truncate w-full [transform:translateZ(30px)]" style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>{girlfriend.name}</h2>
                        <p className="mt-1 text-sm text-pink-200/80 truncate w-full [transform:translateZ(20px)]" style={{textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>{girlfriend.personality} - {girlfriend.relationshipStatus}</p>
                    </div>
                    <button onClick={() => onChat(girlfriend.id)} className="flex items-center justify-center gap-2 w-full py-3 bg-horizon-accent/10 rounded-lg text-horizon-accent font-semibold hover:bg-horizon-accent/20 hover:text-white transition-all active:scale-95 [transform:translateZ(20px)] opacity-0 group-hover:opacity-100">
                        <MessageSquareIcon className="w-5 h-5"/> Chat Now
                    </button>
                </div>
            </div>
        </div>
    );
};

const NewGirlfriendCard: React.FC<{ onClick: () => void; style: React.CSSProperties }> = ({ onClick, style }) => (
    <button onClick={onClick} style={style} className="opacity-0 animate-fade-in-up group w-full">
        <div className="liquid-glass-card relative aspect-[4/5] rounded-2xl transition-transform duration-300 group-hover:-translate-y-1">
            <div className="liquid-glass--bend"></div>
            <div className="liquid-glass--face"></div>
            <div className="liquid-glass--edge"></div>
            <div className="relative w-full h-full p-6 flex flex-col items-center justify-center text-center z-10">
                <div className="[transform:translateZ(30px)] transition-transform duration-300 group-hover:scale-110">
                    <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white/5 border border-white/10 transition-colors duration-300 group-hover:bg-horizon-accent/10 group-hover:border-horizon-accent/50">
                        <PlusIcon className="w-10 h-10 text-slate-400 transition-colors duration-300 group-hover:text-horizon-accent" />
                    </div>
                </div>
                <p className="mt-4 font-semibold text-slate-400 group-hover:text-white [transform:translateZ(20px)] transition-colors duration-300">Create New Companion</p>
            </div>
        </div>
    </button>
);

interface AIGirlfriendListPageProps {
    girlfriends: AIGirlfriendProfile[];
    onNew: () => void;
    onEdit: (girlfriend: AIGirlfriendProfile) => void;
    onDelete: (id: string) => void;
    onChat: (id: string) => void;
}

const AIGirlfriendListPage: React.FC<AIGirlfriendListPageProps> = ({ girlfriends, onNew, onEdit, onDelete, onChat }) => {
    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto relative">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-rose-500/20 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/20 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>
            <div className="relative z-10">
                <header className="mb-8 text-center animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">AI Companions</h1>
                    <p className="mt-3 text-lg text-slate-400">Create and chat with your unique AI girlfriends.</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <NewGirlfriendCard onClick={onNew} style={{ animationDelay: '0ms' }} />
                    {girlfriends.map((gf, index) => (
                        <GirlfriendCard key={gf.id} girlfriend={gf} onChat={onChat} onEdit={onEdit} onDelete={onDelete} style={{ animationDelay: `${(index + 1) * 100}ms` }} />
                    ))}
                </div>
                {girlfriends.length === 0 && (
                    <div className="col-span-full mt-8 text-center py-16 px-6 bg-black/20 ui-blur-effect rounded-xl border border-dashed border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-2">No Companions Yet</h2>
                        <p className="text-slate-400">Click "Create New" to design your first AI girlfriend.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIGirlfriendListPage;