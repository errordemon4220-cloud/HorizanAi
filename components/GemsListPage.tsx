

import React, { useState, useRef, useEffect } from 'react';
import { Gem } from '../types';
import { PlusIcon, PencilIcon, MoreVerticalIcon, TrashIcon, ImageIcon } from './icons';
import GemAvatar from './GemAvatar';

// Redesigned "New Gem" Card with glass effect
const NewGemCard: React.FC<{ onClick: () => void; style: React.CSSProperties }> = ({ onClick, style }) => (
    <button
        onClick={onClick}
        style={style}
        className="opacity-0 animate-fade-in-up group w-full"
    >
        <div className="liquid-glass-card relative aspect-[4/5] rounded-2xl transition-transform duration-300 group-hover:-translate-y-1">
            <div className="liquid-glass--bend"></div>
            <div className="liquid-glass--face"></div>
            <div className="liquid-glass--edge"></div>
            <div className="relative w-full h-full p-6 flex flex-col items-center justify-center text-center z-10">
                <div className="[transform:translateZ(30px)] transition-transform duration-300 group-hover:scale-110">
                    <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white/5 border border-white/10 transition-colors duration-300 group-hover:bg-horizon-accent/10 group-hover:border-horizon-accent/50">
                        <PlusIcon className="w-10 h-10 text-horizon-light-text-tertiary dark:text-horizon-text-tertiary transition-colors duration-300 group-hover:text-horizon-accent" />
                    </div>
                </div>
                <p className="mt-4 font-semibold text-horizon-light-text-secondary dark:text-horizon-text-secondary group-hover:text-horizon-light-text-primary dark:group-hover:text-horizon-text-primary [transform:translateZ(20px)] transition-colors duration-300">
                    New Gem
                </p>
            </div>
        </div>
    </button>
);


interface GemItemProps {
    gem: Gem;
    onEditGem: (gem: Gem) => void;
    onDeleteGem: (gemId: string) => void;
    onEditAvatar: (gem: Gem) => void;
    onEditCardBackground: (gem: Gem) => void;
    style: React.CSSProperties;
}

const GemItem: React.FC<GemItemProps> = ({ gem, onEditGem, onDeleteGem, onEditAvatar, onEditCardBackground, style }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div 
            style={style} 
            className="opacity-0 animate-fade-in-up cursor-default"
        >
            <div className="liquid-glass-card group relative aspect-[4/5] rounded-2xl transition-transform duration-300 hover:-translate-y-1">
                {gem.cardImageUrl && (
                    <div 
                        className="absolute inset-0 bg-cover bg-center rounded-2xl transition-all duration-500 group-hover:brightness-110"
                        style={{ backgroundImage: `url(${gem.cardImageUrl})` }}
                    />
                )}
                <div className="liquid-glass--bend"></div>
                <div className="liquid-glass--face" style={{ backgroundColor: gem.cardImageUrl ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.02)' }}></div>
                <div className="liquid-glass--edge"></div>
                <div className="relative w-full h-full p-6 flex flex-col justify-between z-10">
                    {/* Header with menu */}
                    <div className="flex justify-end [transform:translateZ(20px)]">
                         <div className="relative" ref={menuRef}>
                            <button onClick={() => setIsMenuOpen(prev => !prev)} className="p-2 text-horizon-light-text-tertiary dark:text-horizon-text-tertiary bg-white/10 dark:bg-black/20 rounded-full hover:text-horizon-light-text-primary dark:hover:text-horizon-text-primary backdrop-blur-sm">
                                <MoreVerticalIcon className="w-5 h-5" />
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-horizon-light-item/80 dark:bg-horizon-item/80 ui-blur-effect border border-white/5 rounded-md shadow-lg z-20 p-1">
                                    <button
                                        onClick={() => onEditGem(gem)}
                                        className="flex items-center w-full px-3 py-2 text-sm text-horizon-light-text-primary dark:text-horizon-text-primary hover:bg-horizon-light-item-hover dark:hover:bg-horizon-item-hover rounded-md transition-colors"
                                    >
                                        <PencilIcon className="w-4 h-4 mr-3" />
                                        Edit Details
                                    </button>
                                     <button
                                        onClick={() => onEditCardBackground(gem)}
                                        className="flex items-center w-full px-3 py-2 text-sm text-horizon-light-text-primary dark:text-horizon-text-primary hover:bg-horizon-light-item-hover dark:hover:bg-horizon-item-hover rounded-md transition-colors"
                                    >
                                        <ImageIcon className="w-4 h-4 mr-3" />
                                        Set Background
                                    </button>
                                    <button
                                        onClick={() => {
                                            onDeleteGem(gem.id);
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-horizon-light-item-hover dark:hover:bg-horizon-item-hover rounded-md transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4 mr-3" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex flex-col items-center text-center">
                        <div className="relative group/avatar">
                             <GemAvatar gem={gem} className="w-20 h-20" style={{ transform: 'translateZ(40px)' }} />
                             <button 
                                onClick={() => onEditAvatar(gem)} 
                                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                                title="Change Avatar"
                            >
                                <PencilIcon className="w-8 h-8 text-white" />
                            </button>
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-horizon-light-text-primary dark:text-horizon-text-primary truncate w-full [transform:translateZ(30px)]">{gem.name}</h2>
                        <p className="mt-1 text-sm text-horizon-light-text-secondary dark:text-horizon-text-secondary truncate w-full [transform:translateZ(20px)]">{gem.instructions.persona || "A custom AI persona"}</p>
                    </div>
                    
                    {/* Empty div for spacing */}
                    <div></div>
                </div>
            </div>
        </div>
    );
};

interface GemsListPageProps {
    gems: Gem[];
    onNewGem: () => void;
    onEditGem: (gem: Gem) => void;
    onDeleteGem: (gemId: string) => void;
    onEditAvatar: (gem: Gem) => void;
    onEditCardBackground: (gem: Gem) => void;
}

const GemsListPage: React.FC<GemsListPageProps> = ({ gems, onNewGem, onEditGem, onDeleteGem, onEditAvatar, onEditCardBackground }) => {
    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto relative">
            {/* Animated background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                 <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-500/30 dark:bg-purple-500/20 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                 <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-sky-500/30 dark:bg-sky-500/20 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <div className="relative z-10">
                <header className="mb-8 text-center animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400"
                        style={{ textShadow: '0 2px 10px rgba(255, 255, 255, 0.1)' }}>
                        Gem Collection
                    </h1>
                    <p className="mt-3 text-lg text-horizon-light-text-secondary dark:text-horizon-text-secondary">
                        Create, customize, and chat with your unique AI personas.
                    </p>
                </header>

                <div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                    <NewGemCard onClick={onNewGem} style={{ animationDelay: '0ms' }} />
                    
                    {gems.map((gem, index) => (
                        <GemItem 
                            key={gem.id} 
                            gem={gem} 
                            onEditGem={onEditGem} 
                            onDeleteGem={onDeleteGem} 
                            onEditAvatar={onEditAvatar}
                            onEditCardBackground={onEditCardBackground}
                            style={{ animationDelay: `${(index + 1) * 100}ms` }}
                        />
                    ))}
                </div>

                 {gems.length === 0 && (
                    <div className="col-span-full mt-8 text-center py-16 px-6 bg-horizon-light-sidebar/50 dark:bg-horizon-sidebar/50 ui-blur-effect rounded-xl border border-dashed border-horizon-light-item dark:border-horizon-item">
                        <h2 className="text-xl font-semibold text-horizon-light-text-primary dark:text-horizon-text-primary mb-2">Your Collection is Empty</h2>
                        <p className="text-horizon-light-text-secondary dark:text-horizon-text-secondary">Click "New Gem" to forge your first AI persona.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GemsListPage;
