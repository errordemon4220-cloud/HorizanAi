import React, { useState, useRef, useEffect } from 'react';
import { Workflow } from '../types';
import { ZapIcon, PlusIcon, MoreVerticalIcon, TrashIcon, PencilIcon, PlayIcon, ImageIcon } from './icons';

// Using the same card style as GemsListPage
const WorkflowCard: React.FC<{
    workflow: Workflow;
    onRun: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onEditCardBackground: () => void;
    style: React.CSSProperties;
}> = ({ workflow, onRun, onEdit, onDelete, onEditCardBackground, style }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div style={style} className="opacity-0 animate-fade-in-up cursor-default">
            <div className="liquid-glass-card group relative aspect-[4/5] rounded-2xl">
                {workflow.cardImageUrl && (
                    <div 
                        className="absolute inset-0 bg-cover bg-center rounded-2xl transition-all duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${workflow.cardImageUrl})` }}
                    />
                )}
                <div className="liquid-glass--bend"></div>
                <div className="liquid-glass--face" style={{ backgroundColor: workflow.cardImageUrl ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.02)'}}></div>
                <div className="liquid-glass--edge"></div>
                <div className="relative w-full h-full p-6 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start [transform:translateZ(20px)]">
                        <div className="p-3 bg-horizon-accent/10 rounded-lg text-horizon-accent">
                            <ZapIcon className="w-6 h-6"/>
                        </div>
                        <div ref={menuRef} className="relative">
                             <button onClick={() => setIsMenuOpen(p => !p)} className="p-2 text-horizon-text-tertiary bg-white/10 rounded-full hover:text-white backdrop-blur-sm">
                                <MoreVerticalIcon className="w-5 h-5" />
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-horizon-item/80 ui-blur-effect border border-white/5 rounded-md shadow-lg z-20 p-1">
                                    <button onClick={onEdit} className="flex items-center w-full px-3 py-2 text-sm text-horizon-text-primary hover:bg-horizon-item-hover rounded-md">
                                        <PencilIcon className="w-4 h-4 mr-3" /> Edit
                                    </button>
                                    <button onClick={onEditCardBackground} className="flex items-center w-full px-3 py-2 text-sm text-horizon-text-primary hover:bg-horizon-item-hover rounded-md">
                                        <ImageIcon className="w-4 h-4 mr-3" /> Set Background
                                    </button>
                                    <button onClick={onDelete} className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-horizon-item-hover rounded-md">
                                        <TrashIcon className="w-4 h-4 mr-3" /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="[transform:translateZ(30px)]">
                        <h2 className="text-xl font-bold text-horizon-text-primary truncate">{workflow.name}</h2>
                        <p className="mt-1 text-sm text-horizon-text-secondary h-10 overflow-hidden text-ellipsis">{workflow.description}</p>
                    </div>

                    <button onClick={onRun} className="flex items-center justify-center gap-2 w-full py-3 bg-horizon-accent rounded-lg text-white font-semibold hover:brightness-110 transition-all active:scale-95 [transform:translateZ(20px)]">
                        <PlayIcon className="w-5 h-5"/> Run Workflow
                    </button>
                </div>
            </div>
        </div>
    );
};


const NewWorkflowCard: React.FC<{ onClick: () => void; style: React.CSSProperties }> = ({ onClick, style }) => (
    <button onClick={onClick} style={style} className="opacity-0 animate-fade-in-up group w-full">
        <div className="liquid-glass-card relative aspect-[4/5] rounded-2xl transition-transform duration-300 group-hover:scale-105">
            <div className="liquid-glass--bend"></div>
            <div className="liquid-glass--face"></div>
            <div className="liquid-glass--edge"></div>
            <div className="relative w-full h-full p-6 flex flex-col items-center justify-center text-center z-10">
                <div className="[transform:translateZ(30px)] transition-transform duration-300 group-hover:scale-110">
                    <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white/5 border border-white/10 transition-colors duration-300 group-hover:bg-horizon-accent/10 group-hover:border-horizon-accent/50">
                        <PlusIcon className="w-10 h-10 text-horizon-text-tertiary transition-colors duration-300 group-hover:text-horizon-accent" />
                    </div>
                </div>
                <p className="mt-4 font-semibold text-horizon-text-secondary group-hover:text-horizon-text-primary [transform:translateZ(20px)] transition-colors duration-300">New Workflow</p>
            </div>
        </div>
    </button>
);

interface WorkflowListPageProps {
    workflows: Workflow[];
    onNew: () => void;
    onEdit: (workflow: Workflow) => void;
    onDelete: (workflowId: string) => void;
    onRun: (workflow: Workflow) => void;
    onEditCardBackground: (workflow: Workflow) => void;
}

const WorkflowListPage: React.FC<WorkflowListPageProps> = ({ workflows, onNew, onEdit, onDelete, onRun, onEditCardBackground }) => {
    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto relative">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                 <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-teal-500/20 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                 <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-sky-500/20 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <div className="relative z-10">
                <header className="mb-8 text-center animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
                        Workflows
                    </h1>
                    <p className="mt-3 text-lg text-horizon-text-secondary">Automate your multi-step tasks with chained AI actions.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <NewWorkflowCard onClick={onNew} style={{ animationDelay: '0ms' }} />
                    {workflows.map((wf, index) => (
                        <WorkflowCard 
                            key={wf.id}
                            workflow={wf}
                            onRun={() => onRun(wf)}
                            onEdit={() => onEdit(wf)}
                            onDelete={() => onDelete(wf.id)}
                            onEditCardBackground={() => onEditCardBackground(wf)}
                            style={{ animationDelay: `${(index + 1) * 100}ms` }}
                        />
                    ))}
                </div>

                 {workflows.length === 0 && (
                    <div className="col-span-full mt-8 text-center py-16 px-6 bg-horizon-sidebar/50 ui-blur-effect rounded-xl border border-dashed border-horizon-item">
                        <h2 className="text-xl font-semibold text-horizon-text-primary mb-2">No Workflows Yet</h2>
                        <p className="text-horizon-text-secondary">Click "New Workflow" to automate your first task.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkflowListPage;