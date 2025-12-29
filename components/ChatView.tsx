import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
// FIX: Add ParseResult to this import and remove the separate import from ../App
import { ChatMessage, MessageAuthor, GroundingMetadata, Gem, UserProfile, AIProfile, ImageFile, FavoritePrompt, Bookmark, CodeBlock, CodeModificationType, CustomizationSettings, UserInterestProfile, ParseResult } from '../types';
import CodeBlockComponent from './CodeBlock';
import ProactiveWelcomeBanner from './ProactiveWelcomeBanner';
import { MagicScrollbar } from './MagicScrollbar';
import { 
    GptsIcon, 
    SourcesIcon, 
    DownloadIcon, 
    BookmarkIcon,
    CopyIcon,
    ThumbsUpIcon,
    ThumbsDownIcon,
    VolumeUpIcon,
    VolumeOffIcon,
    PencilIcon,
    RefreshCwIcon,
    ShareIcon,
    CheckIcon,
    ChevronDownIcon,
    BrainCircuitIcon,
    XIcon,
    TelescopeIcon,
    BookOpenIcon,
    LightbulbIcon,
    FileCodeIcon,
    GlobeIcon,
    ImageIcon,
    UsersIcon,
    StarIcon,
    SunIcon,
    SendIcon,
    PaletteIcon,
    FileTextIcon,
    BarChart2Icon,
    BugIcon,
    VideoIcon,
    ZapIcon,
    CheckCircleIcon,
    HeartIcon,
    MicIcon
} from './icons';
import GemAvatar from './GemAvatar';
// FIX: Temporarily adding a stub for generateWelcomeMessage to fix import. The real implementation is in geminiService.
import { generateWelcomeMessage } from '../services/geminiService';


interface ChatViewProps {
  messages: ChatMessage[];
  isLoading: boolean;
  activeGem: Gem | null;
  userProfile: UserProfile | null;
  aiProfile: AIProfile | null;
  customization: CustomizationSettings;
  editingMessageId: string | null;
  speakingMessageId: string | null;
  favoritePrompts: FavoritePrompt[];
  bookmarks: Bookmark[];
  chatId: string;
  chatTitle: string;
  proactiveSuggestion: string | null;
  onDismissProactiveSuggestion: () => void;
  onSetEditingId: (id: string | null) => void;
  onSaveAndSubmit: (messageId: string, newContent: string) => void;
  onRegenerate: (aiMessageId: string) => void;
  onReadAloud: (messageId: string, text: string) => void;
  onSuggestionClick: (text: string) => void;
  onShowImageGeneration: () => void;
  onShowStoryWriter: () => void;
  onShowRolePlay: () => void;
  onAddFavoritePrompt: (text: string) => void;
  onRemoveFavoritePrompt: (id: string) => void;
  onAddBookmark: (content: string, chatId: string, chatTitle: string) => void;
  onRemoveBookmark: (bookmarkId: string) => void;
  onRequestCodeModification: (messageId: string, type: CodeModificationType, details?: { targetLanguage?: string; featureRequest?: string; }) => void;
  activeModificationMessageId: string | null;
  onOpenInCollection: (code: CodeBlock) => void;
  onUpdateInterest: (interest: keyof UserInterestProfile, amount: number) => void;
  parseMediaLinks: (content: string) => ParseResult;
  onShowAIGirlfriends: () => void;
  onShow18PlusTalk: () => void;
  onShowSexualProfile: () => void;
}

const GroundingSources: React.FC<{ metadata: GroundingMetadata }> = React.memo(({ metadata }) => {
    const webChunks = metadata?.groundingChunks?.filter(chunk => chunk.web?.uri) ?? [];

    if (webChunks.length === 0) {
        return null;
    }

    return (
        <div className="mt-4 p-3 bg-white/5 dark:bg-black/20 ui-blur-effect border border-white/10 rounded-lg">
            <div className="flex items-center text-xs text-horizon-light-text-tertiary dark:text-horizon-text-tertiary mb-2">
                <SourcesIcon className="w-4 h-4 mr-2" />
                <span className="font-semibold">Sources</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {webChunks.map((chunk, index) => (
                    <a 
                        key={index} 
                        href={chunk.web!.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-horizon-light-text-secondary dark:text-horizon-text-secondary hover:text-horizon-light-text-primary dark:hover:text-horizon-text-primary bg-white/5 dark:bg-black/30 p-2 rounded-md truncate block transition-colors hover:bg-white/10 dark:hover:bg-black/40"
                        title={chunk.web!.title}
                    >
                        {chunk.web!.title || new URL(chunk.web!.uri!).hostname}
                    </a>
                ))}
            </div>
        </div>
    );
});

const WaveLoader: React.FC = React.memo(() => (
    <div className="flex items-center space-x-2">
        <div className="w-2.5 h-2.5 bg-horizon-accent rounded-full animate-dot-wave" style={{ animationDelay: '-0.4s' }}></div>
        <div className="w-2.5 h-2.5 bg-horizon-accent rounded-full animate-dot-wave" style={{ animationDelay: '-0.2s' }}></div>
        <div className="w-2.5 h-2.5 bg-horizon-accent rounded-full animate-dot-wave"></div>
    </div>
));

const ImageGenerationPlaceholder: React.FC = React.memo(() => (
    <div className="relative aspect-square w-full max-w-sm bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-inner animate-fade-in-up overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/20 to-transparent transform -skew-x-45 animate-shimmer"></div>
        <div className="absolute bottom-4 right-4">
            <div className="w-5 h-5 border-2 border-t-transparent border-slate-400 rounded-full animate-spin"></div>
        </div>
    </div>
));

const ImageEmbed: React.FC<{ url: string }> = ({ url }) => (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block max-w-sm">
        <img src={url} alt="Embedded content" className="rounded-lg max-h-80 object-contain bg-horizon-sidebar" />
    </a>
);

const VideoEmbed: React.FC<{ url: string }> = ({ url }) => (
    <div className="max-w-sm rounded-lg overflow-hidden">
        <video src={url} controls className="w-full max-h-80" />
    </div>
);

const YouTubeEmbed: React.FC<{ embedUrl: string }> = ({ embedUrl }) => (
    <div className="max-w-sm aspect-video">
        <iframe
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
        ></iframe>
    </div>
);


const MessageContent: React.FC<{message: ChatMessage; parseMediaLinks: (content: string) => ParseResult;}> = React.memo(({ message, parseMediaLinks }) => {
    const { text, media } = parseMediaLinks(message.content);
    
    const hasImageUpload = !!message.imageFile;
    const hasText = text && text.trim().length > 0;

    return (
        <div className="flex flex-col gap-3">
            {hasImageUpload && (
                <div className="relative group">
                <img
                    src={message.imageFile!.data}
                    alt="Chat image"
                    className="rounded-lg max-w-xs md:max-w-sm max-h-80 object-contain bg-horizon-light-sidebar dark:bg-horizon-sidebar"
                />
                <a
                    href={message.imageFile!.data}
                    download={`horizon-ai-image.jpg`}
                    className="absolute top-2 left-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100"
                    aria-label="Download image"
                    title="Download image"
                >
                    <DownloadIcon className="w-5 h-5" />
                </a>
                </div>
            )}
            
            {media && !hasImageUpload && (
                <>
                    {media.type === 'image' && <ImageEmbed url={media.embedUrl} />}
                    {media.type === 'video' && <VideoEmbed url={media.embedUrl} />}
                    {media.type === 'youtube' && <YouTubeEmbed embedUrl={media.embedUrl} />}
                </>
            )}

            {hasText && (
                <p className="whitespace-pre-wrap">{text}</p>
            )}
        </div>
    );
});


const UserMessageEditor: React.FC<{
    message: ChatMessage;
    onSave: (messageId: string, newContent: string) => void;
    onCancel: () => void;
}> = React.memo(({ message, onSave, onCancel }) => {
    const [editedContent, setEditedContent] = useState(message.content);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            textareaRef.current.focus();
        }
    }, [editedContent]);

    const handleSave = () => {
        if (editedContent.trim()) {
            onSave(message.id, editedContent.trim());
        }
    };
    
    return (
         <div className="w-full">
            <div className="bg-horizon-accent/10 ui-blur-effect border border-horizon-accent/20 rounded-xl p-3 shadow-md">
                <textarea
                    ref={textareaRef}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full bg-transparent text-horizon-light-text-primary dark:text-horizon-text-primary placeholder-horizon-light-text-tertiary dark:placeholder-horizon-text-tertiary focus:outline-none resize-y max-h-96"
                    rows={1}
                />
            </div>
            <div className="flex items-center justify-end gap-2 mt-2">
                <button
                    onClick={onCancel}
                    className="px-3 py-1 text-sm font-semibold text-horizon-light-text-secondary dark:text-horizon-text-secondary hover:bg-horizon-light-item dark:hover:bg-horizon-item rounded-md transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="px-3 py-1 text-sm font-semibold bg-horizon-accent text-white rounded-md hover:bg-horizon-accent-hover transition-colors"
                >
                    Save & Submit
                </button>
            </div>
        </div>
    );
});

interface ChatMessageBubbleProps {
  message: ChatMessage;
  activeGem: Gem | null;
  userProfile: UserProfile | null;
  aiProfile: AIProfile | null;
  customization: CustomizationSettings;
  isEditing: boolean;
  isSpeaking: boolean;
  isStreaming: boolean;
  favoritePrompts: FavoritePrompt[];
  bookmarks: Bookmark[];
  chatId: string;
  chatTitle: string;
  onSetEditingId: (id: string | null) => void;
  onSaveAndSubmit: (messageId: string, newContent: string) => void;
  onRegenerate: (aiMessageId: string) => void;
  onReadAloud: (messageId: string, text: string) => void;
  onAddFavoritePrompt: (text: string) => void;
  onRemoveFavoritePrompt: (id: string) => void;
  onAddBookmark: (content: string, chatId: string, chatTitle: string) => void;
  onRemoveBookmark: (bookmarkId: string) => void;
  onRequestCodeModification: (messageId: string, type: CodeModificationType, details?: { targetLanguage?: string; featureRequest?: string; }) => void;
  activeModificationMessageId: string | null;
  onOpenInCollection: (code: CodeBlock) => void;
  onUpdateInterest: (interest: keyof UserInterestProfile, amount: number) => void;
  parseMediaLinks: (content: string) => ParseResult;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = React.memo((props) => {
  const { message, activeGem, userProfile, aiProfile, customization, isEditing, isSpeaking, isStreaming, onSetEditingId, onSaveAndSubmit, onRegenerate, onReadAloud, favoritePrompts, onAddFavoritePrompt, onRemoveFavoritePrompt, bookmarks, chatId, chatTitle, onAddBookmark, onRemoveBookmark, onRequestCodeModification, activeModificationMessageId, onOpenInCollection, onUpdateInterest, parseMediaLinks } = props;
  const isUser = message.author === MessageAuthor.USER;
  const containerId = `message-${message.id}`;

  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');
  
  const handleCopy = (content: string) => {
    if (!content) return;
    navigator.clipboard.writeText(content).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleActionClick = (action: 'share' | 'good' | 'bad') => {
      let textToCopy = '';
      let alertMessage = '';
      switch (action) {
          case 'share':
              setShared(true);
              textToCopy = message.content;
              alertMessage = "Content copied for sharing!";
              setTimeout(() => setShared(false), 2000);
              break;
          case 'good':
              alert("Thank you for your feedback!");
              break;
          case 'bad':
              alert("Thank you, we'll use your feedback to improve.");
              break;
      }
      if (textToCopy) {
         navigator.clipboard.writeText(textToCopy).then(() => {
             if (alertMessage) alert(alertMessage);
         });
      }
  };

  useEffect(() => {
    if (isUser || message.codeBlock || message.isGeneratingImage) {
        setDisplayedContent(message.content);
        return;
    };

    // When not streaming, immediately show the full content and stop any ongoing animation.
    if (!isStreaming) {
      setDisplayedContent(message.content);
      return;
    }

    // This handles the "typing" animation.
    if (displayedContent.length < message.content.length) {
      const timeoutId = setTimeout(() => {
        // Use a substring approach which is slightly more robust if content shrinks.
        setDisplayedContent(message.content.substring(0, displayedContent.length + 1));
      }, 35); // Slowed down typing speed for a smoother, more deliberate effect.
      return () => clearTimeout(timeoutId);
    }
    
    // This handles regeneration, where the message content becomes empty.
    if (message.content.length === 0 && displayedContent.length > 0) {
        setDisplayedContent('');
    }
  }, [isUser, isStreaming, message.content, message.codeBlock, message.isGeneratingImage, displayedContent]);

  const existingBookmark = useMemo(() => bookmarks.find(b => b.content === message.content && b.chatId === chatId), [bookmarks, message.content, chatId]);

  const handleToggleBookmark = () => {
    if (!message.content) return;
    if (existingBookmark) {
        onRemoveBookmark(existingBookmark.id);
    } else {
        onAddBookmark(message.content, chatId, chatTitle);
    }
  };


  if (isUser) {
    const hasImage = !!message.imageFile;
    const hasContent = message.content && message.content.trim().length > 0;
    if (!hasImage && !hasContent && !isEditing) return null;

    const existingFavorite = favoritePrompts.find(p => p.text === message.content);
    const handleToggleFavorite = () => {
        if (!hasContent) return;
        if (existingFavorite) {
            onRemoveFavoritePrompt(existingFavorite.id);
        } else {
            onAddFavoritePrompt(message.content);
        }
    };

    return (
      <div id={containerId} className="flex justify-end items-center mb-6 gap-3 animate-scale-in-pop group">
        <div className="flex items-center self-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button onClick={handleToggleFavorite} title={existingFavorite ? 'Remove from favorites' : 'Add to favorites'} className="p-1.5 rounded-full text-horizon-text-tertiary hover:bg-white/10 hover:text-yellow-400">
                <StarIcon className={`w-4 h-4 transition-colors ${existingFavorite ? 'fill-current text-yellow-400' : ''}`} />
            </button>
            <button onClick={() => onSetEditingId(message.id)} title="Edit prompt" className="p-1.5 rounded-full text-horizon-text-tertiary hover:bg-white/10 hover:text-white">
                <PencilIcon className="w-4 h-4" />
            </button>
        </div>
        <div className="max-w-xl w-full">
            <p className="text-right text-horizon-light-text-primary dark:text-horizon-text-primary font-semibold text-sm mb-1">{userProfile?.name || 'You'}</p>
            {isEditing ? (
                 <UserMessageEditor message={message} onSave={onSaveAndSubmit} onCancel={() => onSetEditingId(null)} />
            ): (
                <div style={{ perspective: '800px' }}>
                    <div 
                      className="[transform-style:preserve-3d] transition-transform duration-500 ease-in-out group-hover:[transform:rotateY(-5deg)] float-right"
                    >
                      {customization.showUserBubble ? (
                            <div className="message-glass-wrapper rounded-xl rounded-br-none">
                                <div className="message-glass-effect"></div>
                                <div className="message-glass-tint !bg-horizon-accent/10 dark:!bg-horizon-accent/20"></div>
                                <div className="message-glass-shine"></div>
                                <div className="message-glass-content p-3 text-horizon-light-text-primary dark:text-horizon-text-primary">
                                    <MessageContent message={message} parseMediaLinks={parseMediaLinks} />
                                </div>
                            </div>
                      ) : (
                          <div className="text-right">
                              <MessageContent message={message} parseMediaLinks={parseMediaLinks} />
                          </div>
                      )}
                    </div>
                </div>
            )}
        </div>
        <div className="flex-shrink-0 animate-breathing rounded-full">
             <img src={userProfile?.avatarUrl || 'https://i.pravatar.cc/40?u=default'} alt="Your Avatar" className="w-8 h-8 rounded-full"/>
        </div>
      </div>
    );
  }

  // AI Message
  const aiName = activeGem?.name || (aiProfile?.enabled ? aiProfile.name : 'HorizonAI');
  const aiAvatar = activeGem ? <GemAvatar gem={activeGem} className="w-8 h-8"/> : (
    aiProfile?.enabled && aiProfile.avatarUrl ? (
        <img src={aiProfile.avatarUrl} alt={aiProfile.name} className="w-8 h-8 rounded-full object-cover" />
    ) : (
        <div className="w-8 h-8 bg-purple-400 rounded-full flex-shrink-0 flex items-center justify-center">
            <GptsIcon className="w-5 h-5 text-white" />
        </div>
    )
  );
  
  if (message.isGeneratingImage) {
    return (
        <div id={containerId} className="flex justify-start items-start mb-6 gap-3 animate-scale-in-pop group">
            <div className="flex-shrink-0 animate-breathing rounded-full">{aiAvatar}</div>
            <div className="max-w-xl w-full" style={{ perspective: '800px' }}>
                <p className="text-left text-horizon-light-text-primary dark:text-horizon-text-primary font-semibold text-sm mb-1">{aiName}</p>
                <div className="relative [transform-style:preserve-3d] transition-transform duration-500 ease-in-out group-hover:[transform:rotateY(5deg)]">
                    <div className="message-glass-wrapper rounded-xl rounded-bl-none">
                        <div className="message-glass-effect"></div>
                        <div className="message-glass-tint bg-white/10 dark:bg-black/20"></div>
                        <div className="message-glass-shine"></div>
                        <div className="message-glass-content p-4">
                            <ImageGenerationPlaceholder />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  const contentToDisplay = isStreaming ? displayedContent : message.content;
  const showWaveLoader = isStreaming && contentToDisplay.length === 0 && !message.codeBlock && !message.imageFile;

  return (
    <div id={containerId} className="flex justify-start items-start mb-6 gap-3 animate-scale-in-pop group">
       <div className="flex-shrink-0 animate-breathing rounded-full">
            {aiAvatar}
        </div>
      <div className="max-w-xl w-full" style={{ perspective: '800px' }}>
        <p className="text-left text-horizon-light-text-primary dark:text-horizon-text-primary font-semibold text-sm mb-1">{aiName}</p>

        {message.codeBlock ? (
             <CodeBlockComponent 
                code={message.codeBlock} 
                messageId={message.id}
                onRequestModification={onRequestCodeModification}
                isLoading={activeModificationMessageId === message.id}
                onOpenInCollection={onOpenInCollection}
                onCopyCode={() => onUpdateInterest('developer', 1)}
             />
        ) : (
            <div className="relative [transform-style:preserve-3d] transition-transform duration-500 ease-in-out group-hover:[transform:rotateY(5deg)]">
                {customization.showGptBubble ? (
                    <div className="message-glass-wrapper rounded-xl rounded-bl-none">
                        <div className="message-glass-effect"></div>
                        <div className="message-glass-tint bg-white/10 dark:bg-black/20"></div>
                        <div className="message-glass-shine"></div>
                        <div className="message-glass-content p-4 text-horizon-light-text-primary dark:text-horizon-text-primary">
                            {showWaveLoader ? <WaveLoader /> : <MessageContent message={{...message, content: contentToDisplay}} parseMediaLinks={parseMediaLinks} />}
                            {message.groundingMetadata && <GroundingSources metadata={message.groundingMetadata} />}
                        </div>
                    </div>
                ) : (
                    <div className="text-left">
                        {showWaveLoader ? <WaveLoader /> : <MessageContent message={{...message, content: contentToDisplay}} parseMediaLinks={parseMediaLinks} />}
                        {message.groundingMetadata && <GroundingSources metadata={message.groundingMetadata} />}
                    </div>
                )}
                {/* Show controls only when streaming is done and there's content */}
                {!isStreaming && (message.content || message.imageFile) && (
                    <div className="mt-2 flex items-center space-x-3 text-horizon-light-text-tertiary dark:text-horizon-text-tertiary opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300">
                        {message.content &&
                          <>
                            <button title={existingBookmark ? "Bookmarked" : "Bookmark"} onClick={handleToggleBookmark} className="hover:text-horizon-light-text-primary dark:hover:text-horizon-text-primary">
                                <BookmarkIcon className={`w-4 h-4 transition-colors ${existingBookmark ? 'fill-current text-yellow-400' : ''}`} />
                            </button>
                            <button onClick={() => handleCopy(message.content)} title={copied ? "Copied!" : "Copy"} className="hover:text-horizon-light-text-primary dark:hover:text-horizon-text-primary">
                                {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
                            </button>
                            <button title="Good response" onClick={() => handleActionClick('good')} className="hover:text-horizon-light-text-primary dark:hover:text-horizon-text-primary">
                                <ThumbsUpIcon className="w-4 h-4" />
                            </button>
                            <button title="Bad response" onClick={() => handleActionClick('bad')} className="hover:text-horizon-light-text-primary dark:hover:text-horizon-text-primary">
                                <ThumbsDownIcon className="w-4 h-4" />
                            </button>
                            <button title={isSpeaking ? "Stop reading" : "Read aloud"} onClick={() => onReadAloud(message.id, message.content)} className="hover:text-horizon-light-text-primary dark:hover:text-horizon-text-primary">
                                {isSpeaking ? <VolumeOffIcon className="w-4 h-4 text-horizon-accent" /> : <VolumeUpIcon className="w-4 h-4" />}
                            </button>
                            <button title="Regenerate" onClick={() => onRegenerate(message.id)} className="hover:text-horizon-light-text-primary dark:hover:text-horizon-text-primary">
                                <RefreshCwIcon className="w-4 h-4" />
                            </button>
                            <button title={shared ? "Copied!" : "Share"} onClick={() => handleActionClick('share')} className="hover:text-horizon-light-text-primary dark:hover:text-horizon-text-primary">
                                {shared ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ShareIcon className="w-4 h-4" />}
                            </button>
                          </>
                        }
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
});

// --- Reworked Suggestion & Initial State Components ---

interface ActionCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    style?: React.CSSProperties;
    imageUrl?: string;
    tag?: string;
}

const ActionCard: React.FC<ActionCardProps> = React.memo(({ icon, title, description, onClick, style, imageUrl, tag }) => {
    return (
        <div
            onClick={onClick}
            style={style}
            className="animate-fade-in-up w-full h-full cursor-pointer"
        >
            <div className="liquid-glass-card group relative p-6 w-full text-left rounded-2xl h-full overflow-hidden">
                 {imageUrl && (
                    <>
                        <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-transform duration-500 ease-in-out group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                    </>
                )}
                 {tag && (
                    <div className="absolute top-4 right-4 z-20">
                        <span className="tag-18-plus text-[10px] px-2 py-1 rounded-full leading-none shadow-md">
                            {tag}
                        </span>
                    </div>
                 )}
                 <div className="liquid-glass--bend"></div>
                 <div className="liquid-glass--face" style={{ backgroundColor: imageUrl ? 'transparent' : 'rgba(255, 255, 255, 0.02)' }}></div>
                 <div className="liquid-glass--edge"></div>
                
                 <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                         <div className="p-3 bg-black/30 backdrop-blur-sm rounded-lg inline-block text-horizon-accent mb-4 [transform:translateZ(40px)] border border-white/10">
                            {icon}
                        </div>
                    </div>
                    <div>
                         <h3 className="font-bold text-lg text-white [transform:translateZ(20px)]" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{title}</h3>
                        <p className="text-sm text-slate-300 mt-1 [transform:translateZ(20px)]" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{description}</p>
                    </div>
                 </div>
            </div>
        </div>
    );
});


interface InitialStateProps {
    userProfile: UserProfile | null;
    onSuggestionClick: (text: string) => void;
    onShowImageGeneration: () => void;
    onShowStoryWriter: () => void;
    onShowRolePlay: () => void;
    isNsfwModeEnabled: boolean;
    onShowAIGirlfriends: () => void;
    onShow18PlusTalk: () => void;
    onShowSexualProfile: () => void;
}

const ActionChip: React.FC<{
    icon: React.ReactNode;
    text: string;
    onClick: (text: string) => void;
    style?: React.CSSProperties;
}> = React.memo(({ icon, text, onClick, style }) => {
    return (
        <button
            style={style}
            onClick={() => onClick(text)}
            className="group relative p-4 w-full text-left bg-gradient-to-br from-white/10 to-white/0 dark:from-black/30 dark:to-black/10 ui-blur-effect border border-white/10 dark:border-white/5 rounded-2xl transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-horizon-accent/20 hover:border-horizon-accent/60 overflow-hidden animate-fade-in-up"
        >
            {/* Shine effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:animate-holographic-glare pointer-events-none z-0"></div>

            <div className="relative flex items-center gap-4 z-10">
                <div className="p-2 bg-slate-900/40 border border-white/10 group-hover:bg-horizon-accent/20 rounded-xl text-slate-300 group-hover:text-white transition-all duration-300">
                    {icon}
                </div>
                <p className="font-semibold text-sm text-horizon-light-text-secondary dark:text-slate-200 leading-tight">
                    {text}
                </p>
            </div>
        </button>
    );
});

const InitialState: React.FC<InitialStateProps> = React.memo(({ userProfile, onSuggestionClick, onShowImageGeneration, onShowStoryWriter, onShowRolePlay, isNsfwModeEnabled, onShowAIGirlfriends, onShow18PlusTalk, onShowSexualProfile }) => {
    const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        generateWelcomeMessage()
            .then(setWelcomeMessage)
            .catch(err => {
                console.error(err);
                setWelcomeMessage("What are we creating, exploring, or solving today?");
            });
    }, []);
    
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };
    
    const actionSuggestions = [
        { icon: <PencilIcon className="w-5 h-5"/>, text: "Help me write a blog post about..." },
        { icon: <SendIcon className="w-5 h-5"/>, text: "Draft a professional email to..." },
        { icon: <PaletteIcon className="w-5 h-5"/>, text: "Brainstorm ideas for a new logo" },
        { icon: <FileCodeIcon className="w-5 h-5"/>, text: "Write a python script to..." },
        { icon: <FileTextIcon className="w-5 h-5"/>, text: "Summarize the key points of this text..." },
        { icon: <BarChart2Icon className="w-5 h-5"/>, text: "Analyze data and find trends" },
        { icon: <ThumbsUpIcon className="w-5 h-5"/>, text: "List pros & cons for a decision" },
        { icon: <BugIcon className="w-5 h-5"/>, text: "Review my code for potential bugs" },
        { icon: <BrainCircuitIcon className="w-5 h-5"/>, text: "Explain a complex topic simply" },
        { icon: <BookOpenIcon className="w-5 h-5"/>, text: "Tell me a fun fact about the ocean" },
        { icon: <VideoIcon className="w-5 h-5"/>, text: "Recommend a movie to watch" },
        { icon: <GlobeIcon className="w-5 h-5"/>, text: "Plan a 3-day trip to Paris" },
        { icon: <ZapIcon className="w-5 h-5"/>, text: "Create a personalized workout plan" },
        { icon: <UsersIcon className="w-5 h-5"/>, text: "Help me prepare for a job interview" },
        { icon: <CheckCircleIcon className="w-5 h-5"/>, text: "What are some good ways to save money?" },
        { icon: <LightbulbIcon className="w-5 h-5"/>, text: "Outline a marketing strategy for a new coffee shop" },
    ];

    const visibleSuggestions = showAll ? actionSuggestions : actionSuggestions.slice(0, 8);


    return (
        <div className="flex flex-col items-center justify-start text-center p-4 py-8 md:py-16">
            <div className="w-full max-w-5xl mx-auto">
                <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-slate-100 to-slate-400"
                        style={{ textShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' }}>
                        {getGreeting()}, {userProfile?.name || 'Explorer'}!
                    </h1>

                    <p className="mt-4 text-lg text-horizon-light-text-secondary dark:text-horizon-text-secondary min-h-[1.75rem]">
                        {welcomeMessage === null ? (
                            <span className="inline-block w-3/4 h-4 rounded-full bg-slate-700/50 animate-pulse"></span>
                        ) : (
                            welcomeMessage
                        )}
                    </p>
                </div>
                
                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                     <ActionCard 
                        icon={<ImageIcon className="w-7 h-7" />}
                        title="Generate an Image"
                        description="Bring your ideas to life with stunning visuals."
                        onClick={onShowImageGeneration}
                        style={{ animationDelay: '200ms' }}
                        imageUrl="https://i.postimg.cc/Z5Mbn6mD/download.jpg"
                     />
                     <ActionCard 
                        icon={<BookOpenIcon className="w-7 h-7" />}
                        title="Write a Story"
                        description="Craft compelling narratives with an AI co-author."
                        onClick={onShowStoryWriter}
                        style={{ animationDelay: '300ms' }}
                        imageUrl="https://i.postimg.cc/zBN9Gfy2/download-1.jpg"
                     />
                     <ActionCard 
                        icon={<UsersIcon className="w-7 h-7" />}
                        title="Start a Role Play"
                        description="Engage in dynamic scenarios with custom characters."
                        onClick={onShowRolePlay}
                        style={{ animationDelay: '400ms' }}
                        imageUrl="https://i.postimg.cc/7Pdj5XJg/download-2.jpg"
                     />
                </div>

                {isNsfwModeEnabled && (
                    <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <HeartIcon className="w-6 h-6 text-red-400 animate-pulse-red-glow" />
                            <h2 className="text-2xl font-semibold text-red-300 tracking-wider">18+ Zone</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ActionCard
                                icon={<HeartIcon className="w-7 h-7" />}
                                title="AI Girlfriend"
                                description="Create and interact with virtual companions."
                                onClick={onShowAIGirlfriends}
                                style={{ animationDelay: '700ms' }}
                                imageUrl="https://i.postimg.cc/XJ5gDNP0/0b070a8e899940c1f0606a518f9c6d329e90af7599f11d4da17ca60614f9cfaf.jpg"
                                tag="18+"
                            />
                            <ActionCard
                                icon={<MicIcon className="w-7 h-7" />}
                                title="18+ Live Talk"
                                description="Engage in uncensored, adult-themed voice conversations."
                                onClick={onShow18PlusTalk}
                                style={{ animationDelay: '800ms' }}
                                imageUrl="https://i.postimg.cc/R0dmJ9dM/download-3.jpg"
                                tag="18+"
                            />
                            <ActionCard
                                icon={<BarChart2Icon className="w-7 h-7" />}
                                title="Sexual Profile"
                                description="Get a detailed 18+ analysis of your sexual performance."
                                onClick={onShowSexualProfile}
                                style={{ animationDelay: '900ms' }}
                                imageUrl="https://i.postimg.cc/SsXmB36P/dd6537c2d2dd1d261e1b4c07b47306756283c3f8d98380452dc51fe5c8f3fde2.jpg"
                                tag="18+"
                            />
                        </div>
                    </div>
                )}

                <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <p className="text-horizon-light-text-secondary dark:text-horizon-text-secondary">Or, try one of these starters:</p>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {visibleSuggestions.map((prompt, index) => (
                             <ActionChip
                                key={prompt.text}
                                icon={prompt.icon}
                                text={prompt.text}
                                onClick={onSuggestionClick}
                                style={{ animationDelay: `${index * 30}ms` }}
                            />
                        ))}
                    </div>
                     {actionSuggestions.length > 8 && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setShowAll(prev => !prev)}
                                className="px-6 py-2 bg-white/5 ui-blur-effect border border-white/10 rounded-full text-sm font-semibold text-horizon-text-secondary hover:text-white hover:border-white/20 transition-all duration-300"
                            >
                                {showAll ? 'Show Less' : 'Show More'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});


const ChatView: React.FC<ChatViewProps> = (props) => {
  const { messages, isLoading, activeGem, userProfile, aiProfile, customization, editingMessageId, speakingMessageId, onSetEditingId, onSaveAndSubmit, onRegenerate, onReadAloud, onSuggestionClick, onShowImageGeneration, onShowStoryWriter, onShowRolePlay, proactiveSuggestion, onDismissProactiveSuggestion, parseMediaLinks, onShowAIGirlfriends, onShow18PlusTalk, onShowSexualProfile } = props;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const handleMarkerClick = useCallback((messageId: string) => {
    const element = scrollRef.current?.querySelector(`#message-${messageId}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const isScrolledToBottom = scrollRef.current.scrollHeight - scrollRef.current.scrollTop - scrollRef.current.clientHeight < 1;
      if (isScrolledToBottom) {
        scrollToBottom();
      }
    }
  }, [messages, isLoading]);
  
  useEffect(() => {
    const handleScroll = () => {
        if (scrollRef.current) {
            const isScrolledUp = scrollRef.current.scrollHeight - scrollRef.current.scrollTop > scrollRef.current.clientHeight + 100;
            setShowScrollDown(isScrolledUp);
        }
    };
    const currentScrollRef = scrollRef.current;
    currentScrollRef?.addEventListener('scroll', handleScroll);
    return () => currentScrollRef?.removeEventListener('scroll', handleScroll);
  }, []);
  
  const PreviewInitialState = () => {
    const gemName = activeGem?.name;
    const gemAvatar = activeGem ? <GemAvatar gem={activeGem} className="w-16 h-16" /> : null;

    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-horizon-light-text-tertiary dark:text-horizon-text-tertiary">
            <div className="mb-4 animate-breathing rounded-full">
                {gemAvatar}
            </div>
            <h2 className="text-xl font-semibold text-horizon-light-text-primary dark:text-horizon-text-primary">{gemName || 'Your Gem'}</h2>
            <p className="mt-1">{gemName ? 'Ask something to see how it responds.' : 'Give your Gem a name to start the preview.'}</p>
        </div>
    );
  };
  
  const scrollbarAlignmentClasses = {
      left: 'left-6',
      center: 'left-1/2 -translate-x-1/2',
      right: 'right-6'
  };

  const containerWidth = customization.chatFullWidth ? '100%' : `${customization.chatsWidth}rem`;

  return (
    <div className="flex-1 overflow-y-auto p-6 relative" ref={scrollRef}>
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-purple-500/10 dark:bg-purple-500/5 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
          <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-sky-500/10 dark:bg-sky-500/5 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
      </div>
      
      <div className="mx-auto relative z-10" style={{ maxWidth: containerWidth }}>
        {proactiveSuggestion && (
            <ProactiveWelcomeBanner suggestion={proactiveSuggestion} onDismiss={onDismissProactiveSuggestion} />
        )}
        {messages.length === 0 && !isLoading ? (
          activeGem?.id === 'preview-gem' ? <PreviewInitialState /> : 
          <InitialState 
              userProfile={userProfile}
              onSuggestionClick={onSuggestionClick}
              onShowImageGeneration={onShowImageGeneration}
              onShowStoryWriter={onShowStoryWriter}
              onShowRolePlay={onShowRolePlay}
              isNsfwModeEnabled={customization.isNsfwModeEnabled}
              onShowAIGirlfriends={onShowAIGirlfriends}
              onShow18PlusTalk={onShow18PlusTalk}
              onShowSexualProfile={onShowSexualProfile}
          />
        ) : (
          messages.map((msg, index) => {
              const isLastMessage = index === messages.length - 1;
              const isStreaming = isLoading && msg.author === MessageAuthor.AI && isLastMessage;

              return (
                  <ChatMessageBubble
                      key={msg.id}
                      message={msg}
                      activeGem={activeGem}
                      userProfile={userProfile}
                      aiProfile={aiProfile}
                      customization={customization}
                      isEditing={editingMessageId === msg.id}
                      isSpeaking={speakingMessageId === msg.id}
                      isStreaming={isStreaming}
                      {...props}
                  />
              );
          })
        )}
        {isLoading && messages.length > 0 && messages[messages.length - 1].author === MessageAuthor.USER && (
            <ChatMessageBubble
              message={{id: 'loading', author: MessageAuthor.AI, content: ''}}
              {...props}
              isEditing={false}
              isSpeaking={false}
              isStreaming={true}
            />
        )}
      </div>
      
      <MagicScrollbar
          messages={messages}
          activeGem={activeGem}
          onMarkerClick={handleMarkerClick}
      />
      
      {showScrollDown && (
          <button 
              onClick={scrollToBottom}
              className={`fixed bottom-24 ${scrollbarAlignmentClasses[customization.scrollDownButtonAlign]} z-10 p-2 bg-horizon-light-sidebar/80 dark:bg-horizon-sidebar/80 ui-blur-effect border border-horizon-light-item dark:border-horizon-item rounded-full text-horizon-light-text-primary dark:text-horizon-text-primary shadow-lg transition-opacity hover:bg-horizon-light-item dark:hover:bg-horizon-item`}
              title="Scroll to bottom"
            >
              <ChevronDownIcon className="w-6 h-6" />
          </button>
      )}
    </div>
  );
};

export default React.memo(ChatView);