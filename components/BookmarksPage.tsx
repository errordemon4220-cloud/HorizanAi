import React, { useState } from 'react';
import { Bookmark } from '../types';
import { BookmarkIcon, CopyIcon, CheckIcon, TrashIcon } from './icons';

const BookmarkItem: React.FC<{
    bookmark: Bookmark;
    onDelete: (id: string) => void;
    style: React.CSSProperties;
}> = ({ bookmark, onDelete, style }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(bookmark.content).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div style={style} className="animate-fade-in-up cursor-default">
            <div
                className="liquid-glass-card group relative rounded-lg p-px"
            >
                <div className="liquid-glass--bend"></div>
                <div className="liquid-glass--face"></div>
                <div className="liquid-glass--edge"></div>

                <div className="relative z-10 p-4 flex flex-col gap-4">
                    <p className="flex-1 text-horizon-light-text-primary dark:text-horizon-text-primary whitespace-pre-wrap">{bookmark.content}</p>
                    <div className="flex items-center justify-between text-xs text-horizon-light-text-tertiary dark:text-horizon-text-tertiary border-t border-white/10 pt-3 mt-2">
                        <span className="truncate pr-4">From: <span className="font-semibold text-horizon-text-secondary">{bookmark.chatTitle}</span></span>
                        <div className="flex items-center gap-2">
                            <button onClick={handleCopy} title={copied ? "Copied!" : "Copy"} className="p-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors">
                                {copied ? <CheckIcon className="w-4 h-4 text-green-400"/> : <CopyIcon className="w-4 h-4"/>}
                            </button>
                            <button onClick={() => onDelete(bookmark.id)} title="Delete bookmark" className="p-1.5 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors">
                                <TrashIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface BookmarksPageProps {
    bookmarks: Bookmark[];
    onDelete: (id: string) => void;
    onCancel: () => void;
}

const BookmarksPage: React.FC<BookmarksPageProps> = ({ bookmarks, onDelete, onCancel }) => {
    const sortedBookmarks = [...bookmarks].sort((a, b) => b.createdAt - a.createdAt);

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto relative">
             {/* Animated background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-yellow-500/20 dark:bg-yellow-500/10 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-orange-500/20 dark:bg-orange-500/10 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <header className="flex items-center justify-between mb-8 relative z-10 animate-fade-in-up">
                <div className="flex items-center space-x-3">
                    <BookmarkIcon className="w-8 h-8 text-horizon-accent animate-pulse" style={{filter: 'drop-shadow(0 0 5px var(--horizon-accent))'}} />
                    <h1 className="text-2xl md:text-3xl font-bold text-horizon-light-text-primary dark:text-horizon-text-primary">Bookmarks</h1>
                </div>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 font-semibold text-horizon-light-text-secondary dark:text-horizon-text-secondary hover:text-horizon-light-text-primary dark:hover:text-horizon-text-primary transition-colors active:scale-95"
                >
                    Back
                </button>
            </header>

            <div className="relative z-10">
                {sortedBookmarks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedBookmarks.map((bookmark, index) => (
                            <BookmarkItem
                                key={bookmark.id}
                                bookmark={bookmark}
                                onDelete={onDelete}
                                style={{ animationDelay: `${100 + index * 50}ms` }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 px-6 bg-white/5 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-dashed border-white/10 animate-fade-in-up" style={{ animationDelay: '200ms'}}>
                        <BookmarkIcon className="w-16 h-16 mx-auto opacity-30 text-horizon-text-tertiary"/>
                        <h2 className="text-xl font-semibold text-horizon-light-text-primary dark:text-horizon-text-primary mt-4">No Bookmarks Yet</h2>
                        <p className="text-horizon-light-text-secondary dark:text-horizon-text-secondary mt-2">Click the bookmark icon on an AI's message to save it here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookmarksPage;