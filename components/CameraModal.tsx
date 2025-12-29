
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CameraIcon, RotateCcwIcon, XIcon } from './icons';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

type CameraFacingMode = 'user' | 'environment';
interface CameraState {
    status: 'idle' | 'initializing' | 'streaming' | 'error';
    facingMode: CameraFacingMode;
    error: string | null;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>({
    status: 'idle',
    facingMode: 'user',
    error: null,
  });

  const stopStream = useCallback(() => {
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
      if (!isOpen) return;

      setCameraState(prev => ({ ...prev, status: 'initializing', error: null }));
      stopStream();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: cameraState.facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onplaying = () => {
            setCameraState(prev => ({ ...prev, status: 'streaming' }));
          };
        } else {
            throw new Error("Video element is not available.");
        }
      } catch (err) {
        let message = "Could not access the camera. Please check permissions.";
        if (err instanceof DOMException) {
          switch (err.name) {
            case 'NotAllowedError':
              message = "Camera access was denied. Please allow access in your browser settings.";
              break;
            case 'NotFoundError':
            case 'OverconstrainedError':
              message = `The ${cameraState.facingMode === 'user' ? 'front' : 'back'} camera was not found.`;
              break;
            case 'NotReadableError':
               message = "The camera is already in use by another application.";
               break;
            default:
              message = `An unexpected error occurred: ${err.name}`;
          }
        }
        setCameraState(prev => ({...prev, status: 'error', error: message }));
        stopStream();
      }
    };

    startStream();

    return () => {
      stopStream();
      setCameraState(prev => ({...prev, status: 'idle' }));
    };
  }, [isOpen, cameraState.facingMode, stopStream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && cameraState.status === 'streaming') {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        if (cameraState.facingMode === 'user') {
            context.translate(video.videoWidth, 0);
            context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  };

  const handleSwitchCamera = () => {
    setCameraState(prev => ({
        ...prev,
        facingMode: prev.facingMode === 'user' ? 'environment' : 'user',
    }));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 ui-blur-effect flex items-center justify-center z-50 animate-fade-in-up" onClick={onClose}>
      <div 
        className="bg-horizon-sidebar/70 dark:bg-horizon-dark/70 ui-blur-effect border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl flex flex-col gap-4 animate-scale-in-pop" 
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-horizon-light-text-primary dark:text-horizon-text-primary">Live Camera</h2>
            <button onClick={onClose} className="p-1.5 rounded-full text-horizon-text-tertiary hover:bg-white/10">
                <XIcon className="w-5 h-5" />
            </button>
        </header>
        
        <div className="relative aspect-video bg-black/30 rounded-lg overflow-hidden flex items-center justify-center border border-white/5 shadow-inner">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-500 ${cameraState.status === 'streaming' ? 'opacity-100' : 'opacity-0'} ${cameraState.facingMode === 'user' ? 'transform scale-x-[-1]' : ''}`}
          />
          <canvas ref={canvasRef} className="hidden"></canvas>
          
          {cameraState.status !== 'streaming' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                {cameraState.status === 'initializing' && (
                  <>
                    <div className="w-10 h-10 border-4 border-t-transparent border-horizon-accent rounded-full animate-spin"></div>
                    <p className="mt-4 text-white/80 font-semibold">Starting camera...</p>
                  </>
                )}
                 {cameraState.status === 'error' && (
                  <div className="text-red-300">
                    <p className="font-bold text-lg">Camera Error</p>
                    <p className="text-sm mt-1">{cameraState.error}</p>
                  </div>
                )}
            </div>
          )}
        </div>

        <div className="flex justify-center items-center space-x-6 mt-2">
          <button 
            onClick={onClose} 
            className="px-6 py-3 bg-white/10 text-white/80 rounded-full hover:bg-white/20 font-semibold transition-colors"
          >
            Cancel
          </button>
           <button 
            onClick={handleCapture}
            disabled={cameraState.status !== 'streaming'}
            className="w-20 h-20 bg-white rounded-full border-4 border-white/30 hover:border-horizon-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center"
            title="Capture photo"
          >
            <div className="w-16 h-16 bg-white rounded-full animate-pulse-glow [animation-duration:3s]"></div>
          </button>
           <button 
            onClick={handleSwitchCamera} 
            disabled={cameraState.status === 'initializing'}
            className="p-4 bg-white/10 text-white/80 rounded-full hover:bg-white/20 font-semibold transition-colors disabled:opacity-50"
            title="Switch camera"
          >
            <RotateCcwIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;