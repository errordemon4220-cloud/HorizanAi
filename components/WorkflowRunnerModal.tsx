import React, { useState } from 'react';
import { WorkflowExecutionState, Workflow } from '../types';
import { XIcon, PlayIcon, ZapIcon, CheckCircleIcon, AlertTriangleIcon, ImageIcon as ImgIcon, LoaderIcon } from './icons';

const StepResult: React.FC<{
    step: any; // Simplified, assuming it has a title
    result: any; // Simplified, has output and outputType
    status: 'completed' | 'running' | 'pending';
}> = ({ step, result, status }) => {
    return (
        <div className="bg-black/20 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                 <h4 className="font-semibold text-white">{step.title}</h4>
                {status === 'completed' && <CheckCircleIcon className="w-5 h-5 text-green-400" />}
                {status === 'running' && <LoaderIcon className="w-5 h-5 text-horizon-accent animate-spin" />}
                {status === 'pending' && <div className="w-5 h-5 border-2 border-slate-600 rounded-full"></div>}
            </div>
            {result && (
                 <div className="text-sm text-slate-300 max-h-40 overflow-y-auto bg-black/20 p-2 rounded-md">
                    {result.outputType === 'image' ? (
                        <img src={result.output} alt="Generated image" className="max-w-full rounded-md" />
                    ) : (
                        <pre className="whitespace-pre-wrap font-sans">{result.output}</pre>
                    )}
                 </div>
            )}
        </div>
    );
};


const WorkflowRunnerModal: React.FC<{
    executionState: WorkflowExecutionState;
    onRun: (workflow: Workflow, initialInput: string) => void;
    onClose: () => void;
}> = ({ executionState, onRun, onClose }) => {
    const { workflow, isRunning, results, error, currentStepIndex } = executionState;
    const [initialInput, setInitialInput] = useState(executionState.initialInput || '');

    if (!workflow) return null;

    const handleRunClick = () => {
        if (workflow && initialInput.trim()) {
            onRun(workflow, initialInput.trim());
        }
    };

    const isFinished = !isRunning && results.length === workflow.steps.length;

    return (
        <div className="fixed inset-0 bg-black/60 ui-blur-effect flex items-center justify-center z-50 animate-fade-in-up" onClick={onClose}>
            <div 
                className="bg-horizon-sidebar/80 ui-blur-effect border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col gap-4" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ZapIcon className="w-6 h-6 text-horizon-accent"/>
                        <h2 className="text-xl font-bold text-white">{workflow.name}</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-white/10">
                        <XIcon className="w-5 h-5" />
                    </button>
                </header>

                <div className="space-y-4 flex-shrink-0">
                    <div>
                        <label className="text-sm font-medium text-slate-400">{workflow.initialInputLabel || 'Initial Input'}</label>
                        <input
                            type="text"
                            value={initialInput}
                            onChange={e => setInitialInput(e.target.value)}
                            placeholder="Enter the starting value for the workflow..."
                            className="mt-1 w-full bg-black/20 border border-white/10 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-horizon-accent"
                            disabled={isRunning || results.length > 0}
                        />
                    </div>
                     {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 rounded-lg flex items-start gap-2">
                            <AlertTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold">An error occurred</h4>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}
                    {isFinished && (
                         <div className="bg-green-500/10 border border-green-500/30 text-green-300 text-sm p-3 rounded-lg flex items-center gap-2">
                            <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                            <p className="font-semibold">Workflow completed successfully!</p>
                        </div>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {workflow.steps.map((step, index) => (
                        <StepResult
                            key={step.id}
                            step={step}
                            result={results.find(r => r.stepId === step.id)}
                            status={
                                index < currentStepIndex || isFinished ? 'completed' :
                                index === currentStepIndex && isRunning ? 'running' :
                                'pending'
                            }
                        />
                    ))}
                </div>

                <div className="pt-4 border-t border-white/20">
                     <button
                        onClick={handleRunClick}
                        disabled={!initialInput.trim() || isRunning || results.length > 0}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-horizon-accent text-white rounded-lg font-semibold hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRunning ? (
                             <><LoaderIcon className="w-5 h-5 animate-spin"/> Running...</>
                        ) : (
                             <><PlayIcon className="w-5 h-5"/> Run Workflow</>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default WorkflowRunnerModal;
