

import React, { useState, useRef } from 'react';
import { ImageFile } from '../types';
import { XIcon, UploadCloudIcon, LinkIcon, ImageIcon, LoaderIcon } from './icons';

const PreviewImage: React.FC<{ url: string }> = ({ url }) => {
    const isUrl = url?.startsWith('http') || url?.startsWith('data:');
    
    return (
        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center rounded-lg bg-black/20 text-white font-bold shadow-lg">
            {isUrl ? (
                <img src={url} alt="Avatar Preview" className="w-full h-full object-cover rounded-lg" />
            ) : (
                <ImageIcon className="w-12 h-12 text-slate-500" />
            )}
        </div>
    );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${active ? 'border-horizon-accent text-horizon-accent' : 'border-transparent text-slate-400 hover:text-white'}`}
    >
        {children}
    </button>
);

interface ImagePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newUrl: string) => void;
    availableImages: ImageFile[];
    title: string;
    currentItemUrl?: string;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({ isOpen, onClose, onSave, availableImages, title, currentItemUrl }) => {
    const [activeTab, setActiveTab] = useState<'gallery' | 'upload' | 'url'>('gallery');
    const [selectedUrl, setSelectedUrl] = useState<string>(currentItemUrl || '');
    const [urlInput, setUrlInput] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    if (!isOpen) return null;

    const handleFileSelect = (file: File | null) => {
        if (!file || !file.type.startsWith('image/')) return;
        setIsUploading(true);
        setTimeout(() => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedUrl(reader.result as string);
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }, 5000);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleSave = () => {
        onSave(selectedUrl);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 ui-blur-effect flex items-center justify-center z-50 animate-fade-in-up" onClick={onClose}>
            <div 
                className="bg-horizon-sidebar/80 ui-blur-effect border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl flex flex-col gap-4 max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-bold text-white truncate pr-4">{title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-white/10">
                        <XIcon className="w-5 h-5" />
                    </button>
                </header>
                
                <div className="flex items-center justify-around p-4 bg-black/20 rounded-lg flex-shrink-0">
                    <div className="text-center">
                        <p className="text-sm font-semibold text-slate-400 mb-2">Current</p>
                        <PreviewImage url={currentItemUrl || ''} />
                    </div>
                     <div className="text-5xl text-slate-500">&rarr;</div>
                     <div className="text-center">
                        <p className="text-sm font-semibold text-white mb-2">New</p>
                        <PreviewImage url={selectedUrl} />
                    </div>
                </div>

                <div className="flex flex-col flex-1 min-h-0">
                    <div className="border-b border-white/10 flex-shrink-0">
                        <div className="flex">
                            <TabButton active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')}><ImageIcon className="w-5 h-5"/> Gallery</TabButton>
                            <TabButton active={activeTab === 'upload'} onClick={() => setActiveTab('upload')}><UploadCloudIcon className="w-5 h-5"/> Upload</TabButton>
                            <TabButton active={activeTab === 'url'} onClick={() => setActiveTab('url')}><LinkIcon className="w-5 h-5"/> URL</TabButton>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {activeTab === 'gallery' && (
                            availableImages.length > 0 ? (
                                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                                    {availableImages.map((image, index) => (
                                        <button key={index} onClick={() => setSelectedUrl(image.data)} className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 ${selectedUrl === image.data ? 'ring-2 ring-horizon-accent ring-offset-2 ring-offset-slate-800' : 'hover:scale-105'}`}>
                                            <img src={image.data} alt={`Generated ${index}`} className="w-full h-full object-cover"/>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-slate-400 pt-10">Your image gallery is empty. Generate some images first!</p>
                            )
                        )}
                        {activeTab === 'upload' && (
                            <div 
                                onDrop={handleDrop} 
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onDragEnter={() => setIsDragging(true)}
                                onDragLeave={() => setIsDragging(false)}
                                className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors flex flex-col items-center justify-center ${isDragging ? 'border-horizon-accent bg-horizon-accent/10' : 'border-white/20 hover:border-white/40'} ${isUploading ? 'file-melt-animation' : ''}`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {isUploading ? (
                                    <div className="text-white font-semibold flex flex-col items-center">
                                        <LoaderIcon className="w-12 h-12 animate-spin mb-2" />
                                        Transmuting...
                                    </div>
                                ) : (
                                    <>
                                        <UploadCloudIcon className="w-12 h-12 mx-auto text-slate-400 mb-2"/>
                                        <p className="font-semibold text-white">Drag & drop image</p>
                                        <p className="text-sm text-slate-400">or click to browse</p>
                                    </>
                                )}
                                <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} className="hidden" accept="image/*" />
                            </div>
                        )}
                        {activeTab === 'url' && (
                            <div className="flex items-center gap-2 pt-10">
                                <input
                                    type="text"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="Paste image URL here..."
                                    className="flex-1 bg-black/20 p-3 rounded-lg border border-white/10 focus:outline-none focus:ring-1 focus:ring-horizon-accent text-sm"
                                />
                                <button onClick={() => setSelectedUrl(urlInput)} className="px-4 py-2.5 bg-slate-700 rounded-lg hover:bg-slate-600 font-semibold text-sm">Load</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-4 flex-shrink-0">
                    <button onClick={onClose} className="px-5 py-2 text-slate-300 font-semibold hover:bg-white/10 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-5 py-2 bg-horizon-accent text-white font-semibold rounded-lg hover:brightness-110 transition-colors">Save</button>
                </div>
            </div>
        </div>
    );
};

export default ImagePickerModal;
