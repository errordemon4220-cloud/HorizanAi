import React, { useState } from 'react';
import { AdultWebsite } from '../types';
import { ChevronLeftIcon, GlobeIcon, XIcon, StarIcon, ExternalLinkIcon } from './icons';

// Data for the websites
const websites: AdultWebsite[] = [
  {
    id: 'perchance-ai-image',
    name: 'Perchance AI Image Generator',
    url: 'https://perchance.org/ai-text-to-image-generator',
    description: "A powerful, free, and community-driven AI text-to-image generator. It allows users to create images from text prompts using various AI models. It's highly customizable, letting users fine-tune prompts, styles, and even create their own generator templates. While versatile, it can be used to generate explicit and NSFW content depending on the prompt and model used.",
    adultLevel: {
      rating: 4,
      label: 'High Potential'
    },
    tags: ["AI", "Image Generation", "Free", "Customizable", "NSFW Capable"],
    imageUrl: 'https://i.postimg.cc/fb91k2m1/download_(49).jpg'
  },
  {
    id: 'unlucid-ai',
    name: 'Unlucid.ai',
    url: 'https://unlucid.ai/',
    description: "An AI image generator known for its ability to create highly realistic and often explicit NSFW images. It offers various models and styles, making it popular for uncensored artistic creation and adult content.",
    adultLevel: {
      rating: 5,
      label: 'Uncensored Generation'
    },
    tags: ["AI", "Image Generation", "Uncensored", "NSFW"],
    imageUrl: 'https://i.postimg.cc/Ssb396GR/download_(48).jpg'
  },
  {
    id: 'venice-ai',
    name: 'Venice.ai',
    url: 'https://venice.ai/chat',
    description: "A platform offering access to various uncensored large language models (LLMs). It allows for unfiltered chat experiences, including erotic role-play and explicit conversations, without the content restrictions found on mainstream platforms.",
    adultLevel: {
      rating: 5,
      label: 'Uncensored Chat'
    },
    tags: ["AI", "Chatbot", "Uncensored", "LLM"],
    imageUrl: 'https://i.postimg.cc/RF18LWPR/download_(47).jpg'
  },
  {
    id: 'pornpics',
    name: 'PornPics',
    url: 'https://www.pornpics.com/',
    description: "A large, well-established image hosting site dedicated to high-quality pornographic pictures. It features a vast collection of categorized images from various studios and amateur creators.",
    adultLevel: {
      rating: 5,
      label: 'Hardcore Porn'
    },
    tags: ["Porn", "Images", "Hardcore"],
    imageUrl: 'https://i.postimg.cc/VvYhGzpc/download_(46).jpg'
  },
  {
    id: 'xhamster',
    name: 'xHamster',
    url: 'https://xhamster.com/',
    description: "One of the world's largest tube sites, offering a massive library of free pornographic videos, images, and stories. It covers nearly every category imaginable, from amateur content to professional productions.",
    adultLevel: {
      rating: 5,
      label: 'Hardcore Porn'
    },
    tags: ["Porn", "Videos", "Tube Site", "Amateur"],
    imageUrl: 'https://i.postimg.cc/4dG2yJJh/download_(50).jpg'
  },
  {
    id: 'crushon-ai',
    name: 'CrushOn.ai',
    url: 'https://crushon.ai/',
    description: "An AI chat platform focused on creating immersive and emotional relationships with virtual characters. It's known for its powerful NSFW filter toggle, allowing for both SFW and highly explicit, uncensored role-playing and conversations.",
    adultLevel: {
      rating: 5,
      label: 'Uncensored Chat'
    },
    tags: ["AI", "Chatbot", "Role-play", "NSFW"],
    imageUrl: 'https://i.postimg.cc/j5hgJG53/download_(51).jpg'
  },
  {
    id: 'character-ai',
    name: 'Character.ai',
    url: 'https://character.ai',
    description: "A popular AI chatbot platform where users can create and talk to characters based on fictional or real people. While it has a strict NSFW filter, its powerful character creation and conversational abilities make it a notable platform for immersive role-playing, though explicit content is blocked.",
    adultLevel: {
      rating: 1,
      label: 'Filtered / SFW'
    },
    tags: ["AI", "Chatbot", "Role-play", "SFW"],
    imageUrl: 'https://i.postimg.cc/zBN9Gfy2/download-1.jpg'
  },
  {
    id: 'pornhub',
    name: 'Pornhub',
    url: 'https://www.pornhub.com/',
    description: "Arguably the most famous pornographic video tube site in the world. It hosts an enormous collection of professional and amateur videos across all genres, serving as a central hub for adult video content.",
    adultLevel: {
      rating: 5,
      label: 'Hardcore Porn'
    },
    tags: ["Porn", "Videos", "Tube Site", "Mainstream"],
    imageUrl: 'https://i.postimg.cc/rsFhGQRV/download_(52).jpg'
  },
  {
    id: 'spicychat-ai',
    name: 'SpicyChat.ai',
    url: 'https://spicychat.ai/',
    description: "An AI chatbot platform specifically designed for adult conversations and erotic role-play. It offers a wide range of community-created NSFW characters and scenarios, emphasizing an uncensored and immersive experience.",
    adultLevel: {
      rating: 5,
      label: 'Uncensored Chat'
    },
    tags: ["AI", "Chatbot", "Role-play", "NSFW", "Erotic"],
    imageUrl: 'https://i.postimg.cc/4yLWWVpz/download_(53).jpg'
  },
  {
    id: 'janitor-ai',
    name: 'JanitorAI',
    url: 'https://janitorai.com/',
    description: "A versatile AI chat platform that allows users to connect to various API backends, including unfiltered models. It's highly popular in the role-playing community for its customization and ability to support deep, long-term, and explicit NSFW narratives with community-created characters.",
    adultLevel: {
      rating: 5,
      label: 'Uncensored Chat'
    },
    tags: ["AI", "Chatbot", "Role-play", "Customizable"],
    imageUrl: 'https://i.postimg.cc/fWBqWn1J/download_(54).jpg'
  },
  {
    id: 'noodle-magazine',
    name: 'Noodle Magazine',
    url: 'https://noodlemagazine.com/',
    description: "A curated adult content aggregator known for its high-quality, often artistic, selection of pornographic videos and photo galleries. It focuses on showcasing visually appealing content from top-tier creators.",
    adultLevel: {
      rating: 5,
      label: 'Hardcore Porn'
    },
    tags: ["Porn", "Videos", "Curated", "Artistic"],
    imageUrl: 'https://i.postimg.cc/TPVQZZr2/download_(55).jpg'
  }
];

const getTagClass = (tag: string) => {
    switch(tag.toLowerCase()) {
        case 'porn': case 'hardcore': case 'nsfw': case 'nsfw capable': case 'uncensored': case 'erotic':
            return 'tag-18-plus';
        case 'ai': case 'chatbot': case 'llm':
            return 'tag-ai';
        case 'image generation': case 'artistic':
            return 'tag-creative';
        case 'role-play':
            return 'tag-voice';
        case 'free': case 'customizable':
            return 'tag-dev';
        case 'curated':
            return 'tag-adult';
        case 'filtered / sfw': case 'sfw':
             return 'tag-new';
        default: // videos, images, tube site, mainstream, amateur
            return 'tag-core';
    }
};

const AdultLevelIndicator: React.FC<{ level: { rating: number; label: string } }> = ({ level }) => (
    <div className="bg-black/40 backdrop-blur-md rounded-full px-4 py-2" title={`Adult Level: ${level.label} (${level.rating}/5)`}>
        <div className="flex justify-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon 
                    key={i} 
                    className={`w-6 h-6 ${i < level.rating ? 'text-amber-400 fill-current' : 'text-white/30 fill-none stroke-current'}`} 
                    style={{ filter: `drop-shadow(0 0 3px ${i < level.rating ? 'rgba(251, 191, 36, 0.7)' : 'transparent'})`}}
                />
            ))}
        </div>
        <span className="text-xs font-semibold text-amber-200/80 mt-1 block text-center tracking-wider">{level.label}</span>
    </div>
);


const DetailModal: React.FC<{ website: AdultWebsite; onClose: () => void }> = ({ website, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 ui-blur-effect z-50 flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-rose-300">{website.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-white/10"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                    <img src={website.imageUrl} alt={website.name} className="w-full aspect-video object-cover rounded-lg" />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-black/20 rounded-lg">
                            <h4 className="text-sm font-semibold text-rose-200/70 mb-2">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {website.tags.map(tag => (
                                    <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none shadow-md ${getTagClass(tag)}`}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="p-3 bg-black/20 rounded-lg flex items-center justify-center">
                            <AdultLevelIndicator level={website.adultLevel} />
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-rose-200/80">Description</h3>
                        <p className="text-slate-300 bg-black/20 p-3 rounded-md mt-1 whitespace-pre-wrap">{website.description}</p>
                    </div>
                </div>
                <div className="flex-shrink-0 pt-4 border-t border-rose-500/20">
                    <a href={website.url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-500 transition-colors">
                        <ExternalLinkIcon className="w-5 h-5"/>
                        Visit Website
                    </a>
                </div>
            </div>
        </div>
    );
};


const WebsiteCard: React.FC<{ website: AdultWebsite; onClick: () => void; style: React.CSSProperties; }> = ({ website, onClick, style }) => (
    <div onClick={onClick} style={style} className="animate-fade-in-up">
        <div className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-900 border border-rose-500/20 shadow-lg transition-all duration-300 hover:border-rose-400 hover:shadow-rose-400/20 hover:-translate-y-2 cursor-pointer">
            <img src={website.imageUrl} alt={website.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent"></div>
            
            <div className="absolute top-4 inset-x-0 flex justify-center z-10 pointer-events-none">
                <AdultLevelIndicator level={website.adultLevel} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 z-10 flex flex-col justify-end h-2/5">
                <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
                    <h3 className="font-bold text-2xl text-white truncate [text-shadow:0_2px_5px_rgba(0,0,0,0.8)]">{website.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {website.tags.map(tag => (
                            <span key={tag} className={`text-[10px] px-2 py-1 rounded-full leading-none shadow-md ${getTagClass(tag)}`}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

interface AI18PlusWebsitesPageProps {
    onCancel: () => void;
}

const AI18PlusWebsitesPage: React.FC<AI18PlusWebsitesPageProps> = ({ onCancel }) => {
    const [selectedWebsite, setSelectedWebsite] = useState<AdultWebsite | null>(null);

    return (
        <div className="flex-1 flex flex-col bg-black text-white relative overflow-y-auto custom-scrollbar">
            {selectedWebsite && <DetailModal website={selectedWebsite} onClose={() => setSelectedWebsite(null)} />}

             <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-rose-900/50 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-purple-900/40 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>
            <header className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-900/50 border-b border-rose-500/30 z-10 animate-fade-in-up">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10 text-rose-300">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-3">
                        <GlobeIcon className="w-8 h-8 text-rose-400" />
                         <h1 className="text-xl font-bold text-rose-300">18+ Website Directory</h1>
                    </div>
                </div>
                 {/* Can add a search or filter button here later */}
            </header>
            <main className="flex-1 p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {websites.map((site, index) => (
                        <WebsiteCard
                            key={site.id}
                            website={site}
                            onClick={() => setSelectedWebsite(site)}
                            style={{ animationDelay: `${index * 80}ms` }}
                        />
                    ))}
                    {/* Placeholder for adding new sites */}
                     <div className="aspect-[4/5] rounded-xl flex flex-col items-center justify-center text-center border-2 border-dashed border-rose-300/20 hover:border-rose-300/40 hover:bg-rose-500/5 transition-all duration-300">
                        <p className="text-rose-200/60 font-semibold">More sites coming soon...</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AI18PlusWebsitesPage;
