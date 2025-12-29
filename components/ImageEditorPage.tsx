
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GeneratedImage, ImageFile } from '../types';
import { XIcon, ThumbsUpIcon, ThumbsDownIcon, DownloadIcon, ShareIcon, RotateCcwIcon, RotateCwIcon, Wand2Icon, CheckIcon, LoaderIcon } from './icons';

interface ImageEditorPageProps {
    image: GeneratedImage;
    onClose: () => void;
    onEdit: (prompt: string, image: ImageFile, mask?: ImageFile) => Promise<GeneratedImage | null>;
    isLoading: boolean;
}

const ImageEditorPage: React.FC<ImageEditorPageProps> = ({ image, onClose, onEdit, isLoading }) => {
    const [currentImage, setCurrentImage] = useState(image);
    const [history, setHistory] = useState<GeneratedImage[]>([image]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const [prompt, setPrompt] = useState('');
    const [isMasking, setIsMasking] = useState(false);
    
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null); // For visible blue mask
    const dataCanvasRef = useRef<HTMLCanvasElement>(null); // For hidden B&W mask data
    const isDrawing = useRef(false);

    const resetCanvases = useCallback(() => {
        [maskCanvasRef, dataCanvasRef].forEach(ref => {
            if (ref.current) {
                const ctx = ref.current.getContext('2d');
                ctx?.clearRect(0, 0, ref.current.width, ref.current.height);
            }
        });
    }, []);

    const setupCanvas = useCallback(() => {
        if (!imageRef.current) return;
        const { width, height } = imageRef.current;
        [maskCanvasRef, dataCanvasRef].forEach(ref => {
            if (ref.current) {
                ref.current.width = width;
                ref.current.height = height;
            }
        });
    }, []);
    
    useEffect(setupCanvas, [currentImage, setupCanvas]);
    
    const getBrushPos = (e: React.MouseEvent | React.TouchEvent) => {
        if (!maskCanvasRef.current) return null;
        const rect = maskCanvasRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing.current || !isMasking) return;
        e.preventDefault();
        const pos = getBrushPos(e);
        if (!pos) return;
        
        const drawOnContext = (ctx: CanvasRenderingContext2D, color: string) => {
            ctx.lineTo(pos.x, pos.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = 40;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        };

        const maskCtx = maskCanvasRef.current?.getContext('2d');
        const dataCtx = dataCanvasRef.current?.getContext('2d');
        if (maskCtx && dataCtx) {
            drawOnContext(maskCtx, 'rgba(59, 130, 246, 0.5)'); // Blue visible mask
            drawOnContext(dataCtx, '#FFFFFF'); // White for inpainting area
        }
    }, [isMasking]);
    
    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isMasking) return;
        e.preventDefault();
        const pos = getBrushPos(e);
        if (!pos) return;

        isDrawing.current = true;
        
        const startOnContext = (ctx: CanvasRenderingContext2D) => {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        };
        const maskCtx = maskCanvasRef.current?.getContext('2d');
        const dataCtx = dataCanvasRef.current?.getContext('2d');
        if (maskCtx && dataCtx) {
            startOnContext(maskCtx);
            startOnContext(dataCtx);
        }
        draw(e);
    }, [isMasking, draw]);
    
    const stopDrawing = useCallback(() => {
        isDrawing.current = false;
    }, []);

    const getMaskDataURL = (): ImageFile | undefined => {
        if (!dataCanvasRef.current) return undefined;
        // Check if canvas is empty
        const ctx = dataCanvasRef.current.getContext('2d');
        if (!ctx) return undefined;
        const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, dataCanvasRef.current.width, dataCanvasRef.current.height).data.buffer);
        const isEmpty = !pixelBuffer.some(color => color !== 0);

        if (isEmpty) return undefined;

        return {
            data: dataCanvasRef.current.toDataURL('image/png'),
            mimeType: 'image/png'
        };
    };

    const handleGenerate = async () => {
        const imageFile: ImageFile = { data: currentImage.url, mimeType: 'image/jpeg' };
        const maskFile = isMasking ? getMaskDataURL() : undefined;
        
        if (!prompt.trim()) {
            alert('Please enter a prompt to describe your edit.');
            return;
        }

        const newImage = await onEdit(prompt, imageFile, maskFile);
        if (newImage) {
            const newHistory = history.slice(0, historyIndex + 1);
            setHistory([...newHistory, newImage]);
            setHistoryIndex(newHistory.length);
            setCurrentImage(newImage);
            resetCanvases();
            setIsMasking(false);
            setPrompt('');
        }
    };
    
    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setCurrentImage(history[newIndex]);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setCurrentImage(history[newIndex]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#1e1e1e] flex flex-col font-sans">
            <header className="flex items-center justify-between p-3 flex-shrink-0 text-slate-300">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><XIcon className="w-6 h-6"/></button>
                <div className="flex items-center gap-2">
                    <button onClick={handleUndo} disabled={historyIndex === 0} className="p-2 rounded-full hover:bg-white/10 disabled:opacity-50"><RotateCcwIcon className="w-5 h-5"/></button>
                    <button onClick={handleRedo} disabled={historyIndex === history.length - 1} className="p-2 rounded-full hover:bg-white/10 disabled:opacity-50"><RotateCwIcon className="w-5 h-5"/></button>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-white/10"><ThumbsUpIcon className="w-5 h-5"/></button>
                    <button className="p-2 rounded-full hover:bg-white/10"><ThumbsDownIcon className="w-5 h-5"/></button>
                    <a href={currentImage.url} download={`horizon-edit-${currentImage.id}.jpg`} className="p-2 rounded-full hover:bg-white/10"><DownloadIcon className="w-5 h-5"/></a>
                    <button className="p-2 rounded-full hover:bg-white/10"><ShareIcon className="w-5 h-5"/></button>
                </div>
            </header>
            
            <main className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                 <div ref={canvasContainerRef} className="relative max-w-full max-h-full">
                    <img ref={imageRef} src={currentImage.url} alt={currentImage.prompt} className="max-w-full max-h-[75vh] object-contain block" onLoad={setupCanvas}/>
                    <canvas 
                        ref={maskCanvasRef}
                        className={`absolute inset-0 transition-opacity duration-300 ${isMasking ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                    />
                    <canvas ref={dataCanvasRef} className="hidden"/>
                 </div>
            </main>
            
            <footer className="p-4 flex-shrink-0 flex items-center justify-center">
                 <div className="w-full max-w-2xl flex items-center gap-3 p-2 bg-slate-800/50 rounded-full border border-slate-700">
                    <button 
                        onClick={() => setIsMasking(!isMasking)} 
                        className={`flex-shrink-0 flex items-center gap-2 p-3 rounded-full text-sm font-semibold transition-colors ${isMasking ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                        <Wand2Icon className="w-5 h-5"/>
                        Selection
                    </button>
                    <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe what you want to add, remove, or replace..."
                        className="w-full bg-transparent text-white focus:outline-none"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="flex-shrink-0 p-3 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50">
                        {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin"/> : <CheckIcon className="w-5 h-5"/>}
                    </button>
                 </div>
            </footer>
        </div>
    );
};

export default ImageEditorPage;
