import React from 'react';
import { SexualProfileSetup, SexualProfileAnalysis, SexualProfileGender, BODY_TYPES, SKIN_COLORS, PENIS_TYPES, PENIS_SHAPES, PUSSY_TYPES, PUSSY_SHAPES, LABIA_SIZES, CLITORIS_SIZES, ASS_TYPES, BOOBS_SHAPES } from '../types';
import { SparklesIcon, LoaderIcon, HeartIcon, BarChart2Icon, DownloadIcon } from './icons';

interface SexualProfilePageProps {
    setup: SexualProfileSetup;
    onSetupChange: React.Dispatch<React.SetStateAction<SexualProfileSetup>>;
    analysis: SexualProfileAnalysis | null;
    onGenerate: (setup: SexualProfileSetup) => void;
    isLoading: boolean;
}

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-black/20 ui-blur-effect border border-rose-400/10 rounded-xl p-4 space-y-4">
        <h3 className="font-semibold text-lg text-rose-200">{title}</h3>
        {children}
    </div>
);

const FormField: React.FC<{ label: string, name: keyof SexualProfileSetup, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string, unit?: string, helpText?: string, min?: number, max?: number, step?: number }> = ({ label, name, value, onChange, type = "number", placeholder, unit, helpText, min, max, step }) => (
    <div>
        <label className="block text-sm font-medium text-rose-200/70 mb-1.5">{label}</label>
        <div className="relative">
            <input name={name} value={String(value)} onChange={onChange} placeholder={placeholder} type={type} min={min} max={max} step={step} className="w-full text-sm bg-black/20 border rounded-lg p-2.5 focus:outline-none focus:ring-1 transition-colors border-rose-400/20 focus:ring-rose-400 pr-10" />
            {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-rose-200/50">{unit}</span>}
        </div>
        {helpText && <p className="text-xs text-rose-200/50 mt-1">{helpText}</p>}
    </div>
);


const FormSelect: React.FC<{
  label: string;
  name: keyof SexualProfileSetup;
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

const AnalysisDisplay: React.FC<{ analysis: SexualProfileAnalysis, onDownload: (format: 'txt' | 'html') => void }> = ({ analysis, onDownload }) => (
    <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-black/30 rounded-lg text-center">
                <p className="text-sm text-rose-200/70">Performance Score</p>
                <p className="text-5xl font-bold text-rose-300">{analysis.performanceScore}<span className="text-2xl">%</span></p>
            </div>
            <div className="p-4 bg-black/30 rounded-lg text-center">
                <p className="text-sm text-rose-200/70">Sexy Level</p>
                <p className="text-5xl font-bold text-rose-300">{analysis.sexyLevel}<span className="text-2xl">%</span></p>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
             <div className="p-3 bg-black/30 rounded-lg text-center">
                <p className="text-xs text-rose-200/70">Est. Duration</p>
                <p className="font-semibold text-white">{analysis.estimatedDuration}</p>
            </div>
            <div className="p-3 bg-black/30 rounded-lg text-center">
                <p className="text-xs text-rose-200/70">Possible Positions</p>
                <p className="font-semibold text-white">{analysis.possiblePositions}+</p>
            </div>
        </div>
        {analysis.partnerEnjoyment && (
            <div>
                <h4 className="font-semibold text-rose-200 mb-1">Partner Enjoyment Analysis</h4>
                <p className="text-sm text-rose-200/90 bg-black/20 p-3 rounded-md">{analysis.partnerEnjoyment}</p>
            </div>
        )}
        <div>
            <h4 className="font-semibold text-rose-200 mb-2">Enhancement & Improvement Tips</h4>
            <div className="space-y-2">
                {analysis.enhancementTips.map(tip => (
                    <div key={tip.part} className="p-3 bg-black/20 rounded-md">
                        <p className="font-bold text-white">{tip.part}</p>
                        <p className="text-xs text-rose-200/80 mt-1">{tip.suggestion}</p>
                    </div>
                ))}
            </div>
        </div>
        <div>
            <h4 className="font-semibold text-rose-200 mb-2">Recommended Positions</h4>
            <div className="space-y-2">
                {analysis.recommendedPositions.map(item => (
                    <div key={item.name} className="p-3 bg-black/20 rounded-md">
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-xs text-rose-200/80 mt-1">{item.description}</p>
                        <p className="text-xs text-amber-300/70 mt-2 border-t border-white/10 pt-2"><strong>Why it's suitable:</strong> {item.suitability}</p>
                    </div>
                ))}
            </div>
        </div>
        <div>
            <h4 className="font-semibold text-rose-200 mb-2">Recommended Techniques</h4>
            <div className="space-y-2">
                 {analysis.recommendedTechniques.map(item => (
                    <div key={item.name} className="p-3 bg-black/20 rounded-md">
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-xs text-rose-200/80 mt-1">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
         <div>
            <h4 className="font-semibold text-rose-200 mb-1">Overall Summary</h4>
            <p className="text-sm text-rose-200/90 bg-black/20 p-3 rounded-md">{analysis.overallSummary}</p>
        </div>
        <div className="pt-4 mt-4 border-t border-rose-400/20 flex gap-4">
            <button onClick={() => onDownload('html')} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors">
                <DownloadIcon className="w-4 h-4" /> Download HTML
            </button>
            <button onClick={() => onDownload('txt')} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors">
                <DownloadIcon className="w-4 h-4" /> Download TXT
            </button>
        </div>
    </div>
);


const SexualProfilePage: React.FC<SexualProfilePageProps> = ({ setup, onSetupChange, analysis, onGenerate, isLoading }) => {

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let parsedValue: string | number | boolean = value;
        if (type === 'number') {
            parsedValue = parseFloat(value) || 0;
        } else if ((e.target as HTMLInputElement).type === 'checkbox') {
            parsedValue = (e.target as HTMLInputElement).checked;
        }

        onSetupChange(prev => ({ ...prev, [name]: parsedValue }));
    };
    
    const handleDownload = (format: 'txt' | 'html') => {
        if (!analysis) return;

        const title = `Sexual Profile Analysis for a ${setup.age}-year-old ${setup.gender}`;
        let content = '';

        const txtContent = `
${title}
=======================================

OVERALL SCORES
- Performance Score: ${analysis.performanceScore}/100
- Sexy Level: ${analysis.sexyLevel}/100
- Estimated Duration: ${analysis.estimatedDuration}
- Possible Positions: ${analysis.possiblePositions}+

${analysis.partnerEnjoyment ? `PARTNER ENJOYMENT ANALYSIS\n${analysis.partnerEnjoyment}\n\n` : ''}
ENHANCEMENT & IMPROVEMENT TIPS
${analysis.enhancementTips.map(tip => `- ${tip.part}:\n  ${tip.suggestion}`).join('\n\n')}

RECOMMENDED POSITIONS
${analysis.recommendedPositions.map(p => `- ${p.name}:\n  ${p.description}\n  Why it's suitable: ${p.suitability}`).join('\n\n')}

RECOMMENDED TECHNIQUES
${analysis.recommendedTechniques.map(t => `- ${t.name}:\n  ${t.description}`).join('\n\n')}

OVERALL SUMMARY
${analysis.overallSummary}
        `;

        const htmlContent = `
            <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${title}</title><style>
            body { font-family: sans-serif; background-color: #12080E; color: #FCE7F3; line-height: 1.6; padding: 2rem; }
            .container { max-width: 800px; margin: auto; background-color: #1A0B12; border: 1px solid #831843; border-radius: 12px; padding: 2rem; box-shadow: 0 0 30px rgba(219, 39, 119, 0.2); }
            h1 { color: #F9A8D4; text-align: center; } h2 { color: #F472B6; border-bottom: 2px solid #831843; padding-bottom: 0.5rem; margin-top: 2rem; }
            h3 { color: #FCE7F3; margin-top: 1.5rem; } p, li { color: #FBCFE8; } .tip { background-color: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 3px solid #F472B6; }
            .scores { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; text-align: center; }
            .score-card { background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; } .score-card p { margin: 0; } .score-card .label { font-size: 0.9rem; color: #F9A8D4; } .score-card .value { font-size: 2.5rem; font-weight: bold; }
            </style></head><body><div class="container"><h1>${title}</h1>
            <h2>Overall Scores</h2><div class="scores">
              <div class="score-card"><p class="label">Performance Score</p><p class="value">${analysis.performanceScore}%</p></div>
              <div class="score-card"><p class="label">Sexy Level</p><p class="value">${analysis.sexyLevel}%</p></div>
            </div>
            ${analysis.partnerEnjoyment ? `<h2>Partner Enjoyment Analysis</h2><p>${analysis.partnerEnjoyment}</p>` : ''}
            <h2>Enhancement & Improvement Tips</h2>${analysis.enhancementTips.map(tip => `<div class="tip"><h3>${tip.part}</h3><p>${tip.suggestion}</p></div>`).join('')}
            <h2>Recommended Positions</h2>${analysis.recommendedPositions.map(p => `<div class="tip"><h3>${p.name}</h3><p>${p.description}</p><p><strong>Suitability:</strong> ${p.suitability}</p></div>`).join('')}
            <h2>Overall Summary</h2><p>${analysis.overallSummary}</p>
            </div></body></html>
        `;

        const blob = new Blob([format === 'txt' ? txtContent : htmlContent], { type: format === 'txt' ? 'text/plain' : 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sexual_profile_analysis.${format}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 relative overflow-y-auto custom-scrollbar bg-[var(--gf-bg)] text-white">
             <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-rose-900/50 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-purple-900/40 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <header className="text-center mb-8 animate-fade-in-up relative z-10">
                 <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-400">
                    Sexual Profile Analysis
                </h1>
                <p className="mt-3 text-lg text-rose-200/80">Get a detailed, uncensored analysis of your sexual performance based on your physical traits.</p>
            </header>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                {/* Left Panel: Setup */}
                <div className="flex flex-col space-y-4 bg-black/20 ui-blur-effect border border-rose-400/10 rounded-2xl p-6 overflow-y-auto shadow-2xl animate-fade-in-up custom-scrollbar">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-rose-200">Your Profile</h2>
                    
                    <Section title="General">
                        <div className="grid grid-cols-2 gap-4">
                           <FormSelect label="Gender" name="gender" value={setup.gender} onChange={handleFieldChange} options={['Male', 'Female']} />
                           <FormField label="Age" name="age" type="number" value={setup.age} onChange={handleFieldChange} unit="yrs"/>
                           <FormField label="Height" name="height" type="number" value={setup.height} onChange={handleFieldChange} unit="cm"/>
                           <FormField label="Weight" name="weight" type="number" value={setup.weight} onChange={handleFieldChange} unit="kg"/>
                           <FormSelect label="Body Type" name="bodyType" value={setup.bodyType} onChange={handleFieldChange} options={BODY_TYPES} />
                           <FormSelect label="Skin Color" name="skinColor" value={setup.skinColor} onChange={handleFieldChange} options={SKIN_COLORS} />
                        </div>
                    </Section>
                    
                    {setup.gender === 'Male' && (
                        <Section title="Male Attributes">
                             <div className="grid grid-cols-2 gap-4">
                                <FormSelect label="Penis Type" name="penisType" value={setup.penisType || ''} onChange={handleFieldChange} options={PENIS_TYPES} />
                                <FormSelect label="Penis Shape" name="penisShape" value={setup.penisShape || ''} onChange={handleFieldChange} options={PENIS_SHAPES} />
                                <FormField label="Penis Size (Length)" name="penisSize" value={setup.penisSize || 0} onChange={handleFieldChange} unit="cm" />
                                <FormField label="Penis Girth (Circumference)" name="penisGirth" value={setup.penisGirth || 0} onChange={handleFieldChange} unit="cm" />
                                <FormField label="Veininess" name="veininess" value={setup.veininess || 0} onChange={handleFieldChange} unit="/10" min={0} max={10} />
                                {setup.penisType === 'Uncircumcised' && <FormField label="Foreskin Coverage" name="foreskinCoverage" value={setup.foreskinCoverage || 0} onChange={handleFieldChange} unit="/10" helpText="10 = full coverage" min={0} max={10}/>}
                                <FormField label="Erection Time" name="erectionTime" value={setup.erectionTime || 0} onChange={handleFieldChange} unit="sec" helpText="Time to full erection" />
                            </div>
                        </Section>
                    )}

                    {setup.gender === 'Female' && (
                        <Section title="Female Attributes">
                             <div className="grid grid-cols-2 gap-4">
                                <FormSelect label="Pussy Type" name="pussyType" value={setup.pussyType || ''} onChange={handleFieldChange} options={PUSSY_TYPES} />
                                <FormSelect label="Pussy Shape" name="pussyShape" value={setup.pussyShape || ''} onChange={handleFieldChange} options={PUSSY_SHAPES} />
                                <FormSelect label="Labia Size" name="labiaSize" value={setup.labiaSize || ''} onChange={handleFieldChange} options={LABIA_SIZES} />
                                <FormSelect label="Clitoris Size" name="clitorisSize" value={setup.clitorisSize || ''} onChange={handleFieldChange} options={CLITORIS_SIZES} />
                                <FormField label="Pussy Tightness" name="pussyTightness" value={setup.pussyTightness || 0} onChange={handleFieldChange} unit="/10" min={0} max={10}/>
                                <FormField label="Wetness Speed" name="wetnessSpeed" value={setup.wetnessSpeed || 0} onChange={handleFieldChange} unit="/10" min={0} max={10}/>
                                <FormField label="Sensitivity" name="sensitivity" value={setup.sensitivity || 0} onChange={handleFieldChange} unit="/10" min={0} max={10}/>
                                <FormField label="G-Spot Sensitivity" name="gSpotSensitivity" value={setup.gSpotSensitivity || 0} onChange={handleFieldChange} unit="/10" min={0} max={10}/>
                                <FormSelect label="Ass Type" name="assType" value={setup.assType || ''} onChange={handleFieldChange} options={ASS_TYPES} />
                                <FormField label="Ass Size" name="assSize" type="number" value={setup.assSize || 0} onChange={handleFieldChange} unit="/10" min={0} max={10}/>
                                <FormSelect label="Boobs Shape" name="boobsShape" value={setup.boobsShape || ''} onChange={handleFieldChange} options={BOOBS_SHAPES} />
                                <FormField label="Boobs Size" name="boobsSize" type="text" value={setup.boobsSize || ''} onChange={handleFieldChange} placeholder="e.g., C-Cup, 34D..." />
                                <FormField label="Nipple Shape" name="nippleShape" type="text" value={setup.nippleShape || ''} onChange={handleFieldChange} placeholder="Pointy, Puffy..." />
                                <FormField label="Nipple Size" name="nippleSize" type="number" value={setup.nippleSize || 0} onChange={handleFieldChange} unit="/10" min={0} max={10}/>
                                <div>
                                    <label className="block text-sm font-medium text-rose-200/70 mb-1.5">Nipples Harden Easily</label>
                                    <input type="checkbox" name="nippleHardness" checked={!!setup.nippleHardness} onChange={handleFieldChange} className="accent-rose-500" />
                                </div>
                            </div>
                        </Section>
                    )}
                    
                    <Section title="Fitness">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Max Lift Weight" name="liftWeight" type="number" value={setup.liftWeight || 0} onChange={handleFieldChange} unit="kg" helpText="e.g., bench press" />
                            <FormField label="Breath Hold Time" name="breathHoldTime" type="number" value={setup.breathHoldTime || 0} onChange={handleFieldChange} unit="sec" />
                        </div>
                    </Section>
                    
                    <button onClick={() => onGenerate(setup)} disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-3 mt-auto bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                        Generate My Analysis
                    </button>
                </div>

                 {/* Right Panel: Analysis */}
                <div className="flex flex-col bg-black/20 ui-blur-effect border border-rose-400/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                     {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-rose-200/60">
                           <LoaderIcon className="w-16 h-16 animate-spin text-rose-400" />
                           <h3 className="mt-4 text-xl font-semibold text-rose-200/80">Analyzing Profile...</h3>
                           <p className="mt-1">Dr. Reed is preparing your uncensored report.</p>
                        </div>
                    ) : analysis ? (
                         <div className="flex-1 p-6 overflow-y-auto custom-scrollbar analysis-scrollbar">
                            <h2 className="text-2xl font-bold text-rose-200 mb-4">Your Uncensored Analysis</h2>
                            <AnalysisDisplay analysis={analysis} onDownload={handleDownload}/>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-rose-200/60">
                            <BarChart2Icon className="w-20 h-20 opacity-10" />
                            <h3 className="mt-4 text-xl font-semibold text-rose-200/80">Analysis Report</h3>
                            <p className="mt-1">Fill out your profile to get a detailed sexual performance analysis.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default SexualProfilePage;
