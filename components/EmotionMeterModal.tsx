
import React from 'react';
import { EmotionScores, Emotion, STANDARD_EMOTIONS, NSFW_EMOTIONS } from '../types';
import { XIcon } from './icons';

interface EmotionMeterModalProps {
    isOpen: boolean;
    onClose: () => void;
    scores: EmotionScores;
    isNsfwModeEnabled: boolean;
}

const getEmotionConfig = (emotion: Emotion, value: number): { color: string; description: string; } => {
    const configs: Record<Emotion, { color: string; levels: [number, string][] }> = {
        happiness: { color: '#facc15', levels: [[20, 'Content'], [80, 'Joyful'], [101, 'Elated']] },
        sadness: { color: '#60a5fa', levels: [[20, 'Calm'], [80, 'Upset'], [101, 'Distraught']] },
        love: { color: '#f472b6', levels: [[20, 'Neutral'], [80, 'Affectionate'], [101, 'Loving']] },
        surprise: { color: '#a78bfa', levels: [[20, 'Aware'], [80, 'Surprised'], [101, 'Astonished']] },
        shyness: { color: '#fda4af', levels: [[20, 'Confident'], [80, 'Shy'], [101, 'Hesitant']] },
        beauty: { color: '#67e8f9', levels: [[20, 'Plain'], [80, 'Appreciative'], [101, 'Awestruck']] },
        cuteness: { color: '#f9a8d4', levels: [[20, 'Neutral'], [80, 'Amused'], [101, 'Adoring']] },
        horror: { color: '#991b1b', levels: [[10, 'Calm'], [70, 'Uneasy'], [101, 'Terrified']] },
        loneliness: { color: '#6b7280', levels: [[20, 'Connected'], [80, 'Lonely'], [101, 'Isolated']] },
        horniness: { color: '#ef4444', levels: [[20, 'Calm'], [80, 'Aroused'], [101, 'Insatiable']] },
        sexiness: { color: '#f43f5e', levels: [[20, 'Reserved'], [80, 'Seductive'], [101, 'Alluring']] },
        hotness: { color: '#fb923c', levels: [[20, 'Cool'], [80, 'Hot'], [101, 'Scorching']] },
        wetness: { color: '#38bdf8', levels: [[10, 'Dry'], [70, 'Moist'], [101, 'Soaked']] },
        nudity: { color: '#fca5a5', levels: [[10, 'Clothed'], [70, 'Exposed'], [101, 'Bare']] },
    };
    const config = configs[emotion] || { color: '#94a3b8', levels: [[101, 'N/A']] };
    const description = config.levels.find(level => value < level[0])?.[1] || 'High';
    return { color: config.color, description };
};

const EmotionGauge: React.FC<{ emotion: Emotion; value: number, style?: React.CSSProperties }> = ({ emotion, value, style }) => {
    const { color, description } = getEmotionConfig(emotion, value);
    
    return (
        <div className="flex items-center gap-4 animate-fade-in-up" style={style}>
            <div className="w-1/3 text-right">
                <p className="font-semibold uppercase tracking-wider text-sm text-slate-300">{emotion}</p>
                <p className="text-xs font-mono" style={{ color }}>{description}</p>
            </div>
            <div className="w-2/3 flex items-center gap-3">
                <div className="flex-1 bg-black/30 h-2 rounded-full overflow-hidden border border-white/5">
                    <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${value}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                    />
                </div>
                <span className="w-12 font-mono text-lg font-bold text-white">{value}%</span>
            </div>
        </div>
    );
};


const EmotionMeterModal: React.FC<EmotionMeterModalProps> = ({ isOpen, onClose, scores, isNsfwModeEnabled }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fade-in-up" onClick={onClose}>
            <div
                className="w-full max-w-3xl max-h-[90vh] bg-slate-900/70 border border-horizon-accent/30 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden"
                onClick={e => e.stopPropagation()}
                style={{
                    boxShadow: '0 0 50px rgba(139, 92, 246, 0.2), inset 0 0 20px rgba(139, 92, 246, 0.1)'
                }}
            >
                {/* HUD Scanline Effect */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-horizon-accent/20 to-transparent opacity-30 animate-hud-scanline pointer-events-none"></div>

                <header className="flex items-center justify-between p-4 border-b border-horizon-accent/20 flex-shrink-0">
                    <h2 className="text-xl font-bold text-horizon-accent tracking-widest uppercase">Bio-Monitor</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-white/10">
                        <XIcon className="w-5 h-5" />
                    </button>
                </header>

                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {STANDARD_EMOTIONS.map((emotion, index) => (
                            <EmotionGauge key={emotion} emotion={emotion} value={scores[emotion] || 0} style={{animationDelay: `${index * 30}ms`}} />
                        ))}
                    </div>
                    {isNsfwModeEnabled && (
                        <>
                            <div className="pt-4 mt-4 border-t border-red-500/30">
                                <h3 className="font-semibold text-red-400 tracking-wider uppercase mb-4 text-center">NSFW Matrix</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                     {NSFW_EMOTIONS.map((emotion, index) => (
                                        <EmotionGauge key={emotion} emotion={emotion} value={scores[emotion] || 0} style={{animationDelay: `${(STANDARD_EMOTIONS.length + index) * 30}ms`}} />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                 <footer className="p-3 text-center text-xs text-slate-500 border-t border-horizon-accent/20">
                    Emotional analysis is based on the AI's entire interaction history.
                </footer>
            </div>
        </div>
    );
};

export default EmotionMeterModal;
