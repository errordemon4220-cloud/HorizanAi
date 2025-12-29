import React from 'react';
import { MaximizeIcon, MinimizeIcon } from './icons';

interface CinemaModeFABProps {
    isCinemaMode: boolean;
    onToggle: () => void;
}

const CinemaModeFAB: React.FC<CinemaModeFABProps> = ({ isCinemaMode, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full flex items-center justify-center
                       bg-horizon-light-sidebar/50 dark:bg-horizon-sidebar/50
                       backdrop-blur-md border border-white/10
                       text-horizon-light-text-primary dark:text-horizon-text-primary
                       hover:border-horizon-accent focus:border-horizon-accent
                       shadow-lg transition-all duration-300 hover:scale-110"
            title={isCinemaMode ? "Show UI" : "Hide UI (Cinema Mode)"}
        >
            {isCinemaMode ? <MinimizeIcon className="w-7 h-7" /> : <MaximizeIcon className="w-7 h-7" />}
        </button>
    );
};

export default CinemaModeFAB;
