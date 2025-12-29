


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PassionWeaverStory, PassionWeaverChoice, PassionWeaverAlignmentScores, PassionWeaverAlignment, PassionWeaverSetup, PassionWeaverPageVisual } from '../types';
import { HeartIcon, DownloadIcon, ChevronLeftIcon, ThumbsUpIcon, ThumbsDownIcon, StarIcon, SunIcon, AlertTriangleIcon, ChevronRightIcon, InfoIcon, XIcon, BookOpenIcon, CameraIcon, LoaderIcon, RefreshCwIcon, ShieldIcon } from './icons';
import DownloadStoryModal from './DownloadStoryModal';
import { generateImages, generateImagePromptFromStoryScene } from '../services/geminiService';


const Typewriter: React.FC<{ text: string }> = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setDisplayedText('');
        let i = 0;
        const intervalId = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(prev => prev + text.charAt(i));
                i++;
                if (containerRef.current) {
                    containerRef.current.scrollTop = containerRef.current.scrollHeight;
                }
            } else {
                clearInterval(intervalId);
            }
        }, 15);

        return () => clearInterval(intervalId);
    }, [text]);

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto pr-2 text-rose-100/90 custom-scrollbar">
            <p className="whitespace-pre-wrap leading-relaxed text-lg">{displayedText}</p>
        </div>
    )
};

const SetupModal: React.FC<{ setup: PassionWeaverSetup; isOpen: boolean; onClose: () => void }> = ({ setup, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 ui-blur-effect z-50 flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-rose-300">Story Setup</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-white/10"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                    <div>
                        <h3 className="font-semibold text-rose-200/80">Main Prompt</h3>
                        <p className="text-slate-300 bg-black/20 p-2 rounded-md mt-1">{setup.mainPrompt}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold text-rose-200/80">Your Persona</h3>
                            <p className="text-slate-300 bg-black/20 p-2 rounded-md mt-1 h-32 overflow-y-auto">{setup.userCharacter || 'Not specified.'}</p>
                        </div>
                         <div>
                            <h3 className="font-semibold text-rose-200/80">Partner's Persona</h3>
                            <p className="text-slate-300 bg-black/20 p-2 rounded-md mt-1 h-32 overflow-y-auto">{setup.partnerCharacter || 'Not specified.'}</p>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div><h3 className="font-semibold text-rose-200/80">Tone:</h3><p>{setup.tone}</p></div>
                        <div><h3 className="font-semibold text-rose-200/80">POV:</h3><p>{setup.pov}</p></div>
                        <div><h3 className="font-semibold text-rose-200/80">Intensity:</h3><p>{setup.intensity}/5</p></div>
                        <div><h3 className="font-semibold text-rose-200/80">Extreme Mode:</h3><p>{setup.isExtremeMode ? 'ON' : 'OFF'}</p></div>
                    </div>
                     <div>
                        <h3 className="font-semibold text-rose-200/80">Kinks</h3>
                        <p className="text-slate-300">{setup.kinks.length > 0 ? setup.kinks.join(', ') : 'None specified.'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AlignmentMeter: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div>
        <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-semibold text-rose-200/80">{label}</span>
            <span className="font-mono text-rose-200">{value}%</span>
        </div>
        <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></div>
        </div>
    </div>
);

const AlignmentMeters: React.FC<{ scores: PassionWeaverAlignmentScores }> = ({ scores }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-3 p-3 bg-black/20 border-b border-rose-400/20">
        <AlignmentMeter label="Good" value={scores.good} color="#4ade80" />
        <AlignmentMeter label="Bad" value={scores.bad} color="#f87171" />
        <AlignmentMeter label="Lust" value={scores.lust} color="#f472b6" />
        <AlignmentMeter label="Pleasure" value={scores.pleasure} color="#fbbf24" />
        <AlignmentMeter label="Happy" value={scores.happy} color="#60a5fa" />
        <AlignmentMeter label="Force" value={scores.force} color="#c084fc" />
        <AlignmentMeter label="Safety" value={scores.safety} color="#22d3ee" />
    </div>
);

const getAlignmentIcon = (alignment: PassionWeaverAlignment) => {
    switch(alignment) {
        case 'good': return <ThumbsUpIcon className="w-4 h-4 text-green-300" />;
        case 'bad': return <ThumbsDownIcon className="w-4 h-4 text-red-300" />;
        case 'lust': return <HeartIcon className="w-4 h-4 text-pink-300" />;
        case 'force': return <AlertTriangleIcon className="w-4 h-4 text-purple-300" />;
        case 'pleasure': return <StarIcon className="w-4 h-4 text-yellow-300" />;
        case 'happy': return <SunIcon className="w-4 h-4 text-blue-300" />;
        case 'safety': return <ShieldIcon className="w-4 h-4 text-cyan-300" />;
        default: return null;
    }
};

const getAlignmentClasses = (alignment: PassionWeaverAlignment, isSelected: boolean) => {
    const baseClasses = 'w-full text-left p-3 rounded-md transition-all duration-200 group flex items-start gap-2';
    const selectedClasses = 'ring-2 ring-offset-2 ring-offset-slate-900';
    let colorClasses = '';

    switch(alignment) {
        case 'good':
            colorClasses = `bg-green-600/10 hover:bg-green-600/20 text-green-200 ${isSelected ? `${selectedClasses} ring-green-500` : ''}`;
            break;
        case 'bad':
            colorClasses = `bg-red-600/10 hover:bg-red-600/20 text-red-200 ${isSelected ? `${selectedClasses} ring-red-500` : ''}`;
            break;
        case 'lust':
            colorClasses = `bg-pink-600/10 hover:bg-pink-600/20 text-pink-200 ${isSelected ? `${selectedClasses} ring-pink-500` : ''}`;
            break;
        case 'force':
            colorClasses = `bg-purple-600/10 hover:bg-purple-600/20 text-purple-200 ${isSelected ? `${selectedClasses} ring-purple-500` : ''}`;
            break;
        case 'pleasure':
            colorClasses = `bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-200 ${isSelected ? `${selectedClasses} ring-yellow-400` : ''}`;
            break;
        case 'happy':
            colorClasses = `bg-blue-600/10 hover:bg-blue-600/20 text-blue-200 ${isSelected ? `${selectedClasses} ring-blue-500` : ''}`;
            break;
        case 'safety':
            colorClasses = `bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-200 ${isSelected ? `${selectedClasses} ring-cyan-500` : ''}`;
            break;
        default:
            colorClasses = `bg-black/20 hover:bg-white/5 ${isSelected ? `${selectedClasses} ring-rose-500` : ''}`;
    }
    return `${baseClasses} ${colorClasses}`;
};

const VisualizeSceneModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    image: { url: string; prompt: string } | null;
    isLoading: boolean;
    onRegenerate: () => void;
}> = ({ isOpen, onClose, image, isLoading, onRegenerate }) => {
    if (!isOpen) return null;

    const handleDownload = () => {
        if (!image?.url) return;
        const a = document.createElement('a');
        a.href = image.url;
        a.download = `passion_weaver_scene.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="fixed inset-0 bg-black/70 ui-blur-effect z-[100] flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-slate-900 border border-purple-500/50 rounded-2xl p-4 w-full max-w-2xl max-h-[90vh] shadow-2xl space-y-3 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-purple-300">Scene Visualization</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-white/10"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="flex-1 flex items-center justify-center bg-black/30 rounded-lg min-h-[300px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-4 text-purple-300">
                           <LoaderIcon className="w-12 h-12 animate-spin"/>
                           <p className="font-semibold">Generating image, please wait...</p>
                        </div>
                    ) : image?.url ? (
                        <img src={image.url} alt={image.prompt} className="max-w-full max-h-full object-contain rounded-md" />
                    ) : (
                         <p className="text-red-400">Could not generate an image for this scene.</p>
                    )}
                </div>
                <p className="text-xs text-slate-400 bg-black/20 p-2 rounded-md overflow-y-auto max-h-24 flex-shrink-0">
                    <strong>Prompt:</strong> {image?.prompt || "Generating..."}
                </p>
                <div className="flex items-center justify-end gap-3 flex-shrink-0">
                    <button onClick={onRegenerate} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:opacity-50">
                        <RefreshCwIcon className="w-4 h-4" /> Regenerate
                    </button>
                    <button onClick={handleDownload} disabled={!image?.url || isLoading} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500 disabled:opacity-50">
                        <DownloadIcon className="w-4 h-4" /> Download
                    </button>
                </div>
            </div>
        </div>
    );
};

const JournalModal: React.FC<{ isOpen: boolean; onClose: () => void; choiceHistory: PassionWeaverChoice[] }> = ({ isOpen, onClose, choiceHistory }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 ui-blur-effect z-50 flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-rose-300">Story Journal</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-white/10"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                    {choiceHistory.length > 0 ? (
                        choiceHistory.map((choice, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-black/20 rounded-md">
                                <div className="text-rose-300 font-bold w-6 text-right">{index + 1}.</div>
                                <div className="flex-1">
                                    <p className="text-slate-200">"{choice.text}"</p>
                                    <p className="text-xs text-slate-400 mt-1">Alignment: <span className="font-semibold capitalize">{choice.alignment}</span></p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-400 py-10">No choices made yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


interface PassionWeaverStoryViewProps {
    activeStory: PassionWeaverStory;
    onGeneratePage: (storyId: string, playerChoice: PassionWeaverChoice) => void;
    isLoading: boolean;
    onBack: () => void;
    onNavigatePage: (storyId: string, pageIndex: number) => void;
    onVisualizeScene: (storyId: string, pageIndex: number) => Promise<PassionWeaverPageVisual | null>;
    isVisualizing: boolean;
}

const PassionWeaverStoryView: React.FC<PassionWeaverStoryViewProps> = ({ activeStory, onGeneratePage, isLoading, onBack, onNavigatePage, onVisualizeScene, isVisualizing }) => {
    const [selectedChoice, setSelectedChoice] = useState<PassionWeaverChoice | null>(null);
    const [customChoice, setCustomChoice] = useState('');
    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isVisualizeModalOpen, setIsVisualizeModalOpen] = useState(false);
    const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);

     useEffect(() => {
        if(activeStory?.choices && activeStory.choices.length > 0) setSelectedChoice(activeStory.choices[0]);
        else setSelectedChoice(null);
    }, [activeStory?.choices]);

     const handleContinue = () => {
        if(customChoice.trim()) {
            const alignment = customChoice.toLowerCase().includes('force') || customChoice.toLowerCase().includes('grab') ? 'bad' : 'good';
            onGeneratePage(activeStory.id, { text: customChoice.trim(), alignment });
        } else if (selectedChoice) {
            onGeneratePage(activeStory.id, selectedChoice);
        }
        setCustomChoice('');
    };

    const handlePrevPage = () => {
        if (activeStory.currentPageIndex > 0) {
            onNavigatePage(activeStory.id, activeStory.currentPageIndex - 1);
        }
    };

    const handleNextPage = () => {
        if (activeStory.currentPageIndex < activeStory.pages.length - 1) {
            onNavigatePage(activeStory.id, activeStory.currentPageIndex + 1);
        }
    };

    const handleVisualizeScene = async (forceRegenerate = false) => {
        const currentPageVisual = activeStory.pageVisuals?.[activeStory.currentPageIndex];

        if (currentPageVisual && !forceRegenerate) {
            setIsVisualizeModalOpen(true);
            return;
        }

        if (isLoading || isVisualizing || !activeStory.pages[activeStory.currentPageIndex]) return;

        setIsVisualizeModalOpen(true);
        await onVisualizeScene(activeStory.id, activeStory.currentPageIndex);
    };

    const currentVisual = activeStory.pageVisuals?.[activeStory.currentPageIndex];

    return (
        <div className="flex-1 flex flex-col p-0 relative bg-[var(--gf-bg)] text-white">
            <SetupModal setup={activeStory.setup} isOpen={isSetupModalOpen} onClose={() => setIsSetupModalOpen(false)} />
            <DownloadStoryModal isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} story={activeStory} />
            <VisualizeSceneModal isOpen={isVisualizeModalOpen} onClose={() => setIsVisualizeModalOpen(false)} image={currentVisual || null} isLoading={isVisualizing} onRegenerate={() => handleVisualizeScene(true)} />
            <JournalModal isOpen={isJournalModalOpen} onClose={() => setIsJournalModalOpen(false)} choiceHistory={activeStory.choiceHistory || []} />
            
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-rose-900/50 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-purple-900/40 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-rose-400/20 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10"><ChevronLeftIcon className="w-5 h-5"/></button>
                    <h1 className="text-xl font-bold text-rose-200">{activeStory.title}</h1>
                </div>
                 <div className="flex items-center gap-2">
                    <button onClick={() => setIsJournalModalOpen(true)} title="View Journal" className="p-2 rounded-full text-rose-200/80 hover:bg-white/10 hover:text-white"><BookOpenIcon className="w-5 h-5"/></button>
                    <button onClick={() => setIsSetupModalOpen(true)} title="View Story Setup" className="p-2 rounded-full text-rose-200/80 hover:bg-white/10 hover:text-white"><InfoIcon className="w-5 h-5"/></button>
                    {activeStory.pages.length > 0 && (
                        <div className="flex items-center gap-1 p-1 bg-black/20 rounded-full">
                            <button onClick={handlePrevPage} disabled={activeStory.currentPageIndex === 0} className="p-1 rounded-full hover:bg-white/10 disabled:opacity-50"><ChevronLeftIcon className="w-5 h-5"/></button>
                            <span className="text-xs font-mono w-16 text-center">{activeStory.currentPageIndex + 1} / {activeStory.pages.length}</span>
                            <button onClick={handleNextPage} disabled={activeStory.currentPageIndex >= activeStory.pages.length - 1} className="p-1 rounded-full hover:bg-white/10 disabled:opacity-50"><ChevronRightIcon className="w-5 h-5"/></button>
                        </div>
                    )}
                    <button onClick={() => setIsDownloadModalOpen(true)} title="Download Story" className="p-2 rounded-full text-rose-200/80 hover:bg-white/10 hover:text-white"><DownloadIcon className="w-5 h-5"/></button>
                </div>
            </header>
            
            <main className="flex-1 flex flex-col min-h-0">
                <AlignmentMeters scores={activeStory.alignmentScores} />
                
                <div className="flex-1 flex flex-col p-6 min-h-0">
                    {activeStory.pages.length === 0 && !isLoading ? (
                         <div className="flex-1 flex items-center justify-center">
                            <button onClick={() => onGeneratePage(activeStory.id, {text: "Let's begin.", alignment: 'good'})} className="px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-500 transition-all active:scale-95 text-lg">
                                Begin the Story
                            </button>
                        </div>
                   ) : activeStory.pages.length > 0 ? (
                        <div className="relative flex-1 flex flex-col min-h-0">
                           <Typewriter text={activeStory.pages[activeStory.currentPageIndex]} />
                           <button onClick={() => handleVisualizeScene(false)} disabled={isLoading || isVisualizing} title={currentVisual ? "View Scene" : "Visualize Scene"} className="absolute top-0 right-2 flex items-center gap-2 px-3 py-1.5 text-sm bg-black/30 backdrop-blur-sm border border-white/10 rounded-full text-purple-300 hover:bg-purple-500/20 hover:border-purple-500 transition-all">
                               {isVisualizing ? <LoaderIcon className="w-4 h-4 animate-spin"/> : <CameraIcon className="w-4 h-4"/>}
                               {currentVisual ? "View Scene" : "Visualize"}
                           </button>
                        </div>
                   ) : null}

                    {activeStory.choices.length > 0 && !isLoading && (
                        <div className="mt-6 pt-6 border-t border-rose-400/20">
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-rose-200/80">What's next?</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {activeStory.choices.map((choice, i) => (
                                        <button key={i} onClick={() => { setSelectedChoice(choice); setCustomChoice(''); }} className={getAlignmentClasses(choice.alignment, selectedChoice?.text === choice.text && !customChoice.trim())}>
                                            <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center">
                                                {getAlignmentIcon(choice.alignment)}
                                            </div>
                                            <span className="flex-1">{choice.text}</span>
                                        </button>
                                    ))}
                                </div>
                                 <textarea value={customChoice} onChange={e => { setCustomChoice(e.target.value); setSelectedChoice(null); }} placeholder="Or write your own action..." rows={2} className="w-full text-sm bg-black/20 border rounded-lg p-2.5 resize-y focus:outline-none focus:ring-1 transition-colors border-rose-400/20 focus:ring-rose-400" />
                                <button onClick={handleContinue} disabled={isLoading || (!selectedChoice && !customChoice.trim())} className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-500 transition-all active:scale-95 disabled:opacity-50">Continue</button>
                            </div>
                        </div>
                    )}
                    {isLoading && !isVisualizing && (
                        <div className="mt-6 pt-6 border-t border-rose-400/20 flex items-center gap-2 text-rose-300">
                            <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                            <span>Weaving the next chapter...</span>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PassionWeaverStoryView;