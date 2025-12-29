
import React, { useState, useMemo, ChangeEvent, useEffect, useRef } from 'react';
import { RolePlaySetup, ChatMessage, UserProfile, RolePlayCharacterType, StoryTone, CustomizationSettings, ImageFile } from '../types';
import RolePlayView from './RolePlayView';
import { UsersIcon, TrashIcon, SendIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, ImageIcon, LoaderIcon } from './icons';
import { isContentInappropriate } from '../services/moderationService';
import * as dbService from '../services/dbService';


// SimplePromptInput
const SimplePromptInput: React.FC<{
    onSend: (prompt: string) => void;
    isLoading: boolean;
    placeholder: string;
    isDisabled: boolean;
    disabledReason: string;
    isNsfwModeEnabled: boolean;
}> = ({ onSend, isLoading, placeholder, isDisabled, disabledReason, isNsfwModeEnabled }) => {
    const [prompt, setPrompt] = useState('');
    const [isPromptInappropriate, setIsPromptInappropriate] = useState(false);

    useEffect(() => {
        setIsPromptInappropriate(isContentInappropriate(prompt, isNsfwModeEnabled));
    }, [prompt, isNsfwModeEnabled]);
    
    const handleSend = () => {
        if (prompt.trim() && !isLoading && !isPromptInappropriate) {
            onSend(prompt.trim());
            setPrompt('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (isDisabled) {
        return (
            <div className="p-4 border-t border-white/10 text-center text-sm text-red-400/80 bg-red-900/10">
                {disabledReason}
            </div>
        );
    }
    
    const hasContent = prompt.trim().length > 0;

    return (
        <div className="p-4 border-t border-white/10">
             <div 
                className="[transform-style:preserve-3d] bg-horizon-item/40 backdrop-blur-2xl border rounded-2xl shadow-2xl shadow-black/20 w-full transition-all duration-500 hover:[transform:translateZ(20px)_rotateX(-5deg)]"
              >
                <div className="relative p-2 pl-4 [transform:translateZ(20px)]">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className={`w-full bg-transparent text-horizon-text-primary placeholder-horizon-text-tertiary focus:outline-none resize-none pr-16 max-h-32 shadow-inner-lg rounded-lg p-2 transition-shadow ${isPromptInappropriate ? 'ring-2 ring-red-500/50' : 'focus:shadow-md focus:shadow-horizon-accent/50'}`}
                        rows={1}
                        disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                         <button 
                            onClick={handleSend}
                            disabled={isLoading || !hasContent || isPromptInappropriate}
                            className={`group relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] [transform-style:preserve-3d] active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed
                                       hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 hover:-translate-y-1
                                       ${(hasContent && !isLoading && !isPromptInappropriate) 
                                            ? 'bg-gradient-to-br from-purple-500 to-indigo-700 shadow-lg shadow-purple-500/40 animate-pulse-glow' 
                                            : 'bg-slate-800/60 backdrop-blur-sm border border-slate-600/60 shadow-md'
                                       }`}
                        >
                            <div className={`absolute inset-0.5 rounded-full transition-all duration-500 ease-in-out
                                            ${(hasContent && !isLoading && !isPromptInappropriate) 
                                                ? 'bg-purple-500/50 blur-lg' 
                                                : 'group-hover:bg-purple-500/20 group-hover:blur-md opacity-0 group-hover:opacity-100'
                                            }`}>
                            </div>
                            <div className="relative [transform:translateZ(10px)] text-white">
                            {isLoading ? (
                                 <div className="w-5 h-5 border-2 border-t-transparent border-white/80 rounded-full animate-spin"></div>
                            ) : (
                                 <SendIcon className="w-5 h-5" />
                            )}
                            </div>
                        </button>
                    </div>
                </div>
                 {isPromptInappropriate && (
                    <p className="text-xs text-red-400 text-center pb-2 [transform:translateZ(10px)]">
                      Inappropriate content is not allowed.
                    </p>
                )}
            </div>
        </div>
    );
};


const FormSelect: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: readonly string[];
}> = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-horizon-text-secondary mb-1.5">{label}</label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full appearance-none bg-black/20 border border-white/10 rounded-lg p-2.5 pr-8 focus:outline-none focus:ring-1 focus:ring-horizon-accent transition-colors text-horizon-text-primary"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-horizon-text-tertiary">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  </div>
);

const FormField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  as?: 'input' | 'textarea';
  rows?: number;
  isInvalid?: boolean;
}> = ({ label, name, value, onChange, placeholder, as = 'input', rows = 3, isInvalid }) => (
  <div>
    <label className="block text-sm font-medium text-horizon-text-secondary mb-1.5">{label}</label>
    {as === 'input' ? (
        <input name={name} value={value} onChange={onChange} placeholder={placeholder} className={`w-full text-sm bg-black/20 border rounded-lg p-2.5 focus:outline-none focus:ring-1 transition-colors ${isInvalid ? 'border-red-500/60 ring-1 ring-red-500/50' : 'border-white/10 focus:ring-horizon-accent'}`} />
    ) : (
        <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} className={`w-full text-sm bg-black/20 border rounded-lg p-2.5 resize-y focus:outline-none focus:ring-1 transition-colors ${isInvalid ? 'border-red-500/60 ring-1 ring-red-500/50' : 'border-white/10 focus:ring-horizon-accent'}`}/>
    )}
    {isInvalid && <p className="text-xs text-red-400 mt-1">Inappropriate content detected in this field.</p>}
  </div>
);

const RolePlayCharacterAvatar: React.FC<{ avatar: string, name: string, className?: string }> = ({ avatar, name, className = 'w-8 h-8' }) => {
    const isUrl = avatar?.startsWith('http') || avatar?.startsWith('data:');
    if (isUrl) {
        return <img src={avatar} alt={name} className={`${className} flex-shrink-0 rounded-full object-cover`} />;
    }
    const isEmoji = avatar && /\p{Emoji}/u.test(avatar);
    const char = avatar?.trim().charAt(0) || name?.trim().charAt(0) || '?';
    
    if (isEmoji) {
        return (
            <div className={`${className} flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500`}>
                <span className={className.includes('w-8') ? 'text-xl' : 'text-4xl'}>{avatar}</span>
            </div>
        )
    }

    return (
        <div className={`${className} flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white font-bold`}>
            <span className={className.includes('w-8') ? 'text-md' : 'text-xl'}>{char.toUpperCase()}</span>
        </div>
    )
};

const ThemedBackground: React.FC<{ tone: StoryTone }> = ({ tone }) => {
    let colors: [string, string] = ['bg-slate-600/20', 'bg-sky-700/20']; // Default for General/Neutral
    
    switch (tone) {
        case 'Dark & Gritty':
            colors = ['bg-slate-700/30', 'bg-red-900/20'];
            break;
        case 'Epic & Grandiose':
            colors = ['bg-indigo-600/30', 'bg-purple-800/30'];
            break;
        case 'Humorous & Lighthearted':
            colors = ['bg-amber-400/20', 'bg-rose-400/20'];
            break;
        case 'Mysterious & Suspenseful':
            colors = ['bg-indigo-900/40', 'bg-slate-800/40'];
            break;
        case 'Romantic & Emotional':
            colors = ['bg-pink-500/20', 'bg-rose-500/20'];
            break;
        default:
            break;
    }

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className={`absolute -top-1/4 -left-1/4 w-3/4 h-3/4 ${colors[0]} rounded-full filter blur-3xl animate-aurora opacity-60`}></div>
            <div className={`absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 ${colors[1]} rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-60`}></div>
        </div>
    );
};

interface RolePlayPageProps {
    setup: RolePlaySetup;
    messages: ChatMessage[];
    onSetupUpdate: (update: Partial<RolePlaySetup>) => void;
    onSendMessage: (prompt: string) => void;
    isLoading: boolean;
    userProfile: UserProfile | null;
    customization: CustomizationSettings;
    onClearChat: () => void;
    isNsfwModeEnabled: boolean;
    onGenerateCharacterFromImage: (image: ImageFile) => void;
}

const RolePlayPage: React.FC<RolePlayPageProps> = ({ setup, messages, onSetupUpdate, onSendMessage, isLoading, userProfile, customization, onClearChat, isNsfwModeEnabled, onGenerateCharacterFromImage }) => {
    const [isSetupHidden, setIsSetupHidden] = useState(false);
    const [errors, setErrors] = useState({
        userRole: false,
        scenario: false,
        persona: false,
        personality: false,
        rules: false,
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onGenerateCharacterFromImage({
                    data: reader.result as string,
                    mimeType: file.type,
                });
            };
            reader.readAsDataURL(file);
        }
        if(event.target) event.target.value = ''; // Reset file input
    };


    useEffect(() => {
        setErrors({
            userRole: isContentInappropriate(setup.userRole, isNsfwModeEnabled),
            scenario: isContentInappropriate(setup.scenario, isNsfwModeEnabled),
            persona: isContentInappropriate(setup.persona, isNsfwModeEnabled),
            personality: isContentInappropriate(setup.personality, isNsfwModeEnabled),
            rules: isContentInappropriate(setup.rules, isNsfwModeEnabled),
        });
    }, [setup, isNsfwModeEnabled]);

    const hasSetupErrors = Object.values(errors).some(Boolean);

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        onSetupUpdate({ [e.target.name]: e.target.value });
    };

    const characterTypes: RolePlayCharacterType[] = ['Custom', 'Anime Character', 'Movie Character', 'Video Game Character', 'Historical Figure', 'Fantasy Character', 'Sci-Fi Character', 'Superhero', 'Villain', 'Sister', 'Brother', 'Mother', 'Father', 'Friend', 'Rival', 'Mentor', 'Teacher', 'Boss', 'Celebrity'];
    const tones: StoryTone[] = ['General/Neutral', 'Dark & Gritty', 'Humorous & Lighthearted', 'Epic & Grandiose', 'Mysterious & Suspenseful', 'Romantic & Emotional'];

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 relative overflow-y-auto custom-scrollbar">
            <ThemedBackground tone={setup.tone} />
            <div className="relative z-10 flex flex-col flex-1 min-h-0">
                <header className="text-center mb-8 animate-fade-in-up flex-shrink-0">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400" style={{ textShadow: '0 2px 10px rgba(255, 255, 255, 0.1)' }}>
                        Role Play Stage
                    </h1>
                    <p className="mt-3 text-lg text-horizon-text-secondary">Craft your character, set the scene, and start the adventure.</p>
                </header>

                <div className={`flex-1 grid ${isSetupHidden ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-8 min-h-0`}>
                    {/* Left Panel: Setup */}
                    <div className={`flex flex-col space-y-4 bg-black/20 ui-blur-effect border border-white/10 rounded-2xl p-6 overflow-y-auto shadow-2xl animate-fade-in-up ${isSetupHidden ? 'hidden' : ''}`}>
                        <h2 className="text-lg font-bold flex items-center gap-2">Scenario & Character</h2>
                        
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 py-3 bg-indigo-600/50 text-white rounded-lg font-semibold hover:bg-indigo-500/50 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <LoaderIcon className="w-5 h-5 animate-spin"/>
                                    <span>Analyzing Character...</span>
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="w-5 h-5"/>
                                    <span>Generate Character from Image</span>
                                </>
                            )}
                        </button>
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                            <div className="flex-1 h-px bg-slate-700"></div>
                            <span>OR</span>
                            <div className="flex-1 h-px bg-slate-700"></div>
                        </div>

                        <FormField label="Your Role" name="userRole" value={setup.userRole} onChange={handleFieldChange} placeholder="e.g., A weary traveler" isInvalid={errors.userRole} />

                        <FormField label="Scenario" name="scenario" as="textarea" value={setup.scenario} onChange={handleFieldChange} placeholder="Describe the setting and situation." rows={4} isInvalid={errors.scenario} />
                        
                        <div className="pt-4 border-t border-white/20 space-y-4">
                            <div className="flex items-center gap-4">
                                <RolePlayCharacterAvatar avatar={setup.avatar} name={setup.characterName} className="w-16 h-16"/>
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <FormField label="Character Name" name="characterName" value={setup.characterName} onChange={handleFieldChange} placeholder="e.g., Captain Eva"/>
                                    <FormField label="Character Avatar" name="avatar" value={setup.avatar} onChange={handleFieldChange} placeholder="e.g., 👩‍🚀"/>
                                </div>
                            </div>
                            <FormSelect label="Character Type" name="characterType" value={setup.characterType} onChange={handleFieldChange} options={characterTypes} />
                            <FormField label="Persona / Backstory" name="persona" as="textarea" value={setup.persona} onChange={handleFieldChange} placeholder="Describe the character's background, appearance, and motivations." rows={4} isInvalid={errors.persona}/>
                            <FormField label="Personality" name="personality" as="textarea" value={setup.personality} onChange={handleFieldChange} placeholder="List key traits, likes, dislikes. e.g., - Impulsive\n- Secretly kind" rows={3} isInvalid={errors.personality}/>
                            <FormSelect label="Tone" name="tone" value={setup.tone} onChange={handleFieldChange} options={tones} />
                            <FormField label="Rules / Boundaries" name="rules" as="textarea" value={setup.rules} onChange={handleFieldChange} placeholder="e.g., - No violence\n- Keep it medieval fantasy" rows={3} isInvalid={errors.rules}/>
                        </div>
                    </div>

                    {/* Right Panel: Chat */}
                    <div className="flex flex-col bg-black/30 ui-blur-effect border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up" style={{animationDelay: '150ms'}}>
                        <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <RolePlayCharacterAvatar avatar={setup.avatar} name={setup.characterName} />
                                <div>
                                    <h3 className="font-semibold text-horizon-text-primary">{setup.characterName || 'Character'}</h3>
                                    <p className="text-xs text-horizon-text-tertiary">Role-playing with you</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={onClearChat} title="Clear chat history" className="p-2 text-horizon-text-tertiary hover:text-red-400 hover:bg-white/10 rounded-md transition">
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                                <button
                                    onClick={() => setIsSetupHidden(prev => !prev)}
                                    title={isSetupHidden ? 'Show Setup' : 'Hide Setup'}
                                    className="p-2 text-horizon-text-tertiary hover:text-white hover:bg-white/10 rounded-md transition hidden lg:block"
                                    >
                                    {isSetupHidden ? <PanelLeftOpenIcon className="w-5 h-5" /> : <PanelLeftCloseIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        
                        <RolePlayView
                            messages={messages}
                            setup={setup}
                            userProfile={userProfile}
                            isLoading={isLoading}
                        />
                        
                        <SimplePromptInput
                            onSend={onSendMessage}
                            isLoading={isLoading}
                            placeholder={hasSetupErrors ? 'Fix setup to chat' : `Chat with ${setup.characterName || 'your character'}...`}
                            isDisabled={hasSetupErrors}
                            disabledReason="Please remove inappropriate content from the setup fields to begin."
                            isNsfwModeEnabled={isNsfwModeEnabled}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RolePlayPage;
