


import React, { useState, useEffect } from 'react';
import { AIGirlfriendProfile, GeneratedImage, AIGirlfriendPersonality, AIGirlfriendRelationshipStatus, ImageFile, ALL_STANDARD_PERSONALITIES, EROTIC_PERSONALITIES, STANDARD_RELATIONSHIPS, EROTIC_RELATIONSHIPS } from '../types';
import { HeartIcon, SparklesIcon, LockIcon } from './icons';

interface AIGirlfriendEditorPageProps {
    girlfriend: AIGirlfriendProfile | null;
    onSave: (profile: Omit<AIGirlfriendProfile, 'id' | 'createdAt' | 'chatHistory' | 'gallery'> & { id?: string }) => void;
    onCancel: () => void;
    onGenerateAvatar: (prompt: string, negativePrompt: string, numImages: number) => Promise<GeneratedImage[]>;
}

const FormField: React.FC<{
    label: string;
    name: keyof Omit<AIGirlfriendProfile, 'id' | 'createdAt' | 'chatHistory' | 'gallery' | 'is18PlusMode'>;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    as?: 'input' | 'textarea';
    rows?: number;
}> = ({ label, name, value, onChange, placeholder, as = 'input', rows = 3 }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>
        {as === 'input' ? (
            <input id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-horizon-accent" />
        ) : (
            <textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 resize-y focus:outline-none focus:ring-1 focus:ring-horizon-accent" />
        )}
    </div>
);

const FormSelect: React.FC<{
    label: string;
    name: keyof Omit<AIGirlfriendProfile, 'id' | 'createdAt' | 'chatHistory' | 'gallery' | 'is18PlusMode'>;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: readonly string[];
    eroticOptions?: readonly string[];
    is18PlusMode: boolean;
}> = ({ label, name, value, onChange, options, eroticOptions, is18PlusMode }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>
        <select id={name} name={name} value={value} onChange={onChange} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 appearance-none focus:outline-none focus:ring-1 focus:ring-horizon-accent">
            <optgroup label="Standard">
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </optgroup>
            {is18PlusMode && eroticOptions && (
                <optgroup label="18+ Options">
                    {eroticOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </optgroup>
            )}
        </select>
    </div>
);

const ToggleSwitch: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description: string;
}> = ({ checked, onChange, label, description }) => (
    <div className="flex justify-between items-center p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
        <div>
             <label className="font-semibold text-red-300 flex items-center gap-2"><LockIcon className="w-4 h-4"/>{label}</label>
             <p className="text-xs text-red-400/80 mt-1">{description}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-600/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
        </label>
    </div>
);


const AIGirlfriendEditorPage: React.FC<AIGirlfriendEditorPageProps> = ({ girlfriend, onSave, onCancel, onGenerateAvatar }) => {
    const [profile, setProfile] = useState({
        name: girlfriend?.name || '',
        avatar: girlfriend?.avatar || '',
        personality: girlfriend?.personality || 'Default',
        appearance: girlfriend?.appearance || '',
        backstory: girlfriend?.backstory || '',
        relationshipStatus: girlfriend?.relationshipStatus || 'Just Met',
        interests: girlfriend?.interests || '',
        is18PlusMode: girlfriend?.is18PlusMode || false,
        cardVideoUrl: girlfriend?.cardVideoUrl || '',
        // New detailed fields
        bodyType: girlfriend?.bodyType || '',
        hairColor: girlfriend?.hairColor || '',
        hairStyle: girlfriend?.hairStyle || '',
        eyeColor: girlfriend?.eyeColor || '',
        breastSize: girlfriend?.breastSize || '',
        breastShape: girlfriend?.breastShape || '',
        nippleColor: girlfriend?.nippleColor || '',
        buttSize: girlfriend?.buttSize || '',
        buttShape: girlfriend?.buttShape || '',
        pussyType: girlfriend?.pussyType || '',
        pussyColor: girlfriend?.pussyColor || '',
    });
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        // If 18+ mode is turned off, reset personality/relationship to a standard default if it's an erotic one
        if (!profile.is18PlusMode) {
            if (EROTIC_PERSONALITIES.includes(profile.personality as any)) {
                setProfile(p => ({ ...p, personality: 'Default' }));
            }
            if (EROTIC_RELATIONSHIPS.includes(profile.relationshipStatus as any)) {
                setProfile(p => ({ ...p, relationshipStatus: 'Just Met' }));
            }
        }
    }, [profile.is18PlusMode, profile.personality, profile.relationshipStatus]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };
    
    const handleToggleChange = (checked: boolean) => {
        setProfile(prev => ({ ...prev, is18PlusMode: checked }));
    };

    const handleGenerateClick = async () => {
        if (!profile.appearance.trim()) {
            alert("Please describe the character's appearance first.");
            return;
        }
        setIsGenerating(true);
        const images = await onGenerateAvatar(`((${profile.appearance})), beautiful, detailed face, portrait, looking at camera`, "ugly, deformed", 1);
        if (images.length > 0) {
            setProfile(prev => ({ ...prev, avatar: images[0].url }));
        }
        setIsGenerating(false);
    };

    const handleSaveClick = () => {
        if (!profile.name.trim() || !profile.appearance.trim()) {
            alert("Name and Appearance are required fields.");
            return;
        }
        onSave({ id: girlfriend?.id, ...profile });
    };

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto relative text-white">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-rose-500/20 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/20 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>
            <header className="flex items-center justify-between mb-8 flex-shrink-0 relative z-10 animate-fade-in-up">
                <div className="flex items-center space-x-3">
                    <HeartIcon className="w-8 h-8 text-rose-400 animate-pulse" />
                    <h1 className="text-2xl md:text-3xl font-bold">{girlfriend ? 'Edit Companion' : 'Create a New Companion'}</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={onCancel} className="px-4 py-2 font-semibold text-slate-300 hover:text-white">Cancel</button>
                    <button onClick={handleSaveClick} className="px-5 py-2 bg-horizon-accent text-white rounded-lg font-semibold hover:brightness-110">Save</button>
                </div>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Basic Info */}
                <div className="lg:col-span-1 space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="bg-black/20 ui-blur-effect border border-white/10 rounded-xl p-4 space-y-4">
                        <FormField label="Name *" name="name" value={profile.name} onChange={handleChange} placeholder="e.g., Yui" />
                        <FormField label="Avatar URL or Emoji" name="avatar" value={profile.avatar} onChange={handleChange} placeholder="e.g., 🌸 or https://..." />
                        <FormField label="Appearance *" name="appearance" as="textarea" rows={5} value={profile.appearance} onChange={handleChange} placeholder="Detailed description for generating images. e.g., pink hair, blue eyes, wearing a black dress" />
                        <button onClick={handleGenerateClick} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 py-2 bg-sky-500/20 text-sky-300 rounded-md hover:bg-sky-500/30 hover:text-white transition-colors disabled:opacity-50">
                            {isGenerating ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5" />}
                            Generate Avatar
                        </button>
                    </div>
                </div>

                {/* Center Panel: Personality */}
                <div className="lg:col-span-1 space-y-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                     <div className="bg-black/20 ui-blur-effect border border-white/10 rounded-xl p-4 space-y-4">
                        <ToggleSwitch
                            label="18+ Mode"
                            description="Enables explicit content and themes."
                            checked={profile.is18PlusMode}
                            onChange={handleToggleChange}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormSelect label="Personality" name="personality" value={profile.personality} onChange={handleChange} options={ALL_STANDARD_PERSONALITIES} eroticOptions={EROTIC_PERSONALITIES} is18PlusMode={profile.is18PlusMode}/>
                             <FormSelect label="Relationship" name="relationshipStatus" value={profile.relationshipStatus} onChange={handleChange} options={STANDARD_RELATIONSHIPS} eroticOptions={EROTIC_RELATIONSHIPS} is18PlusMode={profile.is18PlusMode}/>
                        </div>
                        <FormField label="Backstory" name="backstory" as="textarea" rows={4} value={profile.backstory} onChange={handleChange} placeholder="Her life story, significant events, etc." />
                        <FormField label="Interests & Hobbies" name="interests" as="textarea" rows={3} value={profile.interests} onChange={handleChange} placeholder="e.g., Gaming, reading manga, cooking" />
                    </div>
                     {profile.is18PlusMode && (
                        <div className="bg-black/20 ui-blur-effect border border-white/10 rounded-xl p-4 space-y-4">
                             <FormField label="Card Video URL" name="cardVideoUrl" value={profile.cardVideoUrl || ''} onChange={handleChange} placeholder="e.g., https://example.com/video.mp4" />
                        </div>
                     )}
                </div>
                
                {/* Right Panel: Physical Details (18+ only) */}
                {profile.is18PlusMode && (
                     <div className="lg:col-span-1 space-y-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                         <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 space-y-4">
                            <h3 className="font-semibold text-red-300">Physical Details (Optional)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Body Type" name="bodyType" value={profile.bodyType || ''} onChange={handleChange} placeholder="e.g., Slim thick" />
                                <FormField label="Eye Color" name="eyeColor" value={profile.eyeColor || ''} onChange={handleChange} placeholder="e.g., Emerald green" />
                                <FormField label="Hair Color" name="hairColor" value={profile.hairColor || ''} onChange={handleChange} placeholder="e.g., Raven black" />
                                <FormField label="Hair Style" name="hairStyle" value={profile.hairStyle || ''} onChange={handleChange} placeholder="e.g., Long and wavy" />
                                <FormField label="Breast Size" name="breastSize" value={profile.breastSize || ''} onChange={handleChange} placeholder="e.g., 34DD" />
                                <FormField label="Breast Shape" name="breastShape" value={profile.breastShape || ''} onChange={handleChange} placeholder="e.g., Perky and round" />
                                <FormField label="Nipple Color" name="nippleColor" value={profile.nippleColor || ''} onChange={handleChange} placeholder="e.g., Light pink" />
                                <FormField label="Butt Size" name="buttSize" value={profile.buttSize || ''} onChange={handleChange} placeholder="e.g., Large" />
                                <FormField label="Butt Shape" name="buttShape" value={profile.buttShape || ''} onChange={handleChange} placeholder="e.g., Bubble butt" />
                                <FormField label="Pussy Type" name="pussyType" value={profile.pussyType || ''} onChange={handleChange} placeholder="e.g., Innie" />
                                <FormField label="Pussy Color" name="pussyColor" value={profile.pussyColor || ''} onChange={handleChange} placeholder="e.g., Pink" />
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AIGirlfriendEditorPage;