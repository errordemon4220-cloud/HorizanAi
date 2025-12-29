

import React, { useState, useMemo, useEffect } from 'react';
import { ChatSession } from '../types';
import { SearchIcon, XIcon } from './icons';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessions: ChatSession[];
    onSelect: (sessionId: string) => void;
}

interface GroupedSessions {
    today: ChatSession[];
    previous7Days: ChatSession[];
    older: ChatSession[];
}

const groupSessionsByDate = (sessions: ChatSession[]): GroupedSessions => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const grouped: GroupedSessions = {
        today: [],
        previous7Days: [],
        older: [],
    };

    sessions.forEach(session => {
        const sessionDate = new Date(parseInt(session.id.split('-')[1], 10));
        if (sessionDate >= today) {
            grouped.today.push(session);
        } else if (sessionDate >= sevenDaysAgo) {
            grouped.previous7Days.push(session);
        } else {
            grouped.older.push(session);
        }
    });

    return grouped;
};

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, sessions, onSelect }) => {
    const [query, setQuery] = useState('');

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const filteredSessions = useMemo(() => {
        if (!query) return sessions;
        return sessions.filter(session =>
            session.title.toLowerCase().includes(query.toLowerCase())
        );
    }, [sessions, query]);
    
    const groupedSessions = useMemo(() => groupSessionsByDate(filteredSessions), [filteredSessions]);

    if (!isOpen) {
        return null;
    }

    const renderSessionGroup = (title: string, sessions: ChatSession[]) => {
        if (sessions.length === 0) return null;
        return (
            <div>
                <h3 className="text-xs font-semibold text-horizon-light-text-tertiary dark:text-horizon-text-tertiary px-4 py-2">{title}</h3>
                <ul>
                    {sessions.map(session => (
                        <li key={session.id}>
                            <button
                                onClick={() => onSelect(session.id)}
                                className="w-full text-left px-4 py-2.5 text-horizon-light-text-primary dark:text-horizon-text-primary rounded-lg hover:bg-horizon-light-item-hover dark:hover:bg-horizon-item transition-colors"
                            >
                                <span className="truncate">{session.title}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
    
    const hasResults = groupedSessions.today.length > 0 || groupedSessions.previous7Days.length > 0 || groupedSessions.older.length > 0;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-10 bg-black/50 ui-blur-effect"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl bg-horizon-light-sidebar/80 dark:bg-horizon-sidebar/80 ui-blur-effect border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[80vh]"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center p-4 border-b border-horizon-light-item dark:border-horizon-item flex-shrink-0">
                    <SearchIcon className="w-5 h-5 text-horizon-light-text-tertiary dark:text-horizon-text-tertiary mr-3" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search chats..."
                        autoFocus
                        className="w-full bg-transparent focus:outline-none text-horizon-light-text-primary dark:text-horizon-text-primary"
                    />
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-horizon-light-item-hover dark:hover:bg-horizon-item-hover">
                        <XIcon className="w-5 h-5 text-horizon-light-text-tertiary dark:text-horizon-text-tertiary" />
                    </button>
                </header>

                <div className="overflow-y-auto p-2">
                    {hasResults ? (
                        <>
                            {renderSessionGroup('Today', groupedSessions.today)}
                            {renderSessionGroup('Previous 7 Days', groupedSessions.previous7Days)}
                            {renderSessionGroup('Older', groupedSessions.older)}
                        </>
                    ) : (
                        <div className="text-center py-16 text-horizon-light-text-secondary dark:text-horizon-text-secondary">
                            <p>No chats found for "{query}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchModal;