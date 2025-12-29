import React from 'react';
import {
    XIcon, KeyboardIcon, NewChatIcon, UsersIcon, BookOpenIcon, ImageIcon, FileCodeIcon,
    ZapIcon, BarChart2Icon, CameraIcon, SearchIcon, BrainCircuitIcon, BookmarkIcon,
    DatabaseIcon, HeartIcon, LightbulbIcon, CogIcon, PanelLeftOpenIcon, SendIcon, CommandIcon, MicIcon
} from './icons';

interface ShortcutsPageProps {
    onCancel: () => void;
}

const Kbd: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <kbd className={`px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-900/50 border border-gray-600/50 rounded-md shadow-sm ${className}`}>
        {children}
    </kbd>
);

const ShortcutItem: React.FC<{ icon: React.ReactNode; keys: React.ReactNode; description: string; style: React.CSSProperties }> = ({ icon, keys, description, style }) => (
    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg animate-fade-in-up" style={style}>
        <div className="flex items-center gap-3">
            <div className="text-horizon-accent">{icon}</div>
            <span className="text-sm text-slate-300">{description}</span>
        </div>
        <div className="flex items-center gap-1">
            {keys}
        </div>
    </div>
);

const ShortcutsPage: React.FC<ShortcutsPageProps> = ({ onCancel }) => {
    const isMac = navigator.userAgent.includes('Mac');

    const shortcutCategories = [
        {
            title: "General",
            shortcuts: [
                { icon: <NewChatIcon className="w-5 h-5" />, key: "N", description: "Start a new chat" },
                { icon: <SearchIcon className="w-5 h-5" />, key: "S", description: "Open search" },
                { icon: <PanelLeftOpenIcon className="w-5 h-5" />, key: "H", description: "Toggle sidebar" },
                { icon: <KeyboardIcon className="w-5 h-5" />, key: "Z", description: "View shortcuts" },
                { icon: <XIcon className="w-5 h-5" />, key: "Esc", description: "Close modal or page" },
                { icon: <SendIcon className="w-5 h-5" />, keys: <><Kbd>{isMac ? <CommandIcon className="w-3 h-3 inline-block" /> : 'Ctrl'}</Kbd><Kbd>Enter</Kbd></>, description: "Send message" },
            ]
        },
        {
            title: "Navigation",
            shortcuts: [
                { icon: <CogIcon className="w-5 h-5" />, key: "U", description: "Open settings" },
                { icon: <BrainCircuitIcon className="w-5 h-5" />, key: "M", description: "Go to Memory" },
                { icon: <BookmarkIcon className="w-5 h-5" />, key: "B", description: "Go to Bookmarks" },
                { icon: <DatabaseIcon className="w-5 h-5" />, key: "Y", description: "Go to Storage" },
            ]
        },
        {
            title: "Creative Tools",
            shortcuts: [
                { icon: <ImageIcon className="w-5 h-5" />, key: "I", description: "Go to Image Generation" },
                { icon: <BookOpenIcon className="w-5 h-5" />, key: "T", description: "Go to Story Writer" },
                { icon: <UsersIcon className="w-5 h-5" />, key: "R", description: "Go to Role Play" },
                { icon: <MicIcon className="w-5 h-5" />, key: "L", description: "Go to Live Talk" },
            ]
        },
        {
            title: "Technical Tools",
            shortcuts: [
                { icon: <FileCodeIcon className="w-5 h-5" />, key: "C", description: "Go to Code Collection" },
                { icon: <ZapIcon className="w-5 h-5" />, key: "W", description: "Go to Workflows" },
                { icon: <BarChart2Icon className="w-5 h-5" />, key: "D", description: "Go to Data Visualizer" },
                { icon: <CameraIcon className="w-5 h-5" />, key: "V", description: "Go to Smart Vision" },
            ]
        },
        {
            title: "18+ Tools",
            shortcuts: [
                { icon: <HeartIcon className="w-5 h-5 text-red-400" />, key: "Q", description: "Go to 18+ Talk" },
                { icon: <HeartIcon className="w-5 h-5" />, key: "J", description: "Go to AI Girlfriends" },
                { icon: <HeartIcon className="w-5 h-5 text-red-400" />, key: "P", description: "Go to Passion Weaver" },
                { icon: <LightbulbIcon className="w-5 h-5 text-red-400" />, key: "K", description: "Go to App Idea Lab" },
                { icon: <ZapIcon className="w-5 h-5 text-red-400" />, key: "O", description: "Go to Object of Desire" },
                { icon: <ZapIcon className="w-5 h-5 text-red-400" />, key: "A", description: "Go to Anatomy Explorer" },
                { icon: <ZapIcon className="w-5 h-5 text-red-400" />, key: "F", description: "Go to 18+ Fun Zone" },
            ]
        }
    ];

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto relative bg-slate-900 text-white">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-blue-600/20 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-indigo-600/20 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <header className="flex items-center justify-between mb-8 flex-shrink-0 relative z-10 animate-fade-in-up">
                <div className="flex items-center space-x-3">
                    <KeyboardIcon className="w-8 h-8 text-horizon-accent" />
                    <h1 className="text-2xl md:text-3xl font-bold">Keyboard Shortcuts</h1>
                </div>
                <button onClick={onCancel} className="px-4 py-2 font-semibold text-slate-300 hover:text-white transition-colors">Back</button>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                {shortcutCategories.map((category, catIndex) => (
                    <div key={category.title} className="space-y-4">
                        <h2 className="text-lg font-semibold text-horizon-accent tracking-wider animate-fade-in-up" style={{ animationDelay: `${100 + catIndex * 100}ms` }}>
                            {category.title}
                        </h2>
                        <div className="space-y-2">
                            {category.shortcuts.map((shortcut, shortIndex) => (
                                <ShortcutItem
                                    key={shortcut.description}
                                    icon={shortcut.icon}
                                    keys={shortcut.keys || <Kbd>{shortcut.key}</Kbd>}
                                    description={shortcut.description}
                                    style={{ animationDelay: `${150 + catIndex * 100 + shortIndex * 40}ms` }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default ShortcutsPage;