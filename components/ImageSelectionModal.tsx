

import React from 'react';
import { ImageFile } from '../types';
import { XIcon, ImageIcon } from './icons';

interface ImageSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: ImageFile[];
    onSelect: (image: ImageFile) => void;
}

const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({ isOpen, onClose, images, onSelect }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 ui-blur-effect animate-fade-in-up"
            onClick={onClose}
        >
            <div
                className="w-full max-w-4xl bg-horizon-sidebar/80 dark:bg-horizon-dark/80 ui-blur-effect border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-lg font-bold text-horizon-text-primary">Select an Image</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-horizon-text-tertiary hover:bg-white/10">
                        <XIcon className="w-5 h-5" />
                    </button>
                </header>

                <div className="p-4 md:p-6 overflow-y-auto">
                    {images.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => onSelect(image)}
                                    className="group relative aspect-square overflow-hidden rounded-lg bg-black/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-horizon-dark focus:ring-horizon-accent"
                                >
                                    <img
                                        src={image.data}
                                        alt={`Image ${index + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-semibold">Use Image</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-horizon-text-tertiary">
                            <ImageIcon className="w-20 h-20 mx-auto opacity-30" />
                            <h3 className="mt-4 text-xl font-semibold text-horizon-text-secondary">No Images Found</h3>
                            <p className="mt-2">Generate or upload images to see them here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageSelectionModal;