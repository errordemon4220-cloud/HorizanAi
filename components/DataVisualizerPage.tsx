import React, { useState, useCallback, useMemo, useEffect } from 'react';
// FIX: Changed VegaLite to Vega and added mode="vega-lite" to the component, as VegaLite seems not to be exported from 'react-vega'.
import { VegaLite } from 'react-vega';
import { BarChart2Icon, UploadCloudIcon, SendIcon, MessageSquareIcon, AlertTriangleIcon, SearchIcon, DownloadIcon, InfoIcon, LinkIcon, LightbulbIcon, LoaderIcon } from './icons';
import { interactWithDocument, generateChartFromData, extractKeyInsights } from '../services/geminiService';
import { ChatMessage, MessageAuthor, UserInterestProfile } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// CSV Parser
function parseCsv(csv: string): Record<string, any>[] {
    const lines = csv.trim().split(/\r\n|\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
        const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        
        return headers.reduce((obj, header, index) => {
            const value = (values[index] || '').replace(/^"|"$/g, '').trim();
            obj[header] = !isNaN(Number(value)) && value.trim() !== '' ? Number(value) : value;
            return obj;
        }, {} as Record<string, any>);
    });
}


const ChartRenderer: React.FC<{ spec: any; data: any[] }> = ({ spec, data }) => {
    if (!spec || !data) {
        return (
            <div className="flex items-center justify-center h-full text-center text-slate-400">
                <p>Your chart will appear here.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-4 bg-white rounded-lg shadow-inner">
            <VegaLite spec={spec} data={{ source_data: data }} actions={true} />
        </div>
    );
};

// --- New Enhanced Document Viewer Components ---

const HighlightedTextViewer: React.FC<{ text: string, searchTerm: string }> = ({ text, searchTerm }) => {
    if (!searchTerm) {
        return <pre className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed">{text}</pre>;
    }

    const parts = text.split(new RegExp(`(${searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));

    return (
        <pre className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed">
            {parts.map((part, i) =>
                part.toLowerCase() === searchTerm.toLowerCase() ? (
                    <mark key={i} className="bg-yellow-400 text-black px-0.5 rounded-sm">
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </pre>
    );
};

const MetadataSidebar: React.FC<{
    documentText: string | null;
    onGenerateInsights: () => void;
    isGeneratingInsights: boolean;
    keyInsights: string | null;
    extractedLinks: string[];
}> = ({ documentText, onGenerateInsights, isGeneratingInsights, keyInsights, extractedLinks }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'insights' | 'links'>('info');

    const stats = useMemo(() => {
        if (!documentText) return { words: 0, chars: 0, readTime: 0 };
        const words = documentText.trim().split(/\s+/).length;
        const chars = documentText.length;
        const readTime = Math.ceil(words / 200); // Avg reading speed 200 wpm
        return { words, chars, readTime };
    }, [documentText]);

    const TABS = [
        { id: 'info', icon: <InfoIcon className="w-5 h-5"/>, label: "Info" },
        { id: 'insights', icon: <LightbulbIcon className="w-5 h-5"/>, label: "Insights" },
        { id: 'links', icon: <LinkIcon className="w-5 h-5"/>, label: "Links" },
    ];

    return (
        <div className="w-80 flex-shrink-0 bg-black/30 border-l border-white/10 flex flex-col">
            <div className="flex-shrink-0 flex p-1 bg-black/20">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-md text-sm font-semibold transition-colors ${activeTab === tab.id ? 'bg-horizon-accent text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {activeTab === 'info' && (
                    <div className="space-y-3 animate-fade-in-up">
                        <div className="flex justify-between items-baseline p-3 bg-black/20 rounded-lg">
                            <span className="text-sm text-slate-400">Word Count</span>
                            <span className="font-semibold text-lg text-white">{stats.words.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-baseline p-3 bg-black/20 rounded-lg">
                            <span className="text-sm text-slate-400">Character Count</span>
                            <span className="font-semibold text-lg text-white">{stats.chars.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-baseline p-3 bg-black/20 rounded-lg">
                            <span className="text-sm text-slate-400">Reading Time</span>
                            <span className="font-semibold text-lg text-white">~{stats.readTime} min</span>
                        </div>
                    </div>
                )}
                {activeTab === 'insights' && (
                     <div className="animate-fade-in-up space-y-4">
                        <button onClick={onGenerateInsights} disabled={isGeneratingInsights} className="w-full flex items-center justify-center gap-2 p-2 bg-horizon-accent text-white font-semibold rounded-md hover:brightness-110 disabled:opacity-50">
                            {isGeneratingInsights ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <LightbulbIcon className="w-5 h-5"/>}
                            Generate Insights
                        </button>
                        {isGeneratingInsights && <p className="text-center text-sm text-slate-400">The AI is analyzing the document...</p>}
                        {keyInsights && <div className="p-3 bg-black/20 rounded-lg text-sm text-slate-300 whitespace-pre-wrap">{keyInsights}</div>}
                    </div>
                )}
                 {activeTab === 'links' && (
                    <div className="animate-fade-in-up space-y-2">
                        {extractedLinks.length > 0 ? extractedLinks.map((link, i) => (
                             <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="block p-2 bg-black/20 rounded-md text-sm text-sky-400 hover:bg-sky-500/10 truncate">
                                {link}
                             </a>
                        )) : <p className="text-center text-sm text-slate-500 pt-8">No links found in this document.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Page Component ---

interface DataVisualizerPageProps {
    onUpdateInterest: (interest: keyof UserInterestProfile, amount: number) => void;
}

const DataVisualizerPage: React.FC<DataVisualizerPageProps> = ({ onUpdateInterest }) => {
    const [fileType, setFileType] = useState<'csv' | 'document' | null>(null);
    const [csvData, setCsvData] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<any[] | null>(null);
    const [documentText, setDocumentText] = useState<string | null>(null);

    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const [activeChartSpec, setActiveChartSpec] = useState<any | null>(null);
    
    // State for new features
    const [extractedLinks, setExtractedLinks] = useState<string[]>([]);
    const [keyInsights, setKeyInsights] = useState<string | null>(null);
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.mjs';
    }, []);

    const resetStateForNewFile = () => {
        setCsvData(null);
        setParsedData(null);
        setDocumentText(null);
        setFileType(null);
        setMessages([]);
        setActiveChartSpec(null);
        setError(null);
        setFileName(null);
        // Reset new features state
        setExtractedLinks([]);
        setKeyInsights(null);
        setIsGeneratingInsights(false);
        setSearchTerm('');
    };
    
    const handleFileUpload = useCallback(async (file: File) => {
        if (!file) return;
        resetStateForNewFile();
        setFileName(file.name);
        setIsUploading(true);
        setError(null);

        setTimeout(async () => {
            setIsParsing(true);
            try {
                let text = '';
                if (file.type === "text/csv" || file.name.endsWith('.csv')) {
                    text = await file.text();
                    const parsed = parseCsv(text);
                    setCsvData(text);
                    setParsedData(parsed);
                    setFileType('csv');
                    setMessages([{ id: 'ai-intro', author: MessageAuthor.AI, content: `Successfully loaded CSV "${file.name}". It has ${parsed.length} rows. What would you like to visualize?` }]);
                } else if (file.type === "text/plain" || file.name.endsWith('.txt')) {
                    text = await file.text();
                    setDocumentText(text);
                    setFileType('document');
                     setMessages([{ id: 'ai-intro', author: MessageAuthor.AI, content: `Successfully loaded document "${file.name}". What would you like to know about it? Or ask me to improve it!` }]);
                } else if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => (item as any).str).join(' ');
                        fullText += pageText + '\n\n';
                    }
                    text = fullText;
                    setDocumentText(text);
                    setFileType('document');
                     setMessages([{ id: 'ai-intro', author: MessageAuthor.AI, content: `Successfully loaded PDF "${file.name}". What would you like to know about it? Or ask me to improve it!` }]);
                } else if (file.name.endsWith('.docx')) {
                    const arrayBuffer = await file.arrayBuffer();
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    text = result.value;
                    setDocumentText(text);
                    setFileType('document');
                    setMessages([{ id: 'ai-intro', author: MessageAuthor.AI, content: `Successfully loaded DOCX "${file.name}". What would you like to know about it? Or ask me to improve it!` }]);
                } else {
                    throw new Error("Unsupported file type. Please upload a CSV, TXT, PDF, or DOCX file.");
                }

                if (text) {
                    const urlRegex = /(https?:\/\/[^\s"'<>()]+)/g;
                    const links = text.match(urlRegex) || [];
                    setExtractedLinks(Array.from(new Set(links)));
                }

                onUpdateInterest('developer', 5);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An error occurred during file processing.";
                setError(errorMessage);
                resetStateForNewFile();
            } finally {
                setIsParsing(false);
                setIsUploading(false);
            }
        }, 5000);
    }, [onUpdateInterest]);

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            handleFileUpload(event.dataTransfer.files[0]);
            event.dataTransfer.clearData();
        }
    }, [handleFileUpload]);
    
    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };
    
    const handleSend = async () => {
        const currentPrompt = prompt.trim();
        if (!currentPrompt || isLoading || !fileType) return;
        
        const userMessage: ChatMessage = { id: `user-${Date.now()}`, author: MessageAuthor.USER, content: currentPrompt };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setPrompt('');
        setIsLoading(true);

        try {
            if (fileType === 'csv' && csvData) {
                const result = await generateChartFromData(currentPrompt, csvData, updatedMessages);
                const aiMessage: ChatMessage = { id: `ai-${Date.now()}`, author: MessageAuthor.AI, content: result.commentary, chartSpec: result.spec };
                setMessages(prev => [...prev, aiMessage]);
                if (result.spec) setActiveChartSpec(result.spec);
            } else if (fileType === 'document' && documentText) {
                const result = await interactWithDocument(currentPrompt, documentText, updatedMessages);
                if (result.type === 'modification') {
                    setDocumentText(result.content);
                    const aiConfirmation: ChatMessage = { id: `ai-mod-${Date.now()}`, author: MessageAuthor.AI, content: result.commentary || "I've updated the document as you requested." };
                    setMessages(prev => [...prev, aiConfirmation]);
                } else { // 'answer'
                    const aiMessage: ChatMessage = { id: `ai-ans-${Date.now()}`, author: MessageAuthor.AI, content: result.content };
                    setMessages(prev => [...prev, aiMessage]);
                }
            }
        } catch (err) {
            const errorMessage: ChatMessage = { id: `err-${Date.now()}`, author: MessageAuthor.AI, content: "Sorry, an error occurred while processing your request." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownloadText = () => {
        if (!documentText) return;
        const blob = new Blob([documentText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName?.split('.')[0] || 'document'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleGenerateInsights = async () => {
        if (!documentText || isGeneratingInsights) return;
        setIsGeneratingInsights(true);
        setKeyInsights(null);
        try {
            const insights = await extractKeyInsights(documentText);
            setKeyInsights(insights);
        } catch (err) {
            setKeyInsights("Sorry, I was unable to generate insights at this time.");
        } finally {
            setIsGeneratingInsights(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 relative overflow-y-auto custom-scrollbar">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-sky-500/10 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-green-500/10 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>
            
            <header className="text-center mb-8 animate-fade-in-up relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400" style={{ textShadow: '0 2px 10px rgba(255, 255, 255, 0.1)' }}>
                    Live Document Analysis
                </h1>
                <p className="mt-3 text-lg text-horizon-light-text-secondary dark:text-horizon-text-secondary">
                    Upload your data or documents and have a conversation with them.
                </p>
            </header>

            {!fileType ? (
                <div onDrop={handleDrop} onDragOver={handleDragOver} className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl bg-black/10 transition-colors hover:bg-black/20 hover:border-horizon-accent animate-fade-in-up ${isUploading ? 'file-melt-animation border-horizon-accent' : 'border-white/20'}`} style={{ animationDelay: '200ms'}}>
                    <input type="file" id="file-upload" className="hidden" accept=".csv, .txt, .pdf, .docx" onChange={e => e.target.files && handleFileUpload(e.target.files[0])} />
                    <label htmlFor="file-upload" className="cursor-pointer text-center p-8">
                        {isUploading || isParsing ? (
                            <>
                                <LoaderIcon className="w-16 h-16 text-horizon-accent animate-spin mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-white">{isUploading && !isParsing ? 'Transmuting File...' : 'Processing File...'}</h2>
                                <p className="text-slate-400 mt-1">{isUploading && !isParsing ? 'Stand by...' : 'Please wait a moment.'}</p>
                            </>
                        ) : (
                            <>
                                <UploadCloudIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-white">Drag & drop your file here</h2>
                                <p className="text-slate-400 mt-1">or click to browse</p>
                            </>
                        )}
                        <p className="text-xs text-slate-500 mt-4">Supported files: CSV, TXT, PDF, DOCX</p>
                    </label>
                    {error && <p className="mt-4 text-red-400">{error}</p>}
                </div>
            ) : (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0 relative z-10">
                    {/* Left: Chat */}
                    <div className="flex flex-col bg-black/20 ui-blur-effect border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
                        <div className="flex-shrink-0 p-4 border-b border-white/10 flex items-center gap-3">
                             <MessageSquareIcon className="w-5 h-5 text-horizon-accent" />
                             <h3 className="font-semibold text-white truncate">Chat with: <span className="font-mono text-slate-300">{fileName}</span></h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                           {messages.map(msg => (
                               <div key={msg.id} className={`flex items-start gap-3 ${msg.author === MessageAuthor.USER ? 'justify-end' : ''} animate-fade-in-up`}>
                                   {msg.author === MessageAuthor.AI && <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-slate-700 rounded-full"><BarChart2Icon className="w-5 h-5 text-slate-300"/></div>}
                                   <div className={`max-w-md p-3 rounded-xl shadow-md ${msg.author === MessageAuthor.USER ? 'bg-horizon-accent text-white' : 'bg-slate-800 text-slate-200'}`}>
                                       <p className="whitespace-pre-wrap">{msg.content}</p>
                                   </div>
                               </div>
                           ))}
                           {isLoading && (
                                <div className="flex items-start gap-3">
                                   <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-slate-700 rounded-full"><BarChart2Icon className="w-5 h-5 text-slate-300"/></div>
                                   <div className="p-3 rounded-xl bg-slate-800 flex items-center space-x-2">
                                       <div className="w-2 h-2 bg-horizon-accent rounded-full animate-dot-wave" style={{ animationDelay: '-0.4s' }}></div>
                                       <div className="w-2 h-2 bg-horizon-accent rounded-full animate-dot-wave" style={{ animationDelay: '-0.2s' }}></div>
                                       <div className="w-2 h-2 bg-horizon-accent rounded-full animate-dot-wave"></div>
                                   </div>
                               </div>
                           )}
                        </div>
                        <div className="p-4 border-t border-white/10 bg-black/20">
                             <div className="relative">
                                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()} placeholder={fileType === 'csv' ? "e.g., Show sales by region..." : "e.g., Summarize this document..."} rows={1} className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 pr-12 resize-none focus:outline-none focus:ring-1 focus:ring-horizon-accent" disabled={isLoading} />
                                <button onClick={handleSend} disabled={isLoading || !prompt.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-horizon-accent text-white hover:brightness-110 disabled:opacity-50 transition-all"><SendIcon className="w-5 h-5"/></button>
                             </div>
                        </div>
                    </div>

                    {/* Right: Dashboard / Viewer */}
                    <div className="flex flex-col bg-black/20 ui-blur-effect border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '150ms'}}>
                       {fileType === 'csv' ? (
                           <>
                             <div className="flex-shrink-0 p-4 border-b border-white/10 flex items-center gap-3"><BarChart2Icon className="w-5 h-5 text-horizon-accent" /><h3 className="font-semibold text-white">Dashboard</h3></div>
                             <div className="flex-1 p-2 min-h-0">{parsedData && <ChartRenderer spec={activeChartSpec} data={parsedData} />}</div>
                           </>
                       ) : (
                           <div className="flex-1 flex flex-row min-h-0">
                               <div className="flex-1 flex flex-col min-w-0">
                                   <div className="flex-shrink-0 p-4 border-b border-white/10 flex items-center justify-between gap-3">
                                       <div className="relative flex-1">
                                           <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                                           <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search document..." className="w-full bg-black/20 border border-white/10 rounded-md p-2 pl-9 text-sm focus:outline-none focus:ring-1 focus:ring-horizon-accent" />
                                       </div>
                                       <button onClick={handleDownloadText} className="p-2 bg-black/20 border border-white/10 rounded-md text-slate-300 hover:bg-white/5 hover:text-white" title="Download as TXT"><DownloadIcon className="w-5 h-5"/></button>
                                   </div>
                                   <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">{documentText && <HighlightedTextViewer text={documentText} searchTerm={searchTerm} />}</div>
                               </div>
                               <MetadataSidebar 
                                   documentText={documentText} 
                                   onGenerateInsights={handleGenerateInsights}
                                   isGeneratingInsights={isGeneratingInsights}
                                   keyInsights={keyInsights}
                                   extractedLinks={extractedLinks}
                               />
                           </div>
                       )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataVisualizerPage;
