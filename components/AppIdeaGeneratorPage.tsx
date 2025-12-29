import React, { useState, ChangeEvent } from 'react';
import { AppIdeaSetup, AppIdeaResult } from '../types';
import { LightbulbIcon, SparklesIcon, CopyIcon, CheckIcon, LoaderIcon } from './icons';

const intensityLabels: { [key: number]: string } = {
    1: 'Flirty & Suggestive',
    2: 'Explicit & Direct',
    3: 'Kinky & Adventurous',
    4: 'Hardcore & Taboo',
    5: 'Depraved & No-Limits'
};

const FormField: React.FC<{
    label: string;
    name: keyof AppIdeaSetup;
    value: string | number;
    onChange: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
    placeholder?: string;
    as?: 'input' | 'textarea';
    rows?: number;
}> = ({ label, name, value, onChange, placeholder, as = 'textarea', rows = 3 }) => (
    <div>
        <label className="block text-sm font-medium text-rose-200/70 mb-1.5">{label}</label>
        {as === 'textarea' ? (
             <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full text-sm bg-black/20 border rounded-lg p-2.5 resize-y focus:outline-none focus:ring-1 transition-colors border-rose-400/20 focus:ring-rose-400" />
        ) : (
             <input name={name} value={String(value)} onChange={onChange} placeholder={placeholder} className="w-full text-sm bg-black/20 border rounded-lg p-2.5 focus:outline-none focus:ring-1 transition-colors border-rose-400/20 focus:ring-rose-400" />
        )}
    </div>
);


const ResultsDisplay: React.FC<{ result: AppIdeaResult | null }> = ({ result }) => {
    const [copied, setCopied] = useState(false);

    if (!result || result.features.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-rose-200/60">
                <LightbulbIcon className="w-20 h-20 opacity-10" />
                <h3 className="mt-4 text-xl font-semibold text-rose-200/80">The Blueprint</h3>
                <p className="mt-1">Your generated 18+ feature ideas will appear here.</p>
            </div>
        );
    }
    
    const handleCopyAll = () => {
        const allIdeasText = result.features.map(feature => 
            `Feature: ${feature.title}\nDescription: ${feature.description}`
        ).join('\n\n---\n\n');

        navigator.clipboard.writeText(allIdeasText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="flex-1 flex flex-col p-6 min-h-0">
            <div className="flex-shrink-0 mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-rose-200">Generated Feature Ideas</h2>
                <button onClick={handleCopyAll} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors">
                    {copied ? <CheckIcon className="w-4 h-4 text-green-400"/> : <CopyIcon className="w-4 h-4"/>}
                    {copied ? 'Copied!' : 'Copy All'}
                </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                {result.features.map((feature, index) => (
                    <div key={index} className="bg-black/20 p-4 rounded-lg border border-rose-400/10 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                        <h4 className="font-semibold text-lg text-rose-200">{feature.title}</h4>
                        <p className="text-sm text-rose-200/90 whitespace-pre-wrap mt-1">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface AppIdeaGeneratorPageProps {
    setup: AppIdeaSetup;
    onSetupChange: React.Dispatch<React.SetStateAction<AppIdeaSetup>>;
    onGenerate: (setup: AppIdeaSetup) => void;
    isLoading: boolean;
    result: AppIdeaResult | null;
}

const AppIdeaGeneratorPage: React.FC<AppIdeaGeneratorPageProps> = ({ setup, onSetupChange, onGenerate, isLoading, result }) => {

    const handleFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        onSetupChange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdateSetup = <K extends keyof AppIdeaSetup>(key: K, value: AppIdeaSetup[K]) => {
        onSetupChange(prev => ({ ...prev, [key]: value }));
    };

    const isSetupValid = setup.appDescription.trim() !== '';

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 relative overflow-y-auto custom-scrollbar bg-[var(--gf-bg)] text-white">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-rose-900/50 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-purple-900/40 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <header className="text-center mb-8 animate-fade-in-up relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-400">
                    App Idea Lab
                </h1>
                <p className="mt-3 text-lg text-rose-200/80">Generate extreme 18+ features for your app concept.</p>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                {/* Left Panel: Setup */}
                <div className="flex flex-col space-y-4 bg-black/20 ui-blur-effect border border-rose-400/10 rounded-2xl p-6 overflow-y-auto shadow-2xl animate-fade-in-up custom-scrollbar">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-rose-200">The Forge</h2>
                    <FormField label="Your App Concept *" name="appDescription" as="textarea" rows={6} value={setup.appDescription} onChange={handleFieldChange} placeholder="e.g., An adult visual novel where players can customize characters and scenarios." />
                    
                    <div>
                        <label className="block text-sm font-medium text-rose-200/70 mb-1.5">Number of Feature Ideas</label>
                        <div className="flex w-full bg-black/30 rounded-lg p-1">
                            {[5, 10, 20, 30].map(num => (
                                <button key={num} onClick={() => handleUpdateSetup('featureCount', num)} className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-all duration-300 ${setup.featureCount === num ? 'bg-rose-600 text-white shadow-md' : 'text-rose-200/70 hover:bg-white/5'}`}>
                                    {num}
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
                        Generate Ideas
                    </button>
                </div>

                {/* Right Panel: Results */}
                <div className="flex flex-col bg-black/20 ui-blur-effect border border-rose-400/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-rose-200/60">
                           <LoaderIcon className="w-16 h-16 animate-spin text-rose-400" />
                           <h3 className="mt-4 text-xl font-semibold text-rose-200/80">Vulcan is Brainstorming...</h3>
                           <p className="mt-1">Generating extreme and profitable ideas.</p>
                        </div>
                    ) : (
                        <ResultsDisplay result={result} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppIdeaGeneratorPage;