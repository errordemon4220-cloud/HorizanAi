
import React from 'react';
import { ChatMessage, Gem } from '../types';
import { ImageIcon, FileCodeIcon, BrainCircuitIcon, GlobeIcon, GptsIcon } from './icons';

interface EventMarkerProps {
    icon: React.ReactNode;
    top: string;
    title: string;
    onClick: () => void;
}

const EventMarker: React.FC<EventMarkerProps> = ({ icon, top, title, onClick }) => (
    <div
        className="absolute left-1/2 -translate-x-1/2 group"
        style={{ top, transform: 'translateX(-50%)' }}
    >
        <button
            onClick={onClick}
            className="w-8 h-8 rounded-full bg-horizon-sidebar/80 backdrop-blur-sm border-2 border-horizon-item hover:border-horizon-accent shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
            {icon}
        </button>
        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2 py-1 bg-horizon-item text-white text-xs font-semibold rounded-md shadow-lg whitespace-nowrap invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
            {title}
        </div>
    </div>
);

interface MagicScrollbarProps {
    messages: ChatMessage[];
    activeGem: Gem | null;
    onMarkerClick: (messageId: string) => void;
}

export const MagicScrollbar: React.FC<MagicScrollbarProps> = ({ messages, activeGem, onMarkerClick }) => {
    // Only show the timeline for reasonably long chats
    if (messages.length < 10) {
        return null;
    }

    const eventMessages = messages.map((msg, index) => {
        let eventType: string | null = null;
        if (msg.imageFile) eventType = 'image';
        else if (msg.codeBlock) eventType = 'code';
        else if (msg.groundingMetadata) eventType = 'search';
        else if (msg.content.includes('[HORIZON_MEMORY_ADD:')) eventType = 'memory';

        if (eventType) {
            return {
                id: msg.id,
                type: eventType,
                position: (index / (messages.length -1)) * 100
            };
        }
        return null;
    }).filter((item): item is { id: string; type: string; position: number } => item !== null);
    
    const getEventDetails = (type: string) => {
        switch (type) {
            case 'image': return { icon: <ImageIcon className="w-4 h-4 text-sky-400" />, title: 'Image Uploaded' };
            case 'code': return { icon: <FileCodeIcon className="w-4 h-4 text-green-400" />, title: 'Code Block' };
            case 'search': return { icon: <GlobeIcon className="w-4 h-4 text-blue-400" />, title: 'Web Search' };
            case 'memory': return { icon: <BrainCircuitIcon className="w-4 h-4 text-purple-400" />, title: 'Memory Added' };
            default: return { icon: null, title: '' };
        }
    };
    
    // Simple Gem Avatar
    const GemMarker: React.FC<{ gem: Gem }> = ({ gem }) => {
        const isUrl = gem.avatar?.startsWith('http') || gem.avatar?.startsWith('data:');
        if (isUrl) {
            return <img src={gem.avatar} alt={gem.name} className="w-8 h-8 rounded-full object-cover" />;
        }
        const isEmoji = gem.avatar && /\p{Emoji}/u.test(gem.avatar);
        if (isEmoji) {
            return <div className="w-8 h-8 flex items-center justify-center text-lg rounded-full bg-orange-400">{gem.avatar}</div>;
        }
        return <div className="w-8 h-8 flex items-center justify-center text-md font-bold text-white rounded-full bg-red-700">{gem.avatar?.charAt(0).toUpperCase() || 'G'}</div>;
    };


    return (
        <div className="absolute top-0 right-2 bottom-0 w-10 flex-shrink-0 z-20 pointer-events-none">
            {/* The track line for the timeline */}
            <div className="relative h-full w-full mx-auto py-20">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-0.5 bg-white/5 rounded-full"></div>
                
                {/* Gem Marker at the top */}
                {activeGem && (
                     <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto group" title={`Chatting with ${activeGem.name}`}>
                         <GemMarker gem={activeGem} />
                     </div>
                )}
                
                {/* Event Markers */}
                {eventMessages.map(event => {
                    const { icon, title } = getEventDetails(event.type);
                    // Calculate position within the py-20 padding
                    const topPosition = `calc(10% + ${event.position * 0.8}%)`;
                    return (
                        <div key={event.id} className="pointer-events-auto">
                            <EventMarker
                                icon={icon}
                                title={title}
                                top={topPosition}
                                onClick={() => onMarkerClick(event.id)}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};