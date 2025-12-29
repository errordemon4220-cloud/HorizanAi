

import React from 'react';
import { MemoryProposal } from '../types';
import { BrainCircuitIcon, CheckIcon, XIcon } from './icons';

interface MemoryToastProps {
    proposal: MemoryProposal;
}

const MemoryToast: React.FC<MemoryToastProps> = ({ proposal }) => {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4">
            <div
                className="bg-horizon-light-sidebar/70 dark:bg-horizon-sidebar/70 ui-blur-effect border border-horizon-light-item dark:border-horizon-item rounded-xl shadow-2xl p-4 flex items-center gap-4 animate-fade-in-up"
            >
                <div className="flex-shrink-0 p-2 bg-horizon-accent/20 rounded-full">
                    <BrainCircuitIcon className="w-6 h-6 text-horizon-accent" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-horizon-light-text-primary dark:text-horizon-text-primary">AI wants to remember:</p>
                    <p className="text-sm text-horizon-light-text-secondary dark:text-horizon-text-secondary truncate">"{proposal.text}"</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                    <button
                        onClick={proposal.onSave}
                        className="px-3 py-1.5 bg-horizon-accent text-white rounded-lg text-sm font-semibold hover:bg-horizon-accent-hover transition-colors flex items-center gap-1.5"
                    >
                        <CheckIcon className="w-4 h-4" />
                        Save
                    </button>
                    <button
                        onClick={proposal.onDismiss}
                        className="p-2 rounded-lg text-horizon-light-text-tertiary dark:text-horizon-text-tertiary hover:bg-horizon-light-item-hover dark:hover:bg-horizon-item-hover transition-colors"
                        title="Dismiss"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemoryToast;