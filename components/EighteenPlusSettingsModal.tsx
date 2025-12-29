import React, { useState, useEffect } from 'react';
import { EighteenPlusTalkSettings, EROTIC_TONES, EroticTone } from '../types';
import { XIcon, TrashIcon } from './icons';

interface EighteenPlusSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: EighteenPlusTalkSettings;
    onSave: (settings: EighteenPlusTalkSettings) => void;
}

const TagInput: React.FC<{
    tags: string[];
    onTagsChange: (tags: string[]) => void;
    label: string;
    placeholder: string;
}> = ({ tags, onTagsChange, label, placeholder }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) {
                onTagsChange([...tags, newTag]);
            }
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        onTagsChange(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
            <label className="block text-sm font-medium text-rose-200/70 mb-1.5">{label}</label>
            <div className="flex flex-wrap items-center gap-2 p-2 bg-black/20 border border-rose-400/20 rounded-lg">
                {tags.map(tag => (
                    <div key={tag} className="flex items-center gap-1.5 bg-rose-500/20 text-rose-200 text-xs font-semibold px-2 py-1 rounded-full">
                        <span>{tag}</span>
                        <button onClick={() => removeTag(tag)} className="text-rose-300 hover:text-white"><XIcon className="w-3 h-3"/></button>
                    </div>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-sm focus:outline-none min-w-[120px]"
                />
            </div>
        </div>
    );
};

const EighteenPlusSettingsModal: React.FC<EighteenPlusSettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 ui-blur-effect z-50 flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-rose-300">18+ Voice Chat Settings</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-white/10"><XIcon className="w-5 h-5"/></button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                    {/* Scenario */}
                    <div>
                        <label className="block text-sm font-medium text-rose-200/70 mb-1.5">Custom Scenario & Instructions</label>
                        <textarea name="customInstructions" value={localSettings.customInstructions} onChange={handleChange} placeholder="Define the core role-play scenario, your partner's deep personality, and any specific behaviors you want them to exhibit." rows={6} className="w-full text-sm bg-black/20 border rounded-lg p-2.5 resize-y focus:outline-none focus:ring-1 transition-colors border-rose-400/20 focus:ring-rose-400"/>
                    </div>
                    
                    {/* Style */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium text-rose-200/70 mb-1.5">Overall Tone</label>
                             <select name="tone" value={localSettings.tone} onChange={handleChange} className="w-full appearance-none bg-black/20 border border-rose-400/20 rounded-lg p-2.5 pr-8 focus:outline-none focus:ring-1 focus:ring-rose-400 transition-colors text-rose-100">
                                {EROTIC_TONES.map(opt => <option key={opt} value={opt} className="bg-slate-800">{opt}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-rose-200/70 mb-1.5">Vocal Style</label>
                             <input name="vocalStyle" value={localSettings.vocalStyle} onChange={handleChange} placeholder="e.g., breathy whispers, dominant tone" className="w-full text-sm bg-black/20 border rounded-lg p-2.5 focus:outline-none focus:ring-1 transition-colors border-rose-400/20 focus:ring-rose-400"/>
                        </div>
                    </div>

                    {/* Boundaries */}
                    <TagInput
                        label="Kinks to Include (Optional)"
                        tags={localSettings.kinks}
                        onTagsChange={(tags) => setLocalSettings(p => ({...p, kinks: tags}))}
                        placeholder="Type a kink and press Enter..."
                    />
                    <div>
                        <label className="block text-sm font-medium text-rose-200/70 mb-1.5">Hard Limits (Optional)</label>
                        <textarea name="limits" value={localSettings.limits} onChange={handleChange} placeholder="List topics or actions to strictly avoid." rows={3} className="w-full text-sm bg-black/20 border rounded-lg p-2.5 resize-y focus:outline-none focus:ring-1 transition-colors border-rose-400/20 focus:ring-rose-400"/>
                    </div>

                </div>

                <div className="flex-shrink-0 pt-4 border-t border-rose-500/20 flex justify-end">
                    <button onClick={handleSave} className="px-6 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-500 transition-colors">Save Settings</button>
                </div>
            </div>
        </div>
    );
};

export default EighteenPlusSettingsModal;
