

import React, { useState, useEffect } from 'react';
import { PassionWeaverSetup, PassionWeaverTone, StoryPOV, PassionWeaverCharacterGender, PassionWeaverStory } from '../types';
import { HeartIcon, SparklesIcon, XIcon, LockIcon } from './icons';
import { generateTitleForStory } from '../services/geminiService';

const FormSelect: React.FC<{
  label: string;
  name: keyof PassionWeaverSetup;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: readonly string[];
}> = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-rose-200/70 mb-1.5">{label}</label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full appearance-none bg-black/20 border border-rose-400/20 rounded-lg p-2.5 pr-8 focus:outline-none focus:ring-1 focus:ring-rose-400 transition-colors text-rose-100"
      >
        {options.map(opt => <option key={opt} value={opt} className="bg-slate-800">{opt}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-rose-200/70">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  </div>
);

const SegmentedControl: React.FC<{
  label: string;
  options: readonly string[];
  selectedValue: string;
  onChange: (value: PassionWeaverCharacterGender) => void;
}> = ({ label, options, selectedValue, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-rose-200/70 mb-1.5">{label}</label>
        <div className="flex w-full bg-black/30 rounded-lg p-1">
            {options.map(opt => (
                <button key={opt} onClick={() => onChange(opt as PassionWeaverCharacterGender)} className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-all duration-300 ${selectedValue === opt ? 'bg-rose-600 text-white shadow-md' : 'text-rose-200/70 hover:bg-white/5'}`}>
                    {opt}
                </button>
            ))}
        </div>
    </div>
);

const ToggleSwitch: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description: string;
    icon?: React.ReactNode;
}> = ({ checked, onChange, label, description, icon }) => (
    <div className="flex justify-between items-center p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
        <div>
             <label className="font-semibold text-red-300 flex items-center gap-2">{icon}{label}</label>
             <p className="text-xs text-red-400/80 mt-1">{description}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-600/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
        </label>
    </div>
);

const intensityLabels: { [key: number]: string } = {
    1: 'Sensual & Slow',
    2: 'Passionate & Romantic',
    3: 'Intense & Explicit',
    4: 'Rough & Dominant',
    5: 'Extreme & Forceful'
};


const defaultPassionWeaverSetup: PassionWeaverSetup = {
    mainPrompt: '',
    userCharacter: '',
    partnerCharacter: '',
    userGender: 'Woman',
    partnerGender: 'Man',
    tone: 'Romantic & Sensual',
    pov: 'First Person',
    kinks: [],
    intensity: 3,
    isExtremeMode: false,
};

interface PassionWeaverEditorPageProps {
    story: Partial<PassionWeaverStory> | null;
    onSave: (storyData: Partial<PassionWeaverStory>) => void;
    onCancel: () => void;
    isLoading: boolean;
    onRandomize: () => Promise<Partial<PassionWeaverSetup>>;
}

const PassionWeaverEditorPage: React.FC<PassionWeaverEditorPageProps> = ({ story, onSave, onCancel, isLoading, onRandomize }) => {
    const [setup, setSetup] = useState<PassionWeaverSetup>(story?.setup || defaultPassionWeaverSetup);
    const [title, setTitle] = useState(story?.title || '');
    const [currentKink, setCurrentKink] = useState('');
    const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);

    useEffect(() => {
        if (story) {
            setSetup(story.setup || defaultPassionWeaverSetup);
            setTitle(story.title || (story.setup?.mainPrompt.substring(0, 50) || ''));
        }
    }, [story]);

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setSetup(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdateSetup = <K extends keyof PassionWeaverSetup>(key: K, value: PassionWeaverSetup[K]) => {
        setSetup(prev => ({ ...prev, [key]: value }));
    };

    const handleRandomizeClick = async () => {
        const randomSetup = await onRandomize();
        setSetup(prev => ({ ...prev, ...randomSetup }));
    };

    const handleSuggestTitle = async () => {
        if (!setup.mainPrompt.trim() || isSuggestingTitle) return;
        setIsSuggestingTitle(true);
        try {
            const suggested = await generateTitleForStory(setup.mainPrompt);
            setTitle(suggested);
        } catch (error) {
            console.error("Failed to suggest title:", error);
        } finally {
            setIsSuggestingTitle(false);
        }
    };

    const handleAddKink = () => {
        if (currentKink.trim() && !setup.kinks.includes(currentKink.trim())) {
            handleUpdateSetup('kinks', [...setup.kinks, currentKink.trim()]);
            setCurrentKink('');
        }
    };

    const handleRemoveKink = (kinkToRemove: string) => {
        handleUpdateSetup('kinks', setup.kinks.filter(k => k !== kinkToRemove));
    };

    const handleSaveClick = () => {
        if(!isSetupValid) return;
        const finalTitle = title.trim() || setup.mainPrompt.substring(0, 50) || "New Story";
        onSave({ id: story?.id, title: finalTitle, setup });
    };

    const isSetupValid = setup.mainPrompt.trim() !== '';

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 relative overflow-y-auto custom-scrollbar bg-[var(--gf-bg)] text-white">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-rose-900/50 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-purple-900/40 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <header className="flex items-center justify-between mb-8 flex-shrink-0 relative z-10 animate-fade-in-up">
                <div className="flex items-center space-x-3">
                    <HeartIcon className="w-8 h-8 text-rose-400" />
                    <h1 className="text-2xl md:text-3xl font-bold">{story ? 'Edit Story' : 'New Story'}</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={onCancel} className="px-4 py-2 font-semibold text-rose-200/80 hover:text-white transition-colors">Cancel</button>
                    <button onClick={handleSaveClick} disabled={!isSetupValid || isLoading} className="px-6 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-500 disabled:opacity-50">
                        {story ? 'Save Changes' : 'Create Story'}
                    </button>
                </div>
            </header>
            
            <main className="max-w-4xl mx-auto w-full space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms'}}>
                <div className="bg-black/20 ui-blur-effect border border-rose-400/10 rounded-xl p-4 space-y-4">
                    <h3 className="font-semibold text-lg text-rose-200">Story Details</h3>
                    <div>
                        <label className="block text-sm font-medium text-rose-200/70 mb-1.5">Story Title</label>
                        <div className="relative">
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter a title for your story" className="w-full text-lg font-bold bg-black/20 border rounded-lg p-2.5 pr-12 resize-y focus:outline-none focus:ring-1 transition-colors border-rose-400/20 focus:ring-rose-400"/>
                            <button onClick={handleSuggestTitle} disabled={!setup.mainPrompt.trim() || isSuggestingTitle} title="Suggest a title" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600/50 text-white rounded-full hover:bg-purple-500 disabled:opacity-50">
                                {isSuggestingTitle ? <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"/> : <SparklesIcon className="w-4 h-4"/>}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-rose-200/70 mb-1.5">Main Scenario / Prompt *</label>
                        <textarea name="mainPrompt" value={setup.mainPrompt} onChange={handleFieldChange} placeholder="Describe the scene, characters, and initial conflict or desire..." rows={4} className="w-full text-sm bg-black/20 border rounded-lg p-2.5 resize-y focus:outline-none focus:ring-1 transition-colors border-rose-400/20 focus:ring-rose-400"/>
                    </div>
                </div>

                <div className="bg-black/20 ui-blur-effect border border-rose-400/10 rounded-xl p-4 space-y-4">
                    <h3 className="font-semibold text-lg text-rose-200">Characters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <SegmentedControl label="I am a..." options={['Man', 'Woman', 'Non-binary']} selectedValue={setup.userGender} onChange={(v) => handleUpdateSetup('userGender', v)} />
                           <textarea name="userCharacter" value={setup.userCharacter} onChange={handleFieldChange} placeholder="Describe your character's persona, appearance, and background... (optional)" rows={4} className="w-full text-sm bg-black/20 border rounded-lg p-2.5 resize-y focus:outline-none focus:ring-1 transition-colors border-rose-400/20 focus:ring-rose-400"/>
                        </div>
                        <div className="space-y-2">
                           <SegmentedControl label="My partner is a..." options={['Man', 'Woman', 'Non-binary']} selectedValue={setup.partnerGender} onChange={(v) => handleUpdateSetup('partnerGender', v)} />
                           <textarea name="partnerCharacter" value={setup.partnerCharacter} onChange={handleFieldChange} placeholder="Describe your partner's persona, appearance, and background... (optional)" rows={4} className="w-full text-sm bg-black/20 border rounded-lg p-2.5 resize-y focus:outline-none focus:ring-1 transition-colors border-rose-400/20 focus:ring-rose-400"/>
                        </div>
                    </div>
                </div>

                 <div className="bg-black/20 ui-blur-effect border border-rose-400/10 rounded-xl p-4 space-y-4">
                    <h3 className="font-semibold text-lg text-rose-200">Style & Rules</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormSelect label="Tone" name="tone" value={setup.tone} onChange={handleFieldChange} options={['Romantic & Sensual', 'Rough & Dominant', 'Submissive & Pleading', 'Experimental & Kinky', 'Humorous & Playful']} />
                        <FormSelect label="Point of View (POV)" name="pov" value={setup.pov} onChange={handleFieldChange} options={['First Person', 'Third Person Limited', 'Third Person Omniscient']} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-rose-200/70">Intensity: <span className="font-bold text-rose-200">{intensityLabels[setup.intensity]}</span></label>
                        <input type="range" min="1" max="5" step="1" value={setup.intensity} onChange={(e) => handleUpdateSetup('intensity', parseInt(e.target.value, 10))} className="w-full h-2 mt-1.5 bg-black/30 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                    </div>
                    <ToggleSwitch label="Extreme 18+ Mode" description="WARNING: Enables hardcore content." checked={setup.isExtremeMode} onChange={(v) => handleUpdateSetup('isExtremeMode', v)} icon={<LockIcon className="w-4 h-4" />} />
                    <div>
                        <label className="text-sm font-medium text-rose-200/70 mb-1.5 block">Kinks/Fetishes (Optional)</label>
                        <div className="flex gap-2">
                             <input type="text" value={currentKink} onChange={(e) => setCurrentKink(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddKink()} placeholder="Add a kink/fetish tag..." className="flex-1 w-full text-sm bg-black/20 border border-rose-400/20 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-rose-400" />
                             <button onClick={handleAddKink} className="px-4 bg-rose-600/50 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-semibold">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {setup.kinks.map(kink => (
                                <div key={kink} className="flex items-center gap-1.5 bg-rose-500/20 text-rose-200 text-xs font-semibold px-2 py-1 rounded-full">
                                    <span>{kink}</span>
                                    <button onClick={() => handleRemoveKink(kink)} className="text-rose-300 hover:text-white"><XIcon className="w-3 h-3"/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                 </div>
                 
                 <button onClick={handleRandomizeClick} disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600/50 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all active:scale-95 disabled:opacity-50">
                    <SparklesIcon className="w-5 h-5"/>
                    Randomize Setup
                 </button>
            </main>
        </div>
    );
};

export default PassionWeaverEditorPage;