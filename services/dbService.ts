
import { ChatSession, Gem, MemoryItem, FavoritePrompt, Bookmark, GeneratedImage, CodeSnippet, Workflow, ChatMessage, UserProfile, AIProfile, CustomizationSettings, StoryState, RolePlaySetup, UserInterestProfile, AIGirlfriendProfile, PassionWeaverStory, EmotionScores, DeadOrAliveSubject } from '../types';

const DB_NAME = "HorizonAIDatabase";
const DB_VERSION = 3;
let db: IDBDatabase;

export const STORE_NAMES = {
    SESSIONS: 'sessions',
    GEMS: 'gems',
    MEMORIES: 'memories',
    FAVORITE_PROMPTS: 'favoritePrompts',
    BOOKMARKS: 'bookmarks',
    GENERATED_IMAGES: 'generatedImages',
    CODE_SNIPPETS: 'codeSnippets',
    WORKFLOWS: 'workflows',
    ROLE_PLAY_MESSAGES: 'rolePlayMessages',
    KEY_VALUE: 'keyValueStore',
    AI_GIRLFRIENDS: 'aiGirlfriends',
    PASSION_WEAVER_STORIES: 'passionWeaverStories',
    DEAD_OR_ALIVE_SUBJECTS: 'deadOrAliveSubjects',
    HUMAN_TALK_MESSAGES: 'humanTalkMessages',
    SISTER_DATA: 'sisterData',
};

export const initDB = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(true);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("Database error:", request.error);
            reject(false);
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(true);
        };

        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            if (!dbInstance.objectStoreNames.contains(STORE_NAMES.SESSIONS)) {
                dbInstance.createObjectStore(STORE_NAMES.SESSIONS, { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains(STORE_NAMES.GEMS)) {
                dbInstance.createObjectStore(STORE_NAMES.GEMS, { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains(STORE_NAMES.MEMORIES)) {
                dbInstance.createObjectStore(STORE_NAMES.MEMORIES, { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains(STORE_NAMES.FAVORITE_PROMPTS)) {
                dbInstance.createObjectStore(STORE_NAMES.FAVORITE_PROMPTS, { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains(STORE_NAMES.BOOKMARKS)) {
                dbInstance.createObjectStore(STORE_NAMES.BOOKMARKS, { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains(STORE_NAMES.GENERATED_IMAGES)) {
                dbInstance.createObjectStore(STORE_NAMES.GENERATED_IMAGES, { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains(STORE_NAMES.CODE_SNIPPETS)) {
                dbInstance.createObjectStore(STORE_NAMES.CODE_SNIPPETS, { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains(STORE_NAMES.WORKFLOWS)) {
                dbInstance.createObjectStore(STORE_NAMES.WORKFLOWS, { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains(STORE_NAMES.ROLE_PLAY_MESSAGES)) {
                dbInstance.createObjectStore(STORE_NAMES.ROLE_PLAY_MESSAGES, { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains(STORE_NAMES.KEY_VALUE)) {
                dbInstance.createObjectStore(STORE_NAMES.KEY_VALUE, { keyPath: 'key' });
            }
            if (!dbInstance.objectStoreNames.contains(STORE_NAMES.AI_GIRLFRIENDS)) {
                dbInstance.createObjectStore(STORE_NAMES.AI_GIRLFRIENDS, { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains(STORE_NAMES.PASSION_WEAVER_STORIES)) {
                dbInstance.createObjectStore(STORE_NAMES.PASSION_WEAVER_STORIES, { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains(STORE_NAMES.DEAD_OR_ALIVE_SUBJECTS)) {
                dbInstance.createObjectStore(STORE_NAMES.DEAD_OR_ALIVE_SUBJECTS, { keyPath: 'id' });
            }
             if (!dbInstance.objectStoreNames.contains(STORE_NAMES.HUMAN_TALK_MESSAGES)) {
                dbInstance.createObjectStore(STORE_NAMES.HUMAN_TALK_MESSAGES, { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains(STORE_NAMES.SISTER_DATA)) {
                dbInstance.createObjectStore(STORE_NAMES.SISTER_DATA, { keyPath: 'key' });
            }
        };
    });
};

export const getKeyValue = <T>(key: string): Promise<T | undefined> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject("Database not initialized.");
        const transaction = db.transaction(STORE_NAMES.KEY_VALUE, 'readonly');
        const store = transaction.objectStore(STORE_NAMES.KEY_VALUE);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result?.value);
        request.onerror = () => reject(request.error);
    });
};

export const setKeyValue = (key: string, value: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject("Database not initialized.");
        const transaction = db.transaction(STORE_NAMES.KEY_VALUE, 'readwrite');
        transaction.onerror = () => reject(transaction.error);
        const store = transaction.objectStore(STORE_NAMES.KEY_VALUE);
        const request = store.put({ key, value });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getSisterData = <T>(key: string): Promise<T | undefined> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject("Database not initialized.");
        const transaction = db.transaction(STORE_NAMES.SISTER_DATA, 'readonly');
        const store = transaction.objectStore(STORE_NAMES.SISTER_DATA);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result?.value);
        request.onerror = () => reject(request.error);
    });
};

export const setSisterData = (key: string, value: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject("Database not initialized.");
        const transaction = db.transaction(STORE_NAMES.SISTER_DATA, 'readwrite');
        transaction.onerror = () => reject(transaction.error);
        const store = transaction.objectStore(STORE_NAMES.SISTER_DATA);
        const request = store.put({ key, value });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getAll = <T>(storeName: string): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject("Database not initialized.");
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
    });
};

export const put = <T>(storeName: string, item: T): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject("Database not initialized.");
        const transaction = db.transaction(storeName, 'readwrite');
        transaction.onerror = () => reject(transaction.error);
        const store = transaction.objectStore(storeName);
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const remove = (storeName: string, id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject("Database not initialized.");
        const transaction = db.transaction(storeName, 'readwrite');
        transaction.onerror = () => reject(transaction.error);
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const clearStore = (storeName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject("Database not initialized.");
        const transaction = db.transaction(storeName, 'readwrite');
        transaction.onerror = () => reject(transaction.error);
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getStoreSize = (storeName: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject("Database not initialized.");
        getAll<any>(storeName).then(items => {
            const size = new Blob([JSON.stringify(items)]).size;
            resolve(size);
        }).catch(reject);
    });
};

export const clearAllData = (): Promise<void[]> => {
    const clearPromises = Object.values(STORE_NAMES).map(storeName => clearStore(storeName));
    return Promise.all(clearPromises);
};
