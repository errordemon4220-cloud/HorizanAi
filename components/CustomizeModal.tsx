import React, { useState, useEffect } from 'react';
import { CustomizationSettings, ModelName } from '../types';
import { XIcon, RefreshCwIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon } from './icons';
import * as dbService from '../services/dbService';

// --- ROBUST & SIMPLE COLOR UTILITIES ---
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null;
};

const hexToRgba = (hex: string, alpha: number): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return `rgba(0,0,0,${alpha})`;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};


const adjustColor = (hex: string, percent: number): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const amount = Math.round(2.55 * percent);
    const clamp = (val: number) => Math.max(0, Math.min(255, val));
    const r = clamp(rgb.r + amount);
    const g = clamp(rgb.g + amount);
    const b = clamp(rgb.b + amount);
    const toHex = (c: number) => ('0' + c.toString(16)).slice(-2);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// --- CUSTOMIZATION HOOK ---
const defaultSettings: CustomizationSettings = {
    theme: 'dark',
    accentLight: '#8b5cf6', // A vibrant purple for light mode
    accentDark: '#a78bfa',  // A slightly lighter purple for dark mode
    language: 'English',
    model: 'gemini-2.5-flash',
    backgroundType: 'aurora',
    backgroundColor1: '#1e3a8a',
    backgroundColor2: '#4c1d95',
    backgroundImageUrl: '',
    backgroundVideoUrl: '',
    backgroundBlur: 8,
    showNsfwWallpapers: false,
    showAdultWallpapers: false,
    fontFamily: 'Roboto',
    fontSize: 16,
    lineHeight: 1.7,
    letterSpacing: 0,
    chatsWidth: 48,
    promptWidth: 48,
    chatFullWidth: false,
    syncPromptWidth: true,
    showUserBubble: true,
    showGptBubble: true,
    scrollDownButtonAlign: 'center',
    animationIntensity: 'default',
    isNsfwModeEnabled: false,
    disableAllAnimations: true,
    colorfulIcons: false,
    globalBlur: 0,
    // Advanced Backgrounds
    auroraColor1: '#3b82f6',
    auroraColor2: '#ec4899',
    auroraSpeed: 30,
    gradientAngle: 135,
    bgOverlayColor: '#000000',
    bgOverlayOpacity: 0.3,
    bgBrightness: 100,
    bgContrast: 100,
    bgSaturation: 100,
    videoPlaybackSpeed: 1.0,
    videoMuted: true,
    liveCharacter: null,
    activeAiModel: 'safe',
    liveTalkVoice: null,
};

export const useCustomization = () => {
    const [settings, setSettings] = useState<CustomizationSettings>(defaultSettings);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        dbService.initDB().then(() => {
            dbService.getKeyValue<CustomizationSettings>('customizationSettings').then(savedSettings => {
                if (savedSettings) {
                    // Ensure the saved model is still valid. If not, reset to default.
                    const validModels: ModelName[] = ['gemini-2.5-flash'];
                    if (!validModels.includes(savedSettings.model)) {
                        savedSettings.model = defaultSettings.model;
                    }
                    setSettings({ ...defaultSettings, ...savedSettings });
                }
                setIsLoaded(true);
            });
        });
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        
        dbService.setKeyValue('customizationSettings', settings);

        const styleId = 'horizon-customization-style';
        let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = styleId;
            document.head.appendChild(styleTag);
        }

        const accentLightHover = adjustColor(settings.accentLight, -10);
        const accentDarkHover = adjustColor(settings.accentDark, -10);
        
        document.documentElement.classList.remove('dark', 'theme-system');
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (settings.theme === 'system') {
            document.documentElement.classList.add('dark', 'theme-system');
        }
        
        document.body.classList.remove('playful-animations', 'subtle-animations', 'animations-disabled');
        if (settings.disableAllAnimations) {
            document.body.classList.add('animations-disabled');
        } else if (settings.animationIntensity === 'playful') {
            document.body.classList.add('playful-animations');
        } else if (settings.animationIntensity === 'subtle') {
            document.body.classList.add('subtle-animations');
        }

        document.body.classList.toggle('colorful-icons', settings.colorfulIcons);

        styleTag.innerHTML = `
:root {
  --horizon-accent: ${settings.accentLight};
  --horizon-accent-hover: ${accentLightHover};
  --font-family: "${settings.fontFamily}", ui-sans-serif, system-ui, sans-serif;
  --font-size: ${settings.fontSize}px;
  --line-height: ${settings.lineHeight};
  --letter-spacing: ${settings.letterSpacing}px;
  --ui-blur: ${settings.globalBlur}px;
  --aurora-color-1: ${settings.auroraColor1};
  --aurora-color-2: ${settings.auroraColor2};
  --aurora-speed: ${settings.auroraSpeed}s;
}
html.dark {
  --horizon-accent: ${settings.accentDark};
  --horizon-accent-hover: ${accentDarkHover};
}
html.theme-system {
  --horizon-accent: #f59e0b; /* Golden Yellow (amber-500) */
  --horizon-accent-hover: #facc15; /* Lighter Golden Yellow (amber-400) */
}
    `.trim();
    
    const bgContainer = document.getElementById('background-container');
    const bgBackdrop = document.getElementById('background-backdrop');
    const auroraBlob1 = document.getElementById('aurora-blob-1');
    const auroraBlob2 = document.getElementById('aurora-blob-2');

    if (bgContainer && bgBackdrop && auroraBlob1 && auroraBlob2) {
        // Manage video element
        let videoEl = document.getElementById('background-video') as HTMLVideoElement;
        if (!videoEl) {
            videoEl = document.createElement('video');
            videoEl.id = 'background-video';
            videoEl.style.position = 'absolute';
            videoEl.style.inset = '0';
            videoEl.style.width = '100%';
            videoEl.style.height = '100%';
            videoEl.style.objectFit = 'cover';
            videoEl.style.zIndex = '-1';
            videoEl.autoplay = true;
            videoEl.loop = true;
            videoEl.muted = true;
            videoEl.playsInline = true;
            bgContainer.appendChild(videoEl);
        }

        // Reset styles
        bgContainer.style.backgroundColor = '';
        bgContainer.style.backgroundImage = '';
        bgBackdrop.style.backgroundColor = 'transparent';
        bgBackdrop.style.setProperty('--app-bg-backdrop-blur', '0px');
        videoEl.style.display = 'none'; // Hide by default
        auroraBlob1.style.display = 'none';
        auroraBlob2.style.display = 'none';
        bgContainer.style.filter = '';
        videoEl.style.filter = '';


        switch (settings.backgroundType) {
            case 'solid':
                bgContainer.style.backgroundColor = settings.backgroundColor1;
                break;
            case 'gradient':
                bgContainer.style.backgroundImage = `linear-gradient(${settings.gradientAngle}deg, ${settings.backgroundColor1}, ${settings.backgroundColor2})`;
                break;
            case 'image':
                if (settings.backgroundImageUrl) {
                    bgContainer.style.backgroundImage = `url('${settings.backgroundImageUrl}')`;
                }
                bgContainer.style.filter = `brightness(${settings.bgBrightness}%) contrast(${settings.bgContrast}%) saturate(${settings.bgSaturation}%)`;
                bgBackdrop.style.backgroundColor = hexToRgba(settings.bgOverlayColor, settings.bgOverlayOpacity);
                break;
            case 'video':
                if (settings.backgroundVideoUrl) {
                    if (videoEl.src !== settings.backgroundVideoUrl) {
                         videoEl.src = settings.backgroundVideoUrl;
                    }
                    videoEl.style.display = 'block';
                    videoEl.playbackRate = settings.videoPlaybackSpeed;
                    videoEl.muted = settings.videoMuted;
                }
                videoEl.style.filter = `brightness(${settings.bgBrightness}%) contrast(${settings.bgContrast}%) saturate(${settings.bgSaturation}%)`;
                bgBackdrop.style.backgroundColor = hexToRgba(settings.bgOverlayColor, settings.bgOverlayOpacity);
                break;
            case 'aurora':
                auroraBlob1.style.display = 'block';
                auroraBlob2.style.display = 'block';
                if (settings.theme === 'system') {
                    bgContainer.style.backgroundColor = '#1c160c';
                } else if (settings.theme === 'dark') {
                    bgContainer.style.backgroundColor = '#0d1117';
                } else {
                    bgContainer.style.backgroundColor = '#f8fafc';
                }
                break;
        }
        bgBackdrop.style.setProperty('--app-bg-backdrop-blur', `${settings.backgroundBlur}px`);
    }

    }, [settings, isLoaded]);

    const updateSetting = <K extends keyof CustomizationSettings>(key: K, value: CustomizationSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const resetSettingsGroup = (group: 'color' | 'font' | 'layout') => {
        setSettings(prev => {
            const newSettings = { ...prev };
            const groups = {
                color: ['accentLight', 'accentDark'],
                font: ['fontFamily', 'fontSize', 'lineHeight', 'letterSpacing'],
                layout: ['chatsWidth', 'promptWidth', 'chatFullWidth', 'syncPromptWidth', 'showUserBubble', 'showGptBubble', 'scrollDownButtonAlign']
            };
            (Object.keys(defaultSettings) as Array<keyof CustomizationSettings>).forEach(key => {
                 if ((groups[group] as any[]).includes(key)) {
                    (newSettings as any)[key] = defaultSettings[key];
                 }
            });
            return newSettings;
        });
    };
    
    const resetAllCustomization = () => {
        setSettings(defaultSettings);
    };

    return { settings, updateSetting, resetSettingsGroup, resetAllCustomization };
};

// --- UI HELPER COMPONENTS ---
const CustomCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-black/20 dark:bg-black/20 border border-white/10 rounded-xl p-4 ${className}`}>
        {children}
    </div>
);

const SliderControl: React.FC<{label: string; value: number; settingKey: keyof CustomizationSettings; unit: string; min: number; max: number; step: number; updateSetting: any;}> = ({label, value, settingKey, unit, min, max, step, updateSetting}) => (
    <div className="flex items-center justify-between gap-4">
        <label className="text-sm text-horizon-light-text-secondary dark:text-horizon-text-secondary whitespace-nowrap">{label}</label>
        <div className="flex items-center gap-3 w-full">
            <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => updateSetting(settingKey, parseFloat(e.target.value))} className="w-full h-2 bg-black/20 rounded-lg appearance-none cursor-pointer accent-horizon-accent" />
            <span className="text-sm font-semibold w-20 text-right">{value} {unit}</span>
        </div>
    </div>
);

const SwitchControl: React.FC<{label: string; checked: boolean; onChange: (checked: boolean) => void;}> = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between p-3 bg-black/20 dark:bg-black/20 rounded-lg">
        <span className="font-semibold text-sm">{label}</span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-horizon-accent"></div>
        </label>
    </div>
);

const ResetButton: React.FC<{ onReset: () => void, label: string }> = ({ onReset, label }) => (
    <button
        onClick={onReset}
        className="w-full mt-6 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-horizon-text-primary rounded-lg font-semibold transition-colors"
    >
        {label}
    </button>
);


// --- MAIN COMPONENT ---
interface CustomizeModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: CustomizationSettings;
    updateSetting: <K extends keyof CustomizationSettings>(key: K, value: CustomizationSettings[K]) => void;
    onReset: (group: 'color' | 'font' | 'layout') => void;
}

type Tab = 'Color' | 'Font' | 'Layout';

const CustomizeModal: React.FC<CustomizeModalProps> = ({ isOpen, onClose, settings, updateSetting, onReset }) => {
    const [activeTab, setActiveTab] = useState<Tab>('Color');

    if (!isOpen) return null;

    const renderContent = () => {
        switch (activeTab) {
            case 'Color': return (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                         <CustomCard className="text-center">
                            <div className="relative w-20 h-20 mx-auto rounded-full border-4 border-white/10" style={{ backgroundColor: settings.accentLight }}>
                                <input type="color" value={settings.accentLight} onChange={(e) => updateSetting('accentLight', e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                            </div>
                            <span className="block mt-3 text-xs font-semibold tracking-wider uppercase text-horizon-text-secondary">ACCENT LIGHT</span>
                        </CustomCard>
                        <CustomCard className="text-center">
                            <div className="relative w-20 h-20 mx-auto rounded-full border-4 border-white/10" style={{ backgroundColor: settings.accentDark }}>
                                <input type="color" value={settings.accentDark} onChange={(e) => updateSetting('accentDark', e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                            </div>
                            <span className="block mt-3 text-xs font-semibold tracking-wider uppercase text-horizon-text-secondary">ACCENT DARK</span>
                        </CustomCard>
                    </div>
                    <ResetButton onReset={() => onReset('color')} label="Reset Colors" />
                </div>
            );
            case 'Font': return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <CustomCard className="text-center">
                            <label className="text-xs font-semibold tracking-wider uppercase text-horizon-text-secondary">FONT FAMILY</label>
                            <input type="text" value={settings.fontFamily} onChange={(e) => updateSetting('fontFamily', e.target.value)} className="w-full bg-transparent font-bold text-xl text-center focus:outline-none mt-2"/>
                        </CustomCard>
                         <CustomCard className="text-center">
                            <label className="text-xs font-semibold tracking-wider uppercase text-horizon-text-secondary">FONT SIZE</label>
                             <div className="flex items-baseline justify-center gap-1">
                                <input type="number" value={settings.fontSize} onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))} className="w-14 bg-transparent font-bold text-xl text-right focus:outline-none mt-2 appearance-none [-moz-appearance:textfield]"/>
                                <span className="font-semibold text-horizon-text-tertiary">px</span>
                             </div>
                        </CustomCard>
                    </div>
                    <CustomCard className="space-y-4">
                        <SliderControl label="Line Height" value={settings.lineHeight} settingKey="lineHeight" unit="" min={1.2} max={2.5} step={0.05} updateSetting={updateSetting} />
                        <SliderControl label="Letter Space" value={settings.letterSpacing} settingKey="letterSpacing" unit="px" min={-1} max={3} step={0.1} updateSetting={updateSetting} />
                    </CustomCard>
                    <ResetButton onReset={() => onReset('font')} label="Reset Fonts" />
                </div>
            );
            case 'Layout': return (
                 <div className="space-y-4">
                    <CustomCard className="space-y-4">
                        <SliderControl label="Chats Width" value={settings.chatsWidth} settingKey="chatsWidth" unit="rem" min={24} max={100} step={1} updateSetting={updateSetting} />
                        <SliderControl label="Prompt Width" value={settings.promptWidth} settingKey="promptWidth" unit="rem" min={24} max={100} step={1} updateSetting={updateSetting} />
                    </CustomCard>
                    <CustomCard className="space-y-3">
                        <SwitchControl label="Chat Full Width" checked={settings.chatFullWidth} onChange={(c) => updateSetting('chatFullWidth', c)} />
                        <SwitchControl label="Sync Prompt Width" checked={settings.syncPromptWidth} onChange={(c) => updateSetting('syncPromptWidth', c)} />
                    </CustomCard>
                     <CustomCard>
                        <h4 className="text-xs font-semibold tracking-wider uppercase text-horizon-text-secondary mb-3">CHAT BUBBLES TOGGLE</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <SwitchControl label="User" checked={settings.showUserBubble} onChange={(c) => updateSetting('showUserBubble', c)} />
                            <SwitchControl label="GPT" checked={settings.showGptBubble} onChange={(c) => updateSetting('showGptBubble', c)} />
                        </div>
                    </CustomCard>
                    <CustomCard>
                         <h4 className="text-xs font-semibold tracking-wider uppercase text-horizon-text-secondary mb-3">SCROLLDOWN BUTTON ALIGN</h4>
                         <div className="flex w-full bg-black/20 dark:bg-black/20 rounded-lg p-1">
                             {(['left', 'center', 'right'] as const).map(align => (
                                 <button key={align} onClick={() => updateSetting('scrollDownButtonAlign', align)} className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${settings.scrollDownButtonAlign === align ? 'bg-horizon-accent text-white' : 'text-horizon-text-primary hover:bg-white/5'}`}>
                                     {align === 'left' && <AlignLeftIcon className="w-5 h-5"/>}
                                     {align === 'center' && <AlignCenterIcon className="w-5 h-5"/>}
                                     {align === 'right' && <AlignRightIcon className="w-5 h-5"/>}
                                     {align.charAt(0).toUpperCase() + align.slice(1)}
                                 </button>
                             ))}
                         </div>
                    </CustomCard>
                    <ResetButton onReset={() => onReset('layout')} label="Reset Layout" />
                </div>
            );
        }
    };
    
    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 ui-blur-effect transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
            <div className="w-full max-w-lg bg-horizon-sidebar/70 dark:bg-horizon-dark/70 ui-blur-effect border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-lg font-bold">GPThemes Customization</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-horizon-text-tertiary hover:bg-white/10">
                        <XIcon className="w-5 h-5" />
                    </button>
                </header>

                <nav className="p-4 flex justify-center">
                    <div className="bg-black/20 p-1 rounded-full flex items-center gap-1">
                        {(['Color', 'Font', 'Layout'] as Tab[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-horizon-accent text-white' : 'text-horizon-text-secondary hover:bg-white/5 hover:text-white'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="p-4 md:p-6 overflow-y-auto">
                    <div className="animate-fade-in-up">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomizeModal;