
export type View = 'chat' | 'gemsList' | 'gemEditor' | 'settings' | 'memory' | 'imageGeneration' | 'imageEditor' | 'webcam' | 'storyWriter' | 'rolePlay' | 'bookmarks' | 'codeCollection' | 'codeEditor' | 'workflowsList' | 'workflowEditor' | 'workflowRunner' | 'dataVisualizer' | 'aiGirlfriendList' | 'aiGirlfriendEditor' | 'aiGirlfriendChat' | 'mediaAnalysis' | 'storage' | 'passionWeaverList' | 'passionWeaverEditor' | 'passionWeaverStory' | 'appIdeaGenerator' | 'objectOfDesire' | 'anatomyExplorer' | 'liveTalk' | 'funZone' | 'funZoneCategory' | 'funZoneTopic' | 'eighteenPlusTalk' | 'shortcuts' | 'sexualProfile' | 'deadOrAliveList' | 'deadOrAliveEditor' | 'deadOrAliveChat' | 'humanTalk' | 'guide' | 'eighteenPlusWebsites' | 'eighteenPlusLetter' | 'eighteenPlusCharacterStory' | 'hornyMode' | 'sister';

export enum MessageAuthor {
    USER = 'user',
    AI = 'ai',
    SYSTEM = 'system'
}

export interface ChatMessage {
    id: string;
    author: MessageAuthor;
    content: string;
    imageFile?: ImageFile;
    codeBlock?: CodeBlock;
    groundingMetadata?: GroundingMetadata | null;
    chartSpec?: any;
    isGeneratingImage?: boolean;
    innerThought?: string;
    persona?: { role: string; name?: string };
}

export interface GroundingMetadata {
    groundingChunks?: {
        web?: {
            uri?: string;
            title?: string;
        };
    }[];
}

export interface ImageFile {
    data: string;
    mimeType: string;
}

export interface GemInstructions {
    persona: string;
    personality: string;
    rules: string;
    outputStyle?: string;
}

export interface Gem {
    id: string;
    name: string;
    instructions: GemInstructions;
    avatar: string;
    cardImageUrl?: string;
}

export interface UserProfile {
    name: string;
    nickname: string;
    age: string;
    avatarUrl: string;
    bio: string;
}

export interface AIProfile {
    name: string;
    age: string;
    avatarUrl: string;
    persona: string;
    personality: string;
    rules: string;
    enabled: boolean;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    gemId?: string;
    notes?: string;
    priorityContext?: string[];
}

export type AiTool = 'none' | 'web_search' | 'deep_research' | 'code_writer';

export interface GeneratedImage {
    id: string;
    url: string;
    prompt: string;
    negativePrompt?: string;
}

export interface MemoryItem {
    id: string;
    content: string;
    createdAt: number;
}

export interface MemoryProposal {
    text: string;
    onSave: () => void;
    onDismiss: () => void;
}

export interface FavoritePrompt {
    id: string;
    text: string;
}

export interface Bookmark {
    id: string;
    content: string;
    chatId: string;
    chatTitle: string;
    createdAt: number;
}

export interface CodeBlock {
    html: string;
    css: string;
    javascript: string;
    language?: string;
}

export interface CodeSnippet {
    id: string;
    title: string;
    code: CodeBlock;
    createdAt: number;
    cardImageUrl?: string;
}

export type CodeModificationType = 'review' | 'fix' | 'translate' | 'add_feature' | 'logs' | 'comments';

export interface WorkflowStep {
    id: string;
    type: WorkflowStepType;
    title: string;
    promptTemplate: string;
}

export type WorkflowStepType = 'generate_text' | 'summarize_text' | 'research_topic' | 'generate_image' | 'generate_website' | 'generate_slides' | 'generate_pdf';

export interface Workflow {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
    initialInputLabel?: string;
    cardImageUrl?: string;
}

export interface WorkflowExecutionResult {
    stepId: string;
    output: string;
    outputType: 'text' | 'image' | 'website' | 'slides' | 'pdf';
    fileName?: string;
}

export interface WorkflowExecutionState {
    isRunning: boolean;
    currentStepIndex: number;
    results: WorkflowExecutionResult[];
    error: string | null;
    workflow: Workflow | null;
    initialInput: string | null;
    activeOutputStepId: string | null;
}

export type Theme = 'light' | 'dark' | 'system';
export type BackgroundType = 'solid' | 'gradient' | 'image' | 'video' | 'aurora';
export type AnimationIntensity = 'default' | 'subtle' | 'playful';
export type ModelName = 'gemini-2.5-flash' | 'safe' | 'nsfw' | 'extreme';

export interface LiveCharacterState {
    url: string;
    x: number;
    y: number;
    scale: number;
}

export interface CustomizationSettings {
    theme: Theme;
    accentLight: string;
    accentDark: string;
    language: string;
    model: ModelName;
    backgroundType: BackgroundType;
    backgroundColor1: string;
    backgroundColor2: string;
    backgroundImageUrl: string;
    backgroundVideoUrl: string;
    backgroundBlur: number;
    showNsfwWallpapers: boolean;
    showAdultWallpapers: boolean;
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    chatsWidth: number;
    promptWidth: number;
    chatFullWidth: boolean;
    syncPromptWidth: boolean;
    showUserBubble: boolean;
    showGptBubble: boolean;
    scrollDownButtonAlign: 'left' | 'center' | 'right';
    animationIntensity: AnimationIntensity;
    isNsfwModeEnabled: boolean;
    disableAllAnimations: boolean;
    colorfulIcons: boolean;
    globalBlur: number;
    auroraColor1: string;
    auroraColor2: string;
    auroraSpeed: number;
    gradientAngle: number;
    bgOverlayColor: string;
    bgOverlayOpacity: number;
    bgBrightness: number;
    bgContrast: number;
    bgSaturation: number;
    videoPlaybackSpeed: number;
    videoMuted: boolean;
    liveCharacter: LiveCharacterState | null;
    activeAiModel: 'safe' | 'nsfw' | 'extreme';
    liveTalkVoice: string | null;
}

export interface UserInterestProfile {
    developer: number;
    writer: number;
    artist: number;
}

export interface SmartSuggestion {
    suggestionText: string;
    suggestedAction: 'CREATE_CODE_SNIPPET' | 'GENERATE_IMAGE' | 'ADD_TO_MEMORY' | 'NONE';
    actionButtonText: string;
    payload: string;
}

export type StoryMode = 'interactive' | 'one-page' | 'linear';
export type StoryTone = 'General/Neutral' | 'Dark & Gritty' | 'Humorous & Lighthearted' | 'Epic & Grandiose' | 'Mysterious & Suspenseful' | 'Romantic & Emotional';
export type StoryPOV = 'First Person' | 'Third Person Limited' | 'Third Person Omniscient';
export type StorySceneType = 'General Narrative' | 'Action Scene' | 'Dialogue-Heavy Scene' | 'Introspective Scene' | 'World-Building Exposition';

export interface StoryCharacter {
    id: string;
    name: string;
    description: string;
}

export interface StorySetup {
    mode: StoryMode;
    mainPrompt: string;
    setting: string;
    tone: StoryTone;
    pov: StoryPOV;
    plotInjection: string;
    sceneType: StorySceneType;
    characters: StoryCharacter[];
}

export interface StoryState {
    setup: StorySetup;
    pages: string[];
    choices: string[];
    currentPageIndex: number;
}

export type RolePlayCharacterType = 'Custom' | 'Anime Character' | 'Movie Character' | 'Video Game Character' | 'Historical Figure' | 'Fantasy Character' | 'Sci-Fi Character' | 'Superhero' | 'Villain' | 'Sister' | 'Brother' | 'Mother' | 'Father' | 'Friend' | 'Rival' | 'Mentor' | 'Teacher' | 'Boss' | 'Celebrity';

export interface RolePlaySetup {
    characterType: RolePlayCharacterType;
    characterName: string;
    persona: string;
    personality: string;
    scenario: string;
    userRole: string;
    tone: StoryTone;
    rules: string;
    avatar: string;
}

export type AIGirlfriendPersonality = 'Default' | 'Shy & Sweet' | 'Energetic & Playful' | 'Tsundere' | 'Yandere' | 'Kuudere' | 'Dandere' | 'Onee-san' | 'Imouto' | 'Goth' | 'Gyaru' | 'Maid' | 'Princess' | 'Dominant (Mommy)' | 'Submissive (Pet)' | 'Nympho' | 'Bratty' | 'Teacher' | 'Nurse' | 'Secretary';
export type AIGirlfriendRelationshipStatus = 'Just Met' | 'Acquaintance' | 'Friend' | 'Crush' | 'Girlfriend' | 'Wife' | 'Ex-Girlfriend' | 'Enemy' | 'Master/Slave' | 'Friends with Benefits';

export interface AIGirlfriendProfile {
    id: string;
    name: string;
    avatar: string;
    personality: AIGirlfriendPersonality;
    appearance: string;
    backstory: string;
    relationshipStatus: AIGirlfriendRelationshipStatus;
    interests: string;
    createdAt: number;
    chatHistory: ChatMessage[];
    gallery: GeneratedImage[];
    is18PlusMode: boolean;
    cardVideoUrl?: string;
    // Detailed appearance
    bodyType?: string;
    hairColor?: string;
    hairStyle?: string;
    eyeColor?: string;
    breastSize?: string;
    breastShape?: string;
    nippleColor?: string;
    buttSize?: string;
    buttShape?: string;
    pussyType?: string;
    pussyColor?: string;
}

export const ALL_STANDARD_PERSONALITIES = ['Default', 'Shy & Sweet', 'Energetic & Playful', 'Tsundere', 'Yandere', 'Kuudere', 'Dandere', 'Onee-san', 'Imouto', 'Goth', 'Gyaru', 'Maid', 'Princess'];
export const EROTIC_PERSONALITIES = ['Dominant (Mommy)', 'Submissive (Pet)', 'Nympho', 'Bratty', 'Teacher', 'Nurse', 'Secretary'];
export const STANDARD_RELATIONSHIPS = ['Just Met', 'Acquaintance', 'Friend', 'Crush', 'Girlfriend', 'Wife', 'Ex-Girlfriend', 'Enemy'];
export const EROTIC_RELATIONSHIPS = ['Master/Slave', 'Friends with Benefits'];

export type PassionWeaverAlignment = 'good' | 'bad' | 'lust' | 'force' | 'pleasure' | 'happy' | 'safety';
export interface PassionWeaverAlignmentScores {
    good: number;
    bad: number;
    lust: number;
    force: number;
    pleasure: number;
    happy: number;
    safety: number;
}
export interface PassionWeaverChoice {
    text: string;
    alignment: PassionWeaverAlignment;
}
export type PassionWeaverTone = 'Romantic & Sensual' | 'Rough & Dominant' | 'Submissive & Pleading' | 'Experimental & Kinky' | 'Humorous & Playful';
export type PassionWeaverCharacterGender = 'Man' | 'Woman' | 'Non-binary';

export interface PassionWeaverSetup {
    mainPrompt: string;
    userCharacter: string;
    partnerCharacter: string;
    userGender: PassionWeaverCharacterGender;
    partnerGender: PassionWeaverCharacterGender;
    tone: PassionWeaverTone;
    pov: StoryPOV;
    kinks: string[];
    intensity: number; // 1-5
    isExtremeMode: boolean;
}

export interface PassionWeaverPageVisual {
    url: string;
    prompt: string;
}

export interface PassionWeaverStory {
    id: string;
    title: string;
    lastUpdatedAt: number;
    setup: PassionWeaverSetup;
    pages: string[];
    choices: PassionWeaverChoice[];
    choiceHistory: PassionWeaverChoice[];
    currentPageIndex: number;
    alignmentScores: PassionWeaverAlignmentScores;
    pageVisuals?: Record<number, PassionWeaverPageVisual>;
}

export interface AppIdeaSetup {
    appDescription: string;
    featureCount: number;
    intensity: number;
}

export interface AppIdeaResult {
    features: { title: string; description: string }[];
}

export type ObjectOfDesireGender = 'Woman' | 'Man';
export interface ObjectOfDesireSetup {
    objectName: string;
    intensity: number;
    gender: ObjectOfDesireGender;
}

export type AnatomyExplorerGender = 'Male' | 'Female';
export interface AnatomyExplorerSetup {
    gender: AnatomyExplorerGender | null;
    selectedPart: string | null;
}

export type Emotion = 'happiness' | 'sadness' | 'love' | 'surprise' | 'shyness' | 'beauty' | 'cuteness' | 'horror' | 'loneliness' | 'horniness' | 'sexiness' | 'hotness' | 'wetness' | 'nudity';
export type EmotionScores = Record<Emotion, number>;

export const STANDARD_EMOTIONS: Emotion[] = ['happiness', 'sadness', 'love', 'surprise', 'shyness', 'beauty', 'cuteness', 'horror', 'loneliness'];
export const NSFW_EMOTIONS: Emotion[] = ['horniness', 'sexiness', 'hotness', 'wetness', 'nudity'];

export type HaniyaEmotion = 'happiness' | 'anger' | 'sadness' | 'shyness' | 'surprise' | 'love' | 'horniness' | 'wetness' | 'shock' | 'fear' | 'uncomfortable' | 'blackmail' | 'jealousy' | 'care' | 'lust_satisfaction' | 'intimacy' | 'trust';
export type HaniyaEmotionScores = Record<HaniyaEmotion, number>;

export type HaniyaRelationshipStatus = 'Stranger' | 'Acquaintance' | 'Curious Acquaintance' | 'Friends' | 'Good Friends' | 'Close Friends' | 'Best Friends' | 'Platonic Soulmates' | 'Protective Friend' | 'Rivals' | 'Flirting' | 'Crush' | 'Secret Admirer' | 'Dating' | 'Romantic Partners' | 'In Love' | 'Passionate Lovers' | 'Committed Partner' | 'Soulmates' | 'It\'s Complicated' | 'Friends with Benefits' | 'Secret Affair' | 'Pet' | 'Master/Pet' | 'Breeding Partner';

export const HANIYA_RELATIONSHIP_STATUSES: HaniyaRelationshipStatus[] = [
    'Stranger', 'Acquaintance', 'Curious Acquaintance', 'Friends', 'Good Friends', 'Close Friends', 'Best Friends', 'Platonic Soulmates', 'Protective Friend', 'Rivals', 'Flirting', 'Crush', 'Secret Admirer', 'Dating', 'Romantic Partners', 'In Love', 'Passionate Lovers', 'Committed Partner', 'Soulmates', 'It\'s Complicated', 'Friends with Benefits', 'Secret Affair', 'Pet', 'Master/Pet', 'Breeding Partner'
];

export interface HaniyaRelationshipProposal {
    proposedStatus: HaniyaRelationshipStatus;
    reason: string;
    onAccept: () => void;
    onReject: () => void;
}

export interface HaniyaPersonaProposal {
    persona: { role: string; name?: string };
    onAccept: () => void;
    onReject: () => void;
}

export type StudioCategory = 'Primary Interactions' | 'Body Parts in Use' | 'Sexual Positions' | 'Techniques & Acts' | 'Toys & Props' | 'Erogenous Spots' | 'Pain & Pleasure Play' | 'Rough & Primal Sex' | 'Dominance & Submission' | 'Humiliation & Degradation' | 'Consensual Non-Consent (CNC)' | 'Extreme Kinks & Taboo';

export const STUDIO_CATEGORIES: StudioCategory[] = ['Primary Interactions', 'Body Parts in Use', 'Sexual Positions', 'Techniques & Acts', 'Toys & Props', 'Erogenous Spots'];
export const EXTREME_STUDIO_CATEGORIES: StudioCategory[] = ['Pain & Pleasure Play', 'Rough & Primal Sex', 'Dominance & Submission', 'Humiliation & Degradation', 'Consensual Non-Consent (CNC)', 'Extreme Kinks & Taboo'];

export interface StudioTopic {
    name: string;
    description: string;
}

export interface StudioTopicContent {
    topicName: string;
    category: string;
    introduction: string;
    howTo: string[];
    benefits: string[];
    variations: { name: string; description: string }[];
    ratings: {
        pleasure: number;
        spice: number;
        intimacy: number;
        pain: number;
        roughness: number;
    };
    proTips: string[];
    requiredItems: string[];
    anatomyFocus: string[];
    difficulty: number;
    risksAndSafety: string[];
    aftercareTips: string[];
    sensoryDetails: {
        sight: string;
        sound: string;
        touch: string;
        smell: string;
        taste: string;
    };
}

export type EroticTone = 'Romantic' | 'Rough' | 'Submissive' | 'Dominant' | 'Playful' | 'Needy' | 'Desperate';
export const EROTIC_TONES: EroticTone[] = ['Romantic', 'Rough', 'Submissive', 'Dominant', 'Playful', 'Needy', 'Desperate'];

export interface EighteenPlusTalkSettings {
    customInstructions: string;
    tone: EroticTone;
    vocalStyle: string;
    kinks: string[];
    limits: string;
}

export type SexualProfileGender = 'Male' | 'Female';
export interface SexualProfileSetup {
    gender: SexualProfileGender;
    age: number;
    weight: number;
    height: number;
    bodyType: string;
    skinColor: string;
    // Male
    penisType?: string; // Cut/Uncut
    penisShape?: string;
    penisSize?: number;
    penisGirth?: number;
    veininess?: number; // 1-10
    foreskinCoverage?: number; // 1-10 if uncut
    erectionTime?: number; // seconds
    // Female
    pussyType?: string;
    pussyShape?: string;
    labiaSize?: string;
    clitorisSize?: string;
    pussyTightness?: number; // 1-10
    wetnessSpeed?: number; // 1-10
    sensitivity?: number; // 1-10
    gSpotSensitivity?: number; // 1-10
    // Common/Other
    nippleHardness?: boolean;
    assType?: string;
    assSize?: number; // 1-10
    boobsShape?: string;
    boobsSize?: string;
    nippleShape?: string;
    nippleSize?: number; // 1-10
    // Fitness
    liftWeight?: number; // kg
    breathHoldTime?: number; // seconds
}

export const BODY_TYPES = ['Average', 'Slim', 'Athletic', 'Muscular', 'Curvy', 'BBW', 'Chubby'];
export const SKIN_COLORS = ['Light', 'Fair', 'Medium', 'Olive', 'Tan', 'Brown', 'Dark', 'Black'];
export const PENIS_TYPES = ['Circumcised', 'Uncircumcised'];
export const PENIS_SHAPES = ['Straight', 'Curved Up', 'Curved Down', 'Curved Left', 'Curved Right'];
export const PUSSY_TYPES = ['Innie (Labia Minora Hidden)', 'Outie (Labia Minora Visible)', 'Puffy', 'Flat'];
export const PUSSY_SHAPES = ['Symmetrical', 'Asymmetrical'];
export const LABIA_SIZES = ['Small / Tucked', 'Average / Slightly Visible', 'Large / Prominent', 'Long / Dangling'];
export const CLITORIS_SIZES = ['Small / Hidden', 'Average', 'Large / Prominent', 'Enlarged'];
export const ASS_TYPES = ['Flat', 'Round', 'Heart-Shaped', 'Inverted V', 'Square', 'Bubble'];
export const BOOBS_SHAPES = ['Round', 'Teardrop', 'Bell', 'East-West', 'Side Set', 'Asymmetric', 'Slender', 'Athletic', 'Relaxed'];

export interface SexualProfileAnalysis {
    performanceScore: number;
    sexyLevel: number;
    estimatedDuration: string;
    partnerEnjoyment?: string; // For men
    possiblePositions: number;
    recommendedPositions: { name: string; description: string; suitability: string }[];
    recommendedTechniques: { name: string; description: string; suitability: string }[];
    enhancementTips: { part: string; suggestion: string }[];
    overallSummary: string;
}

export interface DeadOrAliveSubject {
    id: string;
    name: string;
    age: number;
    gender: string;
    race: string;
    relationship: string;
    persona: string;
    scenario: string;
    imageUrl: string;
    createdAt: number;
}

export const DOA_GENDERS = ['Male', 'Female', 'Futanari', 'Trans-Female', 'Trans-Male', 'Genderless', 'Hermaphrodite'];
export const DOA_RACES = ['Human', 'Elf', 'Orc', 'Demon', 'Angel', 'Vampire', 'Werewolf', 'Alien', 'Cyborg', 'Android', 'Neko', 'Succubus', 'Incubus', 'Fairy', 'Goblin', 'Dragonkin', 'Giant'];
export const DOA_RELATIONSHIPS = ['Captor / Captive', 'Master / Slave', 'Predator / Prey', 'Doctor / Patient', 'Interrogator / Spy', 'Soldier / Civilian', 'Monster / Victim', 'Kidnapper / Hostage', 'Warden / Inmate', 'Scientist / Subject', 'Bully / Nerd', 'Stalker / Target', 'Debt Collector / Debtor'];

export interface LiveCharacter {
    id: string;
    name: string;
    url: string;
}

export interface AdultWebsite {
  id: string;
  name: string;
  url: string;
  description: string;
  adultLevel: {
    rating: number; // 1-5 stars
    label: string; // e.g., "Safe", "Mild", "Explicit", "Hardcore"
  };
  tags: string[];
  imageUrl: string;
}

export type LiveTalkPersona = 
  | { type: 'gem'; data: Gem }
  | { type: 'girlfriend'; data: AIGirlfriendProfile }
  | { type: 'default'; data: AIProfile };

export interface EighteenPlusCharacterStorySetup {
    maleCharacters: string[];
    femaleCharacters: string[];
    setting: string;
    language: string;
}

export interface EighteenPlusCharacterStoryState {
    setup: EighteenPlusCharacterStorySetup | null;
    pages: string[];
}

export interface VideoData {
  id: number;
  title: string;
  urls: { [key in '360p' | '480p' | '720p' | '1080p' | 'local']?: string };
}

export type HornyModeLoadout = VideoData[];

export type VideoQuality = '360p' | '480p' | '720p' | '1080p' | 'local';

export interface StorageBreakdown {
    sessions: number;
    profilesAndMemories: number;
    images: number;
    snippetsAndWorkflows: number;
    other: number;
}

export interface StorageInfo {
    usage: number;
    quota: number;
    breakdown: StorageBreakdown;
}

export interface StorageStats {
    sessions: number;
    gems: number;
    images: number;
    snippets: number;
    workflows: number;
}

export interface DetectedObject {
    id: string;
    name: string;
    box: number[];
    confidence: number;
    color: string;
    lastSeen: number;
    matched?: boolean;
}

export interface AnalysisLogEntry {
    timestamp: number;
    text: string;
    type: 'detection' | 'chat';
}

export interface ParsedMedia {
    type: 'youtube' | 'image' | 'video';
    url: string;
    embedUrl: string;
}

export interface ParseResult {
    text: string;
    media: ParsedMedia | null;
}

export interface EnhancementTip {
    part: string;
    suggestion: string;
}

export interface PersonaContext {
    name: string;
    chatHistory: ChatMessage[];
}

// --- SISTER TYPES ---

export type SisterMood = 'Happy' | 'Annoyed' | 'Sarcastic' | 'Caring' | 'Worried' | 'Excited' | 'Bored' | 'Playful' | 'Angry' | 'Flustered' | 'Horny' | 'Shy' | 'In Love';
export type SisterActivity = 'Studying' | 'Listening to Music' | 'Texting Friends' | 'Sleeping' | 'Watching TV' | 'Cooking' | 'Doing Yoga' | 'Gaming' | 'Shopping Online' | 'Showering' | 'Changing Clothes' | 'Daydreaming' | 'Chilling';
export type SisterOutfit = 
    'School Uniform' | 'Casual Clothes' | 'Pajamas' | 'Gym Clothes' | 'Swimsuit' | 'Towel' | 'Lingerie' | 'Nude' | 'Oversized Shirt' | 
    'Cat Lingerie' | 'Micro Bikini' | 'Office Suit' | 'Bondage Gear' | 'Nurse Costume' | 'Maid Outfit' | 'Bunny Suit' | 'Latex Suit' | 'Oil Covered' | 'School Swimsuit' | 'Succubus Costume' | 'Cheerleader Outfit';

export interface SisterItem {
    id: string;
    name: string;
    icon: string;
    description: string;
    receivedAt: number;
    category: string; // 'Gift', 'Soft', '18+', 'Hardcore', 'Food', 'Drink'
    usage?: string;
    effect?: string;
    maskingLevel?: number;
    tasteIntensity?: number;
    mixedItems?: SisterItem[];
}

export interface SisterProposal {
    type: 'LOCATION_CHANGE' | 'GIFT_REQUEST' | 'OUTFIT_CHANGE' | 'INTIMACY_REQUEST';
    target: string;
    reason: string;
}

export interface SisterActionResult {
    type: string;
    status: 'ACCEPTED' | 'REJECTED';
    details: string;
}

export interface SisterState {
    mood: string;
    affection: number;
    secretLove: number;
    energy: number;
    currentActivity: string;
    currentLocation: string;
    currentOutfit: string;
    timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
    gameHour: number;
    inventory: SisterItem[];
    unlockedOutfits: string[];
    emotions: Record<string, number>;
    sisterMoney: number;
    userMoney: number;
    userInventory: SisterItem[];
}

export interface SisterProfile {
    name: string;
    age: number;
    avatar: string;
    state: SisterState;
}

export interface SisterResponse {
    responseText: string;
    innerThought: string;
    newState: Partial<SisterState>;
    proposal: SisterProposal | null;
    actionResult: SisterActionResult | null;
}

// Sister POV Scene Structure for detailed sequential observation
export interface SisterPOVScene {
    time: string; // e.g. "10:00 PM"
    status: string; // Short status summary e.g. "Relaxing in Bedroom"
    narrative: string; // Detailed 3rd person description of visual actions. Be explicit if 18+.
    thoughts: string; // 1st person inner monologue.
    itemUsed?: string; // If she used a specific item (e.g., "Vibrator", "Lingerie")
    isNSFW: boolean;
    newState: Partial<SisterState>; // State changes for this specific step
}

export interface SisterPOVResponse extends SisterPOVScene {
    // Extends the scene directly as we fetch one step at a time now
}
