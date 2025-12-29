import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, QuillIcon, SparklesIcon, CopyIcon, CheckIcon, TrashIcon, LoaderIcon, DownloadIcon } from './icons';
import { generateDirtyLetter } from '../services/geminiService';

interface AI18PlusLetterPageProps {
    onCancel: () => void;
}

const ROLES = [
    'Lover', 'Stranger', 'Wife', 'Husband', 'Girlfriend', 'Boyfriend',
    'Teacher (Female)', 'Teacher (Male)', 'Student (Female)', 'Student (Male)',
    'Boss (Female)', 'Boss (Male)', 'Employee (Female)', 'Employee (Male)',
    'Sister', 'Brother', 'Step-Sister', 'Step-Brother', 'Mother', 'Father',
    'Daughter', 'Son', 'Stalker'
];

const LANGUAGES = [
    'English', 'Urdu', 'Roman Urdu', 'Chinese', 'Spanish', 'French', 
    'German', 'Hindi', 'Arabic', 'Japanese', 'Russian', 'Portuguese', 'Italian'
];

const intensityLabels: { [key: number]: string } = {
    1: 'Teasing & Suggestive',
    2: 'Passionate & Erotic',
    3: 'Explicit & Dirty',
    4: 'Graphic & Filthy',
    5: 'Depraved & Hardcore'
};

const AI18PlusLetterPage: React.FC<AI18PlusLetterPageProps> = ({ onCancel }) => {
    const [originalText, setOriginalText] = useState('');
    const [dirtyText, setDirtyText] = useState('');
    const [selectedRole, setSelectedRole] = useState(ROLES[0]);
    const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [intensity, setIntensity] = useState(3);
    const [useEmojis, setUseEmojis] = useState(false);
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const downloadRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
                setIsDownloadOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleGenerate = async () => {
        if (!originalText.trim() || isLoading) return;
        setIsLoading(true);
        setDirtyText('');
        try {
            const result = await generateDirtyLetter(originalText, selectedRole, selectedLanguage, intensity, useEmojis);
            setDirtyText(result);
        } catch (error) {
            console.error(error);
            setDirtyText('An error occurred. The AI might be feeling shy.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!dirtyText) return;
        navigator.clipboard.writeText(dirtyText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleClear = () => {
        setOriginalText('');
        setDirtyText('');
    };

    const createHtmlContent = (text: string) => {
        const escapedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/g, '<br/>');
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>A Letter from your ${selectedRole}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=IM+Fell+English&display=swap');
        body { background-color: #110106; color: #fce7f3; font-family: 'IM Fell English', serif; line-height: 1.9; padding: 2rem; margin: 0; }
        .container { max-width: 800px; margin: auto; background-color: rgba(225, 29, 72, 0.05); border: 1px solid #e11d48; border-radius: 8px; padding: 3rem; box-shadow: 0 0 30px rgba(225, 29, 72, 0.3); }
        h1 { color: #f9a8d4; text-align: center; font-family: 'Playfair Display', serif; font-style: italic; font-size: 2.5rem; margin-bottom: 2.5rem; }
        p { white-space: pre-wrap; font-size: 1.1rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>A Letter From Your ${selectedRole}</h1>
        <p>${escapedText}</p>
    </div>
</body>
</html>`;
    };

    const handleDownload = (format: 'txt' | 'html') => {
        if (!dirtyText) return;
        const title = `dirty_letter_from_${selectedRole.toLowerCase().replace(/[^a-z0-9]/gi, '_')}`;
        let blob: Blob;

        if (format === 'txt') {
            blob = new Blob([dirtyText], { type: 'text/plain;charset=utf-8' });
        } else { // html
            const htmlContent = createHtmlContent(dirtyText);
            blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        }
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsDownloadOpen(false);
    };


    return (
        <div className="flex-1 flex flex-col bg-[var(--gf-bg)] text-white relative">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-rose-900/50 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-purple-900/40 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>
            <header className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-900/50 border-b border-rose-500/30 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10 text-rose-300">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-3">
                        <QuillIcon className="w-6 h-6 text-rose-400"/>
                        <h1 className="text-xl font-bold text-rose-300">18+ Letter Studio</h1>
                    </div>
                </div>
            </header>
            <main className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                    {/* Input Card */}
                    <div className="bg-black/20 ui-blur-effect border border-rose-400/10 rounded-xl p-4 flex flex-col animate-fade-in-up">
                        <h2 className="text-lg font-semibold text-rose-200 mb-2">Your Message</h2>
                        <textarea
                            value={originalText}
                            onChange={(e) => setOriginalText(e.target.value)}
                            placeholder="Paste your letter or message here..."
                            className="w-full flex-1 bg-transparent text-rose-100/90 focus:outline-none resize-none custom-scrollbar"
                        />
                    </div>
                    {/* Output Card */}
                    <div className="bg-black/20 ui-blur-effect border border-rose-400/10 rounded-xl p-4 flex flex-col relative animate-fade-in-up" style={{animationDelay: '100ms'}}>
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-semibold text-rose-200">Dirty Version</h2>
                            <div className="flex items-center gap-2">
                                <div ref={downloadRef} className="relative">
                                    <button onClick={() => setIsDownloadOpen(p => !p)} disabled={!dirtyText} className="flex items-center gap-1.5 px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md transition-colors disabled:opacity-50">
                                        <DownloadIcon className="w-4 h-4" /> Download
                                    </button>
                                    {isDownloadOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-36 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-10 p-1">
                                            <button onClick={() => handleDownload('txt')} className="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-700 rounded">as .txt</button>
                                            <button onClick={() => handleDownload('html')} className="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-700 rounded">as .html</button>
                                        </div>
                                    )}
                                </div>
                                <button onClick={handleCopy} disabled={!dirtyText} className="flex items-center gap-1.5 px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md transition-colors disabled:opacity-50">
                                    {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                        </div>
                        <div className="w-full flex-1 bg-transparent text-rose-100/90 focus:outline-none resize-none custom-scrollbar overflow-y-auto whitespace-pre-wrap">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <LoaderIcon className="w-8 h-8 animate-spin text-rose-400"/>
                                </div>
                            ) : (
                                dirtyText || <p className="text-slate-500">The explicit version will appear here...</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex-shrink-0 bg-black/20 ui-blur-effect border border-rose-400/10 rounded-xl p-4 space-y-4 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-rose-200/70 mb-1.5">Perspective</label>
                                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full appearance-none bg-black/30 border border-rose-400/30 rounded-lg p-2.5 pr-8 focus:outline-none focus:ring-1 focus:ring-rose-400 transition-colors text-rose-100">
                                    {ROLES.map(role => <option key={role} value={role} className="bg-slate-800">{role}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-rose-200/70 mb-1.5">Language</label>
                                <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="w-full appearance-none bg-black/30 border border-rose-400/30 rounded-lg p-2.5 pr-8 focus:outline-none focus:ring-1 focus:ring-rose-400 transition-colors text-rose-100">
                                    {LANGUAGES.map(lang => <option key={lang} value={lang} className="bg-slate-800">{lang}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <label className="block text-sm font-medium text-rose-200/70">Intensity: <span className="font-bold text-rose-200">{intensityLabels[intensity]}</span></label>
                                <input type="range" min="1" max="5" step="1" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full h-2 mt-1.5 bg-black/30 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                            </div>
                            <div className="flex items-center">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" checked={useEmojis} onChange={(e) => setUseEmojis(e.target.checked)} className="sr-only peer" />
                                  <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                                  <span className="ml-3 text-sm font-medium text-rose-200/70">Use Emojis</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            <button onClick={handleClear} className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-md font-semibold transition-colors flex items-center gap-2">
                                <TrashIcon className="w-5 h-5" /> Clear
                            </button>
                            <button onClick={handleGenerate} disabled={isLoading || !originalText.trim()} className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-md font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-lg">
                                {isLoading ? <LoaderIcon className="w-6 h-6 animate-spin" /> : <SparklesIcon className="w-6 h-6" />}
                                {isLoading ? 'Generating...' : 'Make it Dirty'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AI18PlusLetterPage;