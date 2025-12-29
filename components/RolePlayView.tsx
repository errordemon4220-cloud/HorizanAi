import React, { useRef, useEffect } from 'react';
import { ChatMessage, MessageAuthor, RolePlaySetup, UserProfile } from '../types';

const RolePlayCharacterAvatar: React.FC<{ avatar: string, name: string, className?: string }> = ({ avatar, name, className = 'w-10 h-10' }) => {
    const isUrl = avatar?.startsWith('http') || avatar?.startsWith('data:');
    if (isUrl) {
        return (
            <img src={avatar} alt={name} className={`${className} flex-shrink-0 rounded-full object-cover`} />
        );
    }
    const isEmoji = avatar && /\p{Emoji}/u.test(avatar);
    const char = avatar?.trim().charAt(0) || name?.trim().charAt(0) || '?';
    
    if (isEmoji) {
        return (
            <div className={`${className} flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500`}>
                <span className={className.includes('w-10') ? 'text-2xl' : 'text-lg'}>{avatar}</span>
            </div>
        )
    }

    return (
        <div className={`${className} flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white font-bold`}>
            <span className={className.includes('w-10') ? 'text-xl' : 'text-md'}>{char.toUpperCase()}</span>
        </div>
    )
};

const UserAvatar: React.FC<{ userProfile: UserProfile | null, className?: string }> = ({ userProfile, className = 'w-10 h-10' }) => {
    return (
        <img src={userProfile?.avatarUrl || 'https://i.pravatar.cc/40?u=default'} alt="Your Avatar" className={`${className} rounded-full object-cover`}/>
    )
};

const RolePlayView: React.FC<{
    messages: ChatMessage[];
    setup: RolePlaySetup;
    userProfile: UserProfile | null;
    isLoading: boolean;
}> = ({ messages, setup, userProfile, isLoading }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 font-sans text-base leading-relaxed text-slate-300 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6">
                 {messages.length === 0 && !isLoading && (
                    <div className="text-center text-slate-400 italic py-20 animate-fade-in-up">
                        The stage is set. Your story begins when you send the first message.
                    </div>
                )}
                {messages.map((message, index) => {
                    const isLastMessage = index === messages.length - 1;

                    if (message.author === MessageAuthor.USER) {
                        return (
                            <div key={message.id} className="flex justify-end items-start gap-3 animate-scale-in-pop group">
                                <div className="max-w-xl" style={{ perspective: '800px' }}>
                                    <div className="[transform-style:preserve-3d] transition-transform duration-500 ease-in-out group-hover:[transform:rotateY(-5deg)]">
                                        <div className="message-glass-wrapper rounded-xl rounded-br-none">
                                            <div className="message-glass-effect"></div>
                                            <div className="message-glass-tint !bg-horizon-accent/20 dark:!bg-horizon-accent/30"></div>
                                            <div className="message-glass-shine"></div>
                                            <div className="message-glass-content p-4 text-white">
                                                <p className="whitespace-pre-wrap">{message.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <UserAvatar userProfile={userProfile} />
                            </div>
                        );
                    } else { // AI message
                        const showLoadingDots = isLastMessage && isLoading && message.content.length === 0;
                        
                        return (
                             <div key={message.id} className="flex items-start gap-3 animate-scale-in-pop group">
                                <RolePlayCharacterAvatar avatar={setup.avatar} name={setup.characterName} />
                                <div className="max-w-xl" style={{ perspective: '800px' }}>
                                    <div className="[transform-style:preserve-3d] transition-transform duration-500 ease-in-out group-hover:[transform:rotateY(5deg)]">
                                        <div className="message-glass-wrapper rounded-xl rounded-bl-none">
                                            <div className="message-glass-effect"></div>
                                            <div className="message-glass-tint bg-black/20 dark:bg-black/40"></div>
                                            <div className="message-glass-shine"></div>
                                            <div className="message-glass-content p-4 text-slate-200 min-h-[56px] flex items-center">
                                                {showLoadingDots ? (
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-2 h-2 bg-rose-300 rounded-full animate-dot-wave" style={{ animationDelay: '-0.4s' }}></div>
                                                        <div className="w-2 h-2 bg-rose-300 rounded-full animate-dot-wave" style={{ animationDelay: '-0.2s' }}></div>
                                                        <div className="w-2 h-2 bg-rose-300 rounded-full animate-dot-wave"></div>
                                                    </div>
                                                ) : (
                                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
};

export default RolePlayView;