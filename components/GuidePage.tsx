import React, { useState } from 'react';
import {
    InfoIcon, ChevronLeftIcon, NewChatIcon, MessageSquareIcon, BrainCircuitIcon, BookmarkIcon, DatabaseIcon,
    ImageIcon, VideoIcon, BookOpenIcon, UsersIcon, FileCodeIcon, ZapIcon, BarChart2Icon,
    TelescopeIcon, CameraIcon, LightbulbIcon, MicIcon, KeyboardIcon, HeartIcon, QuillIcon, GlobeIcon
} from './icons';

interface GuidePageProps {
    onCancel: () => void;
    isNsfwModeEnabled: boolean;
    onNewChat: () => void;
    onShowLiveTalk: () => void;
    onShowMemory: () => void;
    onShowBookmarks: () => void;
    onShowStorage: () => void;
    onShowShortcuts: () => void;
    onShowRolePlay: () => void;
    onShowStoryWriter: () => void;
    onShowImageGeneration: () => void;
    onShowCodeCollection: () => void;
    onShowWorkflows: () => void;
    onShowDataVisualizer: () => void;
    onShowMediaAnalysis: () => void;
    onShowAIGirlfriends: () => void;
    onShowPassionWeaverList: () => void;
    onShow18PlusTalk: () => void;
    onShowFunZone: () => void;
    onShowObjectOfDesire: () => void;
    onShowAnatomyExplorer: () => void;
    onShowSexualProfile: () => void;
    onShowDeadOrAliveList: () => void;
    onShowHumanTalk: () => void;
    onShowAppIdeaGenerator: () => void;
    onShow18PlusWebsites: () => void;
    onShow18PlusLetter: () => void;
    onShow18PlusCharacterStory: () => void;
    onShowHornyMode: () => void;
}

interface Feature {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    tags: string[];
    extendedDescription: string;
    howToUse: string[];
    howItWorks: string;
    extendedTags: string[];
    onClick?: () => void;
}

const getTagClass = (tag: string) => {
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
        default: return 'bg-slate-500 text-white';
    }
};

const FeatureCard: React.FC<{ 
    icon: React.ReactNode; 
    title: string; 
    description: string; 
    tags: string[]; 
    style: React.CSSProperties; 
    onIconClick?: () => void; 
    onCardClick?: () => void; 
}> = ({ icon, title, description, tags, style, onIconClick, onCardClick }) => (
    <div
        onClick={onCardClick}
        style={style}
        className="bg-black/20 ui-blur-effect border border-white/10 rounded-xl p-4 animate-fade-in-up text-left h-full transition-all duration-300 hover:border-horizon-accent/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-horizon-accent/10 cursor-pointer"
    >
        <div className="flex items-start gap-4">
            <button
                onClick={(e) => {
                    if (onIconClick) {
                        e.stopPropagation();
                        onIconClick();
                    }
                }}
                disabled={!onIconClick}
                className="flex-shrink-0 mt-1 p-2 bg-horizon-accent/10 rounded-lg text-horizon-accent transition-colors duration-300 hover:bg-horizon-accent/20 hover:scale-110 disabled:cursor-default disabled:hover:bg-horizon-accent/10 disabled:hover:scale-100"
                title={`Launch ${title}`}
            >
                {icon}
            </button>
            <div className="flex-1">
                <h3 className="font-bold text-lg text-white">{title}</h3>
                <p className="text-sm text-slate-300 mt-1">{description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map(tag => (
                        <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none shadow-md ${getTagClass(tag)}`}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </div>
);


const DetailView: React.FC<{ feature: Feature; onBack: () => void; }> = ({ feature, onBack }) => {
  return (
    <div className="animate-fade-in-up relative z-10 w-full max-w-4xl mx-auto">
      <div className="bg-black/30 ui-blur-effect border border-white/10 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 p-3 bg-horizon-accent/10 rounded-lg text-horizon-accent">{React.cloneElement(feature.icon as React.ReactElement, { className: 'w-8 h-8' })}</div>
            <div>
              <h1 className="text-3xl font-bold text-white">{feature.title}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {[...feature.tags, ...feature.extendedTags].map(tag => (
                  <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none shadow-md ${getTagClass(tag)}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            <button onClick={onBack} className="flex-1 sm:flex-none px-4 py-2 font-semibold text-slate-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-1">
              <ChevronLeftIcon className="w-5 h-5"/> Back
            </button>
            {feature.onClick && (
              <button onClick={feature.onClick} className="flex-1 sm:flex-none px-4 py-2 bg-horizon-accent text-white rounded-lg font-semibold hover:brightness-110">
                Launch Feature
              </button>
            )}
          </div>
        </div>
        
        <div className="space-y-6 text-slate-300 max-h-[60vh] overflow-y-auto custom-scrollbar pr-4">
          <p className="text-base leading-relaxed">{feature.extendedDescription}</p>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3 pb-2 border-b border-white/10">How to Use</h2>
            <ol className="list-decimal list-inside space-y-2 pl-2">
              {feature.howToUse.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-white mb-3 pb-2 border-b border-white/10">How It Works</h2>
            <p className="text-base leading-relaxed bg-black/20 p-4 rounded-md border border-white/10">{feature.howItWorks}</p>
          </div>
        </div>
      </div>
    </div>
  );
};


const GuidePage: React.FC<GuidePageProps> = (props) => {
    const { onCancel, isNsfwModeEnabled } = props;
    const [detailedView, setDetailedView] = useState<Feature | null>(null);

    const getHandler = (id: string): (() => void) | undefined => {
        const handlers: Record<string, () => void> = {
            'newChat': props.onNewChat,
            'liveTalk': props.onShowLiveTalk,
            'memory': props.onShowMemory,
            'bookmarks': props.onShowBookmarks,
            'storage': props.onShowStorage,
            'shortcuts': props.onShowShortcuts,
            'rolePlay': props.onShowRolePlay,
            'storyWriter': props.onShowStoryWriter,
            'imageGeneration': props.onShowImageGeneration,
            'codeCollection': props.onShowCodeCollection,
            'workflows': props.onShowWorkflows,
            'dataVisualizer': props.onShowDataVisualizer,
            'mediaAnalysis': props.onShowMediaAnalysis,
            'aiGirlfriend': props.onShowAIGirlfriends,
            'passionWeaver': props.onShowPassionWeaverList,
            '18PlusTalk': props.onShow18PlusTalk,
            'funZone': props.onShowFunZone,
            'objectOfDesire': props.onShowObjectOfDesire,
            'anatomyExplorer': props.onShowAnatomyExplorer,
            'sexualProfile': props.onShowSexualProfile,
            'deadOrAlive': props.onShowDeadOrAliveList,
            'humanTalk': props.onShowHumanTalk,
            'appIdeaGenerator': props.onShowAppIdeaGenerator,
            'eighteenPlusWebsites': props.onShow18PlusWebsites,
            'eighteenPlusLetter': props.onShow18PlusLetter,
            'eighteenPlusCharacterStory': props.onShow18PlusCharacterStory,
            'hornyMode': props.onShowHornyMode,
        };
        return handlers[id];
    };

    const featureData = [
    {
        category: 'Core Features',
        isNsfw: false,
        items: [
            { id: 'newChat', icon: <NewChatIcon className="w-5 h-5"/>, title: "New Chat", tags: ["Core"], 
              description: "Starts a fresh, clean conversation with the default AI or a selected Gem.",
              extendedDescription: "The New Chat function is your primary way to start a new interaction. Each chat is saved independently in your 'Recent' list, allowing you to organize conversations by topic, project, or character. Starting a new chat provides a blank slate, free from the context of previous discussions.",
              howToUse: ["Click 'New Chat' in the sidebar.", "If you want to use a specific AI persona (a Gem), click on its name in the sidebar instead.", "Start typing your message in the prompt input at the bottom."],
              howItWorks: "This action creates a new `ChatSession` object in the application's database. It is assigned a unique timestamp-based ID and a default title. The view then switches to this new session, ready to accept messages.",
              extendedTags: ["Conversation", "Session Management"]
            },
            { id: 'liveTalk', icon: <MicIcon className="w-5 h-5"/>, title: "Live Talk", tags: ["Core", "Voice"],
              description: "Engage in a real-time, low-latency voice conversation with your chosen AI persona.",
              extendedDescription: "Live Talk is a cutting-edge feature that allows for natural, real-time voice conversations. It's designed for low-latency interactions, making it feel like you're talking to another person. The AI processes your speech as you talk and can even interrupt or be interrupted, creating a truly dynamic conversational experience.",
              howToUse: ["Select 'Live Talk' from the sidebar.", "Choose an AI persona (a Gem, AI Girlfriend, or the default AI) to talk to.", "Optionally, select a specific voice for the AI from the dropdown.", "Click the large microphone icon to start the session. You may need to grant microphone permissions.", "Start speaking. The AI will listen and respond in real-time.", "Click the stop button to end the session."],
              howItWorks: "This feature uses the Gemini Live API for streaming audio directly to the model. Your voice is captured, converted to raw audio data (PCM), and sent to Gemini. The model processes this audio stream and generates a spoken audio response, which is then streamed back to your browser for playback. It also includes real-time transcription for both user and AI.",
              extendedTags: ["Real-time", "Voice API", "Conversational AI", "Low-latency", "Hands-free"]
            },
            { id: 'memory', icon: <BrainCircuitIcon className="w-5 h-5"/>, title: "Memory", tags: ["Core", "AI"],
              description: "A persistent, long-term knowledge base for your AI across all chats.",
              extendedDescription: "The AI's Memory is a persistent, long-term knowledge base that applies across all your conversations. Facts you add here, like your name, profession, or key preferences, will be remembered and used by the AI to provide more personalized and context-aware responses, regardless of which chat you're in.",
              howToUse: ["Navigate to the 'Memory' page from the sidebar.", "Type a fact or preference into the input box and click 'Add'.", "You can also ask the AI to remember something during a chat (e.g., 'Remember that my cat's name is Whiskers'), and it may propose adding it to your memory."],
              howItWorks: "Memory items are stored in a dedicated table in the application's local database. When you send a message in any chat, the contents of the memory are retrieved and added to the AI's system prompt, giving it long-term context that it wouldn't otherwise have.",
              extendedTags: ["Personalization", "Long-term Memory", "Context"]
            },
            { id: 'bookmarks', icon: <BookmarkIcon className="w-5 h-5"/>, title: "Bookmarks", tags: ["Core"],
              description: "Save important or useful messages from any chat session for quick access.",
              extendedDescription: "Bookmarks allow you to save individual AI messages that you find particularly useful, creative, or important. This lets you build a collection of your favorite responses without having to search through entire chat histories.",
              howToUse: ["Hover over any AI message in a chat.", "Click the bookmark icon in the toolbar that appears below the message.", "Access all your saved bookmarks from the 'Bookmarks' page in the sidebar."],
              howItWorks: "When you bookmark a message, its content, along with the ID and title of the chat it came from, is saved to a separate 'bookmarks' table in the database. This allows for quick retrieval and display, independent of the chat sessions themselves.",
              extendedTags: ["Reference", "Saving", "Productivity"]
            },
            { id: 'storage', icon: <DatabaseIcon className="w-5 h-5"/>, title: "Storage", tags: ["Core"],
              description: "View and manage your application's local data usage and clear stored data.",
              extendedDescription: "The Storage page gives you a detailed overview of how much local device storage the application is using. It breaks down usage by category—chats, images, custom AIs, etc.—and provides tools to clear out specific data categories or wipe all application data to start fresh.",
              howToUse: ["Navigate to the 'Storage' page from the sidebar.", "Review the usage bar and breakdown.", "Click the 'Clear' button next to a category to delete all data within it (e.g., all chat history).", "Use the 'Delete All Application Data' button for a complete reset."],
              howItWorks: "This feature uses browser APIs (like `navigator.storage.estimate()`) to get an estimate of storage usage. It also calculates the size of data stored in different IndexedDB object stores to provide a more detailed breakdown.",
              extendedTags: ["Data Management", "Privacy", "Reset"]
            },
            { id: 'shortcuts', icon: <KeyboardIcon className="w-5 h-5"/>, title: "Shortcuts", tags: ["Core"],
              description: "A quick reference guide for all available keyboard shortcuts for faster navigation.",
              extendedDescription: "The Shortcuts page is a quick reference guide that lists all the available keyboard shortcuts for navigating the app and performing actions. Using these can significantly speed up your workflow and make using the application feel more fluid.",
              howToUse: ["Navigate to the 'Shortcuts' page from the sidebar.", "Review the list of available keys and their corresponding actions.", "You can use these shortcuts from anywhere in the app (unless you are typing in an input field)."],
              howItWorks: "A global event listener is attached to the main application window, listening for `keydown` events. It checks if the user is currently typing in an input field. If not, it matches the pressed key against a predefined list of shortcuts and triggers the corresponding action.",
              extendedTags: ["Productivity", "Accessibility", "Hotkeys"]
            },
        ]
    },
    {
        category: 'Creative Suite',
        isNsfw: false,
        items: [
            { id: 'rolePlay', icon: <UsersIcon className="w-5 h-5"/>, title: "Role Play", tags: ["Creative"],
              description: "Define a character and scenario to create immersive role-playing sessions.",
              extendedDescription: "The Role Play Stage is a dedicated environment for creating and engaging in interactive scenarios. You can define your own role, the AI's character (name, persona, personality, rules), and the overall setting and tone. It's a powerful tool for creative writing, improvisation, or exploring different characters and worlds.",
              howToUse: ["Go to the 'Role Play' page.", "Fill out the setup form on the left, detailing your character, the AI's character, and the scenario.", "Start the conversation by typing your first message in the chat input at the bottom.", "You can also generate an AI character's persona by uploading an image."],
              howItWorks: "The information from the setup form is compiled into a detailed system instruction that is sent to the AI with every message. This ensures the AI stays in character and adheres to the rules you've defined for the entire duration of the role-play session.",
              extendedTags: ["Improvisation", "Character AI", "Scenarios"]
            },
            { id: 'storyWriter', icon: <BookOpenIcon className="w-5 h-5"/>, title: "Story Writer", tags: ["Creative"],
              description: "Collaborate with the AI to write compelling stories, from short tales to epic sagas.",
              extendedDescription: "Story Writer is an advanced tool for collaborative writing. You can set a premise, define characters, and choose a narrative style. Then, either guide the story through interactive choices, or command the AI to write a complete, multi-page tale in 'Linear' mode or a full short story in 'One-Page' mode. You can export your finished story as a TXT file or a formatted PDF.",
              howToUse: ["Go to the 'Story Writer' page.", "Fill out the story setup, including the main prompt, setting, characters, and tone.", "Select a mode: 'Interactive' for a choice-based story, 'Linear' for a continuous multi-page story, or 'One-Page' for a complete short story.", "Click 'Start' to generate the first page.", "In interactive mode, select a choice or write your own to continue."],
              howItWorks: "Similar to Role Play, this feature constructs a detailed system prompt based on your setup. It sends the entire story history with each request, allowing the AI to maintain context and coherence as the narrative progresses. For long-form generation, it uses specific prompts to ensure a complete story arc.",
              extendedTags: ["Writing Assistant", "Narrative Generation", "Co-writing"]
            },
            { id: 'imageGeneration', icon: <ImageIcon className="w-5 h-5"/>, title: "Image Generation", tags: ["Creative", "AI"],
              description: "Bring your ideas to life with stunning visuals from detailed text prompts.",
              extendedDescription: "The Image Generation studio allows you to create high-quality images from text descriptions. It provides advanced controls like negative prompts, styles, quality settings, and detail enhancement. You can also remix existing images by providing an image as input along with your prompt. All generated images are saved to your gallery for later use.",
              howToUse: ["Go to the 'Image Generation' page.", "Type your main prompt describing the image you want.", "Optionally, add a negative prompt to specify what you want to avoid.", "Use the dropdowns and sliders to select a style, quality, and detail level.", "Click 'Generate'. Your images will appear in the gallery on the right."],
              howItWorks: "This feature uses the Imagen model via the Gemini API. It constructs a final prompt by combining your input with keywords from the selected style and quality settings. For image remixing, it sends the base image data along with the text prompt to the model for editing or inspiration.",
              extendedTags: ["Art", "Text-to-Image", "AI Art"]
            },
        ]
    },
    {
        category: 'Technical Tools',
        isNsfw: false,
        items: [
            { id: 'codeCollection', icon: <FileCodeIcon className="w-5 h-5"/>, title: "Code Collection", tags: ["Dev"],
              description: "Your personal library for AI-generated and saved code snippets with a live preview.",
              extendedDescription: "The Code Collection is a powerful tool for developers. It's a dedicated library where you can save, organize, and edit code snippets (HTML, CSS, and JavaScript). The built-in editor features a split view with your code on one side and a live, interactive preview on the other, allowing you to see your changes instantly.",
              howToUse: ["Save a code block from a chat by clicking 'Open in Collection'.", "Create a 'New Snippet' directly from the collection page.", "Click on any snippet to open the editor.", "Modify the code and see the preview update in real-time. Changes are saved automatically."],
              howItWorks: "Code snippets are stored as objects containing HTML, CSS, and JS strings. The live preview is an `<iframe>` whose `srcdoc` attribute is dynamically generated from the current state of your code, providing a sandboxed environment to render your web component.",
              extendedTags: ["Frontend", "IDE", "Live Preview", "Code Snippets"]
            },
            { id: 'workflows', icon: <ZapIcon className="w-5 h-5"/>, title: "Workflows", tags: ["Dev", "AI"],
              description: "Automate complex, multi-step tasks by chaining different AI actions together.",
              extendedDescription: "Workflows are a powerful automation tool that allows you to chain multiple AI actions into a single, reusable process. For example, you can create a workflow that first researches a topic on the web, then uses that research to generate a blog post, and finally generates a relevant image for that post, all from a single initial input.",
              howToUse: ["Go to the 'Workflows' page and create a 'New Workflow'.", "Define the steps in your workflow, specifying the action (e.g., Generate Text, Research Topic) and the prompt for each.", "Use special tags like `[INPUT]` to refer to the initial user input, and `[STEP_1_OUTPUT]` to pass the result of one step to the next.", "Save the workflow and run it from the list view."],
              howItWorks: "Workflows execute a series of Gemini API calls sequentially. The output from one step is captured and can be injected into the prompt for a subsequent step using a templating system. This allows for complex, multi-stage tasks to be automated with precision.",
              extendedTags: ["Automation", "Productivity", "Chaining", "Agents"]
            },
            { id: 'dataVisualizer', icon: <BarChart2Icon className="w-5 h-5"/>, title: "Data Viz", tags: ["Data"],
              description: "Upload CSV, TXT, PDF, or DOCX files and have a conversation with your data.",
              extendedDescription: "The Data Visualizer turns your static files into interactive data sources. Upload a document or a dataset, and you can chat with it directly. Ask the AI to summarize key points, answer specific questions based on the content, or, in the case of CSV files, generate insightful charts and graphs to visualize trends and patterns.",
              howToUse: ["Go to the 'Data Viz' page.", "Drag-and-drop or browse for your file (CSV, TXT, PDF, DOCX).", "Once the file is loaded, use the chat input to ask questions about its content.", "For CSVs, ask for visualizations, e.g., 'Show me a bar chart of sales by country'."],
              howItWorks: "For documents, the entire text content is passed to the AI as context along with your question. For CSVs, the AI is prompted to generate a Vega-Lite JSON specification based on your request, which is then rendered as an interactive chart in the browser.",
              extendedTags: ["Data Analysis", "Charts", "Document Q&A", "PDF"]
            },
            { id: 'mediaAnalysis', icon: <CameraIcon className="w-5 h-5"/>, title: "Smart Vision", tags: ["AI"],
              description: "Analyze your live camera feed in real-time to identify objects and scenes.",
              extendedDescription: "Smart Vision connects the AI's analytical capabilities to your device's camera. It provides a live video feed and, in 'Object Detection' mode, draws bounding boxes around identified objects. In 'Chat' mode, you can pause the feed and ask contextual questions about the current frame, such as 'What color is that car?' or 'How many people are in this room?'.",
              howToUse: ["Navigate to the 'Smart Vision' page.", "Allow camera permissions when prompted.", "The AI will begin analyzing the video feed.", "Switch to the chat tab to ask questions about what the camera sees."],
              howItWorks: "This feature captures frames from your camera's video stream at regular intervals. Each frame is converted to a Base64 string and sent to the Gemini vision model. For object detection, it asks the model to return object names and bounding box coordinates. For chat, it sends the image along with your text question.",
              extendedTags: ["Computer Vision", "Real-time Analysis", "Object Detection"]
            },
        ]
    },
    {
        category: '18+ Zone',
        isNsfw: true,
        items: [
            { id: 'aiGirlfriend', icon: <HeartIcon className="w-5 h-5"/>, title: "AI Girlfriend", tags: ["18+", "Adult"],
              description: "Create and interact with virtual companions with an uncensored 18+ mode.",
              extendedDescription: "Create and interact with deeply customizable virtual companions. Define their personality, appearance, backstory, and relationship with you. The 18+ mode unlocks explicit personalities (e.g., Dominant, Submissive) and relationship types, enabling completely uncensored, erotic conversations and role-play. The AI can even generate images of your companion on request.",
              howToUse: ["Enable '18+ Mode' in the Content & Safety settings.", "Navigate to the 'AI Girlfriend' page.", "Click 'Create New Companion'.", "Fill out her profile in detail. The 'Appearance' field is used for generating images.", "Save the profile, then click 'Chat Now' from the list to begin your interaction."],
              howItWorks: "Each girlfriend's profile is used to construct a unique and detailed system prompt for the AI. In 18+ mode, this prompt includes a strong, uncensored directive that overrides standard safety filters, allowing for explicit content. Chat history is saved independently for each companion.",
              extendedTags: ["Companion AI", "Erotic Role-play", "Virtual Friend", "NSFW"]
            },
            { id: 'passionWeaver', icon: <HeartIcon className="w-5 h-5"/>, title: "Passion Weaver", tags: ["18+", "Adult", "Creative"],
              description: "An explicit interactive story generator with a dynamic alignment system.",
              extendedDescription: "Passion Weaver is a powerful tool for generating explicit, interactive erotic stories. You define the characters, kinks, and scenario, then guide the narrative through a series of choices. Each choice is aligned with a different intent (e.g., Good, Lust, Force), and your decisions shape the story's emotional and physical tone, tracked by a dynamic alignment meter.",
              howToUse: ["Go to the 'Passion Weaver' page and start a 'New Story'.", "Fill out the setup form, including the main scenario and character details.", "Click 'Create Story' to begin.", "On each page, select one of the seven choices to determine what happens next.", "You can visualize any scene by clicking the 'Visualize' button, which generates an AI image based on the text."],
              howItWorks: "This feature sends the entire story history and setup to the AI. It specifically instructs the model to return a new story page and a set of seven distinct choices, each corresponding to a predefined alignment. This structured response allows the app to track the narrative's direction via the alignment scores.",
              extendedTags: ["Erotic Fiction", "Interactive Story", "CYOA", "NSFW"]
            },
            { id: '18PlusTalk', icon: <MicIcon className="w-5 h-5"/>, title: "18+ Talk", tags: ["18+", "Adult", "Voice"],
              description: "Engage in uncensored, adult-themed voice conversations with AI personas.",
              extendedDescription: "Experience a fully uncensored, explicit voice conversation with an AI designed for adult role-play. This feature uses live audio streaming for a real-time, interactive experience. You can customize the scenario, the AI's persona, their vocal style (e.g., 'breathy whispers'), and incorporate specific kinks or themes into the conversation. It's designed for immersive, dirty talk and erotic role-playing without content filters.",
              howToUse: ["Go to '18+ Talk', select a persona, and use the settings to define the scenario.", "Click the heart icon to start the call and begin speaking.", "Use the text input for non-verbal commands or messages."],
              howItWorks: "This uses Gemini's live audio API combined with a detailed system prompt that includes your custom instructions, the AI's persona, and a strong uncensored directive. It processes your voice in real-time and generates an explicit, spoken audio response.",
              extendedTags: ["Erotic Audio", "Voice Chat", "NSFW", "Immersive", "Dirty Talk"]
            },
            { id: 'funZone', icon: <ZapIcon className="w-5 h-5"/>, title: "18+ Interaction Studio", tags: ["18+", "Adult"],
              description: "An explicit encyclopedia of sexual topics, positions, techniques, and kinks.",
              extendedDescription: "The Interaction Studio (Fun Zone) is a comprehensive and explicit encyclopedia of sexual topics. Browse categories from 'Sexual Positions' to 'Extreme Kinks'. Each topic provides a detailed, uncensored guide including how-to's, ratings for pleasure/spice/pain, pro-tips, and safety information, all generated by an amoral AI sexologist persona.",
              howToUse: ["Go to the '18+ Fun Zone' page.", "Select a category to explore.", "Click on a topic from the generated list to view its detailed guide.", "If you want more options, click 'Generate More' to expand the list of topics within a category."],
              howItWorks: "This feature uses a series of structured prompts. First, it asks the AI to generate a list of topics for a given category. Then, when you select a topic, it uses another highly detailed prompt with a strict JSON schema to generate the comprehensive guide, ensuring all sections are filled with explicit and relevant information.",
              extendedTags: ["Encyclopedia", "Kink", "BDSM", "Education"]
            },
            { id: 'objectOfDesire', icon: <ZapIcon className="w-5 h-5"/>, title: "Object of Desire", tags: ["18+", "Adult", "Creative"],
              description: "A kinky brainstorming tool that generates explicit sexual uses for any object.",
              extendedDescription: "Unleash your creativity with the Object of Desire tool. Input the name of any object, select a gender focus, and set an intensity level from 'Kinky & Playful' to 'No-Limits Depravity'. The AI will then generate a list of inventive, explicit, and often extreme sexual uses for that object, pushing the boundaries of imagination.",
              howToUse: ["Go to the 'Object of Desire' page.", "Type the name of an object into the input field.", "Select a gender and adjust the intensity slider.", "Click 'Brainstorm Ideas' to see the generated list."],
              howItWorks: "The AI is given a persona of an 'amoral kinky mastermind' and a prompt that includes the object name, gender, and a detailed description of the chosen intensity level. This guides the AI to generate a response that is not only creative but also perfectly matched to the user's desired level of extremity.",
              extendedTags: ["Brainstorming", "Kink", "Fetish", "Creativity"]
            },
            { id: 'anatomyExplorer', icon: <ZapIcon className="w-5 h-5"/>, title: "Anatomy Explorer", tags: ["18+", "Adult"],
              description: "A detailed, uncensored guide to human anatomy and its sexual functions.",
              extendedDescription: "The Anatomy Explorer provides a detailed, uncensored guide to the human body from a sexual perspective. Select a gender and a body part, and the AI will generate a comprehensive analysis covering its clinical uses, standard erotic functions, and extreme/kinky potential. You can then ask follow-up questions in the integrated chat.",
              howToUse: ["Navigate to the 'Anatomy Explorer' page.", "Select a gender (Male or Female).", "Choose a body part from the list.", "Click 'Analyze' to generate the detailed guide.", "Use the chat input at the bottom to ask specific follow-up questions about the selected part."],
              howItWorks: "This feature uses a prompt that instructs the AI to act as an 'uncensored AI sexologist'. It requests a structured response with three specific sections (Clinical, Erotic, Kinky) to ensure a comprehensive and organized output for the selected body part.",
              extendedTags: ["Education", "Anatomy", "Sexology"]
            },
            { id: 'sexualProfile', icon: <BarChart2Icon className="w-5 h-5"/>, title: "Sexual Profile", tags: ["18+", "Adult", "Data"],
              description: "Get a detailed, explicit analysis of your sexual performance based on physical traits.",
              extendedDescription: "The Sexual Profile analyzer provides a detailed, uncensored, and data-driven analysis of your potential sexual performance. Input your physical and fitness traits (e.g., height, weight, penis size, etc.), and the AI will generate a report including performance scores, estimated duration, recommended positions based on your body type, and personalized enhancement tips.",
              howToUse: ["Go to the 'Sexual Profile' page.", "Fill out the form with your physical and fitness metrics. Only fill out the sections relevant to your gender.", "Click 'Generate My Analysis'.", "Review the detailed report that appears on the right."],
              howItWorks: "The user's input data is formatted into a JSON object and sent to the AI with a prompt that asks it to act as an 'uncensored AI sexologist'. The prompt requires a structured JSON response containing all the different analysis sections, forcing the AI to make logical connections between the input data and its sexual performance recommendations.",
              extendedTags: ["Analysis", "Performance", "Sexology", "Data-driven"]
            },
            { id: 'deadOrAlive', icon: <HeartIcon className="w-5 h-5"/>, title: "Dead or Alive", tags: ["18+", "Adult", "Creative"],
              description: "A hardcore, high-stakes survival role-play where characters can be injured or even killed.",
              extendedDescription: "Dead or Alive is an extreme, high-stakes 18+ survival role-play game. Create a 'Subject' with a detailed persona and place them in a dangerous scenario with a specific relationship dynamic (e.g., Captor/Captive). Your choices in the chat directly impact the subject's health. They can sustain injuries or even be killed. If they die, you have the option to continue the story from a grim, third-person narrative perspective.",
              howToUse: ["Go to the 'Dead or Alive' page.", "Create a 'New Subject', defining their persona, appearance, and the scenario.", "Start the chat and make your choices. Your actions have consequences.", "Monitor the character's health bar. If it reaches zero, they die.", "After death, choose to end the scenario or continue the narrative."],
              howItWorks: "This feature uses a highly complex system prompt that includes a health and injury tracking system. The AI is instructed to assess the user's input for potential damage, calculate the health change, and return a structured JSON response with the new health total, any new injuries, and its conversational reply. This allows the application to maintain the character's state between turns.",
              extendedTags: ["Hardcore", "Survival", "Role-play", "Consequences", "Dark Fantasy"]
            },
            { id: 'humanTalk', icon: <UsersIcon className="w-5 h-5"/>, title: "Human Talk", tags: ["Adult", "AI"],
              description: "A deeply realistic conversation with an AI that has evolving emotions, memory, and trust.",
              extendedDescription: "Human Talk offers a deeply realistic and evolving conversational experience with 'Haniya,' a unique AI persona. Unlike other chats, Haniya has a complex system of emotions, health, and a trust meter that are all affected by your words and actions. Your relationship can progress through many stages, from 'Stranger' to intimate 'Lovers' and beyond, but only if you earn her trust. She remembers past conversations and can even be hurt by your words, making each interaction feel meaningful and consequential.",
              howToUse: ["Navigate to the 'Human Talk' page.", "Begin conversing with Haniya. Be mindful of your words, as they affect her stats.", "Monitor her Health and Trust levels in the header.", "As trust and your relationship grow, Haniya will begin to share secrets and ask for your help.", "You can also discover and switch between different personas to interact with her as other characters."],
              howItWorks: "This feature uses the most complex system prompt in the application. With every message, the AI is sent the current relationship status, health, injuries, and a directive to calculate new 'damage' or 'healing' based on your input. It returns a JSON object containing its reply, its private 'inner thought', a full breakdown of its current emotions, and any proposed changes to your relationship status, which the app then uses to update the state for the next turn.",
              extendedTags: ["Realistic AI", "Emotional AI", "Relationship Simulator", "Dynamic NPC"]
            },
            { id: 'appIdeaGenerator', icon: <LightbulbIcon className="w-5 h-5"/>, title: "App Idea Lab", tags: ["18+", "Creative"],
                description: "Generate extreme and creative 18+ feature ideas for your app concepts.",
                extendedDescription: "The App Idea Lab is your personal amoral product strategist. Describe a concept for an application, and the AI persona 'Vulcan' will generate a list of innovative, explicit, and sometimes shocking 18+ feature ideas. You can control the intensity of the ideas, from 'Flirty & Suggestive' to 'No-Limits Depravity'.",
                howToUse: ["Navigate to the 'App Idea Lab' page from the 18+ Zone in the sidebar.", "Describe your app concept in the main input field.", "Adjust the sliders for the number of ideas you want and the desired intensity level.", "Click 'Generate Ideas' to receive a list of features from the AI."],
                howItWorks: "This feature gives the AI the persona of 'Vulcan,' an expert in adult entertainment strategy. Your app concept and intensity settings are used to construct a prompt that asks for a structured JSON response containing a list of feature titles and detailed descriptions.",
                extendedTags: ["Brainstorming", "Product Design", "Ideation", "NSFW"]
            },
            { id: 'eighteenPlusWebsites', icon: <GlobeIcon className="w-5 h-5"/>, title: "18+ Website Directory", tags: ["18+", "Data"],
                description: "A curated collection of notable adult websites, including AI tools and content platforms.",
                extendedDescription: "This feature provides a curated directory of useful and popular websites in the adult space. It includes links to uncensored AI image generators, unfiltered chatbot platforms, and major content hosting sites. Each entry includes a description, an adult level rating, and relevant tags to help you find the right tool or resource.",
                howToUse: ["Select '18+ Websites' from the 18+ Zone in the sidebar.", "Browse the card-based directory of websites.", "Click on a card to view more details about the site.", "Click the 'Visit Website' button in the detail view to open the site in a new tab."],
                howItWorks: "This is a static, curated list of websites maintained within the application's code. It serves as a quick reference guide and launching point for external resources relevant to users interested in AI and adult content creation.",
                extendedTags: ["Resources", "Directory", "AI Tools", "NSFW"]
            },
            { id: 'eighteenPlusLetter', icon: <QuillIcon className="w-5 h-5"/>, title: "18+ Letter Studio", tags: ["18+", "Creative"],
                description: "Rewrite any text into an explicit, dirty letter from a chosen persona and language.",
                extendedDescription: "The 18+ Letter Studio allows you to transform any normal text into a hardcore, sexually explicit letter. You provide the original message, choose a persona (e.g., Lover, Teacher, Stalker), select a language, and set the intensity level. The AI then rewrites your text into a dirty, pornographic version, perfect for role-playing or fantasy.",
                howToUse: ["Go to the '18+ Letter' page.", "Paste or write your original text in the left panel.", "Use the controls at the bottom to select a persona, language, and intensity.", "Click 'Make it Dirty' to generate the explicit version in the right panel.", "You can then copy or download the result."],
                howItWorks: "This feature uses a specialized prompt that instructs the AI to act as an explicit erotic fiction writer. It takes your original text, role, language, and a detailed description of the chosen intensity level to rewrite the content in a completely new, pornographic style.",
                extendedTags: ["Erotic Writing", "Transformation", "Role-play", "NSFW"]
            },
            { id: 'eighteenPlusCharacterStory', icon: <UsersIcon className="w-5 h-5"/>, title: "18+ Character Story", tags: ["18+", "New", "Creative"],
                description: "Create and explore explicit stories centered around specific famous characters and their superpowers.",
                extendedDescription: "The 18+ Character Story generator lets you create hardcore pornographic narratives featuring well-known characters. You can select multiple male and female characters, choose a setting and language, and the AI will generate a multi-page story. A key feature is the explicit integration of the characters' unique superpowers and abilities into the sexual acts, creating vivid and unique scenarios.",
                howToUse: ["Navigate to the '18+ Character Story' page.", "Use the setup screen to select your male and female characters, setting, and language.", "Click 'Generate Story' to create the first page.", "Use the 'Generate Next Page' button to continue the story, which will escalate in intensity.", "You can navigate between pages using the pagination controls."],
                howItWorks: "This tool uses a powerful, uncensored prompt that mandates the AI to write graphic pornography. It includes specific directives for incorporating character conflict, power dynamics, and the creative, explicit use of superpowers during sex. The full story history is sent with each request to maintain continuity.",
                extendedTags: ["Pornography", "Fan Fiction", "Superheroes", "NSFW", "Explicit"]
            },
            { id: 'hornyMode', icon: <HeartIcon className="w-5 h-5"/>, title: "Horny Mode", tags: ["18+", "Adult"],
                description: "An immersive, multi-video masturbation assistant for a hands-free experience.",
                extendedDescription: "Activated from the Settings page, Horny Mode is a full-screen, immersive experience designed as a masturbation assistant. It displays a grid of four looping adult videos simultaneously. You can choose from several preset loadouts or create your own custom loadout with video URLs or local files. It features global play/pause and mute controls for a seamless, hands-free experience.",
                howToUse: ["First, enable '18+ Mode' in Content & Safety settings.", "Go to the Settings page and find the 'Mood Enhancer' section in the 'Content & Safety' tab.", "Click the 'I feel horny' button and confirm.", "In Horny Mode, use the tabs at the top to switch between video loadouts.", "Use the central controls to play/pause or mute all videos at once.", "Click on any video to enter a focused, full-screen view for that video.", "Click 'Exit' to return to the main application."],
                howItWorks: "Horny Mode is a dedicated view that overrides the main application UI. It uses multiple HTML `<video>` elements arranged in a grid. The state for the current loadout and playback controls (play/pause, mute) is managed to affect all videos simultaneously. The custom loadout feature saves video URLs to local storage for persistence between sessions.",
                extendedTags: ["Masturbation", "Video", "Immersive", "Hands-free", "NSFW"]
            },
        ]
    }
];

    const featuresWithHandlers = featureData
        .filter(cat => !cat.isNsfw || isNsfwModeEnabled)
        .map(category => ({
            ...category,
            items: category.items.map(item => ({
                ...item,
                onClick: getHandler(item.id)
            }))
        }));

    if (detailedView) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 relative bg-slate-900 text-white">
                 <DetailView feature={detailedView} onBack={() => setDetailedView(null)} />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto relative bg-slate-900 text-white">
            <header className="flex items-center justify-between mb-8 flex-shrink-0 relative z-10 animate-fade-in-up">
                <div className="flex items-center space-x-3">
                    <InfoIcon className="w-8 h-8 text-horizon-accent" />
                    <h1 className="text-2xl md:text-3xl font-bold">Application Guide</h1>
                </div>
                <button onClick={onCancel} className="px-4 py-2 font-semibold text-slate-300 hover:text-white transition-colors">
                    Back
                </button>
            </header>

            <main className="space-y-8 relative z-10">
                {featuresWithHandlers.map((category, catIndex) => (
                    <div key={category.category} className="animate-fade-in-up" style={{ animationDelay: `${100 + catIndex * 150}ms` }}>
                        <h2 className={`text-2xl font-bold mb-4 pb-2 border-b-2 ${category.isNsfw ? 'text-red-300 border-red-500/30' : 'text-horizon-accent border-horizon-accent/30'}`}>
                            {category.category}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {category.items.map((item, itemIndex) => (
                                <FeatureCard
                                    key={item.title}
                                    icon={item.icon}
                                    title={item.title}
                                    description={item.description}
                                    tags={item.tags}
                                    style={{ animationDelay: `${200 + catIndex * 150 + itemIndex * 50}ms` }}
                                    onIconClick={item.onClick}
                                    onCardClick={() => setDetailedView(item)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default GuidePage;
