
import React, { useState, useEffect } from 'react';
import { Workflow, WorkflowStep, WorkflowStepType } from '../types';
import { ZapIcon, PlusIcon, TrashIcon, GripVerticalIcon } from './icons';

const STEP_TYPE_OPTIONS: { value: WorkflowStepType; label: string }[] = [
    { value: 'generate_text', label: 'Generate Text' },
    { value: 'summarize_text', label: 'Summarize Text' },
    { value: 'research_topic', label: 'Research Topic' },
    { value: 'generate_image', label: 'Generate Image' },
    { value: 'generate_website', label: 'Generate Website' },
    { value: 'generate_slides', label: 'Generate Slides' },
    { value: 'generate_pdf', label: 'Generate PDF' },
];

const StepEditor: React.FC<{
    step: WorkflowStep;
    index: number;
    onUpdate: (index: number, updatedStep: WorkflowStep) => void;
    onDelete: (index: number) => void;
}> = ({ step, index, onUpdate, onDelete }) => {
    const handleChange = (field: keyof WorkflowStep, value: any) => {
        onUpdate(index, { ...step, [field]: value });
    };

    return (
        <div className="bg-black/20 ui-blur-effect border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-white">Step {index + 1}</h3>
                <div className="flex items-center gap-2">
                    <button onClick={() => onDelete(index)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                    <GripVerticalIcon className="w-5 h-5 text-slate-500 cursor-grab" />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="text-sm font-medium text-slate-400">Step Title</label>
                    <input
                        type="text"
                        value={step.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="e.g., 'Draft blog post'"
                        className="mt-1 w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-horizon-accent"
                    />
                </div>
                 <div>
                    <label className="text-sm font-medium text-slate-400">Action</label>
                    <select
                        value={step.type}
                        onChange={(e) => handleChange('type', e.target.value as WorkflowStepType)}
                        className="mt-1 w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-horizon-accent appearance-none"
                    >
                        {STEP_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-slate-400">Prompt Template</label>
                <textarea
                    value={step.promptTemplate}
                    onChange={(e) => handleChange('promptTemplate', e.target.value)}
                    placeholder="Use [INPUT] for this step's input, or [STEP_X_OUTPUT] for a previous step's output."
                    rows={4}
                    className="mt-1 w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-horizon-accent resize-y font-mono text-sm"
                />
                <div className="text-xs text-slate-500 mt-1 space-y-1">
                    <p>Use <code className="bg-slate-700/50 px-1 rounded">[INPUT]</code> for the initial workflow input.</p>
                    <p>Use <code className="bg-slate-700/50 px-1 rounded">[STEP_1_OUTPUT]</code>, <code className="bg-slate-700/50 px-1 rounded">[STEP_2_OUTPUT]</code>, etc. to use the output from a previous step.</p>
                </div>
            </div>
        </div>
    );
};


const WorkflowEditorPage: React.FC<{
    workflow: Workflow | null;
    onSave: (workflow: Omit<Workflow, 'id'> & { id?: string }) => void;
    onCancel: () => void;
}> = ({ workflow, onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [initialInputLabel, setInitialInputLabel] = useState('');
    const [steps, setSteps] = useState<WorkflowStep[]>([]);

    useEffect(() => {
        if (workflow) {
            setName(workflow.name);
            setDescription(workflow.description);
            setInitialInputLabel(workflow.initialInputLabel);
            setSteps(workflow.steps);
        } else {
            // Default for a new workflow
            setName('');
            setDescription('');
            setInitialInputLabel('Initial Topic');
            setSteps([{ id: `step-${Date.now()}`, type: 'generate_text', title: 'First Step', promptTemplate: 'Write something about: [INPUT]' }]);
        }
    }, [workflow]);

    const handleUpdateStep = (index: number, updatedStep: WorkflowStep) => {
        setSteps(prev => prev.map((s, i) => i === index ? updatedStep : s));
    };

    const handleAddStep = () => {
        setSteps(prev => [...prev, { id: `step-${Date.now()}`, type: 'generate_text', title: `Step ${steps.length + 1}`, promptTemplate: '' }]);
    };

    const handleDeleteStep = (index: number) => {
        if (steps.length > 1) {
            setSteps(prev => prev.filter((_, i) => i !== index));
        } else {
            alert("A workflow must have at least one step.");
        }
    };
    
    // Note: Drag-and-drop for reordering is complex without a library, so it's omitted for this implementation.

    const handleSave = () => {
        if (!name.trim()) return alert("Workflow Name is required.");
        if (steps.length === 0) return alert("Workflow must have at least one step.");
        
        onSave({
            id: workflow?.id,
            name,
            description,
            initialInputLabel: initialInputLabel || 'Initial Input',
            steps,
        });
    };

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto text-white">
            <header className="flex items-center justify-between mb-8 flex-shrink-0 animate-fade-in-up">
                <div className="flex items-center space-x-3">
                    <ZapIcon className="w-8 h-8 text-horizon-accent" />
                    <h1 className="text-2xl md:text-3xl font-bold">{workflow ? 'Edit Workflow' : 'New Workflow'}</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={onCancel} className="px-4 py-2 font-semibold text-slate-300 hover:text-white">Cancel</button>
                    <button onClick={handleSave} className="px-5 py-2 bg-horizon-accent text-white rounded-lg font-semibold hover:brightness-110">Save Workflow</button>
                </div>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Left Panel: Main Details --- */}
                <div className="lg:col-span-1 space-y-6 animate-fade-in-up" style={{animationDelay: '100ms'}}>
                     <div className="bg-black/20 ui-blur-effect border border-white/10 rounded-xl p-4 space-y-4">
                         <h2 className="font-semibold text-lg">Details</h2>
                         <div>
                            <label className="text-sm font-medium text-slate-400">Workflow Name *</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Blog Post Generator" className="mt-1 w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-horizon-accent" />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-slate-400">Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this workflow do?" rows={3} className="mt-1 w-full bg-black/20 border border-white/10 rounded-lg p-2 resize-y focus:outline-none focus:ring-1 focus:ring-horizon-accent" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-400">Initial Input Label</label>
                            <input type="text" value={initialInputLabel} onChange={e => setInitialInputLabel(e.target.value)} placeholder="e.g., Enter blog topic" className="mt-1 w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-horizon-accent" />
                        </div>
                     </div>
                </div>

                {/* --- Right Panel: Steps --- */}
                <div className="lg:col-span-2 space-y-4 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                    <h2 className="font-semibold text-lg">Steps</h2>
                    {steps.map((step, index) => (
                        <StepEditor key={step.id} step={step} index={index} onUpdate={handleUpdateStep} onDelete={handleDeleteStep} />
                    ))}
                    <button onClick={handleAddStep} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-white/20 text-slate-300 rounded-xl hover:bg-white/10 hover:border-solid hover:border-horizon-accent hover:text-white transition-all">
                        <PlusIcon className="w-5 h-5"/> Add Step
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkflowEditorPage;
