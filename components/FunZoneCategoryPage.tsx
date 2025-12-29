
import React, { useEffect, useState } from 'react';
import { StudioCategory, StudioTopic } from '../types';
import { generateStudioTopics } from '../services/geminiService';
import { ZapIcon, ChevronLeftIcon, LoaderIcon, SparklesIcon } from './icons';

interface FunZoneCategoryPageProps {
    category: StudioCategory;
    onSelectTopic: (topic: StudioTopic, category: StudioCategory) => void;
    onBack: () => void;
}

const TopicCard: React.FC<{ topic: StudioTopic, onClick: () => void, style: React.CSSProperties }> = ({ topic, onClick, style }) => (
    <button onClick={onClick} style={style} className="w-full text-left opacity-0 animate-fade-in-up">
        <div className="relative p-5 bg-black/20 ui-blur-effect border border-rose-400/10 rounded-xl transition-all duration-300 hover:border-rose-400/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/10 h-full">
            <h3 className="font-bold text-lg text-rose-200">{topic.name}</h3>
            <p className="text-sm text-rose-200/60 mt-1">{topic.description}</p>
        </div>
    </button>
);

const FunZoneCategoryPage: React.FC<FunZoneCategoryPageProps> = ({ category, onSelectTopic, onBack }) => {
    const [topics, setTopics] = useState<StudioTopic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingMore, setIsGeneratingMore] = useState(false);

    useEffect(() => {
        const fetchTopics = async () => {
            setIsLoading(true);
            try {
                const fetchedTopics = await generateStudioTopics(category);
                setTopics(fetchedTopics);
            } catch (error) {
                console.error("Failed to fetch topics for category:", category, error);
                // Handle error state if needed
            } finally {
                setIsLoading(false);
            }
        };
        fetchTopics();
    }, [category]);

    const handleGenerateMore = async () => {
        setIsGeneratingMore(true);
        try {
            const existingNames = topics.map(t => t.name);
            const newTopics = await generateStudioTopics(category, existingNames);
            setTopics(prevTopics => [...prevTopics, ...newTopics]);
        } catch (error) {
            console.error("Failed to generate more topics:", error);
            // Optionally, show an error toast to the user
        } finally {
            setIsGeneratingMore(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto relative bg-[var(--gf-bg)] text-white">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-rose-900/50 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-purple-900/40 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <header className="flex items-center justify-between mb-8 flex-shrink-0 relative z-10 animate-fade-in-up">
                <div className="flex items-center space-x-3">
                     <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10"><ChevronLeftIcon className="w-6 h-6"/></button>
                    <div>
                        <p className="text-sm text-rose-300">Interaction Studio</p>
                        <h1 className="text-2xl md:text-3xl font-bold">{category}</h1>
                    </div>
                </div>
            </header>
            
            <main className="relative z-10 w-full">
                {isLoading ? (
                     <div className="flex flex-col items-center justify-center text-center p-8 text-rose-200/60">
                        <LoaderIcon className="w-16 h-16 animate-spin text-rose-400" />
                        <h3 className="mt-4 text-xl font-semibold text-rose-200/80">Generating Topics...</h3>
                        <p className="mt-1">Eris is compiling a list of subjects for you.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {topics.map((topic, index) => (
                                <TopicCard 
                                    key={`${topic.name}-${index}`}
                                    topic={topic}
                                    onClick={() => onSelectTopic(topic, category)}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                />
                            ))}
                        </div>
                        <div className="mt-8 text-center">
                            <button
                                onClick={handleGenerateMore}
                                disabled={isGeneratingMore}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-600/50 text-white font-semibold rounded-lg hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isGeneratingMore ? (
                                    <>
                                        <LoaderIcon className="w-5 h-5 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-5 h-5" />
                                        Generate More
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </main>

        </div>
    );
};

export default FunZoneCategoryPage;
