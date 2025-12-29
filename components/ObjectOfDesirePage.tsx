import React, { useState, ChangeEvent, useMemo } from 'react';
import { ObjectOfDesireSetup, ObjectOfDesireGender } from '../types';
import { ZapIcon, SparklesIcon, CopyIcon, CheckIcon, LoaderIcon } from './icons';

const intensityLabels: { [key: number]: string } = {
    1: 'Kinky & Playful',
    2: 'Explicit & Adventurous',
    3: 'Hardcore & Taboo',
    4: 'Painful & Dominant',
    5: 'No-Limits Depravity'
};

const FormField: React.FC<{
    label: string;
    name: keyof ObjectOfDesireSetup;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}> = ({ label, name, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-rose-200/70 mb-1.5">{label}</label>
        <input name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full text-sm bg-black/20 border rounded-lg p-2.5 focus:outline-none focus:ring-1 transition-colors border-rose-400/20 focus:ring-rose-400" />
    </div>
);

const ResultsDisplay: React.FC<{ result: string | null }> = ({ result }) => {
    const [copied, setCopied] = useState(false);

    const parsedHtml = useMemo(() => {
        if (!result) return '';
        // Sanitize to prevent basic XSS before using dangerouslySetInnerHTML
        const sanitized = result.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        // Convert markdown headers to HTML
        return sanitized.replace(/### (.*)/g, '<h3 class="text-lg font-semibold text-rose-200 mt-4 first:mt-0">$1</h3>');
    }, [result]);

    if (!result) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-rose-200/60">
                <ZapIcon className="w-20 h-20 opacity-10" />
                <h3 className="mt-4 text-xl font-semibold text-rose-200/80">Desire's Blueprint</h3>
                <p className="mt-1">Generated ideas for your object will appear here.</p>
            </div>
        );
    }
    
    const handleCopyAll = () => {
        navigator.clipboard.writeText(result).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="flex-1 flex flex-col p-6 min-h-0">
            <div className="flex-shrink-0 mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-rose-200">Generated Ideas</h2>
                <button onClick={handleCopyAll} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors">
                    {copied ? <CheckIcon className="w-4 h-4 text-green-400"/> : <CopyIcon className="w-4 h-4"/>}
                    {copied ? 'Copied!' : 'Copy All'}
                </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="whitespace-pre-wrap font-sans text-rose-200/90" dangerouslySetInnerHTML={{ __html: parsedHtml }}></div>
            </div>
        </div>
    );
};


interface ObjectOfDesirePageProps {
    setup: ObjectOfDesireSetup;
    onSetupChange: React.Dispatch<React.SetStateAction<ObjectOfDesireSetup>>;
    onGenerate: (setup: ObjectOfDesireSetup) => void;
    isLoading: boolean;
    result: string | null;
}

const ObjectOfDesirePage: React.FC<ObjectOfDesirePageProps> = ({ setup, onSetupChange, onGenerate, isLoading, result }) => {
    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSetupChange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdateSetup = <K extends keyof ObjectOfDesireSetup>(key: K, value: ObjectOfDesireSetup[K]) => {
        onSetupChange(prev => ({ ...prev, [key]: value }));
    };

    const isSetupValid = setup.objectName.trim() !== '';
    
    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 relative overflow-y-auto custom-scrollbar bg-[var(--gf-bg)] text-white">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-rose-900/50 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-purple-900/40 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <header className="text-center mb-8 animate-fade-in-up relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-400">
                    Object of Desire
                </h1>
                <p className="mt-3 text-lg text-rose-200/80">Brainstorm kinky uses for any object.</p>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                {/* Left Panel: Setup */}
                <div className="flex flex-col space-y-4 bg-black/20 ui-blur-effect border border-rose-400/10 rounded-2xl p-6 overflow-y-auto shadow-2xl animate-fade-in-up custom-scrollbar">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-rose-200">The Object</h2>
                    <FormField label="Object Name *" name="objectName" value={setup.objectName} onChange={handleFieldChange} placeholder="e.g., A long, silk scarf..." />
                    
                    <div>
                        <label className="block text-sm font-medium text-rose-200/70 mb-1.5">Gender Focus</label>
                        <div className="flex w-full bg-black/30 rounded-lg p-1">
                            {(['Woman', 'Man'] as ObjectOfDesireGender[]).map(gender => (
                                <button key={gender} onClick={() => handleUpdateSetup('gender', gender)} className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-all duration-300 ${setup.gender === gender ? 'bg-rose-600 text-white shadow-md' : 'text-rose-200/70 hover:bg-white/5'}`}>
                                    {gender}
                                </button>
                            ))}
                        </div>
                    </div>

                     <div>
                        <label className="text-sm font-medium text-rose-200/70">Intensity: <span className="font-bold text-rose-200">{intensityLabels[setup.intensity]}</span></label>
                        <input type="range" min="1" max="5" step="1" value={setup.intensity} onChange={(e) => handleUpdateSetup('intensity', parseInt(e.target.value, 10))} className="w-full h-2 mt-1.5 bg-black/30 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                    </div>
                    <button onClick={() => onGenerate(setup)} disabled={!isSetupValid || isLoading} className="w-full flex items-center justify-center gap-3 py-3 mt-auto bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                        Brainstorm Ideas
                    </button>
                </div>

                {/* Right Panel: Results */}
                <div className="flex flex-col bg-black/20 ui-blur-effect border border-rose-400/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-rose-200/60">
                           <LoaderIcon className="w-16 h-16 animate-spin text-rose-400" />
                           <h3 className="mt-4 text-xl font-semibold text-rose-200/80">Nyx is Scheming...</h3>
                           <p className="mt-1">Devising extreme and inventive uses.</p>
                        </div>
                    ) : (
                        <ResultsDisplay result={result} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ObjectOfDesirePage;
