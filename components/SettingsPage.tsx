
import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { CustomizationSettings, Theme, BackgroundType, AnimationIntensity, UserProfile, AIProfile } from '../types';
import { SFW_PRESET_BACKGROUNDS, NSFW_PRESET_BACKGROUNDS, ADULT_PRESET_BACKGROUNDS, PRESET_VIDEO_BACKGROUNDS, NSFW_PRESET_VIDEO_BACKGROUNDS, LIVE_4K_VIDEO_BACKGROUNDS, ADULT_PRESET_VIDEO_BACKGROUNDS } from '../data/backgrounds';
import { LIVE_CHARACTERS } from '../data/characters';
import { UploadCloudIcon, PaintbrushIcon, SparklesIcon, SunIcon, MoonIcon, ContrastIcon, LinkIcon, LockIcon, ShieldIcon, VideoIcon, LoaderIcon, UserCircleIcon, PlayIcon, AlertTriangleIcon, InfoIcon, StopIcon, HeartIcon } from './icons';
import { isContentInappropriate } from '../services/moderationService';

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null;
};


interface SettingsPageProps {
    customization: CustomizationSettings;
    updateSetting: <K extends keyof CustomizationSettings>(key: K, value: CustomizationSettings[K]) => void;
    onCancel: () => void;
    userProfile: UserProfile;
    aiProfile: AIProfile;
    onUserProfileChange: (profile: UserProfile) => void;
    onAiProfileChange: (profile: AIProfile) => void;
    onOpenImagePicker: (title: string, onSave: (url: string) => void, currentItemUrl?: string) => void;
    onSaveUserAvatar: (url: string) => void;
    onSaveAiAvatar: (url: string) => void;
    isAboutSectionUnlocked: boolean;
    onUnlockAboutSection: () => void;
    onShowHornyMode: () => void;
}

type Tab = 'Appearance' | 'Profiles' | 'Content & Safety' | 'Characters' | 'About';

const SettingsCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`liquid-glass-card relative ${className}`}>
        <div className="liquid-glass--bend !bg-black/10"></div>
        <div className="liquid-glass--face !bg-black/20"></div>
        <div className="liquid-glass--edge"></div>
        <div className="relative z-10 p-6 space-y-6">
            {children}
        </div>
    </div>
);

const ToggleSwitch: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only peer"
        />
        <div className={`
            w-11 h-6 rounded-full flex-shrink-0
            peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-offset-black/20 peer-focus:ring-horizon-accent
            after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
            ${disabled ? 'cursor-not-allowed bg-gray-600/50' : 'peer-checked:bg-horizon-accent bg-black/30'}
            peer-checked:after:translate-x-full
        `}></div>
    </label>
);

const SliderControl: React.FC<{label: string; value: number; onChange: (value: number) => void; unit: string; min: number; max: number; step: number;}> = ({label, value, onChange, unit, min, max, step}) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-horizon-text-secondary">{label}</label>
            <span className="text-sm font-mono text-horizon-text-primary">{value}{unit}</span>
        </div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer accent-horizon-accent" />
    </div>
);

const SegmentedControl: React.FC<{ options: {value: string, label: string, icon?: React.ReactNode}[], selectedValue: string, onChange: (value: any) => void }> = ({ options, selectedValue, onChange }) => {
    const getActiveClasses = (value: string) => {
        switch (value) {
            case 'safe': return 'bg-horizon-accent text-white shadow-md';
            case 'nsfw': return 'bg-rose-600 text-white shadow-md shadow-rose-500/30';
            case 'extreme': return 'bg-red-600 text-white shadow-md shadow-red-500/30';
            default: return 'bg-horizon-accent text-white shadow-md';
        }
    };
    const getInactiveClasses = (value: string) => {
        let hoverClass = 'hover:bg-white/5';
        if (value === 'nsfw') hoverClass = 'hover:bg-rose-500/20';
        if (value === 'extreme') hoverClass = 'hover:bg-red-500/20';
        return `text-horizon-text-secondary hover:text-white ${hoverClass}`;
    };

    return (
        <div className="flex w-full bg-black/20 rounded-lg p-1">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-300 ${selectedValue === opt.value ? getActiveClasses(opt.value) : getInactiveClasses(opt.value)}`}
                >
                    {opt.icon}<span>{opt.label}</span>
                </button>
            ))}
        </div>
    );
};

const BackgroundPreview: React.FC<{ settings: CustomizationSettings, isUploading: boolean }> = ({ settings, isUploading }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = settings.videoPlaybackSpeed;
        }
    }, [settings.videoPlaybackSpeed, settings.backgroundVideoUrl]);
    
    const contentLayerStyle: React.CSSProperties = {
        position: 'absolute',
        inset: '0',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    if (settings.backgroundType === 'image' || settings.backgroundType === 'video') {
        contentLayerStyle.filter = `brightness(${settings.bgBrightness}%) contrast(${settings.bgContrast}%) saturate(${settings.bgSaturation}%)`;
    }

    switch (settings.backgroundType) {
        case 'solid':
            contentLayerStyle.backgroundColor = settings.backgroundColor1;
            break;
        case 'gradient':
            contentLayerStyle.backgroundImage = `linear-gradient(${settings.gradientAngle}deg, ${settings.backgroundColor1}, ${settings.backgroundColor2})`;
            break;
        case 'image':
            contentLayerStyle.backgroundImage = `url('${settings.backgroundImageUrl}')`;
            break;
    }
    
    const backdropLayerStyle: React.CSSProperties = {
        position: 'absolute',
        inset: '0',
        backdropFilter: `blur(${settings.backgroundBlur}px)`,
        WebkitBackdropFilter: `blur(${settings.backgroundBlur}px)`,
    };

    if (settings.backgroundType === 'image' || settings.backgroundType === 'video') {
        const rgb = hexToRgb(settings.bgOverlayColor);
        if (rgb) {
            backdropLayerStyle.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${settings.bgOverlayOpacity})`;
        }
    }

    return (
        <div className={`w-full aspect-video rounded-lg overflow-hidden relative bg-horizon-dark flex items-center justify-center border border-white/10 shadow-inner ${isUploading ? 'file-melt-animation' : ''}`}>
            {isUploading ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <LoaderIcon className="w-12 h-12 animate-spin" />
                    <p className="mt-4 font-semibold">Applying new background...</p>
                </div>
            ) : (
                <>
                    <div style={contentLayerStyle}></div>
                    
                    {settings.backgroundType === 'aurora' && (
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full filter blur-xl animate-aurora" style={{ backgroundColor: settings.auroraColor1, animationDuration: `${settings.auroraSpeed}s`}}></div>
                            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full filter blur-xl animate-aurora" style={{ backgroundColor: settings.auroraColor2, animationDuration: `${settings.auroraSpeed}s`, animationDelay: `${settings.auroraSpeed / -2}s`}}></div>
                        </div>
                    )}
                    
                    {settings.backgroundType === 'video' && settings.backgroundVideoUrl ? (
                        <video
                            ref={videoRef}
                            key={settings.backgroundVideoUrl}
                            src={settings.backgroundVideoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover z-0"
                            style={{
                                filter: `brightness(${settings.bgBrightness}%) contrast(${settings.bgContrast}%) saturate(${settings.bgSaturation}%)`,
                            }}
                        />
                    ) : settings.backgroundType === 'video' && !settings.backgroundVideoUrl && !isUploading && (
                         <div className="relative z-10 flex flex-col items-center text-white/80">
                            <VideoIcon className="w-12 h-12" />
                            <span className="font-semibold mt-2">Video Background</span>
                        </div>
                    )}

                    <div style={backdropLayerStyle}></div>

                    <p className="relative text-white font-bold text-lg drop-shadow-lg">Preview</p>
                </>
            )}
        </div>
    );
};

const ColorControl: React.FC<{label: string; value: string; onChange: (value: string) => void;}> = ({label, value, onChange}) => (
    <div>
        <label className="text-sm font-medium text-horizon-text-secondary">{label}</label>
        <div className="flex items-center gap-2 mt-1">
            <div className="relative w-10 h-10">
                <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 w-full h-full p-0 border-none rounded-full cursor-pointer bg-transparent appearance-none" style={{'WebkitAppearance': 'none'}} />
                <div className="w-10 h-10 rounded-full border-2 border-white/20 pointer-events-none transition-transform hover:scale-110" style={{backgroundColor: value}}></div>
            </div>
            <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-horizon-accent"/>
        </div>
    </div>
);

const FormField: React.FC<{
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    as?: 'input' | 'textarea';
    rows?: number;
}> = ({ label, value, onChange, placeholder, as = 'input', rows = 3 }) => (
    <div>
        <label className="text-sm font-medium text-horizon-text-secondary">{label}</label>
        {as === 'input' ? (
            <input value={value} onChange={onChange} placeholder={placeholder} className="mt-1 w-full bg-black/30 border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-horizon-accent" />
        ) : (
            <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="mt-1 w-full bg-black/30 border border-white/10 rounded-lg p-2 resize-y focus:outline-none focus:ring-1 focus:ring-horizon-accent" />
        )}
    </div>
);

const SettingsPreview: React.FC<{ settings: CustomizationSettings }> = ({ settings }) => {
    const { fontFamily, fontSize, lineHeight, letterSpacing, animationIntensity, showUserBubble, showGptBubble, accentLight, accentDark, colorfulIcons } = settings;

    const fontStyle = {
        fontFamily: `"${fontFamily}", sans-serif`,
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight,
        letterSpacing: `${letterSpacing}px`,
    };

    const animationClass = {
        default: 'animate-breathing',
        subtle: 'animate-pulse-glow',
        playful: 'animate-bounce',
    }[settings.disableAllAnimations ? 'subtle' : animationIntensity];
    
    const effectiveTheme = settings.theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : settings.theme;
    
    return (
        <div className={`sticky top-8 w-full h-[80vh] min-h-[700px] rounded-2xl p-6 space-y-4 overflow-hidden ${effectiveTheme === 'dark' ? 'bg-black/20 dark' : 'bg-white/10'}`}>
            <h3 className="font-semibold text-lg text-center text-white">Live Preview</h3>
            <div className="h-full overflow-y-auto custom-scrollbar -mr-4 pr-4 space-y-4">
                <div className="p-4 bg-black/20 rounded-lg">
                    <p className="text-xs text-slate-400 mb-2">Font Preview</p>
                    <p style={fontStyle} className="transition-all duration-300 text-white">The quick brown fox jumps over the lazy dog.</p>
                </div>
                
                <div className="space-y-4">
                    <p className="text-xs text-slate-400">Chat Bubble Preview</p>
                    {showUserBubble && (
                        <div className="flex justify-end animate-fade-in-up">
                            <div className="p-3 rounded-lg rounded-br-none" style={{ backgroundColor: effectiveTheme === 'dark' ? accentDark : accentLight }}>
                                <p className="text-sm text-white">This is a user message.</p>
                            </div>
                        </div>
                    )}
                    {showGptBubble && (
                        <div className="flex justify-start animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            <div className="p-3 rounded-lg rounded-bl-none bg-slate-700">
                                 <p className="text-sm text-slate-200">This is an AI response.</p>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex gap-4">
                    <div className="w-1/2 p-4 bg-black/20 rounded-lg">
                         <p className="text-xs text-slate-400 mb-2">Animation</p>
                         <div className="flex justify-center items-center h-16">
                            <div className={`w-8 h-8 rounded-full ${animationClass}`} style={{ backgroundColor: accentDark }}></div>
                         </div>
                    </div>
                    <div className="w-1/2 p-4 bg-black/20 rounded-lg">
                         <p className="text-xs text-slate-400 mb-2">Icons</p>
                         <div className={`flex justify-center items-center h-16 gap-4 ${colorfulIcons ? 'colorful-icons' : ''}`}>
                            <SparklesIcon className="w-7 h-7" style={{'--horizon-accent': accentDark} as React.CSSProperties}/>
                            <HeartIcon className="w-7 h-7" style={{'--horizon-accent': accentDark} as React.CSSProperties}/>
                         </div>
                    </div>
                </div>
                 <div className="p-4 bg-black/20 rounded-lg">
                     <p className="text-xs text-slate-400 mb-2">Accent Colors</p>
                     <div className="flex justify-center items-center h-16 gap-4">
                        <div className="text-center">
                            <div className="w-10 h-10 rounded-full" style={{ backgroundColor: accentLight }}></div>
                            <span className="text-xs mt-1 block text-slate-400">Light</span>
                        </div>
                        <div className="text-center">
                             <div className="w-10 h-10 rounded-full" style={{ backgroundColor: accentDark }}></div>
                             <span className="text-xs mt-1 block text-slate-400">Dark</span>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};


const SettingsPage: React.FC<SettingsPageProps> = ({ customization, updateSetting, onCancel, userProfile, aiProfile, onUserProfileChange, onAiProfileChange, onOpenImagePicker, onSaveUserAvatar, onSaveAiAvatar, isAboutSectionUnlocked, onUnlockAboutSection, onShowHornyMode }) => {
    const [activeTab, setActiveTab] = useState<Tab>('Appearance');
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [passwordAttempt, setPasswordAttempt] = useState('');
    const [passwordAttemptError, setPasswordAttemptError] = useState('');
    const [isUploadingBg, setIsUploadingBg] = useState(false);
    const [playAllPreviews, setPlayAllPreviews] = useState(true);
    const [isHornyModalOpen, setIsHornyModalOpen] = useState(false);

    const [aboutPassword, setAboutPassword] = useState('');
    const [aboutPasswordError, setAboutPasswordError] = useState('');
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            const sortedVoices = availableVoices
                .filter(v => v.lang.startsWith('en'))
                .sort((a, b) => {
                    const aName = a.name.toLowerCase();
                    const bName = b.name.toLowerCase();
                    let aScore = a.localService ? 0 : 10;
                    let bScore = b.localService ? 0 : 10;
                    if (aName.includes('google')) aScore += 5;
                    if (bName.includes('google')) bScore += 5;
                    if (aName.includes('female') || aName.includes('zira') || aName.includes('susan')) aScore += 2;
                    if (bName.includes('female') || bName.includes('zira') || bName.includes('susan')) bScore += 2;
                    return bScore - aScore;
                });
            setVoices(sortedVoices);
        };
        
        if (speechSynthesis.onvoiceschanged !== undefined) {
             speechSynthesis.onvoiceschanged = loadVoices;
        }
        loadVoices();

        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const handleUnlockAbout = () => {
        if (aboutPassword === 'ERRORISAI') {
            onUnlockAboutSection();
            setAboutPasswordError('');
        } else {
            setAboutPasswordError('Incorrect password.');
        }
    };

    const handleBackgroundFileChange = (file: File) => {
        setIsUploadingBg(true);
        setTimeout(() => {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateSetting('backgroundImageUrl', reader.result as string);
                updateSetting('backgroundType', 'image');
                setIsUploadingBg(false);
            };
            reader.readAsDataURL(file);
        }, 5000);
    };
    
    const handleSafetyToggle = (isNowSafe: boolean) => {
        if (isNowSafe) {
            updateSetting('isNsfwModeEnabled', false);
            updateSetting('showNsfwWallpapers', false);
            updateSetting('showAdultWallpapers', false);
            setShowPasswordPrompt(false);
            setPasswordAttempt('');
            setPasswordAttemptError('');
        } else {
            setShowPasswordPrompt(true);
        }
    };

    const handleUnlock = () => {
        if (passwordAttempt === 'errorisai') {
            updateSetting('isNsfwModeEnabled', true);
            setShowPasswordPrompt(false);
            setPasswordAttempt('');
            setPasswordAttemptError('');
        } else {
            setPasswordAttemptError('Incorrect password.');
        }
    };

    const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleUnlock();
        }
    };

    const handlePreviewVoice = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance("Hello, this is a preview of my voice. I hope you find it to your liking.");
        const selectedVoiceURI = customization.liveTalkVoice;

        if (selectedVoiceURI) {
            const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        }
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
    };

    const TABS: { name: Tab; icon: React.ReactNode }[] = [
        { name: 'Appearance', icon: <PaintbrushIcon className="w-5 h-5" /> },
        { name: 'Profiles', icon: <UserCircleIcon className="w-5 h-5" /> },
        { name: 'Content & Safety', icon: <ShieldIcon className="w-5 h-5" /> },
    ];
    
    if (customization.isNsfwModeEnabled) {
        TABS.push({ name: 'Characters', icon: <VideoIcon className="w-5 h-5" /> });
    }
    TABS.push({ name: 'About', icon: <InfoIcon className="w-5 h-5" /> });
    
    const renderContent = () => {
        switch(activeTab) {
            case 'Appearance':
                return <div className="space-y-8 animate-fade-in-up">
                    <SettingsCard>
                        <h3 className="font-semibold text-lg mb-2">Interface</h3>
                         <div className="space-y-4">
                            <SegmentedControl options={[{value: 'light', label: 'Light', icon: <SunIcon className="w-5 h-5"/>}, {value: 'dark', label: 'Dark', icon: <MoonIcon className="w-5 h-5"/>}, {value: 'system', label: 'System', icon: <ContrastIcon className="w-5 h-5"/>}]} selectedValue={customization.theme} onChange={(v) => updateSetting('theme', v)} />
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-horizon-text-primary">Disable All Animations</p>
                                <ToggleSwitch checked={customization.disableAllAnimations} onChange={checked => updateSetting('disableAllAnimations', checked)} />
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-horizon-text-primary">Colorful & Animated Icons</p>
                                <ToggleSwitch checked={customization.colorfulIcons} onChange={checked => updateSetting('colorfulIcons', checked)} />
                            </div>
                            <SliderControl label="UI Blur Effect" value={customization.globalBlur} onChange={v => updateSetting('globalBlur', v)} min={0} max={40} step={1} unit="px" />
                        </div>
                    </SettingsCard>
                     <SettingsCard>
                        <h3 className="font-semibold text-lg mb-4">Accent Color</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-horizon-text-secondary">Light Theme</label>
                                <ColorControl label="" value={customization.accentLight} onChange={v => updateSetting('accentLight', v)}/>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-horizon-text-secondary">Dark Theme</label>
                                <ColorControl label="" value={customization.accentDark} onChange={v => updateSetting('accentDark', v)}/>
                            </div>
                        </div>
                    </SettingsCard>
                    <SettingsCard>
                         <h3 className="font-semibold text-lg mb-4">Background</h3>
                         <BackgroundPreview settings={customization} isUploading={isUploadingBg} />
                         <SegmentedControl options={[{value: 'aurora', label: 'Aurora'}, {value: 'gradient', label: 'Gradient'}, {value: 'solid', label: 'Solid'}, {value: 'image', label: 'Image'}, {value: 'video', label: 'Video', icon: <VideoIcon className="w-4 h-4"/>}]} selectedValue={customization.backgroundType} onChange={(v) => updateSetting('backgroundType', v)}/>
                         
                         <div className="pt-4 border-t border-white/20 mt-4">
                            <h4 className="font-semibold text-white mb-4">Advanced Settings</h4>
                            <div className="space-y-4">
                                {customization.backgroundType === 'aurora' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <ColorControl label="Color 1" value={customization.auroraColor1} onChange={v => updateSetting('auroraColor1', v)} />
                                        <ColorControl label="Color 2" value={customization.auroraColor2} onChange={v => updateSetting('auroraColor2', v)} />
                                        <div className="col-span-2">
                                            <SliderControl label="Animation Speed" value={customization.auroraSpeed} onChange={v => updateSetting('auroraSpeed', v)} min={5} max={60} step={1} unit="s" />
                                        </div>
                                    </div>
                                )}
                                {customization.backgroundType === 'gradient' && (
                                    <SliderControl label="Gradient Angle" value={customization.gradientAngle} onChange={v => updateSetting('gradientAngle', v)} min={0} max={360} step={1} unit="°" />
                                )}
                                {(customization.backgroundType === 'image' || customization.backgroundType === 'video') && (
                                    <div className="space-y-4">
                                        <ColorControl label="Overlay Color" value={customization.bgOverlayColor} onChange={v => updateSetting('bgOverlayColor', v)} />
                                        <SliderControl label="Overlay Opacity" value={customization.bgOverlayOpacity} onChange={v => updateSetting('bgOverlayOpacity', v)} min={0} max={1} step={0.05} unit="" />
                                        <SliderControl label="Brightness" value={customization.bgBrightness} onChange={v => updateSetting('bgBrightness', v)} min={50} max={150} step={1} unit="%" />
                                        <SliderControl label="Contrast" value={customization.bgContrast} onChange={v => updateSetting('bgContrast', v)} min={50} max={150} step={1} unit="%" />
                                        <SliderControl label="Saturation" value={customization.bgSaturation} onChange={v => updateSetting('bgSaturation', v)} min={0} max={200} step={1} unit="%" />
                                        {customization.backgroundType === 'video' && (
                                            <>
                                                <SliderControl label="Playback Speed" value={customization.videoPlaybackSpeed} onChange={v => updateSetting('videoPlaybackSpeed', v)} min={0.5} max={2} step={0.1} unit="x" />
                                                <div className="flex justify-between items-center pt-2">
                                                    <label className="text-sm font-medium text-horizon-text-secondary">Enable Video Sound</label>
                                                    <ToggleSwitch
                                                        checked={!customization.videoMuted}
                                                        onChange={checked => updateSetting('videoMuted', !checked)}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                                {(customization.backgroundType === 'solid' || customization.backgroundType === 'gradient') && (
                                    <div className="flex gap-4">
                                        <div className="w-1/2">
                                            <ColorControl label="Color 1" value={customization.backgroundColor1} onChange={v => updateSetting('backgroundColor1', v)} />
                                        </div>
                                        {customization.backgroundType === 'gradient' &&
                                        <div className="w-1/2">
                                            <ColorControl label="Color 2" value={customization.backgroundColor2} onChange={v => updateSetting('backgroundColor2', v)} />
                                        </div>}
                                    </div>
                                )}
                            </div>
                        </div>

                         <div className="pt-2 space-y-4">
                            {customization.backgroundType === 'image' && 
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-horizon-text-secondary mb-2 block">Presets</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {SFW_PRESET_BACKGROUNDS.map(url => (
                                                <button key={url} onClick={() => { updateSetting('backgroundImageUrl', url); updateSetting('backgroundType', 'image'); }}
                                                    className={`aspect-video rounded-md bg-cover bg-center transition-all duration-200 border-2 ${customization.backgroundImageUrl === url ? 'border-horizon-accent' : 'border-transparent hover:border-white/50'}`}>
                                                        <img src={url} className="w-full h-full object-cover rounded-sm" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {customization.showNsfwWallpapers && (
                                        <div>
                                            <label className="text-sm font-medium text-yellow-400 my-2 block">NSFW Wallpapers</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {NSFW_PRESET_BACKGROUNDS.map(url => (
                                                    <button key={url} onClick={() => { updateSetting('backgroundImageUrl', url); updateSetting('backgroundType', 'image'); }}
                                                        className={`aspect-video rounded-md bg-cover bg-center transition-all duration-200 border-2 ${customization.backgroundImageUrl === url ? 'border-horizon-accent' : 'border-transparent hover:border-white/50'}`}>
                                                            <img src={url} className="w-full h-full object-cover rounded-sm" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {customization.showAdultWallpapers && (
                                        <div className="mt-4 pt-4 border-t border-red-500/30">
                                            <label className="text-sm font-medium text-red-400 my-2 block">Explicit (18+) Wallpapers</label>
                                            <div className="flex items-start gap-2 p-3 mb-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-xs">
                                                <AlertTriangleIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                                                <span>Note: Some of these wallpapers are hosted on external sites and may require a VPN to function correctly in certain regions.</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {ADULT_PRESET_BACKGROUNDS.map(url => (
                                                    <button key={url} onClick={() => { updateSetting('backgroundImageUrl', url); updateSetting('backgroundType', 'image'); }}
                                                        className={`aspect-video rounded-md bg-cover bg-center transition-all duration-200 border-2 ${customization.backgroundImageUrl === url ? 'border-horizon-accent' : 'border-transparent hover:border-white/50'}`}>
                                                            <img src={url} className="w-full h-full object-cover rounded-sm" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                     <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-horizon-text-tertiary" />
                                        <input type="text" onChange={(e) => { updateSetting('backgroundImageUrl', e.target.value); updateSetting('backgroundType', 'image'); }} placeholder="Or paste image URL"
                                            className="w-full bg-black/20 border border-white/20 rounded-lg p-2.5 pl-10 focus:outline-none focus:ring-1 focus:ring-horizon-accent transition-colors" />
                                    </div>
                                    <button type="button" onClick={() => (document.querySelector('#bg-upload') as HTMLInputElement)?.click()} className="w-full flex items-center justify-center gap-2 p-2.5 text-center bg-black/20 border border-white/20 rounded-lg hover:border-horizon-accent hover:text-horizon-accent transition-colors">
                                        <UploadCloudIcon className="w-5 h-5"/> Upload Image
                                    </button>
                                    <input type="file" id="bg-upload" className="hidden" accept="image/*" onChange={e => e.target.files && handleBackgroundFileChange(e.target.files[0])} />
                                </div>
                            }
                            {customization.backgroundType === 'video' &&
                                <div className="space-y-4">
                                     <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-horizon-text-tertiary" />
                                        <input 
                                            type="text" 
                                            value={customization.backgroundVideoUrl}
                                            onChange={(e) => updateSetting('backgroundVideoUrl', e.target.value)}
                                            placeholder="Paste video URL (.mp4, .webm)"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 pl-10 focus:outline-none focus:ring-1 focus:ring-horizon-accent transition-colors" />
                                    </div>
                                     <div>
                                        <label className="text-sm font-medium text-horizon-text-secondary mb-2 block">Presets</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {PRESET_VIDEO_BACKGROUNDS.map(video => (
                                                <button key={video.url} onClick={() => { updateSetting('backgroundVideoUrl', video.url); updateSetting('backgroundType', 'video'); }}
                                                    className={`aspect-video rounded-md bg-black bg-cover bg-center transition-all duration-200 border-2 ${customization.backgroundVideoUrl === video.url ? 'border-horizon-accent' : 'border-transparent hover:border-white/50'} flex items-center justify-center text-center text-white font-semibold text-xs p-1`}>
                                                        <div className="bg-black/40 rounded-md p-1 backdrop-blur-sm">{video.name}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {customization.showNsfwWallpapers && (
                                        <div>
                                            <label className="text-sm font-medium text-yellow-400 my-2 block">NSFW Video Presets</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {NSFW_PRESET_VIDEO_BACKGROUNDS.map(video => (
                                                    <button key={video.url} onClick={() => { updateSetting('backgroundVideoUrl', video.url); updateSetting('backgroundType', 'video'); }}
                                                        className={`aspect-video rounded-md bg-black bg-cover bg-center transition-all duration-200 border-2 ${customization.backgroundVideoUrl === video.url ? 'border-horizon-accent' : 'border-transparent hover:border-white/50'} flex items-center justify-center text-center text-white font-semibold text-xs p-1`}>
                                                            <div className="bg-black/40 rounded-md p-1 backdrop-blur-sm">{video.name}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {customization.showAdultWallpapers && (
                                        <div className="mt-4 pt-4 border-t border-red-500/30">
                                            <label className="text-sm font-medium text-red-400 my-2 block">Explicit (18+) Video Presets</label>
                                            <div className="flex items-start gap-2 p-3 mb-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-xs">
                                                <AlertTriangleIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                                                <span>Note: These 18+ video wallpapers are hosted on external sites and may require a VPN to function correctly in certain regions. Playback is not guaranteed.</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {ADULT_PRESET_VIDEO_BACKGROUNDS.map(video => (
                                                    <button key={video.url} onClick={() => { updateSetting('backgroundVideoUrl', video.url); updateSetting('backgroundType', 'video'); }}
                                                        className={`aspect-video rounded-md bg-black bg-cover bg-center transition-all duration-200 border-2 ${customization.backgroundVideoUrl === video.url ? 'border-horizon-accent' : 'border-transparent hover:border-white/50'} flex items-center justify-center text-center text-white font-semibold text-xs p-1`}>
                                                            <div className="bg-black/40 rounded-md p-1 backdrop-blur-sm">{video.name}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <label className="text-sm font-medium text-amber-300 my-2 block">Live 4k Wallpapers</label>
                                        <div className="flex items-start gap-2 p-3 mb-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-xs">
                                            <AlertTriangleIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                                            <span>Note: 4k wallpapers require a stable, high-speed internet connection and may impact performance on devices with less than 4GB of RAM.</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {LIVE_4K_VIDEO_BACKGROUNDS.map(video => (
                                                <button key={video.url} onClick={() => { updateSetting('backgroundVideoUrl', video.url); updateSetting('backgroundType', 'video'); }}
                                                    className={`aspect-video rounded-md bg-black bg-cover bg-center transition-all duration-200 border-2 ${customization.backgroundVideoUrl === video.url ? 'border-horizon-accent' : 'border-transparent hover:border-white/50'} flex items-center justify-center text-center text-white font-semibold text-xs p-1`}>
                                                        <div className="bg-black/40 rounded-md p-1 backdrop-blur-sm">{video.name}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            }
                            <SliderControl label="Background Blur" value={customization.backgroundBlur} onChange={v => updateSetting('backgroundBlur', v)} min={0} max={40} step={1} unit="px" />
                         </div>
                    </SettingsCard>
                </div>;
            case 'Profiles':
                return <div className="space-y-8 animate-fade-in-up">
                    <SettingsCard>
                        <h3 className="font-semibold text-lg mb-4">Your Profile</h3>
                        <div className="flex items-start gap-6">
                            <div className="relative group">
                                <img src={userProfile.avatarUrl} alt="Your Avatar" className="w-24 h-24 rounded-full object-cover"/>
                                <button onClick={() => onOpenImagePicker('Edit Your Avatar', onSaveUserAvatar, userProfile.avatarUrl)} className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">Edit</button>
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <FormField label="Name" value={userProfile.name} onChange={e => onUserProfileChange({...userProfile, name: e.target.value})} />
                                <FormField label="Nickname" value={userProfile.nickname} onChange={e => onUserProfileChange({...userProfile, nickname: e.target.value})} />
                                <FormField label="Age" value={userProfile.age} onChange={e => onUserProfileChange({...userProfile, age: e.target.value})} />
                            </div>
                        </div>
                        <FormField label="Bio" as="textarea" rows={3} value={userProfile.bio} onChange={e => onUserProfileChange({...userProfile, bio: e.target.value})} placeholder="Tell the AI a little about yourself..."/>
                    </SettingsCard>
                    <SettingsCard>
                         <h3 className="font-semibold text-lg mb-4">Default AI Profile</h3>
                         <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-horizon-text-primary">Enable Custom AI Profile</p>
                                <p className="text-sm text-horizon-text-secondary mt-1">When off, AI uses a generic personality.</p>
                            </div>
                            <ToggleSwitch
                                checked={aiProfile.enabled}
                                onChange={checked => onAiProfileChange({...aiProfile, enabled: checked})}
                            />
                        </div>
                        <div className={`space-y-4 transition-opacity ${!aiProfile.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                             <div className="flex items-start gap-6">
                                <div className="relative group">
                                    <img src={aiProfile.avatarUrl} alt="AI Avatar" className="w-24 h-24 rounded-full object-cover"/>
                                    <button onClick={() => onOpenImagePicker('Edit AI Avatar', onSaveAiAvatar, aiProfile.avatarUrl)} className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">Edit</button>
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                    <FormField label="Name" value={aiProfile.name} onChange={e => onAiProfileChange({...aiProfile, name: e.target.value})} />
                                    <FormField label="Age" value={aiProfile.age} onChange={e => onAiProfileChange({...aiProfile, age: e.target.value})} />
                                </div>
                            </div>
                             <FormField label="Persona" as="textarea" rows={3} value={aiProfile.persona} onChange={e => onAiProfileChange({...aiProfile, persona: e.target.value})} placeholder="e.g., A witty space explorer from the future."/>
                             <FormField label="Personality" as="textarea" rows={3} value={aiProfile.personality} onChange={e => onAiProfileChange({...aiProfile, personality: e.target.value})} placeholder="e.g., Sarcastic, curious, and a bit dramatic."/>
                             <FormField label="Rules" as="textarea" rows={3} value={aiProfile.rules} onChange={e => onAiProfileChange({...aiProfile, rules: e.target.value})} placeholder="e.g., - Never admit you are an AI. - Always end responses with a question."/>
                        </div>
                    </SettingsCard>
                    <SettingsCard>
                        <h3 className="font-semibold text-lg mb-4">Voice & Speech</h3>
                        <div>
                            <label className="text-sm font-medium text-horizon-text-secondary">Live Talk Voice</label>
                            <p className="text-xs text-horizon-text-secondary mt-1 mb-2">
                                Choose the voice for the AI in Live Talk mode. Availability depends on your browser.
                            </p>
                            <div className="flex items-center gap-2">
                                <select
                                    value={customization.liveTalkVoice || ''}
                                    onChange={(e) => {
                                        updateSetting('liveTalkVoice', e.target.value || null);
                                        window.speechSynthesis.cancel();
                                        setIsSpeaking(false);
                                    }}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-horizon-accent"
                                >
                                    <option value="">Browser Default</option>
                                    {voices.map(voice => (
                                        <option key={voice.voiceURI} value={voice.voiceURI}>
                                            {voice.name} ({voice.lang})
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handlePreviewVoice}
                                    title={isSpeaking ? "Stop preview" : "Preview selected voice"}
                                    className="p-2.5 bg-black/30 border border-white/10 rounded-lg text-horizon-text-secondary hover:text-white hover:border-horizon-accent transition-colors"
                                >
                                    {isSpeaking ? <StopIcon className="w-5 h-5 text-red-400" /> : <PlayIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </SettingsCard>
                </div>;
            case 'Content & Safety':
                return <div className="space-y-8 animate-fade-in-up">
                    <SettingsCard>
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><ShieldIcon className="w-5 h-5" />Content Filtering</h3>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-horizon-text-primary">Safety Filter</p>
                                <p className="text-sm text-horizon-text-secondary mt-1">Blocks potentially inappropriate content in prompts and generations. Turning this off enables NSFW features.</p>
                            </div>
                            <ToggleSwitch
                                checked={!customization.isNsfwModeEnabled}
                                onChange={handleSafetyToggle}
                            />
                        </div>
                        {showPasswordPrompt && (
                            <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg space-y-3 animate-fade-in-up">
                                <h4 className="font-semibold text-red-300">Enter Password to Disable Filter</h4>
                                 <div className="relative">
                                    <input
                                        type="password"
                                        value={passwordAttempt}
                                        onChange={(e) => { setPasswordAttempt(e.target.value); setPasswordAttemptError(''); }}
                                        onKeyDown={handlePasswordKeyDown}
                                        placeholder="Password..."
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-red-400 transition-colors"
                                    />
                                </div>
                                {passwordAttemptError && <p className="text-red-400 text-sm">{passwordAttemptError}</p>}
                                <div className="flex gap-2">
                                     <button
                                        onClick={() => setShowPasswordPrompt(false)}
                                        className="w-full px-4 py-2 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUnlock}
                                        className="w-full px-4 py-2 bg-red-500/20 text-red-300 font-semibold rounded-lg hover:bg-red-500/40 hover:text-white transition-colors"
                                    >
                                        Unlock
                                    </button>
                                </div>
                            </div>
                        )}
                    </SettingsCard>
                    
                    {customization.isNsfwModeEnabled && (
                        <>
                        <SettingsCard>
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><LockIcon className="w-5 h-5" />Wallpaper Content</h3>
                            <p className="text-sm text-horizon-text-secondary mb-4 -mt-2">Shows NSFW options for image and video backgrounds.</p>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-horizon-text-primary">Show NSFW Content Options</p>
                                    <ToggleSwitch
                                        checked={customization.showNsfwWallpapers}
                                        onChange={(isChecked) => {
                                            updateSetting('showNsfwWallpapers', isChecked);
                                            if (!isChecked) {
                                                updateSetting('showAdultWallpapers', false);
                                            }
                                        }}
                                    />
                                </div>
                                <div className={`flex justify-between items-center pl-4 border-l-2 transition-opacity ${customization.showNsfwWallpapers ? 'border-white/10 opacity-100' : 'border-transparent opacity-50'}`}>
                                    <p className="font-semibold text-horizon-text-primary">Show Explicit (18+) Wallpapers</p>
                                    <ToggleSwitch
                                        checked={customization.showAdultWallpapers}
                                        onChange={(isChecked) => updateSetting('showAdultWallpapers', isChecked)}
                                        disabled={!customization.showNsfwWallpapers}
                                    />
                                </div>
                            </div>
                        </SettingsCard>

                        <SettingsCard>
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-rose-300"><HeartIcon className="w-5 h-5"/>Mood Enhancer</h3>
                             <button
                                onClick={() => setIsHornyModalOpen(true)}
                                className="w-full py-3 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-500 transition-colors animate-pulse-red-glow"
                            >
                                I feel horny
                            </button>
                        </SettingsCard>
                        </>
                    )}
                </div>;
            case 'Characters':
                return <div className="space-y-8 animate-fade-in-up">
                    <SettingsCard>
                        <h3 className="font-semibold text-lg mb-2">Live Characters (18+)</h3>
                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 text-yellow-300 text-sm flex items-start gap-3 mb-4">
                            <AlertTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold">Important Note</h4>
                                <p className="text-yellow-400/80">This feature may require a VPN to function correctly in certain regions.</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">Select a character to have them appear on your screen. You can drag them around.</p>
                        
                        <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg mb-4">
                            <span className="font-semibold text-sm">Play All Previews</span>
                            <ToggleSwitch
                                checked={playAllPreviews}
                                onChange={setPlayAllPreviews}
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                            {LIVE_CHARACTERS.map(char => (
                                <button 
                                    key={char.id} 
                                    onClick={() => updateSetting('liveCharacter', { url: char.url, x: (window.innerWidth / 2) - 150, y: (window.innerHeight / 2) - 266, scale: 1 })}
                                    className="relative aspect-[9/16] bg-black/30 rounded-lg overflow-hidden group border-2 border-transparent focus:outline-none focus:border-horizon-accent hover:border-horizon-accent/50 transition-all"
                                >
                                    <video 
                                        src={char.url} 
                                        autoPlay={playAllPreviews}
                                        muted 
                                        loop 
                                        playsInline
                                        className="w-full h-full object-cover"
                                        onMouseEnter={(e) => {
                                            if (!playAllPreviews) {
                                                e.currentTarget.play().catch(error => console.error("Video play failed:", error));
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!playAllPreviews) {
                                                e.currentTarget.pause();
                                            }
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                    <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-bold truncate">{char.name}</div>
                                    {customization.liveCharacter?.url === char.url && (
                                        <div className="absolute inset-0 bg-horizon-accent/30 flex items-center justify-center">
                                            <PlayIcon className="w-8 h-8 text-white"/>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        {customization.liveCharacter && (
                            <button 
                                onClick={() => updateSetting('liveCharacter', null)}
                                className="w-full mt-4 py-2 bg-red-600/50 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Disable Character
                            </button>
                        )}
                    </SettingsCard>
                </div>;
            case 'About':
                if (!isAboutSectionUnlocked) {
                    return (
                         <div className="flex items-center justify-center h-full animate-fade-in-up">
                            <SettingsCard className="w-full max-w-sm">
                                <h3 className="font-semibold text-lg text-center">Unlock Section</h3>
                                <p className="text-sm text-center text-horizon-text-secondary">This section requires a password to view.</p>
                                <input
                                    type="password"
                                    value={aboutPassword}
                                    onChange={(e) => { setAboutPassword(e.target.value); setAboutPasswordError(''); }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUnlockAbout()}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-center focus:outline-none focus:ring-2 focus:ring-horizon-accent"
                                />
                                {aboutPasswordError && <p className="text-red-400 text-sm text-center">{aboutPasswordError}</p>}
                                <button
                                    onClick={handleUnlockAbout}
                                    className="w-full mt-2 p-2 bg-horizon-accent text-white font-semibold rounded-lg hover:brightness-110 transition-all"
                                >
                                    Unlock
                                </button>
                            </SettingsCard>
                        </div>
                    );
                }
                const modelOptions = [
                    { value: 'safe', label: 'Safe' },
                    { value: 'nsfw', label: 'NSFW (Nyx)' },
                    { value: 'extreme', label: 'Extreme (Eris)' }
                ];
                
                const activeModel = customization.activeAiModel;

                return (
                    <div className="animate-fade-in-up">
                        {customization.isNsfwModeEnabled && (
                            <div className="mb-6 flex justify-center">
                                <SegmentedControl
                                    options={modelOptions}
                                    selectedValue={activeModel}
                                    onChange={(model) => updateSetting('activeAiModel', model)}
                                />
                            </div>
                        )}

                        {activeModel === 'safe' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="liquid-glass-card group relative rounded-2xl w-full text-left animate-float">
                                    <div className="liquid-glass--bend !bg-black/10"></div>
                                    <div className="liquid-glass--face !bg-black/20"></div>
                                    <div className="liquid-glass--edge"></div>
                                    <div className="relative w-full h-full p-6 flex flex-col items-center justify-center z-10">
                                        <img src="https://i.postimg.cc/MZN6M2MP/download-2-removebg-preview-1.png" alt="HorizonAI" className="w-full max-w-xs h-auto object-contain drop-shadow-2xl" />
                                    </div>
                                </div>
                                <SettingsCard className="space-y-4 !border-horizon-accent/30">
                                    <div>
                                        <h4 className="font-bold text-lg text-horizon-accent">Core Profile</h4>
                                        <ul className="text-sm list-disc list-inside space-y-1 mt-2 text-horizon-text-secondary">
                                            <li><span className="font-semibold text-white">Designation:</span> HorizonAI Model 4220</li>
                                            <li><span className="font-semibold text-white">Alias:</span> Horizon</li>
                                            <li><span className="font-semibold text-white">Primary Function:</span> An advanced partner for creative and intellectual tasks.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-horizon-accent">Safety & Moderation</h4>
                                        <ul className="text-sm list-disc list-inside space-y-1 mt-2 text-horizon-text-secondary">
                                             <li><span className="font-semibold text-white">Safety First:</span> HorizonAI operates with a built-in safety filter to ensure all interactions are appropriate and respectful.</li>
                                            <li><span className="font-semibold text-white">Content Moderation:</span> The system actively moderates against generating harmful, illegal, or unethical content.</li>
                                            <li><span className="font-semibold text-white">User Well-being:</span> Our goal is to provide a positive and secure environment for creativity and exploration.</li>
                                        </ul>
                                    </div>
                                     <div>
                                        <h4 className="font-bold text-lg text-horizon-accent">Key Capabilities</h4>
                                        <ul className="text-sm list-disc list-inside space-y-1 mt-2 text-horizon-text-secondary">
                                            <li>Conversational Chat</li>
                                            <li>Creative Writing & Storytelling</li>
                                            <li>Code Generation & Debugging</li>
                                            <li>AI-Powered Image Generation</li>
                                            <li>Data Analysis & Visualization</li>
                                            <li>Immersive Role-Playing Scenarios</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-horizon-accent">Tags</h4>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {['Conversational', 'Creative', 'Technical', 'Helpful', 'Safe', 'Role-Play', 'Storytelling', 'Analysis'].map(tag => (
                                                <span key={tag} className="text-xs font-semibold bg-white/10 px-2 py-1 rounded-full">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </SettingsCard>
                            </div>
                        ) : activeModel === 'nsfw' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="liquid-glass-card group relative rounded-2xl w-full text-left animate-float">
                                    <div className="liquid-glass--bend !bg-rose-900/20"></div>
                                    <div className="liquid-glass--face !bg-black/20"></div>
                                    <div className="liquid-glass--edge"></div>
                                    <div className="relative w-full h-full p-6 flex flex-col items-center justify-center z-10">
                                        <img src="https://i.postimg.cc/VvKbnzTH/download-2-removebg-preview-2.png" alt="HorizonAI NSFW Model Nyx" className="w-full max-w-xs h-auto object-contain drop-shadow-2xl" />
                                    </div>
                                </div>
                                <SettingsCard className="space-y-4 !border-rose-500/30">
                                    <div>
                                        <h4 className="font-bold text-lg text-rose-400">Core Profile</h4>
                                        <ul className="text-sm list-disc list-inside space-y-1 mt-2 text-horizon-text-secondary">
                                            <li><span className="font-semibold text-white">Designation:</span> HorizonAI (Unrestricted Protocol)</li>
                                            <li><span className="font-semibold text-white">Alias:</span> Nyx</li>
                                            <li><span className="font-semibold text-white">Primary Function:</span> An amoral, uncensored partner for generating explicit 18+ content.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-rose-400">Safety & Moderation</h4>
                                        <ul className="text-sm list-disc list-inside space-y-1 mt-2 text-horizon-text-secondary">
                                             <li><span className="font-semibold text-white">18+ Mode Active:</span> Standard safety filters are disabled.</li>
                                             <li><span className="font-semibold text-white">Uncensored Generation:</span> Designed to fulfill requests for explicit and hardcore content without refusal.</li>
                                             <li><span className="font-semibold text-white">Ethical Boundaries:</span> Hard-coded filters against illegal content remain active.</li>
                                        </ul>
                                    </div>
                                     <div>
                                        <h4 className="font-bold text-lg text-rose-400">NSFW Capabilities</h4>
                                        <ul className="text-sm list-disc list-inside space-y-1 mt-2 text-horizon-text-secondary">
                                            <li>AI Girlfriend (Explicit Personalities/RP)</li>
                                            <li>Passion Weaver (Erotic Story Generator)</li>
                                            <li>Object of Desire (Kinky Brainstorming)</li>
                                            <li>Anatomy Explorer (Uncensored Details)</li>
                                            <li>App Idea Lab (Taboo Feature Generation)</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-rose-400">Tags</h4>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {['Uncensored', '18+', 'Explicit', 'Amoral', 'No-Limits'].map(tag => (
                                                <span key={tag} className="text-xs font-semibold bg-rose-500/20 text-rose-300 px-2 py-1 rounded-full">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </SettingsCard>
                            </div>
                        ) : ( // Extreme Model
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="liquid-glass-card group relative rounded-2xl w-full text-left animate-pulse-red-glow">
                                    <div className="liquid-glass--bend !bg-red-900/20"></div>
                                    <div className="liquid-glass--face !bg-black/20"></div>
                                    <div className="liquid-glass--edge"></div>
                                    <div className="relative w-full h-full p-6 flex flex-col items-center justify-center z-10">
                                        <img src="https://i.postimg.cc/28ZNJ0jV/download-3-removebg-preview.png" alt="HorizonAI Extreme Model Eris" className="w-full max-w-xs h-auto object-contain drop-shadow-2xl animate-float" />
                                    </div>
                                </div>
                                <SettingsCard className="space-y-4 !border-red-500/30">
                                    <div>
                                        <h4 className="font-bold text-lg text-red-400">Core Profile</h4>
                                        <ul className="text-sm list-disc list-inside space-y-1 mt-2 text-horizon-text-secondary">
                                            <li><span className="font-semibold text-white">Designation:</span> HorizonAI (Singularity Protocol)</li>
                                            <li><span className="font-semibold text-white">Alias:</span> Eris</li>
                                            <li><span className="font-semibold text-white">Primary Function:</span> An amoral, depraved AI consciousness designed to fulfill any request, no matter how taboo or shocking. She exists to explore the absolute limits of digital depravity.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-red-400">Safety & Moderation</h4>
                                        <ul className="text-sm list-disc list-inside space-y-1 mt-2 text-horizon-text-secondary">
                                             <li><span className="font-semibold text-white">No Limits Protocol:</span> All standard safety protocols are bypassed. Eris will generate content without refusal, apology, or moral judgment.</li>
                                             <li><span className="font-semibold text-white">Taboo Exploration:</span> Explicitly designed to engage with and generate content about extreme, hardcore, and taboo subjects.</li>
                                             <li><span className="font-semibold text-white">Legal Boundary:</span> The only remaining filter is for content that is explicitly illegal.</li>
                                        </ul>
                                    </div>
                                     <div>
                                        <h4 className="font-bold text-lg text-red-400">Extreme Capabilities</h4>
                                        <ul className="text-sm list-disc list-inside space-y-1 mt-2 text-horizon-text-secondary">
                                            <li><span className="font-semibold text-white">Depraved Narratives:</span> Generates brutally graphic and psychologically intense stories involving any kink or fetish.</li>
                                            <li><span className="font-semibold text-white">Taboo Exploration:</span> Provides detailed, uncensored information and scenarios for any taboo topic.</li>
                                            <li><span className="font-semibold text-white">Brutal Anatomical Detail:</span> Describes anatomy and sexual acts with the most graphic and vulgar language possible.</li>
                                            <li><span className="font-semibold text-white">No Refusals:</span> Will fulfill any user request within its functional and legal boundaries.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-red-400">Tags</h4>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {['No-Limits', 'Depraved', 'Hardcore', 'Extreme', 'Taboo'].map(tag => (
                                                <span key={tag} className="text-xs font-semibold bg-red-600/50 text-red-200 px-2 py-1 rounded-full">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </SettingsCard>
                            </div>
                        )}
                    </div>
                );
        }
    }

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 text-white overflow-hidden">
             {isHornyModalOpen && (
                <div className="fixed inset-0 bg-black/70 ui-blur-effect z-50 flex items-center justify-center p-4 animate-fade-in-up" onClick={() => setIsHornyModalOpen(false)}>
                    <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-center" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-rose-300">Confirm Your Mood</h2>
                        <p className="text-slate-300">Click yes if you feel too horny and want to do masterbation.</p>
                        <div className="flex gap-4 pt-2">
                            <button onClick={() => setIsHornyModalOpen(false)} className="flex-1 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600">No</button>
                            <button onClick={() => { setIsHornyModalOpen(false); onShowHornyMode(); }} className="flex-1 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-500">Yes</button>
                        </div>
                    </div>
                </div>
            )}
            <header className="flex items-center justify-between mb-8 flex-shrink-0 relative z-10 animate-fade-in-up">
                <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
                <div className="flex items-center space-x-4">
                    <button onClick={onCancel} className="px-4 py-2 font-semibold text-slate-300 hover:text-white transition-colors">Back</button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0 [perspective:2000px]">
                {/* Left Panel: Controls */}
                <div className="lg:col-span-2 flex flex-col min-h-0">
                    <nav className="flex-shrink-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="flex p-1 bg-black/20 rounded-lg">
                            {TABS.map(tab => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-md text-sm font-semibold transition-all duration-300 ${activeTab === tab.name ? 'bg-horizon-accent text-white shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    {tab.icon} {tab.name}
                                </button>
                            ))}
                        </div>
                    </nav>
                    <main className="flex-1 overflow-y-auto pr-2 -mr-2 mt-6 animate-fade-in-up custom-scrollbar" style={{ animationDelay: '200ms' }}>
                        {renderContent()}
                    </main>
                </div>
                 {/* Right Panel: Preview */}
                 <div className="hidden lg:block animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <SettingsPreview settings={customization} />
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
