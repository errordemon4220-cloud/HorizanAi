

import React from 'react';
import { PassionWeaverStory } from '../types';
import { downloadFile } from '../services/fileService';
import { XIcon, FileTextIcon, FileCodeIcon, GlobeIcon } from './icons';

interface DownloadStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    story: PassionWeaverStory;
}

const DownloadStoryModal: React.FC<DownloadStoryModalProps> = ({ isOpen, onClose, story }) => {
    if (!isOpen) return null;

    const generateTxt = () => {
        let content = `Title: ${story.title}\n`;
        content += `Last Updated: ${new Date(story.lastUpdatedAt).toLocaleString()}\n\n`;
        content += '==== STORY SETUP ====\n';
        content += `Prompt: ${story.setup.mainPrompt}\n`;
        content += `Your Character: ${story.setup.userCharacter || 'Not specified'}\n`;
        content += `Partner's Character: ${story.setup.partnerCharacter || 'Not specified'}\n`;
        content += `Tone: ${story.setup.tone}\n`;
        content += `POV: ${story.setup.pov}\n`;
        content += `Intensity: ${story.setup.intensity}/5\n`;
        content += `Extreme Mode: ${story.setup.isExtremeMode ? 'ON' : 'OFF'}\n`;
        content += `Kinks: ${story.setup.kinks.join(', ') || 'None'}\n\n`;
        content += '==== STORY START ====\n';

        story.pages.forEach((page, index) => {
            content += `\n\n----------\n\n`;
            if (story.choiceHistory && story.choiceHistory[index]) {
                const choice = story.choiceHistory[index];
                content += `> YOUR CHOICE (leading to this page):\n> "${choice.text}" [${choice.alignment}]\n\n`;
            }
            content += `== PAGE ${index + 1} ==\n\n`;
            content += page;
        });
        
        content += `\n\n==== STORY END ====\n`;

        return content;
    };

    const generateHtml = () => {
        const escapeHtml = (unsafe: string | undefined) => (unsafe || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

        const setupHtml = `
            <div class="setup-section">
                <h2>Story Blueprint</h2>
                <div class="setup-grid">
                    <div><strong>Scenario</strong><p>${escapeHtml(story.setup.mainPrompt)}</p></div>
                    <div><strong>Your Persona</strong><p>${escapeHtml(story.setup.userCharacter) || 'Not specified'}</p></div>
                    <div><strong>Partner's Persona</strong><p>${escapeHtml(story.setup.partnerCharacter) || 'Not specified'}</p></div>
                    <div><strong>Tone</strong><p>${escapeHtml(story.setup.tone)}</p></div>
                    <div><strong>Point of View</strong><p>${escapeHtml(story.setup.pov)}</p></div>
                    <div><strong>Intensity</strong><p>${story.setup.intensity}/5</p></div>
                    <div><strong>Kinks</strong><p>${escapeHtml(story.setup.kinks.join(', ')) || 'None'}</p></div>
                </div>
            </div>
        `;

        const storyHtml = story.pages.map((page, index) => {
            const choice = story.choiceHistory?.[index];
            return `
                <div class="page" style="animation-delay: ${index * 100}ms;">
                    ${choice ? `<blockquote class="choice-made">Your Choice: &ldquo;${escapeHtml(choice.text)}&rdquo;</blockquote>` : ''}
                    <div class="page-content">${page.replace(/\n/g, '<br />')}</div>
                    <footer>Page ${index + 1} of ${story.pages.length}</footer>
                </div>
            `;
        }).join('');

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${escapeHtml(story.title)}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Inter:wght@400;600;700&display=swap');
                    
                    :root {
                        --bg-light: #fdf6f8; --text-light: #440c26; --heading-light: #831843; --accent-light: #db2777; --border-light: #fbcfe8;
                        --bg-dark: #1a0b12; --text-dark: #fce7f3; --heading-dark: #f9a8d4; --accent-dark: #f472b6; --border-dark: #831843;
                    }
                    
                    body {
                        font-family: 'Inter', sans-serif;
                        transition: background-color 0.4s ease, color 0.4s ease;
                        background-color: var(--bg-light); color: var(--text-light);
                    }
                    body.dark {
                        background-color: var(--bg-dark); color: var(--text-dark);
                    }

                    .container { max-width: 800px; margin: auto; padding: 2rem 4rem; }
                    
                    .cover-page {
                        min-height: 80vh; display: flex; flex-direction: column; justify-content: center; text-align: center;
                        border-bottom: 2px solid var(--accent-light); margin-bottom: 3rem; animation: fadeIn 1s ease-out;
                    }
                    body.dark .cover-page { border-color: var(--accent-dark); }
                    .cover-page h1 { font-family: 'Lora', serif; font-size: 3.5rem; color: var(--heading-light); margin: 0; }
                    body.dark .cover-page h1 { color: var(--heading-dark); }
                    .cover-page p { font-size: 1.1rem; color: var(--text-light); opacity: 0.7; margin-top: 0.5rem; }
                    body.dark .cover-page p { color: var(--text-dark); }

                    .setup-section h2 { font-size: 1.8rem; color: var(--heading-light); border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
                    body.dark .setup-section h2 { color: var(--heading-dark); border-color: var(--border-dark); }
                    .setup-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; background: rgba(0,0,0,0.02); padding: 1.5rem; border-radius: 8px; }
                    body.dark .setup-grid { background: rgba(0,0,0,0.2); }
                    .setup-grid > div { padding-bottom: 1rem; border-bottom: 1px solid var(--border-light); }
                    body.dark .setup-grid > div { border-color: var(--border-dark); }
                    .setup-grid > div:last-child { border-bottom: none; }
                    .setup-grid strong { display: block; font-weight: 600; color: var(--heading-light); margin-bottom: 0.25rem; }
                    body.dark .setup-grid strong { color: var(--heading-dark); }
                    .setup-grid p { margin: 0; font-size: 0.95rem; }

                    .page {
                        margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border-light);
                        opacity: 0; animation: fadeIn 0.8s ease-out forwards;
                    }
                    body.dark .page { border-color: var(--border-dark); }
                    .page-content { font-family: 'Lora', serif; font-size: 1.1rem; line-height: 1.8; }
                    .page footer { text-align: center; font-size: 0.8rem; opacity: 0.5; margin-top: 2rem; }
                    
                    .choice-made {
                        border-left: 3px solid var(--accent-light); padding-left: 1rem; margin: 0 0 1.5rem 0;
                        font-style: italic; background-color: rgba(0,0,0,0.03); padding: 0.75rem 1rem; border-radius: 4px;
                    }
                    body.dark .choice-made { border-color: var(--accent-dark); background-color: rgba(255,255,255,0.05); }

                    #theme-toggle { position: fixed; top: 1rem; right: 1rem; cursor: pointer; background: rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.1); border-radius: 99px; padding: 0.5rem; }

                    @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                </style>
            </head>
            <body>
                <button id="theme-toggle" title="Toggle Theme">
                    <svg id="theme-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                </button>
                <div class="container">
                    <header class="cover-page">
                        <h1>${escapeHtml(story.title)}</h1>
                        <p>A Passion Weaver Story</p>
                    </header>
                    <section class="setup-section">${setupHtml}</section>
                    <main>${storyHtml}</main>
                </div>
                <script>
                    const themeToggle = document.getElementById('theme-toggle');
                    const body = document.body;
                    const themeIcon = document.getElementById('theme-icon');
                    const sunIcon = '<path d="M12 1v2"/><path d="M12 21v2"/><path d="m4.22 4.22 1.42 1.42"/><path d="m18.36 18.36 1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="m4.22 18.36 1.42-1.42"/><path d="m18.36 4.22-1.42 1.42"/><circle cx="12" cy="12" r="5"/>';
                    const moonIcon = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';

                    const applyTheme = (theme) => {
                        if (theme === 'dark') {
                            body.classList.add('dark');
                            themeIcon.innerHTML = sunIcon;
                        } else {
                            body.classList.remove('dark');
                            themeIcon.innerHTML = moonIcon;
                        }
                    };
                    
                    themeToggle.addEventListener('click', () => {
                        const newTheme = body.classList.contains('dark') ? 'light' : 'dark';
                        localStorage.setItem('passion-weaver-theme', newTheme);
                        applyTheme(newTheme);
                    });

                    // Apply saved theme on load
                    const savedTheme = localStorage.getItem('passion-weaver-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                    applyTheme(savedTheme);
                </script>
            </body>
            </html>
        `;
    };

    const handleDownload = (format: 'txt' | 'json' | 'html') => {
        const filename = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'passion_weaver_story'}.${format}`;
        let content = '';
        let outputType: 'text' | 'website' | 'slides';

        if (format === 'txt') {
            content = generateTxt();
            outputType = 'text';
        } else if (format === 'json') {
            content = JSON.stringify(story, null, 2);
            outputType = 'slides'; // 'slides' type is used for JSON
        } else if (format === 'html') {
            content = generateHtml();
            outputType = 'website';
        } else {
            onClose();
            return;
        }
        
        downloadFile(content, outputType, filename);
        onClose();
    };

    const DownloadButton: React.FC<{
        icon: React.ReactNode;
        label: string;
        onClick: () => void;
    }> = ({ icon, label, onClick }) => (
        <button onClick={onClick} className="w-full p-3 bg-slate-800/70 hover:bg-slate-700/70 rounded-lg font-semibold text-left flex items-center gap-3 transition-colors">
            {icon}
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/70 ui-blur-effect z-[100] flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-rose-300">Download Story</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-white/10"><XIcon className="w-5 h-5"/></button>
                </div>
                <p className="text-sm text-rose-200/80">Choose a format to download your full story, including setup and all choices made.</p>
                <div className="space-y-3">
                    <DownloadButton icon={<FileTextIcon className="w-5 h-5 text-sky-400"/>} label="Formatted Text (.txt)" onClick={() => handleDownload('txt')} />
                    <DownloadButton icon={<GlobeIcon className="w-5 h-5 text-green-400"/>} label="Interactive eBook (.html)" onClick={() => handleDownload('html')} />
                    <DownloadButton icon={<FileCodeIcon className="w-5 h-5 text-yellow-400"/>} label="Full Story Data (.json)" onClick={() => handleDownload('json')} />
                </div>
            </div>
        </div>
    );
};

export default DownloadStoryModal;