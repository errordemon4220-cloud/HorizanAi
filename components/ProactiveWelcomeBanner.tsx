import React from 'react';
import { LightbulbIcon, XIcon } from './icons';

interface ProactiveWelcomeBannerProps {
    suggestion: string;
    onDismiss: () => void;
}

const ProactiveWelcomeBanner: React.FC<ProactiveWelcomeBannerProps> = ({ suggestion, onDismiss }) => {
    return (
        <div className="relative mb-6">
            <div className="bg-horizon-item/50 ui-blur-effect border border-horizon-accent/30 rounded-xl p-4 animate-fade-in-up shadow-lg shadow-horizon-accent/10">
                <button
                    onClick={onDismiss}
                    className="absolute top-2 right-2 p-1.5 rounded-full text-horizon-text-tertiary hover:bg-white/10"
                    title="Dismiss"
                >
                    <XIcon className="w-5 h-5" />
                </button>
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 bg-horizon-accent/20 rounded-full mt-1">
                        <LightbulbIcon className="w-6 h-6 text-horizon-accent" />
                    </div>
                    <div>
                        <h3 className="font-bold text-horizon-text-primary">Welcome Back!</h3>
                        <p className="text-sm text-horizon-text-secondary mt-1 whitespace-pre-wrap">{suggestion}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProactiveWelcomeBanner;
