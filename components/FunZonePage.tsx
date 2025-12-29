import React, { useState } from 'react';
import { ZapIcon, BookOpenIcon, HeartIcon, SparklesIcon, UsersIcon, FileTextIcon, SlidersIcon, AlertTriangleIcon } from './icons';
import { StudioCategory, STUDIO_CATEGORIES, EXTREME_STUDIO_CATEGORIES } from '../types';

interface FunZonePageProps {
    onCancel: () => void;
    onSelectCategory: (category: StudioCategory) => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: StudioCategory; description: string; onClick: () => void; style: React.CSSProperties }> = ({ icon, title, description, onClick, style }) => (
    <button onClick={onClick} style={style} className="w-full text-left opacity-0 animate-fade-in-up">
        <div className="relative p-6 bg-black/20 ui-blur-effect border border-rose-400/10 rounded-xl transition-all duration-300 hover:border-rose-400/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-500/10 h-full">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">{icon}</div>
                <h3 className="font-bold text-lg text-rose-200">{title}</h3>
            </div>
            <p className="text-sm text-rose-200/60">{description}</p>
        </div>
    </button>
);

const FunZonePage: React.FC<FunZonePageProps> = ({ onCancel, onSelectCategory }) => {
    const [isExtremeMode, setIsExtremeMode] = useState(false);

    const standardFeatures: { icon: React.ReactNode; title: StudioCategory; description: string }[] = [
        { icon: <HeartIcon className="w-5 h-5"/>, title: 'Primary Interactions', description: "Detailed guides on a variety of foundational sexual interaction types." },
        { icon: <UsersIcon className="w-5 h-5"/>, title: 'Body Parts in Use', description: "An explicit A-Z guide on how various body parts are used sexually." },
        { icon: <BookOpenIcon className="w-5 h-5"/>, title: 'Sexual Positions', description: "A library of positions with detailed descriptions, ratings, and tips." },
        { icon: <SparklesIcon className="w-5 h-5"/>, title: 'Techniques & Acts', description: "Explore specific practices, psychological elements, and enhancements." },
        { icon: <FileTextIcon className="w-5 h-5"/>, title: 'Toys & Props', description: "An uncensored guide to various sex toys and BDSM equipment." },
        { icon: <SlidersIcon className="w-5 h-5"/>, title: 'Erogenous Spots', description: "A focused look at specific pleasure points and stimulation methods." },
    ];

    const extremeFeatures: { icon: React.ReactNode; title: StudioCategory; description: string }[] = [
        { icon: <HeartIcon className="w-5 h-5 text-red-400"/>, title: 'Pain & Pleasure Play', description: "Exploring the intersection of pain and pleasure through BDSM and impact play." },
        { icon: <UsersIcon className="w-5 h-5 text-red-400"/>, title: 'Rough & Primal Sex', description: "Unleashing raw, animalistic desire through forceful and dominant encounters." },
        { icon: <BookOpenIcon className="w-5 h-5 text-red-400"/>, title: 'Dominance & Submission', description: "Guides on power dynamics, control, and surrender in D/s relationships." },
        { icon: <SparklesIcon className="w-5 h-5 text-red-400"/>, title: 'Humiliation & Degradation', description: "Exploring psychological play involving verbal and physical debasement." },
        { icon: <FileTextIcon className="w-5 h-5 text-red-400"/>, title: 'Consensual Non-Consent (CNC)', description: "Detailed scenarios and safety protocols for intense CNC role-playing." },
        { icon: <SlidersIcon className="w-5 h-5 text-red-400"/>, title: 'Extreme Kinks & Taboo', description: "A deep dive into unconventional and boundary-pushing fetishes." },
    ];
    
    const features = isExtremeMode ? extremeFeatures : standardFeatures;

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto relative bg-[var(--gf-bg)] text-white">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                 <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-rose-900/50 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-purple-900/40 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <header className="flex items-start justify-between mb-8 flex-shrink-0 relative z-10 animate-fade-in-up">
                <div className="flex items-center space-x-3">
                    <ZapIcon className="w-8 h-8 text-rose-400" />
                    <h1 className="text-2xl md:text-3xl font-bold">18+ Interaction Studio</h1>
                </div>
                <button onClick={onCancel} className="px-4 py-2 font-semibold text-rose-200/80 hover:text-white transition-colors">Back</button>
            </header>

            <main className="relative z-10 w-full">
                <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
                    <div className="flex justify-between items-center p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <div>
                            <label className="font-semibold text-red-300 flex items-center gap-2">
                                <AlertTriangleIcon className="w-5 h-5"/>
                                Rough & Extreme Mode
                            </label>
                            <p className="text-xs text-red-400/80 mt-1">Unlock hardcore categories. Viewer discretion is strongly advised.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={isExtremeMode} onChange={(e) => setIsExtremeMode(e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-600/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                        </label>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                         <FeatureCard 
                            key={feature.title}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            onClick={() => onSelectCategory(feature.title)}
                            style={{ animationDelay: `${100 + index * 50}ms` }}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default FunZonePage;