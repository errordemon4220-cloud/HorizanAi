import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GeneratedImage, UserInterestProfile, ImageFile } from '../types';
import { ImageIcon, DownloadIcon, CopyIcon, SendIcon, ChevronDownIcon, XIcon, CheckIcon, TrashIcon, LinkIcon, UploadCloudIcon, LoaderIcon, PencilIcon } from './icons';

// --- Data for new features ---
const STYLES = [
    { name: 'None', keywords: '' }, { name: 'Cinematic', keywords: 'cinematic, movie still, film grain, dramatic lighting, 8k, masterpiece' },
    { name: 'Anime', keywords: 'anime style, vibrant colors, detailed, cel shading, studio ghibli inspired' }, { name: 'Photorealistic', keywords: 'photorealistic, hyperrealistic, sharp focus, detailed skin texture, 50mm lens' },
    { name: '3D Render', keywords: '3d render, blender render, octane render, high detail, smooth surfaces, unreal engine 5' }, { name: 'Watercolor', keywords: 'watercolor painting, soft wash, vibrant colors, paper texture' },
    { name: 'Steampunk', keywords: 'steampunk, gears, brass, Victorian era, intricate machinery, detailed' }, { name: 'Cyberpunk', keywords: 'cyberpunk, neon lights, dystopian city, futuristic, high-tech, glowing' },
    { name: 'Vaporwave', keywords: 'vaporwave aesthetic, pastel colors, retro-futurism, 1980s, glitch art' }, { name: 'Abstract', keywords: 'abstract art, non-representational, shapes, forms, colors, textures' },
    { name: 'Impressionism', keywords: 'impressionist painting, visible brush strokes, light and color, Monet style' }, { name: 'Pop Art', keywords: 'pop art, bold colors, Ben-Day dots, Andy Warhol style, comic book art' },
    { name: 'Minimalist', keywords: 'minimalist, clean lines, simple shapes, negative space, monochrome' }, { name: 'Gothic', keywords: 'gothic art, dark, moody, intricate details, medieval architecture, dramatic shadows' },
    { name: 'Fantasy', keywords: 'fantasy art, epic, magical, mythical creatures, enchanted forest, detailed' }, { name: 'Sci-Fi', keywords: 'science fiction art, futuristic technology, spaceships, aliens, detailed' },
    { name: 'Art Deco', keywords: 'art deco, geometric shapes, elegant, luxurious, 1920s style' }, { name: 'Art Nouveau', keywords: 'art nouveau, organic forms, flowing lines, decorative patterns' },
    { name: 'Surrealism', keywords: 'surrealist art, dreamlike, bizarre, unexpected juxtapositions, Salvador Dali style' }, { name: 'Sketch', keywords: 'pencil sketch, charcoal drawing, hand-drawn, hatching, cross-hatching' },
    { name: 'Comic Book', keywords: 'comic book style, bold outlines, vibrant colors, dynamic action poses' }, { name: 'Pixel Art', keywords: 'pixel art, 8-bit, 16-bit, retro gaming style, sprites' },
    { name: 'Low Poly', keywords: 'low poly, geometric, faceted surfaces, 3d aestehtic' }, { name: 'Graffiti', keywords: 'graffiti art, street art, spray paint, vibrant, urban' },
    { name: 'Vintage', keywords: 'vintage photograph, sepia tones, aged paper, 1950s style' }, { name: 'Line Art', keywords: 'line art, black and white, clean lines, minimalist' },
    { name: 'Ukiyo-e', keywords: 'ukiyo-e style, Japanese woodblock print, bold outlines, flat colors' }, { name: 'Isometric', keywords: 'isometric design, 3d view, clean, vector art' },
    { name: 'Cartoon', keywords: 'cartoon style, bright colors, bold outlines, playful' }, { name: 'Claymation', keywords: 'claymation, stop-motion, plasticine, textured, Aardman style' },
    { name: 'Collage', keywords: 'collage style, mixed media, paper cutouts, textured' }, { name: 'Doodle', keywords: 'doodle art, hand-drawn, playful, simple lines, scribbles' },
    { name: 'Expressionism', keywords: 'expressionist painting, emotional, distorted, bold colors, Edvard Munch style' }, { name: 'Cubism', keywords: 'cubist art, geometric shapes, fragmented, multiple viewpoints, Picasso style' },
    { name: 'Futurism', keywords: 'futurist art, speed, technology, dynamism, machines, Boccioni style' }, { name: 'Baroque', keywords: 'baroque painting, dramatic, rich colors, deep shadows, chiaroscuro, Rembrandt style' },
    { name: 'Renaissance', keywords: 'renaissance painting, realistic, classical themes, soft lighting, Leonardo da Vinci style' }, { name: 'Pointillism', keywords: 'pointillism, small dots of color, optical mixing, Georges Seurat style' },
    { name: 'Tribal Art', keywords: 'tribal art, indigenous patterns, symbolic, geometric designs, ritualistic' }, { name: 'Psychedelic', keywords: 'psychedelic art, vibrant swirling colors, distorted patterns, 1960s hippie aesthetic, hallucinatory' },
    { name: 'Mecha', keywords: 'mecha anime, giant robots, futuristic, detailed machinery, gundam style, Evangelion' }, { name: 'Oil Painting', keywords: 'oil painting, rich textures, visible brush strokes, classic art, impasto' },
    { name: 'Acrylic Painting', keywords: 'acrylic painting, bold colors, sharp lines, modern art, vibrant' }, { name: 'Ink Wash', keywords: 'ink wash painting, sumi-e, monochrome, minimalist, Japanese style, zen' },
    { name: 'Concept Art', keywords: 'concept art, digital painting, character design, environment design, detailed, production art' }, { name: 'Technical Drawing', keywords: 'technical drawing, blueprint, schematic, precise lines, detailed diagram, orthographic' },
    { name: 'Sticker', keywords: 'sticker design, die-cut, bold outlines, vibrant colors, glossy, vector art' }, { name: 'Tattoo Art', keywords: 'tattoo design, bold lines, blackwork, traditional tattoo style, ink' },
    { name: 'Origami', keywords: 'origami style, folded paper, geometric, clean, 3d, papercraft' }, { name: 'Glitch Art', keywords: 'glitch art, datamoshing, digital distortion, artifacts, vibrant colors, corrupted data' },
    { name: 'Holographic', keywords: 'holographic, iridescent, rainbow sheen, futuristic, glowing, refractive' }, { name: 'Infographic', keywords: 'infographic style, clean, vector graphics, icons, data visualization, flat design' },
    { name: 'Macro Photography', keywords: 'macro photography, extreme close-up, high detail, shallow depth of field, detailed texture' }, { name: 'Long Exposure', keywords: 'long exposure photography, light trails, motion blur, ethereal, silky water' },
    { name: 'Double Exposure', keywords: 'double exposure, two images overlaid, artistic, surreal, blended' }, { name: 'Film Noir', keywords: 'film noir style, black and white, high contrast, dramatic shadows, 1940s mystery, cinematic' },
    { name: 'Retrowave', keywords: 'retrowave, synthwave, 80s retro futurism, neon grid, sunset, chrome' }, { name: 'Solarpunk', keywords: 'solarpunk, nature and technology harmony, art nouveau inspired, sustainable future, bright, utopian' },
    { name: 'Dieselpunk', keywords: 'dieselpunk, 1930s-1940s aesthetic, diesel-powered machines, industrial, gritty' }, { name: 'Atompunk', keywords: 'atompunk, 1950s atomic age aesthetic, mid-century modern, retro-futuristic, googie architecture' },
    { name: 'Biopunk', keywords: 'biopunk, genetic modification, organic technology, dark, body horror, futuristic biology' }, { name: 'Outrun', keywords: 'outrun aesthetic, 80s retro, neon colors, sports car, palm trees, digital sunset' },
    { name: 'Golden Hour', keywords: 'golden hour photography, warm soft light, long shadows, beautiful lighting, cinematic' }, { name: 'Blue Hour', keywords: 'blue hour photography, cool blue tones, soft light, city lights, tranquil' },
    { name: 'Rococo', keywords: 'rococo painting, elegant, ornate, pastel colors, light-hearted themes, Fragonard style' }, { name: 'Neoclassicism', keywords: 'neoclassical painting, classical themes, sharp outlines, stoic, historical, Jacques-Louis David style' },
    { name: 'Dadaism', keywords: 'dadaist art, anti-art, irrational, collage, absurd, Marcel Duchamp style' }, { name: 'Fauvism', keywords: 'fauvist painting, intense non-naturalistic colors, bold brushwork, Matisse style' },
    { name: 'Hard-Edge Painting', keywords: 'hard-edge painting, abstract, sharp lines, clean shapes, geometric, solid colors' }, { name: 'Color Field', keywords: 'color field painting, large areas of solid color, abstract expressionism, Mark Rothko style' },
    { name: 'Kinetic Art', keywords: 'kinetic art, art that moves, optical illusion, dynamic' }, { name: 'Op Art', keywords: 'op art, optical illusion, geometric patterns, black and white, Bridget Riley style' },
    { name: 'Photobashing', keywords: 'photobashing, photo manipulation, matte painting, realistic collage, concept art' }, { name: 'Splash Art', keywords: 'splash art, dynamic composition, detailed character art, illustrative, league of legends style' },
    { name: 'Vector Art', keywords: 'vector art, clean lines, flat colors, scalable, Adobe Illustrator style' }, { name: 'Cross-Stitch', keywords: 'cross-stitch pattern, embroidered, fabric texture, pixelated look' },
    { name: 'Mosaic', keywords: 'mosaic art, small tiles, tesserae, geometric patterns, ancient roman style' }, { name: 'Stained Glass', keywords: 'stained glass window, vibrant colors, lead came, cathedral style, gothic' },
    { name: 'Marble Sculpture', keywords: 'marble sculpture, classical, realistic, smooth texture, Michelangelo style' }, { name: 'Bronze Sculpture', keywords: 'bronze sculpture, cast metal, patina, detailed, Rodin style' },
    { name: 'Top-Down RPG', keywords: 'top-down RPG art, pixel art, 16-bit, tiled map, retro JRPG style' }, { name: 'Platformer Game', keywords: '2D platformer game style, vibrant, parallax scrolling, character sprites' },
    { name: 'Horror', keywords: 'horror art, dark, eerie, unsettling, macabre, atmospheric, lovecraftian' }, { name: 'Noir Comic', keywords: 'noir comic style, high contrast black and white, sin city style, dramatic shadows, hardboiled' },
    { name: 'Anaglyph 3D', keywords: 'anaglyph 3D effect, red and cyan channels, stereoscopic, retro 3D' }, { name: 'Architectural Blueprint', keywords: 'architectural blueprint, white lines on blue background, technical drawing, detailed plan' },
    { name: 'Food Photography', keywords: 'professional food photography, appetizing, delicious, well-lit, styled, shallow depth of field' }, { name: 'Wildlife Photography', keywords: 'national geographic style wildlife photography, telephoto lens, detailed animal portrait, natural environment' },
    { name: 'Astrophotography', keywords: 'astrophotography, long exposure, milky way, stars, nebula, deep space, hubble telescope style' }, { name: 'Infrared Photography', keywords: 'infrared photography, false-color, ethereal, dreamlike landscape, red foliage' },
    { name: 'Tilt-Shift', keywords: 'tilt-shift photography, miniature faking, selective focus, diorama effect' }, { name: 'Grunge', keywords: 'grunge aesthetic, dirty textures, distressed look, 90s style, dark, moody' },
    { name: 'Cottagecore', keywords: 'cottagecore aesthetic, rustic, countryside, idyllic, vintage, romanticized farm life' }, { name: 'Dark Academia', keywords: 'dark academia aesthetic, classic literature, moody, vintage, tweed, university life' },
    { name: 'Light Academia', keywords: 'light academia aesthetic, classical, optimistic, bright, poetry, art museum' }, { name: 'Fairycore', keywords: 'fairycore aesthetic, ethereal, magical, pastel colors, nature, iridescent, glowing' },
    { name: 'Kidcore', keywords: 'kidcore aesthetic, bright primary colors, 90s nostalgia, playful, childish themes' }
];

const QUALITIES = [
    { name: 'Standard', keywords: '' },
    { name: 'HD', keywords: 'high definition, 2k resolution, sharp focus' },
    { name: '4k', keywords: 'ultra high definition, 4k resolution, extremely detailed, professional lighting' },
    { name: 'Masterpiece', keywords: 'masterpiece, best quality, 8k resolution, ultra-detailed, photorealistic, intricate details' },
];

const getEnhancementKeywords = (level: number): string => {
    if (level <= 1) return ''; if (level <= 4) return 'enhanced detail, fine details';
    if (level <= 8) return 'very detailed, intricate details, high detail'; if (level <= 12) return 'hyper-detailed, complex details, sharp';
    return 'insanely detailed, ultra-detailed, hyper-realistic, masterpiece level detail';
};

// --- Re-usable UI Components ---
const CustomDropdown: React.FC<{ label: string; options: { name: string }[]; selected: string; onSelect: (value: string) => void; disabled?: boolean; }> = ({ label, options, selected, onSelect, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (
        <div ref={dropdownRef} className="relative w-full">
            <label className={`text-sm font-medium ${disabled ? 'text-horizon-text-tertiary/50' : 'text-horizon-text-secondary'}`}>{label}</label>
            <button onClick={() => !disabled && setIsOpen(!isOpen)} disabled={disabled} className={`mt-1 w-full flex items-center justify-between bg-black/20 p-3 rounded-lg border focus:outline-none focus:ring-1 focus:ring-horizon-accent transition-colors ${disabled ? 'border-white/10 opacity-50 cursor-not-allowed' : 'border-white/10 hover:border-white/20'}`}>
                <span className="font-semibold">{selected}</span>
                <ChevronDownIcon className={`w-5 h-5 text-horizon-text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 w-full max-h-60 overflow-y-auto bg-horizon-sidebar/90 ui-blur-effect border border-white/20 rounded-lg shadow-lg z-10 animate-scale-in-pop">
                    {options.map(option => (
                        <button key={option.name} onClick={() => { onSelect(option.name); setIsOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${selected === option.name ? 'bg-horizon-accent text-white' : 'hover:bg-white/10 text-horizon-text-primary'}`}>
                            {option.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const ImageCard: React.FC<{ image: GeneratedImage; onSelect: () => void; onDeleteImage: (id: string) => void; onSetAsBackground: (imageUrl: string) => void; style?: React.CSSProperties; className?: string; }> = ({ image, onSelect, onDeleteImage, onSetAsBackground, style, className }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e: React.MouseEvent) => { e.stopPropagation(); navigator.clipboard.writeText(image.prompt).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
    const handleAction = (e: React.MouseEvent, action: () => void) => { e.stopPropagation(); action(); };
    return (
        <div style={style} className={`${className || ''} cursor-pointer`}>
            <div className="liquid-glass-card group relative aspect-square rounded-xl overflow-hidden">
                <div className="liquid-glass--bend !bg-cover !bg-center" style={{ backgroundImage: `url(${image.url})` }}></div>
                <div className="liquid-glass--face"></div>
                <div className="liquid-glass--edge"></div>
                <div className="relative w-full h-full z-10">
                    <img src={image.url} alt={image.prompt} loading="lazy" className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"><div className="w-full h-full bg-white opacity-0 group-hover:animate-holographic-glare [transition-delay:100ms]"></div></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white z-20 [transform:translateZ(40px)] opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <p className="text-sm font-medium truncate">{image.prompt}</p>
                        <div className="flex items-center gap-2 mt-1 [transition-delay:100ms]">
                            <button onClick={(e) => handleAction(e, onSelect)} title="Edit Image" className="p-1.5 bg-black/50 rounded-full hover:bg-white/20"><PencilIcon className="w-4 h-4"/></button>
                            <button onClick={(e) => handleAction(e, () => onDeleteImage(image.id))} title="Delete Image" className="p-1.5 bg-black/50 rounded-full hover:bg-white/20"><TrashIcon className="w-4 h-4"/></button>
                            <a href={image.url} download={`horizon-art-${image.id}.jpg`} onClick={e => e.stopPropagation()} title="Download" className="p-1.5 bg-black/50 rounded-full hover:bg-white/20"><DownloadIcon className="w-4 h-4"/></a>
                            <button onClick={handleCopy} title="Copy Prompt" className="p-1.5 bg-black/50 rounded-full hover:bg-white/20">{copied ? <CheckIcon className="w-4 h-4 text-green-400"/> : <CopyIcon className="w-4 h-4"/>}</button>
                            <button onClick={(e) => handleAction(e, () => onSetAsBackground(image.url))} title="Set as background" className="p-1.5 bg-black/50 rounded-full hover:bg-white/20"><ImageIcon className="w-4 h-4"/></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoadingSkeleton: React.FC<{ style?: React.CSSProperties }> = ({ style }) => ( <div style={style} className="relative aspect-square bg-black/30 rounded-xl overflow-hidden shadow-lg border-2 border-white/10"><div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-45 animate-shimmer"></div></div>);

// --- Main Page Component ---
interface ImageGenerationPageProps {
    onGenerate: (prompt: string, negativePrompt: string, numImages: number, remixImage?: ImageFile) => Promise<GeneratedImage[]>;
    onGenerateNano: (prompt: string, remixImage?: ImageFile) => Promise<GeneratedImage[]>;
    isLoading: boolean;
    loadingCount: number;
    images: GeneratedImage[];
    error: string | null;
    onClearAll: () => void;
    onDeleteImage: (id: string) => void;
    onSetAsBackground: (imageUrl: string) => void;
    initialPrompt?: string;
    onUpdateInterest: (interest: keyof UserInterestProfile, amount: number) => void;
    onSelectForEditing: (image: GeneratedImage) => void;
}

const ImageGenerationPage: React.FC<ImageGenerationPageProps> = ({ onGenerate, onGenerateNano, isLoading, loadingCount, images, error, onClearAll, onDeleteImage, onSetAsBackground, initialPrompt = '', onUpdateInterest, onSelectForEditing }) => {
    const [generationMode, setGenerationMode] = useState<'standard' | 'nano_banana'>('standard');
    const [prompt, setPrompt] = useState(initialPrompt);
    const [negativePrompt, setNegativePrompt] = useState('');
    const [numImages, setNumImages] = useState(1);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState('None');
    const [selectedQuality, setSelectedQuality] = useState('Standard');
    const [enhancementLevel, setEnhancementLevel] = useState(1);
    const [remixImage, setRemixImage] = useState<ImageFile | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingRemix, setIsUploadingRemix] = useState(false);
    
    useEffect(() => { if (initialPrompt) setPrompt(initialPrompt); }, [initialPrompt]);
    useEffect(() => { if (generationMode === 'nano_banana') setNumImages(1); }, [generationMode]);

    const handleFileSelect = (file: File | null) => {
        if (!file || !file.type.startsWith('image/')) return;
        setIsUploadingRemix(true);
        setTimeout(() => {
            const reader = new FileReader();
            reader.onloadend = () => { setRemixImage({ data: reader.result as string, mimeType: file.type }); setIsUploadingRemix(false); };
            reader.readAsDataURL(file);
        }, 1500); // Shorter transmute effect
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]); };
    const handleUrlFetch = () => { /* Simplified for brevity, assumes URL is valid */ setRemixImage({ data: imageUrl, mimeType: 'image/jpeg' }); setImageUrl(''); };

    const handleGenerate = () => {
        if(generationMode === 'standard') {
            const styleKeywords = STYLES.find(s => s.name === selectedStyle)?.keywords || '';
            const qualityKeywords = QUALITIES.find(q => q.name === selectedQuality)?.keywords || '';
            const enhancementKeywords = getEnhancementKeywords(enhancementLevel);
            const fullPrompt = [prompt, styleKeywords, qualityKeywords, enhancementKeywords].filter(Boolean).join(', ');
            onGenerate(fullPrompt, negativePrompt, numImages, remixImage);
        } else { // Nano Banana
            const styleKeywords = STYLES.find(s => s.name === selectedStyle)?.keywords || '';
            const fullPrompt = [prompt, styleKeywords].filter(Boolean).join(', ');
            onGenerateNano(fullPrompt, remixImage);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleGenerate(); } };
    
    return (
        <div className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none"><div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-indigo-600/30 rounded-full filter blur-3xl animate-aurora opacity-40"></div><div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-teal-500/30 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-40"></div></div>
            <div className="flex-1 min-h-0 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-6 md:p-8 h-full">
                    {/* --- CONTROLS PANEL (Left) --- */}
                    <div className="lg:col-span-2 flex flex-col space-y-4 bg-black/20 ui-blur-effect border border-white/10 rounded-2xl p-6 overflow-y-auto shadow-2xl animate-fade-in-up [transform:translateZ(20px)] custom-scrollbar">
                        <header><h1 className="text-2xl font-bold text-white flex items-center gap-3"><ImageIcon className="text-horizon-accent" style={{filter: 'drop-shadow(0 0 5px var(--horizon-accent))'}}/> Image Generation</h1></header>
                        <div className="flex w-full bg-black/30 rounded-lg p-1"><button onClick={() => setGenerationMode('standard')} className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-all duration-300 ${generationMode === 'standard' ? 'bg-horizon-accent text-white shadow-md' : 'text-horizon-text-secondary hover:bg-white/5'}`}>Standard</button><button onClick={() => setGenerationMode('nano_banana')} className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-all duration-300 ${generationMode === 'nano_banana' ? 'bg-horizon-accent text-white shadow-md' : 'text-horizon-text-secondary hover:bg-white/5'}`}>Nano Banana (Edit)</button></div>
                        
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg text-white">Image Remix</h3>
                            {remixImage ? ( <div className="relative group aspect-video bg-black/30 rounded-lg"><img src={remixImage.data} alt="Remix preview" className="w-full h-full object-contain rounded-lg shadow-lg" /><button onClick={() => setRemixImage(null)} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 hover:bg-black/80"><XIcon className="w-5 h-5"/></button></div> ) : (
                                <div className="space-y-2">
                                    <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} onDragEnter={() => setIsDragging(true)} onDragLeave={() => setIsDragging(false)} className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[120px] ${isDragging ? 'border-horizon-accent bg-horizon-accent/10' : 'border-white/20 hover:border-white/40'} ${isUploadingRemix ? 'file-melt-animation' : ''}`} onClick={() => fileInputRef.current?.click()}>
                                        {isUploadingRemix ? ( <div className="flex flex-col items-center justify-center text-white"><LoaderIcon className="w-8 h-8 animate-spin" /><p className="font-semibold mt-2">Transmuting...</p></div> ) : ( <> <UploadCloudIcon className="w-8 h-8 mx-auto text-slate-400 mb-2"/><p className="font-semibold text-white">Drag & drop image</p><p className="text-sm text-slate-400">or click to browse</p></> )}
                                        <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} className="hidden" accept="image/*" />
                                    </div>
                                    <div className="flex items-center gap-2"><input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Or paste image URL" className="flex-1 bg-black/20 p-2.5 rounded-lg border border-white/10 focus:outline-none focus:ring-1 focus:ring-horizon-accent text-sm"/><button onClick={handleUrlFetch} disabled={!imageUrl} className="p-2.5 bg-slate-700 rounded-lg hover:bg-slate-600 disabled:opacity-50"><LinkIcon className="w-5 h-5"/></button></div>
                                </div>
                            )}
                        </div>
                        <hr className="border-white/10" />
                        <div className="space-y-4">
                            <div><label htmlFor="prompt" className="text-sm font-medium text-horizon-text-secondary">Your Prompt</label><textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={handleKeyDown} placeholder="e.g., A majestic lion wearing a crown..." rows={4} className="mt-1 w-full bg-black/20 p-3 rounded-lg border border-white/10 focus:outline-none focus:ring-1 focus:ring-horizon-accent resize-y transition-colors"/></div>
                            <CustomDropdown label="Style" options={STYLES} selected={selectedStyle} onSelect={setSelectedStyle} />
                        </div>
                        <div>
                             <button onClick={() => setIsAdvancedOpen(!isAdvancedOpen)} className="flex items-center justify-between w-full text-left font-semibold text-white"><span className={`${generationMode === 'nano_banana' ? 'opacity-50' : ''}`}>Advanced Options (Standard Mode Only)</span><ChevronDownIcon className={`w-5 h-5 text-horizon-text-tertiary transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} /></button>
                             {isAdvancedOpen && (
                                 <div className={`mt-4 space-y-4 animate-fade-in-up ${generationMode === 'nano_banana' ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div><label htmlFor="negative-prompt" className="text-sm font-medium text-horizon-text-secondary">Negative Prompt</label><input id="negative-prompt" type="text" value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} placeholder="e.g., blurry, ugly, text, watermark" className="mt-1 w-full bg-black/20 p-3 rounded-lg border border-white/10 focus:outline-none focus:ring-1 focus:ring-horizon-accent transition-colors"/></div>
                                    <CustomDropdown label="Quality" options={QUALITIES} selected={selectedQuality} onSelect={setSelectedQuality} />
                                    <div className="space-y-2"><label className="text-sm font-medium text-horizon-text-secondary">Enhance Details</label><input type="range" min="1" max="16" step="1" value={enhancementLevel} onChange={e => setEnhancementLevel(Number(e.target.value))} className="w-full h-2 bg-black/20 rounded-lg appearance-none cursor-pointer accent-horizon-accent" /><div className="text-xs text-center text-horizon-text-tertiary">{getEnhancementKeywords(enhancementLevel) || 'Standard Detail'}</div></div>
                                    <div className="space-y-2"><label className="text-sm font-medium text-horizon-text-secondary">Number of Images</label><div className="flex w-full bg-black/20 rounded-lg p-1">{[1, 2, 3, 4].map(num => (<button key={num} onClick={() => setNumImages(num)} className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${numImages === num ? 'bg-horizon-accent text-white' : 'text-horizon-text-primary hover:bg-white/10'}`}>{num}</button>))}</div></div>
                                 </div>
                             )}
                        </div>
                        <div className="!mt-auto pt-4"><button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-horizon-accent text-white rounded-lg font-semibold hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? (<><LoaderIcon className="w-5 h-5 animate-spin"/><span>Generating...</span></>) : (<><SendIcon className="w-5 h-5"/><span>{remixImage ? 'Remix Image' : 'Generate'}</span></>)}</button>{error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}</div>
                    </div>
                    {/* --- GALLERY (Right) --- */}
                    <div className="lg:col-span-3 flex flex-col min-h-0 [transform:translateZ(10px)]">
                        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-white">Your Gallery</h2>{images.length > 0 && (<button onClick={onClearAll} className="flex items-center gap-2 text-sm text-horizon-text-tertiary hover:text-red-400 transition-colors"><TrashIcon className="w-4 h-4"/>Clear All</button>)}</div>
                         <div className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                            {images.length === 0 && !isLoading ? ( <div className="h-full flex flex-col items-center justify-center text-center text-horizon-text-tertiary p-8 border-2 border-dashed border-white/10 rounded-xl"><ImageIcon className="w-16 h-16 opacity-30"/><h3 className="mt-4 text-xl font-semibold text-horizon-text-secondary">Your gallery is empty</h3><p className="mt-1">Generated images will appear here.</p></div> ) : (
                                <div className="gallery-grid grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                                    {isLoading && Array.from({ length: loadingCount }).map((_, i) => <LoadingSkeleton key={i} style={{ animationDelay: `${i * 100}ms` }} />)}
                                    {images.map((img, i) => ( <ImageCard key={img.id} image={img} onSelect={() => onSelectForEditing(img)} onDeleteImage={onDeleteImage} onSetAsBackground={onSetAsBackground} style={{ animationDelay: `${i * 50}ms` }} className="animate-scale-in-pop"/> ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageGenerationPage;