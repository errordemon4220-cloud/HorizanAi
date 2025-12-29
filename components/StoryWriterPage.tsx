
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StoryState, StorySetup, StoryTone, StoryPOV, StorySceneType, StoryCharacter, StoryMode, UserInterestProfile } from '../types';
import { BookOpenIcon, PlusIcon, SparklesIcon, TrashIcon, XIcon, UsersIcon, FileTextIcon, ChevronsRightIcon, FileCodeIcon } from './icons';
import { jsPDF } from 'jspdf';
import { isContentInappropriate } from '../services/moderationService';

const Typewriter: React.FC<{ text: string, isLongText: boolean }> = ({ text, isLongText }) => {
    const [displayedText, setDisplayedText] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isLongText) {
            setDisplayedText(text); // For long text, display immediately
            return;
        }

        setDisplayedText(''); // Reset on text change for typewriter
        let i = 0;
        const intervalId = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(prev => prev + text.charAt(i));
                i++;
                if (containerRef.current) {
                    containerRef.current.scrollTop = containerRef.current.scrollHeight;
                }
            } else {
                clearInterval(intervalId);
            }
        }, 15); // Faster speed for better feel

        return () => clearInterval(intervalId);
    }, [text, isLongText]);
    
    useEffect(() => {
        if(isLongText && containerRef.current) {
             containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    },[displayedText, isLongText]);

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto pr-2 text-horizon-text-primary custom-scrollbar">
            <p className="whitespace-pre-wrap leading-relaxed">{displayedText}</p>
        </div>
    )
};

const FormSelect: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
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

const CharacterManager: React.FC<{
  characters: StoryCharacter[];
  setCharacters: (updater: (prev: StoryCharacter[]) => StoryCharacter[]) => void;
  errors: Record<string, { name: boolean; description: boolean }>;
}> = ({ characters, setCharacters, errors }) => {

  const addCharacter = () => {
    if (characters.length >= 5) return;
    setCharacters(prev => [...prev, { id: `char-${Date.now()}`, name: '', description: '' }]);
  };

  const updateCharacter = (id: string, field: 'name' | 'description', value: string) => {
    setCharacters(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  
  const removeCharacter = (id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-horizon-text-secondary">Characters ({characters.length}/5)</h3>
        <button
          onClick={addCharacter}
          disabled={characters.length >= 5}
          className="flex items-center gap-1.5 text-xs font-semibold text-horizon-accent hover:brightness-125 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <PlusIcon className="w-4 h-4"/> Add
        </button>
      </div>
      <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
        {characters.map(char => (
          <div key={char.id} className="bg-black/20 p-3 rounded-lg space-y-2 relative group">
            <input 
              type="text"
              value={char.name}
              onChange={e => updateCharacter(char.id, 'name', e.target.value)}
              placeholder="Character Name"
              className={`w-full text-sm font-semibold bg-transparent focus:outline-none p-1 rounded-sm transition-all ${errors[char.id]?.name ? 'ring-1 ring-red-500/60' : ''}`}
            />
            <textarea
              value={char.description}
              onChange={e => updateCharacter(char.id, 'description', e.target.value)}
              placeholder="Brief description..."
              rows={2}
              className={`w-full text-xs bg-transparent resize-none focus:outline-none text-horizon-text-tertiary p-1 rounded-sm transition-all ${errors[char.id]?.description ? 'ring-1 ring-red-500/60' : ''}`}
            />
             <button onClick={() => removeCharacter(char.id)} className="absolute top-1 right-1 p-1 bg-white/10 rounded-full text-horizon-text-tertiary hover:bg-red-500/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <XIcon className="w-3 h-3"/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SegmentedControl: React.FC<{ options: {value: string, label: string, icon?: React.ReactNode}[], selectedValue: string, onChange: (value: any) => void }> = ({ options, selectedValue, onChange }) => (
    <div className="flex w-full bg-black/30 rounded-lg p-1">
        {options.map(opt => (
            <button key={opt.value} onClick={() => onChange(opt.value)} className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-300 ${selectedValue === opt.value ? 'bg-horizon-accent text-white shadow-md' : 'text-horizon-text-secondary hover:text-white'}`}>
                {opt.icon}<span>{opt.label}</span>
            </button>
        ))}
    </div>
);


interface StoryWriterPageProps {
  storyState: StoryState;
  onSetupUpdate: (update: Partial<StorySetup>) => void;
  onGeneratePage: (playerChoice: string) => void;
  isLoading: boolean;
  isNsfwModeEnabled: boolean;
  onUpdateInterest: (interest: keyof UserInterestProfile, amount: number) => void;
}

const StoryWriterPage: React.FC<StoryWriterPageProps> = ({ storyState, onSetupUpdate, onGeneratePage, isLoading, isNsfwModeEnabled, onUpdateInterest }) => {
    const { setup, pages, choices, currentPageIndex } = storyState;
    const [selectedChoice, setSelectedChoice] = useState('');
    const [customChoice, setCustomChoice] = useState('');
    
    const [errors, setErrors] = useState({
        mainPrompt: false,
        setting: false,
        plotInjection: false,
        characters: {} as Record<string, { name: boolean; description: boolean }>,
    });
    const [isCustomChoiceInvalid, setIsCustomChoiceInvalid] = useState(false);

    useEffect(() => {
        const newErrors = {
            mainPrompt: isContentInappropriate(setup.mainPrompt, isNsfwModeEnabled),
            setting: isContentInappropriate(setup.setting, isNsfwModeEnabled),
            plotInjection: isContentInappropriate(setup.plotInjection, isNsfwModeEnabled),
            characters: setup.characters.reduce((acc, char) => {
                acc[char.id] = {
                    name: isContentInappropriate(char.name, isNsfwModeEnabled),
                    description: isContentInappropriate(char.description, isNsfwModeEnabled),
                };
                return acc;
            }, {} as Record<string, { name: boolean; description: boolean }>),
        };
        setErrors(newErrors);
    }, [setup, isNsfwModeEnabled]);
    
    useEffect(() => {
        setIsCustomChoiceInvalid(isContentInappropriate(customChoice, isNsfwModeEnabled));
    }, [customChoice, isNsfwModeEnabled]);

    useEffect(() => {
        if(choices.length > 0) setSelectedChoice(choices[0]);
    }, [choices]);

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        onSetupUpdate({ [e.target.name]: e.target.value });
    };

    const handleCharacterChange = (updater: (prev: StoryCharacter[]) => StoryCharacter[]) => {
        onSetupUpdate({ characters: updater(setup.characters) });
    }
    
    const handleModeChange = (mode: StoryMode) => {
        onSetupUpdate({ mode });
    }

    const handleContinue = () => {
        const choice = customChoice.trim() || selectedChoice;
        if (choice) onGeneratePage(choice);
        setCustomChoice('');
    };

    const handleDownloadTXT = () => {
        if (pages.length === 0) return;
        onUpdateInterest('writer', 3);
        const filename = (setup.mainPrompt.substring(0, 30) || 'story').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.txt';
        const content = pages.map((page, index) =>
            pages.length > 1 ? `--- Page ${index + 1} ---\n\n${page}` : page
        ).join('\n\n\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadPDF = () => {
        if (pages.length === 0) return;
        onUpdateInterest('writer', 3);
        const filename = (setup.mainPrompt.substring(0, 30) || 'story').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf';

        const doc = new jsPDF();
        const margin = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const usableWidth = pageWidth - margin * 2;
        let y = margin;
        
        const checkAndAddPage = (requiredHeight: number) => {
            if (y + requiredHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        };

        doc.setFontSize(18);
        doc.text(setup.mainPrompt, pageWidth / 2, y, { align: 'center', maxWidth: usableWidth });
        y += 20;

        doc.setFontSize(11);
        doc.setTextColor(0);

        pages.forEach((page, index) => {
            if (index > 0) {
                doc.addPage();
                y = margin;
            }

            if (pages.length > 1) {
                doc.setFontSize(10);
                doc.setTextColor(150);
                checkAndAddPage(10);
                doc.text(`--- Page ${index + 1} ---`, pageWidth / 2, y, { align: 'center' });
                y += 10;
                doc.setTextColor(0);
                doc.setFontSize(11);
            }
            
            const lines = doc.splitTextToSize(page, usableWidth);
            lines.forEach((line: string) => {
                checkAndAddPage(7); // Check height for one line
                doc.text(line, margin, y);
                y += 7; // Line height
            });
             y += 7; // Extra space between pages in the PDF
        });

        doc.save(filename);
    };
    
    const hasCharacterContentErrors = Object.values(errors.characters).some(
        (charErrors: { name: boolean; description: boolean }) => charErrors.name || charErrors.description
    );

    const hasContentErrors =
        errors.mainPrompt ||
        errors.setting ||
        errors.plotInjection ||
        hasCharacterContentErrors;
    
    const isSetupValid = setup.mainPrompt.trim() !== '' && setup.setting.trim() !== '' && !hasContentErrors;

    const startButtonText = () => {
        if (pages.length > 0 && setup.mode === 'interactive') return 'Restart Story';
        switch (setup.mode) {
            case 'one-page': return 'Generate One-Page Story';
            case 'linear': return `Start Linear Story (${isLoading ? `Page ${currentPageIndex + 1}/20` : '20 Pages'})`;
            case 'interactive': default: return 'Start Interactive Story';
        }
    }

    const storyModes = [
        { value: 'interactive', label: 'Interactive', icon: <UsersIcon className="w-4 h-4" /> },
        { value: 'one-page', label: 'One-Page', icon: <FileTextIcon className="w-4 h-4" /> },
        { value: 'linear', label: 'Linear', icon: <ChevronsRightIcon className="w-4 h-4" /> },
    ];

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 relative overflow-y-auto custom-scrollbar">
            {/* Animated background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-amber-500/10 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-rose-500/10 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <header className="text-center mb-8 animate-fade-in-up relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400" style={{ textShadow: '0 2px 10px rgba(255, 255, 255, 0.1)' }}>
                    Story Writer
                </h1>
                <p className="mt-3 text-lg text-horizon-text-secondary">Your collaborative storytelling canvas.</p>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0 relative z-10">
                {/* Left Panel: Setup */}
                <div className="flex flex-col space-y-4 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-y-auto shadow-2xl animate-fade-in-up custom-scrollbar">
                    <h2 className="text-lg font-bold flex items-center gap-2"><BookOpenIcon/>Story Setup</h2>
                    <SegmentedControl options={storyModes} selectedValue={setup.mode} onChange={handleModeChange} />
                    <div>
                        <textarea name="mainPrompt" value={setup.mainPrompt} onChange={handleFieldChange} placeholder="Main Story Idea/Prompt *" rows={3} className={`w-full text-sm bg-black/20 border rounded-lg p-2.5 resize-y focus:outline-none focus:ring-1 transition-colors ${errors.mainPrompt ? 'border-red-500/60 focus:ring-red-500/60' : 'border-white/10 focus:ring-horizon-accent'}`}/>
                        {errors.mainPrompt && <p className="text-xs text-red-400 mt-1">Inappropriate content detected.</p>}
                    </div>
                    <div>
                        <textarea name="setting" value={setup.setting} onChange={handleFieldChange} placeholder="Setting Description *" rows={2} className={`w-full text-sm bg-black/20 border rounded-lg p-2.5 resize-y focus:outline-none focus:ring-1 transition-colors ${errors.setting ? 'border-red-500/60 focus:ring-red-500/60' : 'border-white/10 focus:ring-horizon-accent'}`}/>
                        {errors.setting && <p className="text-xs text-red-400 mt-1">Inappropriate content detected.</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect label="Story Tone" name="tone" value={setup.tone} onChange={handleFieldChange} options={['General/Neutral', 'Dark & Gritty', 'Humorous & Lighthearted', 'Epic & Grandiose', 'Mysterious & Suspenseful', 'Romantic & Emotional']} />
                        <FormSelect label="Point of View (POV)" name="pov" value={setup.pov} onChange={handleFieldChange} options={['First Person', 'Third Person Limited', 'Third Person Omniscient']} />
                    </div>
                    <div>
                        <textarea name="plotInjection" value={setup.plotInjection} onChange={handleFieldChange} placeholder="Plot Point Injection (Optional)" rows={2} className={`w-full text-sm bg-black/20 border rounded-lg p-2.5 resize-y focus:outline-none focus:ring-1 transition-colors ${errors.plotInjection ? 'border-red-500/60 focus:ring-red-500/60' : 'border-white/10 focus:ring-horizon-accent'}`}/>
                        {errors.plotInjection && <p className="text-xs text-red-400 mt-1">Inappropriate content detected.</p>}
                    </div>
                    <FormSelect label="Specific Scene Type" name="sceneType" value={setup.sceneType} onChange={handleFieldChange} options={['General Narrative', 'Action Scene', 'Dialogue-Heavy Scene', 'Introspective Scene', 'World-Building Exposition']} />
                    <CharacterManager characters={setup.characters} setCharacters={handleCharacterChange} errors={errors.characters} />
                    <button 
                        onClick={() => onGeneratePage("Start the story.")}
                        disabled={!isSetupValid || isLoading}
                        title={!isSetupValid ? 'Please fill in required fields and remove any inappropriate content.' : ''}
                        className="w-full flex items-center justify-center gap-3 py-3 mt-auto bg-horizon-accent text-white rounded-lg font-semibold hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5"/>}
                        {startButtonText()}
                    </button>
                </div>

                {/* Right Panel: Story */}
                <div className="flex flex-col bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up" style={{animationDelay: '150ms'}}>
                    {pages.length === 0 ? (
                         <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-horizon-text-tertiary">
                            <BookOpenIcon className="w-16 h-16 opacity-30"/>
                            <h3 className="mt-4 text-xl font-semibold text-horizon-text-secondary">Your story will appear here.</h3>
                            <p className="mt-1">Fill out the setup on the left and click "Start" to begin.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-white/10">
                                <h3 className="text-sm font-semibold text-horizon-text-tertiary">
                                    {setup.mode === 'one-page' ? 'Full Story' : `Page ${currentPageIndex + 1} / ${pages.length}`}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={handleDownloadTXT} title="Download as .txt" className="p-1.5 text-horizon-text-tertiary hover:text-white hover:bg-white/10 rounded-md transition-colors">
                                        <FileTextIcon className="w-5 h-5"/>
                                    </button>
                                    <button onClick={handleDownloadPDF} title="Download as .pdf" className="p-1.5 text-horizon-text-tertiary hover:text-white hover:bg-white/10 rounded-md transition-colors">
                                        <FileCodeIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col p-6 min-h-0">
                                <Typewriter text={pages[currentPageIndex]} isLongText={setup.mode === 'one-page'} />
                                {setup.mode === 'interactive' && pages.length > 0 && !isLoading && (
                                    <div className="mt-6 pt-6 border-t border-white/10">
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-semibold text-horizon-text-secondary">What do you do next?</h4>
                                            <div className="space-y-2">
                                                {choices.map((choice, i) => (
                                                    <button key={i} onClick={() => { setSelectedChoice(choice); setCustomChoice(''); }}
                                                        className={`w-full text-left p-2 rounded-md text-sm transition ${selectedChoice === choice && !customChoice ? 'bg-horizon-accent/20 text-horizon-accent' : 'hover:bg-white/10'}`}>
                                                            {choice}
                                                    </button>
                                                ))}
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={customChoice}
                                                    onChange={e => { setCustomChoice(e.target.value); setSelectedChoice(''); }}
                                                    placeholder="Or type your own action..."
                                                    className={`w-full text-sm bg-black/20 border rounded-lg p-2.5 focus:outline-none focus:ring-1 transition-colors ${isCustomChoiceInvalid ? 'border-red-500/60 focus:ring-red-500/60' : 'border-white/10 focus:ring-horizon-accent'}`}
                                                />
                                                {isCustomChoiceInvalid && <p className="text-xs text-red-400 mt-1">Inappropriate content detected.</p>}
                                            </div>
                                            <button 
                                                onClick={handleContinue}
                                                disabled={isLoading || (!selectedChoice && !customChoice.trim()) || isCustomChoiceInvalid}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-horizon-accent text-white rounded-lg font-semibold hover:brightness-110 transition-all active:scale-95 disabled:opacity-50">
                                                    Continue Story
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {isLoading && (
                                    <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-2 text-horizon-accent">
                                        <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                                        <span>The storyteller is thinking...</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoryWriterPage;
