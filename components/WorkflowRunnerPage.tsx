import React, { useState, useMemo } from 'react';
import { WorkflowExecutionState, Workflow, WorkflowExecutionResult } from '../types';
import { XIcon, PlayIcon, ZapIcon, CheckCircleIcon, AlertTriangleIcon, LoaderIcon, DownloadIcon } from './icons';
import { downloadFile } from '../services/fileService';

const SimpleSlideViewer: React.FC<{ slides: { title: string, content: string }[] }> = ({ slides }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!slides || slides.length === 0) return <p className="text-slate-400">No slide content.</p>;

    const currentSlide = slides[currentIndex];

    return (
        <div className="flex flex-col h-full bg-slate-900/50 rounded-lg p-6">
            <div className="flex-1 flex flex-col justify-center items-center text-center">
                <h3 className="text-2xl font-bold text-white mb-4">{currentSlide.title}</h3>
                <p className="whitespace-pre-wrap text-slate-300">{currentSlide.content}</p>
            </div>
            <div className="flex-shrink-0 flex items-center justify-between text-sm text-slate-400 pt-4">
                <button onClick={() => setCurrentIndex(p => Math.max(0, p - 1))} disabled={currentIndex === 0} className="px-3 py-1 rounded-md hover:bg-white/10 disabled:opacity-50">Prev</button>
                <span>{currentIndex + 1} / {slides.length}</span>
                <button onClick={() => setCurrentIndex(p => Math.min(slides.length - 1, p + 1))} disabled={currentIndex === slides.length - 1} className="px-3 py-1 rounded-md hover:bg-white/10 disabled:opacity-50">Next</button>
            </div>
        </div>
    );
};

const OutputViewer: React.FC<{ result: WorkflowExecutionResult | undefined }> = ({ result }) => {
    if (!result) {
        return (
            <div className="flex items-center justify-center h-full text-center text-slate-400">
                <p>Select a completed step to view its output.</p>
            </div>
        );
    }
    
    const renderContent = () => {
        switch(result.outputType) {
            case 'text':
            case 'pdf': // For PDF, we show the raw text and rely on download
                return <pre className="whitespace-pre-wrap font-sans text-slate-200">{result.output}</pre>;
            case 'image':
                return <img src={result.output} alt="Generated image" className="max-w-full max-h-full object-contain mx-auto rounded-lg"/>;
            case 'website':
                return <iframe srcDoc={result.output} title="Website Preview" className="w-full h-full border-0 bg-white rounded-lg shadow-inner" sandbox="allow-scripts"/>;
            case 'slides':
                 try {
                    const slides = JSON.parse(result.output);
                    return <SimpleSlideViewer slides={slides} />;
                } catch {
                    return <p className="text-red-400">Error: Could not parse slide data.</p>;
                }
            default:
                return <p className="text-slate-400">Unsupported output type.</p>
        }
    };

    return (
        <div className="w-full h-full p-2 bg-black/20 rounded-lg">
           {renderContent()}
        </div>
    );
};

interface WorkflowRunnerPageProps {
    executionState: WorkflowExecutionState;
    onRun: (workflow: Workflow, initialInput: string) => void;
    onClose: () => void;
    onUpdateState: React.Dispatch<React.SetStateAction<WorkflowExecutionState>>;
}

const WorkflowRunnerPage: React.FC<WorkflowRunnerPageProps> = ({ executionState, onRun, onClose, onUpdateState }) => {
    const { workflow, isRunning, results, error, currentStepIndex, activeOutputStepId } = executionState;
    const [initialInput, setInitialInput] = useState(executionState.initialInput || '');
    
    if (!workflow) return null;

    const handleRunClick = () => {
        if (workflow && initialInput.trim()) {
            onRun(workflow, initialInput.trim());
        }
    };
    
    const handleDownload = (result: WorkflowExecutionResult) => {
        downloadFile(result.output, result.outputType, result.fileName || 'workflow-output');
    }

    const isFinished = !isRunning && results.length === workflow.steps.length;
    const activeResult = results.find(r => r.stepId === activeOutputStepId);
    const activeStep = workflow.steps.find(s => s.id === activeOutputStepId);

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-hidden text-white bg-slate-900">
            <header className="flex items-center justify-between mb-6 flex-shrink-0 animate-fade-in-up">
                <div className="flex items-center space-x-3">
                    <ZapIcon className="w-8 h-8 text-horizon-accent" />
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">{workflow.name}</h1>
                        <p className="text-sm text-slate-400">{workflow.description}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={onClose} className="px-4 py-2 font-semibold text-slate-300 hover:text-white">Close Runner</button>
                </div>
            </header>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
                {/* --- Left Panel: Steps & Controls --- */}
                <div className="lg:col-span-1 flex flex-col space-y-4 animate-fade-in-up" style={{animationDelay: '100ms'}}>
                     <div className="bg-black/20 ui-blur-effect border border-white/10 rounded-xl p-4 space-y-4">
                         <h2 className="font-semibold text-lg">Input</h2>
                         <div>
                            <label className="text-sm font-medium text-slate-400">{workflow.initialInputLabel || 'Initial Input'}</label>
                            <textarea value={initialInput} onChange={e => setInitialInput(e.target.value)} placeholder="Enter the starting value for the workflow..." rows={3} className="mt-1 w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-horizon-accent resize-y" disabled={isRunning || results.length > 0} />
                        </div>
                         <button onClick={handleRunClick} disabled={!initialInput.trim() || isRunning || results.length > 0} className="w-full flex items-center justify-center gap-2 py-3 bg-horizon-accent text-white rounded-lg font-semibold hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isRunning ? <><LoaderIcon className="w-5 h-5 animate-spin"/> Running...</> : <><PlayIcon className="w-5 h-5"/> Run Workflow</>}
                        </button>
                     </div>
                     <div className="flex-1 flex flex-col bg-black/20 ui-blur-effect border border-white/10 rounded-xl overflow-hidden">
                        <h2 className="font-semibold text-lg p-4 border-b border-white/10">Steps</h2>
                        <div className="overflow-y-auto p-2 space-y-1">
                            {workflow.steps.map((step, index) => {
                                const status = index < currentStepIndex || isFinished ? 'completed' : index === currentStepIndex && isRunning ? 'running' : 'pending';
                                const hasResult = results.some(r => r.stepId === step.id);
                                return (
                                <button key={step.id} onClick={() => hasResult && onUpdateState(p => ({...p, activeOutputStepId: step.id}))} disabled={!hasResult} className={`w-full text-left flex items-center gap-3 p-3 rounded-md transition-colors ${activeOutputStepId === step.id ? 'bg-horizon-accent/20' : 'hover:bg-white/5 disabled:hover:bg-transparent'}`}>
                                    {status === 'completed' && <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />}
                                    {status === 'running' && <LoaderIcon className="w-5 h-5 text-horizon-accent animate-spin flex-shrink-0" />}
                                    {status === 'pending' && <div className="w-5 h-5 border-2 border-slate-600 rounded-full flex-shrink-0"></div>}
                                    <span className="truncate">{step.title}</span>
                                </button>
                                );
                            })}
                        </div>
                     </div>
                </div>

                {/* --- Right Panel: Output --- */}
                <div className="lg:col-span-2 flex flex-col space-y-4 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                    <div className="flex-shrink-0 flex items-center justify-between bg-black/20 ui-blur-effect border border-white/10 rounded-xl p-3">
                        <h2 className="font-semibold text-lg truncate pr-4">Output: <span className="text-slate-300">{activeStep?.title || 'Select a step'}</span></h2>
                        {activeResult && (
                             <button onClick={() => handleDownload(activeResult)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-600 text-white rounded-md text-sm font-semibold hover:bg-slate-500 transition-colors">
                                <DownloadIcon className="w-4 h-4" /> Download
                            </button>
                        )}
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
                    <div className="flex-1 min-h-0">
                        <OutputViewer result={activeResult} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkflowRunnerPage;
