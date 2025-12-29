
import React, { useState, useRef } from 'react';
import { CodeSnippet, CodeBlock as CodeBlockType, CodeModificationType } from '../types';
import CodeBlock, { CodeBlockHandle } from './CodeBlock';

interface CodeEditorPageProps {
    snippet: CodeSnippet;
    onSave: (snippet: CodeSnippet) => void;
    onCancel: () => void;
    onRequestModification: (messageId: string, type: CodeModificationType, details?: { targetLanguage?: string; featureRequest?: string; }) => void;
    isLoading: boolean;
}

const CodeEditorPage: React.FC<CodeEditorPageProps> = ({ snippet, onSave, onCancel, onRequestModification, isLoading }) => {
    const [title, setTitle] = useState(snippet.title);
    const codeBlockRef = useRef<CodeBlockHandle>(null);

    const handleSave = () => {
        if (codeBlockRef.current) {
            const currentCode = codeBlockRef.current.getSnapshot();
            onSave({ ...snippet, title, code: currentCode });
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 text-horizon-text-primary relative bg-slate-900 overflow-y-auto custom-scrollbar">
            <header className="flex items-center justify-between mb-6 flex-shrink-0 relative z-10 animate-fade-in-up">
                <div className="flex-1 max-w-xl">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Snippet Title"
                        className="w-full bg-transparent text-2xl md:text-3xl font-bold focus:outline-none border-b-2 border-transparent focus:border-horizon-accent transition-colors"
                    />
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={onCancel} className="px-4 py-2 font-semibold text-horizon-text-secondary hover:text-white transition-colors">Back to Collection</button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-horizon-accent text-white rounded-lg font-semibold hover:brightness-110 transition-all active:scale-95"
                    >
                        Save
                    </button>
                </div>
            </header>

            <main className="flex-1 min-h-0 relative z-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <CodeBlock
                    ref={codeBlockRef}
                    code={snippet.code}
                    messageId={snippet.id}
                    onRequestModification={onRequestModification}
                    isLoading={isLoading}
                    initialIsEditing={true}
                    layout="split"
                />
            </main>
        </div>
    );
};

export default CodeEditorPage;