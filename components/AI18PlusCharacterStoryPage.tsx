import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, SparklesIcon, ChevronRightIcon, RefreshCwIcon, LoaderIcon, DownloadIcon, XIcon } from './icons';
import { EighteenPlusCharacterStoryState, EighteenPlusCharacterStorySetup } from '../types';

interface AI18PlusCharacterStoryPageProps {
    onCancel: () => void;
    storyState: EighteenPlusCharacterStoryState;
    onGeneratePage: (setup?: EighteenPlusCharacterStorySetup) => void;
    onStartNewStory: () => void;
    isLoading: boolean;
}

const MALE_CHARACTERS = ['Hulk', 'Iron Man', 'Thor', 'Captain America', 'Orc Warlord', 'Demon Prince', 'Cyborg Soldier', 'Geralt of Rivia', 'The Flash', 'Custom'];
const FEMALE_CHARACTERS = ['Black Widow', 'Captain Marvel', 'Scarlet Witch', 'She-Hulk', 'Elf Princess', 'Succubus Queen', 'Android Companion', 'Wonder Woman', 'Custom'];
const SETTINGS = [
    "Avengers Tower Penthouse",
    "Asgardian Royal Bedroom",
    "Isolated Cabin in the Woods",
    "Luxury Yacht at Sunset",
    "S.H.I.E.L.D. Holodeck Simulation",
    "Stark's Malibu Mansion Bedroom",
    "Wakandan Royal Chambers",
    "A Gritty Back Alley",
    "A Five-Star Hotel Suite",
    "The X-Mansion's Danger Room",
    "Alien Ship's Bridge",
    "Haunted Mansion Bedroom",
    "Cyberpunk Back Alley",
    "Fantasy Tavern's Private Room"
];
const LANGUAGES = [
    'English', 'Urdu', 'Roman Urdu', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Russian'
];

const CharacterSelect: React.FC<{
    label: string;
    options: string[];
    selectedCharacters: string[];
    onAdd: (character: string) => void;
    onRemove: (character: string) => void;
}> = ({ label, options, selectedCharacters, onAdd, onRemove }) => {
    const [currentChar, setCurrentChar] = useState(options[0]);
    const [customChar, setCustomChar] = useState('');

    const handleAdd = () => {
        if (currentChar === 'Custom') {
            if (customChar.trim() && !selectedCharacters.includes(customChar.trim())) {
                onAdd(customChar.trim());
                setCustomChar('');
            }
        } else {
            if (!selectedCharacters.includes(currentChar)) {
                onAdd(currentChar);
            }
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-rose-200/80">{label} ({selectedCharacters.length}/6)</label>
            <div className="flex gap-2">
                <select value={currentChar} onChange={e => setCurrentChar(e.target.value)} className="w-full bg-black/30 border border-rose-400/20 rounded-lg p-2">
                    {options.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={handleAdd} disabled={selectedCharacters.length >= 6} className="px-4 bg-rose-600/50 hover:bg-rose-600 rounded-md text-sm font-semibold disabled:opacity-50">Add</button>
            </div>
            {currentChar === 'Custom' && (
                <input type="text" value={customChar} onChange={e => setCustomChar(e.target.value)} placeholder="e.g., A muscular Orc Warlord..." className="w-full bg-black/30 border border-rose-400/20 rounded-lg p-2 mt-2" />
            )}
            <div className="flex flex-wrap gap-2 pt-2 min-h-[2.5rem]">
                {selectedCharacters.map(char => (
                    <div key={char} className="flex items-center gap-1.5 bg-rose-500/20 text-rose-200 text-xs font-semibold px-2 py-1 rounded-full">
                        <span>{char}</span>
                        <button onClick={() => onRemove(char)} className="text-rose-300 hover:text-white"><XIcon className="w-3 h-3"/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SetupView: React.FC<{
    onGenerate: (setup: EighteenPlusCharacterStorySetup) => void;
    isLoading: boolean;
}> = ({ onGenerate, isLoading }) => {
    const [maleCharacters, setMaleCharacters] = useState<string[]>(['Hulk']);
    const [femaleCharacters, setFemaleCharacters] = useState<string[]>(['Black Widow']);
    const [setting, setSetting] = useState(SETTINGS[0]);
    const [language, setLanguage] = useState(LANGUAGES[0]);

    const handleGenerate = () => {
        if (maleCharacters.length === 0 && femaleCharacters.length === 0) {
            alert('Please add at least one character.');
            return;
        }
        if (maleCharacters.length + femaleCharacters.length < 2) {
            alert('Please add at least two characters for a story.');
            return;
        }

        onGenerate({ maleCharacters, femaleCharacters, setting, language });
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-black/30 ui-blur-effect border border-rose-500/30 rounded-2xl p-8 space-y-6 animate-fade-in-up">
                <h2 className="text-2xl font-bold text-center text-rose-200">Craft Your Erotic Story</h2>
                
                <CharacterSelect
                    label="Male Characters"
                    options={MALE_CHARACTERS}
                    selectedCharacters={maleCharacters}
                    onAdd={(char) => setMaleCharacters(prev => [...prev, char])}
                    onRemove={(char) => setMaleCharacters(prev => prev.filter(c => c !== char))}
                />
                <CharacterSelect
                    label="Female Characters"
                    options={FEMALE_CHARACTERS}
                    selectedCharacters={femaleCharacters}
                    onAdd={(char) => setFemaleCharacters(prev => [...prev, char])}
                    onRemove={(char) => setFemaleCharacters(prev => prev.filter(c => c !== char))}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-rose-200/80">Setting</label>
                        <select value={setting} onChange={e => setSetting(e.target.value)} className="w-full bg-black/30 border border-rose-400/20 rounded-lg p-2">
                            {SETTINGS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-rose-200/80">Language</label>
                        <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-black/30 border border-rose-400/20 rounded-lg p-2">
                            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                </div>

                <button onClick={handleGenerate} disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600 hover:bg-rose-500 rounded-md font-semibold disabled:opacity-50">
                    {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                    {isLoading ? 'Generating...' : 'Generate Story'}
                </button>
            </div>
        </div>
    );
};

const DownloadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    storyState: EighteenPlusCharacterStoryState;
}> = ({ isOpen, onClose, storyState }) => {
    if (!isOpen) return null;

    const handleDownload = (format: 'txt' | 'html') => {
        const { setup, pages } = storyState;
        if (!setup || pages.length === 0) return;

        const title = `${[...setup.maleCharacters, ...setup.femaleCharacters].join(', ')}`;
        const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format}`;
        let content = '';
        let mimeType = '';

        if (format === 'txt') {
            mimeType = 'text/plain;charset=utf-8';
            content = `Title: ${title}\n\nLanguage: ${setup.language}\n\nCharacters: ${[...setup.maleCharacters, ...setup.femaleCharacters].join(', ')}\nSetting: ${setup.setting}\n\n---\n\n${pages.join('\n\n---\n\n')}`;
        } else { // html
            mimeType = 'text/html;charset=utf-8';
            const pagesHtml = pages.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('<hr style="border:0;border-top:1px solid #444; margin: 2rem 0;">');
            content = `<!DOCTYPE html><html lang="en"><head><title>${title}</title><style>body{background-color:#111;color:#eee;font-family:sans-serif;max-width:800px;margin:auto;padding:2rem;}hr{border:0;border-top:1px solid #444;}p{line-height:1.6;}</style></head><body><h1>${title}</h1><h2>Characters: ${[...setup.maleCharacters, ...setup.femaleCharacters].join(', ')}</h2><h3>Setting: ${setup.setting}</h3><h3>Language: ${setup.language}</h3><hr>${pagesHtml}</body></html>`;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black/70 ui-blur-effect z-50 flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-rose-300">Download Story</h2>
                <div className="space-y-3">
                    <button onClick={() => handleDownload('txt')} className="w-full p-3 bg-slate-800/70 hover:bg-slate-700/70 rounded-lg font-semibold text-left">As Text File (.txt)</button>
                    <button onClick={() => handleDownload('html')} className="w-full p-3 bg-slate-800/70 hover:bg-slate-700/70 rounded-lg font-semibold text-left">As HTML File (.html)</button>
                </div>
            </div>
        </div>
    );
};


const StoryView: React.FC<{
    storyState: EighteenPlusCharacterStoryState;
    onGenerateNext: () => void;
    onStartNew: () => void;
    isLoading: boolean;
    onOpenDownload: () => void;
}> = ({ storyState, onGenerateNext, onStartNew, isLoading, onOpenDownload }) => {
    const { setup, pages } = storyState;
    const [currentPage, setCurrentPage] = useState(pages.length - 1);
    const storyContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCurrentPage(pages.length - 1);
    }, [pages]);

    useEffect(() => {
        if (storyContainerRef.current) {
            storyContainerRef.current.scrollTop = 0;
        }
    }, [currentPage]);
    
    if (!setup) return null;

    return (
        <div className="flex-1 flex flex-col p-6 gap-4 min-h-0">
            <div className="flex-shrink-0 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-rose-200 truncate pr-4">{[...setup.maleCharacters, ...setup.femaleCharacters].join(', ')}</h2>
                    <p className="text-xs text-rose-300/70">{setup.setting} &bull; {setup.language}</p>
                </div>
                <div className="flex items-center gap-2">
                     <button onClick={onOpenDownload} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-sm font-semibold">
                        <DownloadIcon className="w-4 h-4"/>
                        Download
                    </button>
                    <button onClick={onStartNew} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-sm font-semibold">
                        <RefreshCwIcon className="w-4 h-4"/>
                        New Story
                    </button>
                </div>
            </div>

            <div ref={storyContainerRef} className="flex-1 bg-black/30 border border-rose-500/20 rounded-lg p-6 overflow-y-auto custom-scrollbar">
                <p className="whitespace-pre-wrap text-lg leading-relaxed text-rose-100/90">
                    {pages[currentPage]}
                </p>
            </div>

            <div className="flex-shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0} className="p-2 bg-slate-700 rounded-md disabled:opacity-50"><ChevronLeftIcon className="w-5 h-5"/></button>
                    <span className="font-mono text-sm">{currentPage + 1} / {pages.length}</span>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= pages.length - 1} className="p-2 bg-slate-700 rounded-md disabled:opacity-50"><ChevronRightIcon className="w-5 h-5"/></button>
                </div>
                <button onClick={onGenerateNext} disabled={isLoading} className="px-6 py-3 bg-rose-600 hover:bg-rose-500 rounded-md font-semibold flex items-center gap-2 disabled:opacity-50">
                    {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin"/> : <ChevronRightIcon className="w-5 h-5"/>}
                    {isLoading ? 'Generating...' : 'Generate Next Page'}
                </button>
            </div>
        </div>
    );
};


const AI18PlusCharacterStoryPage: React.FC<AI18PlusCharacterStoryPageProps> = ({ onCancel, storyState, onGeneratePage, onStartNewStory, isLoading }) => {
    useEffect(() => {}, []);
    const hasStory = storyState.setup && storyState.pages.length > 0;
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

    return (
        <div className="flex-1 flex flex-col bg-black text-white relative">
             <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-rose-900/50 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-purple-900/40 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>
            <header className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-900/50 border-b border-rose-500/30 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10 text-rose-300">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-rose-300">18+ Character Story</h1>
                </div>
            </header>
            <main className="flex-1 flex flex-col min-h-0">
                {hasStory ? (
                    <StoryView 
                        storyState={storyState}
                        onGenerateNext={() => onGeneratePage()}
                        onStartNew={onStartNewStory}
                        isLoading={isLoading}
                        onOpenDownload={() => setIsDownloadModalOpen(true)}
                    />
                ) : (
                    <SetupView 
                        onGenerate={(setup) => onGeneratePage(setup)}
                        isLoading={isLoading}
                    />
                )}
            </main>
             <DownloadModal isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} storyState={storyState} />
        </div>
    );
};

export default AI18PlusCharacterStoryPage;