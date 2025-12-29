import React from 'react';
import { SmartSuggestion } from '../types';
import { LightbulbIcon, CheckIcon, XIcon } from './icons';

interface SmartSuggestionToastProps {
    suggestion: SmartSuggestion;
    onAction: (suggestion: SmartSuggestion) => void;
    onDismiss: () => void;
}

const SmartSuggestionToast: React.FC<SmartSuggestionToastProps> = ({ suggestion, onAction, onDismiss }) => {
    return (
        <div className="fixed bottom-6 inset-x-0 w-full flex justify-center z-50 px-4 pointer-events-none">
            <div
                className="pointer-events-auto bg-horizon-sidebar/70 ui-blur-effect border border-horizon-item rounded-xl shadow-2xl p-4 flex items-center gap-4 animate-fade-in-up w-full max-w-lg"
            >
                <div className="flex-shrink-0 p-2 bg-horizon-accent/20 rounded-full">
                    <LightbulbIcon className="w-6 h-6 text-horizon-accent animate-pulse" style={{ animationDuration: '3s' }}/>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-horizon-light-text-primary dark:text-horizon-text-primary">Horizon Helper</p>
                    <p className="text-sm text-horizon-light-text-secondary dark:text-horizon-text-secondary truncate">"{suggestion.suggestionText}"</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                    <button
                        onClick={() => onAction(suggestion)}
                        className="px-3 py-1.5 bg-horizon-accent text-white rounded-lg text-sm font-semibold hover:bg-horizon-accent-hover transition-colors flex items-center gap-1.5"
                    >
                        <CheckIcon className="w-4 h-4" />
                        {suggestion.actionButtonText}
                    </button>
                    <button
                        onClick={onDismiss}
                        className="p-2 rounded-lg text-horizon-light-text-tertiary dark:text-horizon-text-tertiary hover:bg-horizon-item-hover transition-colors"
                        title="Dismiss"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SmartSuggestionToast;