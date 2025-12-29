
import React, { useRef, useEffect, useState } from 'react';
import { NewChatIcon, MessageSquareIcon, TrashIcon, HeartIcon, SunIcon, MoonIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon, CogIcon, BrainCircuitIcon, ImageIcon, VideoIcon, BookOpenIcon, UsersIcon, BookmarkIcon, FileCodeIcon, ZapIcon, BarChart2Icon, TelescopeIcon, CameraIcon, DatabaseIcon, LightbulbIcon, MicIcon, KeyboardIcon, ContrastIcon, InfoIcon, GlobeIcon, QuillIcon } from './icons';
import { ChatSession, Gem, UserProfile } from '../types';
import { Logo } from './Logo';
import GemAvatar from './GemAvatar';
import HoverDetailCard from './HoverDetailCard';

const DESCRIPTIONS: Record<string, string> = {
    'newChat': "Start a fresh conversation with the AI.",
    'liveTalk': "Engage in a real-time voice conversation with your selected AI persona.",
    'rolePlay': "Create characters and immerse yourself in dynamic, interactive scenarios.",
    'storyWriter': "Collaborate with the AI to write compelling stories, from short tales to epic sagas.",
    'imageGeneration': "Bring your ideas to life. Generate stunning visuals from text prompts.",
    'codeCollection': "Your personal library of AI-generated and saved code snippets.",
    'workflows': "Automate complex tasks by chaining multiple AI actions into a single process.",
    'dataViz': "Upload CSV or other data files and chat with them to create insightful visualizations.",
    'smartVision': "Analyze your live camera feed to identify objects and understand your surroundings.",
    'searchChats': "Quickly find past conversations by searching for keywords or phrases.",
    'shortcuts': "View all available keyboard shortcuts to navigate the app faster.",
    'memory': "Manage the facts and preferences the AI remembers about you across all chats.",
    'bookmarks': "Access important messages you've saved from various conversations.",
    'storage': "View and manage your application data usage.",
    'guide': "A comprehensive guide to all the features and capabilities of this application.",
    'aiGirlfriend': "Create and interact with virtual companions in this 18+ zone.",
    'passionWeaver': "Craft and explore detailed, explicit 18+ interactive narratives.",
    '18PlusTalk': "Engage in uncensored, adult-themed voice conversations with AI personas.",
    'funZone': "An encyclopedia of 18+ topics, positions, and techniques to explore.",
    'objectOfDesire': "Brainstorm kinky and creative 18+ uses for any object you can imagine.",
    'anatomyExplorer': "An uncensored, detailed guide to the human body and its sexual functions.",
    'sexualProfile': "Get a detailed 18+ analysis of your sexual performance based on physical traits.",
    'appIdeaLab': "Generate extreme and creative 18+ feature ideas for your app concepts.",
    'deadOrAlive': "Engage in a high-stakes, 18+ survival role-play where your choices determine life or death.",
    '18PlusWebsites': "A curated collection of 18+ websites and resources (coming soon).",
    'eighteenPlusLetter': "Compose and receive explicit, AI-generated letters for role-playing or fantasy.",
    'humanTalk': "Experience a deeply realistic conversation with an AI that has evolving emotions, memory, and trust.",
    'exploreGems': "Discover and manage a collection of pre-configured AI personas with unique skills and personalities.",
    'eighteenPlusCharacterStory': "Create and explore explicit stories centered around specific characters. (Coming soon)",
    'sister': "Interact with a caring, supportive AI sister persona (Coming Soon).",
};


interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: (element: HTMLButtonElement | null) => void;
  isActive?: boolean;
  sessionId?: string;
  onDelete?: (id: string) => void;
  isCollapsed: boolean;
  index: number;
  tags?: string[];
  description: string;
  onMouseEnter: (element: HTMLButtonElement | null, details: any) => void;
  onMouseLeave: () => void;
}

const NavItem: React.FC<NavItemProps> = React.memo(({ icon, label, onClick, isActive, sessionId, onDelete, isCollapsed, index, tags, description, onMouseEnter, onMouseLeave }) => {
    const itemRef = useRef<HTMLButtonElement>(null);

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
            case 'Core': return 'tag-core';
            default: return 'bg-slate-500 text-white'; // Fallback
        }
    };
    
    const details = { icon, label, description, tag: tags?.[0] };

    return (
      <div 
        className="relative group"
        onMouseEnter={() => onMouseEnter(itemRef.current, details)}
        onMouseLeave={onMouseLeave}
      >
        <button
          ref={itemRef}
          onClick={() => onClick?.(itemRef.current)}
          className={`flex group items-center w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 ease-in-out 
                     hover:bg-horizon-light-item-hover/50 dark:hover:bg-horizon-item-hover/50 hover:translate-x-1
                     ${isActive 
                        ? 'bg-horizon-accent/20 dark:bg-horizon-accent/20 text-horizon-accent font-semibold shadow-inner shadow-horizon-accent/20' 
                        : 'text-horizon-light-text-primary dark:text-horizon-text-primary bg-transparent'}`}
        >
          <div className="flex-shrink-0 transition-transform duration-300">{icon}</div>

          <div
            className="flex-1 flex items-center justify-between ml-3 overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              transform: !isCollapsed ? 'translateX(0px)' : 'translateX(-20px)',
              opacity: !isCollapsed ? 1 : 0,
              transitionDelay: `${!isCollapsed ? index * 25 : (10-index) * 15}ms`,
            }}
          >
            <span className="truncate text-left">{label}</span>
            {tags && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {tags.map(tag => (
                      <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none shadow-md ${getTagClass(tag)}`}>
                        {tag}
                      </span>
                    ))}
                </div>
            )}
            {sessionId && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(sessionId);
                }}
                className="p-1 rounded-md -mr-1 text-horizon-light-text-tertiary dark:text-horizon-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Delete chat titled ${label}`}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </button>
      </div>
    );
});


interface SidebarProps {
  sessions: ChatSession[];
  gems: Gem[];
  userProfile: UserProfile | null;
  activeChatId: string | null;
  isCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onShowGems: () => void;
  onNewChatWithGem: (gem: Gem, sourceElement: HTMLElement | null) => void;
  onToggleCollapse: () => void;
  onToggleTheme: () => void;
  onShowSearch: () => void;
  onShowMemory: () => void;
  onShowBookmarks: () => void;
  onShowImageGeneration: () => void;
  onShowWebcam: () => void;
  onShowStoryWriter: () => void;
  onShowRolePlay: () => void;
  onShowCodeCollection: () => void;
  onShowWorkflows: () => void;
  onShowDataVisualizer: () => void;
  onShowAIGirlfriends: () => void;
  onShowMediaAnalysis: () => void;
  onShowStorage: () => void;
  onShowPassionWeaver: () => void;
  onShowAppIdeaGenerator: () => void;
  onShowObjectOfDesire: () => void;
  onShowAnatomyExplorer: () => void;
  onShowLiveTalk: () => void;
  onShow18PlusTalk: () => void;
  isNsfwModeEnabled: boolean;
  onShowFunZone: () => void;
  onShowShortcuts: () => void;
  onShowSexualProfile: () => void;
  onShowDeadOrAliveEditor: () => void;
  onShow18PlusLetter: () => void;
  onShow18PlusWebsites: () => void;
  onShowHumanTalk: () => void;
  onShowGuide: () => void;
  onShow18PlusCharacterStory: () => void;
  onShowSister: () => void;
}

const UserArea: React.FC<{
  userProfile: UserProfile | null,
  isCollapsed: boolean,
}> = React.memo(({ userProfile, isCollapsed }) => (
    <div className="flex items-center group p-1">
        <div className="flex-shrink-0">
            <img src={userProfile?.avatarUrl || 'https://i.pravatar.cc/40?u=default'} alt="User Avatar" className="w-8 h-8 rounded-full"/>
        </div>
        <div className={`flex-1 ml-3 min-w-0 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <p className="font-semibold text-sm truncate">{userProfile?.name || 'User'}</p>
        </div>
    </div>
));


const Sidebar: React.FC<SidebarProps> = ({ 
    sessions, 
    gems, 
    userProfile,
    activeChatId, 
    onNewChat, 
    onSelectChat, 
    onDeleteChat, 
    onShowGems, 
    onNewChatWithGem, 
    isCollapsed, 
    onToggleCollapse, 
    theme, 
    onToggleTheme,
    onShowSearch,
    onShowMemory,
    onShowBookmarks,
    onShowImageGeneration,
    onShowWebcam,
    onShowStoryWriter,
    onShowRolePlay,
    onShowCodeCollection,
    onShowWorkflows,
    onShowDataVisualizer,
    onShowAIGirlfriends,
    onShowMediaAnalysis,
    onShowStorage,
    onShowPassionWeaver,
    onShowAppIdeaGenerator,
    onShowObjectOfDesire,
    onShowAnatomyExplorer,
    onShowLiveTalk,
    onShow18PlusTalk,
    isNsfwModeEnabled,
    onShowFunZone,
    onShowShortcuts,
    onShowSexualProfile,
    onShowDeadOrAliveEditor,
    onShow18PlusLetter,
    onShow18PlusWebsites,
    onShowHumanTalk,
    onShowGuide,
    onShow18PlusCharacterStory,
    onShowSister,
}) => {
  let itemIndex = 0;
  const [hoveredItem, setHoveredItem] = useState<{ details: any; top: number } | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  const handleMouseEnter = (element: HTMLButtonElement | null, details: any) => {
    if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
    }
    if (!element) return;
    const rect = element.getBoundingClientRect();
    hoverTimeoutRef.current = window.setTimeout(() => {
        setHoveredItem({
            details,
            top: rect.top + rect.height / 2,
        });
    }, 400); // Shortened delay for better UX
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredItem(null);
  };

  return (
    <div 
      className={`relative z-30 h-full flex flex-col p-2 text-horizon-light-text-primary dark:text-horizon-text-primary transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'} 
                 bg-gradient-to-br from-horizon-light-sidebar/70 to-horizon-light-sidebar/90 dark:from-horizon-sidebar/80 dark:to-horizon-sidebar/95 ui-blur-effect border-r border-white/5`}
    >
      <HoverDetailCard details={hoveredItem?.details || null} position={hoveredItem ? { top: hoveredItem.top } : null} isCollapsed={isCollapsed} />
      <div 
        className="h-full flex flex-col transition-transform duration-300"
      >
        <div className="flex-shrink-0">
            <div className={`flex items-center mb-4 p-1 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <div className="flex items-center overflow-hidden">
                    <div className="px-1">
                      <Logo />
                    </div>
                    <span 
                      className={`ml-2 font-bold text-lg whitespace-nowrap bg-gradient-to-r from-slate-200 via-white to-purple-300 bg-clip-text text-transparent animate-logo-background-pan transition-opacity duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                      style={{ backgroundSize: '200% 200%' }}
                    >
                      HorizonAI
                    </span>
                </div>
            <button onClick={onNewChat} className={`p-2 rounded-md hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-200 ${isCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`} aria-label="Start new chat">
                <NewChatIcon className="w-5 h-5 text-horizon-light-text-secondary dark:text-horizon-text-secondary" />
            </button>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto pr-1 space-y-1">
            <div>
                <NavItem 
                icon={<NewChatIcon className="w-5 h-5 flex-shrink-0" />} 
                label="New chat" 
                onClick={onNewChat}
                isCollapsed={isCollapsed}
                index={itemIndex++}
                description={DESCRIPTIONS.newChat}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                />
                <NavItem 
                  icon={<MicIcon className="w-5 h-5 flex-shrink-0" />} 
                  label="Live Talk" 
                  onClick={onShowLiveTalk}
                  isCollapsed={isCollapsed}
                  index={itemIndex++}
                  tags={['Voice']}
                  description={DESCRIPTIONS.liveTalk}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                />
                 <NavItem 
                icon={<UsersIcon className="w-5 h-5 flex-shrink-0" />} 
                label="Role Play" 
                onClick={onShowRolePlay}
                isCollapsed={isCollapsed}
                index={itemIndex++}
                tags={['Creative']}
                description={DESCRIPTIONS.rolePlay}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                />
                 <NavItem 
                icon={<BookOpenIcon className="w-5 h-5 flex-shrink-0" />} 
                label="Story Writer" 
                onClick={onShowStoryWriter}
                isCollapsed={isCollapsed}
                index={itemIndex++}
                tags={['Creative']}
                description={DESCRIPTIONS.storyWriter}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                />
                <NavItem 
                icon={<ImageIcon className="w-5 h-5 flex-shrink-0" />} 
                label="Image Generation" 
                onClick={onShowImageGeneration}
                isCollapsed={isCollapsed}
                index={itemIndex++}
                tags={['Creative']}
                description={DESCRIPTIONS.imageGeneration}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                />
                 <NavItem 
                icon={<FileCodeIcon className="w-5 h-5 flex-shrink-0" />} 
                label="Code Collection" 
                onClick={onShowCodeCollection}
                isCollapsed={isCollapsed}
                index={itemIndex++}
                tags={['Dev']}
                description={DESCRIPTIONS.codeCollection}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                />
                <NavItem
                icon={<ZapIcon className="w-5 h-5 flex-shrink-0" />}
                label="Workflows"
                onClick={onShowWorkflows}
                isCollapsed={isCollapsed}
                index={itemIndex++}
                tags={['AI']}
                description={DESCRIPTIONS.workflows}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                />
                <NavItem
                icon={<BarChart2Icon className="w-5 h-5 flex-shrink-0" />}
                label="Data Viz"
                onClick={onShowDataVisualizer}
                isCollapsed={isCollapsed}
                index={itemIndex++}
                tags={['Data']}
                description={DESCRIPTIONS.dataViz}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                />
                <NavItem
                icon={<CameraIcon className="w-5 h-5 flex-shrink-0" />}
                label="Smart Vision"
                onClick={onShowMediaAnalysis}
                isCollapsed={isCollapsed}
                index={itemIndex++}
                tags={['AI']}
                description={DESCRIPTIONS.smartVision}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                />
                <NavItem 
                icon={<SearchIcon className="w-5 h-5 flex-shrink-0" />} 
                label="Search chats" 
                onClick={onShowSearch}
                isCollapsed={isCollapsed}
                index={itemIndex++}
                tags={['Core']}
                description={DESCRIPTIONS.searchChats}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                />
                <NavItem
                    icon={<KeyboardIcon className="w-5 h-5 flex-shrink-0" />}
                    label="Shortcuts"
                    onClick={onShowShortcuts}
                    isCollapsed={isCollapsed}
                    index={itemIndex++}
                    tags={['Core']}
                    description={DESCRIPTIONS.shortcuts}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                />
                 <NavItem
                    icon={<InfoIcon className="w-5 h-5 flex-shrink-0" />}
                    label="Guide"
                    onClick={onShowGuide}
                    isCollapsed={isCollapsed}
                    index={itemIndex++}
                    tags={['Core']}
                    description={DESCRIPTIONS.guide}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                />
                <NavItem 
                icon={<BrainCircuitIcon className="w-5 h-5 flex-shrink-0" />} 
                label="Memory" 
                onClick={onShowMemory}
                isCollapsed={isCollapsed}
                index={itemIndex++}
                tags={['AI']}
                description={DESCRIPTIONS.memory}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                />
                 <NavItem 
                icon={<BookmarkIcon className="w-5 h-5 flex-shrink-0" />} 
                label="Bookmarks" 
                onClick={onShowBookmarks}
                isCollapsed={isCollapsed}
                index={itemIndex++}
                tags={['Core']}
                description={DESCRIPTIONS.bookmarks}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                />
                <NavItem 
                icon={<DatabaseIcon className="w-5 h-5 flex-shrink-0" />} 
                label="Storage" 
                onClick={onShowStorage}
                isCollapsed={isCollapsed}
                index={itemIndex++}
                tags={['Core']}
                description={DESCRIPTIONS.storage}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                />
            </div>
            
             {/* --- 18+ ZONE --- */}
            {isNsfwModeEnabled && (
                <div className="pt-4">
                    <div className={`mb-2 px-3 text-xs font-semibold text-rose-400 tracking-wider uppercase transition-all duration-300 ${isCollapsed ? 'text-center' : ''}`}>
                        <span style={{ transitionDelay: `${!isCollapsed ? (itemIndex * 30) : 0}ms` }} className={isCollapsed ? 'opacity-0' : 'opacity-100'}>18+ Zone</span>
                        <span className={isCollapsed ? 'opacity-100' : 'opacity-0'}>+</span>
                    </div>
                    <NavItem 
                        icon={<HeartIcon className="w-5 h-5 flex-shrink-0" />} 
                        label="AI Girlfriend" 
                        onClick={onShowAIGirlfriends}
                        isCollapsed={isCollapsed}
                        index={itemIndex++}
                        tags={['18+', 'AI']}
                        description={DESCRIPTIONS.aiGirlfriend}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    />
                    <NavItem 
                        icon={<HeartIcon className="w-5 h-5 flex-shrink-0 text-red-400" />} 
                        label="Passion Weaver" 
                        onClick={onShowPassionWeaver}
                        isCollapsed={isCollapsed}
                        index={itemIndex++}
                        tags={['18+', 'Creative']}
                        description={DESCRIPTIONS.passionWeaver}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    />
                    <NavItem 
                        icon={<MicIcon className="w-5 h-5 flex-shrink-0 text-red-400" />} 
                        label="18+ Talk" 
                        onClick={onShow18PlusTalk}
                        isCollapsed={isCollapsed}
                        index={itemIndex++}
                        tags={['18+', 'Voice']}
                        description={DESCRIPTIONS['18PlusTalk']}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    />
                     <NavItem 
                        icon={<ZapIcon className="w-5 h-5 flex-shrink-0 text-red-400" />} 
                        label="18+ Fun Zone" 
                        onClick={onShowFunZone}
                        isCollapsed={isCollapsed}
                        index={itemIndex++}
                        tags={['18+', 'Creative']}
                        description={DESCRIPTIONS.funZone}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    />
                    <NavItem 
                        icon={<ZapIcon className="w-5 h-5 flex-shrink-0 text-red-400" />} 
                        label="Object of Desire" 
                        onClick={onShowObjectOfDesire}
                        isCollapsed={isCollapsed}
                        index={itemIndex++}
                        tags={['18+', 'Creative']}
                        description={DESCRIPTIONS.objectOfDesire}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    />
                    <NavItem 
                        icon={<ZapIcon className="w-5 h-5 flex-shrink-0 text-red-400" />} 
                        label="Anatomy Explorer" 
                        onClick={onShowAnatomyExplorer}
                        isCollapsed={isCollapsed}
                        index={itemIndex++}
                        tags={['18+', 'Data']}
                        description={DESCRIPTIONS.anatomyExplorer}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    />
                    <NavItem 
                        icon={<BarChart2Icon className="w-5 h-5 flex-shrink-0 text-red-400" />} 
                        label="Sexual Profile" 
                        onClick={onShowSexualProfile}
                        isCollapsed={isCollapsed}
                        index={itemIndex++}
                        tags={['18+', 'Data']}
                        description={DESCRIPTIONS.sexualProfile}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    />
                    <NavItem 
                        icon={<LightbulbIcon className="w-5 h-5 flex-shrink-0 text-red-400" />} 
                        label="App Idea Lab" 
                        onClick={onShowAppIdeaGenerator}
                        isCollapsed={isCollapsed}
                        index={itemIndex++}
                        tags={['18+', 'Creative']}
                        description={DESCRIPTIONS.appIdeaLab}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    />
                    <NavItem 
                        icon={<HeartIcon className="w-5 h-5 flex-shrink-0 text-red-500 animate-pulse-red-glow"/>} 
                        label="Dead or Alive" 
                        onClick={onShowDeadOrAliveEditor}
                        isCollapsed={isCollapsed}
                        index={itemIndex++}
                        tags={['18+', 'AI']}
                        description={DESCRIPTIONS.deadOrAlive}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    />
                     <NavItem 
                        icon={<UsersIcon className="w-5 h-5 flex-shrink-0 text-red-400" />} 
                        label="18+ Character Story" 
                        onClick={onShow18PlusCharacterStory}
                        isCollapsed={isCollapsed}
                        index={itemIndex++}
                        tags={['18+', 'New']}
                        description={DESCRIPTIONS.eighteenPlusCharacterStory}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    />
                    <NavItem 
                        icon={<QuillIcon className="w-5 h-5 flex-shrink-0 text-red-400" />} 
                        label="18+ Letter" 
                        onClick={onShow18PlusLetter}
                        isCollapsed={isCollapsed}
                        index={itemIndex++}
                        tags={['18+', 'Creative']}
                        description={DESCRIPTIONS.eighteenPlusLetter}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    />
                    <NavItem 
                        icon={<GlobeIcon className="w-5 h-5 flex-shrink-0 text-red-400" />} 
                        label="18+ Websites" 
                        onClick={onShow18PlusWebsites}
                        isCollapsed={isCollapsed}
                        index={itemIndex++}
                        tags={['18+', 'Data']}
                        description={DESCRIPTIONS['18PlusWebsites']}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    />
                </div>
            )}

            {/* --- ALMOST REAL ZONE --- */}
            <div className="pt-4">
                <div className={`mb-2 px-3 text-xs font-semibold text-yellow-400 tracking-wider uppercase transition-all duration-300 ${isCollapsed ? 'text-center' : ''}`}>
                    <span style={{ transitionDelay: `${!isCollapsed ? (itemIndex * 30) : 0}ms` }} className={isCollapsed ? 'opacity-0' : 'opacity-100'}>Almost Real</span>
                    <span className={isCollapsed ? 'opacity-100' : 'opacity-0'}>A</span>
                </div>
                <NavItem 
                    icon={<UsersIcon className="w-5 h-5 flex-shrink-0" />} 
                    label="Human Talk" 
                    onClick={onShowHumanTalk}
                    isCollapsed={isCollapsed}
                    index={itemIndex++}
                    tags={['Adult', 'AI']}
                    description={DESCRIPTIONS.humanTalk}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                />
                 <NavItem 
                    icon={<UsersIcon className="w-5 h-5 flex-shrink-0 text-pink-300" />} 
                    label="Sister" 
                    onClick={onShowSister}
                    isCollapsed={isCollapsed}
                    index={itemIndex++}
                    tags={['New', 'AI']}
                    description={DESCRIPTIONS.sister}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                />
            </div>

            {/* --- GEMS Section --- */}
            <div className="pt-4">
                <div className={`mb-2 px-3 text-xs font-semibold text-horizon-light-text-tertiary dark:text-horizon-text-tertiary tracking-wider uppercase transition-all duration-300 ${isCollapsed ? 'text-center' : ''}`}>
                    <span style={{ transitionDelay: `${!isCollapsed ? (itemIndex * 30) : 0}ms` }} className={isCollapsed ? 'opacity-0' : 'opacity-100'}>Gems</span>
                    <span className={isCollapsed ? 'opacity-100' : 'opacity-0'}>G</span>
                </div>
                
                {gems.map(gem => (
                    <NavItem
                        key={gem.id}
                        icon={<GemAvatar gem={gem} className="w-7 h-7" />}
                        label={gem.name}
                        onClick={(el) => onNewChatWithGem(gem, el)}
                        isCollapsed={isCollapsed}
                        index={itemIndex++}
                        description={`Custom AI Persona: ${gem.name}. Click to start a new chat.`}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    />
                ))}

                <NavItem
                    icon={
                        <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center">
                            <HeartIcon className="w-5 h-5 text-horizon-light-text-secondary dark:text-horizon-text-secondary group-hover:text-horizon-light-text-primary dark:group-hover:text-horizon-text-primary" />
                        </div>
                    }
                    label="Explore Gems"
                    onClick={onShowGems}
                    isCollapsed={isCollapsed}
                    index={itemIndex++}
                    tags={['AI']}
                    description={DESCRIPTIONS.exploreGems}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                />
            </div>


            {/* --- Recent Section --- */}
            {sessions.length > 0 && (
            <div className="pt-4">
                <div className={`mb-2 px-3 text-xs font-semibold text-horizon-light-text-tertiary dark:text-horizon-text-tertiary tracking-wider uppercase transition-all duration-300 ${isCollapsed ? 'text-center' : ''}`}>
                    <span style={{ transitionDelay: `${!isCollapsed ? (itemIndex * 30) : 0}ms` }} className={isCollapsed ? 'opacity-0' : 'opacity-100'}>Recent</span>
                    <span className={isCollapsed ? 'opacity-100' : 'opacity-0'}>R</span>
                </div>
                {sessions.map(session => (
                    <NavItem 
                        key={session.id}
                        sessionId={session.id}
                        icon={<MessageSquareIcon className="w-5 h-5 flex-shrink-0" />} 
                        label={session.title} 
                        onClick={() => onSelectChat(session.id)}
                        isActive={session.id === activeChatId}
                        onDelete={onDeleteChat}
                        isCollapsed={isCollapsed}
                        index={itemIndex++}
                        description={`Continue your conversation about "${session.title}".`}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    />
                ))}
            </div>
            )}
        </div>

        {/* --- Footer Controls --- */}
        <div className="flex-shrink-0 pt-2 mt-auto">
            <div className="border-t border-white/10 p-2">
                <UserArea userProfile={userProfile} isCollapsed={isCollapsed} />
            </div>
            <div className={`flex items-center space-x-2 border-t border-white/10 pt-2 ${isCollapsed ? 'flex-col space-y-2' : ''}`}>
                <button 
                    onClick={onToggleTheme}
                    className="flex-1 w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5"
                    title={`Switch to next theme`}
                    >
                        {theme === 'light' ? <MoonIcon className="w-5 h-5 text-horizon-light-text-secondary dark:text-horizon-text-secondary"/> : theme === 'dark' ? <SunIcon className="w-5 h-5 text-horizon-light-text-secondary dark:text-horizon-text-secondary"/> : <ContrastIcon className="w-5 h-5 text-horizon-light-text-secondary dark:text-horizon-text-secondary"/>}
                </button>
                <button 
                    onClick={onToggleCollapse} 
                    className="flex-1 w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                    {isCollapsed ? <ChevronRightIcon className="w-5 h-5 text-horizon-light-text-secondary dark:text-horizon-text-secondary" /> : <ChevronLeftIcon className="w-5 h-5 text-horizon-light-text-secondary dark:text-horizon-text-secondary" />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Sidebar);
