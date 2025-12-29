import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { DeadOrAliveSubject, DOA_GENDERS, DOA_RACES, DOA_RELATIONSHIPS, GeneratedImage, ImageFile } from '../types';
import { PlusIcon, SparklesIcon, LoaderIcon, XIcon, UploadCloudIcon, LinkIcon, ImageIcon } from './icons';

const defaultSubject: Omit<DeadOrAliveSubject, 'id' | 'createdAt'> = {
    name: '',
    age: 18,
    gender: 'Female',
    race: 'Human',
    relationship: 'Captor / Captive',
    persona: '',
    scenario: '',
    imageUrl: '',
};

const FormField: React.FC<{ label: string; name: string; value: string | number; onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; placeholder?: string; as?: 'input' | 'textarea'; type?: string; rows?: number; }> = ({ label, name, value, onChange, placeholder, as = 'input', type = 'text', rows = 3 }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-semibold text-rose-200/70 mb-1.5">{label}</label>
        {as === 'textarea' ? (
            <textarea name={name} id={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full text-sm bg-black/30 border rounded-lg p-2.5 resize-y focus:outline-none focus:ring-2 transition-all duration-300 border-rose-400/20 focus:ring-rose-400 focus:border-rose-400 focus:shadow-[0_0_15px_rgba(244,114,182,0.3)]" />
        ) : (
            <input name={name} id={name} type={type} value={String(value)} onChange={onChange} placeholder={placeholder} className="w-full text-sm bg-black/30 border rounded-lg p-2.5 focus:outline-none focus:ring-2 transition-all duration-300 border-rose-400/20 focus:ring-rose-400 focus:border-rose-400 focus:shadow-[0_0_15px_rgba(244,114,182,0.3)]" />
        )}
    </div>
);

const FormSelect: React.FC<{ label: string; name: string; value: string; onChange: (e: ChangeEvent<HTMLSelectElement>) => void; options: readonly string[]; }> = ({ label, name, value, onChange, options }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-semibold text-rose-200/70 mb-1.5">{label}</label>
        <select name={name} id={name} value={value} onChange={onChange} className="w-full appearance-none text-sm bg-black/30 border rounded-lg p-2.5 focus:outline-none focus:ring-2 transition-all duration-300 border-rose-400/20 focus:ring-rose-400 focus:border-rose-400 focus:shadow-[0_0_15px_rgba(244,114,182,0.3)]">
            {options.map(opt => <option key={opt} value={opt} className="bg-slate-800">{opt}</option>)}
        </select>
    </div>
);

interface ImageModalProps {
    onClose: () => void; onSave: (url: string) => void; onGenerate: (prompt: string) => void; isGenerating: boolean;
}

const ImageModal: React.FC<ImageModalProps> = ({ onClose, onSave, onGenerate, isGenerating }) => {
    const [tab, setTab] = useState<'generate' | 'url' | 'upload'>('generate');
    const [prompt, setPrompt] = useState('');
    const [url, setUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (file: File | null) => {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onloadend = () => { onSave(reader.result as string); };
        reader.readAsDataURL(file);
    };

    return (
        <div className="fixed inset-0 bg-black/70 ui-blur-effect z-50 flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-rose-300">Set Subject Image</h2><button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-white/10"><XIcon className="w-5 h-5"/></button></div>
                <div className="flex p-1 bg-black/30 rounded-lg">
                    {([['generate', 'AI Generate'], ['url', 'From URL'], ['upload', 'Upload']] as const).map(([id, label]) => (
                        <button key={id} onClick={() => setTab(id)} className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${tab === id ? 'bg-rose-600 text-white' : 'text-rose-200/70 hover:bg-white/5'}`}>{label}</button>
                    ))}
                </div>
                <div className="pt-2">
                    {tab === 'generate' && (<div className="space-y-3"><textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe the subject's appearance..." rows={3} className="w-full text-sm bg-black/20 border rounded-lg p-2.5 resize-y focus:outline-none focus:ring-1 transition-colors border-rose-400/20 focus:ring-rose-400" /><button onClick={() => onGenerate(prompt)} disabled={isGenerating || !prompt} className="w-full flex items-center justify-center gap-2 py-2 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-500 disabled:opacity-50">{isGenerating ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}Generate</button></div>)}
                    {tab === 'url' && (<div className="space-y-3"><input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="w-full text-sm bg-black/20 border rounded-lg p-2.5 focus:outline-none focus:ring-1 transition-colors border-rose-400/20 focus:ring-rose-400" /><button onClick={() => onSave(url)} disabled={!url} className="w-full py-2 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-500 disabled:opacity-50">Load from URL</button></div>)}
                    {tab === 'upload' && (<div><input type="file" ref={fileInputRef} onChange={e => handleFileUpload(e.target.files?.[0] || null)} className="hidden" accept="image/*" /><button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-rose-400/30 text-rose-300 rounded-lg hover:bg-rose-500/10 hover:border-rose-400/50"><UploadCloudIcon className="w-6 h-6" />Click to Upload Image</button></div>)}
                </div>
            </div>
        </div>
    );
};

interface DeadOrAliveEditorPageProps {
    subject: DeadOrAliveSubject | null;
    onSave: (subject: Omit<DeadOrAliveSubject, 'id' | 'createdAt'> & { id?: string }) => void;
    onCancel: () => void;
    onGenerateImage: (prompt: string, negativePrompt: string, numImages: number) => Promise<GeneratedImage[]>;
}

const DeadOrAliveEditorPage: React.FC<DeadOrAliveEditorPageProps> = ({ subject, onSave, onCancel, onGenerateImage }) => {
    const [formData, setFormData] = useState(subject || defaultSubject);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    useEffect(() => {
        setFormData(subject || defaultSubject);
    }, [subject]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'age' ? parseInt(value) || 0 : value }));
    };

    const handleSave = () => {
        if (!formData.name.trim() || !formData.imageUrl) {
            alert("Subject Name and Image are required.");
            return;
        }

        if (subject) { // Editing
            const { createdAt, ...dataToSave } = formData as DeadOrAliveSubject;
            onSave(dataToSave);
        } else { // Creating
            onSave(formData);
        }
    };

    const handleGenerate = async (prompt: string) => {
        setIsGeneratingImage(true);
        const fullPrompt = `${prompt}, portrait, detailed face, nsfw, realistic`;
        const negPrompt = "ugly, deformed, text, watermark, child, loli, shota, cub, blurry";
        try {
            const result = await onGenerateImage(fullPrompt, negPrompt, 1);
            if (result.length > 0) {
                setFormData(prev => ({ ...prev, imageUrl: result[0].url }));
                setIsImageModalOpen(false);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to generate image.");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto relative text-white">
            {isImageModalOpen && <ImageModal onClose={() => setIsImageModalOpen(false)} onSave={(url) => { setFormData(p => ({...p, imageUrl: url})); setIsImageModalOpen(false); }} onGenerate={handleGenerate} isGenerating={isGeneratingImage} />}
            <header className="flex items-center justify-between mb-8 flex-shrink-0 relative z-10 animate-fade-in-up">
                <h1 className="text-2xl md:text-3xl font-bold text-rose-300">{subject ? 'Edit Subject' : 'Create New Subject'}</h1>
                <div className="flex items-center space-x-4">
                    <button onClick={onCancel} className="px-4 py-2 font-semibold text-rose-200/80 hover:text-white transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-500">Save</button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto w-full space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms'}}>
                <div className="bg-black/20 ui-blur-effect border border-rose-400/10 rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button onClick={() => setIsImageModalOpen(true)} className="md:col-span-1 relative group aspect-video md:aspect-[4/5] w-full bg-black/30 rounded-lg border-2 border-dashed border-rose-500/30 flex flex-col items-center justify-center text-rose-300/70 hover:bg-rose-500/10 hover:border-rose-500/50 transition-colors overflow-hidden">
                            {formData.imageUrl ? <img src={formData.imageUrl} alt="Subject Preview" className="w-full h-full object-cover" /> : <><ImageIcon className="w-12 h-12 mb-2" /><p className="font-semibold">Set Image</p></>}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Click to Change</div>
                        </button>
                        <div className="md:col-span-2 space-y-4">
                            <FormField label="Subject Name *" name="name" value={formData.name} onChange={handleInputChange} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Age *" name="age" type="number" value={formData.age} onChange={handleInputChange}/>
                                <FormSelect label="Gender *" name="gender" value={formData.gender} onChange={handleInputChange} options={DOA_GENDERS}/>
                            </div>
                             <FormSelect label="Race/Breed" name="race" value={formData.race} onChange={handleInputChange} options={DOA_RACES}/>
                        </div>
                    </div>
                    <FormSelect label="Relationship" name="relationship" value={formData.relationship} onChange={handleInputChange} options={DOA_RELATIONSHIPS}/>
                    <FormField label="Persona & Backstory" as="textarea" name="persona" value={formData.persona} onChange={handleInputChange} placeholder="Personality, history, appearance..." rows={6} />
                    <FormField label="Initial Scenario" as="textarea" name="scenario" value={formData.scenario} onChange={handleInputChange} placeholder="The scene where you first meet..." rows={5} />
                </div>
            </main>
        </div>
    );
};

export default DeadOrAliveEditorPage;