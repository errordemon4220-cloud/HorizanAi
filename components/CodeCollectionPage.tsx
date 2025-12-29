import React from 'react';
import { CodeSnippet } from '../types';
import { FileCodeIcon, PlusIcon, TrashIcon, ImageIcon } from './icons';

interface CodeSnippetCardProps {
    snippet: CodeSnippet;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onEditCardBackground: (snippet: CodeSnippet) => void;
    style: React.CSSProperties;
}

const CodeSnippetCard: React.FC<CodeSnippetCardProps> = ({ snippet, onEdit, onDelete, onEditCardBackground, style }) => {
    return (
        <div
            style={style}
            className="opacity-0 animate-fade-in-up cursor-pointer"
            onClick={() => onEdit(snippet.id)}
        >
            <div
                className="liquid-glass-card group relative aspect-[4/3] rounded-2xl w-full text-left"
            >
                {snippet.cardImageUrl && (
                    <div 
                        className="absolute inset-0 bg-cover bg-center rounded-2xl transition-all duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${snippet.cardImageUrl})` }}
                    />
                )}
                <div className="liquid-glass--bend"></div>
                <div className="liquid-glass--face" style={{ backgroundColor: snippet.cardImageUrl ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.02)'}}></div>
                <div className="liquid-glass--edge"></div>
                
                <div className="relative w-full h-full p-5 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                        <FileCodeIcon className="w-8 h-8 text-horizon-accent opacity-80" style={{ transform: 'translateZ(30px)' }} />
                        <div className="flex items-center gap-2" style={{ transform: 'translateZ(30px)' }}>
                             <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditCardBackground(snippet);
                                }}
                                className="p-1.5 bg-black/30 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-500/80 hover:text-white"
                                title="Set Card Background"
                            >
                                <ImageIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click
                                    onDelete(snippet.id);
                                }}
                                className="p-1.5 bg-black/30 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80 hover:text-white"
                                title="Delete Snippet"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div style={{ transform: 'translateZ(20px)' }}>
                        <h2 className="text-lg font-bold text-horizon-light-text-primary dark:text-horizon-text-primary truncate">{snippet.title}</h2>
                        <p className="text-xs text-horizon-light-text-secondary dark:text-horizon-text-secondary">
                            Last modified: {new Date(snippet.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NewSnippetCard: React.FC<{ onClick: () => void; style: React.CSSProperties }> = ({ onClick, style }) => (
    <button
        onClick={onClick}
        style={style}
        className="opacity-0 animate-fade-in-up group w-full"
    >
        <div className="liquid-glass-card relative aspect-[4/3] rounded-2xl transition-transform duration-300 group-hover:scale-105">
            <div className="liquid-glass--bend"></div>
            <div className="liquid-glass--face"></div>
            <div className="liquid-glass--edge"></div>
            <div className="relative w-full h-full p-6 flex flex-col items-center justify-center text-center z-10">
                <div className="[transform:translateZ(30px)] transition-transform duration-300 group-hover:scale-110">
                    <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white/5 border border-white/10 transition-colors duration-300 group-hover:bg-horizon-accent/10 group-hover:border-horizon-accent/50">
                        <PlusIcon className="w-10 h-10 text-horizon-light-text-tertiary dark:text-horizon-text-tertiary transition-colors duration-300 group-hover:text-horizon-accent" />
                    </div>
                </div>
                <p className="mt-4 font-semibold text-horizon-light-text-secondary dark:text-horizon-text-secondary group-hover:text-horizon-light-text-primary dark:group-hover:text-horizon-text-primary [transform:translateZ(20px)] transition-colors duration-300">
                    New Snippet
                </p>
            </div>
        </div>
    </button>
);


interface CodeCollectionPageProps {
    snippets: CodeSnippet[];
    onNew: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onEditCardBackground: (snippet: CodeSnippet) => void;
}

const CodeCollectionPage: React.FC<CodeCollectionPageProps> = ({ snippets, onNew, onEdit, onDelete, onEditCardBackground }) => {
    const sortedSnippets = [...snippets].sort((a, b) => b.createdAt - a.createdAt);

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto relative">
            {/* Animated background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-blue-500/10 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-teal-500/10 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <div className="relative z-10">
                <header className="mb-8 text-center animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400"
                        style={{ textShadow: '0 2px 10px rgba(255, 255, 255, 0.1)' }}>
                        Code Collection
                    </h1>
                    <p className="mt-3 text-lg text-horizon-light-text-secondary dark:text-horizon-text-secondary">
                        Your personal library of AI-generated code snippets.
                    </p>
                </header>

                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                    <NewSnippetCard onClick={onNew} style={{ animationDelay: '0ms' }} />

                    {sortedSnippets.map((snippet, index) => (
                        <CodeSnippetCard
                            key={snippet.id}
                            snippet={snippet}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onEditCardBackground={onEditCardBackground}
                            style={{ animationDelay: `${(index + 1) * 100}ms` }}
                        />
                    ))}
                </div>

                {snippets.length === 0 && (
                    <div className="col-span-full mt-8 text-center py-16 px-6 bg-horizon-light-sidebar/50 dark:bg-horizon-sidebar/50 backdrop-blur-sm rounded-xl border border-dashed border-horizon-light-item dark:border-horizon-item">
                        <h2 className="text-xl font-semibold text-horizon-light-text-primary dark:text-horizon-text-primary mb-2">Your Collection is Empty</h2>
                        <p className="text-horizon-light-text-secondary dark:text-horizon-text-secondary">Create a "New Snippet" or save one from a chat to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodeCollectionPage;