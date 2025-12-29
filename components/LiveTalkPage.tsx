import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  GoogleGenAI,
  LiveServerMessage,
  Modality,
  Blob,
  FunctionDeclaration,
  Type,
} from '@google/genai';
import { gsap } from 'gsap';
import { MicIcon, ChevronDownIcon, StopIcon, MicOffIcon, KeyboardIcon, SendIcon } from './icons';
import { Gem, AIGirlfriendProfile, AIProfile, LiveTalkPersona, UserProfile, CustomizationSettings } from '../types';
import GemAvatar from './GemAvatar';
import { buildAIGirlfriendSystemInstruction, buildDefaultSystemInstruction, buildGemSystemInstruction } from '../services/geminiService';

// --- Type Definitions ---
type Status = 'idle' | 'initializing' | 'listening' | 'thinking' | 'speaking' | 'error';
type TranscriptionEntry = {
    id: string;
    speaker: 'user' | 'model';
    text: string;
    isFinal: boolean;
};
const AVAILABLE_VOICES: { name: string; gender: 'Male' | 'Female' }[] = [
    { name: 'Zephyr', gender: 'Male' },
    { name: 'Puck', gender: 'Male' },
    { name: 'Charon', gender: 'Male' },
    { name: 'Kore', gender: 'Female' },
    { name: 'Fenrir', gender: 'Male' }
];

interface LiveTalkPageProps {
    onCancel: () => void;
    gems: Gem[];
    aiGirlfriends: AIGirlfriendProfile[];
    userProfile: UserProfile | null;
    defaultAiProfile: AIProfile;
    settings: CustomizationSettings;
    updateSetting: <K extends keyof CustomizationSettings>(key: K, value: CustomizationSettings[K]) => void;
}

// --- Helper Components ---
const PersonaAvatar: React.FC<{ persona: LiveTalkPersona, className?: string }> = ({ persona, className }) => {
    switch (persona.type) {
        case 'gem': return <GemAvatar gem={persona.data} className={className} />;
        case 'girlfriend': return <img src={persona.data.avatar} alt={persona.data.name} className={`${className} object-cover rounded-full`} />;
        case 'default': return <img src={persona.data.avatarUrl} alt={persona.data.name} className={`${className} object-cover rounded-full`} />;
        default: return null;
    }
};

const PersonaSelector: React.FC<{
    personas: LiveTalkPersona[];
    selected: LiveTalkPersona;
    onSelect: (persona: LiveTalkPersona) => void;
    disabled: boolean;
}> = ({ personas, selected, onSelect, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className="flex items-center gap-3 p-2 pr-4 bg-black/20 rounded-full border border-white/10 hover:bg-black/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <PersonaAvatar persona={selected} className="w-10 h-10" />
                <span className="font-semibold text-white">{selected.data.name}</span>
                <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 w-72 bg-slate-800/90 ui-blur-effect border border-white/10 rounded-xl shadow-lg p-2 z-20 animate-scale-in-pop">
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {personas.map((p, i) => (
                            <button
                                key={`${p.type}-${'id' in p.data ? p.data.id : i}`}
                                onClick={() => { onSelect(p); setIsOpen(false); }}
                                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <PersonaAvatar persona={p} className="w-8 h-8" />
                                <span className="text-sm font-semibold truncate">{p.data.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const VoiceSelector: React.FC<{
    selectedVoice: string | null;
    onSelect: (voice: string | null) => void;
    disabled: boolean;
}> = ({ selectedVoice, onSelect, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const selectedVoiceObject = AVAILABLE_VOICES.find(v => v.name === selectedVoice);
    const buttonLabel = selectedVoiceObject ? `${selectedVoiceObject.name} (${selectedVoiceObject.gender})` : 'Default Voice';

    return (
        <div ref={dropdownRef} className="relative">
            <button onClick={() => setIsOpen(!isOpen)} disabled={disabled} className="flex items-center gap-2 p-2 px-4 bg-black/20 rounded-full border border-white/10 hover:bg-black/30 transition-colors disabled:opacity-50">
                <span className="font-semibold text-sm text-white">{buttonLabel}</span>
                <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 w-48 bg-slate-800/90 ui-blur-effect border border-white/10 rounded-xl shadow-lg p-2 z-20 animate-scale-in-pop">
                    <button onClick={() => { onSelect(null); setIsOpen(false); }} className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors text-sm">Default Voice</button>
                    {AVAILABLE_VOICES.map(voice => (
                        <button key={voice.name} onClick={() => { onSelect(voice.name); setIsOpen(false); }} className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors text-sm">
                            {voice.name} <span className="text-xs text-slate-400">({voice.gender})</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


const AIVisualizer: React.FC<{ status: Status; userAudioLevel: number; aiAudioLevel: number; }> = ({ status, userAudioLevel, aiAudioLevel }) => {
    const orbRef = useRef<HTMLDivElement>(null);
    const userRingRef = useRef<HTMLDivElement>(null);
    const aiRingRef = useRef<HTMLDivElement>(null);
    const thinkingParticlesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const particles = thinkingParticlesRef.current;
        if (status === 'thinking' && particles) {
            const tl = gsap.timeline({ repeat: -1 });
            tl.fromTo(particles.children,
                { opacity: 0, scale: 0, x: 0, y: 0 },
                {
                    opacity: 1,
                    scale: 1,
                    x: 'random(-60, 60)',
                    y: 'random(-60, 60)',
                    duration: 'random(0.5, 1.5)',
                    ease: 'power2.out',
                    stagger: { each: 0.1, from: 'center' }
                }
            ).to(particles.children,
                {
                    opacity: 0,
                    duration: 'random(0.5, 1)',
                    ease: 'power2.in',
                    stagger: { each: 0.1, from: 'center' }
                },
                '>-0.5'
            );
            return () => { tl.kill(); };
        }
    }, [status]);

    useEffect(() => {
        gsap.to(userRingRef.current, { scale: 1 + userAudioLevel * 0.5, opacity: userAudioLevel, duration: 0.1 });
    }, [userAudioLevel]);

    useEffect(() => {
        gsap.to(aiRingRef.current, { scale: 1 + aiAudioLevel * 0.3, opacity: aiAudioLevel, duration: 0.1 });
        gsap.to(orbRef.current, { scale: 1 + aiAudioLevel * 0.05, duration: 0.1 });
    }, [aiAudioLevel]);

    const idle = status === 'idle' || status === 'error';
    
    return (
        <div className="relative w-64 h-64 flex items-center justify-center">
            <div ref={userRingRef} className="absolute w-full h-full rounded-full border-2 border-sky-400 opacity-0" />
            <div ref={aiRingRef} className="absolute w-full h-full rounded-full bg-horizon-accent/30 opacity-0" />
            <div ref={orbRef} className={`w-48 h-48 rounded-full bg-gradient-to-br from-purple-500 to-indigo-700 transition-all duration-500 ${idle ? 'animate-breathing' : ''}`}>
                 <div className="absolute inset-0 rounded-full overflow-hidden">
                    {status === 'thinking' && (
                        <div ref={thinkingParticlesRef} className="absolute inset-0">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-purple-200" />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Audio Encoding/Decoding (from guidelines) ---
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


const getCurrentTimeFunctionDeclaration: FunctionDeclaration = {
  name: 'getCurrentTime',
  parameters: { type: Type.OBJECT, properties: {} },
  description: 'Get the current date and time.',
};

const SideButton: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode; isActive?: boolean; title: string }> = ({ onClick, disabled, children, isActive, title }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isActive
                ? 'bg-sky-500/20 border-sky-500'
                : 'bg-slate-700/50 border-slate-600 hover:border-slate-400'
        }`}
    >
        {children}
    </button>
);

// --- Main Page Component ---
const LiveTalkPage: React.FC<LiveTalkPageProps> = ({ onCancel, gems, aiGirlfriends, userProfile, defaultAiProfile, settings, updateSetting }) => {
    const [status, setStatus] = useState<Status>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
    const [activeToolCall, setActiveToolCall] = useState<string | null>(null);
    const [userAudioLevel, setUserAudioLevel] = useState(0);
    const [aiAudioLevel, setAiAudioLevel] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isTextMode, setIsTextMode] = useState(false);
    const [textInput, setTextInput] = useState('');
    
    const aiRef = useRef<GoogleGenAI>();
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const streamRef = useRef<MediaStream>();
    const inputAudioContextRef = useRef<AudioContext>();
    const outputAudioContextRef = useRef<AudioContext>();
    const scriptProcessorRef = useRef<ScriptProcessorNode>();
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode>();
    const inputAnalyserRef = useRef<AnalyserNode>();
    const outputAnalyserRef = useRef<AnalyserNode>();
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const transcriptionContainerRef = useRef<HTMLDivElement>(null);
    const userVisualizerFrameRef = useRef<number>();
    const aiVisualizerFrameRef = useRef<number>();
    const statusRef = useRef(status);
    useEffect(() => { statusRef.current = status; }, [status]);
    const needsRestartRef = useRef(false);
    const textInputWrapperRef = useRef<HTMLDivElement>(null);

    const personas = useMemo((): LiveTalkPersona[] => {
        const list: LiveTalkPersona[] = [{ type: 'default', data: defaultAiProfile }];
        list.push(...gems.map(g => ({ type: 'gem', data: g } as LiveTalkPersona)));
        if (settings.isNsfwModeEnabled) {
            list.push(...aiGirlfriends.map(g => ({ type: 'girlfriend', data: g } as LiveTalkPersona)));
        }
        return list;
    }, [defaultAiProfile, gems, aiGirlfriends, settings.isNsfwModeEnabled]);
    
    const [selectedPersona, setSelectedPersona] = useState<LiveTalkPersona>(personas[0]);

    useEffect(() => {
        if (!settings.isNsfwModeEnabled && selectedPersona.type === 'girlfriend') {
            setSelectedPersona(personas[0]);
        }
    }, [settings.isNsfwModeEnabled, selectedPersona, personas]);

    useEffect(() => {
        if (transcriptionContainerRef.current) {
            transcriptionContainerRef.current.scrollTop = transcriptionContainerRef.current.scrollHeight;
        }
    }, [transcriptions]);

    useEffect(() => {
        if (textInputWrapperRef.current) {
            gsap.to(textInputWrapperRef.current, {
                height: isTextMode ? 'auto' : 0,
                opacity: isTextMode ? 1 : 0,
                duration: 0.3,
                ease: 'power2.inOut',
                onStart: () => {
                    if (isTextMode && textInputWrapperRef.current) textInputWrapperRef.current.style.display = 'block';
                },
                onComplete: () => {
                    if (!isTextMode && textInputWrapperRef.current) textInputWrapperRef.current.style.display = 'none';
                }
            });
        }
    }, [isTextMode]);

    const isSessionActive = status === 'listening' || status === 'speaking' || status === 'initializing' || status === 'thinking';
    
    useEffect(() => {
        streamRef.current?.getAudioTracks().forEach(track => {
            track.enabled = !isMuted;
        });
    }, [isMuted, isSessionActive]);


    const cleanupAudio = useCallback(() => {
        if(userVisualizerFrameRef.current) cancelAnimationFrame(userVisualizerFrameRef.current);
        if(aiVisualizerFrameRef.current) cancelAnimationFrame(aiVisualizerFrameRef.current);
        // FIX: The disconnect method can be called without arguments to remove all connections. Older TS defs might be incorrect.
        // FIX: Cast to any to bypass incorrect TypeScript definitions that expect arguments for disconnect().
        if (scriptProcessorRef.current) (scriptProcessorRef.current as any).disconnect();
        // FIX: Cast to any to bypass incorrect TypeScript definitions that expect arguments for disconnect().
        if (mediaStreamSourceRef.current) (mediaStreamSourceRef.current as any).disconnect();
        // FIX: Cast to any to bypass incorrect TypeScript definitions that expect arguments for disconnect().
        if (inputAnalyserRef.current) (inputAnalyserRef.current as any).disconnect();
        // FIX: Cast to any to bypass incorrect TypeScript definitions that expect arguments for disconnect().
        if (outputAnalyserRef.current) (outputAnalyserRef.current as any).disconnect();
        streamRef.current?.getTracks().forEach((track) => track.stop());
        // FIX: Cast to any to bypass incorrect TypeScript definitions that expect arguments for close().
        if (inputAudioContextRef.current) (inputAudioContextRef.current as any).close().catch(console.error);
        // FIX: Cast to any to bypass incorrect TypeScript definitions that expect arguments for close().
        if (outputAudioContextRef.current) (outputAudioContextRef.current as any).close().catch(console.error);
        
        sessionPromiseRef.current = null;
        scriptProcessorRef.current = undefined;
        mediaStreamSourceRef.current = undefined;
        inputAnalyserRef.current = undefined;
        outputAnalyserRef.current = undefined;
        streamRef.current = undefined;
        inputAudioContextRef.current = undefined;
        outputAudioContextRef.current = undefined;
    }, []);

    const stopSession = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then((session) => session.close()).catch(console.error);
            sessionPromiseRef.current = null;
        }
        cleanupAudio();
        setStatus('idle');
        setIsMuted(false);
        setIsTextMode(false);
    }, [cleanupAudio]);

    const startSession = useCallback(async () => {
        if (status !== 'idle' && status !== 'error') return;
        setStatus('initializing');
        setErrorMessage(null);
        setTranscriptions([]);

        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // @ts-ignore
            inputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            // @ts-ignore
            outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

            if (!aiRef.current) aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });

            let systemInstruction = "";
            switch(selectedPersona.type) {
                case 'gem': systemInstruction = buildGemSystemInstruction(selectedPersona.data.instructions); break;
                case 'girlfriend': systemInstruction = buildAIGirlfriendSystemInstruction(selectedPersona.data, userProfile); break;
                case 'default': systemInstruction = buildDefaultSystemInstruction(userProfile || { name: 'User', nickname: '', age: '', bio: '', avatarUrl: '' }, selectedPersona.data); break;
            }
            systemInstruction += `\n\n--- CONTEXT: VOICE CONVERSATION ---\nYou are in a real-time voice conversation. Keep responses natural-sounding and relatively concise. You MUST respond in ${settings.language || 'English'}.`;

            sessionPromiseRef.current = aiRef.current.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        if (!inputAudioContextRef.current || !streamRef.current) return;
                        setStatus('listening');
                        mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        inputAnalyserRef.current = inputAudioContextRef.current.createAnalyser();
                        inputAnalyserRef.current.fftSize = 256;

                        const updateUserVisualizer = () => {
                            if (!inputAnalyserRef.current) return;
                            const dataArray = new Uint8Array(inputAnalyserRef.current.frequencyBinCount);
                            inputAnalyserRef.current.getByteFrequencyData(dataArray);
                            const average = dataArray.reduce((s, v) => s + v, 0) / dataArray.length;
                            setUserAudioLevel(Math.min(1, average / 128));
                            userVisualizerFrameRef.current = requestAnimationFrame(updateUserVisualizer);
                        };
                        updateUserVisualizer();

                        scriptProcessorRef.current.onaudioprocess = (event) => {
                            const inputData = event.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            }).catch(e => console.error("Error sending realtime input:", e));
                        };
                        mediaStreamSourceRef.current.connect(inputAnalyserRef.current);
                        inputAnalyserRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.toolCall) {
                            setStatus('thinking');
                            const fc = message.toolCall.functionCalls[0];
                            if (fc.name === 'getCurrentTime') {
                                setActiveToolCall('Getting current time...');
                                sessionPromiseRef.current?.then((session) => {
                                    session.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: `The current time is ${new Date().toLocaleTimeString()}` } }});
                                });
                            }
                        }

                        let currentInput = '', currentOutput = '', turnComplete = false;
                        if (message.serverContent?.inputTranscription?.text) currentInput = message.serverContent.inputTranscription.text;
                        if (message.serverContent?.outputTranscription?.text) currentOutput = message.serverContent.outputTranscription.text;
                        if (message.serverContent?.turnComplete) turnComplete = true;

                        setTranscriptions(prev => {
                            let next = [...prev];
                            if(currentInput) {
                                if (statusRef.current !== 'speaking') setStatus('listening');
                                let last = next[next.length - 1];
                                if(last?.speaker === 'user' && !last.isFinal) last.text += currentInput;
                                else next.push({id: `user-${Date.now()}`, speaker: 'user', text: currentInput, isFinal: false});
                            }
                            if(currentOutput) {
                                setStatus('speaking');
                                setActiveToolCall(null);
                                let last = next[next.length - 1];
                                if(last?.speaker === 'model' && !last.isFinal) last.text += currentOutput;
                                else next.push({id: `model-${Date.now()}`, speaker: 'model', text: currentOutput, isFinal: false});
                            }
                            if(turnComplete) {
                                if(statusRef.current !== 'speaking') setStatus('thinking');
                                return next.map(t => ({...t, isFinal: true}));
                            }
                            return next;
                        });

                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (audioData && outputAudioContextRef.current) {
                            const outputCtx = outputAudioContextRef.current;
                            if (!outputAnalyserRef.current) {
                                outputAnalyserRef.current = outputCtx.createAnalyser();
                                outputAnalyserRef.current.fftSize = 256;
                            }
                            const analyser = outputAnalyserRef.current;
                            
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(analyser);
                            analyser.connect(outputCtx.destination);
                            
                            const updateAiVisualizer = () => {
                                if (!analyser) return;
                                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                                analyser.getByteFrequencyData(dataArray);
                                const average = dataArray.reduce((s, v) => s + v, 0) / dataArray.length;
                                setAiAudioLevel(Math.min(1, average / 128));
                                aiVisualizerFrameRef.current = requestAnimationFrame(updateAiVisualizer);
                            };

                            source.onended = () => {
                                audioSourcesRef.current.delete(source);
                                if (audioSourcesRef.current.size === 0) {
                                    if(aiVisualizerFrameRef.current) cancelAnimationFrame(aiVisualizerFrameRef.current);
                                    setAiAudioLevel(0);
                                }
                            };
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                            updateAiVisualizer();
                        }

                        if (message.serverContent?.interrupted) {
                            audioSourcesRef.current.forEach(source => source.stop());
                            audioSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                            if(aiVisualizerFrameRef.current) cancelAnimationFrame(aiVisualizerFrameRef.current);
                            setAiAudioLevel(0);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error("Session error:", e);
                        setErrorMessage(`Session error: ${e.message}. Please try again.`);
                        setStatus('error');
                        stopSession();
                    },
                    onclose: () => stopSession(),
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: settings.liveTalkVoice || 'Kore' }}},
                    systemInstruction,
                    tools: [{ functionDeclarations: [getCurrentTimeFunctionDeclaration] }]
                },
            });
        } catch (err) {
            setErrorMessage(`Could not start session: ${err instanceof Error ? err.message : String(err)}`);
            setStatus('error');
        }
    }, [status, selectedPersona, userProfile, stopSession, settings.language, settings.liveTalkVoice]);

    const handleVoiceChange = (newVoice: string | null) => {
        updateSetting('liveTalkVoice', newVoice);
        if (isSessionActive) {
            needsRestartRef.current = true;
            stopSession();
        }
    };
    
    useEffect(() => {
        if (status === 'idle' && needsRestartRef.current) {
            needsRestartRef.current = false;
            startSession();
        }
    }, [status, startSession]);
    
    useEffect(() => () => stopSession(), [stopSession]);
    
    const handleToggleSession = () => {
        if (isSessionActive) {
            stopSession();
        } else {
            startSession();
        }
    };

    const handleToggleMute = () => {
        if (!isSessionActive) return;
        setIsMuted(prev => !prev);
    };

    const handleSendText = useCallback(() => {
        const text = textInput.trim();
        if (!text || !sessionPromiseRef.current) return;
        sessionPromiseRef.current.then(session => {
            session.sendRealtimeInput({ text });
        }).catch(e => console.error("Error sending text input:", e));
        setTextInput('');
    }, [textInput]);

    
    const statusText: Record<Status, string> = {
        idle: 'Tap to start conversation',
        initializing: 'Initializing session...',
        listening: 'Listening...',
        thinking: 'Thinking...',
        speaking: `${selectedPersona.data.name} is speaking...`,
        error: errorMessage || 'An error occurred.',
    };
    
    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 relative text-white overflow-hidden bg-slate-900">
            <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
            
            <header className="flex-shrink-0 flex items-center justify-between mb-4 z-10 animate-fade-in-up">
                <div className="flex items-center gap-4">
                    <PersonaSelector personas={personas} selected={selectedPersona} onSelect={setSelectedPersona} disabled={isSessionActive}/>
                    <VoiceSelector selectedVoice={settings.liveTalkVoice} onSelect={handleVoiceChange} disabled={status === 'initializing'}/>
                </div>
                <button onClick={onCancel} className="px-4 py-2 font-semibold text-slate-300 hover:text-white transition-colors">Back</button>
            </header>

            <main className="flex-1 flex flex-col items-center justify-end min-h-0 z-10">
                <div ref={transcriptionContainerRef} className="w-full max-w-4xl flex-1 overflow-y-auto custom-scrollbar mb-4 space-y-4">
                    {transcriptions.map(item => (
                        <div key={item.id} className={`flex items-start gap-3 animate-fade-in-up ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {item.speaker === 'model' && <PersonaAvatar persona={selectedPersona} className="w-8 h-8"/>}
                            <p className={`max-w-xl p-3 rounded-lg text-base ${item.speaker === 'user' ? 'bg-sky-800/70' : 'bg-slate-800/50'} ${!item.isFinal ? 'opacity-70' : ''}`}>{item.text}</p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col items-center gap-4 w-full">
                    <div ref={textInputWrapperRef} className="w-full max-w-2xl h-0 opacity-0 overflow-hidden" style={{ display: 'none' }}>
                        <div className="relative">
                            <textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendText(); } }}
                                placeholder="Type your message..."
                                className="w-full bg-black/30 border border-slate-600 rounded-lg p-3 pr-14 resize-none focus:outline-none focus:ring-1 focus:ring-horizon-accent text-white"
                                rows={2}
                            />
                            <button
                                onClick={handleSendText}
                                disabled={!textInput.trim()}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-horizon-accent text-white hover:bg-horizon-accent-hover disabled:opacity-50 transition-all"
                            >
                                <SendIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                    <AIVisualizer status={status} userAudioLevel={userAudioLevel} aiAudioLevel={aiAudioLevel} />
                    <p className={`text-lg font-semibold transition-colors h-7 ${status === 'error' ? 'text-red-400' : 'text-slate-300'}`}>
                        {activeToolCall || statusText[status]}
                    </p>
                    <div className="flex items-center gap-6">
                        <SideButton onClick={handleToggleMute} disabled={!isSessionActive} title={isMuted ? "Unmute" : "Mute"} isActive={isMuted}>
                            {isMuted ? <MicOffIcon className="w-8 h-8 text-white"/> : <MicIcon className="w-8 h-8 text-white"/>}
                        </SideButton>
                        <button onClick={handleToggleSession} disabled={status === 'initializing'} className={`relative w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-300 disabled:opacity-50
                            ${isSessionActive ? 'border-red-500 bg-red-500/20' : 'border-slate-600 bg-slate-800/50 hover:border-horizon-accent'}`}>
                            {isSessionActive ? <StopIcon className="w-10 h-10 text-white" /> : <MicIcon className="w-10 h-10 text-white" />}
                        </button>
                        <SideButton onClick={() => setIsTextMode(p => !p)} disabled={!isSessionActive} title="Text Input" isActive={isTextMode}>
                            <KeyboardIcon className="w-8 h-8 text-white"/>
                        </SideButton>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LiveTalkPage;