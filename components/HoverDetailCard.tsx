import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface HoverDetailCardProps {
    details: {
        icon: React.ReactNode;
        label: string;
        description: string;
        tag?: string;
    } | null;
    position: { top: number } | null;
    isCollapsed: boolean;
}

const HoverDetailCard: React.FC<HoverDetailCardProps> = ({ details, position, isCollapsed }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const appearTimelineRef = useRef<gsap.core.Timeline | null>(null);

    useEffect(() => {
        if (details && position && cardRef.current) {
            if (appearTimelineRef.current) {
                appearTimelineRef.current.kill();
            }
            const sidebarWidth = isCollapsed ? 80 : 288; // w-20 (80px) or w-72 (288px)
            gsap.set(cardRef.current, {
                top: position.top,
                left: sidebarWidth + 8, // sidebar width + small margin
                display: 'block',
            });
            appearTimelineRef.current = gsap.fromTo(cardRef.current, 
                { opacity: 0, scale: 0.9, y: '-40%', x: -10 },
                { opacity: 1, scale: 1, y: '-50%', x: 0, duration: 0.3, ease: 'power2.out' }
            );
        } else if (cardRef.current) {
            if (appearTimelineRef.current) {
                appearTimelineRef.current.kill();
            }
             appearTimelineRef.current = gsap.to(cardRef.current, {
                opacity: 0,
                scale: 0.9,
                x: -10,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: () => {
                    if(cardRef.current) {
                        cardRef.current.style.display = 'none';
                    }
                }
            });
        }
    }, [details, position, isCollapsed]);
    
    const getCardTheme = (tag?: string) => {
        switch(tag) {
            case '18+':
            case 'Adult':
                return { cardClass: 'red-glass', iconBgClass: 'bg-red-900/40', titleColor: 'text-red-200' };
            case 'Dev':
                return { cardClass: 'dev-glass', iconBgClass: 'bg-green-900/40', titleColor: 'text-green-200' };
            case 'Creative':
                return { cardClass: 'creative-glass', iconBgClass: 'bg-pink-900/40', titleColor: 'text-pink-200' };
            case 'Data':
                return { cardClass: 'data-glass', iconBgClass: 'bg-teal-900/40', titleColor: 'text-teal-200' };
            case 'AI':
                return { cardClass: 'ai-glass', iconBgClass: 'bg-purple-900/40', titleColor: 'text-purple-200' };
            case 'Voice':
                return { cardClass: 'voice-glass', iconBgClass: 'bg-indigo-900/40', titleColor: 'text-indigo-200' };
            default:
                return { cardClass: 'blue-glass', iconBgClass: 'bg-blue-900/40', titleColor: 'text-blue-200' };
        }
    };

    if (!details) {
        return <div ref={cardRef} className="fixed w-72 z-50 pointer-events-none opacity-0 hidden"></div>;
    }

    const getTagClass = (tag?: string) => {
        switch(tag) {
            case 'New': return 'tag-new';
            case '18+': return 'tag-18-plus';
            case 'Adult': return 'tag-adult font-bold';
            case 'Voice': return 'tag-voice';
            case 'Creative': return 'tag-creative';
            case 'Dev': return 'tag-dev';
            case 'Data': return 'tag-data';
            case 'AI': return 'tag-ai';
            default: return 'bg-slate-500 text-white';
        }
    };
    const tagClass = getTagClass(details.tag);
    const theme = getCardTheme(details.tag);

    return (
        <div ref={cardRef} className="fixed w-72 z-50 pointer-events-none opacity-0 hidden">
            <div className={`liquid-glass-card ${theme.cardClass} rounded-2xl`}>
                <div className="liquid-glass--bend"></div>
                <div className="liquid-glass--face"></div>
                <div className="liquid-glass--edge"></div>
                <div className="relative z-10 p-4">
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 p-2 ${theme.iconBgClass} rounded-lg`}>
                            {details.icon}
                        </div>
                        <div>
                             <div className="flex items-center gap-2">
                                <h3 className={`font-bold text-lg ${theme.titleColor}`}>{details.label}</h3>
                                {details.tag && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none shadow-md ${tagClass}`}>
                                        {details.tag}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-300 mt-1">{details.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HoverDetailCard;