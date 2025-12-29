
import React from 'react';
import { PassionWeaverStory } from '../types';
import { PlusIcon, HeartIcon, TrashIcon, PencilIcon } from './icons';

const StoryCard: React.FC<{
    story: PassionWeaverStory;
    onContinue: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    style: React.CSSProperties;
}> = ({ story, onContinue, onEdit, onDelete, style }) => (
    <div style={style} className="opacity-0 animate-fade-in-up">
        <div onClick={() => onContinue(story.id)} className="group relative aspect-[4/5] rounded-2xl w-full text-left bg-black/30 p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-rose-500/20 hover:-translate-y-1 border border-rose-400/10 hover:border-rose-400/30">
             <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
             <div className="absolute inset-0 bg-black/20"></div>

            <div className="relative z-10 flex justify-between items-start">
                 <HeartIcon className="w-8 h-8 text-rose-400/70" />
                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(story.id); }}
                        className="p-2 bg-black/40 rounded-full text-slate-300 hover:bg-slate-600 hover:text-white"
                        title="Edit Story Setup"
                    >
                        <PencilIcon className="w-4 h-4"/>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(story.id); }}
                        className="p-2 bg-black/40 rounded-full text-slate-300 hover:bg-red-500/80 hover:text-white"
                        title="Delete Story"
                    >
                        <TrashIcon className="w-4 h-4"/>
                    </button>
                 </div>
            </div>
            <div className="relative z-10">
                <h3 className="font-bold text-lg text-rose-100 truncate pr-4">{story.title}</h3>
                <p className="text-xs text-rose-200/60 mt-1">Last updated: {new Date(story.lastUpdatedAt).toLocaleDateString()}</p>
            </div>
        </div>
    </div>
);


const NewStoryCard: React.FC<{ onClick: () => void; style: React.CSSProperties }> = ({ onClick, style }) => (
    <button onClick={onClick} style={style} className="opacity-0 animate-fade-in-up group w-full text-left">
        <div className="aspect-[4/5] rounded-2xl flex flex-col items-center justify-center text-center border-2 border-dashed border-rose-300/20 hover:border-rose-300/40 hover:bg-rose-500/5 transition-all duration-300">
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white/5 border border-white/10 transition-colors duration-300 group-hover:bg-rose-500/10 group-hover:border-rose-500/50">
                <PlusIcon className="w-10 h-10 text-rose-300/70 transition-colors duration-300 group-hover:text-rose-300" />
            </div>
            <p className="mt-4 font-semibold text-rose-200/80 group-hover:text-rose-200 transition-colors duration-300">New Story</p>
        </div>
    </button>
);


interface PassionWeaverPageProps {
    stories: PassionWeaverStory[];
    onNew: () => void;
    onContinue: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const PassionWeaverPage: React.FC<PassionWeaverPageProps> = ({ stories, onNew, onContinue, onEdit, onDelete }) => {
    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto relative bg-[var(--gf-bg)]">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-rose-900/50 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-purple-900/40 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <header className="text-center mb-8 animate-fade-in-up relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-400" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    Passion Weaver
                </h1>
                <p className="mt-3 text-lg text-rose-200/80">Your library of intimate tales.</p>
            </header>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                <NewStoryCard onClick={onNew} style={{ animationDelay: '0ms' }} />
                {stories.map((story, index) => (
                    <StoryCard
                        key={story.id}
                        story={story}
                        onContinue={onContinue}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        style={{ animationDelay: `${(index + 1) * 100}ms` }}
                    />
                ))}
            </div>
            
            {stories.length === 0 && (
                 <div className="mt-8 text-center text-rose-200/60 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                    <p>No stories yet. Click "New Story" to begin weaving your first tale.</p>
                </div>
            )}
        </div>
    );
};

export default PassionWeaverPage;
