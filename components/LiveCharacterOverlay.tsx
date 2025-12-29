import React, { useRef, useEffect, useState } from 'react';
import { LiveCharacterState } from '../types';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { XIcon, MaximizeIcon, MinimizeIcon } from './icons';

gsap.registerPlugin(Draggable);

interface LiveCharacterOverlayProps {
    character: LiveCharacterState;
    onUpdate: (update: Partial<LiveCharacterState>) => void;
    onClose: () => void;
}

const LiveCharacterOverlay: React.FC<LiveCharacterOverlayProps> = ({ character, onUpdate, onClose }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        // Set initial position and scale
        gsap.set(wrapper, {
            x: character.x,
            y: character.y,
            scale: character.scale,
        });

        const dragInstance = Draggable.create(wrapper, {
            type: 'x,y',
            onDragEnd: function() {
                onUpdate({ x: this.x, y: this.y });
            },
            inertia: true, 
        });

        return () => {
            dragInstance[0].kill();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [character.url]); // Re-initialize only if the character URL changes

    useEffect(() => {
        gsap.to(wrapperRef.current, { scale: character.scale, duration: 0.3 });
    }, [character.scale]);

    const handleScaleChange = (newScale: number) => {
        onUpdate({ scale: Math.max(0.2, Math.min(2.0, newScale)) });
    };

    return (
        <div
            ref={wrapperRef}
            className="fixed top-0 left-0 z-50 cursor-grab active:cursor-grabbing"
            style={{ width: '300px', height: '533px' }} // Assuming 9:16 aspect ratio
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <video
                key={character.url}
                src={character.url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain pointer-events-none drop-shadow-2xl"
            />
            
            <div className={`absolute top-2 right-2 flex flex-col gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                <button onClick={onClose} title="Remove Character" className="p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500/80 transition-colors"><XIcon className="w-4 h-4"/></button>
                <button onClick={() => handleScaleChange(character.scale + 0.1)} title="Increase Size" className="p-1.5 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors"><MaximizeIcon className="w-4 h-4"/></button>
                <button onClick={() => handleScaleChange(character.scale - 0.1)} title="Decrease Size" className="p-1.5 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors"><MinimizeIcon className="w-4 h-4"/></button>
            </div>
        </div>
    );
};

export default LiveCharacterOverlay;
