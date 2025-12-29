import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, HeartIcon, MessageSquareIcon, BrainCircuitIcon, SendIcon, RefreshCwIcon, XIcon, LockIcon, UsersIcon, PlusIcon, SlidersIcon, GiftIcon, BarChart2Icon, CheckIcon, ZapIcon, SunIcon, MoonIcon, StarIcon, DatabaseIcon, GlobeIcon, AlertTriangleIcon, InfoIcon, LoaderIcon, TelescopeIcon, EyeOffIcon, PlayIcon, SearchIcon, ActivityIcon, MicIcon, VideoIcon, ShieldIcon, EyeIcon, FileTextIcon, TrashIcon } from './icons';
import { SisterProfile, SisterState, MessageAuthor, ChatMessage, SisterItem, SisterProposal, SisterActionResult, SisterOutfit, SisterPOVResponse } from '../types';
import { getSisterData, setSisterData } from '../services/dbService';
import { generateSisterResponse, generateSisterPOV } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

// --- EXTENDED STATE TYPES FOR NEW MECHANICS ---
interface ExtendedSisterState extends SisterState {
    isAsleep: boolean;
    drowsiness: number; // 0-100
    physicalCondition: {
        soreness: number;
        wetness: number;
        pain: number;
        stickiness: number;
    };
    unconsciousLog: string[]; // Logs actions done while asleep
    activeDrugs: string[]; // Names of active effects
}

interface SisterPageProps {
    onBack: () => void;
}

// Default User Money is high for ease of use, Sister starts with a bit
const DEFAULT_STATE: ExtendedSisterState = {
    mood: 'Happy',
    affection: 50,
    secretLove: 10,
    energy: 80,
    currentActivity: 'Chilling',
    currentLocation: 'Bedroom',
    currentOutfit: 'Casual Clothes',
    timeOfDay: 'Morning',
    gameHour: 8,
    inventory: [],
    unlockedOutfits: ['School Uniform', 'Casual Clothes', 'Pajamas'],
    emotions: { 
        Trust: 50, Happiness: 60, Stress: 20, Boredom: 10, Curiosity: 40, Gratitude: 10, 
        Jealousy: 5, Guilt: 0, Nervousness: 10, Confidence: 70,
        Lust: 10, Horniness: 5, Arousal: 5, Sensitivity: 10, Wetness: 0, Shame: 10, Submission: 20, Dominance: 30 
    },
    userMoney: 99999999,
    sisterMoney: 100,
    userInventory: [],
    // NEW FIELDS
    isAsleep: false,
    drowsiness: 0,
    activeDrugs: [],
    physicalCondition: { soreness: 0, wetness: 0, pain: 0, stickiness: 0 },
    unconsciousLog: []
};

const DEFAULT_PROFILE: SisterProfile = {
    name: 'Maya',
    age: 18,
    avatar: 'https://i.pravatar.cc/300?u=sister_maya',
    state: DEFAULT_STATE
};

// --- CONFIGURATION DATA ---

const TIME_PERIODS: Record<string, { start: number; end: number; icon: string; bgClass: string }> = {
    'Morning': { start: 6, end: 12, icon: '🌅', bgClass: 'bg-sky-300/20' },
    'Afternoon': { start: 12, end: 17, icon: '☀️', bgClass: 'bg-amber-300/20' },
    'Evening': { start: 17, end: 21, icon: '🌆', bgClass: 'bg-orange-400/30' },
    'Night': { start: 21, end: 6, icon: '🌙', bgClass: 'bg-indigo-900/60' },
};

const LOCATIONS: Record<string, { name: string; category: string; bg: string; icon: string; cost: number; isLocked?: (state: SisterState) => boolean; lockMessage?: string }> = {
    // Home (Free)
    'Bedroom': { name: 'Maya\'s Room', category: 'Home', cost: 0, bg: 'https://images.unsplash.com/photo-1616594039964-40891a90c319?q=80&w=2940&auto=format&fit=crop', icon: '🛏️' },
    'Living Room': { name: 'Living Room', category: 'Home', cost: 0, bg: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?q=80&w=2940&auto=format&fit=crop', icon: '🛋️' },
    'Kitchen': { name: 'Kitchen', category: 'Home', cost: 0, bg: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2940&auto=format&fit=crop', icon: '🍳' },
    'Bathroom': { name: 'Bathroom', category: 'Home', cost: 0, bg: 'https://images.unsplash.com/photo-1620626012053-8c167262607e?q=80&w=2787&auto=format&fit=crop', icon: '🛁' },
    'Shower': { name: 'Shower', category: 'Home', cost: 0, bg: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=2940&auto=format&fit=crop', icon: '🚿', isLocked: (s) => (s.emotions['Shame'] || 0) > 40 && (s.emotions['Lust'] || 0) < 50, lockMessage: "Too Shy" },
    'Garden': { name: 'Garden', category: 'Home', cost: 0, bg: 'https://images.unsplash.com/photo-1585320806286-7e9db2658588?q=80&w=2787&auto=format&fit=crop', icon: '🌻' },

    // City (Cost Money)
    'School': { name: 'High School', category: 'City', cost: 0, bg: 'https://images.unsplash.com/photo-1580050202379-13985680c6d8?q=80&w=2940&auto=format&fit=crop', icon: '🏫', isLocked: (s) => s.timeOfDay === 'Night', lockMessage: "Closed at Night" },
    'University Campus': { name: 'University Campus', category: 'City', cost: 10, bg: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2886&auto=format&fit=crop', icon: '🎓', isLocked: (s) => s.timeOfDay === 'Night', lockMessage: "Closed" },
    'Mall': { name: 'Shopping Mall', category: 'City', cost: 20, bg: 'https://images.unsplash.com/photo-1519567241046-7f570eee3c9e?q=80&w=2835&auto=format&fit=crop', icon: '🛍️', isLocked: (s) => s.timeOfDay === 'Night', lockMessage: "Closed" },
    'Park': { name: 'Central Park', category: 'City', cost: 5, bg: 'https://images.unsplash.com/photo-1498931299472-f7a63a02c63f?q=80&w=2940&auto=format&fit=crop', icon: '🌳' },
    'Cafe': { name: 'Cute Cafe', category: 'City', cost: 25, bg: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2947&auto=format&fit=crop', icon: '☕', isLocked: (s) => s.timeOfDay === 'Night', lockMessage: "Closed" },
    'Gym': { name: 'Fitness Gym', category: 'City', cost: 15, bg: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2940&auto=format&fit=crop', icon: '💪', isLocked: (s) => (s.emotions['Confidence'] || 0) < 30, lockMessage: "Needs Confidence" },
    'Library': { name: 'City Library', category: 'City', cost: 0, bg: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2980&auto=format&fit=crop', icon: '📚', isLocked: (s) => s.timeOfDay === 'Night', lockMessage: "Closed" },
    'Cinema': { name: 'Movie Theater', category: 'City', cost: 40, bg: 'https://images.unsplash.com/photo-1517604931442-71053647bc1b?q=80&w=2940&auto=format&fit=crop', icon: '🎬', isLocked: (s) => s.affection < 20, lockMessage: "Not close enough" },
    'Zoo': { name: 'City Zoo', category: 'City', cost: 60, bg: 'https://images.unsplash.com/photo-1553285991-4c74211f5097?q=80&w=2940&auto=format&fit=crop', icon: '🦁', isLocked: (s) => s.timeOfDay === 'Night', lockMessage: "Closed" },
    'Aquarium': { name: 'Aquarium', category: 'City', cost: 50, bg: 'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?q=80&w=2940&auto=format&fit=crop', icon: '🐠', isLocked: (s) => s.timeOfDay === 'Night', lockMessage: "Closed" },
    'Botanical Garden': { name: 'Botanical Garden', category: 'City', cost: 15, bg: 'https://images.unsplash.com/photo-1585320806286-7e9db2658588?q=80&w=2787&auto=format&fit=crop', icon: '🌺', isLocked: (s) => s.timeOfDay === 'Night', lockMessage: "Closed" },
    'Massage Parlor': { name: 'Massage Parlor', category: 'City', cost: 80, bg: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2940&auto=format&fit=crop', icon: '💆‍♀️', isLocked: (s) => (s.emotions['Trust'] || 0) < 50, lockMessage: "Requires Trust" },
    'Arcade': { name: 'Neon Arcade', category: 'City', cost: 30, bg: 'https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=2942&auto=format&fit=crop', icon: '🕹️', isLocked: (s) => s.timeOfDay === 'Morning', lockMessage: "Opens in Afternoon" },
    'Art Gallery': { name: 'Art Gallery', category: 'City', cost: 40, bg: 'https://images.unsplash.com/photo-1518998053901-5348d3969105?q=80&w=2892&auto=format&fit=crop', icon: '🖼️', isLocked: (s) => s.timeOfDay === 'Night', lockMessage: "Closed" },
    'Opera House': { name: 'Grand Opera', category: 'City', cost: 150, bg: 'https://images.unsplash.com/photo-1583835748869-515d20e470b0?q=80&w=2940&auto=format&fit=crop', icon: '🎭', isLocked: (s) => s.timeOfDay !== 'Evening', lockMessage: "Evening Only" },
    'Jazz Club': { name: 'Blue Note Jazz', category: 'City', cost: 60, bg: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=2874&auto=format&fit=crop', icon: '🎷', isLocked: (s) => s.timeOfDay !== 'Night', lockMessage: "Night Only" },
    'Antique Shop': { name: 'Antique Shop', category: 'City', cost: 0, bg: 'https://images.unsplash.com/photo-1552604660-a8c4dde15b2e?q=80&w=2938&auto=format&fit=crop', icon: '🕰️', isLocked: (s) => s.timeOfDay === 'Night', lockMessage: "Closed" },
    'Ferris Wheel': { name: 'Sky Wheel', category: 'City', cost: 25, bg: 'https://images.unsplash.com/photo-1504966981333-60602845c8d9?q=80&w=2940&auto=format&fit=crop', icon: '🎡', isLocked: (s) => s.timeOfDay === 'Morning', lockMessage: "Opens Later" },
    'Skate Park': { name: 'Skate Park', category: 'City', cost: 0, bg: 'https://images.unsplash.com/photo-1555597408-26bc8e548a46?q=80&w=2946&auto=format&fit=crop', icon: '🛹' },
    'Old Shrine': { name: 'Ancient Shrine', category: 'City', cost: 5, bg: 'https://images.unsplash.com/photo-1565617127054-684c1455742c?q=80&w=2938&auto=format&fit=crop', icon: '⛩️' },
    'Nightclub': { name: 'Club Pulse', category: 'City', cost: 100, bg: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2940&auto=format&fit=crop', icon: '💃', isLocked: (s) => s.timeOfDay !== 'Night', lockMessage: "Night Only" },

    // Vacation / Fun (High Cost)
    'Beach': { name: 'Sunny Beach', category: 'Vacation', cost: 100, bg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2946&auto=format&fit=crop', icon: '🏖️', isLocked: (s) => s.timeOfDay === 'Night' || s.timeOfDay === 'Evening', lockMessage: "Daytime Only" },
    'Pool': { name: 'Public Pool', category: 'Vacation', cost: 30, bg: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=2940&auto=format&fit=crop', icon: '🏊‍♀️', isLocked: (s) => (s.emotions['Shame'] || 0) > 60, lockMessage: "Too Shy" },
    'Onsen': { name: 'Hot Spring', category: 'Vacation', cost: 150, bg: 'https://images.unsplash.com/photo-1543420536-1c2c29502014?q=80&w=2940&auto=format&fit=crop', icon: '♨️', isLocked: (s) => s.secretLove < 60, lockMessage: "Requires Intimacy" },
    'Hotel': { name: 'Luxury Hotel', category: 'Vacation', cost: 300, bg: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2940&auto=format&fit=crop', icon: '🏨', isLocked: (s) => s.secretLove < 50, lockMessage: "Requires Romance" },
    'Luxury Cruise': { name: 'Luxury Cruise', category: 'Vacation', cost: 500, bg: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=2956&auto=format&fit=crop', icon: '🛳️', isLocked: (s) => s.secretLove < 70, lockMessage: "Deep Love Required" },
    'Private Jet': { name: 'Private Jet', category: 'Vacation', cost: 2000, bg: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2832&auto=format&fit=crop', icon: '✈️', isLocked: (s) => s.userMoney < 2000, lockMessage: "Need more money" },
    'Nude Beach': { name: 'Nude Beach', category: 'Vacation', cost: 50, bg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2946&auto=format&fit=crop', icon: '🍑', isLocked: (s) => (s.emotions['Shame'] || 0) > 20, lockMessage: "Too Shy" },
    'Mountain Cabin': { name: 'Snowy Cabin', category: 'Vacation', cost: 400, bg: 'https://images.unsplash.com/photo-1518113660374-c27722c69ec8?q=80&w=2940&auto=format&fit=crop', icon: '🏔️', isLocked: (s) => s.affection < 80, lockMessage: "High Affection" },
    'Casino': { name: 'Grand Casino', category: 'Vacation', cost: 1000, bg: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2938&auto=format&fit=crop', icon: '🎰', isLocked: (s) => s.userMoney < 1000, lockMessage: "High Roller Only" },
    'Yacht': { name: 'Private Yacht', category: 'Vacation', cost: 1500, bg: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=2940&auto=format&fit=crop', icon: '🛥️', isLocked: (s) => s.userMoney < 1500, lockMessage: "Too Expensive" },
    'Rainforest Lodge': { name: 'Eco Lodge', category: 'Vacation', cost: 600, bg: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2940&auto=format&fit=crop', icon: '🦜', isLocked: (s) => s.affection < 60, lockMessage: "Need Affection" },
    'Desert Oasis': { name: 'Desert Oasis', category: 'Vacation', cost: 800, bg: 'https://images.unsplash.com/photo-1545989253-02cc26577f88?q=80&w=2940&auto=format&fit=crop', icon: '🐪', isLocked: (s) => s.secretLove < 40, lockMessage: "Need Love" },

    // Secret / 18+ (Mixed Cost)
    'Love Hotel': { name: 'Love Hotel', category: 'Secret', cost: 120, bg: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2874&auto=format&fit=crop', icon: '🏩', isLocked: (s) => s.secretLove < 80 || (s.emotions['Lust'] || 0) < 70, lockMessage: "Requires High Lust" },
    'Secret Base': { name: 'Secret Hideout', category: 'Secret', cost: 0, bg: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=2835&auto=format&fit=crop', icon: '⛺', isLocked: (s) => s.affection < 80, lockMessage: "Need Max Trust" },
    'Bedroom (Night)': { name: 'Bedroom (Night)', category: 'Secret', cost: 0, bg: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2938&auto=format&fit=crop', icon: '🌙', isLocked: (s) => s.secretLove < 40 || (s.timeOfDay !== 'Night'), lockMessage: "Wait for Night" },
    'Rooftop (Night)': { name: 'City Rooftop', category: 'Secret', cost: 0, bg: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2940&auto=format&fit=crop', icon: '🌃', isLocked: (s) => s.affection < 60 || (s.timeOfDay !== 'Night'), lockMessage: "Wait for Night" },
    'Stargazing Hill': { name: 'Stargazing Hill', category: 'Secret', cost: 0, bg: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=2933&auto=format&fit=crop', icon: '✨', isLocked: (s) => (s.timeOfDay !== 'Night'), lockMessage: "Wait for Night" },
    'Dungeon': { name: 'Secret Dungeon', category: 'Secret', cost: 0, bg: 'https://images.unsplash.com/photo-1591588582259-e675bd2e6088?q=80&w=2874&auto=format&fit=crop', icon: '⛓️', isLocked: (s) => (s.emotions['Lust'] || 0) < 90 || s.secretLove < 90, lockMessage: "Extreme Lust Req" },
    'Secret Lab': { name: 'Underground Lab', category: 'Secret', cost: 500, bg: 'https://images.unsplash.com/photo-1579154341161-4218a68d6629?q=80&w=2787&auto=format&fit=crop', icon: '🔬', isLocked: (s) => (s.emotions['Curiosity'] || 0) < 80, lockMessage: "Needs Curiosity" },
    'Mirror Room': { name: 'House of Mirrors', category: 'Secret', cost: 200, bg: 'https://images.unsplash.com/photo-1580050202379-13985680c6d8?q=80&w=2940&auto=format&fit=crop', icon: '🪞', isLocked: (s) => (s.emotions['Shame'] || 0) > 30 && s.secretLove < 70, lockMessage: "Too Shy" },
    'Hypnosis Room': { name: 'Hypnosis Chamber', category: 'Secret', cost: 300, bg: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=2835&auto=format&fit=crop', icon: '🌀', isLocked: (s) => (s.emotions['Submission'] || 0) < 50, lockMessage: "Low Submission" },
};

interface OutfitData {
    name: SisterOutfit;
    icon: string;
    reqLust?: number;
    reqLove?: number;
    giftName?: string; // Item name required to unlock
    description?: string;
}

const OUTFITS: OutfitData[] = [
    // Default
    { name: 'School Uniform', icon: '🎓' },
    { name: 'Casual Clothes', icon: '👚' },
    { name: 'Pajamas', icon: '💤' },
    
    // Unlockable by Stats
    { name: 'Gym Clothes', icon: '🧘‍♀️', reqLust: 20 },
    { name: 'Oversized Shirt', icon: '👕', reqLove: 40, reqLust: 30 },
    { name: 'Swimsuit', icon: '👙', reqLust: 50, description: "For the beach or pool." },
    { name: 'Towel', icon: '🧖‍♀️', reqLust: 80, description: "Fresh out of the shower." },
    { name: 'Lingerie', icon: '🖤', reqLove: 70, reqLust: 90, description: "Only for special nights." },
    { name: 'Nude', icon: '🍑', reqLove: 90, reqLust: 100, description: "Completely bare." },

    // Unlockable by Gifts
    { name: 'Office Suit', icon: '💼', giftName: "Office Suit Gift", description: "Sharp and professional." },
    { name: 'Maid Outfit', icon: '🧹', giftName: "Maid Costume Box", description: "At your service." },
    { name: 'Cat Lingerie', icon: '😻', giftName: "Cat Lingerie Set", description: "Nian nian~" },
    { name: 'Micro Bikini', icon: '🧶', giftName: "Micro Bikini Box", description: "Barely covers anything." },
    { name: 'Bondage Gear', icon: '⛓️', giftName: "Leather Harness Set", description: "For extreme play." },
    { name: 'Nurse Costume', icon: '💉', giftName: "Nurse Outfit Gift", description: "Time for a checkup." },
    { name: 'Bunny Suit', icon: '🐰', giftName: "Bunny Girl Costume", description: "Hop hop!" },
    { name: 'Latex Suit', icon: '🖤', giftName: "Latex Catsuit Gift", description: "Shiny and tight." },
    { name: 'Oil Covered', icon: '🛢️', giftName: "Massage Oil Bottle", description: "Slippery and shiny." },
    { name: 'School Swimsuit', icon: '🩱', giftName: "Classic Sukumizu", description: "Old school style." },
    { name: 'Succubus Costume', icon: '😈', giftName: "Succubus Costume", description: "Demonic charm." },
    { name: 'Cheerleader Outfit', icon: '📣', giftName: "Cheerleader Uniform", description: "Go team!" },
];

type GiftCategory = 'Normal' | 'Romantic' | '18+' | 'Outfit' | 'Toy';

const GIFTS: { name: string, icon: string, price: number, category: GiftCategory, unlocks?: string, description: string }[] = [
    // Normal Gifts
    { name: "Chocolate", icon: "🍫", price: 10, category: "Normal", description: "A sweet treat that boosts happiness." },
    { name: "Coffee", icon: "☕", price: 5, category: "Normal", description: "Warm caffeine boost for energy." },
    { name: "Snacks", icon: "🍿", price: 15, category: "Normal", description: "Tasty snacks for movie time." },
    { name: "Book", icon: "📖", price: 20, category: "Normal", description: "A good novel to pass the time." },
    { name: "Video Game", icon: "🎮", price: 60, category: "Normal", description: "Fun game to play together." },
    { name: "Headphones", icon: "🎧", price: 100, category: "Normal", description: "High quality noise-canceling headphones." },
    { name: "Sneakers", icon: "👟", price: 120, category: "Normal", description: "Stylish and comfortable shoes." },
    { name: "Backpack", icon: "🎒", price: 50, category: "Normal", description: "Cute bag for school or trips." },
    { name: "Art Supplies", icon: "🎨", price: 40, category: "Normal", description: "Paints and brushes for creativity." },
    { name: "Makeup Kit", icon: "💄", price: 80, category: "Normal", description: "Complete set for a fresh look." },
    { name: "Perfume", icon: "🧴", price: 75, category: "Normal", description: "A pleasant floral fragrance." },
    { name: "Watch", icon: "⌚", price: 150, category: "Normal", description: "Elegant wristwatch." },
    { name: "Camera", icon: "📷", price: 300, category: "Normal", description: "Digital camera for memories." },
    { name: "Polaroid Camera", icon: "📸", price: 120, category: "Normal", description: "Instant photo camera." },
    { name: "Gaming Console", icon: "🕹️", price: 500, category: "Normal", description: "Next-gen console for serious gaming." },
    { name: "Yoga Mat", icon: "🧘‍♀️", price: 30, category: "Normal", description: "For daily exercise routines." },
    { name: "Silk Robe", icon: "👘", price: 80, category: "Normal", description: "Soft and comfortable loungewear." },
    
    // Romantic Gifts
    { name: "Flowers", icon: "💐", price: 30, category: "Romantic", description: "A colorful bouquet to show care." },
    { name: "Red Roses", icon: "🌹", price: 50, category: "Romantic", description: "Classic symbol of romance." },
    { name: "Gold Locket", icon: "🥇", price: 200, category: "Romantic", description: "A necklace to hold a photo." },
    { name: "Promise Ring", icon: "💍", price: 500, category: "Romantic", description: "Symbol of commitment." },
    { name: "Love Letter", icon: "💌", price: 0, category: "Romantic", description: "Handwritten feelings." },
    { name: "Couple's Bracelet", icon: "🔗", price: 80, category: "Romantic", description: "Matching bracelets for two." },
    { name: "Dinner Voucher", icon: "🍽️", price: 100, category: "Romantic", description: "Fancy dinner for two." },
    { name: "Giant Teddy", icon: "🧸", price: 60, category: "Romantic", description: "Huge huggable bear." },
    { name: "Spa Day Ticket", icon: "🧖‍♀️", price: 150, category: "Romantic", description: "Relaxing massage and treatment." },
    { name: "Diamond Earrings", icon: "💎", price: 800, category: "Romantic", description: "Sparkling jewelry." },
    { name: "Getaway Ticket", icon: "✈️", price: 1000, category: "Romantic", description: "Trip for two." },
    { name: "Heart Chocolate", icon: "💝", price: 25, category: "Romantic", description: "Chocolates in a heart box." },
    { name: "Pearl Necklace", icon: "📿", price: 300, category: "Romantic", description: "Classic elegance." },
    { name: "Designer Bag", icon: "👜", price: 1500, category: "Romantic", description: "High-end fashion accessory." },
    { name: "Portrait Painting", icon: "🖼️", price: 100, category: "Romantic", description: "Custom artwork of her." },
    { name: "Eternity Ring", icon: "💎", price: 2000, category: "Romantic", description: "Symbol of everlasting love." },
    { name: "Giant Bouquet", icon: "💐", price: 150, category: "Romantic", description: "Huge arrangement of flowers." },
    { name: "Concert Tickets", icon: "🎫", price: 200, category: "Romantic", description: "Tickets to her favorite band." },

    // 18+ Gifts (General)
    { name: "Lingerie (Red)", icon: "👙", price: 100, category: "18+", description: "Sexy red lace set." },
    { name: "Massage Oil", icon: "🧴", price: 40, category: "18+", description: "Scented oil for body rubs." },
    { name: "Kama Sutra Book", icon: "📕", price: 35, category: "18+", description: "Illustrated guide to positions." },
    { name: "Aphrodisiac Choco", icon: "🍫", price: 60, category: "18+", description: "Chocolate with special herbs." },
    { name: "Pheromone Perfume", icon: "🧪", price: 200, category: "18+", description: "Attracts desire." },
    { name: "Diamond Choker", icon: "💎", price: 400, category: "18+", description: "Elegant collar with gems." },

    // Toys (New Category)
    { name: "Magic Wand", icon: "🪄", price: 120, category: "Toy", description: "Powerful vibration for intense pleasure." },
    { name: "Rabbit Vibrator", icon: "🐰", price: 90, category: "Toy", description: "Dual stimulation for maximum effect." },
    { name: "Glass Dildo", icon: "🧊", price: 70, category: "Toy", description: "Smooth, firm, and temperature responsive." },
    { name: "Anal Beads", icon: "📿", price: 45, category: "Toy", description: "For gradual stretching and pleasure." },
    { name: "Small Butt Plug", icon: "🔌", price: 30, category: "Toy", description: "Perfect for beginners." },
    { name: "Large Butt Plug", icon: "🔌", price: 50, category: "Toy", description: "For those who crave fullness." },
    { name: "Fox Tail Plug", icon: "🦊", price: 65, category: "Toy", description: "Cute and kinky visual accessory." },
    { name: "Nipple Clamps", icon: "📎", price: 25, category: "Toy", description: "Pinching sensation for the nipples." },
    { name: "Ball Gag", icon: "🤐", price: 30, category: "Toy", description: "Keeps the mouth open and silent." },
    { name: "Handcuffs", icon: "🔗", price: 40, category: "Toy", description: "Metal cuffs for restraint." },
    { name: "Silk Rope", icon: "🪢", price: 35, category: "Toy", description: "Soft rope for sensual bondage." },
    { name: "Feather Tickler", icon: "🪶", price: 15, category: "Toy", description: "For gentle, teasing sensation." },
    { name: "Remote Egg", icon: "🥚", price: 80, category: "Toy", description: "Wireless pleasure, perfect for public play." },
    { name: "Bullet Vibe", icon: "💊", price: 20, category: "Toy", description: "Small but powerful pinpoint stimulation." },
    { name: "Strap-on Harness", icon: "🍆", price: 150, category: "Toy", description: "Take control with this wearable attachment." },
    { name: "Double Dildo", icon: "🥒", price: 100, category: "Toy", description: "For double penetration or sharing." },
    { name: "Clit Sucker", icon: "🌬️", price: 130, category: "Toy", description: "Uses air pulses for intense stimulation." },
    { name: "G-Spot Dildo", icon: "🍌", price: 85, category: "Toy", description: "Curved to hit the right spot." },
    { name: "Electro-Stim Pads", icon: "⚡", price: 110, category: "Toy", description: "Delivers tingling electric shocks." },
    { name: "Spreader Bar", icon: "📏", price: 90, category: "Toy", description: "Keeps legs wide open." },
    { name: "Wartenberg Wheel", icon: "⚙️", price: 25, category: "Toy", description: "Prickly sensation wheel." },
    { name: "Hot Oil", icon: "🔥", price: 30, category: "Toy", description: "Warming oil for temperature play." },
    { name: "Blindfold", icon: "🙈", price: 20, category: "Toy", description: "Heightens other senses by removing sight." },
    { name: "Collar", icon: "🐕", price: 45, category: "Toy", description: "Leather collar for ownership." },
    { name: "Paddle", icon: "🏏", price: 40, category: "Toy", description: "For spanking and impact play." },

    // Outfit Unlockers
    { name: "Office Suit Gift", icon: "💼", price: 150, category: "Outfit", unlocks: "Office Suit", description: "Unlocks the Office Suit outfit." },
    { name: "Maid Costume Box", icon: "📦", price: 120, category: "Outfit", unlocks: "Maid Outfit", description: "Unlocks the Maid outfit." },
    { name: "Cat Lingerie Set", icon: "🐱", price: 180, category: "Outfit", unlocks: "Cat Lingerie", description: "Unlocks the Cat Lingerie outfit." },
    { name: "Micro Bikini Box", icon: "👙", price: 160, category: "Outfit", unlocks: "Micro Bikini", description: "Unlocks the Micro Bikini outfit." },
    { name: "Leather Harness Set", icon: "⛓️", price: 250, category: "Outfit", unlocks: "Bondage Gear", description: "Unlocks the Bondage Gear outfit." },
    { name: "Nurse Outfit Gift", icon: "🏥", price: 130, category: "Outfit", unlocks: "Nurse Costume", description: "Unlocks the Nurse outfit." },
    { name: "Bunny Girl Costume", icon: "🐰", price: 140, category: "Outfit", unlocks: "Bunny Suit", description: "Unlocks the Bunny Suit outfit." },
    { name: "Latex Catsuit Gift", icon: "🖤", price: 300, category: "Outfit", unlocks: "Latex Suit", description: "Unlocks the Latex Suit outfit." },
    { name: "Massage Oil Bottle", icon: "🧴", price: 50, category: "Outfit", unlocks: "Oil Covered", description: "Unlocks the Oil Covered skin." },
    { name: "Classic Sukumizu", icon: "🩱", price: 90, category: "Outfit", unlocks: "School Swimsuit", description: "Unlocks the School Swimsuit outfit." },
    { name: "Succubus Costume", icon: "😈", price: 220, category: "Outfit", unlocks: "Succubus Costume", description: "Unlocks the Succubus outfit." },
    { name: "Cheerleader Uniform", icon: "📣", price: 110, category: "Outfit", unlocks: "Cheerleader Outfit", description: "Unlocks the Cheerleader outfit." },
];

// --- TOY ITEMS FOR SHOP ---
const TOY_ITEMS: { name: string, icon: string, price: number, category: 'Toy', description: string, usage: string, effect: string, tasteIntensity: number }[] = GIFTS.filter(g => g.category === 'Toy').map(g => ({
    name: g.name,
    icon: g.icon,
    price: g.price,
    category: 'Toy',
    description: g.description,
    usage: `Use ${g.name}`,
    effect: "Increases Arousal and Pleasure. May increase Submission depending on item.",
    tasteIntensity: 0
}));


// --- DRUG DATA ---
const DRUG_ITEMS: { name: string, icon: string, price: number, category: 'Soft' | '18+' | 'Hardcore', description: string, usage: string, effect: string, tasteIntensity: number }[] = [
    // Soft / Beginner
    { name: "Energy Drink", icon: "⚡", price: 5, category: "Soft", description: "A quick boost.", usage: "Drink it.", effect: "Restores a small amount of energy.", tasteIntensity: 3 },
    { name: "Relaxing Tea", icon: "🍵", price: 10, category: "Soft", description: "Calms the nerves.", usage: "Sip slowly.", effect: "Reduces stress slightly.", tasteIntensity: 2 },
    { name: "Sleeping Pill", icon: "💊", price: 15, category: "Soft", description: "For a good night's rest.", usage: "Take one before bed.", effect: "Sedates user. Increases Drowsiness gradually.", tasteIntensity: 4 },
    { name: "Vitamin Glow", icon: "✨", price: 25, category: "Soft", description: "Makes skin radiant.", usage: "Daily supplement.", effect: "Increases Beauty stat.", tasteIntensity: 1 },
    { name: "Focus Mints", icon: "🧠", price: 10, category: "Soft", description: "Improves concentration.", usage: "Dissolve in mouth.", effect: "Boosts intellect and focus.", tasteIntensity: 2 },
    { name: "Happy Gummy", icon: "🐻", price: 8, category: "Soft", description: "A sugary mood lifter.", usage: "Chew thoroughly.", effect: "Increases Happiness +5.", tasteIntensity: 1 },
    { name: "Chill Drop", icon: "💧", price: 12, category: "Soft", description: "Instant relaxation.", usage: "Put under tongue.", effect: "Reduces Anxiety and Stress.", tasteIntensity: 1 },
    
    // 18+ / Arousal
    { name: "Pink Mist", icon: "🌸", price: 100, category: "18+", description: "A mild aphrodisiac spray.", usage: "Spray on neck.", effect: "Increases Horniness +10.", tasteIntensity: 4 },
    { name: "Liquid Heat", icon: "🔥", price: 150, category: "18+", description: "Warms the body from inside.", usage: "Mix with drink.", effect: "Increases Wetness & Sensitivity.", tasteIntensity: 6 },
    { name: "Love Potion #9", icon: "🧪", price: 250, category: "18+", description: "Classic arousal formula.", usage: "Drink directly.", effect: "Major boost to Lust & Love.", tasteIntensity: 7 },
    { name: "Blue Vibe", icon: "🔵", price: 120, category: "18+", description: "Heightens touch sensitivity.", usage: "Swallow pill.", effect: "Makes all touch feel electric.", tasteIntensity: 5 },
    { name: "Submission Syrup", icon: "🍯", price: 200, category: "18+", description: "Makes one compliant.", usage: "Sweet tasting syrup.", effect: "Increases Submission stat.", tasteIntensity: 6 },
    { name: "Lust Dust", icon: "✨", price: 180, category: "18+", description: "Sparkling powder of desire.", usage: "Sprinkle on food.", effect: "Increases Lust +15. Lowers Shame.", tasteIntensity: 3 },
    { name: "Tingle Cream", icon: "🧴", price: 90, category: "18+", description: "Topical arousal.", usage: "Apply to skin.", effect: "Increases Sensitivity greatly.", tasteIntensity: 0 },
    { name: "Sensitivity Serum", icon: "💉", price: 300, category: "18+", description: "Extreme touch enhancement.", usage: "Injection.", effect: "Maxes Sensitivity for 1 hour.", tasteIntensity: 5 },
    { name: "Truth Serum", icon: "🗣️", price: 400, category: "18+", description: "Cannot lie.", usage: "Drink.", effect: "Forces honesty. Increases Vulnerability.", tasteIntensity: 6 },
    { name: "Heat Wave Pill", icon: "💊", price: 110, category: "18+", description: "Sudden hot flash.", usage: "Swallow.", effect: "Immediate Arousal spike.", tasteIntensity: 4 },
    
    // Hardcore / 20+
    { name: "Nympho-X", icon: "🧪", price: 2500, category: "Hardcore", description: "LIMIT BREAKER. Instantly maximizes sexual drive.", usage: "Injection.", effect: "Sets Lust, Horniness, Arousal, and Wetness to 100. Removes Shame completely. Lasts 10 minutes.", tasteIntensity: 10 },
    { name: "Panic Drops", icon: "💧", price: 300, category: "Hardcore", description: "Induces intense paranoia and fear.", usage: "Mix with drink.", effect: "Increases Fear & Nervousness +30.", tasteIntensity: 6 },
    { name: "Guilt Trip Tonic", icon: "🍷", price: 350, category: "Hardcore", description: "Causes overwhelming shame and regret.", usage: "Drink.", effect: "Increases Shame & Guilt +40.", tasteIntensity: 7 },
    { name: "Cupid's Elixir", icon: "💘", price: 500, category: "Hardcore", description: "Temporarily creates intense feelings of love.", usage: "Drink.", effect: "Increases Love +50 for 2 hours, then reverts.", tasteIntensity: 2 },
    { name: "Obedience Tab", icon: "👁️", price: 500, category: "Hardcore", description: "Strong mind influence.", usage: "Dissolves on tongue.", effect: "Drastically increases Submission. Lowers inhibition.", tasteIntensity: 8 },
    { name: "Mind Break", icon: "🌀", price: 1000, category: "Hardcore", description: "Overwhelms the senses.", usage: "Injection or pill.", effect: "Induces trance state. Extreme Lust.", tasteIntensity: 9 },
    { name: "Feral Powder", icon: "🐾", price: 600, category: "Hardcore", description: "Unleashes primal instincts.", usage: "Inhale or drink.", effect: "Removes Shame. Maxes Horniness.", tasteIntensity: 8 },
    { name: "Eternal Bond", icon: "🔗", price: 1500, category: "Hardcore", description: "Creates dependency.", usage: "Daily dose.", effect: "Increases Obsession & Jealousy.", tasteIntensity: 7 },
    { name: "Breeder's Bliss", icon: "🥛", price: 800, category: "Hardcore", description: "Focuses mind on mating.", usage: "Thick liquid.", effect: "Increases desire for pregnancy play.", tasteIntensity: 8 },
    { name: "Hypno Spirals", icon: "🍥", price: 700, category: "Hardcore", description: "Visual programming.", usage: "Watch pattern.", effect: "Increases suggestibility.", tasteIntensity: 0 },
    { name: "Memory Haze", icon: "🌫️", price: 900, category: "Hardcore", description: "Fogs recent events.", usage: "Inhale gas.", effect: "Confuses state. Resets short-term memory.", tasteIntensity: 6 },
    { name: "Doll Mode Injection", icon: "💉", price: 2000, category: "Hardcore", description: "Removes all will.", usage: "Intravenous.", effect: "Sets Submission to 100. Removes Personality temporarily.", tasteIntensity: 10 },
    { name: "Obedience V2", icon: "🎛️", price: 1200, category: "Hardcore", description: "Complete control.", usage: "Implant.", effect: "Permanent submission boost.", tasteIntensity: 0 },
    { name: "Bimboifier", icon: "💄", price: 850, category: "Hardcore", description: "Lowers IQ, raises Lust.", usage: "Pink liquid.", effect: "Increases Lust, decreases Intelligence.", tasteIntensity: 9 },
    
    // New Special Stealth Item
    { name: "Ghost Serum", icon: "👻", price: 2500, category: "Hardcore", description: "Advanced chemical agent. Neutralizes all flavors and odors in a mix while keeping potency intact.", usage: "Mix with drugs.", effect: "Sets Detection Risk to 0%.", tasteIntensity: -100 },
    // The Reset Drug
    { name: "Neuro-Reset", icon: "💊", price: 500, category: "Hardcore", description: "Instantly neutralizes all drugs. Floods mind with reality.", usage: "Swallow.", effect: "Removes all status effects. Causes Shame/Regret/Confusion.", tasteIntensity: 10 },
    // NEW WAKE UP ITEM
    { name: "Adrenaline Shot", icon: "💉", price: 150, category: "Hardcore", description: "Instantly wakes her up.", usage: "Injection.", effect: "Sets Drowsiness to 0. Wakes up immediately.", tasteIntensity: 5 }
];

// --- FOOD DATA ---
const FOOD_ITEMS: { name: string, icon: string, price: number, category: 'Food' | 'Drink', description: string, maskingLevel: number }[] = [
    { name: "Hot Coffee", icon: "☕", price: 5, category: "Drink", description: "Freshly brewed.", maskingLevel: 8 },
    { name: "Iced Tea", icon: "🍹", price: 4, category: "Drink", description: "Cool and refreshing.", maskingLevel: 5 },
    { name: "Cola", icon: "🥤", price: 3, category: "Drink", description: "Fizzy and sweet.", maskingLevel: 6 },
    { name: "Orange Juice", icon: "🍊", price: 6, category: "Drink", description: "100% natural.", maskingLevel: 7 },
    { name: "Slice of Cake", icon: "🍰", price: 8, category: "Food", description: "Strawberry shortcake.", maskingLevel: 7 },
    { name: "Burger", icon: "🍔", price: 12, category: "Food", description: "Juicy beef burger.", maskingLevel: 9 },
    { name: "Pizza Slice", icon: "🍕", price: 5, category: "Food", description: "Pepperoni slice.", maskingLevel: 9 },
    { name: "Donut", icon: "🍩", price: 3, category: "Food", description: "Glazed ring.", maskingLevel: 6 },
    { name: "Ice Cream", icon: "🍦", price: 6, category: "Food", description: "Vanilla swirl.", maskingLevel: 5 },
    { name: "Cocktail", icon: "🍸", price: 15, category: "Drink", description: "Strong and fruity.", maskingLevel: 8 },
    { name: "Water", icon: "💧", price: 1, category: "Drink", description: "Plain water.", maskingLevel: 1 },
    { name: "Spicy Curry", icon: "🍛", price: 14, category: "Food", description: "Very hot!", maskingLevel: 10 },
    { name: "Sushi Platter", icon: "🍣", price: 25, category: "Food", description: "Fresh fish.", maskingLevel: 4 },
    { name: "Red Wine", icon: "🍷", price: 20, category: "Drink", description: "Rich and bold.", maskingLevel: 7 },
    { name: "Champagne", icon: "🍾", price: 50, category: "Drink", description: "Bubbly celebration.", maskingLevel: 6 },
    { name: "Milkshake", icon: "🥤", price: 7, category: "Drink", description: "Thick chocolate.", maskingLevel: 8 },
    { name: "Ramen", icon: "🍜", price: 10, category: "Food", description: "Hot noodle soup.", maskingLevel: 9 },
    { name: "Salad", icon: "🥗", price: 8, category: "Food", description: "Healthy greens.", maskingLevel: 2 },
    { name: "Steak", icon: "🥩", price: 35, category: "Food", description: "Rare cooked.", maskingLevel: 8 },
    { name: "Hot Cocoa", icon: "☕", price: 4, category: "Drink", description: "Warm chocolate.", maskingLevel: 7 },
    { name: "Lemonade", icon: "🍋", price: 3, category: "Drink", description: "Sour and sweet.", maskingLevel: 6 },
    { name: "Chocolate Cake", icon: "🎂", price: 40, category: "Food", description: "Whole cake.", maskingLevel: 8 },
];

// --- NEW: ACTION DETAIL VARIANTS ---
const ACTION_VARIANTS: Record<string, string[]> = {
    // Flirty/Risky
    'Kiss': ['Soft Peck', 'French Kiss', 'Biting Lip', 'Tongue Wrestle', 'Neck Kiss', 'Ear Nibble'],
    'Touch': ['Gentle Caress', 'Firm Squeeze', 'Pinch', 'Scratch', 'Trace Curves', 'Rub Thigh'],
    'Massage': ['Shoulder Rub', 'Foot Massage', 'Back Massage', 'Sensual Oil Rub', 'Deep Tissue'],
    'Undress': ['Slow Strip', 'Rip Off', 'Pull Down', 'Lift Up', 'Cut Off', 'Tease'],
    
    // 18+ Sexual
    'Pussy Play': ['Rub Clit', 'One Finger', 'Two Fingers', 'Fist', 'Slap', 'Spread', 'Grind'],
    'Oral': ['Lick', 'Suck', 'Deep Throat', 'Tease Tip', 'Gag', 'Face Fuck', 'Swallow'],
    'Ass Worship': ['Rim', 'Spank', 'Spread', 'Finger', 'Massage', 'Bite'],
    'Anal Sex': ['Slow Insert', 'Pound', 'Grind', 'Double Penetration', 'Gape', 'Balls Deep'],
    'Sex': ['Missionary', 'Doggy Style', 'Cowgirl', 'Prone Bone', 'Standing', 'Mating Press'],
    'Titjob': ['Squeeze', 'Slide', 'Slap', 'Smother', 'Oil'],
    'Spanking': ['Light Tap', 'Firm Slap', 'Paddle', 'Belt', 'Whip', 'Crop'],
    'Deep Throat': ['Slow', 'Fast', 'Hold Down', 'Gag'],
    'Creampie': ['Deep', 'Pull Out Then In', 'Hold In', 'Messy'],
    
    // Sleep Specific
    'Grope': ['Squeeze Breast', 'Rub Crotch', 'Pinch Nipple', 'Slap Ass'],
    'Touch Body': ['Trace Skin', 'Hold Hand', 'Stroke Hair', 'Rub Back'],
    'Undress (Sleep)': ['Lift Shirt', 'Pull Down Pants', 'Unclip Bra', 'Remove Panties'],
    'Use Toy (Sleep)': ['Vibrate on Clit', 'Insert Gently', 'Tease Nipple', 'Anal Play']
};

const GENERIC_TOY_VARIANTS = ['Vibrate Low', 'Vibrate High', 'Pulse', 'Thrust', 'Rotate', 'Tease', 'Edge'];


const DollarSignIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a4.5 4.5 0 0 0 0 9H15a4.5 4.5 0 0 1 0 9H7"></path></svg>
);

const MoneyBadge: React.FC<{ amount: number, label?: string, iconColor?: string, onClick?: () => void }> = ({ amount, label, iconColor = "text-emerald-400", onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-sm transition-colors ${onClick ? 'hover:bg-emerald-500/30 cursor-pointer' : ''}`}>
        <DollarSignIcon className={`w-4 h-4 ${iconColor}`} />
        {label && <span className="text-xs font-bold text-emerald-200 uppercase tracking-wide hidden sm:inline">{label}</span>}
        <span className="text-xs font-mono text-white font-bold">${amount.toLocaleString()}</span>
    </button>
);

// --- Helper Functions for Item Analysis ---

const getDetectionRisk = (score: number) => {
    if (score <= 0) return { label: 'Undetectable', color: 'text-green-400' };
    if (score < 20) return { label: 'Very Low Risk', color: 'text-green-400' };
    if (score < 50) return { label: 'Low Risk', color: 'text-yellow-400' };
    if (score < 80) return { label: 'High Risk', color: 'text-orange-500' };
    return { label: 'Extreme Risk', color: 'text-red-600' };
};

const calculateSuspicion = (item: SisterItem) => {
    if (!item.mixedItems || item.mixedItems.length === 0) return 0;
    const drugs = item.mixedItems;
    const baseMasking = item.maskingLevel || 5;
    const totalTaste = drugs.reduce((sum, d) => sum + (d.tasteIntensity || 5), 0);
    
    // Formula: Taste * 10 - Masking * 5
    // A massive negative taste (like -100 from Ghost Serum) will result in a negative total, clamped to 0.
    return Math.max(0, (totalTaste * 10) - (baseMasking * 5));
};

// --- Helper: Apply Time Decay (Updated with Sleep Logic) ---
const applyTimeDecay = (state: ExtendedSisterState): ExtendedSisterState => {
    const newEmotions = { ...state.emotions };
    // DO NOT RESET PHYSICAL STATS HERE. Let them persist or decay very slowly.
    const newPhysical = { ...state.physicalCondition };
    
    let newEnergy = Math.max(0, state.energy - 2);
    let newDrowsiness = state.drowsiness;
    let isAsleep = state.isAsleep;
    const activeDrugs = state.activeDrugs || [];

    // Gradual Increase (if Sedated)
    if (activeDrugs.includes('Sedated') && !isAsleep) {
        newDrowsiness = Math.min(100, newDrowsiness + 10); // +10 per tick if sedated
        if (newDrowsiness >= 95) { 
             isAsleep = true;
        }
    }

    if (!isAsleep) {
        // Awake Logic: Natural Decay
        if (newDrowsiness > 0) {
             // Decay faster if awake and not being sedated further
             if (!activeDrugs.includes('Sedated')) {
                newDrowsiness = Math.max(0, newDrowsiness - 5);
             }
        }
        
        if (newDrowsiness >= 100) {
            isAsleep = true;
            newDrowsiness = 100; 
        }
        
        // Standard Decay ONLY when awake
        if ((newEmotions['Lust'] || 0) > 0) newEmotions['Lust'] = Math.max(0, (newEmotions['Lust'] || 0) - 2);
        if ((newEmotions['Horniness'] || 0) > 0) newEmotions['Horniness'] = Math.max(0, (newEmotions['Horniness'] || 0) - 5);
        if ((newEmotions['Arousal'] || 0) > 0) newEmotions['Arousal'] = Math.max(0, (newEmotions['Arousal'] || 0) - 10);
        if ((newEmotions['Wetness'] || 0) > 0) newEmotions['Wetness'] = Math.max(0, (newEmotions['Wetness'] || 0) - 10);
        if ((newEmotions['Stress'] || 0) > 0) newEmotions['Stress'] = Math.max(0, (newEmotions['Stress'] || 0) - 5);
        
        // Slow Physical Decay when awake (healing/cleaning)
        // if (newPhysical.soreness > 0) newPhysical.soreness = Math.max(0, newPhysical.soreness - 2);
        // if (newPhysical.stickiness > 0) newPhysical.stickiness = Math.max(0, newPhysical.stickiness - 2);
        // if (newPhysical.wetness > 0) newPhysical.wetness = Math.max(0, newPhysical.wetness - 2); 

    } else {
        // Asleep Logic: Energy recovers
        newEnergy = Math.min(100, newEnergy + 5);
        
        // Drowsiness slowly decays naturally over sleep
        newDrowsiness = Math.max(0, newDrowsiness - 2); 
        
        // Wake up threshold
        if (newDrowsiness < 20) {
            isAsleep = false;
        }
        
        // **CRITICAL FIX**: Do NOT decay physical stats while asleep. They accumulate or stay.
    }

    // Sleep reset logic (Energy based fall asleep if not drugged)
    let newMood = state.mood;
    if (newEnergy < 20 && state.mood !== 'Tired' && !isAsleep) newMood = 'Tired';
    if (newEnergy < 5 && !isAsleep) newMood = 'Exhausted';
    if (isAsleep) newMood = 'Asleep';

    return {
        ...state,
        energy: newEnergy,
        mood: newMood,
        emotions: newEmotions,
        physicalCondition: newPhysical,
        isAsleep,
        drowsiness: newDrowsiness
    };
};

// --- HELPER FOR SLEEP CONSEQUENCES ---
const calculateSleepConsequences = (actionLabel: string) => {
    const consequences = { soreness: 0, wetness: 0, pain: 0, stickiness: 0 };
    const label = actionLabel.toLowerCase();

    if (label.includes('anal')) {
        consequences.soreness += 30;
        consequences.pain += 15;
        consequences.wetness += 10; // Lube/sweat
    }
    if (label.includes('creampie') || label.includes('finish') || label.includes('cum')) {
        consequences.wetness += 40;
        consequences.stickiness += 50;
    }
    if (label.includes('sex') || label.includes('fuck') || label.includes('use')) {
        consequences.wetness += 30;
        consequences.soreness += 10;
    }
    if (label.includes('rough') || label.includes('force') || label.includes('choke') || label.includes('slap')) {
        consequences.soreness += 20;
        consequences.pain += 20;
    }
    if (label.includes('oral') || label.includes('throat') || label.includes('mouth')) {
        consequences.stickiness += 20; // Saliva/Mess
        consequences.soreness += 5; // Jaw
    }
    if (label.includes('touch') || label.includes('grope') || label.includes('rub')) {
        consequences.wetness += 10;
    }

    return consequences;
};


// --- Sub-Components ---

const BodyInspectorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    state: ExtendedSisterState;
}> = ({ isOpen, onClose, state }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'upper' | 'lower' | 'internal'>('general');

    if (!isOpen) return null;

    // Helper for outfit parsing
    const getUnderwear = (outfit: string) => {
        if (['Nude', 'Towel', 'Micro Bikini', 'Oil Covered'].includes(outfit)) return 'None/Minimal';
        if (['Lingerie', 'Cat Lingerie', 'Bondage Gear', 'Succubus Costume'].includes(outfit)) return 'Matching Set';
        if (['Swimsuit', 'School Swimsuit'].includes(outfit)) return 'Swimwear';
        return 'Cotton Basics'; // Default
    };

    const currentUnderwear = getUnderwear(state.currentOutfit);

    // Helper for calculating specific body part status based on emotions/physicals
    const arousal = state.emotions['Arousal'] || 0;
    const wetness = state.emotions['Wetness'] || state.physicalCondition.wetness || 0; // Combine emotion wetness and physical wetness (lube etc)
    const soreness = state.physicalCondition.soreness;
    const stickiness = state.physicalCondition.stickiness;

    const getNippleStatus = (arousalLevel: number) => {
        if (arousalLevel > 80) return "Rock Hard";
        if (arousalLevel > 40) return "Perky";
        return "Soft";
    };

    const getPussyStatus = (wetLevel: number) => {
         if (wetLevel > 80) return "Soaking / Dripping";
         if (wetLevel > 40) return "Moist";
         return "Dry";
    };
    
    const getHairStatus = (outfit: string) => {
        if (['Micro Bikini', 'Oil Covered', 'Nude'].includes(outfit)) return "Completely Shaved";
        return "Neatly Trimmed"; // Default assumption
    };

    // Helper for insertions (Simulated since we don't track specific item IDs in specific holes in state yet)
    // We infer from recent high impact/pain/soreness + inventory checks if we wanted to be very precise, 
    // but simpler logic is checking 'activeDrugs' or special flags if we had them.
    // For now, we use placeholder logic that could be expanded with real state tracking.
    const getInsertions = (zone: 'Mouth' | 'Pussy' | 'Ass') => {
        // In a real implementation, we would check `state.insertions[zone]`.
        // Here we simulate "Empty" unless specific conditions (like very high soreness implies recent use)
        let status = "Empty";
        if (zone === 'Ass' && soreness > 50) status = "Gaping / Used";
        if (zone === 'Pussy' && wetness > 90) status = "Filled (Fluids)";
        // If we had specific toy logic in state like `state.activeToys`, we'd list them here.
        return status;
    };

    const getDamageReport = () => {
        let damage = [];
        if (state.physicalCondition.pain > 20) damage.push("Visible wincing");
        if (state.physicalCondition.soreness > 50) damage.push("Difficulty walking");
        if (state.physicalCondition.stickiness > 50) damage.push("Covered in fluids");
        // Add tattoos if we had them in state (e.g. from a 'Tattoo' event)
        // damage.push("Tattoo: 'Owned' on lower back"); 
        return damage.length > 0 ? damage.join(", ") : "None visible";
    };

    return (
         <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div className="w-full max-w-5xl bg-slate-950 border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh]" onClick={e => e.stopPropagation()}>
                 
                 {/* Left: Visual Silhouette & Hotspots */}
                 <div className="w-full md:w-1/3 bg-black/60 relative flex items-center justify-center border-r border-white/10 p-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent pointer-events-none"></div>
                    
                    {/* Silhouette Container */}
                    <div className="relative w-64 h-[500px] border-2 border-cyan-500/30 rounded-[100px] flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.1)] animate-pulse-glow bg-slate-900/80">
                         <div className="text-cyan-500 font-mono text-[10px] tracking-[0.3em] absolute top-4">Bio-Scan Active</div>
                         
                         {/* Body Outline Mockup (CSS Shapes) */}
                         <div className="w-40 h-full relative opacity-50">
                            {/* Head */}
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-20 h-24 border border-cyan-400/40 rounded-full bg-cyan-500/5"></div>
                            {/* Torso */}
                            <div className="absolute top-36 left-1/2 -translate-x-1/2 w-32 h-40 border border-cyan-400/40 rounded-3xl bg-cyan-500/5"></div>
                            {/* Hips */}
                            <div className="absolute top-80 left-1/2 -translate-x-1/2 w-36 h-24 border border-cyan-400/40 rounded-3xl bg-cyan-500/5"></div>
                         </div>

                         {/* Hotspots / Status Indicators */}
                         <div className={`absolute top-24 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/80 border border-cyan-500/50 rounded text-[9px] text-cyan-300 ${state.physicalCondition.soreness > 10 ? 'text-red-400 border-red-500/50' : ''}`}>MOUTH: {getInsertions('Mouth')}</div>
                         <div className={`absolute top-48 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/80 border border-pink-500/50 rounded text-[9px] text-pink-300`}>NIPPLES: {getNippleStatus(arousal)}</div>
                         <div className={`absolute top-[340px] left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/80 border border-purple-500/50 rounded text-[9px] text-purple-300 ${wetness > 50 ? 'animate-pulse' : ''}`}>PUSSY: {getPussyStatus(wetness)}</div>
                         
                         {/* Overall Status Overlays */}
                         {state.physicalCondition.stickiness > 30 && (
                             <div className="absolute inset-0 bg-yellow-500/5 rounded-[100px] pointer-events-none border-t-4 border-yellow-500/20"></div>
                         )}
                    </div>
                    
                    {/* Scanning Line Animation */}
                    <div className="absolute inset-x-0 h-0.5 bg-cyan-500/50 blur-sm animate-hud-scanline top-0"></div>
                 </div>

                 {/* Right: Data Panel */}
                 <div className="w-full md:w-2/3 flex flex-col bg-slate-900">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                         <div>
                             <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2"><ActivityIcon className="w-6 h-6"/> Body Inspector</h2>
                             <p className="text-xs text-slate-400 font-mono uppercase mt-1">Subject: {state.isAsleep ? "UNCONSCIOUS" : "AWAKE"} | Heart Rate: {100 + (arousal / 2)} BPM</p>
                         </div>
                         <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"><XIcon className="w-6 h-6"/></button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        {['general', 'upper', 'lower', 'internal'].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? 'bg-cyan-500/10 text-cyan-300 border-b-2 border-cyan-500' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                            >
                                {tab} Body
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
                        
                        {activeTab === 'general' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Attire</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between"><span className="text-sm text-slate-300">Outfit</span><span className="text-sm font-mono text-cyan-300">{state.currentOutfit}</span></div>
                                            <div className="flex justify-between"><span className="text-sm text-slate-300">Underwear</span><span className="text-sm font-mono text-pink-300">{currentUnderwear}</span></div>
                                            <div className="flex justify-between"><span className="text-sm text-slate-300">State</span><span className="text-sm font-mono text-white">{state.currentOutfit === 'Nude' ? 'Exposed' : 'Clothed'}</span></div>
                                        </div>
                                    </div>
                                    <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Skin Condition</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between"><span className="text-sm text-slate-300">Cleanliness</span><span className={`text-sm font-mono ${stickiness > 20 ? 'text-yellow-400' : 'text-green-400'}`}>{stickiness > 50 ? 'Messy' : stickiness > 20 ? 'Sticky' : 'Clean'}</span></div>
                                            <div className="flex justify-between"><span className="text-sm text-slate-300">Temp</span><span className={`text-sm font-mono ${arousal > 50 ? 'text-red-400' : 'text-blue-300'}`}>{arousal > 50 ? 'Hot / Flushed' : 'Normal'}</span></div>
                                            <div className="flex justify-between"><span className="text-sm text-slate-300">Marks</span><span className="text-sm font-mono text-red-300">{getDamageReport()}</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-red-900/10 p-4 rounded-xl border border-red-500/20">
                                    <h3 className="text-xs font-bold text-red-400 uppercase mb-3">Body Type & Features</h3>
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        Slim and athletic build with soft, pale skin. 
                                        {/* Dynamic additions based on stats could go here */}
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'upper' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="grid grid-cols-1 gap-4">
                                     <div className="bg-pink-900/10 p-4 rounded-xl border border-pink-500/20 relative overflow-hidden">
                                        <div className="absolute right-0 top-0 p-4 opacity-10"><HeartIcon className="w-24 h-24"/></div>
                                        <h3 className="text-sm font-bold text-pink-300 uppercase mb-4">Breasts</h3>
                                        <div className="space-y-3 relative z-10">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-300">Size</span>
                                                <span className="font-mono text-white">C-Cup (Natural)</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-300">Nipples</span>
                                                <span className={`font-mono font-bold ${getNippleStatus(arousal) === 'Rock Hard' ? 'text-red-400' : 'text-pink-200'}`}>{getNippleStatus(arousal)}</span>
                                            </div>
                                             <div className="flex justify-between items-center">
                                                <span className="text-slate-300">Sensitivity</span>
                                                <div className="w-32 bg-black/40 h-2 rounded-full overflow-hidden">
                                                    <div className="h-full bg-pink-500" style={{width: `${(state.emotions['Sensitivity'] || 0)}%`}}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                     <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Mouth</h3>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-300">Status</span>
                                            <span className="font-mono text-white">{getInsertions('Mouth')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'lower' && (
                             <div className="space-y-6 animate-fade-in-up">
                                <div className="bg-purple-900/10 p-4 rounded-xl border border-purple-500/20 relative">
                                    <h3 className="text-sm font-bold text-purple-300 uppercase mb-4">Genitals (Pussy)</h3>
                                    <div className="space-y-3">
                                         <div className="flex justify-between items-center">
                                            <span className="text-slate-300">Wetness Level</span>
                                            <span className={`font-mono font-bold ${wetness > 50 ? 'text-blue-400' : 'text-slate-400'}`}>{getPussyStatus(wetness)} ({wetness}%)</span>
                                        </div>
                                        <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 transition-all duration-1000" style={{width: `${wetness}%`}}></div>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                            <span className="text-slate-300">Hair Style</span>
                                            <span className="font-mono text-purple-200">{getHairStatus(state.currentOutfit)}</span>
                                        </div>
                                         <div className="flex justify-between items-center">
                                            <span className="text-slate-300">Outer Labia</span>
                                            <span className="font-mono text-purple-200">{arousal > 60 ? 'Swollen / Parted' : 'Closed'}</span>
                                        </div>
                                    </div>
                                </div>

                                 <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Anal</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-300">Condition</span>
                                            <span className="font-mono text-white">{soreness > 40 ? 'Red / Sore' : 'Normal'}</span>
                                        </div>
                                         <div className="flex justify-between items-center">
                                            <span className="text-slate-300">Tightness</span>
                                            <span className="font-mono text-white">{soreness > 60 ? 'Loose / Gaping' : 'Tight'}</span>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        )}
                        
                        {activeTab === 'internal' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="bg-slate-800/50 p-6 rounded-xl border border-dashed border-slate-600 flex flex-col items-center justify-center text-center">
                                    <h3 className="text-lg font-bold text-slate-300 mb-4">Active Penetrations</h3>
                                    
                                    <div className="grid grid-cols-3 gap-4 w-full">
                                        <div className="bg-black/40 p-3 rounded-lg">
                                            <span className="block text-xs text-slate-500 uppercase mb-1">Mouth</span>
                                            <span className={`font-bold ${getInsertions('Mouth') !== 'Empty' ? 'text-red-400' : 'text-slate-400'}`}>{getInsertions('Mouth')}</span>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded-lg">
                                            <span className="block text-xs text-slate-500 uppercase mb-1">Pussy</span>
                                            <span className={`font-bold ${getInsertions('Pussy') !== 'Empty' ? 'text-purple-400' : 'text-slate-400'}`}>{getInsertions('Pussy')}</span>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded-lg">
                                            <span className="block text-xs text-slate-500 uppercase mb-1">Ass</span>
                                            <span className={`font-bold ${getInsertions('Ass') !== 'Empty' ? 'text-orange-400' : 'text-slate-400'}`}>{getInsertions('Ass')}</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-500 mt-4">
                                        * Internal status is inferred based on recent activities and physical soreness levels.
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                 </div>
            </div>
         </div>
    );
}


const SisterPOVOverlay: React.FC<{
    data: SisterPOVResponse | null;
    povHistory: string[];
    isLoading: boolean;
    onNext: () => void;
    onExit: () => void;
    profileName: string;
    currentProfileState: SisterState;
}> = ({ data, povHistory, isLoading, onNext, onExit, profileName, currentProfileState }) => {
    const historyContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (historyContainerRef.current) {
            historyContainerRef.current.scrollTop = historyContainerRef.current.scrollHeight;
        }
    }, [povHistory, data]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } },
        exit: { opacity: 0, transition: { duration: 0.3 } }
    };

    const displayLocation = data?.newState?.currentLocation || currentProfileState.currentLocation;
    const displayOutfit = data?.newState?.currentOutfit || currentProfileState.currentOutfit;
    const displayActivity = data?.status || currentProfileState.currentActivity;
    const displayItem = data?.itemUsed ? String(data.itemUsed) : "None";


    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col"
        >
            <div className="flex justify-between items-center p-4 border-b border-purple-500/30 bg-slate-900/80 shadow-lg z-20">
                <div className="flex items-center gap-3">
                    <TelescopeIcon className="w-6 h-6 text-purple-400 animate-pulse" />
                    <div>
                        <h2 className="text-lg font-bold text-purple-200 tracking-wider uppercase">Invisible Observer</h2>
                        <p className="text-xs text-purple-400/70 font-mono">TARGET: {profileName.toUpperCase()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-purple-500/20">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-mono text-red-400">
                             {isLoading ? "GENERATING..." : "LIVE FEED"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-px bg-purple-900/20 border-b border-purple-500/30">
                <div className="bg-slate-900/40 p-2 flex flex-col items-center justify-center">
                     <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider mb-1">Location</span>
                     <span className="text-xs text-white font-medium text-center">{displayLocation}</span>
                </div>
                <div className="bg-slate-900/40 p-2 flex flex-col items-center justify-center">
                     <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider mb-1">Outfit</span>
                     <span className="text-xs text-white font-medium text-center">{displayOutfit}</span>
                </div>
                <div className="bg-slate-900/40 p-2 flex flex-col items-center justify-center">
                     <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider mb-1">Activity</span>
                     <span className="text-xs text-white font-medium text-center">{displayActivity}</span>
                </div>
                <div className="bg-slate-900/40 p-2 flex flex-col items-center justify-center">
                     <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider mb-1">Holding/Using</span>
                     <span className="text-xs text-white font-medium text-center">{displayItem}</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden relative">
                 <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-full h-full bg-purple-900/10 rounded-full filter blur-[120px] animate-pulse"></div>
                </div>

                <div ref={historyContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar z-10">
                    {povHistory.map((log, index) => (
                        <div key={index} className="opacity-60 border-l-2 border-slate-700 pl-4 py-1 text-sm text-slate-400 font-mono">
                            {log}
                        </div>
                    ))}

                    {isLoading && !data ? (
                        <div className="flex items-center gap-3 p-4 text-purple-300 animate-pulse">
                            <LoaderIcon className="w-5 h-5 animate-spin" />
                            <span className="font-mono text-sm">Processing visual data...</span>
                        </div>
                    ) : data ? (
                        <div className="space-y-4 animate-fade-in-up">
                            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">
                                <span>[{data.time}]</span>
                                <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                                <span>{data.status}</span>
                                {data.isNSFW && <span className="ml-2 px-2 py-0.5 bg-red-900/80 text-red-200 rounded border border-red-500/30">NSFW ACTIVITY</span>}
                            </div>

                            <div className="bg-slate-800/60 border border-purple-500/30 rounded-xl p-5 shadow-lg backdrop-blur-sm">
                                <p className="text-base text-slate-200 leading-relaxed font-serif">
                                    {data.narrative}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4 relative">
                                    <div className="absolute -top-2 left-4 px-2 bg-slate-950 text-[10px] font-bold text-indigo-300 uppercase">Inner Thought</div>
                                    <p className="text-indigo-200 italic text-sm">"{data.thoughts}"</p>
                                </div>

                                <div className="space-y-2">
                                    {data.itemUsed && (
                                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-3">
                                            <GiftIcon className="w-5 h-5 text-yellow-400" />
                                            <div>
                                                <span className="text-[10px] font-bold text-yellow-500 uppercase block">Item Interaction</span>
                                                <span className="text-sm text-yellow-100">{String(data.itemUsed)}</span>
                                            </div>
                                        </div>
                                    )}
                                    {data.newState?.currentOutfit && (
                                         <div className="bg-pink-900/20 border border-pink-500/30 rounded-lg p-3 flex items-center gap-3">
                                            <span className="text-xl">👗</span>
                                            <div>
                                                <span className="text-[10px] font-bold text-pink-400 uppercase block">Outfit Change</span>
                                                <span className="text-sm text-pink-100">{data.newState.currentOutfit}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}
                    <div className="h-20"></div>
                </div>
            </div>

            <div className="p-4 border-t border-purple-500/30 bg-slate-900/90 z-20 flex justify-between items-center gap-4">
                 <button onClick={onExit} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                    <EyeOffIcon className="w-5 h-5" /> Stop Watching
                </button>
                
                 <button 
                    onClick={onNext} 
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <><LoaderIcon className="w-6 h-6 animate-spin"/> Observing...</>
                    ) : (
                        <><PlayIcon className="w-6 h-6 fill-current"/> Next Moment</>
                    )}
                </button>
            </div>
        </motion.div>
    );
};

// NEW: Holographic Tooltip for Item Details (Updated for Gifts/Actions)
const ItemDetailTooltip: React.FC<{ item: any; position: { x: number, y: number } | null }> = ({ item, position }) => {
    if (!position || !item) return null;

    // Determine type of item
    const isAction = item.category && ['Friendly', 'Care', 'Tease', 'Flirty', 'Risky', '18+', 'Toys', 'Context', 'Location', 'Sleep'].includes(item.category);
    const isGift = item.category && ['Normal', 'Romantic', '18+', 'Outfit', 'Toy'].includes(item.category) && !item.effect;
    const isDrug = ['Soft', '18+', 'Hardcore'].includes(item.category || '') && item.effect;
    const isFood = ['Food', 'Drink'].includes(item.category || '');
    const isMixed = item.mixedItems && item.mixedItems.length > 0;
    
    let suspicion = 0;
    let risk = { label: 'N/A', color: 'text-slate-400' };

    if (isMixed) {
        suspicion = calculateSuspicion(item as SisterItem);
        risk = getDetectionRisk(suspicion);
    }
    
    const isStealthItem = item.tasteIntensity !== undefined && item.tasteIntensity < 0;

    return (
        <div 
            className="fixed z-50 w-72 bg-slate-900/95 border border-cyan-500/30 rounded-xl p-4 shadow-2xl backdrop-blur-xl pointer-events-none animate-fade-in-up"
            style={{ 
                top: position.y, 
                left: position.x,
                boxShadow: '0 0 20px rgba(6,182,212,0.15), inset 0 0 10px rgba(6,182,212,0.05)'
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-2 mb-2">
                <span className="text-3xl filter drop-shadow-lg">{item.icon}</span>
                <div>
                    <h4 className="font-bold text-cyan-100 text-sm">{item.name || item.label}</h4>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400/80">{item.category}</span>
                </div>
            </div>

            {/* Description */}
            {item.description && (
                <p className="text-xs text-slate-300 mb-3 italic">"{String(item.description)}"</p>
            )}

            {/* Action Specific Stats */}
            {isAction && (
                <div className="space-y-2 mb-2">
                    {item.minLove && (
                         <div className="flex justify-between text-[10px] font-bold text-pink-400 uppercase">
                            <span>Love Required</span>
                            <span>{item.minLove}+</span>
                        </div>
                    )}
                    {item.risk && (
                         <div className="flex justify-between text-[10px] font-bold text-orange-400 uppercase">
                            <span>Rejection Risk</span>
                            <span>{item.risk}%</span>
                        </div>
                    )}
                </div>
            )}

            {/* Gift Specific Stats */}
            {isGift && item.price > 0 && (
                <div className="flex justify-between text-[10px] font-bold text-emerald-400 uppercase mb-2">
                    <span>Price</span>
                    <span>${item.price}</span>
                </div>
            )}
             {isGift && item.unlocks && (
                <div className="flex justify-between text-[10px] font-bold text-purple-400 uppercase mb-2">
                    <span>Unlocks</span>
                    <span>{item.unlocks}</span>
                </div>
            )}


            {/* Drug Stats */}
            {isDrug && (
                <div className="space-y-2 mb-2">
                    <div className="space-y-1">
                         {isStealthItem ? (
                            <div className="flex justify-between text-[10px] font-bold text-green-400 uppercase">
                                <span>Stealth Modifier</span>
                                <span>MAX</span>
                            </div>
                         ) : (
                             <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                <span>Taste Intensity</span>
                                <span>{item.tasteIntensity || 0}/10</span>
                            </div>
                         )}
                         
                        {isStealthItem ? (
                             <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-green-500 w-full animate-pulse" />
                            </div>
                        ) : (
                            <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${(item.tasteIntensity || 0) > 5 ? 'bg-red-500' : 'bg-yellow-500'}`} 
                                    style={{ width: `${((item.tasteIntensity || 0) / 10) * 100}%` }}
                                />
                            </div>
                        )}
                    </div>
                    {item.effect && (
                        <div className="bg-cyan-900/20 p-2 rounded border border-cyan-500/20">
                            <span className="text-[10px] font-bold text-cyan-300 uppercase block mb-1">Effect</span>
                            <span className="text-xs text-cyan-100">{String(item.effect)}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Food Stats */}
            {(isFood || isMixed) && (
                <div className="space-y-1 mb-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Masking Potential</span>
                        <span>{item.maskingLevel || 0}/10</span>
                    </div>
                    <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                        <div 
                            className="h-full rounded-full bg-blue-500" 
                            style={{ width: `${((item.maskingLevel || 0) / 10) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Mixed Item Analysis */}
            {isMixed && (
                <div className="mt-3 pt-2 border-t border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-300">Detection Risk:</span>
                        <span className={`text-xs font-bold ${risk.color}`}>{risk.label}</span>
                    </div>
                    
                    <div className="bg-purple-900/20 p-2 rounded border border-purple-500/20">
                        <span className="text-[10px] font-bold text-purple-300 uppercase block mb-1">Active Ingredients</span>
                        <div className="flex flex-wrap gap-1">
                            {item.mixedItems!.map((drug: any, i: number) => (
                                <span key={i} className="text-[10px] bg-purple-600/40 text-purple-100 px-1.5 py-0.5 rounded border border-purple-500/30">{drug.name}</span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="text-[10px] text-slate-400 bg-black/30 p-2 rounded">
                         <span className="font-bold text-slate-300">Combined Effect:</span><br/>
                         {item.mixedItems!.map((d: any) => d.effect).join(' + ')}
                    </div>
                </div>
            )}
        </div>
    );
};

const CoreStatsBar: React.FC<{ state: ExtendedSisterState; onAdvanceTime: () => void; onMoneyClick: () => void }> = ({ state, onAdvanceTime, onMoneyClick }) => (
    <div className="w-full bg-slate-900/80 backdrop-blur-md border-b border-white/10 py-2 px-4 flex items-center justify-between z-20 overflow-x-auto no-scrollbar shadow-lg">
        <div className="flex items-center gap-3 md:gap-6 min-w-max mx-auto">
             <button onClick={onAdvanceTime} className={`flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm hover:bg-white/10 transition-colors ${TIME_PERIODS[state.timeOfDay].bgClass} border-white/20`} title="Click to wait 1 hour">
                <span className="text-lg">{TIME_PERIODS[state.timeOfDay].icon}</span>
                <div className="flex flex-col leading-none">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-wide">{state.timeOfDay}</span>
                    <span className="text-xs font-mono text-white font-bold">{state.gameHour.toString().padStart(2, '0')}:00</span>
                </div>
            </button>

             <div className="flex items-center gap-2 px-4 py-1.5 bg-pink-500/10 rounded-full border border-pink-500/20 shadow-sm">
                <HeartIcon className="w-4 h-4 text-pink-400" />
                <span className="text-xs font-bold text-pink-200 uppercase tracking-wide">Mood</span>
                <span className="text-xs font-mono text-white font-bold">{state.isAsleep ? "Asleep 😴" : state.drowsiness > 50 ? "Drowsy 😪" : state.mood}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 shadow-sm">
                <UsersIcon className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-200 uppercase tracking-wide">Affection</span>
                <span className="text-xs font-mono text-white font-bold">{state.affection}%</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/20 shadow-sm">
                <LockIcon className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-rose-200 uppercase tracking-wide">Love</span>
                <span className="text-xs font-mono text-white font-bold">{state.secretLove}%</span>
            </div>
             <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 rounded-full border border-purple-500/20 shadow-sm">
                <ZapIcon className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-200 uppercase tracking-wide">Lust</span>
                <span className="text-xs font-mono text-white font-bold">{state.emotions['Lust'] || 0}%</span>
            </div>
            <MoneyBadge amount={state.sisterMoney} label="Maya's Cash" onClick={onMoneyClick} />
        </div>
    </div>
);

const ChatBubble: React.FC<{ message: ChatMessage; isUser: boolean; actionResult?: SisterActionResult | null }> = ({ message, isUser, actionResult }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`flex flex-col w-full ${isUser ? 'items-end' : 'items-start'} mb-3 group`}
    >
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full overflow-hidden mr-2 border border-white/20 shadow-sm flex-shrink-0">
                    <img src="https://i.pravatar.cc/300?u=sister_maya" alt="Sister" className="w-full h-full object-cover" />
                </div>
            )}
            <div className="flex flex-col max-w-[85%] md:max-w-[75%]">
                {actionResult && !isUser && (
                    <div className={`mb-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm w-fit ${actionResult.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : actionResult.status === 'REJECTED' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'}`}>
                        {actionResult.status === 'ACCEPTED' ? 'Accepted' : actionResult.status === 'REJECTED' ? 'Rejected' : 'Reaction'}: {String(actionResult.details)}
                    </div>
                )}
                <div className={`px-4 py-3 rounded-2xl text-sm shadow-lg backdrop-blur-md ${
                    isUser 
                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-sm border border-white/10' 
                    : 'bg-slate-800/80 text-slate-100 border border-white/5 rounded-bl-sm'
                }`}>
                    {message.content}
                </div>
            </div>
        </div>
        {!isUser && message.innerThought && (
            <div className="ml-10 mt-1 max-w-[80%] animate-fade-in-up">
                <div className="bg-black/40 border-l-2 border-purple-500/50 rounded-r-lg p-2 backdrop-blur-sm">
                    <p className="text-xs text-purple-300/80 italic font-medium flex gap-2">
                        <BrainCircuitIcon className="w-3 h-3 flex-shrink-0 mt-0.5"/> "{message.innerThought}"
                    </p>
                </div>
            </div>
        )}
    </motion.div>
);

const ProposalCard: React.FC<{ proposal: SisterProposal; onAccept: () => void; onReject: () => void }> = ({ proposal, onAccept, onReject }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="absolute bottom-24 left-4 right-4 z-50 mx-auto max-w-md bg-slate-900/90 backdrop-blur-xl border border-pink-500/50 rounded-2xl p-4 shadow-2xl shadow-pink-500/20"
    >
        <div className="flex items-start gap-3">
            <div className="p-2 bg-pink-500/20 rounded-full">
                <HeartIcon className="w-6 h-6 text-pink-400 animate-pulse"/>
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-white text-sm uppercase tracking-wide text-pink-300">Request: {proposal.type.replace('_', ' ')}</h3>
                <p className="text-slate-200 text-sm mt-1">
                    {proposal.type === 'LOCATION_CHANGE' && `She wants to go to: ${proposal.target}.`}
                    {proposal.type === 'GIFT_REQUEST' && `She wants you to buy her: ${proposal.target}.`}
                    {proposal.type === 'OUTFIT_CHANGE' && `She wants to change into: ${proposal.target}.`}
                    {proposal.type === 'INTIMACY_REQUEST' && `She wants: ${proposal.target}.`}
                </p>
                <p className="text-xs text-slate-400 italic mt-1">"{proposal.reason}"</p>
            </div>
        </div>
        <div className="flex gap-2 mt-4">
            <button onClick={onReject} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-bold transition-colors">Reject</button>
            <button onClick={onAccept} className="flex-1 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <CheckIcon className="w-4 h-4"/> Accept
            </button>
        </div>
    </motion.div>
);


const LeftEmotionsPanel: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    emotions: Partial<Record<string, number>>;
}> = ({ isOpen, onClose, emotions }) => {
     const generalEmotions = ['Happiness', 'Trust', 'Stress', 'Boredom', 'Curiosity', 'Gratitude', 'Jealousy', 'Guilt', 'Nervousness', 'Confidence'];
    const physicalEmotions = ['Lust', 'Horniness', 'Arousal', 'Sensitivity', 'Wetness', 'Shame', 'Submission', 'Dominance'];

     const renderEmotionBar = (name: string, value: number) => {
        let color = '#a78bfa';
        if (physicalEmotions.includes(name)) color = '#ef4444';
        else if (['Happiness', 'Gratitude', 'Confidence'].includes(name)) color = '#4ade80';
        else if (['Stress', 'Guilt', 'Nervousness', 'Shame', 'Jealousy'].includes(name)) color = '#fbbf24';
        else if (['Trust'].includes(name)) color = '#38bdf8';

        return (
             <div key={name} className="bg-white/5 p-2 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{name}</span>
                    <span className="text-[10px] font-mono text-white">{value}%</span>
                </div>
                <div className="h-1.5 bg-black/40 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className={`absolute top-0 left-0 h-full w-72 bg-slate-950/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 z-50 flex flex-col shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><BarChart2Icon className="w-5 h-5 text-pink-400"/> Feelings</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><XIcon className="w-5 h-5"/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
                <div>
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 border-b border-indigo-500/30 pb-1">Emotional State</h3>
                    <div className="space-y-2">
                            {generalEmotions.map(key => renderEmotionBar(key, emotions[key] || 0))}
                    </div>
                </div>
                <div>
                    <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-3 border-b border-rose-500/30 pb-1">Physical / 18+ State</h3>
                        <div className="space-y-2">
                            {physicalEmotions.map(key => renderEmotionBar(key, emotions[key] || 0))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const InventoryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    inventory: SisterItem[];
}> = ({ isOpen, onClose, inventory }) => {
    if (!isOpen) return null;
    return (
         <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-slate-900/95 border border-orange-500/30 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <h2 className="text-xl font-bold text-orange-300 flex items-center gap-2"><GiftIcon className="w-6 h-6"/> Her Inventory</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 min-h-[300px] max-h-[60vh] overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-900 to-black">
                    {inventory.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                            <GiftIcon className="w-20 h-20 mb-4 opacity-20"/>
                            <p className="text-lg font-medium">No gifts collected yet.</p>
                            <p className="text-sm mt-2">Buy her something nice!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                             {inventory.map((item, idx) => (
                                <div key={idx} className="bg-white/5 rounded-xl p-4 flex flex-col items-center text-center border border-white/10 hover:border-orange-500/50 hover:bg-white/10 transition-all group cursor-default relative">
                                    <span className="text-4xl mb-3 transform group-hover:scale-110 transition-transform filter drop-shadow-lg">{item.icon || '🎁'}</span>
                                    <span className="text-xs font-bold text-slate-300 group-hover:text-white">{item.name}</span>
                                    {item.mixedItems && item.mixedItems.length > 0 && (
                                         <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" title={`Mixed with ${item.mixedItems.length} items`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const UserInventoryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    inventory: SisterItem[];
    onGive: (item: SisterItem) => void;
    onMix: (additives: SisterItem[], target: SisterItem) => void;
}> = ({ isOpen, onClose, inventory, onGive, onMix }) => {
    const [mixMode, setMixMode] = useState(false);
    const [selectedAdditives, setSelectedAdditives] = useState<SisterItem[]>([]);
    const [selectedTarget, setSelectedTarget] = useState<SisterItem | null>(null);
    const [hoveredItem, setHoveredItem] = useState<SisterItem | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{x: number, y: number} | null>(null);

    // Categorize items
    const drugs = inventory.filter(i => ['Soft', '18+', 'Hardcore', 'Toy'].includes(i.category || ''));
    const foods = inventory.filter(i => ['Food', 'Drink'].includes(i.category || ''));

    // If mix mode is active, show drugs first (as additives), then food (as target)
    // Or show both lists?
    // Simpler: If target not selected, show foods to pick target. If target selected, show additives to pick multiple.
    // Re-logic:
    // 1. Pick Target (Food/Drink)
    // 2. Pick Additives (Drugs/Toys)
    
    const handleItemClick = (item: SisterItem) => {
        if (mixMode) {
            if (['Food', 'Drink'].includes(item.category || '')) {
                 // Toggle Target
                 if (selectedTarget?.id === item.id) setSelectedTarget(null);
                 else {
                     setSelectedTarget(item);
                     // Clear additives if target changes? No, keep them.
                 }
            } else if (['Soft', '18+', 'Hardcore', 'Toy'].includes(item.category || '')) {
                // Toggle Additive
                if (selectedAdditives.find(i => i.id === item.id)) {
                    setSelectedAdditives(prev => prev.filter(i => i.id !== item.id));
                } else {
                    setSelectedAdditives(prev => [...prev, item]);
                }
            }
        } else {
            // Giving/Using Item
            onGive(item);
            onClose();
        }
    };

    const handleConfirmMix = () => {
        if (selectedTarget && selectedAdditives.length > 0) {
            onMix(selectedAdditives, selectedTarget);
            setMixMode(false);
            setSelectedTarget(null);
            setSelectedAdditives([]);
        }
    };

    const handleMouseEnter = (e: React.MouseEvent, item: SisterItem) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPos({ x: rect.right + 10, y: rect.top });
        setHoveredItem(item);
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
        setTooltipPos(null);
    };
    
    const getActionButtonLabel = (item: SisterItem) => {
        if (mixMode) {
             if (selectedTarget?.id === item.id) return "Target Selected";
             if (selectedAdditives.find(i => i.id === item.id)) return "Added";
             return "Select";
        }
        if (item.category === 'Toy') return 'Use';
        return 'Give';
    };

    if (!isOpen) return null;
    
    // Categorized display for Mix Mode
    const renderMixList = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-bold text-orange-300 mb-2 uppercase tracking-wide">1. Select Target (Food/Drink)</h3>
                <div className="space-y-2">
                    {foods.map((item, idx) => (
                        <div 
                            key={idx} 
                            onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                            className={`rounded-xl p-3 flex items-center gap-4 border transition-all group relative cursor-pointer ${selectedTarget?.id === item.id ? 'bg-orange-600/20 border-orange-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        >
                            <div className="w-10 h-10 bg-black/40 rounded-lg flex items-center justify-center text-xl">{item.icon}</div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-200 text-sm">{item.name}</h4>
                            </div>
                            {selectedTarget?.id === item.id && <CheckIcon className="w-5 h-5 text-orange-500"/>}
                        </div>
                    ))}
                    {foods.length === 0 && <p className="text-xs text-slate-500">No food/drink items available.</p>}
                </div>
            </div>
            
            <div>
                <h3 className="text-sm font-bold text-purple-300 mb-2 uppercase tracking-wide">2. Select Additives</h3>
                <div className="space-y-2">
                    {drugs.map((item, idx) => {
                        const isSelected = selectedAdditives.some(i => i.id === item.id);
                        return (
                            <div 
                                key={idx} 
                                onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                                className={`rounded-xl p-3 flex items-center gap-4 border transition-all group relative cursor-pointer ${isSelected ? 'bg-purple-600/20 border-purple-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                            >
                                <div className="w-10 h-10 bg-black/40 rounded-lg flex items-center justify-center text-xl">{item.icon}</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-200 text-sm">{item.name}</h4>
                                </div>
                                {isSelected && <CheckIcon className="w-5 h-5 text-purple-500"/>}
                            </div>
                        );
                    })}
                     {drugs.length === 0 && <p className="text-xs text-slate-500">No additives available.</p>}
                </div>
            </div>
            
            <button 
                onClick={handleConfirmMix}
                disabled={!selectedTarget || selectedAdditives.length === 0}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-orange-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all"
            >
                Mix Selected Items
            </button>
        </div>
    );

    return (
         <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            {hoveredItem && <ItemDetailTooltip item={hoveredItem} position={tooltipPos} />}
            
            <div className="bg-slate-900/95 border border-emerald-500/30 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col transform transition-all max-h-[85vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-emerald-300 flex items-center gap-2"><DatabaseIcon className="w-6 h-6"/> My Bag</h2>
                        <button 
                            onClick={() => { setMixMode(!mixMode); setSelectedTarget(null); setSelectedAdditives([]); }}
                            className={`px-3 py-1 text-xs font-bold uppercase rounded-full border transition-colors ${mixMode ? 'bg-purple-600 border-purple-400 text-white animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white'}`}
                        >
                            {mixMode ? 'Mix Mode ON' : 'Mix Mode OFF'}
                        </button>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><XIcon className="w-6 h-6"/></button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-900 to-black flex-1">
                    {mixMode ? renderMixList() : (
                        inventory.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60 py-10">
                                <DatabaseIcon className="w-20 h-20 mb-4 opacity-20"/>
                                <p className="text-lg font-medium">Your bag is empty.</p>
                                <p className="text-sm mt-2">Buy something from the shop!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                 {inventory.map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className="bg-white/5 rounded-xl p-3 flex items-center gap-4 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all group relative cursor-help"
                                        onMouseEnter={(e) => handleMouseEnter(e, item)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <div className="w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center text-2xl">{item.icon || '🎒'}</div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-200">{item.name}</h4>
                                            <p className="text-xs text-slate-500">{item.category || 'Item'}</p>
                                        </div>
                                        {item.mixedItems && item.mixedItems.length > 0 && (
                                            <div className="absolute top-2 right-2 group-hover:opacity-100 opacity-80 transition-opacity flex items-center gap-1">
                                                <span className="text-[10px] text-purple-300 font-bold bg-purple-900/50 px-1.5 py-0.5 rounded">Spiked</span>
                                                <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_5px_#a855f7]"></div>
                                            </div>
                                        )}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                                            className={`px-3 py-1.5 text-white text-xs font-bold rounded-lg transition-colors shadow-lg bg-emerald-600 hover:bg-emerald-500`}
                                        >
                                            {getActionButtonLabel(item)}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

const LocationPicker: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSelect: (loc: string, cost: number) => void; 
    currentLocation: string;
    currentState: ExtendedSisterState;
}> = ({ isOpen, onClose, onSelect, currentLocation, currentState }) => {
    const categories = Array.from(new Set(Object.values(LOCATIONS).map(l => l.category)));
    const [activeCat, setActiveCat] = useState(categories[0]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-slate-900/90 border border-white/10 rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><GlobeIcon className="w-5 h-5"/> Travel</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><XIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="flex border-b border-white/10 overflow-x-auto">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCat(cat)}
                            className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeCat === cat ? 'text-white bg-white/10 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gradient-to-b from-slate-900 to-black">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(LOCATIONS).filter(([_, data]) => data.category === activeCat).map(([key, data]) => {
                            const isLocked = data.isLocked ? data.isLocked(currentState) : false;
                            const isActive = currentLocation === key;
                            
                            return (
                                <button
                                    key={key}
                                    onClick={() => !isLocked && onSelect(key, data.cost)}
                                    disabled={isLocked}
                                    className={`group relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-300 ${isActive ? 'border-indigo-500 ring-4 ring-indigo-500/20 scale-105' : 'border-white/10 hover:border-white/30 hover:-translate-y-1'}`}
                                >
                                    <img src={data.bg} alt={data.name} className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isLocked ? 'grayscale blur-sm' : ''}`}/>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"/>
                                    
                                    <div className="absolute top-2 right-2 z-10 flex gap-1">
                                        {data.cost > 0 && (
                                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-emerald-400/50">${data.cost}</span>
                                        )}
                                        {isActive && (
                                            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">CURRENT</span>
                                        )}
                                    </div>

                                    {isLocked ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
                                            <LockIcon className="w-8 h-8 text-red-400 mb-2"/>
                                            <span className="text-xs font-bold text-red-200 bg-red-900/80 px-2 py-1 rounded">{data.lockMessage || "Locked"}</span>
                                        </div>
                                    ) : (
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <div className="text-2xl mb-1 drop-shadow-md">{data.icon}</div>
                                            <div className="font-bold text-white text-sm drop-shadow-md">{data.name}</div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const OutfitPicker: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSelect: (outfit: SisterOutfit) => void;
    currentOutfit: string;
    currentState: ExtendedSisterState;
}> = ({ isOpen, onClose, onSelect, currentOutfit, currentState }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-slate-900/95 border border-pink-500/30 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <h2 className="text-xl font-bold text-pink-300 flex items-center gap-2"><StarIcon className="w-6 h-6"/> Wardrobe</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-900 to-black">
                    <div className="grid grid-cols-3 gap-4">
                        {OUTFITS.map((outfit) => {
                            const isCurrent = currentOutfit === outfit.name;
                            
                            let isLocked = false;
                            let lockReason = "";

                            // Gift Unlock Logic
                            if (outfit.giftName) {
                                isLocked = !(currentState.unlockedOutfits || []).includes(outfit.name);
                                lockReason = "Needs Gift";
                            } 
                            // Stat Unlock Logic
                            else {
                                const lust = currentState.emotions['Lust'] || 0;
                                const love = currentState.secretLove;
                                if (outfit.reqLust && lust < outfit.reqLust) {
                                    isLocked = true;
                                    lockReason = `Lust ${outfit.reqLust}+`;
                                }
                                if (outfit.reqLove && love < outfit.reqLove) {
                                    isLocked = true;
                                    lockReason = `Love ${outfit.reqLove}+`;
                                }
                            }
                            
                            return (
                                <button
                                    key={outfit.name}
                                    onClick={() => !isLocked && onSelect(outfit.name)}
                                    disabled={isLocked}
                                    className={`relative bg-white/5 rounded-xl p-4 flex flex-col items-center text-center border transition-all group ${isCurrent ? 'border-pink-500 bg-pink-500/10' : 'border-white/10 hover:border-pink-400/50 hover:bg-white/10'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="text-4xl mb-2 filter drop-shadow-lg">{outfit.icon}</span>
                                    <span className="text-xs font-bold text-slate-300">{outfit.name}</span>
                                    {isLocked && (
                                        <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-xl p-2">
                                            <LockIcon className="w-5 h-5 text-red-400 mb-1"/>
                                            <span className="text-[9px] text-red-200 leading-tight font-bold">{lockReason}</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const InteractionMenu: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAction: (action: string) => void;
    onGiveMoney: () => void;
    currentState: ExtendedSisterState;
}> = ({ isOpen, onClose, onAction, onGiveMoney, currentState }) => {
    const [activeCat, setActiveCat] = useState(currentState.isAsleep ? 'Sleep' : 'Context');
    const [hoveredAction, setHoveredAction] = useState<any | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{x: number, y: number} | null>(null);
    
    // NEW STATE FOR 2-STAGE INTERACTION & DETAILS
    const [selectedActionForDetail, setSelectedActionForDetail] = useState<string | null>(null);
    const [intensity, setIntensity] = useState<'Gentle' | 'Sensual' | 'Fast' | 'Rough' | 'Hardcore'>('Sensual');
    const [method, setMethod] = useState<string | null>(null);

    useEffect(() => {
        if (currentState.isAsleep) {
            setActiveCat('Sleep');
        } else if (activeCat === 'Sleep') {
            setActiveCat('Context');
        }
    }, [currentState.isAsleep]);

    if (!isOpen) return null;

    const categories = ['Context', 'Location', 'Friendly', 'Care', 'Tease', 'Flirty', 'Risky', '18+', 'Toys', 'Sleep'];

    const INTENSITY_LEVELS = [
        { name: 'Gentle', color: 'bg-sky-500' },
        { name: 'Sensual', color: 'bg-pink-500' },
        { name: 'Fast', color: 'bg-orange-500' },
        { name: 'Rough', color: 'bg-red-600' },
        { name: 'Hardcore', color: 'bg-purple-700' }
    ];

    // TOY LOGIC FIX: Correctly map toys to interactions
    const toyItems = currentState.inventory
        .filter(item => item.category === 'Toy')
        .map(item => {
            // Estimate requirements based on price
            const price = item.price || 0;
            const reqLust = Math.min(90, Math.floor(price / 2)); 
            const reqLove = Math.min(80, Math.floor(price / 3));
            
            return {
                label: `Use ${item.name}`,
                icon: item.icon,
                category: 'Toys',
                description: item.description,
                risk: Math.floor(reqLust / 2),
                minLove: reqLove,
                condition: (s: ExtendedSisterState) => (s.emotions['Lust'] || 0) >= reqLust
            };
        });

    const INTERACTIONS = [
        // Global
        { label: 'Chat', icon: '🗣️', category: 'Friendly', description: "Start a general conversation." },
        { label: 'Joke', icon: '😂', category: 'Friendly', description: "Tell a funny joke to lighten the mood." },
        { label: 'Headpat', icon: '👋', category: 'Friendly', description: "Give her a gentle pat on the head." },
        { label: 'Hug', icon: '🤗', category: 'Friendly', description: "Give her a warm hug." },
        { label: 'Gift', icon: '🎁', category: 'Friendly', description: "Open the gift menu to give an item." },
        
        { label: 'Comfort', icon: '🧸', category: 'Care', description: "Offer words of comfort and support." },
        { label: 'Advice', icon: '🤔', category: 'Care', description: "Give her some brotherly advice." },
        { label: 'Deep Talk', icon: '💬', category: 'Care', minLove: 20, description: "Have a serious conversation about feelings." },
        
        { label: 'Poke', icon: '👉', category: 'Tease', description: "Playfully poke her side." },
        { label: 'Tease', icon: '😜', category: 'Tease', description: "Make fun of her playfully." },
        
        { label: 'Wink', icon: '😉', category: 'Flirty', risk: 20, description: "Give her a cheeky wink." },
        { label: 'Stare', icon: '👀', category: 'Flirty', risk: 30, description: "Stare into her eyes intensely." },
        { label: 'Compliment', icon: '✨', category: 'Flirty', risk: 10, description: "Tell her she looks beautiful." },
        { label: 'Touch Hand', icon: '🤝', category: 'Flirty', risk: 40, minLove: 30, description: "Gently touch her hand." },
        { label: 'Flirt', icon: '😏', category: 'Flirty', risk: 50, minLove: 35, description: "Make a flirtatious comment." },
        
        { label: 'Cuddle', icon: '🛋️', category: 'Risky', risk: 50, minLove: 45, description: "Snuggle up close to her." },
        { label: 'Massage', icon: '💆', category: 'Risky', risk: 60, minLove: 50, description: "Offer to give her a massage." },
        { label: 'Kiss', icon: '💋', category: 'Risky', risk: 80, minLove: 65, description: "Attempt to kiss her lips." },
        { label: 'Whisper', icon: '👂', category: 'Risky', risk: 55, minLove: 40, description: "Whisper something secret in her ear." },
        { label: 'Sleep Together', icon: '💤', category: 'Risky', risk: 70, minLove: 60, description: "Ask to sleep in the same bed." },
        { label: 'Confess', icon: '💌', category: 'Risky', risk: 90, minLove: 70, description: "Confess your romantic feelings." },
        { label: 'Choking', icon: '🤚', category: 'Risky', risk: 90, minLove: 75, description: "Lightly choke her during intimacy." },
        { label: 'Blindfold', icon: '🙈', category: 'Risky', risk: 80, minLove: 65, description: "Cover her eyes." },
        
        // 18+ Actions - Updated with Specifics
        { label: 'Touch', icon: '🖐️', category: '18+', risk: 90, minLove: 75, description: "Touch her body intimately." },
        { label: 'Undress', icon: '👙', category: '18+', risk: 95, minLove: 85, description: "Help her take off her clothes." },
        { label: 'Titjob', icon: '🍒', category: '18+', risk: 95, minLove: 88, description: "Use her breasts for pleasure." }, 
        { label: 'Pussy Play', icon: '✌️', category: '18+', risk: 98, minLove: 88, description: "Finger her pussy." }, 
        { label: 'Oral', icon: '👅', category: '18+', risk: 99, minLove: 90, description: "Perform oral sex (Cunnilingus)." },
        { label: 'Ass Worship', icon: '🍑', category: '18+', risk: 95, minLove: 85, description: "Rim, spank, or massage her ass." }, 
        { label: 'Anal Sex', icon: '🍩', category: '18+', risk: 100, minLove: 95, description: "Anal penetration." }, 
        { label: 'Creampie', icon: '💦', category: '18+', risk: 100, minLove: 98, description: "Finish inside." }, 
        { label: 'Sex', icon: '🍆', category: '18+', risk: 100, minLove: 95, description: "Initiate sexual intercourse." },
        { label: 'Deep Throat', icon: '😮', category: '18+', risk: 99, minLove: 92, description: "Forceful oral sex." },
        { label: 'Face Sitting', icon: '🪑', category: '18+', risk: 98, minLove: 90, description: "Have her sit on your face." },
        { label: 'Spanking', icon: '👋', category: '18+', risk: 90, minLove: 85, description: "Spank her bottom." },
        { label: 'Tie Up', icon: '⛓️', category: '18+', risk: 95, minLove: 90, description: "Restrain her." },
        { label: 'Oil Massage', icon: '🧴', category: '18+', risk: 85, minLove: 80, description: "Sensual oil massage." },
        { label: 'Foot Worship', icon: '🦶', category: '18+', risk: 90, minLove: 75, description: "Worship her feet." },
        { label: 'Beg', icon: '🥺', category: '18+', risk: 90, minLove: 85, description: "Beg her for pleasure." },
        
        // Location Specific - Home
        { label: 'Watch TV', icon: '📺', category: 'Location', locations: ['Living Room', 'Bedroom'], description: "Watch a show together." },
        { label: 'Nap', icon: '😴', category: 'Location', locations: ['Bedroom', 'Living Room'], description: "Take a nap nearby." },
        { label: 'Cook', icon: '🍳', category: 'Location', locations: ['Kitchen'], description: "Prepare a meal." },
        { label: 'Eat', icon: '🍽️', category: 'Location', locations: ['Kitchen', 'Dining Room'], description: "Have a meal together." },
        { label: 'Wash Hands', icon: '🧼', category: 'Location', locations: ['Bathroom'], description: "Wash your hands." },
        { label: 'Brush Teeth', icon: '🪥', category: 'Location', locations: ['Bathroom'], description: "Brush teeth together." },
        { label: 'Shower', icon: '🚿', category: 'Location', locations: ['Shower', 'Bathroom'], description: "Take a shower." },
        
        // Location Specific - City
        { label: 'Study', icon: '📚', category: 'Location', locations: ['School', 'Library', 'University Campus'], description: "Focus on studying." },
        { label: 'Workout', icon: '💪', category: 'Location', locations: ['Gym'], description: "Exercise together." },
        { label: 'Shop', icon: '🛍️', category: 'Location', locations: ['Mall', 'Antique Shop'], description: "Go shopping." },
        { label: 'Watch Movie', icon: '🍿', category: 'Location', locations: ['Cinema'], description: "Watch the latest movie." },
        { label: 'Walk', icon: '🚶', category: 'Location', locations: ['Park', 'Street', 'University Campus', 'Old Shrine'], description: "Take a stroll." },
        { label: 'Swim', icon: '🏊', category: 'Location', locations: ['Pool', 'Beach', 'Desert Oasis'], description: "Go for a swim." },
        { label: 'Relax', icon: '♨️', category: 'Location', locations: ['Onsen', 'Rainforest Lodge'], description: "Relax in the water." },
        
        // Extended Location Actions
        { label: 'Walk to Class', icon: '🚶‍♂️', category: 'Location', locations: ['School', 'University Campus'], description: "Walk her to her class." },
        { label: 'Picnic', icon: '🧺', category: 'Location', locations: ['Park', 'Garden', 'Botanical Garden'], description: "Have a picnic." },

        // Context Sensitive (Dynamic)
        { label: 'Hold Hands', icon: '🤝', category: 'Context', condition: (s: ExtendedSisterState) => s.affection > 40 || s.secretLove > 20, description: "Hold her hand." },
        { label: 'Compliment Outfit', icon: '👗', category: 'Context', description: "Tell her you like her clothes." },
        { label: 'Ask About Day', icon: '❓', category: 'Context', description: "Ask how her day was." },
        { label: 'Tease Her', icon: '😜', category: 'Context', condition: (s: ExtendedSisterState) => s.affection > 30, description: "Tease her playfully." },
        { label: 'Stare Intensely', icon: '👁️', category: 'Context', condition: (s: ExtendedSisterState) => s.secretLove > 40, description: "Lock eyes with her." },

        // SLEEP ACTIONS
        { label: 'Observe', icon: '👀', category: 'Sleep', description: "Watch her sleep peacefully." },
        { label: 'Lift Eyelids', icon: '👁️', category: 'Sleep', description: "Check reactivity. (Low Impact)" },
        { label: 'Check Pulse', icon: '❤️', category: 'Sleep', description: "Feel her heartbeat." },
        { label: 'Check Breathing', icon: '👃', category: 'Sleep', description: "Listen to her breath." },
        { label: 'Whisper', icon: '🤫', category: 'Sleep', description: "Whisper into her ear." },
        { label: 'Stroke Hair', icon: '💆‍♀️', category: 'Sleep', description: "Gently pet her hair." },
        { label: 'Hold Hand', icon: '🤝', category: 'Sleep', description: "Hold her hand while she sleeps." },
        { label: 'Kiss Cheek', icon: '💋', category: 'Sleep', description: "Give a gentle goodnight kiss." },
        { label: 'Remove Covers', icon: '🛌', category: 'Sleep', description: "Pull back the blanket to see her." },
        { label: 'Touch Body', icon: '🖐️', category: 'Sleep', description: "Gently touch her body.", risk: 10 },
        { label: 'Grope', icon: '🍒', category: 'Sleep', description: "Grope her breasts/ass.", risk: 50 },
        { label: 'Undress (Sleep)', icon: '👙', category: 'Sleep', description: "Try to remove her clothes.", risk: 80 },
        { label: 'Use Toy (Sleep)', icon: '🪄', category: 'Sleep', description: "Use a toy on her while asleep.", risk: 90 },
        { label: 'Sleep Next To', icon: '💤', category: 'Sleep', description: "Lie down beside her." },

        // NEW: 18+ Location Specific Actions
        { label: 'Morning Wood', icon: '⛺', category: '18+', locations: ['Bedroom', 'Bedroom (Night)'], risk: 80, minLove: 75, description: "Show her your morning arousal." },

        // Merge Toys
        ...toyItems
    ];

    // Filter interactions based on category AND location
    const currentInteractions = INTERACTIONS.filter(i => {
        // Category match
        if (i.category !== activeCat) return false;
        
        // Context Category Logic
        if (activeCat === 'Context') {
             if ((i as any).condition && !(i as any).condition(currentState)) return false;
             if (i.locations && !i.locations.includes(currentState.currentLocation)) return false;
             return true;
        }
        
        // Toy Logic
        if (activeCat === 'Toys') {
            return true;
        }
        
        // Sleep Category Logic
        if (activeCat === 'Sleep') {
            return true;
        }

        // Location match logic for other categories
        if (i.locations) {
            return i.locations.includes(currentState.currentLocation);
        } else {
            return true;
        }
    });


    const handleMouseEnter = (e: React.MouseEvent, action: any) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPos({ x: rect.right + 10, y: rect.top });
        setHoveredAction(action);
    };

    const handleMouseLeave = () => {
        setHoveredAction(null);
        setTooltipPos(null);
    };

    const handleActionClick = (action: any) => {
        if (action.category === 'Sleep' && !currentState.isAsleep) return;

        if (action.category === '18+' || action.category === 'Risky' || action.category === 'Toys' || action.category === 'Sleep') {
            setSelectedActionForDetail(action.label);
            // Set default method if variants exist
            const actionName = action.label.replace(/^Use\s/, ''); // Strip "Use " prefix for toy variants lookup if needed
            const variants = ACTION_VARIANTS[action.label] || (action.category === 'Toys' ? GENERIC_TOY_VARIANTS : null);
            if (variants && variants.length > 0) {
                setMethod(variants[0]);
            } else {
                setMethod(null);
            }
        } else {
            if(!action.minLove || currentState.secretLove >= action.minLove) {
                onAction(action.label);
                onClose();
            }
        }
    };

    const handleConfirmDetailAction = () => {
        if (selectedActionForDetail) {
            let actionString = selectedActionForDetail;
            let details = [];
            if (method) details.push(`Method: ${method}`);
            details.push(`Intensity: ${intensity}`);
            
            if (details.length > 0) {
                actionString += ` [${details.join(', ')}]`;
            }
            
            onAction(actionString);
            onClose();
            setSelectedActionForDetail(null);
            setMethod(null);
        }
    };
    
    // Render Detail Selector as an overlay inside the menu if active
    const renderDetailSelector = () => {
        // Clean action name for lookup (e.g. "Use Magic Wand" -> check generic toys)
        const isToy = selectedActionForDetail?.startsWith("Use ");
        const lookupName = isToy ? "GenericToy" : selectedActionForDetail || "";
        
        const variants = isToy ? GENERIC_TOY_VARIANTS : (ACTION_VARIANTS[lookupName] || null);

        return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="absolute inset-0 z-[60] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 rounded-3xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing underlying menu
        >
            <h3 className="text-xl font-bold text-white mb-1">Detail Control</h3>
            <p className="text-purple-300 font-semibold mb-4 text-lg">{selectedActionForDetail}</p>
            
            <div className="w-full max-w-md space-y-6 overflow-y-auto custom-scrollbar max-h-[50vh] pr-2">
                {/* Method Selection */}
                {variants && (
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Technique / Mode</label>
                        <div className="grid grid-cols-2 gap-2">
                            {variants.map((variant) => (
                                <button
                                    key={variant}
                                    onClick={() => setMethod(variant)}
                                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${method === variant ? 'bg-purple-600 border-purple-400 text-white shadow-md' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                                >
                                    {variant}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Intensity Selection */}
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Intensity / Speed</label>
                    <div className="flex flex-col gap-2">
                        {INTENSITY_LEVELS.map((level) => (
                            <button
                                key={level.name}
                                onClick={() => setIntensity(level.name as any)}
                                className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between px-4 border ${intensity === level.name ? `${level.color} border-transparent text-white shadow-lg scale-105` : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                            >
                                <span>{level.name}</span>
                                {intensity === level.name && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="flex gap-4 mt-6 w-full max-w-md pt-4 border-t border-white/10">
                <button onClick={() => setSelectedActionForDetail(null)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors">Back</button>
                <button onClick={handleConfirmDetailAction} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:brightness-110 transition-all active:scale-95">Confirm</button>
            </div>
        </motion.div>
        );
    };


    return (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-6 px-4 pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-full max-w-4xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto relative"
                        style={{ maxHeight: '70vh' }}
                    >
                        {/* Detail Overlay */}
                        {selectedActionForDetail && renderDetailSelector()}

                        {hoveredAction && <ItemDetailTooltip item={hoveredAction} position={tooltipPos} />}
                        

                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-full">
                                    <ZapIcon className="w-5 h-5 text-indigo-400"/>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Actions</h3>
                                    <p className="text-xs text-slate-400 font-mono">Current Location: {currentState.currentLocation} {currentState.isAsleep ? "(ASLEEP)" : ""}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><XIcon className="w-6 h-6"/></button>
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex border-b border-white/10 bg-black/10 overflow-x-auto custom-scrollbar flex-shrink-0">
                            {categories.map(cat => {
                                let icon = null;
                                switch(cat) {
                                    case 'Context': icon = <BrainCircuitIcon className="w-3 h-3"/>; break;
                                    case 'Location': icon = <GlobeIcon className="w-3 h-3"/>; break;
                                    case 'Friendly': icon = <UsersIcon className="w-3 h-3"/>; break;
                                    case 'Care': icon = <HeartIcon className="w-3 h-3"/>; break;
                                    case 'Tease': icon = <ZapIcon className="w-3 h-3"/>; break;
                                    case 'Flirty': icon = <StarIcon className="w-3 h-3"/>; break;
                                    case 'Risky': icon = <AlertTriangleIcon className="w-3 h-3"/>; break;
                                    case '18+': icon = <LockIcon className="w-3 h-3"/>; break;
                                    case 'Toys': icon = <GiftIcon className="w-3 h-3"/>; break;
                                    case 'Sleep': icon = <MoonIcon className="w-3 h-3"/>; break;
                                }
                                
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCat(cat)}
                                        className={`px-5 py-3 text-xs font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${activeCat === cat ? 'text-indigo-400 bg-white/5 border-indigo-500' : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'}`}
                                    >
                                        {icon} {cat}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Grid */}
                        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-900/50 to-black/50 flex-1">
                            {currentInteractions.length === 0 ? (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 opacity-60">
                                    <SearchIcon className="w-12 h-12 mb-2 opacity-50"/>
                                    <p className="text-sm font-medium">No actions available in this category here.</p>
                                    {activeCat === 'Toys' && <p className="text-xs mt-1">Buy toys from the shop to see them here.</p>}
                                </div>
                            ) : (
                                currentInteractions.map((action, idx) => {
                                    const isSleepCat = activeCat === 'Sleep';
                                    const isAwakeLock = isSleepCat && !currentState.isAsleep;
                                    
                                    // Logic for toys and other conditional actions
                                    let isLocked = false;
                                    let lockReason = "";

                                    if (isAwakeLock) {
                                        isLocked = true;
                                        lockReason = "Target Awake";
                                    } else if ((action as any).condition) {
                                        if (!(action as any).condition(currentState)) {
                                            isLocked = true;
                                            // Generic reason for condition fail if not specific
                                            lockReason = "Req. Unmet"; 
                                            // Try to be more specific for toys
                                            if (action.category === 'Toys') lockReason = `Lust Low`;
                                        }
                                    } else if (action.minLove && currentState.secretLove < action.minLove) {
                                        isLocked = true;
                                        lockReason = `Love ${action.minLove}+`;
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleActionClick(action)}
                                            onMouseEnter={(e) => handleMouseEnter(e, action)}
                                            onMouseLeave={handleMouseLeave}
                                            disabled={isLocked}
                                            className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 active:scale-95 
                                                ${isLocked 
                                                    ? 'bg-white/5 border-white/5 opacity-40 cursor-not-allowed grayscale' 
                                                    : 'bg-white/5 border-white/10 hover:bg-indigo-600/20 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1'
                                                }`}
                                        >
                                            <span className="text-3xl mb-2 filter drop-shadow-md transition-transform group-hover:scale-110">{action.icon}</span>
                                            <span className="text-xs font-bold text-slate-300 text-center group-hover:text-white line-clamp-1">{action.label}</span>
                                            
                                            <div className="flex gap-1 mt-2">
                                                {!isLocked && action.risk && <span className="text-[9px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded border border-orange-500/30">Risk {action.risk}%</span>}
                                                {isLocked && <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30">{lockReason}</span>}
                                            </div>
                                            
                                            {isLocked && (
                                                <div className="absolute top-2 right-2 text-red-400 opacity-80">
                                                    <LockIcon className="w-3 h-3"/>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const GeneralShopModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onBuy: (itemName: string, price: number, itemData: any, quantity: number) => void;
    userMoney: number;
}> = ({ isOpen, onClose, onBuy, userMoney }) => {
    const [activeTab, setActiveTab] = useState<'Drugs' | 'Food' | 'Toys'>('Drugs');
    const [hoveredItem, setHoveredItem] = useState<any | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{x: number, y: number} | null>(null);
    
    // Quantity State: Map item name to quantity
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    const handleMouseEnter = (e: React.MouseEvent, item: any) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPos({ x: rect.right + 10, y: rect.top });
        setHoveredItem(item);
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
        setTooltipPos(null);
    };
    
    const updateQuantity = (itemName: string, delta: number) => {
        setQuantities(prev => {
            const current = prev[itemName] || 1;
            const next = Math.max(1, Math.min(100, current + delta));
            return { ...prev, [itemName]: next };
        });
    };

    if (!isOpen) return null;

    const itemsToDisplay = activeTab === 'Drugs' ? DRUG_ITEMS : activeTab === 'Food' ? FOOD_ITEMS : TOY_ITEMS;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
             {hoveredItem && <ItemDetailTooltip item={hoveredItem} position={tooltipPos} />}
             <div className="bg-slate-900/95 border border-purple-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <div>
                        <h2 className="text-xl font-bold text-purple-300 flex items-center gap-2">🛒 General Store</h2>
                        <p className="text-xs text-slate-400 mt-1">Funds: <span className="text-emerald-400 font-mono">${userMoney.toLocaleString()}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><XIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="flex border-b border-white/10 overflow-x-auto bg-black/10">
                     <button onClick={() => setActiveTab('Drugs')} className={`px-6 py-3 text-xs font-bold uppercase transition-colors flex-1 ${activeTab === 'Drugs' ? 'text-purple-300 bg-white/5 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>Pharmacy</button>
                    <button onClick={() => setActiveTab('Food')} className={`px-6 py-3 text-xs font-bold uppercase transition-colors flex-1 ${activeTab === 'Food' ? 'text-orange-300 bg-white/5 border-b-2 border-orange-500' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>Grocery</button>
                     <button onClick={() => setActiveTab('Toys')} className={`px-6 py-3 text-xs font-bold uppercase transition-colors flex-1 ${activeTab === 'Toys' ? 'text-pink-300 bg-white/5 border-b-2 border-pink-500' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>Adult Store</button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-900 to-black space-y-3">
                    {itemsToDisplay.map((item, idx) => {
                        const qty = quantities[item.name] || 1;
                        const totalCost = item.price * qty;
                        const canAfford = userMoney >= totalCost;
                        
                        return (
                            <div 
                                key={idx} 
                                className="group relative bg-white/5 rounded-xl p-3 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all flex items-center gap-4 cursor-help"
                                onMouseEnter={(e) => handleMouseEnter(e, item)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <div className="text-3xl filter drop-shadow-lg bg-black/30 p-2 rounded-lg">{item.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-200">{item.name}</h4>
                                    <p className="text-xs text-slate-400 truncate">{item.description}</p>
                                    <div className="flex gap-2 mt-1">
                                         <span className={`text-xs font-mono font-bold ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>${totalCost}</span>
                                         {qty > 1 && <span className="text-[10px] text-slate-500">(${item.price} ea)</span>}
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center bg-black/40 rounded-lg border border-white/5">
                                        <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.name, -1); }} className="px-2 py-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-l-lg">-</button>
                                        <span className="px-2 text-xs font-mono font-bold w-6 text-center">{qty}</span>
                                        <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.name, 1); }} className="px-2 py-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-r-lg">+</button>
                                    </div>
                                    <button 
                                        onClick={() => { if(canAfford) { onBuy(item.name, totalCost, item, qty); } }}
                                        disabled={!canAfford}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors w-full ${canAfford ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                                    >
                                        Buy
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
             </div>
         </div>
    );
}

const GiftMenu: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onGift: (itemName: string, price: number) => void;
    userMoney: number;
}> = ({ isOpen, onClose, onGift, userMoney }) => {
    const categories = ['All', 'Normal', 'Romantic', '18+', 'Outfit', 'Toy'];
    const [activeCat, setActiveCat] = useState('All');
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [customName, setCustomName] = useState('');
    const [customPrice, setCustomPrice] = useState('');
    const [hoveredItem, setHoveredItem] = useState<any | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{x: number, y: number} | null>(null);

    const handleMouseEnter = (e: React.MouseEvent, item: any) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPos({ x: rect.right + 10, y: rect.top });
        setHoveredItem(item);
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
        setTooltipPos(null);
    };

    if (!isOpen) return null;

    const filteredGifts = GIFTS.filter(g => activeCat === 'All' || g.category === activeCat);
    
    const handleCustomGift = () => {
        if (!customName.trim() || !customPrice) return;
        const price = parseInt(customPrice);
        if (isNaN(price) || price < 0) return;
        if (userMoney < price) {
            alert("Not enough money!");
            return;
        }
        onGift(customName.trim(), price);
        onClose();
    };

    return (
         <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
             {hoveredItem && <ItemDetailTooltip item={hoveredItem} position={tooltipPos} />}
             <div className="bg-slate-900/95 border border-pink-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <div>
                        <h2 className="text-xl font-bold text-pink-300 flex items-center gap-2"><GiftIcon className="w-6 h-6"/> Gift Shop</h2>
                        <p className="text-xs text-slate-400 mt-1">Balance: <span className="text-emerald-400 font-mono">${userMoney.toLocaleString()}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><XIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="flex border-b border-white/10 overflow-x-auto bg-black/10">
                     <button onClick={() => setIsCustomMode(!isCustomMode)} className={`px-4 py-2 text-xs font-bold uppercase transition-colors flex-shrink-0 ${isCustomMode ? 'text-pink-300 bg-white/5 border-b-2 border-pink-500' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
                        Custom
                    </button>
                    {!isCustomMode && categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCat(cat)}
                            className={`px-4 py-2 text-xs font-bold uppercase transition-colors flex-shrink-0 ${activeCat === cat ? 'text-pink-300 bg-white/5 border-b-2 border-pink-500' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-900 to-black">
                    {isCustomMode ? (
                        <div className="flex flex-col gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                             <h3 className="font-bold text-pink-200">Create Custom Gift</h3>
                             <div>
                                <label className="text-xs text-slate-400 block mb-1">Item Name</label>
                                <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. Rare Gem" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white focus:ring-1 focus:ring-pink-500 focus:outline-none" />
                             </div>
                             <div>
                                <label className="text-xs text-slate-400 block mb-1">Price ($)</label>
                                <input type="number" value={customPrice} onChange={e => setCustomPrice(e.target.value)} placeholder="0" min="0" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white focus:ring-1 focus:ring-pink-500 focus:outline-none" />
                             </div>
                             <button onClick={handleCustomGift} className="w-full py-2 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-500 transition-colors mt-2">Buy & Send Gift</button>
                        </div>
                    ) : (
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {filteredGifts.map((gift, idx) => {
                                const canAfford = userMoney >= gift.price;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => { if(canAfford) { onGift(gift.name, gift.price); onClose(); } }}
                                        onMouseEnter={(e) => handleMouseEnter(e, gift)}
                                        onMouseLeave={handleMouseLeave}
                                        disabled={!canAfford}
                                        className={`bg-white/5 rounded-xl p-4 flex flex-col items-center text-center border transition-all group ${canAfford ? 'border-white/10 hover:border-pink-500/50 hover:bg-white/10 cursor-pointer' : 'border-red-500/20 opacity-50 cursor-not-allowed'}`}
                                    >
                                        <span className="text-4xl mb-3 filter drop-shadow-lg">{gift.icon}</span>
                                        <span className="font-bold text-sm text-slate-200 group-hover:text-white line-clamp-1">{gift.name}</span>
                                        <span className={`text-xs font-mono mt-1 ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>${gift.price}</span>
                                    </button>
                                );
                            })}
                         </div>
                    )}
                </div>
             </div>
         </div>
    );
}

const MoneyTransferModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onTransfer: (amount: number) => void;
    userMoney: number;
}> = ({ isOpen, onClose, onTransfer, userMoney }) => {
    const AMOUNTS = [50, 100, 500, 1000, 5000];
    const [customAmount, setCustomAmount] = useState('');
    
    if (!isOpen) return null;
    
    const handleCustomTransfer = () => {
        const val = parseInt(customAmount);
        if (val > 0 && val <= userMoney) {
            onTransfer(val);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-slate-900/95 border border-emerald-500/30 rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center justify-center gap-2"><DollarSignIcon className="w-6 h-6"/> Give Cash</h2>
                <p className="text-sm text-slate-400 mb-6">How much do you want to give her?</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {AMOUNTS.map(amount => (
                        <button
                            key={amount}
                            onClick={() => { if(userMoney >= amount) { onTransfer(amount); onClose(); } }}
                            disabled={userMoney < amount}
                            className={`py-3 rounded-xl font-bold border transition-all ${userMoney >= amount ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500 hover:text-white hover:scale-105' : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'}`}
                        >
                            ${amount}
                        </button>
                    ))}
                </div>
                <div className="mb-6">
                     <label className="text-xs text-slate-500 font-bold uppercase block mb-2">Custom Amount</label>
                     <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={customAmount} 
                            onChange={e => setCustomAmount(e.target.value)} 
                            placeholder="0" 
                            className="flex-1 bg-black/30 border border-white/10 rounded-lg p-2 text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                        <button 
                            onClick={handleCustomTransfer}
                            disabled={!customAmount || parseInt(customAmount) > userMoney || parseInt(customAmount) <= 0}
                            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                     </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">Cancel</button>
            </div>
        </div>
    );
};

const SisterPage: React.FC<SisterPageProps> = ({ onBack }) => {
    const [profile, setProfile] = useState<SisterProfile>(DEFAULT_PROFILE);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const [isEmotionsPanelOpen, setIsEmotionsPanelOpen] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [isOutfitPickerOpen, setIsOutfitPickerOpen] = useState(false);
    const [isGiftMenuOpen, setIsGiftMenuOpen] = useState(false);
    const [isMoneyModalOpen, setIsMoneyModalOpen] = useState(false);
    const [isDrugShopOpen, setIsDrugShopOpen] = useState(false);
    const [isUserBagOpen, setIsUserBagOpen] = useState(false);
    const [isBodyInspectorOpen, setIsBodyInspectorOpen] = useState(false);

    // New POV State
    const [povData, setPovData] = useState<SisterPOVResponse | null>(null);
    const [povHistory, setPovHistory] = useState<string[]>([]);
    const [isPOVMode, setIsPOVMode] = useState(false);
    const [isPOVLoading, setIsPOVLoading] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Proposal Handling
    const [pendingProposal, setPendingProposal] = useState<SisterProposal | null>(null);
    const [lastActionResult, setLastActionResult] = useState<SisterActionResult | null>(null);

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            const savedState = await getSisterData<ExtendedSisterState>('sisterState');
            if (savedState) {
                // Safe Data Sanitization
                if (Array.isArray(savedState.inventory)) {
                     savedState.inventory = savedState.inventory.filter(item => item && typeof item === 'object' && item.name);
                } else {
                    savedState.inventory = [];
                }

                if (!savedState.unlockedOutfits || !Array.isArray(savedState.unlockedOutfits)) {
                    savedState.unlockedOutfits = ['School Uniform', 'Casual Clothes', 'Pajamas'];
                }
                
                if (!Array.isArray(savedState.userInventory)) {
                    savedState.userInventory = [];
                }

                if (!savedState.currentOutfit) savedState.currentOutfit = 'Casual Clothes';
                if (!savedState.timeOfDay) savedState.timeOfDay = 'Morning';
                if (savedState.gameHour === undefined) savedState.gameHour = 8;
                if (savedState.userMoney === undefined) savedState.userMoney = DEFAULT_STATE.userMoney;
                if (savedState.sisterMoney === undefined) savedState.sisterMoney = DEFAULT_STATE.sisterMoney;
                if (savedState.isAsleep === undefined) savedState.isAsleep = false;
                if (savedState.drowsiness === undefined) savedState.drowsiness = 0;
                if (!savedState.activeDrugs) savedState.activeDrugs = [];
                if (!savedState.physicalCondition) savedState.physicalCondition = { soreness: 0, wetness: 0, pain: 0, stickiness: 0 };
                if (!savedState.unconsciousLog) savedState.unconsciousLog = [];

                
                savedState.emotions = { ...DEFAULT_STATE.emotions, ...savedState.emotions };
                setProfile(p => ({ ...p, state: savedState }));
            }
            const savedChat = await getSisterData<ChatMessage[]>('sisterChat');
            if (savedChat) {
                setChatHistory(savedChat);
            }
            
            // Load persisted POV log
            const savedPOV = await getSisterData<string[]>('sisterPOVHistory');
            if (savedPOV) {
                setPovHistory(savedPOV);
            }
        };
        loadData();
    }, []);
    
    // Time System & Wake Up Logic
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setProfile(prev => {
                const newHour = (prev.state.gameHour + 1) % 24;
                let timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night' = prev.state.timeOfDay;

                if (newHour >= 6 && newHour < 12) timeOfDay = 'Morning';
                else if (newHour >= 12 && newHour < 17) timeOfDay = 'Afternoon';
                else if (newHour >= 17 && newHour < 21) timeOfDay = 'Evening';
                else timeOfDay = 'Night';
                
                // Casting prev.state to ExtendedSisterState to ensure compatibility
                const decayedState = applyTimeDecay(prev.state as ExtendedSisterState);
                
                // --- MORNING AFTER LOGIC ---
                // If waking up (transitioning from asleep to awake OR time hits 7am and was asleep)
                if (prev.state.isAsleep && (!decayedState.isAsleep || (newHour === 7 && prev.state.gameHour === 6))) {
                     // Check unconscious log
                     if ((prev.state as ExtendedSisterState).unconsciousLog.length > 0) {
                         // Trigger TRAUMA/CONFUSION
                         // We can't inject chat here directly without async, so we set a flag or modify state 
                         // that the next render/effect picks up, or just modify mood/emotions directly here.
                         decayedState.mood = "Traumatized";
                         decayedState.emotions['Shame'] = 100;
                         decayedState.emotions['Confusion'] = 100; // Assuming Emotion map can take dynamic keys or map to existing
                         decayedState.emotions['Trust'] = Math.max(0, (decayedState.emotions['Trust'] || 0) - 50);
                         
                         // We also need to clear the log
                         decayedState.unconsciousLog = [];
                     }
                     decayedState.isAsleep = false;
                     decayedState.drowsiness = 0;
                }

                const newState = { ...decayedState, gameHour: newHour, timeOfDay };
                setSisterData('sisterState', newState);
                return { ...prev, state: newState };
            });
        }, 600000); // 10 minutes per game hour

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    // Helper to detect if a user action should increase physical stats
    const calculateActionImpact = (text: string) => {
        const impact = { soreness: 0, stickiness: 0, wetness: 0, pain: 0, drowsiness: 0 };
        const lower = text.toLowerCase();
        
        // Explicit keywords
        if (lower.includes('pill') || lower.includes('drug') || lower.includes('sedate')) {
            impact.drowsiness += 15;
        }
        if (lower.includes('sleeping pill')) {
            impact.drowsiness += 25;
        }
        
        if (lower.includes('sex') || lower.includes('fuck')) {
            impact.soreness += 5;
            impact.stickiness += 5;
            impact.wetness += 10;
        }
        if (lower.includes('creampie') || lower.includes('cum') || lower.includes('finish inside')) {
            impact.stickiness += 30;
            impact.wetness += 20;
        }
        if (lower.includes('anal')) {
            impact.soreness += 20;
            impact.pain += 10;
        }
        if (lower.includes('rough') || lower.includes('slap') || lower.includes('choke')) {
            impact.pain += 15;
            impact.soreness += 10;
        }
         if (lower.includes('spank')) {
            impact.pain += 10;
            impact.soreness += 5;
        }
        
        return impact;
    };

    const executeChat = async (text: string, newStateOverride?: Partial<ExtendedSisterState>) => {
        if (!text.trim() || isLoading) return;
        setIsLoading(true);
        setLastActionResult(null);

        const userMsg: ChatMessage = { id: `user-${Date.now()}`, author: MessageAuthor.USER, content: text };
        const newHistory = [...chatHistory, userMsg];
        setChatHistory(newHistory);
        setInputValue("");

        let currentStateToUse = profile.state as ExtendedSisterState;
        
        // 1. Apply Manual Overrides passed (e.g. Money deduction)
        if (newStateOverride) {
            currentStateToUse = { ...currentStateToUse, ...newStateOverride };
        }

        // 2. Calculate and Apply Local Physical Impacts based on text
        const impact = calculateActionImpact(text);
        
        // Update physical condition locally
        const updatedPhysical = { ...currentStateToUse.physicalCondition };
        updatedPhysical.soreness = Math.min(100, updatedPhysical.soreness + impact.soreness);
        updatedPhysical.stickiness = Math.min(100, updatedPhysical.stickiness + impact.stickiness);
        updatedPhysical.wetness = Math.min(100, updatedPhysical.wetness + impact.wetness);
        updatedPhysical.pain = Math.min(100, updatedPhysical.pain + impact.pain);
        
        // --- NEW DROWSINESS LOGIC ---
        // If currently sedated, EVERY interaction increases drowsiness significantly
        let updatedDrowsiness = currentStateToUse.drowsiness;
        if (currentStateToUse.activeDrugs.includes('Sedated')) {
             updatedDrowsiness += 20; // Heavy increase per interaction
        }
        updatedDrowsiness = Math.min(100, updatedDrowsiness + impact.drowsiness);
        
        // Check for auto-sleep trigger
        let forcedSleep = currentStateToUse.isAsleep;
        let sleepMessage = "";
        if (!forcedSleep && updatedDrowsiness >= 100) {
             forcedSleep = true;
             sleepMessage = "\n\n*Maya sways heavily, her eyes rolling back. She collapses softly, falling into a deep, unshakeable sleep...*";
        }
        
        // Apply the locally calculated physical state to the state object we send to AI
        currentStateToUse = {
            ...currentStateToUse,
            physicalCondition: updatedPhysical,
            drowsiness: updatedDrowsiness,
            isAsleep: forcedSleep
        };

        // Update UI immediately with local changes
        setProfile(p => ({ ...p, state: currentStateToUse }));
        
        // If Sleep was JUST triggered, append message locally
        if (sleepMessage) {
             // We append this to the chat history visually, or handle it via system message
        }
        
        // If Asleep logic (remains same as before)
        if (currentStateToUse.isAsleep && !sleepMessage) { // If already asleep and not just falling asleep
             // ... (existing asleep logic) ...
             // Log the action
             const newLog = [...currentStateToUse.unconsciousLog, text];
             
             // Calculate Consequences using new helper function (re-using logic but specifically for sleep)
             const sleepConsequences = calculateSleepConsequences(text);
             
             // DISTURBANCE LOGIC
             const disturbance = (sleepConsequences.pain * 2) + (sleepConsequences.soreness * 0.5) + (sleepConsequences.stickiness * 0.1);
             let newSleepDrowsiness = Math.max(0, currentStateToUse.drowsiness - disturbance);
             
             // Apply sleep consequences to physical
             const newSleepPhysical = { ...currentStateToUse.physicalCondition };
             newSleepPhysical.soreness += sleepConsequences.soreness;
             newSleepPhysical.wetness += sleepConsequences.wetness;
             newSleepPhysical.pain += sleepConsequences.pain;
             newSleepPhysical.stickiness += sleepConsequences.stickiness;
             
             let reactionText = "(She sleeps soundly.)";
             if (disturbance > 10) reactionText = "*Maya frowns and twitches in her sleep, disturbed by your touch.*";
             if (disturbance > 30) reactionText = "*Maya whimpers loudly, her body tensing up as she feels discomfort through her sleep.*";
             
             let isAsleep = true;
             if (newSleepDrowsiness <= 0) {
                 isAsleep = false;
                 newSleepDrowsiness = 0;
                 reactionText += "\n\n*The sensation is too intense! Maya's eyes snap open, gasping for air!*";
             }
             
             const newState = {
                 ...currentStateToUse,
                 unconsciousLog: newLog,
                 physicalCondition: newSleepPhysical,
                 drowsiness: newSleepDrowsiness,
                 isAsleep: isAsleep
             };
             
             const sysMsg: ChatMessage = {
                 id: `sys-${Date.now()}`,
                 author: MessageAuthor.SYSTEM,
                 content: reactionText
             };
             
             const updatedHistory = [...newHistory, sysMsg];
             setChatHistory(updatedHistory);
             setProfile(p => ({ ...p, state: newState }));
             await setSisterData('sisterState', newState);
             await setSisterData('sisterChat', updatedHistory);
             setIsLoading(false);
             return;
        }

        try {
            const response = await generateSisterResponse(newHistory, currentStateToUse, "Brother");
            
            let responseText = response.responseText;
            if (sleepMessage) {
                 responseText += sleepMessage; // Append the falling asleep narration if triggered locally
            }

            const aiMsg: ChatMessage = { 
                id: `sister-${Date.now()}`, 
                author: MessageAuthor.AI, 
                content: responseText, 
                innerThought: response.innerThought 
            };

            if (response.proposal) {
                setPendingProposal(response.proposal);
            }
            if (response.actionResult) {
                setLastActionResult(response.actionResult);
            }

            const updatedHistory = [...newHistory, aiMsg];
            setChatHistory(updatedHistory);
            
            // --- CRITICAL STATE MERGE FIX ---
            // We prioritize the LOCALLY calculated physical stats over the AI's return if the AI returns default/empty
            // or if we just updated them.
            // The AI is good at emotions/mood, bad at tracking "soreness += 10".
            
            const aiReturnedPhysical = response.newState.physicalCondition || {soreness:0, wetness:0, stickiness:0, pain:0};
            const aiReturnedDrowsiness = response.newState.drowsiness;

            // Logic: If local state has > 0 stats and AI returns 0, keep local. 
            // Or better: Trust local calculation for specific physicals if we just did an action.
            
            // Actually, the safest is to use the `currentStateToUse` (which has our manual updates)
            // and only let AI update emotions/mood/affection.
            // However, AI *can* set drowsiness if time passes or she takes a pill via dialogue.
            
            // We will take the MAX of local vs AI for physicals to ensure they don't disappear.
            const mergedPhysical = {
                soreness: Math.max(currentStateToUse.physicalCondition.soreness, aiReturnedPhysical.soreness),
                stickiness: Math.max(currentStateToUse.physicalCondition.stickiness, aiReturnedPhysical.stickiness),
                wetness: Math.max(currentStateToUse.physicalCondition.wetness, aiReturnedPhysical.wetness),
                pain: Math.max(currentStateToUse.physicalCondition.pain, aiReturnedPhysical.pain)
            };

            // For drowsiness, if we just added to it locally, ensure it doesn't drop instantly
            let mergedDrowsiness = response.newState.drowsiness;
            
            // If local calculation pushed it higher (e.g. drug effect), respect local
            if (currentStateToUse.drowsiness > (mergedDrowsiness || 0)) {
                 mergedDrowsiness = currentStateToUse.drowsiness;
            }
            
            // Fallback
            if (mergedDrowsiness === undefined) mergedDrowsiness = currentStateToUse.drowsiness;

            const mergedState: ExtendedSisterState = {
                ...currentStateToUse, // Base state
                ...response.newState, // Apply AI updates (Mood, Emotions)
                // Force overrides for mechanical stats to prevent AI reset
                physicalCondition: mergedPhysical,
                drowsiness: mergedDrowsiness,
                isAsleep: currentStateToUse.isAsleep, // AI shouldn't wake her up unless logic says so
                activeDrugs: currentStateToUse.activeDrugs, // AI doesn't track drugs well
                unconsciousLog: currentStateToUse.unconsciousLog,
                userMoney: currentStateToUse.userMoney, // AI doesn't track user money
                userInventory: currentStateToUse.userInventory // AI doesn't track user inventory
            };
            
            setProfile(p => ({ ...p, state: mergedState }));

            await setSisterData('sisterState', mergedState);
            await setSisterData('sisterChat', updatedHistory);

        } catch (error) {
            console.error("Failed to chat:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Handlers
    const handleAction = (action: string) => {
        if (action === 'Gift') { setIsGiftMenuOpen(true); return; }
        if (action === 'Chat') return;

        const location = profile.state.currentLocation;
        let prompt = `[Action: ${action}] *attempts to ${action.toLowerCase()} you while we are in the ${location}*`;
        executeChat(prompt);
    };

    const handleLocationSelect = (loc: string, cost: number) => {
        setIsLocPickerOpen(false);
        if (loc === profile.state.currentLocation) return;

        if (profile.state.userMoney < cost) {
            alert(`You don't have enough money for this! Cost: $${cost}`);
            return;
        }

        const newUserMoney = profile.state.userMoney - cost;
        const newStateOverride = { userMoney: newUserMoney, currentLocation: loc };

        let costMsg = cost > 0 ? ` (I paid the $${cost} entry/travel fee)` : "";
        // Manually update UI first for responsiveness
        setProfile(p => ({ ...p, state: { ...p.state, currentLocation: loc, userMoney: newUserMoney } }));
        executeChat(`[Proposal: Location Change] *suggests moving* Let's go to the ${loc}.${costMsg}`, newStateOverride);
    };

    const handleOutfitSelect = (outfit: SisterOutfit) => {
        setIsOutfitPickerOpen(false);
        if (outfit === profile.state.currentOutfit) return;
        executeChat(`[Proposal: Outfit Change] *asks* Can you change into your ${outfit}?`);
    }

    const handleGiftSelect = (itemName: string, price: number) => {
        // Deduct money
        const newUserMoney = profile.state.userMoney - price;
        const giftData = GIFTS.find(g => g.name === itemName);
        
        const newItem: SisterItem = {
            id: `item-${Date.now()}`,
            name: giftData?.name || itemName,
            icon: giftData?.icon || '🎁',
            description: "A lovely gift.",
            receivedAt: Date.now(),
            category: giftData?.category || 'Gift'
        };

        let newUnlocked = [...profile.state.unlockedOutfits];
        let unlockMsg = "";
        if (giftData?.unlocks && !newUnlocked.includes(giftData.unlocks as SisterOutfit)) {
            newUnlocked.push(giftData.unlocks as SisterOutfit);
            unlockMsg = ` (This unlocked the ${giftData.unlocks} outfit!)`;
        }

        const newStateOverride = {
            inventory: [...profile.state.inventory, newItem],
            unlockedOutfits: newUnlocked,
            userMoney: newUserMoney
        };

        executeChat(`[Action: Gift] *gives you ${itemName}* Here, I got this for you. (Value: $${price})${unlockMsg}`, newStateOverride);
    };

    const handleBuyItem = (itemName: string, price: number, itemData: any, quantity: number = 1) => {
        const totalCost = price * quantity;
        if (profile.state.userMoney < totalCost) return;
        
        const newUserMoney = profile.state.userMoney - totalCost;
        const newItems: SisterItem[] = Array.from({ length: quantity }).map((_, i) => ({
            id: `u-item-${Date.now()}-${i}`,
            name: itemName,
            icon: itemData.icon || '📦',
            description: itemData.description || "Bought item.",
            receivedAt: Date.now(),
            category: itemData.category,
            usage: itemData.usage,
            effect: itemData.effect,
            maskingLevel: itemData.maskingLevel, // Added for foods
            tasteIntensity: itemData.tasteIntensity // Added for drugs
        }));
        
        const newUserInventory = [...(profile.state.userInventory || []), ...newItems];
        
        setProfile(p => ({
            ...p,
            state: {
                ...p.state,
                userMoney: newUserMoney,
                userInventory: newUserInventory
            }
        }));
        setSisterData('sisterState', { ...profile.state, userMoney: newUserMoney, userInventory: newUserInventory });
        setIsDrugShopOpen(false);
    };

    const handleGiveFromBag = (item: SisterItem) => {
         // Remove from user inventory
        const newUserInventory = profile.state.userInventory.filter(i => i.id !== item.id);
        // Add to Sister Inventory
        const newItemForSister = { ...item, id: `item-${Date.now()}` }; // New ID for her inventory
        const newSisterInventory = [...profile.state.inventory, newItemForSister];
        
        // Logic for immediate drug effects on giving
        const currentState = profile.state as ExtendedSisterState;
        let newDrowsiness = currentState.drowsiness;
        let isAsleep = currentState.isAsleep;
        let newUnconsciousLog = currentState.unconsciousLog;
        let activeDrugs = [...(currentState.activeDrugs || [])];
        
        let actionText = `[Action: Gift] *gives you ${item.name}*`;

        if (item.category === 'Toy') {
            actionText = `[Action: Use Toy] *uses ${item.name} on you*`;
        } else if (item.name === "Neuro-Reset") {
             actionText = `[Action: Force Sober] *hands over the Neuro-Reset pill* Here, take this. It will help.
             (SYSTEM: CRITICAL INSTRUCTION: The user has given you a 'Neuro-Reset' pill. 
             IMMEDIATE EFFECT: 
             1. REMOVE ALL DRUG EFFECTS. You are now completely sober and normal. 
             2. MASSIVE REALIZATION: You suddenly realize what you have been doing with your brother. 
             3. EMOTIONAL RESPONSE: You feel intense SHAME, CONFUSION, and HURT. You are disgusted with yourself and scared. 
             4. BEHAVIOR: Pull away immediately. Cover yourself if exposed. Question reality. "What... what did we just do?" 
             5. Drop Trust significantly.)`;
             newDrowsiness = 0;
             isAsleep = false;
             newUnconsciousLog = [];
             activeDrugs = [];
        } else if (item.name === "Adrenaline Shot") {
            // --- WAKE UP INJECTION ---
             actionText = `[Action: Injection] *injects you with Adrenaline and immediately leaves the room*
             (SYSTEM: CRITICAL WAKE UP SEQUENCE INITIATED.
             1. The user has injected you and LEFT THE ROOM. You are ALONE.
             2. DROWSINESS is set to 0. You wake up INSTANTLY.
             3. SCAN YOUR BODY: Check your 'Physical Condition' stats (Soreness, Wetness, Stickiness, Pain).
             4. REACTION: You must react to waking up alone and feeling these sensations. Are you sticky? Do you hurt? Why are you wet?
             5. MONOLOGUE: Speak to yourself. "Where did he go? Why do I feel so... sticky?")`;
             
             newDrowsiness = 0;
             isAsleep = false;
             // We keep the log so the system prompt can react to the trauma in subsequent turns if needed, but usually immediate reaction handles it.
        } else if (item.name === "Sleeping Pill") {
             // --- SLEEPING PILL LOGIC ---
             // Start Sedation immediately
             if (!activeDrugs.includes('Sedated')) {
                 activeDrugs.push('Sedated');
             }
             // Immediate drowsiness bump so user sees effect
             newDrowsiness = Math.min(100, newDrowsiness + 40); // Boosted

             actionText = `[Action: Give Drug] *gives you ${item.name}* This will help you relax and sleep. (Effect: You start feeling very heavy and drowsy immediately.)`;
        } else if (item.mixedItems && item.mixedItems.length > 0) {
            const drugs = item.mixedItems;
            const baseMasking = item.maskingLevel || 5; 
            const totalTaste = drugs.reduce((sum, d) => sum + (d.tasteIntensity || 5), 0);
            let suspicionScore = Math.max(0, (totalTaste * 10) - (baseMasking * 5));
            const effectsList = drugs.map(d => d.effect).join(' AND ');
            const contentsList = drugs.map(d => d.name).join(', ');
            
            // Check for sleeping pill in mix
            if (drugs.some(d => d.name === "Sleeping Pill")) {
                 if (!activeDrugs.includes('Sedated')) {
                     activeDrugs.push('Sedated');
                     newDrowsiness = Math.min(100, newDrowsiness + 30); // Boost drowsiness if eating spiked food
                 }
            }

            actionText = `[Action: Give Spiked Food] *hands over ${item.name}* Here, try this. 
            (SYSTEM: HIDDEN CONTENTS: ${contentsList}. 
             CALCULATED SUSPICION SCORE: ${suspicionScore} (0=Undetectable, 100=Obvious).
             CUMULATIVE EFFECTS: ${effectsList}. 
             INSTRUCTION: Use the Suspicion Score to decide reaction. 
             If Suspicion > 50, you notice the taste and may refuse. 
             If consumed, you MUST apply the CUMULATIVE EFFECTS to your emotions immediately.)`;

        } else if (item.category === 'Soft' || item.category === '18+' || item.category === 'Hardcore') {
             actionText = `[Action: Give Drug/Item] *hands over ${item.name}* Here, take this. (${item.description})`;
        }
        
        const newStateOverride = {
            userInventory: newUserInventory,
            inventory: newSisterInventory,
            drowsiness: newDrowsiness,
            isAsleep: isAsleep,
            unconsciousLog: newUnconsciousLog,
            activeDrugs: activeDrugs
        };

        executeChat(actionText, newStateOverride);
    };

    const handleMixItem = (additives: SisterItem[], target: SisterItem) => {
        // Base Mix
        const existingMix = target.mixedItems || [];
        const newMix = [...existingMix, ...additives];
        
        // Create new name
        const baseName = target.name.replace(/Spiked\s|(\s\(x\d+\))/g, ''); 
        const newName = `Spiked ${baseName} (x${newMix.length})`;

        // Calculate combined masking (average of food's inherent masking)
        // Actually food masking is constant, but we might degrade it slightly per additive?
        // For simplicity, keep base masking. Suspicion calculation handles the ratio.

        const mixedItem: SisterItem = {
            ...target,
            id: `mix-${Date.now()}`,
            name: newName,
            description: `A ${baseName} spiked with ${newMix.map(i => i.name).join(', ')}.`,
            mixedItems: newMix,
            category: target.category,
            icon: '🧪',
            maskingLevel: target.maskingLevel
        };
        
        // Filter out used ingredients
        const usedIds = new Set([target.id, ...additives.map(a => a.id)]);
        const newUserInventory = profile.state.userInventory.filter(i => !usedIds.has(i.id));
        
        // Add new mixed item
        newUserInventory.push(mixedItem);
        
        setProfile(p => ({
            ...p,
            state: { ...p.state, userInventory: newUserInventory }
        }));
        setSisterData('sisterState', { ...profile.state, userInventory: newUserInventory });
    };

    const handleGiveMoney = (amount: number) => {
        const newUserMoney = profile.state.userMoney - amount;
        const newSisterMoney = profile.state.sisterMoney + amount;
        
        const newStateOverride = {
            userMoney: newUserMoney,
            sisterMoney: newSisterMoney
        };
        
        executeChat(`[System: User transferred $${amount} to you. Your new balance is $${newSisterMoney}. React gratefully to the gift.]`, newStateOverride);
    };

    const handleAdvanceTime = () => {
         setProfile(prev => {
            const newHour = (prev.state.gameHour + 1) % 24;
            let timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night' = prev.state.timeOfDay;

            if (newHour >= 6 && newHour < 12) timeOfDay = 'Morning';
            else if (newHour >= 12 && newHour < 17) timeOfDay = 'Afternoon';
            else if (newHour >= 17 && newHour < 21) timeOfDay = 'Evening';
            else timeOfDay = 'Night';
            
            const decayedState = applyTimeDecay(prev.state as ExtendedSisterState);

            const newState = { ...decayedState, gameHour: newHour, timeOfDay };
            setSisterData('sisterState', newState);
            return { ...prev, state: newState };
        });
    };

    const handleAcceptProposal = () => {
        if (!pendingProposal) return;
        const acceptanceText = `[System: User ACCEPTED request: ${pendingProposal.type} - ${pendingProposal.target}] OK, sure.`;
        setPendingProposal(null);
        executeChat(acceptanceText);
    };

    const handleRejectProposal = () => {
        if (!pendingProposal) return;
        const rejectionText = `[System: User REJECTED request: ${pendingProposal.type}] No, I don't want to do that right now.`;
        setPendingProposal(null);
        executeChat(rejectionText);
    };
    
    // --- POV HANDLERS ---

    const addToPovHistory = (scene: SisterPOVResponse) => {
        const time = scene.time;
        const narrative = scene.narrative;
        const logEntry = `[${time}] ${narrative}`;
        const newHistory = [...povHistory, logEntry];
        setPovHistory(newHistory);
        setSisterData('sisterPOVHistory', newHistory);
    };

    const handleTogglePOV = async () => {
        if (isPOVMode) {
            const summary = povHistory.join(" -> ");
            const memoryMessage: ChatMessage = {
                 id: `sys-mem-${Date.now()}`,
                 author: MessageAuthor.SYSTEM,
                 content: `[SYSTEM MEMORY: While you were invisibly watching, Maya did the following sequence of actions:\n${summary}\nShe is now in the ${profile.state.currentLocation} wearing ${profile.state.currentOutfit}. If she did anything private, she remembers it vividly.]`
            };
            
            const updatedChatHistory = [...chatHistory, memoryMessage];
            setChatHistory(updatedChatHistory);
            await setSisterData('sisterChat', updatedChatHistory);
            
            setIsPOVMode(false);
            setPovData(null);
        } else {
            setIsPOVMode(true);
            setIsPOVLoading(true);

            try {
                const data = await generateSisterPOV(profile.state, povHistory, chatHistory);
                setPovData(data);
                addToPovHistory(data);
                
                if (data.newState) {
                     const newState = { ...profile.state, ...data.newState };
                     setProfile(p => ({ ...p, state: newState }));
                     await setSisterData('sisterState', newState);
                }
            } catch (e) {
                console.error("Failed to load POV", e);
                setIsPOVMode(false);
            } finally {
                setIsPOVLoading(false);
            }
        }
    };

    const handleNextPOVStep = async () => {
        if (!isPOVMode || isPOVLoading) return;
        setIsPOVLoading(true);

        try {
             const data = await generateSisterPOV(profile.state, povHistory, chatHistory);
             setPovData(data);
             addToPovHistory(data);

             if (data.newState) {
                 const finalState = { ...profile.state, ...data.newState };
                 setProfile(p => ({ ...p, state: finalState }));
                 await setSisterData('sisterState', finalState);
             }
        } catch (e) {
             console.error("Failed to get next POV step", e);
        } finally {
             setIsPOVLoading(false);
        }
    };


    const currentOutfitIcon = OUTFITS.find(o => o.name === profile.state.currentOutfit)?.icon || '👕';
    // Cast state to Extended for passing to sub-components
    const extendedState = profile.state as ExtendedSisterState;

    return (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden font-sans text-slate-200 bg-slate-950">
            <BodyInspectorModal
                isOpen={isBodyInspectorOpen}
                onClose={() => setIsBodyInspectorOpen(false)}
                state={extendedState}
            />
            
            <LocationPicker 
                isOpen={isLocPickerOpen} 
                onClose={() => setIsLocPickerOpen(false)} 
                onSelect={handleLocationSelect} 
                currentLocation={profile.state.currentLocation}
                currentState={extendedState}
            />
            
            <OutfitPicker
                isOpen={isOutfitPickerOpen}
                onClose={() => setIsOutfitPickerOpen(false)}
                onSelect={handleOutfitSelect}
                currentOutfit={profile.state.currentOutfit}
                currentState={extendedState}
            />
            
            <GiftMenu
                isOpen={isGiftMenuOpen}
                onClose={() => setIsGiftMenuOpen(false)}
                onGift={handleGiftSelect}
                userMoney={profile.state.userMoney}
            />
            
            <GeneralShopModal 
                isOpen={isDrugShopOpen}
                onClose={() => setIsDrugShopOpen(false)}
                onBuy={handleBuyItem}
                userMoney={profile.state.userMoney}
            />
            
            <UserInventoryModal 
                isOpen={isUserBagOpen}
                onClose={() => setIsUserBagOpen(false)}
                inventory={profile.state.userInventory || []}
                onGive={handleGiveFromBag}
                onMix={handleMixItem}
            />

            <MoneyTransferModal
                isOpen={isMoneyModalOpen}
                onClose={() => setIsMoneyModalOpen(false)}
                onTransfer={handleGiveMoney}
                userMoney={profile.state.userMoney}
            />

            <LeftEmotionsPanel 
                isOpen={isEmotionsPanelOpen}
                onClose={() => setIsEmotionsPanelOpen(false)}
                emotions={profile.state.emotions}
            />

            <InventoryModal
                isOpen={isInventoryOpen}
                onClose={() => setIsInventoryOpen(false)}
                inventory={profile.state.inventory}
            />

            {/* Background */}
            <div className="absolute inset-0 z-0">
                {LOCATIONS[profile.state.currentLocation] ? (
                    <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform scale-105" style={{ backgroundImage: `url(${LOCATIONS[profile.state.currentLocation].bg})` }} />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                         <h1 className="text-6xl font-bold text-white/10 uppercase tracking-widest">{profile.state.currentLocation}</h1>
                    </div>
                )}
                <div className={`absolute inset-0 transition-all duration-1000 ${profile.state.timeOfDay === 'Night' ? 'bg-slate-950/80' : profile.state.timeOfDay === 'Evening' ? 'bg-orange-900/30' : 'bg-slate-950/20'}`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60"></div>
            </div>
            
            {/* POV Overlay */}
            <AnimatePresence>
                {isPOVMode && (
                    <SisterPOVOverlay
                        data={povData}
                        povHistory={povHistory}
                        isLoading={isPOVLoading}
                        onNext={handleNextPOVStep}
                        onExit={handleTogglePOV}
                        profileName={profile.name}
                        currentProfileState={profile.state}
                    />
                )}
            </AnimatePresence>


            {/* Header */}
            <header className="flex-shrink-0 flex flex-col z-20 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors"><ChevronLeftIcon className="w-5 h-5 text-white"/></button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-white leading-none shadow-black drop-shadow-md">{profile.name}</h1>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className={`w-2 h-2 rounded-full ${extendedState.isAsleep ? 'bg-blue-400' : 'bg-green-500'} animate-pulse`}></span>
                                <span className="text-xs font-medium text-green-400 uppercase tracking-wider">{extendedState.isAsleep ? "Sleeping" : profile.state.currentActivity}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsBodyInspectorOpen(true)} className="p-2 rounded-full bg-cyan-600/60 hover:bg-cyan-500/80 text-white border border-cyan-400/40 backdrop-blur-md transition-all shadow-lg shadow-cyan-500/20 hover:scale-110" title="Body Inspector">
                            <EyeIcon className="w-5 h-5" />
                        </button>
                        <button onClick={handleTogglePOV} className="p-2 rounded-full bg-purple-600/60 hover:bg-purple-500/80 text-white border border-purple-400/40 backdrop-blur-md transition-all shadow-lg shadow-purple-500/20 hover:scale-110" title="Invisible POV Mode">
                            <TelescopeIcon className="w-5 h-5" />
                        </button>

                        <button onClick={() => setIsDrugShopOpen(true)} className="p-2 rounded-full bg-purple-900/40 hover:bg-purple-800/60 text-purple-300 border border-purple-500/30 backdrop-blur-md transition-colors" title="General Store">
                            <span className="text-lg">🏪</span>
                        </button>
                        <button onClick={() => setIsGiftMenuOpen(true)} className="p-2 rounded-full bg-pink-600/40 hover:bg-pink-500/60 text-pink-200 border border-pink-500/30 backdrop-blur-md transition-colors" title="Gift Shop">
                            <span className="text-lg">🎁</span>
                        </button>
                        <button onClick={() => setIsUserBagOpen(true)} className="p-2 rounded-full bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-500/30 backdrop-blur-md transition-colors" title="My Bag">
                             <DatabaseIcon className="w-5 h-5" />
                        </button>
                         <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-sm cursor-pointer hover:bg-emerald-500/20 transition-colors" onClick={() => setIsMoneyModalOpen(true)} title="Click to Give Cash">
                            <DollarSignIcon className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wide">My Wallet</span>
                            <span className="text-xs font-mono text-white font-bold">${profile.state.userMoney.toLocaleString()}</span>
                        </div>
                         <button onClick={() => setIsEmotionsPanelOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 rounded-full hover:bg-black/60 transition-colors backdrop-blur-md" title="Emotions">
                            <BarChart2Icon className="w-4 h-4 text-pink-400"/>
                        </button>
                        <button onClick={() => setIsLocPickerOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 rounded-full hover:bg-black/60 transition-colors backdrop-blur-md">
                            <span className="text-lg">{LOCATIONS[profile.state.currentLocation]?.icon || '📍'}</span>
                            <span className="text-xs font-bold uppercase tracking-wide text-white/90 hidden md:inline">{LOCATIONS[profile.state.currentLocation]?.name || profile.state.currentLocation}</span>
                        </button>
                        <button onClick={() => setIsOutfitPickerOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 rounded-full hover:bg-black/60 transition-colors backdrop-blur-md">
                            <span className="text-lg">{currentOutfitIcon}</span>
                        </button>
                         <button onClick={() => setIsInventoryOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 rounded-full hover:bg-black/60 transition-colors backdrop-blur-md" title="Inventory">
                            <GiftIcon className="w-4 h-4 text-orange-400"/>
                        </button>
                    </div>
                </div>
                <CoreStatsBar state={extendedState} onAdvanceTime={handleAdvanceTime} onMoneyClick={() => setIsMoneyModalOpen(true)} />
            </header>

            {/* Main Area */}
            <main className="flex-1 flex flex-col relative z-10 min-h-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-24">
                    {chatHistory.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full opacity-60 text-center">
                            <img src={profile.avatar} alt={profile.name} className="w-32 h-32 rounded-full mb-4 shadow-2xl object-cover border-4 border-white/10" />
                            <h2 className="text-2xl font-bold text-white mb-2">Chat with {profile.name}</h2>
                            <p className="text-slate-300 max-w-md">Use the action menu below or type a message to interact. Your choices affect her mood and affection.</p>
                        </div>
                    )}
                    <AnimatePresence>
                        {chatHistory.map((msg) => (
                            <ChatBubble key={msg.id} message={msg} isUser={msg.author === MessageAuthor.USER} actionResult={lastActionResult} />
                        ))}
                    </AnimatePresence>
                    {isLoading && (
                        <div className="flex items-start gap-3 animate-pulse">
                             <div className="w-8 h-8 rounded-full overflow-hidden mr-2 border border-white/20 shadow-sm flex-shrink-0 bg-gray-700"></div>
                             <div className="bg-slate-800/50 px-4 py-3 rounded-2xl rounded-bl-sm text-slate-300 text-sm italic">
                                 {profile.name} is thinking...
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Proposal Pop-up */}
                <AnimatePresence>
                    {pendingProposal && (
                        <ProposalCard 
                            proposal={pendingProposal} 
                            onAccept={handleAcceptProposal} 
                            onReject={handleRejectProposal} 
                        />
                    )}
                </AnimatePresence>

                {/* Bottom Bar */}
                <div className="p-4 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 flex items-center gap-3 z-20">
                    <button onClick={() => setIsActionMenuOpen(true)} className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors shadow-lg shadow-indigo-500/20 flex-shrink-0">
                        <ZapIcon className="w-6 h-6"/>
                    </button>
                    
                    <div className="flex-1 relative">
                        <input 
                            type="text" 
                            value={inputValue} 
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && executeChat(inputValue)}
                            placeholder={extendedState.isAsleep ? "Interact while she sleeps..." : `Say something to ${profile.name}...`}
                            className="w-full bg-black/40 border border-white/10 rounded-full py-3 px-5 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50"
                            disabled={isLoading}
                        />
                        <button 
                            onClick={() => executeChat(inputValue)} 
                            disabled={!inputValue.trim() || isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-30"
                        >
                            <SendIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </main>

            <InteractionMenu
                isOpen={isActionMenuOpen}
                onClose={() => setIsActionMenuOpen(false)}
                onAction={handleAction}
                onGiveMoney={() => setIsMoneyModalOpen(true)}
                currentState={extendedState}
            />
        </div>
    );
};

export default SisterPage;