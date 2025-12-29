import React from 'react';
import { Gem } from '../types';

interface GemAvatarProps {
    gem: Gem;
    className?: string;
    style?: React.CSSProperties;
}

const GemAvatar: React.FC<GemAvatarProps> = ({ gem, className = 'w-10 h-10', style }) => {
    const isUrl = gem.avatar?.startsWith('http') || gem.avatar?.startsWith('data:');
    if (isUrl) {
        return (
            <img src={gem.avatar} alt={gem.name} style={style} className={`${className} flex-shrink-0 rounded-full object-cover`} />
        );
    }
    const isEmoji = gem.avatar && /\p{Emoji}/u.test(gem.avatar);
    
    let fontSizeClass = 'text-xl'; // Default for w-10
    if (className.includes('w-20')) fontSizeClass = 'text-4xl';
    else if (className.includes('w-16')) fontSizeClass = 'text-3xl';
    else if (className.includes('w-8') || className.includes('w-7')) fontSizeClass = 'text-lg';

    if (isEmoji) {
        return (
            <div style={style} className={`${className} flex-shrink-0 flex items-center justify-center rounded-full bg-orange-400/50`}>
                <span className={fontSizeClass}>{gem.avatar}</span>
            </div>
        )
    }

    let charFontSizeClass = 'text-lg'; // Default for w-10
    if (className.includes('w-20')) charFontSizeClass = 'text-3xl';
    else if (className.includes('w-16')) charFontSizeClass = 'text-2xl';
    else if (className.includes('w-8') || className.includes('w-7')) charFontSizeClass = 'text-sm';
    
    return (
        <div style={style} className={`${className} flex-shrink-0 flex items-center justify-center rounded-full bg-red-700/80 text-white font-bold`}>
            <span className={charFontSizeClass}>
                {gem.avatar?.charAt(0).toUpperCase() || gem.name?.charAt(0).toUpperCase() || 'G'}
            </span>
        </div>
    )
};

export default GemAvatar;
