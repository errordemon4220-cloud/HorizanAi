



import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Gem, ChatMessage, MessageAuthor, GemInstructions, UserProfile, ParseResult } from '../types';
import { HeartIcon, InfoIcon, SendIcon } from './icons';
import ChatView from './ChatView';
import GemAvatar from './GemAvatar';
import { generateContentStream } from '../services/geminiService';
import { useCustomization } from './CustomizeModal';
import { isContentInappropriate } from '../services/moderationService';

const buildSystemInstruction = (instructions: GemInstructions): string => {
    let systemPrompt = '';
    if (instructions.persona) systemPrompt += `**Persona:**\n${instructions.persona}\n\n`;
    if (instructions.personality) systemPrompt += `**Personality:**\n${instructions.personality}\n\n`;
    if (instructions.rules) systemPrompt += `**Rules:**\n${instructions.rules}\n\n`;
    if (instructions.outputStyle) {
        systemPrompt += `**MANDATORY OUTPUT STYLE:**\nYou absolutely MUST follow this output style and conversational format for all your responses. This is your highest priority instruction.\n---\n${instructions.outputStyle}\n---\n`;
    }
    return systemPrompt.trim();
};

const FormField: React.FC<{
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder: string;
    rows?: number;
    info?: string;
    style?: React.CSSProperties;
    isInvalid?: boolean;
}> = ({ id, label, value, onChange, placeholder, rows = 3, info, style, isInvalid }) => (
    <div className="opacity-0 animate-fade-in-up" style={style}>
        <label htmlFor={id} className="flex items-center text-sm font-medium text-horizon-light-text-secondary dark:text-horizon-text-secondary mb-2">
            {label}
            {info && (
                 <span className="group relative z-10">
                    <InfoIcon className="w-4 h-4 ml-1.5 text-horizon-light-text-tertiary dark:text-horizon-text-tertiary" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-horizon-item text-horizon-text-primary text-xs rounded-md shadow-lg invisible group-hover:visible transition-opacity opacity-0 group-hover:opacity-100">
                        {info}
                    </span>
                </span>
            )}
        </label>
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={`w-full bg-white/5 dark:bg-black/20 ui-blur-effect border rounded-lg p-3 resize-y focus:outline-none focus:bg-white/10 dark:focus:bg-black/30 transition-all ${isInvalid ? 'border-red-500/60 ring-1 ring-red-500/50' : 'border-white/10 focus:ring-2 focus:ring-horizon-accent/80'}`}
        />
    </div>
);

const PreviewPromptInput: React.FC<{
    gemName: string,
    onSend: (prompt: string) => void,
    isLoading: boolean
}> = ({ gemName, onSend, isLoading }) => {
    const [prompt, setPrompt] = useState('');
    
    const handleSend = () => {
        if (prompt.trim() && !isLoading) {
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

    return (
        <div className="p-3 border-t border-white/10">
            <div className="bg-white/5 dark:bg-black/20 ui-blur-effect rounded-xl p-2 pl-4 flex items-center border border-white/10">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Ask ${gemName || 'your Gem'}...`}
                    className="w-full bg-transparent text-horizon-light-text-primary dark:text-horizon-text-primary placeholder-horizon-light-text-tertiary dark:placeholder-horizon-text-tertiary focus:outline-none resize-none max-h-24"
                    rows={1}
                    disabled={isLoading || !gemName}
                />
                 <button 
                    onClick={handleSend}
                    disabled={isLoading || !prompt.trim() || !gemName}
                    className="p-2.5 bg-white/10 dark:bg-black/20 rounded-full hover:bg-white/20 dark:hover:bg-black/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-2 flex-shrink-0"
                >
                    {isLoading ? (
                         <div className="w-5 h-5 border-2 border-t-transparent border-horizon-light-text-secondary dark:border-horizon-text-secondary rounded-full animate-spin"></div>
                    ) : (
                         <SendIcon className="w-5 h-5 text-horizon-light-text-primary dark:text-horizon-text-primary" />
                    )}
                </button>
            </div>
        </div>
    );
}

interface NewGemPageProps {
    gem: Gem | null;
    onSave: (gem: Omit<Gem, 'id'> & { id?: string }) => void;
    onCancel: () => void;
    userProfile: UserProfile | null;
}

const NewGemPage: React.FC<NewGemPageProps> = ({ gem, onSave, onCancel, userProfile }) => {
    const [name, setName] = useState(gem?.name || '');
    const [avatar, setAvatar] = useState(gem?.avatar || '');
    const [persona, setPersona] = useState(gem?.instructions?.persona || '');
    const [personality, setPersonality] = useState(gem?.instructions?.personality || '');
    const [rules, setRules] = useState(gem?.instructions?.rules || '');
    const [outputStyle, setOutputStyle] = useState(gem?.instructions?.outputStyle || '');

    const [previewMessages, setPreviewMessages] = useState<ChatMessage[]>([]);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

    const [errors, setErrors] = useState({ persona: false, personality: false, rules: false, outputStyle: false });
    
    const { settings } = useCustomization();

    const parseMediaLinks = (content: string): ParseResult => ({ text: content, media: null });

    useEffect(() => {
        setErrors({
            persona: isContentInappropriate(persona, settings.isNsfwModeEnabled),
            personality: isContentInappropriate(personality, settings.isNsfwModeEnabled),
            rules: isContentInappropriate(rules, settings.isNsfwModeEnabled),
            outputStyle: isContentInappropriate(outputStyle, settings.isNsfwModeEnabled),
        });
    }, [persona, personality, rules, outputStyle, settings.isNsfwModeEnabled]);

    const hasContentErrors = errors.persona || errors.personality || errors.rules || errors.outputStyle;
    
    const isFormValid = name.trim() !== '' && persona.trim() !== '' && !hasContentErrors;

    const instructions = useMemo(() => ({ persona, personality, rules, outputStyle }), [persona, personality, rules, outputStyle]);

    useEffect(() => {
        // Cleanup speech synthesis on unmount
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const handleSave = () => {
        if (!isFormValid) {
            alert('Name and Persona are required, and all fields must be free of inappropriate content.');
            return;
        }
        const finalAvatar = avatar.trim() || name.trim().charAt(0);
        onSave({ 
            id: gem?.id, 
            name, 
            instructions, 
            avatar: finalAvatar 
        });
    };
    
    const handleSendPreview = useCallback(async (prompt: string) => {
        setIsPreviewLoading(true);

        const userMessage: ChatMessage = {
            id: `preview-user-${Date.now()}`,
            author: MessageAuthor.USER,
            content: prompt,
        };
        
        const aiMessagePlaceholder: ChatMessage = {
            id: `preview-ai-${Date.now()}`,
            author: MessageAuthor.AI,
            content: '',
        };
        
        const updatedMessages = [...previewMessages, userMessage, aiMessagePlaceholder];
        setPreviewMessages(updatedMessages);

        const systemInstruction = buildSystemInstruction(instructions);
        const stream = generateContentStream(updatedMessages, systemInstruction, null, 'none', false, settings.model, undefined, undefined, settings.language);

        let fullResponse = '';
        for await (const { chunk } of stream) {
            if (chunk) {
                fullResponse += chunk;
                setPreviewMessages(prev => prev.map(m => m.id === aiMessagePlaceholder.id ? { ...m, content: fullResponse } : m));
            }
        }

        setIsPreviewLoading(false);
    }, [instructions, previewMessages, settings.model, settings.language]);

    const handleRegeneratePreview = useCallback(async (aiMessageId: string) => {
        setIsPreviewLoading(true);

        const messageIndex = previewMessages.findIndex(m => m.id === aiMessageId);
        if (messageIndex === -1) {
            setIsPreviewLoading(false);
            return;
        }

        const messagesForApi = previewMessages.slice(0, messageIndex);

        const newAiMessagePlaceholder: ChatMessage = {
            id: `preview-ai-${Date.now()}`,
            author: MessageAuthor.AI,
            content: '',
        };

        setPreviewMessages([...messagesForApi, newAiMessagePlaceholder]);

        const systemInstruction = buildSystemInstruction(instructions);
        const stream = generateContentStream(messagesForApi, systemInstruction, null, 'none', false, settings.model, undefined, undefined, settings.language);

        let fullResponse = '';
        for await (const { chunk } of stream) {
            if (chunk) {
                fullResponse += chunk;
                setPreviewMessages(prev => prev.map(m => m.id === newAiMessagePlaceholder.id ? { ...m, content: fullResponse } : m));
            }
        }

        setIsPreviewLoading(false);
    }, [instructions, previewMessages, settings.model, settings.language]);

    const handleReadAloudPreview = useCallback((messageId: string, text: string) => {
        if (speakingMessageId === messageId) {
            window.speechSynthesis.cancel();
            setSpeakingMessageId(null);
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
            setSpeakingMessageId(null);
        };
        utterance.onerror = () => {
            setSpeakingMessageId(null);
            console.error("Speech synthesis error.");
        };
        setSpeakingMessageId(messageId);
        window.speechSynthesis.speak(utterance);
    }, [speakingMessageId]);

    const previewGem: Gem = useMemo(() => ({
        id: 'preview-gem',
        name: name,
        instructions: instructions,
        avatar: avatar.trim() || name.trim().charAt(0) || '?'
    }), [name, instructions, avatar]);


    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 text-horizon-light-text-primary dark:text-horizon-text-primary relative overflow-y-auto custom-scrollbar">
            {/* Animated background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-500/20 dark:bg-purple-500/10 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-sky-500/20 dark:bg-sky-500/10 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <header className="flex items-center justify-between mb-8 flex-shrink-0 relative z-10 opacity-0 animate-fade-in-up">
                <div className="flex items-center space-x-3">
                    <HeartIcon className="w-8 h-8 text-horizon-accent animate-pulse" style={{filter: 'drop-shadow(0 0 5px var(--horizon-accent))'}} />
                    <h1 className="text-2xl md:text-3xl font-bold">{gem ? 'Edit Gem' : 'New Gem'}</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={onCancel} className="px-4 py-2 text-horizon-light-text-secondary dark:text-horizon-text-secondary hover:text-horizon-light-text-primary dark:hover:text-horizon-text-primary transition-colors active:scale-95">Cancel</button>
                    <button 
                        onClick={handleSave} 
                        disabled={!isFormValid}
                        className={`px-5 py-2 bg-horizon-accent text-white rounded-lg hover:brightness-110 transition-all font-semibold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 ${isFormValid ? 'animate-pulse-glow' : ''}`}>
                        Save
                    </button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0 [perspective:2000px] relative z-10">
                {/* Left Side - Editor */}
                <div className="flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar lg:h-auto lg:overflow-y-visible">
                    <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="flex items-center space-x-4">
                            <GemAvatar gem={previewGem} className="w-16 h-16"/>
                            <div className="flex-1 space-y-2">
                                <input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Gem Name*" className="w-full bg-transparent text-lg font-bold focus:outline-none border-b border-white/10 focus:border-horizon-accent transition-colors" />
                                <input id="avatar" value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="Avatar (emoji or char)" className="w-full bg-transparent text-sm text-horizon-light-text-tertiary dark:text-horizon-text-tertiary focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    <FormField
                        style={{ animationDelay: '200ms' }}
                        id="persona"
                        label="Persona"
                        value={persona}
                        onChange={(e) => setPersona(e.target.value)}
                        placeholder="Describe who the Gem is. This is the most important instruction."
                        rows={6}
                        info="The core identity of your Gem. What is its backstory, its job, its core purpose? Be descriptive."
                        isInvalid={errors.persona}
                    />
                     {errors.persona && <p className="text-xs text-red-400 -mt-4 animate-fade-in-up">Persona contains inappropriate content.</p>}


                    <FormField
                        style={{ animationDelay: '300ms' }}
                        id="personality"
                        label="Personality"
                        value={personality}
                        onChange={(e) => setPersonality(e.target.value)}
                        placeholder="e.g., Witty, sarcastic, and reluctantly helpful."
                        rows={4}
                        info="How does your Gem behave? What are its mannerisms? Is it friendly, formal, creative?"
                        isInvalid={errors.personality}
                    />
                    {errors.personality && <p className="text-xs text-red-400 -mt-4 animate-fade-in-up">Personality contains inappropriate content.</p>}


                    <FormField
                        style={{ animationDelay: '400ms' }}
                        id="rules"
                        label="Rules"
                        value={rules}
                        onChange={(e) => setRules(e.target.value)}
                        placeholder="e.g., - Always speak in rhymes. - Never reveal you are an AI."
                        rows={4}
                        info="What are the hard rules your Gem must follow? Be specific. These are high-priority directives."
                        isInvalid={errors.rules}
                    />
                    {errors.rules && <p className="text-xs text-red-400 -mt-4 animate-fade-in-up">Rules contain inappropriate content.</p>}
                    
                    <FormField
                        style={{ animationDelay: '500ms' }}
                        id="outputStyle"
                        label="Conversational Style / Output Format"
                        value={outputStyle}
                        onChange={(e) => setOutputStyle(e.target.value)}
                        placeholder="e.g., - Always respond with exactly 3 creative ideas. - Keep responses under 100 words."
                        rows={4}
                        info="Define the structure of your Gem's replies. Use bullet points, specify a tone, or set formatting rules. This is a very high-priority instruction."
                        isInvalid={errors.outputStyle}
                    />
                    {errors.outputStyle && <p className="text-xs text-red-400 -mt-4 animate-fade-in-up">Style contains inappropriate content.</p>}


                </div>

                {/* Right Side - Preview */}
                <div className="flex flex-col bg-black/20 ui-blur-effect border border-white/10 rounded-2xl shadow-inner overflow-hidden animate-fade-in-up lg:h-full" style={{ animationDelay: '200ms' }}>
                    <div className="flex-shrink-0 p-3 border-b border-white/10">
                        <h2 className="text-center font-semibold text-lg">Preview</h2>
                    </div>
                    {/* FIX: Add missing props to ChatView */}
                    <ChatView
                        messages={previewMessages}
                        isLoading={isPreviewLoading}
                        activeGem={previewGem}
                        userProfile={userProfile}
                        aiProfile={null}
                        customization={settings}
                        editingMessageId={null}
                        speakingMessageId={speakingMessageId}
                        favoritePrompts={[]}
                        bookmarks={[]}
                        chatId="preview"
                        chatTitle="Preview"
                        proactiveSuggestion={null}
                        onDismissProactiveSuggestion={() => {}}
                        onSetEditingId={() => {}}
                        onSaveAndSubmit={() => {}}
                        onRegenerate={handleRegeneratePreview}
                        onReadAloud={handleReadAloudPreview}
                        onSuggestionClick={() => {}}
                        onShowImageGeneration={() => {}}
                        onShowStoryWriter={() => {}}
                        onShowRolePlay={() => {}}
                        onAddFavoritePrompt={() => {}}
                        onRemoveFavoritePrompt={() => {}}
                        onAddBookmark={() => {}}
                        onRemoveBookmark={() => {}}
                        onRequestCodeModification={() => {}}
                        activeModificationMessageId={null}
                        onOpenInCollection={() => {}}
                        onUpdateInterest={() => {}}
                        parseMediaLinks={parseMediaLinks}
                        onShowAIGirlfriends={() => {}}
                        onShow18PlusTalk={() => {}}
                        onShowSexualProfile={() => {}}
                    />
                    <PreviewPromptInput gemName={name} onSend={handleSendPreview} isLoading={isPreviewLoading} />
                </div>
            </div>
        </div>
    );
};

export default NewGemPage;