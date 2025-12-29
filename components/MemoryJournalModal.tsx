import React from 'react';
import { ChatMessage, PersonaContext } from '../types';
import { XIcon, BookOpenIcon } from './icons';

interface MemoryJournalModalProps {
    isOpen: boolean;
    onClose: () => void;
    context: PersonaContext;
}

const MemoryJournalModal: React.FC<MemoryJournalModalProps> = ({ isOpen, onClose, context }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 ui-blur-effect z-50 flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-slate-900 border border-horizon-accent/50 rounded-2xl p-6 w-full max-w-3xl shadow-2xl space-y-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-horizon-accent flex items-center gap-2">
                        <BookOpenIcon className="w-6 h-6"/>
                        Memory Journal: {context.name}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-white/10"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                    {context.chatHistory.length > 0 ? (
                        context.chatHistory.map(msg => (
                            <div key={msg.id} className="p-3 bg-black/10 border border-white/5 rounded-lg">
                                <p className={`font-bold text-sm ${msg.author === 'user' ? 'text-sky-400' : 'text-pink-400'}`}>
                                    {msg.author === 'user' ? (msg.persona ? `${msg.persona.name || msg.persona.role}` : context.name) : 'Haniya'}
                                </p>
                                <p className="text-slate-200 whitespace-pre-wrap mt-1">{msg.content}</p>
                                {msg.innerThought && (
                                    <p className="text-sm italic text-slate-400 mt-2 border-l-2 border-slate-600 pl-2">Thought: {msg.innerThought}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-400 py-10">No memories recorded with {context.name} yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemoryJournalModal;
