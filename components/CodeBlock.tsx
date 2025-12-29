



import React, { useState, useEffect, useMemo, useRef, useImperativeHandle } from 'react';
import { CodeBlock as CodeBlockType, CodeModificationType } from '../types';
import { 
    CopyIcon, 
    CheckIcon, 
    PencilIcon, 
    ExternalLinkIcon, 
    FileCode2Icon, 
    ShareIcon, 
    DownloadIcon,
    UploadCloudIcon,
    XIcon,
    BotIcon,
    LanguagesIcon,
    ClipboardCheckIcon,
    BugIcon,
    TerminalIcon,
    MessageSquarePlusIcon,
    Wand2Icon,
    AIToolIcon,
    PlusIcon,
    BookOpenIcon,
} from './icons';

type MainTab = 'code' | 'preview';
type CodeTab = 'html' | 'css' | 'javascript';

const LANGUAGES = [
    { id: 'python', name: 'Python' },
    { id: 'php', name: 'PHP' },
    { id: 'java', name: 'Java' },
    { id: 'c++', name: 'C++' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'go', name: 'Go' },
    { id: 'rust', name: 'Rust' },
    { id: 'ruby', name: 'Ruby' },
    { id: 'swift', name: 'Swift' },
];


const LineNumbers = React.memo(React.forwardRef<HTMLDivElement, { lineCount: number, className?: string; }>(({ lineCount, className }, ref) => {
    return (
        <div ref={ref} className={`text-right text-gray-500 pr-4 select-none flex-shrink-0 overflow-y-hidden ${className}`}>
            {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
            ))}
        </div>
    );
}));

export interface CodeBlockHandle {
    getSnapshot: () => CodeBlockType;
}

interface CodeBlockProps {
    code: CodeBlockType;
    messageId: string;
    onRequestModification: (messageId: string, type: CodeModificationType, details?: { targetLanguage?: string; featureRequest?: string; }) => void;
    isLoading: boolean;
    onOpenInCollection?: (code: CodeBlockType) => void;
    initialIsEditing?: boolean;
    layout?: 'tabs' | 'split';
    onCopyCode?: () => void;
}

const CodeBlock = React.forwardRef<CodeBlockHandle, CodeBlockProps>(({ code, messageId, onRequestModification, isLoading, onOpenInCollection, initialIsEditing, layout = 'tabs', onCopyCode }, ref) => {
    const [mainTab, setMainTab] = useState<MainTab>(layout === 'tabs' ? 'preview' : 'code');
    const [codeTab, setCodeTab] = useState<CodeTab>('html');
    const [isEditing, setIsEditing] = useState(initialIsEditing || false);
    const [editedCode, setEditedCode] = useState(code);
    const [copiedStates, setCopiedStates] = useState({ html: false, css: false, javascript: false, share: false });
    const [lineCount, setLineCount] = useState(0);

    const [isLangModalOpen, setIsLangModalOpen] = useState(false);
    const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
    const [featureRequestText, setFeatureRequestText] = useState('');
    
    const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);

    const codeTextAreaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    
    useImperativeHandle(ref, () => ({
        getSnapshot: () => {
            return editedCode;
        }
    }));
    
    // Effect to close FAB menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
                setIsFabMenuOpen(false);
            }
        };
        if (isFabMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFabMenuOpen]);

    useEffect(() => {
        setEditedCode(code);
    }, [code]);
    
    useEffect(() => {
        if (mainTab === 'code' || layout === 'split') {
            const lines = editedCode[codeTab]?.split('\n').length || 1;
            setLineCount(lines);
        }
    }, [editedCode, codeTab, mainTab, layout]);
    
    // Sync scroll between textarea and line numbers
    useEffect(() => {
        const syncScroll = () => {
            if (codeTextAreaRef.current && lineNumbersRef.current) {
                lineNumbersRef.current.scrollTop = codeTextAreaRef.current.scrollTop;
            }
        };

        const editor = codeTextAreaRef.current;
        if (editor && (isEditing || initialIsEditing)) {
            editor.addEventListener('scroll', syncScroll);
            return () => editor.removeEventListener('scroll', syncScroll);
        }
    }, [isEditing, initialIsEditing, codeTab]);


    const iframeSrcDoc = useMemo(() => {
        return `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>${editedCode.css}</style>
                </head>
                <body>
                    ${editedCode.html}
                    <script>${editedCode.javascript}</script>
                </body>
            </html>
        `;
    }, [editedCode]);

    const handleCopy = (type: CodeTab) => {
        navigator.clipboard.writeText(editedCode[type]).then(() => {
            setCopiedStates(prev => ({ ...prev, [type]: true }));
            setTimeout(() => setCopiedStates(prev => ({ ...prev, [type]: false })), 2000);
            onCopyCode?.();
        });
    };
    
    const handleShareLink = () => {
        try {
            const jsonString = JSON.stringify(editedCode);
            const encodedString = btoa(unescape(encodeURIComponent(jsonString)));
            const url = `${window.location.origin}${window.location.pathname}?code=${encodedString}`;
            
            navigator.clipboard.writeText(url).then(() => {
                setCopiedStates(prev => ({ ...prev, share: true }));
                setTimeout(() => setCopiedStates(prev => ({ ...prev, share: false })), 2000);
            });
        } catch (e) {
            console.error("Error generating share link", e);
            alert("Could not generate share link. The code may be too large.");
        }
    };
    
    const handleDownload = () => {
        const fileContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Code</title>
    <style>
${editedCode.css}
    </style>
</head>
<body>
${editedCode.html}
    <script>
${editedCode.javascript}
    </script>
</body>
</html>
        `.trim();
        
        const blob = new Blob([fileContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'horizon-code.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedCode(prev => ({ ...prev, [codeTab]: e.target.value }));
    };

    const handleFullScreenPreview = () => {
        const blob = new Blob([iframeSrcDoc], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank')?.focus();
    };
    
    const handleLanguageSelect = (lang: string) => {
        onRequestModification(messageId, 'translate', { targetLanguage: lang });
        setIsLangModalOpen(false);
    };
    
    const handleFeatureRequest = () => {
        if (!featureRequestText.trim()) return;
        onRequestModification(messageId, 'add_feature', { featureRequest: featureRequestText });
        setIsFeatureModalOpen(false);
        setFeatureRequestText('');
    };

    const jsTabLabel = useMemo(() => {
        if (!code.language || code.language === 'javascript') return 'JS';
        const langInfo = LANGUAGES.find(l => l.id === code.language);
        return langInfo ? langInfo.name.toUpperCase() : code.language.toUpperCase();
    }, [code.language]);

    const codeTabs: { id: CodeTab, label: string }[] = [
        { id: 'html', label: 'HTML' },
        { id: 'css', label: 'CSS' },
        { id: 'javascript', label: jsTabLabel },
    ];
    
    const TooltipButton: React.FC<{ title: string, onClick?: () => void, children: React.ReactNode, disabled?: boolean, isActive?: boolean, style?: React.CSSProperties, className?: string }> = ({ title, onClick, children, disabled, isActive, style, className }) => (
        <div className={`group/tooltip relative flex items-center ${className || ''}`} style={style}>
            <button
                onClick={onClick}
                disabled={disabled}
                className={`
                    w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isActive ? 'bg-horizon-accent text-white' : 'bg-slate-700/90 text-gray-300 hover:bg-horizon-accent hover:text-white'}
                `}
            >
                {children}
            </button>
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-2.5 py-1.5 bg-slate-900/90 ui-blur-effect border border-slate-700 text-white text-xs font-semibold rounded-md shadow-lg whitespace-nowrap invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-10">
                {title}
            </div>
        </div>
    );

    const FAB_ACTIONS = [
        { icon: <DownloadIcon className="w-5 h-5"/>, title: "Download Code", action: handleDownload, type: 'download' },
        { icon: <UploadCloudIcon className="w-5 h-5"/>, title: "Upload Code (not implemented)", action: () => {}, type: 'upload', disabled: true },
        { type: 'divider' },
        { icon: <Wand2Icon className="w-5 h-5"/>, title: "Add Feature", action: () => setIsFeatureModalOpen(true), type: 'add_feature' },
        { icon: <LanguagesIcon className="w-5 h-5"/>, title: "Change Language", action: () => setIsLangModalOpen(true), type: 'translate' },
        { icon: <ClipboardCheckIcon className="w-5 h-5"/>, title: "Code Review", action: () => onRequestModification(messageId, 'review'), type: 'review' },
        { icon: <BugIcon className="w-5 h-5"/>, title: "Fix Bugs", action: () => onRequestModification(messageId, 'fix'), type: 'fix' },
        { icon: <TerminalIcon className="w-5 h-5"/>, title: "Add Logs", action: () => onRequestModification(messageId, 'logs'), type: 'logs' },
        { icon: <MessageSquarePlusIcon className="w-5 h-5"/>, title: "Add Comments", action: () => onRequestModification(messageId, 'comments'), type: 'comments' },
    ];

    const ModalsComponent = () => (
        <>
            {isLangModalOpen && (
                 <div className="absolute inset-0 bg-black/70 ui-blur-effect z-20 flex items-center justify-center animate-fade-in-up" onClick={() => setIsLangModalOpen(false)}>
                    <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 w-72" onClick={e => e.stopPropagation()}>
                        <h3 className="font-semibold text-center mb-3">Translate To...</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {LANGUAGES.map(lang => (
                                <button key={lang.id} onClick={() => handleLanguageSelect(lang.id)} className="p-2 text-sm font-semibold rounded-md bg-slate-700/50 hover:bg-horizon-accent transition-colors">
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {isFeatureModalOpen && (
                 <div className="absolute inset-0 bg-black/70 ui-blur-effect z-20 flex items-center justify-center animate-fade-in-up" onClick={() => setIsFeatureModalOpen(false)}>
                    <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 w-96" onClick={e => e.stopPropagation()}>
                        <h3 className="font-semibold text-center mb-3">Add a New Feature</h3>
                        <p className="text-sm text-center text-slate-400 mb-4">Describe the feature you want to add.</p>
                        <textarea
                            value={featureRequestText}
                            onChange={(e) => setFeatureRequestText(e.target.value)}
                            placeholder="e.g., 'Add a dark mode toggle button' or 'Make the buttons animate when you hover over them.'"
                            rows={4}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-horizon-accent resize-y"
                        />
                        <button 
                            onClick={handleFeatureRequest}
                            disabled={!featureRequestText.trim()}
                            className="w-full mt-4 p-2 bg-horizon-accent text-white font-semibold rounded-md hover:brightness-110 transition-all disabled:opacity-50"
                        >
                            Generate Feature
                        </button>
                    </div>
                </div>
            )}
        </>
    );

    const CodeEditorComponent = () => (
        <div className="flex-1 flex flex-col h-full">
            <div className="flex-shrink-0 flex items-center border-b border-slate-700/80 bg-slate-800/50">
                {codeTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setCodeTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${codeTab === tab.id ? 'border-horizon-accent text-white' : 'border-transparent text-gray-400 hover:bg-white/10 hover:text-white'}`}
                    >
                        {tab.label}
                    </button>
                ))}
                <div className="ml-auto flex items-center gap-2 pr-4">
                    {!initialIsEditing &&
                    <button title={isEditing ? 'Save' : 'Edit'} onClick={() => setIsEditing(!isEditing)} className={`p-1.5 rounded-full ${isEditing ? 'bg-horizon-accent/80 text-white' : 'text-gray-400 hover:bg-white/20'}`}>
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    }
                    <button title={copiedStates[codeTab] ? "Copied!" : "Copy code"} onClick={() => handleCopy(codeTab)} className="p-1.5 rounded-full text-gray-400 hover:bg-white/20">
                        {copiedStates[codeTab] ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            <div className="flex-1 flex overflow-hidden bg-slate-900/70">
                <LineNumbers ref={lineNumbersRef} lineCount={lineCount} className="pt-2" />
                <textarea
                    ref={codeTextAreaRef}
                    value={editedCode[codeTab]}
                    readOnly={!isEditing}
                    onChange={handleCodeChange}
                    className="flex-1 p-2 bg-transparent resize-none font-mono text-sm leading-6 focus:outline-none custom-scrollbar"
                    spellCheck="false"
                />
            </div>
        </div>
    );
    
    const PreviewComponent = () => (
        <div className="flex-1 relative h-full">
            <iframe
                srcDoc={iframeSrcDoc}
                title="Code Preview"
                sandbox="allow-scripts allow-modals"
                className="w-full h-full border-0 bg-white"
            />
            <button title="Open in new tab" onClick={handleFullScreenPreview} className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-800/50 ui-blur-effect text-gray-300 hover:bg-white/20 hover:text-white transition-colors">
                <ExternalLinkIcon className="w-4 h-4" />
            </button>
        </div>
    );

    const FabComponent = () => (
         <div ref={fabRef} className="absolute bottom-6 right-6 z-30">
            <div className="relative flex flex-col-reverse items-center">
                {/* Expanded Menu */}
                <div className={`
                    absolute bottom-full mb-3
                    transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${isFabMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
                `}>
                    <div className="relative bg-slate-800/80 ui-blur-effect rounded-full border border-slate-700 p-2 flex flex-col-reverse items-center gap-y-2">
                            {FAB_ACTIONS.map((item, index) =>
                            item.type === 'divider' ? (
                                <div key={`d-${index}`} className="h-px w-6 bg-slate-600 my-1"></div>
                            ) : (
                                <TooltipButton
                                    key={item.type}
                                    title={item.title}
                                    onClick={() => { item.action?.(); setIsFabMenuOpen(false); }}
                                    disabled={isLoading || item.disabled}
                                    className="transition-all duration-300"
                                    style={{ transitionDelay: `${isFabMenuOpen ? (FAB_ACTIONS.length - 1 - index) * 30 : 0}ms`, transform: isFabMenuOpen ? 'translateY(0)' : 'translateY(10px)', opacity: isFabMenuOpen ? 1 : 0 }}
                                >
                                    {item.icon}
                                </TooltipButton>
                            )
                        )}
                    </div>
                </div>
                {/* Main FAB trigger */}
                <button
                    onClick={() => setIsFabMenuOpen(prev => !prev)}
                    className="w-14 h-14 flex items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 transform hover:scale-110"
                    style={{ background: 'var(--horizon-accent)' }}
                    disabled={isLoading}
                    title={isFabMenuOpen ? "Close Tools" : "AI Code Tools"}
                >
                    <div className={`transition-transform duration-300 ease-in-out ${isFabMenuOpen ? 'rotate-[225deg]' : 'rotate-0'}`}>
                        {isLoading
                            ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            : (isFabMenuOpen ? <PlusIcon className="w-7 h-7"/> : <AIToolIcon className="w-7 h-7"/>)
                        }
                    </div>
                </button>
            </div>
        </div>
    );

    if (layout === 'split') {
        return (
             <div className="h-full flex flex-col relative bg-slate-900/70 rounded-xl border border-slate-700/80 shadow-inner">
                <ModalsComponent />
                <main className="flex-1 flex min-h-0">
                    <div className="w-1/2 h-full">
                        <CodeEditorComponent />
                    </div>
                    <div className="w-px bg-slate-700/80" />
                    <div className="w-1/2 h-full">
                        <PreviewComponent />
                    </div>
                </main>
                <FabComponent />
            </div>
        );
    }
    
    // Default 'tabs' layout for chat
    return (
        <div className="bg-slate-800/70 ui-blur-effect rounded-xl border border-slate-600/50 shadow-2xl shadow-black/30 font-sans text-white my-4 relative">
            <ModalsComponent />
            <header className="flex items-center justify-between px-4 py-2 border-b border-slate-700/80">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <FileCode2Icon className="w-5 h-5 text-slate-400" />
                    <span>Simple Website Page with Gemini Features</span>
                </div>
                <div className="flex items-center gap-2">
                     <div className="flex items-center bg-slate-900/50 p-0.5 rounded-md">
                        <button onClick={() => setMainTab('code')} className={`px-2.5 py-1 text-xs font-semibold rounded ${mainTab === 'code' ? 'bg-slate-700' : 'text-gray-400 hover:bg-slate-700/50'}`}>Code</button>
                        <button onClick={() => setMainTab('preview')} className={`px-2.5 py-1 text-xs font-semibold rounded ${mainTab === 'preview' ? 'bg-slate-700' : 'text-gray-400 hover:bg-slate-700/50'}`}>Preview</button>
                    </div>
                    {onOpenInCollection &&
                        <button onClick={() => onOpenInCollection(editedCode)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors bg-slate-600/80 hover:bg-slate-500/80">
                            <BookOpenIcon className="w-4 h-4"/>
                            Open in Collection
                        </button>
                    }
                    <button onClick={handleShareLink} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${copiedStates.share ? 'bg-green-600/90' : 'bg-blue-600/90 hover:bg-blue-500/90'}`}>
                        {copiedStates.share ? <CheckIcon className="w-4 h-4"/> : <ShareIcon className="w-4 h-4"/>}
                        {copiedStates.share ? 'Link Copied' : 'Share'}
                    </button>
                </div>
            </header>
            <main className="flex h-96 relative">
                {mainTab === 'code' ? <CodeEditorComponent /> : <PreviewComponent />}
            </main>
            <FabComponent />
        </div>
    );
});

export default React.memo(CodeBlock);