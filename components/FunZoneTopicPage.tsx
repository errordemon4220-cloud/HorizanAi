import React from 'react';
import { StudioTopic, StudioTopicContent } from '../types';
import { ChevronLeftIcon, LoaderIcon, HeartIcon, ZapIcon, StarIcon, AlertTriangleIcon, UsersIcon, TelescopeIcon, VolumeUpIcon, PaintbrushIcon, QuillIcon } from './icons';

interface FunZoneTopicPageProps {
    category: string;
    topic: StudioTopic;
    content: StudioTopicContent | null;
    isLoading: boolean;
    onBack: () => void;
}

const RatingMeter: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => {
    const percentage = value * 10;
    return (
        <div className="p-3 bg-black/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5" style={{ color }}>{icon}</div>
                <span className="text-sm font-semibold text-rose-200/80">{label}</span>
                <span className="ml-auto font-mono text-lg font-bold" style={{ color }}>{value}/10</span>
            </div>
            <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></div>
            </div>
        </div>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="space-y-2">
        <h3 className="font-bold text-xl text-rose-200 border-b-2 border-rose-400/20 pb-1 flex items-center gap-2">
            {icon}
            {title}
        </h3>
        <div className="text-rose-200/90 leading-relaxed text-base">{children}</div>
    </div>
);


const FunZoneTopicPage: React.FC<FunZoneTopicPageProps> = ({ category, topic, content, isLoading, onBack }) => {

    if (isLoading || !content) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-rose-200/60 bg-[var(--gf-bg)]">
                <LoaderIcon className="w-20 h-20 animate-spin text-rose-400" />
                <h3 className="mt-4 text-2xl font-semibold text-rose-200/80">Eris is Writing...</h3>
                <p className="mt-1">Generating an extremely detailed guide for "{topic.name}".</p>
            </div>
        );
    }
    
    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto relative bg-[var(--gf-bg)] text-white">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-rose-900/50 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-purple-900/40 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <header className="flex items-start justify-between mb-8 flex-shrink-0 relative z-10 animate-fade-in-up">
                 <div className="flex items-center space-x-3">
                     <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 flex-shrink-0 mt-1"><ChevronLeftIcon className="w-6 h-6"/></button>
                    <div>
                        <p className="text-sm text-rose-300">{category}</p>
                        <h1 className="text-3xl md:text-4xl font-bold">{content.topicName}</h1>
                    </div>
                </div>
            </header>

            <main className="relative z-10 w-full max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel: Ratings & Info */}
                    <div className="lg:col-span-1 space-y-4 animate-fade-in-up" style={{ animationDelay: '100ms'}}>
                        <div className="p-4 bg-black/20 ui-blur-effect border border-rose-400/10 rounded-xl space-y-3">
                            <h2 className="font-semibold text-lg text-rose-200">Ratings Matrix</h2>
                            <RatingMeter label="Pleasure" value={content.ratings.pleasure} icon={<HeartIcon/>} color="#f472b6" />
                            <RatingMeter label="Spice" value={content.ratings.spice} icon={<ZapIcon/>} color="#fbbf24" />
                            <RatingMeter label="Intimacy" value={content.ratings.intimacy} icon={<UsersIcon/>} color="#60a5fa" />
                            <RatingMeter label="Pain" value={content.ratings.pain} icon={<AlertTriangleIcon/>} color="#f87171" />
                            <RatingMeter label="Roughness" value={content.ratings.roughness} icon={<ZapIcon/>} color="#c084fc" />
                        </div>
                         <div className="p-4 bg-black/20 ui-blur-effect border border-rose-400/10 rounded-xl space-y-3">
                            <h2 className="font-semibold text-lg text-rose-200">Technical Details</h2>
                            <div>
                                <label className="text-sm font-semibold text-rose-200/80">Difficulty</label>
                                <div className="flex items-center mt-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <StarIcon key={i} className={`w-5 h-5 ${i < content.difficulty ? 'text-yellow-400' : 'text-slate-600'}`} />
                                    ))}
                                </div>
                            </div>
                             {content.anatomyFocus && content.anatomyFocus.length > 0 && (
                                <div>
                                    <label className="text-sm font-semibold text-rose-200/80">Anatomy Focus</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {content.anatomyFocus.map(item => (
                                            <div key={item} className="flex items-center gap-1.5 bg-rose-500/10 text-rose-300 text-xs font-semibold px-2 py-1 rounded-full">
                                                <ZapIcon className="w-3 h-3"/>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                         {content.requiredItems && content.requiredItems.length > 0 && (
                            <div className="p-4 bg-black/20 ui-blur-effect border border-rose-400/10 rounded-xl">
                                <h2 className="font-semibold text-lg text-rose-200 mb-2">Required Items</h2>
                                <ul className="list-disc list-inside space-y-1 text-sm text-rose-200/80">
                                    {content.requiredItems.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Main Content */}
                    <div className="lg:col-span-2 space-y-6 animate-fade-in-up" style={{ animationDelay: '200ms'}}>
                        <Section title="Introduction">{content.introduction}</Section>
                        
                        <Section title="How-To Guide">
                            <ol className="list-decimal list-inside space-y-2">
                                {content.howTo.map((step, i) => <li key={i}>{step}</li>)}
                            </ol>
                        </Section>

                        {content.benefits && content.benefits.length > 0 && (
                             <Section title="Benefits">
                                <ul className="list-disc list-inside space-y-1">
                                    {content.benefits.map((benefit, i) => <li key={i}>{benefit}</li>)}
                                </ul>
                            </Section>
                        )}
                        
                        {content.variations && content.variations.length > 0 && (
                             <Section title="Variations & Twists">
                                {content.variations.map((variation, i) => (
                                    <div key={i} className="p-3 bg-black/20 rounded-md mt-2">
                                        <h4 className="font-semibold text-rose-200">{variation.name}</h4>
                                        <p className="text-sm text-rose-200/80">{variation.description}</p>
                                    </div>
                                ))}
                            </Section>
                        )}

                         {content.proTips && content.proTips.length > 0 && (
                             <Section title="Pro-Tips">
                                <ul className="list-disc list-inside space-y-1">
                                    {content.proTips.map((tip, i) => <li key={i}>{tip}</li>)}
                                </ul>
                            </Section>
                        )}

                        <Section title="Sensory Matrix" icon={<ZapIcon className="w-5 h-5 text-purple-400" />}>
                            <div className="space-y-4 p-3 bg-black/10 rounded-lg">
                                {content.sensoryDetails.sight && (
                                    <div className="flex items-start gap-3">
                                        <TelescopeIcon className="w-5 h-5 mt-1 text-cyan-400 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-cyan-300">Sight</h4>
                                            <p className="text-sm text-rose-200/80">{content.sensoryDetails.sight}</p>
                                        </div>
                                    </div>
                                )}
                                {content.sensoryDetails.sound && (
                                    <div className="flex items-start gap-3">
                                        <VolumeUpIcon className="w-5 h-5 mt-1 text-green-400 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-green-300">Sound</h4>
                                            <p className="text-sm text-rose-200/80">{content.sensoryDetails.sound}</p>
                                        </div>
                                    </div>
                                )}
                                {content.sensoryDetails.touch && (
                                    <div className="flex items-start gap-3">
                                        <PaintbrushIcon className="w-5 h-5 mt-1 text-orange-400 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-orange-300">Touch</h4>
                                            <p className="text-sm text-rose-200/80">{content.sensoryDetails.touch}</p>
                                        </div>
                                    </div>
                                )}
                                {content.sensoryDetails.smell && (
                                    <div className="flex items-start gap-3">
                                        <ZapIcon className="w-5 h-5 mt-1 text-yellow-400 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-yellow-300">Smell</h4>
                                            <p className="text-sm text-rose-200/80">{content.sensoryDetails.smell}</p>
                                        </div>
                                    </div>
                                )}
                                {content.sensoryDetails.taste && (
                                    <div className="flex items-start gap-3">
                                        <QuillIcon className="w-5 h-5 mt-1 text-pink-400 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-pink-300">Taste</h4>
                                            <p className="text-sm text-rose-200/80">{content.sensoryDetails.taste}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Section>

                        {content.risksAndSafety && content.risksAndSafety.length > 0 && (
                            <Section title="Risks & Safety" icon={<AlertTriangleIcon className="w-5 h-5 text-yellow-400" />}>
                                <ul className="list-disc list-inside space-y-1 text-yellow-300/80">
                                    {content.risksAndSafety.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </Section>
                        )}
                        
                        {content.aftercareTips && content.aftercareTips.length > 0 && (
                            <Section title="Aftercare" icon={<HeartIcon className="w-5 h-5 text-cyan-400" />}>
                                <ul className="list-disc list-inside space-y-1 text-cyan-300/90">
                                    {content.aftercareTips.map((tip, i) => <li key={i}>{tip}</li>)}
                                </ul>
                            </Section>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FunZoneTopicPage;