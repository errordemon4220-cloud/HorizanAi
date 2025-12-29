

import React, { useState, useEffect, useRef } from 'react';

const NotesPanel: React.FC<{
  isOpen: boolean;
  onToggle: () => void;
  notes: string;
  onUpdateNotes: (newNotes: string) => void;
}> = ({ isOpen, onToggle, notes, onUpdateNotes }) => {
    const [localNotes, setLocalNotes] = useState(notes);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // When the parent `notes` prop changes (e.g., switching chats), update the local state.
    useEffect(() => {
        setLocalNotes(notes);
    }, [notes]);
    
    // Debounce the call to onUpdateNotes to avoid excessive updates while typing.
    useEffect(() => {
        const handler = setTimeout(() => {
            if (localNotes !== notes) { // Only update if the content has actually changed
                onUpdateNotes(localNotes);
            }
        }, 500); // 500ms debounce delay

        return () => clearTimeout(handler);
    }, [localNotes, notes, onUpdateNotes]);
    
    // Auto-resize textarea height based on content.
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [localNotes, isOpen]);
    
    return (
        <div className="flex-shrink-0 flex items-center h-full">
            {/* The vertical tab to toggle the panel */}
            <div 
                onClick={onToggle}
                className={`
                    flex-shrink-0 h-24 flex items-center justify-center cursor-pointer 
                    bg-horizon-sidebar/80 hover:bg-horizon-item-hover/80
                    transition-all duration-300 border-t border-b border-l border-white/10
                    rounded-l-xl shadow-md hover:shadow-lg
                    hover:-translate-x-0.5
                `}
                style={{ writingMode: 'vertical-rl' }}
                title="Toggle Notes"
            >
                <span className="px-1 font-semibold text-xs tracking-wider rotate-180">
                    Notes
                </span>
            </div>
             {/* The panel content itself, which expands and collapses */}
            <div
                className={`
                    h-full bg-horizon-sidebar/90 backdrop-blur-xl border-t border-b border-r border-white/10 rounded-r-lg
                    transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden
                    ${isOpen ? 'w-72 p-4' : 'w-0 p-0'}
                `}
            >
                {/* Wrapper for smooth fade/transform animation of the content */}
                <div className={`
                    w-full h-full flex flex-col transition-all duration-300
                    ${isOpen ? 'opacity-100 translate-x-0 delay-150' : 'opacity-0 translate-x-4'}
                `}>
                    <h2 className="text-lg font-bold text-horizon-text-primary mb-2 flex-shrink-0">Conversation Notes</h2>
                    <p className="text-xs text-horizon-text-tertiary mb-4 flex-shrink-0">
                        The AI uses these notes for context. Notes are saved automatically.
                    </p>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                       <textarea
                            ref={textareaRef}
                            value={localNotes}
                            onChange={(e) => setLocalNotes(e.target.value)}
                            placeholder="Add notes here..."
                            className="w-full bg-transparent text-horizon-text-secondary focus:outline-none resize-none"
                       />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotesPanel;