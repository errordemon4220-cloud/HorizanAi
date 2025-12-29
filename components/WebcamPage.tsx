
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DetectedObject, AnalysisLogEntry } from '../types';
import { VideoIcon, LoaderIcon, AlertTriangleIcon } from './icons';
import { analyzeVideoFrame } from '../services/geminiService';

interface WebcamPageProps {}

type CameraStatus = 'idle' | 'initializing' | 'streaming' | 'error';

const IOU_THRESHOLD = 0.4;
const TTL = 3000;

function calculateIou(box1: number[], box2: number[]): number {
    const [x1_min, y1_min, x1_max, y1_max] = box1;
    const [x2_min, y2_min, x2_max, y2_max] = box2;
    
    const x_inter_min = Math.max(x1_min, x2_min);
    const y_inter_min = Math.max(y1_min, y2_min);
    const x_inter_max = Math.min(x1_max, x2_max);
    const y_inter_max = Math.min(y1_max, y2_max);

    const inter_width = Math.max(0, x_inter_max - x_inter_min);
    const inter_height = Math.max(0, y_inter_max - y_inter_min);
    const inter_area = inter_width * inter_height;

    const area1 = (x1_max - x1_min) * (y1_max - y1_min);
    const area2 = (x2_max - x2_min) * (y2_max - y2_min);
    
    const union_area = area1 + area2 - inter_area;

    return union_area > 0 ? inter_area / union_area : 0;
}

const colorPalette = [ '#38bdf8', '#fb7185', '#4ade80', '#fbbf24', '#a78bfa', '#2dd4bf', '#f472b6', '#818cf8' ];
let colorIndex = 0;
const getNextColor = () => {
    const color = colorPalette[colorIndex];
    colorIndex = (colorIndex + 1) % colorPalette.length;
    return color;
};

const BoundingBox: React.FC<{ object: DetectedObject, videoRect: DOMRect | null }> = ({ object, videoRect }) => {
    if (!videoRect) return null;

    const left = videoRect.left + (object.box[0] * videoRect.width);
    const top = videoRect.top + (object.box[1] * videoRect.height);
    const width = (object.box[2] - object.box[0]) * videoRect.width;
    const height = (object.box[3] - object.box[1]) * videoRect.height;
    
    const style: React.CSSProperties = {
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        borderColor: object.color,
        boxShadow: `0 0 10px ${object.color}, inset 0 0 10px ${object.color}`,
        '--glow-color': object.color
    } as any;

    return (
        <div style={style} className="border-2 rounded-md transition-all duration-200 animate-fade-in-up">
            <span className="absolute -top-6 left-0 text-sm font-bold text-glow px-1 rounded" style={{color: object.color}}>
                {object.name}
            </span>
        </div>
    );
};


const WebcamPage: React.FC<WebcamPageProps> = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const intervalRef = useRef<number | null>(null);
    const isAnalyzingFrame = useRef(false);
    const objectCounterRef = useRef<{[key: string]: number}>({});

    const [status, setStatus] = useState<CameraStatus>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
    
    const onFrameAnalysis = async (base64Frame: string) => {
        if (isAnalyzingFrame.current) return;
        isAnalyzingFrame.current = true;
        try {
            const detections = await analyzeVideoFrame(base64Frame);
            
            setDetectedObjects(prevObjects => {
                const now = Date.now();
                const updatedObjects = prevObjects.map(o => ({ ...o, matched: false })).filter(o => now - o.lastSeen < TTL);
                const newTrackedObjects: DetectedObject[] = [];

                detections.forEach(det => {
                    let bestMatch: { iou: number; index: number } | null = null;
                    updatedObjects.forEach((obj, index) => {
                        if (obj.name === det.name && !obj.matched) {
                            const iou = calculateIou(det.box, obj.box);
                            if (iou > IOU_THRESHOLD && (!bestMatch || iou > bestMatch.iou)) {
                                bestMatch = { iou, index };
                            }
                        }
                    });

                    if (bestMatch) {
                        const matchedObj = updatedObjects[bestMatch.index];
                        matchedObj.box = det.box;
                        matchedObj.lastSeen = now;
                        matchedObj.matched = true;
                        newTrackedObjects.push(matchedObj);
                    } else {
                        if (!objectCounterRef.current[det.name]) objectCounterRef.current[det.name] = 0;
                        objectCounterRef.current[det.name]++;
                        const id = `${det.name}-${objectCounterRef.current[det.name]}`;
                        
                        newTrackedObjects.push({
                            id,
                            name: det.name,
                            box: det.box,
                            confidence: 0.9 + Math.random() * 0.09,
                            color: getNextColor(),
                            lastSeen: now,
                        });
                    }
                });

                updatedObjects.forEach(obj => {
                    if (!obj.matched) newTrackedObjects.push(obj);
                });
                
                return newTrackedObjects;
            });
        } catch (error) {
            console.error("Frame analysis failed:", error);
        } finally {
            isAnalyzingFrame.current = false;
        }
    };
    
    const stopStream = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    }, []);
    
    useEffect(() => {
        const startStream = async () => {
            setStatus('initializing');
            setErrorMessage(null);
            stopStream();

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720, facingMode: 'user' },
                });
                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onplaying = () => {
                        setStatus('streaming');
                        intervalRef.current = window.setInterval(() => {
                            if (videoRef.current && canvasRef.current && document.hidden === false) {
                                const video = videoRef.current;
                                const canvas = canvasRef.current;
                                canvas.width = video.videoWidth;
                                canvas.height = video.videoHeight;
                                const context = canvas.getContext('2d');
                                if (context) {
                                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                                    const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
                                    onFrameAnalysis(dataUrl.split(',')[1]);
                                }
                            }
                        }, 1000);
                    };
                }
            } catch (err) {
                 let message = "Could not access the camera. Please check permissions.";
                 if (err instanceof DOMException) {
                   switch (err.name) {
                     case 'NotAllowedError':
                       message = "Camera access was denied. Please allow access in your browser settings.";
                       break;
                     case 'NotFoundError':
                       message = "No camera was found on this device.";
                       break;
                    case 'NotReadableError':
                        message = "The camera is already in use by another application.";
                        break;
                     default:
                       message = `An unexpected error occurred: ${err.name}`;
                   }
                 }
                 setErrorMessage(message);
                 setStatus('error');
                 stopStream();
            }
        };

        startStream();

        return () => stopStream();
    }, [stopStream]);

    return (
        <div className="flex-1 flex flex-col p-6 md:p-8 relative overflow-y-auto custom-scrollbar">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/20 dark:bg-blue-500/10 rounded-full filter blur-3xl animate-aurora opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-green-500/20 dark:bg-green-500/10 rounded-full filter blur-3xl animate-aurora [animation-delay:5s] opacity-50"></div>
            </div>

            <header className="text-center mb-8 animate-fade-in-up relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400" style={{ textShadow: '0 2px 10px rgba(255, 255, 255, 0.1)' }}>
                    Live Object Detection
                </h1>
                <p className="mt-3 text-lg text-horizon-light-text-secondary dark:text-horizon-text-secondary">
                    The AI will identify objects through your camera in real-time.
                </p>
            </header>

            <div className="flex-1 relative bg-black/20 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                <canvas ref={canvasRef} className="hidden" />

                {status === 'initializing' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                        <LoaderIcon className="w-12 h-12 text-white animate-spin mb-4" />
                        <p className="text-xl font-semibold">Initializing Camera...</p>
                    </div>
                )}
                 {status === 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/50 text-white p-8 text-center">
                        <AlertTriangleIcon className="w-16 h-16 text-red-300 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Camera Error</h3>
                        <p className="text-red-200">{errorMessage}</p>
                    </div>
                )}

                {status === 'streaming' && (
                    <div className="absolute inset-0 pointer-events-none">
                        {detectedObjects.map(obj => (
                             <BoundingBox key={obj.id} object={obj} videoRect={videoRef.current?.getBoundingClientRect() || null} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WebcamPage;
