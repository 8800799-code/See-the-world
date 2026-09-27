import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Sparkles, Navigation, Globe, CheckCircle2, Crosshair, AlertCircle } from 'lucide-react';
import { PRESET_LANDMARKS } from '../data/presetLandmarks.ts';
import { PresetLandmark } from '../types.ts';

interface CameraViewfinderProps {
  onCaptureImage: (base64: string, cityHint?: string) => void;
  onSelectPreset: (preset: PresetLandmark) => void;
  isScanning: boolean;
  scanStep: string;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({
  onCaptureImage,
  onSelectPreset,
  isScanning,
  scanStep,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cityHint, setCityHint] = useState<string>('');
  const [shutterFlash, setShutterFlash] = useState<boolean>(false);

  // Play subtle camera shutter sound via Web Audio API
  const playShutterSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.09);
    } catch {
      // AudioContext not allowed or not supported
    }
  };

  // Start Camera Stream
  const startCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    setCameraError(null);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access or use photo upload / preset tours.'
          : 'Unable to start camera stream. You can still upload photos or choose a preset city landmark.'
      );
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Flip Camera
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (cameraActive) {
      startCamera(nextFacing);
    }
  };

  // Capture Snapshot from Video
  const handleSnapPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    playShutterSound();
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      stopCamera();
      onCaptureImage(dataUrl, cityHint);
    }
  };

  // Handle Local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      stopCamera();
      onCaptureImage(dataUrl, cityHint);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Viewfinder Box */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 border-2 border-cyan-500/30 shadow-2xl shadow-cyan-950/50 flex flex-col items-center justify-center">
        {/* Shutter Flash Animation */}
        {shutterFlash && (
          <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-200 pointer-events-none" />
        )}

        {/* Live Camera Video Feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            cameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Placeholder / Upload Fallback when Camera is Off */}
        {!cameraActive && (
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-900/90 ar-grid-overlay">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center mb-4 text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Camera className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
            </div>

            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-100 mb-2">
              Ready to Explore City Landmarks
            </h2>
            <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
              Activate your camera to point at any monument, upload a photo from your travels, or select an iconic city below to experience the AR tour!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => startCamera()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Camera className="w-4 h-4" />
                <span>Launch Live Camera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-sm font-medium transition shadow-md hover:border-cyan-400/60"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Landmark Photo</span>
              </button>
            </div>

            {cameraError && (
              <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-950/50 border border-amber-500/40 text-amber-300 text-xs max-w-md">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>
        )}

        {/* Live HUD Framing Overlay when Camera is active */}
        {cameraActive && (
          <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6 select-none">
            {/* Top Telemetry */}
            <div className="flex items-center justify-between text-xs font-mono-tech text-cyan-400 bg-slate-950/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-cyan-500/30 w-full">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-emerald-400">AR RETICLE ACTIVE</span>
              </div>
              <div className="flex items-center gap-4 hidden sm:flex">
                <span>LAT: 48°51&apos;29&quot;N</span>
                <span>LON: 02°17&apos;40&quot;E</span>
                <span>ALT: 34M</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span>REC READY</span>
              </div>
            </div>

            {/* Center Reticle Brackets */}
            <div className="relative self-center w-48 h-48 sm:w-64 sm:h-64 border-2 border-cyan-400/40 rounded-3xl flex items-center justify-center">
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

              {/* Center Crosshair */}
              <div className="w-6 h-0.5 bg-cyan-400/60" />
              <div className="h-6 w-0.5 bg-cyan-400/60 absolute" />
              <div className="w-20 h-20 rounded-full border border-cyan-400/20 animate-pulse absolute" />

              <span className="absolute -bottom-7 text-[11px] font-mono-tech tracking-wider text-cyan-300 bg-slate-950/70 px-2 py-0.5 rounded border border-cyan-500/20">
                ALIGN LANDMARK HERE
              </span>
            </div>

            {/* Bottom Camera Controls Bar */}
            <div className="pointer-events-auto flex items-center justify-between w-full">
              <button
                onClick={toggleCameraFacing}
                className="w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shadow-lg transition backdrop-blur-sm"
                title="Flip Camera"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* Shutter Button */}
              <button
                onClick={handleSnapPhoto}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-cyan-500 hover:bg-cyan-400 p-1.5 shadow-xl shadow-cyan-500/40 transition-transform active:scale-95 group focus:outline-none"
                title="Capture Landmark Photo"
              >
                <div className="w-full h-full rounded-full border-2 border-slate-950 flex items-center justify-center bg-white group-hover:scale-105 transition-transform">
                  <div className="w-12 h-12 rounded-full bg-cyan-500 group-hover:bg-cyan-600 transition-colors flex items-center justify-center">
                    <Camera className="w-6 h-6 text-slate-950" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shadow-lg transition backdrop-blur-sm"
                title="Upload Photo Instead"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Fullscreen Scanning Animation Overlay */}
        {isScanning && (
          <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none">
            {/* Holographic Radar Scanner */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full border-2 border-cyan-500/40 flex items-center justify-center mb-6 overflow-hidden">
              <div className="absolute inset-0 rounded-full border border-cyan-400/20" />
              <div className="absolute w-28 h-28 rounded-full border border-cyan-400/30" />
              <div className="absolute w-14 h-14 rounded-full border border-cyan-400/40" />

              {/* Rotating Sweep Beam */}
              <div
                className="absolute inset-0 animate-radar origin-center"
                style={{
                  background:
                    'conic-gradient(from 0deg at 50% 50%, rgba(6, 182, 212, 0.4) 0deg, rgba(6, 182, 212, 0.1) 45deg, transparent 90deg)',
                }}
              />

              <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse relative z-10" />
            </div>

            <div className="text-center max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono-tech mb-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>AI ANALYSIS IN PROGRESS</span>
              </div>
              <h3 className="text-lg sm:text-xl font-display font-bold text-slate-100 mb-2">
                Scanning Landmark Architecture
              </h3>
              <p className="text-xs sm:text-sm text-cyan-400/90 font-mono-tech transition-all">
                {scanStep || 'Initializing Gemini multi-modal pipeline...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* City Hint Input Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-cyan-500/20">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-medium shrink-0">
          <Navigation className="w-4 h-4" />
          <span>City Location Hint (Optional):</span>
        </div>
        <div className="relative w-full">
          <input
            type="text"
            value={cityHint}
            onChange={(e) => setCityHint(e.target.value)}
            placeholder="e.g. Paris, France or Rome, Italy (helps pinpoint landmark)"
            className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>
      </div>

      {/* Preset Landmark Tours Carousel */}
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Or Explore Iconic World Landmarks Instantly:</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:block">Click any city to test</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PRESET_LANDMARKS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              disabled={isScanning}
              className="group relative flex flex-col rounded-xl overflow-hidden bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 text-left transition-all duration-300 hover:shadow-lg hover:shadow-cyan-950/40 hover:-translate-y-1 focus:outline-none disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-950">
                <img
                  src={preset.thumbnailUrl}
                  alt={preset.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <span className="absolute top-1.5 right-1.5 text-[10px] font-mono-tech px-1.5 py-0.5 rounded bg-slate-950/80 text-cyan-300 border border-cyan-500/30">
                  {preset.year}
                </span>
              </div>
              <div className="p-2.5 flex flex-col gap-0.5">
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                  {preset.name}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {preset.city}, {preset.country}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
