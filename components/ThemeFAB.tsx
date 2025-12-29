import React, { useState, useEffect, useRef } from 'react';
import { PaintbrushIcon, SunIcon, MoonIcon, CogIcon, ContrastIcon } from './icons';

type AppTheme = 'light' | 'dark' | 'system';

interface ThemeFABProps {
    theme: AppTheme;
    onSetTheme: (theme: AppTheme) => void;
    onOpenCustomize: () => void;
}

const ThemeFAB: React.FC<ThemeFABProps> = ({ theme, onSetTheme, onOpenCustomize }) => {
    const [isOpen, setIsOpen] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuItems = [
        { theme: 'light', icon: <SunIcon className="w-6 h-6" />, label: 'Light' },
        { theme: 'dark', icon: <MoonIcon className="w-6 h-6" />, label: 'Dark' },
        { theme: 'system', icon: <ContrastIcon className="w-6 h-6" />, label: 'System' },
    ];

    return (
        <div ref={fabRef} className="fixed bottom-6 right-6 z-40">
            <div className="relative flex flex-col items-center gap-3">
                {/* Expanded Menu */}
                <div
                    className={`
                        flex flex-col gap-3 p-2.5 rounded-full
                        bg-horizon-light-sidebar/80 dark:bg-horizon-sidebar/80
                        backdrop-blur-md border border-horizon-light-item dark:border-horizon-item
                        transition-all duration-300 ease-in-out
                        ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
                    `}
                >
                    {menuItems.map(item => (
                        <button
                            key={item.theme}
                            onClick={() => {
                                onSetTheme(item.theme as AppTheme);
                                setIsOpen(false);
                            }}
                            title={item.label}
                            className={`p-2 rounded-full transition-colors ${
                                theme === item.theme
                                    ? 'bg-horizon-accent text-white'
                                    : 'text-horizon-light-text-secondary dark:text-horizon-text-secondary hover:bg-horizon-light-item-hover dark:hover:bg-horizon-item'
                            }`}
                        >
                            {item.icon}
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            onOpenCustomize();
                            setIsOpen(false);
                        }}
                        title="Customize Theme"
                        className="p-2 rounded-full text-horizon-light-text-secondary dark:text-horizon-text-secondary hover:bg-horizon-light-item-hover dark:hover:bg-horizon-item transition-colors"
                    >
                        <CogIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Main FAB Trigger */}
                <button
                    onClick={() => setIsOpen(prev => !prev)}
                    className={`
                        w-14 h-14 rounded-full flex items-center justify-center
                        bg-horizon-light-sidebar/80 dark:bg-horizon-sidebar/80
                        backdrop-blur-md border border-horizon-light-item dark:border-horizon-item
                        text-horizon-light-text-primary dark:text-horizon-text-primary
                        hover:border-horizon-accent focus:border-horizon-accent
                        shadow-lg transition-transform duration-300
                        ${isOpen ? 'rotate-90' : 'rotate-0'}
                    `}
                    aria-label="Toggle theme and settings menu"
                >
                    <PaintbrushIcon className="w-7 h-7" />
                </button>
            </div>
        </div>
    );
};

export default ThemeFAB;
