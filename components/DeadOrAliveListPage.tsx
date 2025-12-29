import React from 'react';
import { DeadOrAliveSubject } from '../types';
import { PlusIcon, TrashIcon, MessageSquareIcon, PencilIcon } from './icons';

const SubjectCard: React.FC<{
    subject: DeadOrAliveSubject;
    onDelete: () => void;
    onEdit: () => void;
    onChat: () => void;
    style: React.CSSProperties;
}> = ({ subject, onDelete, onEdit, onChat, style }) => (
    <div style={style} className="animate-fade-in-up">
        <div className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-900 border border-rose-500/20 shadow-lg transition-all duration-300 hover:border-rose-400 hover:shadow-rose-400/20 hover:-translate-y-2">
            <img src={subject.imageUrl} alt={subject.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
            
            <div className="absolute top-2 right-2 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 bg-black/50 rounded-full text-slate-300 hover:bg-slate-600 hover:text-white" title="Edit Subject"><PencilIcon className="w-4 h-4" /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 bg-black/50 rounded-full text-slate-300 hover:bg-red-500 hover:text-white" title="Terminate Subject"><TrashIcon className="w-4 h-4" /></button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <div className="transform translate-y-16 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-bold text-xl text-white truncate [text-shadow:0_1px_4px_#000]">{subject.name}, {subject.age}</h3>
                    <p className="text-sm text-rose-300/80">{subject.race} | {subject.relationship}</p>
                    <button onClick={onChat} className="w-full flex items-center justify-center gap-2 py-2 mt-3 bg-rose-600/70 text-white rounded-lg font-semibold transition-opacity hover:bg-rose-600 opacity-0 group-hover:opacity-100 duration-300 delay-100">
                        <MessageSquareIcon className="w-4 h-4" /> Chat
                    </button>
                </div>
            </div>
        </div>
    </div>
);

interface DeadOrAliveListPageProps {
    subjects: DeadOrAliveSubject[];
    onNewSubject: () => void;
    onEditSubject: (subject: DeadOrAliveSubject) => void;
    onDeleteSubject: (id: string) => void;
    onStartChat: (subject: DeadOrAliveSubject) => void;
}

const DeadOrAliveListPage: React.FC<DeadOrAliveListPageProps> = ({ subjects, onNewSubject, onEditSubject, onDeleteSubject, onStartChat }) => {
    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto relative text-white">
            <header className="flex items-center justify-between mb-8 flex-shrink-0 relative z-10 animate-fade-in-up">
                <h1 className="text-2xl md:text-3xl font-bold text-rose-300">Subject Dossiers</h1>
                <button onClick={onNewSubject} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-500 transition-colors">
                    <PlusIcon className="w-5 h-5" /> Add New Subject
                </button>
            </header>

            <main className="relative z-10">
                {subjects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {subjects.map((sub, i) => (
                            <SubjectCard
                                key={sub.id}
                                subject={sub}
                                onDelete={() => onDeleteSubject(sub.id)}
                                onEdit={() => onEditSubject(sub)}
                                onChat={() => onStartChat(sub)}
                                style={{ animationDelay: `${i * 80}ms` }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 px-6 bg-black/20 ui-blur-effect rounded-xl border border-dashed border-rose-400/20 animate-fade-in-up">
                        <h2 className="text-xl font-semibold text-rose-200/80 mb-2">No Subjects Found</h2>
                        <p className="text-rose-200/60">Click "Add New Subject" to create your first one.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DeadOrAliveListPage;
