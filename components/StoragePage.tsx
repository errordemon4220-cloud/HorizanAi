
import React, { useState, useEffect } from 'react';
import { HardDriveIcon, MessageSquareIcon, BrainCircuitIcon, ImageIcon, FileCodeIcon, ZapIcon, TrashIcon, AlertTriangleIcon, RefreshCwIcon, CogIcon } from './icons';
import { StorageInfo, StorageStats } from '../types';


interface StoragePageProps {
    storageInfo: StorageInfo;
    storageStats: StorageStats;
    onClearCategory: (category: 'sessions' | 'images' | 'code' | 'workflows') => void;
    onClearAllData: () => void;
    onCancel: () => void;
    onRefresh: () => void;
}

const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const StorageBar: React.FC<{ usage: number; quota: number }> = ({ usage, quota }) => {
    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        const calculatedPercentage = quota > 0 ? (usage / quota) * 100 : 0;
        // Animate the bar width
        setTimeout(() => setPercentage(calculatedPercentage), 100);
    }, [usage, quota]);

    const getBarColor = (p: number) => {
        if (p > 90) return 'bg-red-500';
        if (p > 70) return 'bg-yellow-500';
        return 'bg-horizon-accent';
    };

    return (
        <div className="w-full bg-black/30 rounded-full h-4 overflow-hidden border border-white/10">
            <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(percentage)}`}
                style={{ width: `${percentage}%`, boxShadow: `0 0 15px var(--horizon-accent-hover)` }}
            ></div>
        </div>
    );
};


const CategoryBreakdownItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    count: number;
    size: number;
    percentage: number;
    colorHex: string;
    style: React.CSSProperties;
}> = ({ icon, label, count, size, percentage, colorHex, style }) => {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        setTimeout(() => setWidth(percentage), 100);
    }, [percentage]);

    return (
        <div style={style} className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-1.5">
                <div className="text-slate-400">{icon}</div>
                <span className="font-semibold text-sm text-white">{label}</span>
                <span className="text-xs text-slate-500">({count} items)</span>
                <span className="ml-auto font-mono text-sm text-white">{formatBytes(size)}</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-1.5">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${width}%`, backgroundColor: colorHex, boxShadow: `0 0 8px ${colorHex}` }}
                ></div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; count: number; size: number; style: React.CSSProperties; }> = ({ icon, label, count, size, style }) => (
    <div style={style} className="animate-fade-in-up">
        <div className="group relative p-4 bg-black/20 ui-blur-effect border border-white/10 rounded-xl transition-all duration-300 hover:border-horizon-accent/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-horizon-accent/10">
            <div className="absolute inset-0 overflow-hidden rounded-xl">
                 <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:animate-holographic-glare pointer-events-none z-0"></div>
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 text-slate-400 group-hover:text-horizon-accent transition-colors">
                    {icon}
                    <span className="text-sm font-semibold">{label}</span>
                </div>
                <p className="text-4xl font-bold text-white mt-2">{count}</p>
                <p className="text-xs text-slate-500 font-mono mt-1">{formatBytes(size)}</p>
            </div>
        </div>
    </div>
);

const ActionButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex justify-between items-center p-3 bg-black/20 rounded-lg hover:bg-red-500/20 group transition-colors"
    >
        <span className="font-semibold text-sm">{label}</span>
        <TrashIcon className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
    </button>
);

const DeleteAllModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    const [confirmationText, setConfirmationText] = useState('');
    const canDelete = confirmationText === 'DELETE';

    useEffect(() => {
        if (isOpen) {
            setConfirmationText('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 ui-blur-effect z-50 flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-slate-900 border border-red-500/50 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                    <AlertTriangleIcon className="w-8 h-8 text-red-400" />
                    <h2 className="text-2xl font-bold text-red-300">Delete All Data</h2>
                </div>
                <p className="text-slate-300">This action is irreversible. All your chats, custom AIs, images, and settings will be permanently deleted. This will effectively reset the application to its initial state.</p>
                <p className="text-slate-300">To confirm, please type <strong className="text-red-300 font-mono">DELETE</strong> in the box below.</p>
                <input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-center focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                    onClick={onConfirm}
                    disabled={!canDelete}
                    className="w-full p-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                >
                    Permanently Delete Everything
                </button>
            </div>
        </div>
    );
};


const StoragePage: React.FC<StoragePageProps> = ({ storageInfo, storageStats, onClearCategory, onClearAllData, onCancel, onRefresh }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { usage, quota, breakdown } = storageInfo;

    // Explicitly cast to any then number to avoid unknown type errors from strict TS checks
    const snippetsCount = (storageStats as any).snippets as number;
    const workflowsCount = (storageStats as any).workflows as number;
    const totalCodeWorkflows = snippetsCount + workflowsCount;

    const breakdownItems = [
        { icon: <MessageSquareIcon className="w-5 h-5"/>, label: 'Chats & Messages', count: storageStats.sessions, size: breakdown.sessions, color: '#38bdf8' },
        { icon: <BrainCircuitIcon className="w-5 h-5"/>, label: 'Gems & Memory', count: storageStats.gems, size: breakdown.profilesAndMemories, color: '#a78bfa' },
        { icon: <ImageIcon className="w-5 h-5"/>, label: 'Image Gallery', count: storageStats.images, size: breakdown.images, color: '#fb7185' },
        { icon: <FileCodeIcon className="w-5 h-5"/>, label: 'Code & Workflows', count: totalCodeWorkflows, size: breakdown.snippetsAndWorkflows, color: '#4ade80' },
        { icon: <CogIcon className="w-5 h-5"/>, label: 'Other App Data', count: 0, size: breakdown.other, color: '#94a3b8' },
    ];
    
    const totalBreakdownSize = Object.values(breakdown).reduce((sum, val) => sum + (val || 0), 0);

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 text-white relative">
            <DeleteAllModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={() => { setIsModalOpen(false); onClearAllData(); }} />
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-blue-600/20 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-teal-600/20 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <header className="flex items-center justify-between mb-8 flex-shrink-0 relative z-10 animate-fade-in-up">
                <div className="flex items-center space-x-3">
                    <HardDriveIcon className="w-8 h-8 text-horizon-accent" />
                    <h1 className="text-2xl md:text-3xl font-bold">Storage Management</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onRefresh} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10" title="Refresh Usage">
                        <RefreshCwIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={onCancel} className="px-4 py-2 font-semibold text-slate-300 hover:text-white transition-colors">Back</button>
                </div>
            </header>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto pr-2 custom-scrollbar">
                {/* Left Side */}
                <div className="space-y-6">
                    <div className="liquid-glass-card p-6 space-y-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <h2 className="font-semibold text-lg text-white">Storage Overview</h2>
                        <StorageBar usage={usage} quota={quota} />
                        <div className="text-center text-sm text-slate-400">
                            Used <strong className="text-white">{formatBytes(usage)}</strong> of <strong className="text-white">{formatBytes(quota)}</strong>
                        </div>
                    </div>
                     <div className="liquid-glass-card p-6 space-y-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <h2 className="font-semibold text-lg text-white">Data Breakdown</h2>
                        {breakdownItems.map((item, index) => (
                           <CategoryBreakdownItem 
                             key={item.label}
                             {...item}
                             percentage={(item.size / (totalBreakdownSize || 1)) * 100}
                             colorHex={item.color}
                             style={{ animationDelay: `${index * 50}ms` }}
                           />
                        ))}
                    </div>
                     <div className="bg-red-900/20 ui-blur-effect border border-red-500/30 rounded-xl p-6 space-y-3 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                         <div className="flex items-start gap-3">
                            <AlertTriangleIcon className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="font-semibold text-lg text-red-300">Danger Zone</h2>
                                <p className="text-sm text-red-400/80 mt-1">These actions are permanent and cannot be undone.</p>
                            </div>
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="w-full p-3 bg-red-600/50 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">
                            Delete All Application Data
                        </button>
                    </div>
                </div>

                {/* Right Side */}
                <div className="space-y-6">
                    <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                        <h2 className="font-semibold text-lg text-white mb-3">Detailed Statistics</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <StatCard icon={<MessageSquareIcon className="w-5 h-5"/>} label="Total Chats" count={storageStats.sessions} size={breakdown.sessions} style={{ animationDelay: '200ms' }} />
                            <StatCard icon={<BrainCircuitIcon className="w-5 h-5"/>} label="Total Gems" count={storageStats.gems} size={breakdown.profilesAndMemories} style={{ animationDelay: '250ms' }} />
                            <StatCard icon={<ImageIcon className="w-5 h-5"/>} label="Total Images" count={storageStats.images} size={breakdown.images} style={{ animationDelay: '300ms' }} />
                            <StatCard icon={<FileCodeIcon className="w-5 h-5"/>} label="Code & Workflows" count={totalCodeWorkflows} size={breakdown.snippetsAndWorkflows} style={{ animationDelay: '350ms' }} />
                        </div>
                    </div>
                    <div className="bg-black/20 ui-blur-effect border border-white/10 rounded-xl p-6 space-y-3 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                        <h2 className="font-semibold text-lg">Manage Data</h2>
                        <ActionButton label="Clear All Chat History" onClick={() => onClearCategory('sessions')} />
                        <ActionButton label="Clear Image Gallery" onClick={() => onClearCategory('images')} />
                        <ActionButton label="Clear Code Collection" onClick={() => onClearCategory('code')} />
                        <ActionButton label="Clear All Workflows" onClick={() => onClearCategory('workflows')} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoragePage;
