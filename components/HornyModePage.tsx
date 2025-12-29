
import React, { useState, useRef, useEffect } from 'react';
import { XIcon, PlayIcon, PauseIcon, VolumeUpIcon, VolumeOffIcon, ChevronLeftIcon, UploadCloudIcon, MaximizeIcon, SlidersIcon, TelescopeIcon, PictureInPictureIcon, RefreshCwIcon, TargetIcon, VideoIcon, UsersIcon } from './icons';
import { HornyModeLoadout, VideoData, VideoQuality } from '../types';

interface HornyModePageProps {
    onExit: () => void;
}

// Data for Hentai section
const HENTAI_DATA = [
  {
    id: 1,
    title: 'Ippunkan Dake Furete Mo Ii Yo',
    coverImage: 'https://i.postimg.cc/mD7ysjfK/header-5-ezgif-com-webp-to-png-converter.png',
    videoUrl: 'https://fapnationsafe.link/ippunkan-dake-furete-mo-ii-yo-season-1-720p-fap-nation.mp4',
    resolution: '720p',
  },
  {
    id: 2,
    title: 'Yoasobi Gurashi',
    coverImage: 'https://i.postimg.cc/4NTXWzgH/header-4-696x1037.webp',
    videoUrl: 'https://fapnationsafe.link/yoasobi-gurashi-season-1-720p-fap-nation.mp4',
    resolution: '720p',
  },
  {
    id: 3,
    title: 'Taishou Itsuwari Bridal',
    coverImage: 'https://i.postimg.cc/wTV3JWmB/header-2-696x1037.webp',
    videoUrl: 'https://fapnationsafe.link/taishou-itsuwari-bridal-season-1-720p-fap-nation.mp4',
    resolution: '720p',
  },
  {
    id: 4,
    title: 'Modaete Yo Adam-kun',
    coverImage: 'https://i.postimg.cc/6pPHWfzD/header-13-696x1029.webp',
    videoUrl: 'https://fapnationsafe.link/modaete-yo-adam-kun-season-1-720p-fap-nation.mp4',
    resolution: '720p',
  },
  {
    id: 5,
    title: 'Yatara Yarashii Fukami-kun',
    coverImage: 'https://i.postimg.cc/Wbmymyj8/header-12-696x1032.webp',
    videoUrl: 'https://fapnationsafe.link/yatara-yarashii-fukami-kun-season-1-720p-fap-nation.mp4',
    resolution: '720p',
  },
  {
    id: 6,
    title: 'Fuufu Koukan Modorenai Yoru',
    coverImage: 'https://i.postimg.cc/DZ4KgcyM/headw-696x1044.webp',
    videoUrl: 'https://fapnationsafe.link/fuufu-koukan-modorenai-yoru-season-1-720p-fap-nation.mp4',
    resolution: '720p',
  }
];


// Unified Video Loadouts (3D + Real)
const VIDEO_LOADOUTS: Record<string, HornyModeLoadout> = {
  preset1: [
    { id: 1, urls: {
        '360p': 'https://vz-8e56367c-501.becdn.net/93a0dba1-abb6-41a5-8e78-87638d8e400e/play_360p.mp4',
        '480p': 'https://vz-8e56367c-501.becdn.net/93a0dba1-abb6-41a5-8e78-87638d8e400e/play_480p.mp4',
        '720p': 'https://vz-8e56367c-501.becdn.net/93a0dba1-abb6-41a5-8e78-87638d8e400e/play_720p.mp4',
    }, title: 'Aletta Ocean POV' },
    { id: 2, urls: { '1080p': 'https://lewdvideos.b-cdn.net/the-rise-of-a-villain-harley-quinn-dezmall-4k60fps2_1080p.mp4' }, title: 'The Rise of a Villain' },
    { id: 3, urls: { '1080p': 'https://lewdvideos.b-cdn.net/the-queen-s-secret-anna-dezmall-french-sub_1080p.mp4' }, title: "The Queen's Secret" },
    { id: 4, urls: { '720p': 'https://lewdvideos.b-cdn.net/lara-s-capture-full-movie-theropedude_720p.mp4' }, title: "Lara's Capture" },
  ],
  preset2: [
    { id: 5, urls: { '1080p': 'https://lewdvideos.b-cdn.net/betty-s-dream-part-1-omitome_1080p.mp4' }, title: "Betty's Dream" },
    { id: 6, urls: {
        '360p': 'https://vz-e097dd9c-65d.becdn.net/926bc560-cd7e-4dd4-b417-a5bb8f19573a/play_360p.mp4',
        '480p': 'https://vz-e097dd9c-65d.becdn.net/926bc560-cd7e-4dd4-b417-a5bb8f19573a/play_480p.mp4',
        '720p': 'https://vz-e097dd9c-65d.becdn.net/926bc560-cd7e-4dd4-b417-a5bb8f19573a/play_720p.mp4',
    }, title: 'Misspelled Episode 2 Part 1' },
    { id: 7, urls: {
        '360p': 'https://vz-e097dd9c-65d.becdn.net/7f04b15e-9462-4c97-a11e-5a2338a0c001/play_360p.mp4',
        '480p': 'https://vz-e097dd9c-65d.becdn.net/7f04b15e-9462-4c97-a11e-5a2338a0c001/play_480p.mp4',
        '720p': 'https://vz-e097dd9c-65d.becdn.net/7f04b15e-9462-4c97-a11e-5a2338a0c001/play_720p.mp4'
    }, title: 'Misspelled Episode 2 Part 2' },
    { id: 8, urls: { 
        '360p': 'https://vz-8e56367c-501.becdn.net/c2ee9568-1cb2-4080-bed5-89b844ec71e6/play_360p.mp4',
        '1080p': 'https://pixeldrain.net/api/file/NmfaBZoC' 
    }, title: 'Misspelled Episode 2 Part 3' },
  ],
  // Real Videos Loadout
  preset3: [
    { id: 9, urls: { '720p': 'https://tube-2.anybunny.casa/xvideocdn/1cc011474d129981cf5ba9192e8225f9/MDA5LzgxMS8xODIvMS5tcDQ=' }, title: 'Real Video 1' },
    { id: 10, urls: { '720p': 'https://tube-2.anybunny.casa/xvideocdn/1cc011474d129981cf5ba9192e8225f9/MDA5LzgxMS8xODIvMS5tcDQ=' }, title: 'Real Video 2' },
    { id: 11, urls: { '720p': 'https://source-2.spankwire.cc/imgdsde/964efc4f864956d51f36972c42f69b97/MDAwLzAyNi81NTYvMS5tcDQ=' }, title: 'Real Video 3' },
    { id: 12, urls: { '720p': 'https://source.xxnxx.bond/pbwstatic/c3c8377ff0ea2307ad6c745971fee63b/MDEwLzk2NC8xOTMvMS5tcDQ=' }, title: 'Real Video 4' },
  ],
  preset4: [
    { id: 13, urls: { '480p': 'https://el.phncdn.com/pics/gifs/050/170/651/50170651a.webm' }, title: 'Latex Play' },
    { id: 14, urls: { '480p': 'https://el.phncdn.com/pics/gifs/043/216/101/43216101a.webm' }, title: 'Shower Fun' },
    { id: 15, urls: { '480p': 'https://erowall.com/tf558550ef6e/f1190_LaylaScarlett_02.webm' }, title: 'Layla Scarlett' },
    { id: 16, urls: { '480p': 'https://erowall.com/tf558550ef6e/f1115_SonyaBlaze_02.webm' }, title: 'Sonya Blaze' },
  ],
};

const DEFAULT_CUSTOM_LOADOUT: HornyModeLoadout = [
    { id: 101, urls: {}, title: 'Custom Slot 1' },
    { id: 102, urls: {}, title: 'Custom Slot 2' },
    { id: 103, urls: {}, title: 'Custom Slot 3' },
    { id: 104, urls: {}, title: 'Custom Slot 4' },
];

const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const CustomVideoPlayer: React.FC<{ videoUrl: string; onClose: () => void; backButtonText?: string }> = ({ videoUrl, onClose, backButtonText }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<number | null>(null);
    const isExitingProgrammatically = useRef(false);
    const seekSliderRef = useRef<HTMLDivElement>(null);


    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isControlsVisible, setIsControlsVisible] = useState(true);
    const [brightness, setBrightness] = useState(1);

    // Main event listeners for video state
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleLoadedMetadata = () => setDuration(video.duration);
        const handleEnded = () => setIsPlaying(false);
        const handleLeavePip = () => {
            if (!isExitingProgrammatically.current) {
                onClose(); 
            }
             isExitingProgrammatically.current = false;
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('leavepictureinpicture', handleLeavePip);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('leavepictureinpicture', handleLeavePip);
            if (document.pictureInPictureElement === video) {
                document.exitPictureInPicture().catch(err => console.error("Error exiting PiP on unmount:", err));
            }
        };
    }, [onClose]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.style.filter = `brightness(${brightness})`;
        }
    }, [brightness]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            const muted = newVolume === 0;
            if (videoRef.current.muted !== muted) videoRef.current.muted = muted;
            setIsMuted(muted);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
            if (!isMuted && volume === 0) setVolume(1);
        }
    };

    const handleSeek = (newTime: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };
    
    const toggleFullscreen = () => {
        if (playerContainerRef.current) {
            if (!document.fullscreenElement) {
                playerContainerRef.current.requestFullscreen().catch(err => console.error(err));
            } else {
                document.exitFullscreen();
            }
        }
    };

    const togglePip = async () => {
        const videoEl = videoRef.current;
        if (videoEl && document.pictureInPictureEnabled && !videoEl.disablePictureInPicture) {
            try {
                if (videoEl !== document.pictureInPictureElement) {
                    await videoEl.requestPictureInPicture();
                } else {
                    isExitingProgrammatically.current = true;
                    await document.exitPictureInPicture();
                }
            } catch(error) {
                console.error("PiP Error:", error);
                isExitingProgrammatically.current = false;
            }
        }
    };

    const showControls = () => {
        setIsControlsVisible(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = window.setTimeout(() => {
            if (isPlaying) setIsControlsVisible(false);
        }, 3000);
    };

    const hideControls = () => { if (isPlaying) setIsControlsVisible(false); };
    useEffect(() => { showControls(); }, [isPlaying]);

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in-up">
             <style>{`
                .player-controls-bar {
                    background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4), transparent);
                }
                .custom-slider {
                    -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer;
                }
                .custom-slider::-webkit-slider-runnable-track {
                    background-color: rgba(255, 255, 255, 0.3); height: 5px; border-radius: 5px;
                }
                .custom-slider::-moz-range-track {
                    background-color: rgba(255, 255, 255, 0.3); height: 5px; border-radius: 5px;
                }
                .custom-slider::-webkit-slider-thumb {
                    -webkit-appearance: none; appearance: none; margin-top: -5px;
                    background-color: white; height: 15px; width: 15px; border-radius: 50%;
                    box-shadow: 0 0 8px rgba(244, 63, 94, 0.8); border: 2px solid #f43f5e;
                    transition: transform .2s ease;
                }
                 .custom-slider:hover::-webkit-slider-thumb {
                    transform: scale(1.1);
                    box-shadow: 0 0 12px rgba(244, 63, 94, 1);
                }
                .vol-brightness-popup {
                    transform-origin: bottom;
                    transform: scaleY(0) translateY(10px);
                    opacity: 0;
                    transition: all 0.2s ease-out;
                }
                 .group\\/volume:hover .vol-brightness-popup, .group\\/brightness:hover .vol-brightness-popup {
                    transform: scaleY(1) translateY(0);
                    opacity: 1;
                }
            `}</style>

            <div
                ref={playerContainerRef}
                className="relative w-full h-full"
                onClick={e => e.stopPropagation()}
                onMouseMove={showControls}
                onMouseLeave={hideControls}
            >
                <video ref={videoRef} src={videoUrl} autoPlay loop className="w-full h-full object-contain" onClick={togglePlay}/>

                <button onClick={onClose} className={`absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 ${isControlsVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <ChevronLeftIcon className="w-5 h-5" /> {backButtonText || 'Close'}
                </button>

                <div className={`absolute bottom-0 left-0 right-0 player-controls-bar transition-all duration-300 transform ${isControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
                    <div className="px-6 pb-4 pt-2">
                        <div
                            ref={seekSliderRef}
                            className="relative group/progress py-2 cursor-pointer"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const newTime = ((e.clientX - rect.left) / rect.width) * duration;
                                handleSeek(newTime);
                            }}
                        >
                            <div className="relative w-full h-1.5 bg-white/30 top-1/2 -translate-y-1/2 rounded-full transition-transform duration-200 group-hover/progress:scale-y-150">
                               <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }}>
                                   <div className="w-4 h-4 rounded-full bg-white shadow-md absolute top-1/2 -right-2 -translate-y-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
                               </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-1 text-white">
                            <div className="flex items-center gap-1">
                                <button onClick={togglePlay} className="p-2 hover:scale-110 transition-transform">{isPlaying ? <PauseIcon className="w-7 h-7"/> : <PlayIcon className="w-7 h-7"/>}</button>
                                <div className="relative group/volume">
                                    <button onClick={toggleMute} className="p-2">{isMuted || volume === 0 ? <VolumeOffIcon className="w-6 h-6"/> : <VolumeUpIcon className="w-6 h-6"/>}</button>
                                    <div className="vol-brightness-popup absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-4 bg-black/50 backdrop-blur-md rounded-lg">
                                        <input type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume} onChange={e => handleVolumeChange(parseFloat(e.target.value))} className="custom-slider h-24 [-webkit-appearance:slider-vertical] [appearance:slider-vertical]" />
                                    </div>
                                </div>
                            </div>
                            <div className="font-mono text-sm">{formatTime(currentTime)} / {formatTime(duration)}</div>
                            <div className="flex items-center gap-1">
                                <div className="relative group/brightness">
                                    <span className="p-2 text-xl cursor-pointer">☀️</span>
                                    <div className="vol-brightness-popup absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-4 bg-black/50 backdrop-blur-md rounded-lg">
                                        <input type="range" min={0.5} max={1.5} step={0.01} value={brightness} onChange={(e) => setBrightness(parseFloat(e.target.value))} className="custom-slider h-24 [-webkit-appearance:slider-vertical] [appearance:slider-vertical]" />
                                    </div>
                                </div>
                                <button onClick={togglePip} className="p-2 hover:scale-110 transition-transform"><PictureInPictureIcon className="w-5 h-5"/></button>
                                <button onClick={toggleFullscreen} className="p-2 hover:scale-110 transition-transform"><MaximizeIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HentaiView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);
    const [hentaiDurations, setHentaiDurations] = useState<Record<number, string>>({});

    useEffect(() => {
        HENTAI_DATA.forEach(item => {
            const video = document.createElement('video');
            video.src = item.videoUrl;
            video.onloadedmetadata = () => {
                setHentaiDurations(prev => ({ ...prev, [item.id]: formatTime(video.duration) }));
            };
        });
    }, []);


    return (
        <div className="w-full h-full flex flex-col">
            {playingVideo && <CustomVideoPlayer videoUrl={playingVideo} onClose={() => setPlayingVideo(null)} />}
            <div className="flex-shrink-0 flex items-center gap-4 mb-6">
                <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 backdrop-blur-sm border border-slate-600/60 shadow-md rounded-full text-white/80 hover:text-white hover:border-slate-500/80 transition-all duration-300 hover:scale-105">
                    <ChevronLeftIcon className="w-5 h-5" /> Back
                </button>
                <h2 className="text-2xl font-bold text-rose-300">Hentai Collection</h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-4">
                    {HENTAI_DATA.map((item, index) => (
                        <div
                            key={item.id}
                            onClick={() => setPlayingVideo(item.videoUrl)}
                            className="liquid-glass-card group relative aspect-[9/13] rounded-2xl cursor-pointer transition-transform duration-300 hover:-translate-y-2 animate-fade-in-up"
                            style={{ animationDelay: `${index * 80}ms` }}
                        >
                            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white/20 rounded-tl-lg opacity-50 group-hover:border-rose-400/50 transition-colors z-20"></div>
                            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white/20 rounded-tr-lg opacity-50 group-hover:border-rose-400/50 transition-colors z-20"></div>
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white/20 rounded-bl-lg opacity-50 group-hover:border-rose-400/50 transition-colors z-20"></div>
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white/20 rounded-br-lg opacity-50 group-hover:border-rose-400/50 transition-colors z-20"></div>

                            <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                <img
                                    src={item.coverImage}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-[1]"></div>
                            <div className="liquid-glass--face !bg-transparent"></div>
                            <div className="liquid-glass--edge"></div>
                            
                            <div className="absolute inset-0 w-full h-full overflow-hidden rounded-2xl pointer-events-none z-[2]">
                                <div className="w-full h-full bg-white opacity-0 group-hover:animate-holographic-glare [animation-delay:100ms] [transform:translateX(-150%)]"></div>
                            </div>
                            
                            <div className="relative z-10 w-full h-full flex flex-col justify-end p-4">
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <PlayIcon className="w-24 h-24 text-white/70 drop-shadow-lg" />
                                </div>
                                
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold bg-rose-500/80 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">{item.resolution}</span>
                                    <span className="text-[10px] font-bold bg-slate-700/80 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">{hentaiDurations[item.id] || '...'}</span>
                                </div>

                                <h3 className="font-bold text-xl text-white [text-shadow:0_1px_4px_#000] [transform:translateZ(20px)]">
                                    {item.title}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const VideosView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [activeLoadoutId, setActiveLoadoutId] = useState('preset1');
    const [customLoadout, setCustomLoadout] = useState<HornyModeLoadout>(DEFAULT_CUSTOM_LOADOUT);
    const [videos, setVideos] = useState<HornyModeLoadout>(VIDEO_LOADOUTS.preset1);
    const [currentQualities, setCurrentQualities] = useState<(VideoQuality | undefined)[]>([]);
    
    const [isEditing, setIsEditing] = useState(false);
    const [tempCustomLoadout, setTempCustomLoadout] = useState<HornyModeLoadout>(DEFAULT_CUSTOM_LOADOUT);
    
    const [focusedVideoUrl, setFocusedVideoUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    // NEW: Global controls state
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [globalBrightness, setGlobalBrightness] = useState(1);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isLooping, setIsLooping] = useState(true);
    const [ambianceFocusIndex, setAmbianceFocusIndex] = useState<number | null>(null);
    const [videoLayout, setVideoLayout] = useState<HornyModeLoadout>([]);
    const [videoProgress, setVideoProgress] = useState<Record<number, { currentTime: number; duration: number }>>({});
    const [soloFocusIndex, setSoloFocusIndex] = useState<number | null>(null);
    
    const storageKey = 'hornyMode_customLoadout';


    useEffect(() => {
        try {
            const savedLoadout = localStorage.getItem(storageKey);
            if (savedLoadout) {
                const parsed = JSON.parse(savedLoadout);
                if (Array.isArray(parsed) && parsed.length === 4) {
                    setCustomLoadout(parsed.map((item: any, index: number) => ({ ...DEFAULT_CUSTOM_LOADOUT[index], ...item })));
                }
            }
        } catch (error) { console.error("Failed to load custom loadout", error); }
    }, [storageKey]);

    useEffect(() => {
        try {
            const loadoutToSave = customLoadout.map(video => {
                if (video.urls.local) {
                    const { local, ...rest } = video.urls;
                    return { ...video, urls: rest };
                }
                return video;
            });
            localStorage.setItem(storageKey, JSON.stringify(loadoutToSave));
        } catch (error) { console.error("Failed to save custom loadout", error); }
    }, [customLoadout, storageKey]);

    const qualityOrder: VideoQuality[] = ['360p', '480p', '720p', '1080p', 'local'];
    
    useEffect(() => {
        const newVideos = activeLoadoutId === 'custom' ? customLoadout : VIDEO_LOADOUTS[activeLoadoutId] || [];
        setVideos(newVideos);
        setVideoLayout(newVideos);
        
        const initialQualities = newVideos.map(video => {
            const availableQualities = Object.keys(video.urls) as VideoQuality[];
            if (availableQualities.length === 0) return undefined;
            for (const quality of qualityOrder) {
                if (availableQualities.includes(quality)) return quality;
            }
            return availableQualities[0];
        });
        setCurrentQualities(initialQualities);
        setFocusedVideoUrl(null);
    }, [activeLoadoutId, customLoadout]);

    useEffect(() => {
        videoRefs.current.forEach((videoEl, index) => {
            if (!videoEl) return;

            const shouldPlay = soloFocusIndex === null ? isPlaying : (soloFocusIndex === index && isPlaying);

            if (shouldPlay) {
                videoEl.play().catch(e => console.warn("Autoplay was prevented.", e));
            } else {
                videoEl.pause();
            }

            videoEl.loop = soloFocusIndex === null ? isLooping : (soloFocusIndex === index && isLooping);
            videoEl.playbackRate = soloFocusIndex === null ? playbackSpeed : (soloFocusIndex === index ? playbackSpeed : 1);
        });
    }, [isPlaying, videos, currentQualities, playbackSpeed, isLooping, videoLayout, soloFocusIndex]);

    useEffect(() => {
        videoRefs.current.forEach((videoEl, i) => {
            if (!videoEl) return;
            const isSoloFocused = i === soloFocusIndex;
            const isAmbianceFocused = i === ambianceFocusIndex;

            if (soloFocusIndex !== null) {
                videoEl.style.filter = isSoloFocused ? `brightness(${globalBrightness})` : 'brightness(0)';
                videoEl.volume = isMuted ? 0 : (isSoloFocused ? 1 : 0);
            } else if (ambianceFocusIndex !== null) {
                videoEl.style.filter = `brightness(${isAmbianceFocused ? globalBrightness : globalBrightness * 0.3})`;
                videoEl.volume = isMuted ? 0 : (isAmbianceFocused ? 1 : 0.1);
            } else {
                videoEl.style.filter = `brightness(${globalBrightness})`;
                videoEl.volume = isMuted ? 0 : 1;
            }
        });
    }, [ambianceFocusIndex, globalBrightness, isMuted, soloFocusIndex]);
    
    const handlePlayPauseAll = () => {
        setIsPlaying(prev => !prev);
    };

    const handleMuteAll = () => setIsMuted(prev => !prev);
    const handleVideoClick = (url: string) => { if (!isEditing) { setFocusedVideoUrl(url); setIsPlaying(true); } };
    const handleBackToGrid = () => setFocusedVideoUrl(null);
    const handleQualityChange = (index: number, quality: VideoQuality) => { setCurrentQualities(prev => { const n = [...prev]; n[index] = quality; return n; }); };
    const handleEdit = () => { setTempCustomLoadout(customLoadout); setIsEditing(true); };
    const handleSave = () => { setCustomLoadout(tempCustomLoadout); setIsEditing(false); };
    const handleCancel = () => { setTempCustomLoadout(customLoadout); setIsEditing(false); };
    const handleTempUrlChange = (index: number, url: string) => { setTempCustomLoadout(prev => { const n = [...prev]; n[index] = { ...n[index], urls: { '480p': url } }; return n; }); };
    const handleFileChange = (index: number, file: File | null) => {
        if (!file || !file.type.startsWith('video/')) return;
        const reader = new FileReader();
        reader.onloadend = () => { setTempCustomLoadout(prev => { const n = [...prev]; n[index] = { ...n[index], urls: { local: reader.result as string } }; return n; }); };
        reader.readAsDataURL(file);
    };

    const toggleSoloFocus = (index: number) => {
        if (soloFocusIndex === index) { // Exit solo
            setSoloFocusIndex(null);
            setTimeout(() => { // Allow re-render to restore src attributes
                if (isPlaying) {
                    videoRefs.current.forEach(videoEl => {
                        if (videoEl) videoEl.play().catch(e => console.warn("Autoplay was prevented.", e));
                    });
                }
            }, 100);
        } else { // Enter solo
            setAmbianceFocusIndex(null);
            setSoloFocusIndex(index);
        }
    };
    
    const syncVideos = () => { videoRefs.current.forEach(v => { if (v) v.currentTime = 0; }); };
    const scrambleLayout = () => { setVideoLayout(currentLayout => [...currentLayout].sort(() => Math.random() - 0.5)); };
    const toggleAmbianceFocus = (index: number) => { 
        if (soloFocusIndex !== null) return;
        setAmbianceFocusIndex(prev => prev === index ? null : index);
    };
    const handlePip = async (index: number) => {
        const videoEl = videoRefs.current[index];
        if (videoEl && document.pictureInPictureEnabled && !videoEl.disablePictureInPicture) {
            try {
                if (videoEl !== document.pictureInPictureElement) {
                    await videoEl.requestPictureInPicture();
                } else {
                    await document.exitPictureInPicture();
                }
            } catch(error) { console.error("PiP Error:", error); }
        }
    };

    const LOADOUT_TABS = [
        { id: 'preset1', label: 'Loadout 1' }, 
        { id: 'preset2', label: 'Loadout 2' },
        { id: 'preset3', label: 'Loadout 3' },
        { id: 'preset4', label: 'Loadout 4' },
        { id: 'custom', label: 'Custom' },
    ];
    
    videoRefs.current = [];

    return (
        <div className="w-full h-full flex flex-col">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4">
                <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                    <ChevronLeftIcon className="w-5 h-5" /> Back
                </button>
                <div className="flex items-center p-1 bg-black/30 rounded-lg border border-white/10">
                    {LOADOUT_TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveLoadoutId(tab.id)} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeLoadoutId === tab.id ? 'bg-rose-600 text-white' : 'text-rose-200/70 hover:bg-white/5'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
                {activeLoadoutId === 'custom' && !isEditing && (
                    <button onClick={handleEdit} className="px-4 py-1.5 bg-slate-600 text-white rounded-lg text-sm font-semibold hover:bg-slate-500">Edit Loadout</button>
                )}
                 <button onClick={() => setIsControlsOpen(p => !p)} className={`p-2 rounded-full text-sm font-semibold transition-colors ${isControlsOpen ? 'bg-rose-600 text-white' : 'bg-black/30 text-rose-200/70'}`}><SlidersIcon className="w-5 h-5"/></button>
            </div>

            {isControlsOpen && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 p-4 w-full max-w-md bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl space-y-3 animate-fade-in-up">
                     <div>
                        <label className="text-xs font-bold text-slate-300">GLOBAL BRIGHTNESS</label>
                        <input type="range" min="0.5" max="1.5" step="0.01" value={globalBrightness} onChange={(e) => setGlobalBrightness(parseFloat(e.target.value))} className="w-full h-2 mt-1 bg-black/30 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                    </div>
                     <div>
                        <label className="text-xs font-bold text-slate-300">PLAYBACK SPEED</label>
                        <div className="flex w-full bg-black/30 rounded-lg p-1 mt-1">
                            {[0.5, 1, 1.5, 2].map(speed => (
                                <button key={speed} onClick={() => setPlaybackSpeed(speed)} className={`flex-1 py-1 rounded-md text-xs font-semibold ${playbackSpeed === speed ? 'bg-rose-600 text-white' : 'text-rose-200/70 hover:bg-white/5'}`}>{speed}x</button>
                            ))}
                        </div>
                    </div>
                     <div className="flex justify-between items-center pt-2">
                        <label className="text-sm font-semibold text-slate-300">Loop All Videos</label>
                        <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={isLooping} onChange={(e) => setIsLooping(e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div></label>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <button onClick={syncVideos} disabled={soloFocusIndex !== null} className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:opacity-50">Sync Videos</button>
                        <button onClick={scrambleLayout} disabled={soloFocusIndex !== null} className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded-md hover:bg-slate-600 disabled:opacity-50">Scramble Layout</button>
                    </div>
                </div>
            )}

            {isEditing ? (
                <div className="w-full h-full flex flex-col animate-fade-in-up pt-24">
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tempCustomLoadout.map((video, index) => {
                                const isLocal = !!video.urls.local;
                                const currentUrl = video.urls.local || video.urls['480p'] || Object.values(video.urls)[0] || '';
                                return (
                                 <div key={video.id} className="bg-black/20 border border-white/10 rounded-2xl p-4 flex flex-col justify-start gap-3">
                                    <h3 className="font-semibold text-white">{video.title}</h3>
                                     <input type="text" value={isLocal ? '' : (video.urls['480p'] || '')} onChange={(e) => handleTempUrlChange(index, e.target.value)} placeholder={isLocal ? "Local file uploaded" : "Paste video URL"} disabled={isLocal} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-400 disabled:opacity-50" />
                                    <div className="text-sm text-slate-400 text-center">OR</div>
                                    <input type="file" id={`file-upload-${index}`} className="hidden" accept="video/*" onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)} />
                                    <label htmlFor={`file-upload-${index}`} className="w-full flex items-center justify-center gap-2 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-sm font-semibold cursor-pointer"><UploadCloudIcon className="w-4 h-4" /> Upload Local File</label>
                                    {currentUrl && <div className="w-full aspect-video mt-2 rounded-md overflow-hidden bg-black"><video src={currentUrl} muted loop autoPlay playsInline className="w-full h-full object-contain" /></div>}
                                </div>
                            )})}
                        </div>
                         <p className="text-xs text-center text-slate-500 mt-4">Note: Locally uploaded videos are for the current session only and will not be saved.</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center justify-center gap-4 pt-6">
                        <button onClick={handleCancel} className="px-6 py-2 bg-slate-700 rounded-lg font-semibold hover:bg-slate-600">Cancel</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-rose-600 rounded-lg font-semibold hover:bg-rose-500">Save</button>
                    </div>
                </div>
            ) : (
                <>
                    <div className={`w-full h-full grid grid-cols-2 grid-rows-2 gap-6 transition-all duration-500 ${focusedVideoUrl !== null ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
                        {videoLayout.map((video, index) => {
                            const currentQuality = currentQualities[videos.indexOf(video)];
                            const currentUrl = currentQuality ? video.urls[currentQuality] : null;
                            const progress = videoProgress[video.id];
                            const timeLeft = progress && progress.duration ? progress.duration - progress.currentTime : null;
                            const isSoloFocused = soloFocusIndex === index;

                            return (
                                <div key={video.id} className={`group relative rounded-2xl overflow-hidden shadow-lg border-2 transition-all duration-300 ${isSoloFocused ? 'border-rose-500/80 shadow-rose-500/30 shadow-2xl animate-pulse-glow' : 'border-transparent hover:border-red-500/50'} ${soloFocusIndex !== null && !isSoloFocused ? 'opacity-10 pointer-events-none' : ''}`}>
                                    {currentUrl && (
                                        <>
                                            <video
                                                key={`${video.id}-${currentUrl}`}
                                                ref={(el: HTMLVideoElement) => { videoRefs.current[index] = el; }}
                                                src={soloFocusIndex !== null && !isSoloFocused ? '' : currentUrl}
                                                muted={isMuted}
                                                playsInline
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                onLoadedMetadata={(e) => { const videoEl = e.currentTarget; setVideoProgress(prev => ({ ...prev, [video.id]: { ...prev[video.id], duration: videoEl.duration, currentTime: videoEl.currentTime } })); }}
                                                onTimeUpdate={(e) => { const videoEl = e.currentTarget; setVideoProgress(prev => ({ ...prev, [video.id]: { ...prev[video.id], currentTime: videoEl.currentTime } })); }}
                                            />
                                            {timeLeft !== null && timeLeft > 0 && (
                                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-mono px-1.5 py-0.5 rounded z-20">
                                                    -{formatTime(timeLeft)}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <button onClick={() => currentUrl && handleVideoClick(currentUrl)} className="p-2"><PlayIcon className="w-16 h-16 text-white/80"/></button>
                                                </div>
                                                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); toggleAmbianceFocus(index); }} disabled={soloFocusIndex !== null} title="Ambiance Focus" className={`p-2 rounded-full transition-colors ${ambianceFocusIndex === index ? 'bg-rose-500 text-white' : 'bg-black/50 text-white/80'} disabled:opacity-30`}><TelescopeIcon className="w-6 h-6"/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handlePip(index); }} title="Picture-in-Picture" className="p-2 bg-black/50 rounded-full text-white/80"><PictureInPictureIcon className="w-5 h-5"/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); toggleSoloFocus(index); }} title="Solo Focus" className={`p-2 rounded-full transition-colors ${isSoloFocused ? 'bg-rose-500 text-white' : 'bg-black/50 text-white/80'}`}><TargetIcon className="w-6 h-6"/></button>
                                                </div>
                                            </div>
                                            {Object.keys(video.urls).length > 1 && (
                                                <div className="absolute top-4 left-4 z-10 flex items-center gap-1 p-1 bg-black/50 backdrop-blur-sm rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    {(Object.keys(video.urls) as VideoQuality[]).sort().map(q => (<button key={q} onClick={(e) => { e.stopPropagation(); handleQualityChange(videos.indexOf(video), q);}} className={`px-2 py-0.5 text-xs font-semibold rounded-full transition-colors duration-200 ${currentQuality === q ? 'bg-rose-600 text-white' : 'bg-transparent text-white/80 hover:bg-white/20'}`}>{q}</button>))}
                                                </div>
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"><h3 className="font-bold text-lg text-white">{video.title}</h3></div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {focusedVideoUrl !== null && (
                        <CustomVideoPlayer 
                            videoUrl={focusedVideoUrl} 
                            onClose={handleBackToGrid}
                            backButtonText="Back to Grid"
                        />
                    )}
                    {focusedVideoUrl === null && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
                            <div className="liquid-glass-card red-glass rounded-full">
                                <div className="liquid-glass--bend !bg-red-500/20"></div>
                                <div className="liquid-glass--face !bg-black/30"></div>
                                <div className="liquid-glass--edge"></div>
                                <div className="relative z-10 p-2 flex items-center gap-3">
                                    <button onClick={handleMuteAll} className="p-3 bg-black/30 rounded-full text-red-300 hover:bg-red-500/20 transition-colors">{isMuted ? <VolumeOffIcon className="w-6 h-6"/> : <VolumeUpIcon className="w-6 h-6"/>}</button>
                                    <button onClick={handlePlayPauseAll} className="p-4 bg-red-600 rounded-full text-white shadow-lg shadow-red-500/50 hover:bg-red-500 transition-colors">{isPlaying ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}</button>
                                    <button onClick={scrambleLayout} disabled={soloFocusIndex !== null} title="Scramble Layout" className="p-3 bg-black/30 rounded-full text-red-300 hover:bg-red-500/20 transition-colors disabled:opacity-50"><RefreshCwIcon className="w-6 h-6"/></button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const SelectionView: React.FC<{ onSelect: (mode: 'videos' | 'hentai') => void }> = ({ onSelect }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
            <div className="text-center mb-12 animate-fade-in-up">
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-200 to-red-500 mb-4" style={{ textShadow: '0 4px 20px rgba(220, 38, 38, 0.3)' }}>Select Your Desire</h1>
                <p className="text-rose-200/60 text-lg">Choose a category to begin.</p>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-6xl px-4">
                <button onClick={() => onSelect('videos')} className="group relative w-full md:w-96 h-[450px] rounded-3xl overflow-hidden cursor-pointer shadow-2xl border-2 border-white/10 hover:border-red-500/50 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <img src="https://i.postimg.cc/SsXmB36P/dd6537c2d2dd1d261e1b4c07b47306756283c3f8d98380452dc51fe5c8f3fde2.jpg" alt="Videos" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 group-hover:opacity-90"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <PlayIcon className="w-24 h-24 text-white/90 drop-shadow-lg mb-4" />
                        <p className="text-rose-200 font-medium px-6 text-center text-lg">3D Animation & Real Videos</p>
                    </div>
                    <div className="absolute bottom-8 left-8 right-8">
                         <h2 className="font-bold text-4xl text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.8)] group-hover:text-rose-400 transition-colors">Videos</h2>
                    </div>
                </button>

                <button onClick={() => onSelect('hentai')} className="group relative w-full md:w-96 h-[450px] rounded-3xl overflow-hidden cursor-pointer shadow-2xl border-2 border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <img src="https://i.postimg.cc/mD7ysjfK/header-5-ezgif-com-webp-to-png-converter.png" alt="Hentai" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 group-hover:opacity-90"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <UsersIcon className="w-24 h-24 text-white/90 drop-shadow-lg mb-4" />
                        <p className="text-purple-200 font-medium px-6 text-center text-lg">2D Anime & Hentai Collection</p>
                    </div>
                     <div className="absolute bottom-8 left-8 right-8">
                        <h2 className="font-bold text-4xl text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.8)] group-hover:text-purple-400 transition-colors">Hentai</h2>
                    </div>
                </button>
            </div>
        </div>
    );
};

const HornyModePage: React.FC<HornyModePageProps> = ({ onExit }) => {
    const [mode, setMode] = useState<'selection' | 'videos' | 'hentai'>('selection');
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        // Pick a random background image from the HENTAI_DATA or provided presets on mount
        const allImages = [
            ...HENTAI_DATA.map(i => i.coverImage),
            'https://i.postimg.cc/SsXmB36P/dd6537c2d2dd1d261e1b4c07b47306756283c3f8d98380452dc51fe5c8f3fde2.jpg',
             'https://i.postimg.cc/nzQBQWkb/download_(81).jpg'
        ];
        setBgImage(allImages[Math.floor(Math.random() * allImages.length)]);
    }, []);

    const renderContent = () => {
        switch(mode) {
            case 'videos': return <VideosView onBack={() => setMode('selection')} />;
            case 'hentai': return <HentaiView onBack={() => setMode('selection')} />;
            case 'selection':
            default:
                return <SelectionView onSelect={setMode} />;
        }
    };
    
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 overflow-hidden bg-black">
            {/* Dynamic Background */}
            {mode === 'selection' && bgImage && (
                <div className="absolute inset-0 z-0">
                     <div className="absolute inset-0 bg-cover bg-center animate-ken-burns opacity-40" style={{ backgroundImage: `url(${bgImage})` }}></div>
                     <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                     <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80"></div>
                </div>
            )}

            {/* Aurora Background (Visible in sub-pages) */}
            {mode !== 'selection' && (
                 <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-red-600/20 rounded-full filter blur-3xl animate-aurora opacity-40" style={{ animationDuration: '40s' }}></div>
                    <div className="absolute bottom-[-20%] right-[-20%] w-[50vw] h-[50vw] bg-rose-600/20 rounded-full filter blur-3xl animate-aurora" style={{ animationDuration: '40s', animationDelay: '-20s' }}></div>
                </div>
            )}

            <button onClick={onExit} className="absolute top-6 right-6 z-50 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                <XIcon className="w-6 h-6"/>
            </button>

            {renderContent()}
        </div>
    );
};

export default HornyModePage;
