
import React from 'react';
import { Gem } from '../types';

// This component is currently a placeholder to prevent build errors from empty files.
// The actual avatar editing logic is handled by ImagePickerModal.

interface GemAvatarEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    gem: Gem;
}

const GemAvatarEditorModal: React.FC<GemAvatarEditorModalProps> = ({ isOpen, onClose, gem }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-lg">
                <h2 className="text-white text-lg font-bold mb-4">Edit Avatar: {gem.name}</h2>
                <p className="text-slate-400 mb-4">Please use the main image picker to update gem avatars.</p>
                <button onClick={onClose} className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500">Close</button>
            </div>
        </div>
    );
};

export default GemAvatarEditorModal;
