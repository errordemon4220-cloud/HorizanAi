import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PaperClipIcon, MicIcon, SendIcon, StopIcon, CameraIcon, XCircleIcon, BrainCircuitIcon, ClipboardIcon, ChevronUpIcon, PlusIcon, CheckIcon, XIcon, SlidersIcon, GlobeIcon, TelescopeIcon, LightbulbIcon, PencilIcon, LibraryIcon, StarIcon, TrashIcon, FileCodeIcon, CanvasIcon, PaletteIcon } from './icons';
// FIX: Move ParseResult and ParsedMedia to types.ts and import from there
import { ImageFile, CustomizationSettings, Gem, AIProfile, AiTool, FavoritePrompt, ParseResult, ParsedMedia } from '../types';
import CameraModal from './CameraModal';
import ImageSelectionModal from './ImageSelectionModal';
import GemAvatar from './GemAvatar';
import { isContentInappropriate } from '../services/moderationService';
import { gsap } from 'gsap';

// Type definitions to satisfy TypeScript for the Web Speech API
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    isFinal: boolean;
    [key: number]: {
      transcript: string;
    };
  }[];
}
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: any) => void;
  start: () => void;
  stop: () => void;
}
declare global {
  interface Window {
    SpeechRecognition?: { new(): SpeechRecognition };
    webkitSpeechRecognition?: { new(): SpeechRecognition };
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

interface GemSelectorProps {
    gems: Gem[];
    activeGem: Gem | null;
    aiProfile: AIProfile;
    onSelectGem: (gemId: string | null) => void;
    onManageGems: () => void;
}

const GemSelector: React.FC<GemSelectorProps> = React.memo(({ gems, activeGem, aiProfile, onSelectGem, onManageGems }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (gemId: string | null) => {
        onSelectGem(gemId);
        setIsOpen(false);
    };

    const currentName = activeGem?.name || aiProfile.name;
    const isDefault = !activeGem;

    return (
        <div ref={selectorRef} className="relative mb-3 [transform:translateZ(40px)]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative flex items-center gap-2 px-4 py-2 backdrop-blur-sm border rounded-full text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95
                bg-slate-800/60 border-slate-600/60 text-slate-300
                hover:text-white hover:border-slate-500/80
                hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 hover:-translate-y-0.5`}
            >
                <div className="absolute -inset-px rounded-full transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100 bg-purple-500/20 blur-md"></div>
                <div className="relative flex items-center gap-2">
                    <span>{currentName}</span>
                    <ChevronUpIcon className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-0' : 'rotate-180'}`} />
                </div>
            </button>

            {isOpen && (
                <div className="absolute bottom-full mb-2 w-80 bg-teal-900/70 backdrop-blur-2xl border border-white/20 rounded-xl shadow-lg p-2 animate-scale-in-pop z-10">
                    <div className="flex items-center justify-between px-2 py-1 mb-1">
                        <h3 className="text-xs font-semibold tracking-wider uppercase text-horizon-text-tertiary">Custom instruction profiles</h3>
                        <button onClick={() => { setIsOpen(false); onManageGems(); }} className="p-1 rounded-full text-horizon-text-tertiary hover:bg-white/10">
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                        {/* Default Profile */}
                        <button onClick={() => handleSelect(null)} className="w-full flex items-center justify-between text-left gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                                <img src={aiProfile.avatarUrl} alt={aiProfile.name} className="w-7 h-7 rounded-full flex-shrink-0" />
                                <span className="text-sm font-semibold truncate">{aiProfile.name} (Default)</span>
                            </div>
                            {isDefault && (
                                <span className="text-xs font-bold text-horizon-accent flex-shrink-0">Enabled</span>
                            )}
                        </button>

                        {/* Gems List */}
                        {gems.map(gem => (
                            <button key={gem.id} onClick={() => handleSelect(gem.id)} className="w-full flex items-center justify-between text-left gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <GemAvatar gem={gem} className="w-7 h-7" />
                                    <span className="text-sm font-semibold truncate">{gem.name}</span>
                                </div>
                                {activeGem?.id === gem.id && (
                                     <span className="text-xs font-bold text-horizon-accent flex-shrink-0">Enabled</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

// New Tools Menu Component
interface ToolsMenuProps {
    activeTool: AiTool;
    onSetTool: (tool: AiTool) => void;
}

const ToolsMenu: React.FC<ToolsMenuProps> = React.memo(({ activeTool, onSetTool }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const tools = [
        { id: 'none', label: 'Standard Chat', icon: <PencilIcon className="w-5 h-5" /> },
        { id: 'web_search', label: 'Search the web', icon: <GlobeIcon className="w-5 h-5" /> },
        { id: 'deep_research', label: 'Run deep research', icon: <TelescopeIcon className="w-5 h-5" /> },
    ];

    const ActiveIcon = tools.find(t => t.id === activeTool)?.icon || <SlidersIcon className="w-5 h-5" />;

    return (
        <div ref={menuRef} className="relative">
             <ActionButton
                title="Select a tool"
                onClick={() => setIsOpen(!isOpen)}
                isActive={activeTool === 'web_search' || activeTool === 'deep_research'}
            >
                {ActiveIcon}
            </ActionButton>

            {isOpen && (
                 <div className="absolute bottom-full mb-2 w-64 bg-horizon-sidebar/70 backdrop-blur-2xl border border-white/20 rounded-xl shadow-lg p-2 animate-scale-in-pop z-10">
                    {tools.map((tool, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                onSetTool(tool.id as AiTool);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTool === tool.id ? 'bg-horizon-accent text-white' : 'text-horizon-text-primary hover:bg-white/5'}`}
                         >
                            <div className="flex-shrink-0">{tool.icon}</div>
                            <span className="font-semibold">{tool.label}</span>
                         </button>
                    ))}
                 </div>
            )}
        </div>
    );
});


interface VoiceInputUIProps {
    onConfirm: (transcript: string) => void;
    onCancel: () => void;
    onError: (message: string) => void;
}

const VoiceInputUI: React.FC<VoiceInputUIProps> = React.memo(({ onConfirm, onCancel, onError }) => {
    const orbRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<HTMLDivElement>(null);
    const particles = useRef<HTMLDivElement[]>([]);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const animationFrameIdRef = useRef<number | undefined>(undefined);
    const [finalTranscript, setFinalTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');

    const updateVisualizer = useCallback(() => {
        if (!analyserRef.current || !orbRef.current) {
            animationFrameIdRef.current = requestAnimationFrame(updateVisualizer);
            return;
        };
        const analyser = analyserRef.current;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const scale = 1 + (average / 255) * 0.5;
        const glow = Math.min(20, 5 + (average / 255) * 15);

        gsap.to(orbRef.current, {
            scale: scale,
            boxShadow: `0 0 ${glow}px var(--horizon-accent, #8b5cf6), 0 0 ${glow * 2}px var(--horizon-accent-hover, #a78bfa)`,
            duration: 0.1,
            ease: 'power1.out'
        });
        
        particles.current.forEach(p => {
            if (!gsap.isTweening(p)) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 50 + Math.random() * 50;
                gsap.fromTo(p, {
                    x: 0, y: 0, opacity: 1, scale: Math.random() * 0.5 + 0.5,
                }, {
                    x: Math.cos(angle) * radius, y: Math.sin(angle) * radius,
                    opacity: 0, scale: 0, duration: Math.random() * 1 + 0.5, ease: 'power1.out'
                });
            }
        });

        animationFrameIdRef.current = requestAnimationFrame(updateVisualizer);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const cleanup = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            if (recognitionRef.current) {
                recognitionRef.current.onresult = null;
                recognitionRef.current.onend = null;
                recognitionRef.current.onerror = null;
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
        };

        const setup = async () => {
            if (particlesRef.current && particles.current.length === 0) {
                for (let i = 0; i < 20; i++) {
                    const p = document.createElement('div');
                    p.className = 'absolute w-2 h-2 rounded-full bg-horizon-accent';
                    particlesRef.current.appendChild(p);
                    particles.current.push(p);
                }
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                if (cancelled) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }
                streamRef.current = stream;

                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioContextRef.current = new AudioContext();
                const source = audioContextRef.current.createMediaStreamSource(stream);
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 256;
                source.connect(analyserRef.current);
                
                animationFrameIdRef.current = requestAnimationFrame(updateVisualizer);

                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (SpeechRecognition) {
                    recognitionRef.current = new SpeechRecognition();
                    recognitionRef.current.continuous = true;
                    recognitionRef.current.interimResults = true;
                    recognitionRef.current.lang = 'en-US';

                    recognitionRef.current.onresult = (event) => {
                        let final = '';
                        let interim = '';
                        for (let i = 0; i < event.results.length; ++i) {
                            const transcriptPart = event.results[i][0].transcript;
                            if (event.results[i].isFinal) {
                                final += transcriptPart + ' ';
                            } else {
                                interim += transcriptPart;
                            }
                        }
                        setFinalTranscript(final);
                        setInterimTranscript(interim);
                    };
                    
                    recognitionRef.current.onerror = (event) => {
                       console.error('Speech recognition error', event.error);
                       if (event.error === 'no-speech' || event.error === 'network' || event.error === 'not-allowed') {
                          onCancel();
                       }
                    };
                    
                    recognitionRef.current.start();
                } else {
                    console.warn("Speech recognition not supported");
                    onCancel();
                }

            } catch (err) {
                console.error("Error setting up voice input:", err);
                let message = "Could not start voice input. Please check your microphone and browser permissions.";
                if (err instanceof DOMException) {
                    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                        message = "Microphone permission was denied. Please allow access in your browser settings to use voice input.";
                    } else if (err.name === 'NotFoundError') {
                        message = "No microphone was found. Please connect a microphone and try again.";
                    } else if (err.name === 'NotReadableError') {
                        message = "Your microphone is already in use by another application.";
                    }
                }
                onError(message);
                onCancel();
            }
        };

        setup();

        return () => {
            cancelled = true;
            cleanup();
        };
    }, [updateVisualizer, onCancel, onError]);

    return (
        <div className="w-full flex flex-col items-center justify-center gap-4 p-4 min-h-[16rem] animate-scale-in-pop">
            <div className="relative w-48 h-48 flex items-center justify-center">
                <div ref={particlesRef} className="absolute inset-0"></div>
                <div ref={orbRef} className="w-24 h-24 bg-horizon-accent/50 rounded-full border-2 border-horizon-accent" style={{ transform: 'scale(1)' }}></div>
            </div>
            <p className="w-full text-center text-lg text-horizon-text-primary px-2 min-h-[2.5rem]">
                {finalTranscript}
                <span className="text-horizon-text-tertiary">{interimTranscript}</span>
            </p>
            <div className="flex items-center gap-4">
                 <ActionButton 
                    title="Cancel"
                    onClick={() => {
                        if (recognitionRef.current) recognitionRef.current.stop();
                        onCancel();
                    }}
                 >
                     <XIcon className="w-6 h-6" />
                 </ActionButton>
                <ActionButton
                    title="Confirm"
                    onClick={() => {
                        if (recognitionRef.current) recognitionRef.current.stop();
                        onConfirm((finalTranscript + interimTranscript).trim());
                    }}
                    isActive={true}
                >
                    <CheckIcon className="w-6 h-6" />
                </ActionButton>
            </div>
        </div>
    );
});

interface ActionButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    title: string;
    disabled?: boolean;
    isActive?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = React.memo(({ children, onClick, title, disabled, isActive }) => (
    <button
        title={title}
        onClick={onClick}
        disabled={disabled}
        className={`group relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] [transform-style:preserve-3d] active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed
                   ${isActive 
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-700 shadow-lg shadow-purple-500/40' 
                        : 'bg-slate-800/60 backdrop-blur-sm border border-slate-600/60 shadow-md'
                   }
                   hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 hover:-translate-y-1
                   `}
    >
        {/* A subtle background glow effect */}
        <div className={`absolute inset-0.5 rounded-full transition-all duration-500 ease-in-out
                        ${isActive 
                            ? 'bg-purple-500/50 blur-lg animate-pulse [animation-duration:3s]' 
                            : 'group-hover:bg-purple-500/20 group-hover:blur-md opacity-0 group-hover:opacity-100'
                        }`}>
        </div>
        
        {/* The main icon container with 3D effect */}
        <div className="relative [transform:translateZ(10px)] text-slate-200 group-hover:text-white transition-colors duration-200">
            {children}
        </div>
    </button>
));


interface PromptInputProps {
  onSend: () => void;
  isLoading: boolean;
  useMemory: boolean;
  onToggleMemory: () => void;
  matchUserStyle: boolean;
  onToggleMatchStyle: () => void;
  customization: CustomizationSettings;
  isNsfwModeEnabled: boolean;
  gems: Gem[];
  activeGem: Gem | null;
  aiProfile: AIProfile;
  onSelectGem: (gemId: string | null) => void;
  onManageGems: () => void;
  activeTool: AiTool;
  onSetTool: (tool: AiTool) => void;
  allAvailableImages: ImageFile[];
  prompt: string;
  onPromptChange: (value: string) => void;
  imageFile: ImageFile | null;
  onImageFileChange: (file: ImageFile | null) => void;
  favoritePrompts: FavoritePrompt[];
  onAddFavoritePrompt: (text: string) => void;
  onRemoveFavoritePrompt: (id: string) => void;
  parseMediaLinks: (content: string) => ParseResult;
}

const PromptInput: React.FC<PromptInputProps> = React.memo(({ 
    onSend, 
    isLoading, 
    useMemory, 
    onToggleMemory, 
    matchUserStyle,
    onToggleMatchStyle,
    customization,
    isNsfwModeEnabled,
    gems,
    activeGem,
    aiProfile,
    onSelectGem,
    onManageGems,
    activeTool,
    onSetTool,
    allAvailableImages,
    prompt,
    onPromptChange,
    imageFile,
    onImageFileChange,
    favoritePrompts,
    onAddFavoritePrompt,
    onRemoveFavoritePrompt,
    parseMediaLinks,
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isImageSelectionOpen, setIsImageSelectionOpen] = useState(false);
  const [isPromptInappropriate, setIsPromptInappropriate] = useState(false);
  const [isFavMenuOpen, setIsFavMenuOpen] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [detectedMedia, setDetectedMedia] = useState<ParsedMedia | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const favMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { media } = parseMediaLinks(prompt);
    if (media && imageFile) {
      onImageFileChange(null);
    }
    setDetectedMedia(media);
  }, [prompt, imageFile, onImageFileChange, parseMediaLinks]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  useEffect(() => {
      setIsPromptInappropriate(isContentInappropriate(prompt, isNsfwModeEnabled));
  }, [prompt, isNsfwModeEnabled]);
  
  useEffect(() => {
    if (voiceError) {
        alert(`Voice Input Error: ${voiceError}`);
        setVoiceError(null);
    }
  }, [voiceError]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (favMenuRef.current && !favMenuRef.current.contains(event.target as Node)) {
            setIsFavMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if ((prompt.trim() || imageFile) && !isLoading && !isPromptInappropriate) {
      onSend();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        if (detectedMedia) {
            onPromptChange(prompt.replace(detectedMedia.url, '').trim());
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            onImageFileChange({
                data: reader.result as string,
                mimeType: file.type,
            });
        };
        reader.readAsDataURL(file);
    }
    if(event.target) event.target.value = '';
  };

  const handleCapture = (imageDataUrl: string) => {
    onImageFileChange({
      data: imageDataUrl,
      mimeType: 'image/jpeg',
    });
    setIsCameraOpen(false);
  };
  
  const handleMicClick = () => {
    setIsVoiceRecording(true);
  };

  const handleConfirmVoice = useCallback((transcript: string) => {
    if (transcript) {
        onPromptChange((prompt ? prompt + ' ' : '') + transcript);
    }
    setIsVoiceRecording(false);
  }, [prompt, onPromptChange]);

  const handleCancelVoice = useCallback(() => {
    setIsVoiceRecording(false);
  }, []);

  const handleSelectExistingImage = (image: ImageFile) => {
    onImageFileChange(image);
    setIsImageSelectionOpen(false);
  };
  
  const handleUseFavorite = (text: string) => {
    onPromptChange(text);
    setIsFavMenuOpen(false);
    textareaRef.current?.focus();
  };

  const handleAddNewFavorite = () => {
    if (prompt.trim()) {
      onAddFavoritePrompt(prompt.trim());
    }
  };

  const wordCount = prompt.trim() === '' ? 0 : prompt.trim().split(/\s+/).length;
  const hasContent = prompt.trim().length > 0 || imageFile !== null;

  const promptContainerWidth = customization.syncPromptWidth
    ? (customization.chatFullWidth ? '100%' : `${customization.chatsWidth}rem`)
    : `${customization.promptWidth}rem`;

  return (
    <>
      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />
      <ImageSelectionModal
        isOpen={isImageSelectionOpen}
        onClose={() => setIsImageSelectionOpen(false)}
        images={allAvailableImages}
        onSelect={handleSelectExistingImage}
      />
      <div className="flex-shrink-0 px-6 pb-6 pt-2 [perspective:1000px] relative z-20">
        <div className="mx-auto relative" style={{ maxWidth: promptContainerWidth }}>
          {/* Favorite Prompts Menu */}
          {isFavMenuOpen && (
              <div ref={favMenuRef} className="absolute bottom-full mb-2 w-full max-w-md left-0 bg-purple-950/80 backdrop-blur-2xl border border-white/20 rounded-xl shadow-lg p-2 animate-scale-in-pop z-20">
                  <div className="flex items-center justify-between px-2 py-1 mb-1">
                      <h3 className="text-sm font-semibold text-horizon-text-primary flex items-center gap-2">
                        <StarIcon className="w-5 h-5 text-yellow-400"/>
                        Favorite Prompts
                      </h3>
                      <button onClick={handleAddNewFavorite} title="Add current prompt to favorites" className="p-1.5 rounded-full text-horizon-text-tertiary hover:bg-white/10 hover:text-white" disabled={!prompt.trim() || favoritePrompts.some(p => p.text === prompt.trim())}>
                          <PlusIcon className="w-4 h-4" />
                      </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                      {favoritePrompts.length > 0 ? favoritePrompts.map(fp => (
                          <div key={fp.id} className="group flex items-center justify-between text-left gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                              <button onClick={() => handleUseFavorite(fp.text)} className="flex-1 text-sm text-horizon-text-primary truncate text-left">
                                {fp.text}
                              </button>
                              <button onClick={() => onRemoveFavoritePrompt(fp.id)} title="Delete prompt" className="p-1 rounded-full text-horizon-text-tertiary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="w-4 h-4" />
                              </button>
                          </div>
                      )) : (
                          <p className="text-center text-sm text-horizon-text-tertiary py-8">No prompts found. <br/>Save prompts from your chat history!</p>
                      )}
                  </div>
              </div>
          )}
          
          <div 
            className="[transform-style:preserve-3d] bg-horizon-item/40 backdrop-blur-2xl border rounded-2xl shadow-2xl shadow-black/20 w-full transition-all duration-500 hover:[transform:translateZ(20px)_rotateX(-5deg)]"
          >
             {isVoiceRecording ? (
                <VoiceInputUI onConfirm={handleConfirmVoice} onCancel={handleCancelVoice} onError={setVoiceError} />
             ) : (
                <div className="p-4 [transform-style:preserve-3d]">
                    <div className="flex items-center justify-between">
                        <GemSelector
                          gems={gems}
                          activeGem={activeGem}
                          aiProfile={aiProfile}
                          onSelectGem={onSelectGem}
                          onManageGems={onManageGems}
                        />
                        <div className="relative mb-3 [transform:translateZ(40px)]">
                            <button
                                onClick={() => onSetTool(activeTool === 'code_writer' ? 'none' : 'code_writer')}
                                className={`group relative flex items-center gap-2 px-4 py-2 backdrop-blur-sm border rounded-full text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95
                                    hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 hover:-translate-y-0.5
                                    ${activeTool === 'code_writer'
                                        ? 'bg-gradient-to-br from-purple-500 to-indigo-700 text-white border-transparent shadow-md shadow-purple-500/30'
                                        : 'bg-slate-800/60 border-slate-600/60 text-slate-300 hover:text-white hover:border-slate-500/80'
                                    }`}
                            >
                                <div className={`absolute -inset-px rounded-full transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100
                                                ${activeTool === 'code_writer' ? 'bg-purple-500/30 blur-lg' : 'group-hover:bg-purple-500/20 group-hover:blur-md'}`}>
                                </div>
                                <div className="relative flex items-center gap-2">
                                    <CanvasIcon className="w-4 h-4" />
                                    <span>Canvas</span>
                                </div>
                            </button>
                        </div>
                    </div>
                    {detectedMedia && !imageFile && (
                        <div className="mb-3 relative w-48 h-28 group transition-transform duration-300 hover:scale-105 [transform:translateZ(50px)]">
                            {detectedMedia.type === 'image' && <img src={detectedMedia.embedUrl} alt="Pasted preview" className="w-full h-full object-cover rounded-lg shadow-lg" />}
                            {detectedMedia.type === 'video' && <video src={detectedMedia.embedUrl} className="w-full h-full object-cover rounded-lg shadow-lg" />}
                            {detectedMedia.type === 'youtube' && <iframe src={detectedMedia.embedUrl} title="YouTube preview" className="w-full h-full border-0 rounded-lg shadow-lg" allowFullScreen />}
                            <button onClick={() => onPromptChange(prompt.replace(detectedMedia.url, '').trim())} className="absolute -top-2 -right-2 bg-black/50 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 hover:bg-black/80">
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                    {imageFile && (
                      <div className="mb-3 relative w-24 h-24 group transition-transform duration-300 hover:scale-105 [transform:translateZ(50px)] hover:[transform:translateZ(60px)_rotateY(10deg)]">
                        <img src={imageFile.data} alt="Upload preview" className="w-full h-full object-cover rounded-lg shadow-lg" />
                        <button onClick={() => onImageFileChange(null)} className="absolute -top-2 -right-2 bg-black/50 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 hover:bg-black/80">
                          <XCircleIcon className="w-6 h-6" />
                        </button>
                      </div>
                    )}
                    <div className="relative [transform:translateZ(20px)]">
                        <textarea
                            ref={textareaRef}
                            value={prompt}
                            onChange={(e) => onPromptChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Message HorizonAI..."
                            className={`w-full bg-transparent text-horizon-text-primary placeholder-horizon-text-tertiary focus:outline-none resize-none pr-28 max-h-48 shadow-inner-lg rounded-lg p-2 transition-shadow ${isPromptInappropriate ? 'ring-2 ring-red-500/50' : 'focus:shadow-md focus:shadow-horizon-accent/50'}`}
                            rows={1}
                            disabled={isLoading}
                            style={{
                              lineHeight: 'var(--line-height)',
                              letterSpacing: 'var(--letter-spacing)'
                            }}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                             <ActionButton
                                title="Microphone"
                                onClick={handleMicClick}
                                disabled={isLoading}
                             >
                                <MicIcon className="w-5 h-5" />
                            </ActionButton>
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
                        <p className="text-xs text-red-400 text-center mt-2 [transform:translateZ(10px)]">
                          Inappropriate content is not allowed. Please revise your prompt.
                        </p>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10 [transform:translateZ(10px)]">
                        <div className="flex items-center space-x-2">
                             <ActionButton
                                title="Attach File"
                                onClick={() => fileInputRef.current?.click()}
                             >
                                <PaperClipIcon className="w-5 h-5" />
                            </ActionButton>
                             <ActionButton
                                title="Use Camera"
                                onClick={() => setIsCameraOpen(true)}
                             >
                                <CameraIcon className="w-5 h-5" />
                            </ActionButton>
                             <ActionButton
                                title="Use Image from Library"
                                onClick={() => setIsImageSelectionOpen(true)}
                                disabled={isLoading || allAvailableImages.length === 0}
                             >
                                <LibraryIcon className="w-5 h-5" />
                            </ActionButton>
                            <ActionButton
                                title="Favorite Prompts"
                                onClick={() => setIsFavMenuOpen(p => !p)}
                                isActive={isFavMenuOpen}
                            >
                                <StarIcon className="w-5 h-5" />
                            </ActionButton>
                            <ToolsMenu activeTool={activeTool} onSetTool={onSetTool} />
                             <ActionButton
                                title={useMemory ? "Memory Enabled" : "Memory Disabled"}
                                onClick={onToggleMemory}
                                isActive={useMemory}
                             >
                                <BrainCircuitIcon className="w-5 h-5" />
                            </ActionButton>
                            <ActionButton
                                title={matchUserStyle ? "Style Matching Enabled" : "Match My Style"}
                                onClick={onToggleMatchStyle}
                                isActive={matchUserStyle}
                             >
                                <PaletteIcon className="w-5 h-5" />
                            </ActionButton>
                        </div>
                        <div className="text-xs text-horizon-text-tertiary">
                            {prompt.length} / {wordCount}
                        </div>
                    </div>
                </div>
              )}
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
      </div>
    </>
  );
});

export default PromptInput;