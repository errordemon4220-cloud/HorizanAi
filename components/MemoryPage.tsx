
import React, { useState } from 'react';
import { MemoryItem } from '../types';
import { BrainCircuitIcon, PlusIcon, TrashIcon } from './icons';

const MemoryItemComponent: React.FC<{
    memory: MemoryItem;
    onDelete: (id: string) => void;
    isDeleting: boolean;
    style: React.CSSProperties;
}> = ({ memory, onDelete, isDeleting, style }) => {
    return (
        <div
            style={style}
            className={`bg-white/5 dark:bg-black/20 ui-blur-effect p-4 rounded-lg flex items-center justify-between gap-4 group transition-all duration-300 hover:scale-105 hover:bg-white/10 dark:hover:bg-black/30 border border-white/10 ${isDeleting ? 'animate-scale-out' : 'animate-fade-in-up'}`}
        >
            <p className="flex-1 text-horizon-light-text-primary dark:text-horizon-text-primary">{memory.content}</p>
            <button
                onClick={() => onDelete(memory.id)}
                className="p-2 text-horizon-light-text-tertiary dark:text-horizon-text-tertiary rounded-full opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 transition-all"
                title="Delete memory"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

const MemoryPage: React.FC<{
    memories: MemoryItem[];
    onAdd: (content: string) => void;
    onDelete: (id: string) => void;
    onCancel: () => void;
}> = ({ memories, onAdd, onDelete, onCancel }) => {
    const [newMemory, setNewMemory] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleAdd = () => {
        if (newMemory.trim()) {
            onAdd(newMemory.trim());
            setNewMemory('');
        }
    };

    const handleDelete = (id: string) => {
        setDeletingId(id);
        setTimeout(() => {
            onDelete(id);
            setDeletingId(null);
        }, 300); // Match animation duration
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAdd();
        }
    };

    const sortedMemories = [...memories].sort((a, b) => b.createdAt - a.createdAt);

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto relative">
             {/* Animated background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-500/20 dark:bg-purple-500/10 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-sky-500/20 dark:bg-sky-500/10 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <header className="flex items-center justify-between mb-8 relative z-10 animate-fade-in-up">
                <div className="flex items-center space-x-3">
                    <BrainCircuitIcon className="w-8 h-8 text-horizon-accent animate-pulse" style={{filter: 'drop-shadow(0 0 5px var(--horizon-accent))'}} />
                    <h1 className="text-2xl md:text-3xl font-bold text-horizon-light-text-primary dark:text-horizon-text-primary">AI Memory</h1>
                </div>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 font-semibold text-horizon-light-text-secondary dark:text-horizon-text-secondary hover:text-horizon-light-text-primary dark:hover:text-horizon-text-primary transition-colors active:scale-95"
                >
                    Back
                </button>
            </header>

            <div className="relative z-10 animate-fade-in-up" style={{ animationDelay: '100ms'}}>
                <div className="bg-white/5 dark:bg-black/20 ui-blur-effect border border-white/10 p-6 rounded-xl mb-8 shadow-2xl shadow-black/20">
                    <h2 className="text-lg font-semibold mb-2">Add to Memory</h2>
                    <p className="text-sm text-horizon-light-text-tertiary dark:text-horizon-text-tertiary mb-4">Add facts or preferences for the AI to remember in all conversations.</p>
                    <div className="flex items-start gap-4">
                        <textarea
                            value={newMemory}
                            onChange={e => setNewMemory(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g., My favorite color is blue."
                            rows={2}
                            className="flex-1 bg-white/5 dark:bg-black/20 border border-white/10 rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-horizon-accent/80 focus:bg-white/10 dark:focus:bg-black/30 transition-all"
                        />
                        <button
                            onClick={handleAdd}
                            disabled={!newMemory.trim()}
                            className={`flex items-center gap-2 px-4 py-2 bg-horizon-accent text-white rounded-lg hover:brightness-110 transition-all font-semibold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 ${newMemory.trim() ? 'animate-pulse-glow' : ''}`}
                        >
                            <PlusIcon className="w-5 h-5" />
                            Add
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {sortedMemories.map((memory, index) => (
                        <MemoryItemComponent
                            key={memory.id}
                            memory={memory}
                            onDelete={handleDelete}
                            isDeleting={deletingId === memory.id}
                            style={{ animationDelay: `${200 + index * 50}ms` }}
                        />
                    ))}
                    {memories.length === 0 && (
                        <div className="text-center py-16 px-6 bg-white/5 dark:bg-black/20 ui-blur-effect rounded-xl border border-dashed border-white/10 animate-fade-in-up" style={{ animationDelay: '300ms'}}>
                            <h2 className="text-xl font-semibold text-horizon-light-text-primary dark:text-horizon-text-primary mb-2">Memory is Empty</h2>
                            <p className="text-horizon-light-text-secondary dark:text-horizon-text-secondary">Add items above or ask the AI to remember things during a chat.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemoryPage;