import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CogIcon, LanguagesIcon, ChevronDownIcon, CheckIcon } from './icons';
import { ModelName, EmotionScores, Emotion } from '../types';

// Language list
const LANGUAGES = [
    // Common
    'English', 'Spanish', 'French', 'German', 'Mandarin Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic', 'Hindi', 'Portuguese', 'Italian',
    // Fun
    'Pirate Speak', 'Yoda Speak', 'Shakespearean English',
    // Technical/Encoded
    'Morse Code', 'Roman Urdu', 'Leet Speak (1337)', 'JSON', 'XML', 'Python', 'JavaScript'
];

interface LanguageSelectorProps {
    currentLanguage: string;
    onLanguageChange: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = React.memo(({ currentLanguage, onLanguageChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-horizon-text-primary bg-horizon-item/30 dark:bg-horizon-item/50 border border-white/10 backdrop-blur-sm hover:bg-horizon-item-hover/70 transition-all duration-300 shadow-sm hover:shadow-md"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <LanguagesIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{currentLanguage}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 z-50 animate-scale-in-pop">
                     <div className="liquid-glass-card blue-glass rounded-2xl">
                        <div className="liquid-glass--bend"></div>
                        <div className="liquid-glass--face"></div>
                        <div className="liquid-glass--edge"></div>
                        
                        <div className="relative z-10 overflow-hidden rounded-2xl">
                             <ul className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
                                {LANGUAGES.map((lang, index) => (
                                    <li
                                      key={lang}
                                      className="opacity-0 animate-fade-in-up"
                                      style={{ animationDelay: `${index * 20}ms` }}
                                    >
                                        <button
                                            onClick={() => {
                                                onLanguageChange(lang);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-200 ease-out flex items-center justify-between group transform hover:-translate-y-px
                                                ${currentLanguage === lang ? 'text-horizon-accent font-semibold' : 'text-horizon-text-primary hover:bg-white/10'}`}
                                        >
                                            <span className="truncate">{lang}</span>
                                            {currentLanguage === lang && (
                                                <CheckIcon className="w-4 h-4 text-horizon-accent animate-scale-in-pop" />
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

interface ModelSelectorProps {
    currentModel: ModelName;
    onModelChange: (model: ModelName) => void;
}

const MODELS: { id: ModelName; title: string; name: string; tag?: string; }[] = [
    { id: 'gemini-2.5-flash', title: 'Fast all-around help', name: '2.5 Flash', tag: 'New' },
];

const ModelSelector: React.FC<ModelSelectorProps> = React.memo(({ currentModel, onModelChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedModel = MODELS.find(m => m.id === currentModel) || MODELS[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    if (MODELS.length <= 1) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-horizon-text-primary bg-horizon-item/30 dark:bg-horizon-item/50 border border-white/10 backdrop-blur-sm shadow-md">
                <span className="font-semibold">{selectedModel.name}</span>
            </div>
        );
    }

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-horizon-text-primary bg-horizon-item/30 dark:bg-horizon-item/50 border border-white/10 backdrop-blur-sm hover:bg-horizon-item-hover/70 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-horizon-accent/20"
            >
                <span className="font-semibold">{selectedModel.name}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 text-horizon-text-secondary ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div 
                    className="absolute top-full right-0 mt-2 w-80 animate-scale-in-pop z-50"
                >
                    <div className="liquid-glass-card red-glass rounded-2xl">
                        <div className="liquid-glass--bend"></div>
                        <div className="liquid-glass--face"></div>
                        <div className="liquid-glass--edge"></div>
                        
                        <div className="relative z-10 overflow-hidden rounded-2xl">
                             <div className="p-4 border-b border-white/10">
                                <h3 className="font-semibold text-horizon-text-primary text-lg">Choose your model</h3>
                            </div>
                            <ul className="divide-y divide-white/10">
                                {MODELS.map((model, index) => (
                                     <li
                                        key={model.id}
                                        className="opacity-0 animate-fade-in-up"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <button
                                            onClick={() => {
                                                onModelChange(model.id);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full text-left p-4 transition-all duration-300 group relative overflow-hidden transform hover:-translate-y-0.5 hover:bg-horizon-item-hover/50 ${currentModel === model.id ? 'bg-horizon-accent/10' : ''}`}
                                        >
                                             {/* Shine effect */}
                                             <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:animate-holographic-glare pointer-events-none z-0"></div>

                                            <div className="flex items-center justify-between relative z-10">
                                                <div>
                                                    <p className={`font-semibold ${currentModel === model.id ? 'text-horizon-accent' : 'text-horizon-text-primary'}`}>{model.title}</p>
                                                    <p className="text-sm text-horizon-text-secondary">{model.name}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {model.tag && (
                                                        <span className="bg-blue-500/80 text-white text-xs font-bold px-2.5 py-1 rounded-full">{model.tag}</span>
                                                    )}
                                                     <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${currentModel === model.id ? 'border-horizon-accent bg-horizon-accent/20' : 'border-slate-600 group-hover:border-slate-400'}`}>
                                                         {currentModel === model.id && <div className="w-2.5 h-2.5 bg-horizon-accent rounded-full animate-scale-in-pop"></div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

interface EmotionMonitorProps {
    scores: EmotionScores;
    onClick: () => void;
}

const EmotionMonitor: React.FC<EmotionMonitorProps> = React.memo(({ scores, onClick }) => {
    const topEmotions = useMemo(() => {
        if (!scores) return [];
        return Object.entries(scores)
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .slice(0, 3)
            .map(([name, value]) => ({ name: name as Emotion, value }));
    }, [scores]);

    const getEmotionColor = (emotion: Emotion) => {
        const mapping: Record<Emotion, string> = {
            happiness: '#facc15', love: '#f472b6', surprise: '#a78bfa',
            shyness: '#fda4af', beauty: '#67e8f9', cuteness: '#f9a8d4',
            horror: '#991b1b', sadness: '#60a5fa', loneliness: '#6b7280',
            horniness: '#ef4444', sexiness: '#f43f5e', hotness: '#fb923c',
            wetness: '#38bdf8', nudity: '#fca5a5'
        };
        return mapping[emotion] || '#94a3b8';
    };

    return (
        <button
            onClick={onClick}
            className="group absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-horizon-item/20 backdrop-blur-sm border border-white/5 rounded-full hover:bg-horizon-item/40 transition-all shadow-md"
            title="View Emotion Matrix"
        >
            {topEmotions.map((emotion, i) => (
                <div key={emotion.name} className="flex items-center gap-1.5">
                    <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                         <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${emotion.value}%`, backgroundColor: getEmotionColor(emotion.name), boxShadow: `0 0 4px ${getEmotionColor(emotion.name)}` }}
                        />
                    </div>
                     <span className="text-xs font-semibold uppercase text-white/70 group-hover:text-white transition-colors" style={{color: getEmotionColor(emotion.name)}}>
                         {emotion.name.substring(0,4)}
                    </span>
                </div>
            ))}
        </button>
    );
});


interface HeaderProps {
    chatTitle: string;
    onShowSettings: () => void;
    language: string;
    onLanguageChange: (language: string) => void;
    model: ModelName;
    onModelChange: (model: ModelName) => void;
    emotionScores: EmotionScores;
    onShowEmotionMeter: () => void;
}

const Header: React.FC<HeaderProps> = React.memo(({ chatTitle, onShowSettings, language, onLanguageChange, model, onModelChange, emotionScores, onShowEmotionMeter }) => {
  return (
    <div className="relative flex-shrink-0 h-16 flex items-center justify-between px-6 border-b border-horizon-light-item dark:border-horizon-sidebar">
      <div className="flex items-center flex-1 min-w-0">
        <h1 className="text-horizon-light-text-primary dark:text-horizon-text-primary text-lg font-semibold truncate max-w-sm md:max-w-md lg:max-w-lg">
          {chatTitle}
        </h1>
      </div>

      <EmotionMonitor scores={emotionScores} onClick={onShowEmotionMeter} />
      
      <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
        <ModelSelector currentModel={model} onModelChange={onModelChange} />
        <LanguageSelector currentLanguage={language} onLanguageChange={onLanguageChange} />
        <button
          onClick={onShowSettings}
          className="p-2 rounded-full text-horizon-light-text-secondary dark:text-horizon-text-secondary hover:text-horizon-light-text-primary dark:hover:text-horizon-text-primary hover:bg-horizon-light-item dark:hover:bg-horizon-item transition-colors"
          aria-label="Open settings"
        >
          <CogIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
});

export default Header;