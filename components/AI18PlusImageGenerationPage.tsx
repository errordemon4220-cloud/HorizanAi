import React from 'react';
import { ChevronLeftIcon } from './icons';

interface AI18PlusImageGenerationPageProps {
    onCancel: () => void;
}

const AI18PlusImageGenerationPage: React.FC<AI18PlusImageGenerationPageProps> = ({ onCancel }) => {
    return (
        <div className="flex-1 flex flex-col bg-black text-white relative">
            <header className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-900/50 border-b border-rose-500/30 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10 text-rose-300">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-rose-300">18+ Image Generation Studio</h1>
                </div>
            </header>
            <main className="flex-1 p-6">
                {/* The main content area is now empty and ready for new implementation. */}
                <div className="w-full h-full border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center">
                    <p className="text-slate-500">Content for 18+ Image Generation can be added here.</p>
                </div>
            </main>
        </div>
    );
};

export default AI18PlusImageGenerationPage;