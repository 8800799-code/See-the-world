import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  Sliders,
  ChevronRight,
  Headphones,
  Check,
  RefreshCw,
} from 'lucide-react';
import { ARLensMode, ARScene, LandmarkHistoryData } from '../types.ts';
import { generateNarrationTts } from '../services/api.ts';

interface ARNarratorPlayerProps {
  historyData: LandmarkHistoryData;
  onSceneChange: (scene: ARScene) => void;
  onLensChange: (lens: ARLensMode) => void;
  cachedAudioUrl?: string;
  onAudioGenerated: (audioUrl: string) => void;
}

const VOICES = [
  { id: 'Kore', name: 'Kore', label: 'Eloquent Historian (Balanced)', desc: 'Refined, articulate documentary tone' },
  { id: 'Puck', name: 'Puck', label: 'Adventurous Explorer (Energetic)', desc: 'Bright, enthusiastic traveler vibe' },
  { id: 'Fenrir', name: 'Fenrir', label: 'Epic Chronicler (Deep)', desc: 'Resonant, cinematic historical gravitas' },
  { id: 'Zephyr', name: 'Zephyr', label: 'Serene Guide (Soft)', desc: 'Warm, calm, ambient architectural pace' },
  { id: 'Charon', name: 'Charon', label: 'Antiquities Master (Classic)', desc: 'Scholarly, dramatic classical cadence' },
];

export const ARNarratorPlayer: React.FC<ARNarratorPlayerProps> = ({
  historyData,
  onSceneChange,
  onLensChange,
  cachedAudioUrl,
  onAudioGenerated,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string>(cachedAudioUrl || '');
  const [isGeneratingTts, setIsGeneratingTts] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [audioError, setAudioError] = useState<string | null>(null);

  const scenes = historyData.arNarration?.scenes || [];
  const fullScript = historyData.arNarration?.fullScript || '';
  const currentScene = scenes[currentSceneIndex] || scenes[0];

  // Auto-generate TTS on first mount if not cached
  useEffect(() => {
    if (!audioUrl && fullScript) {
      handleGenerateTts(selectedVoice);
    }
  }, [fullScript]);

  // Sync scene and lens whenever currentSceneIndex updates
  useEffect(() => {
    if (scenes[currentSceneIndex]) {
      const active = scenes[currentSceneIndex];
      onSceneChange(active);
      if (active.recommendedLens) {
        onLensChange(active.recommendedLens);
      }
    }
  }, [currentSceneIndex]);

  // Track playback time and advance scenes proportionally
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;
    setCurrentTime(cur);

    if (dur > 0 && scenes.length > 0) {
      const progress = cur / dur;
      const targetIndex = Math.min(
        scenes.length - 1,
        Math.floor(progress * scenes.length)
      );
      if (targetIndex !== currentSceneIndex) {
        setCurrentSceneIndex(targetIndex);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentSceneIndex(0);
  };

  // Generate or Regenerate TTS with gemini-3.8-flash-tts
  const handleGenerateTts = async (voiceName: string) => {
    if (!fullScript) return;
    setIsGeneratingTts(true);
    setAudioError(null);
    try {
      const res = await generateNarrationTts(
        fullScript,
        voiceName,
        'Captivating, cinematic historic documentary narrator with dramatic pauses and warm engaging enthusiasm'
      );
      setAudioUrl(res.audioUrl);
      onAudioGenerated(res.audioUrl);
      setIsPlaying(false);
      setCurrentTime(0);
    } catch (err: any) {
      console.error('Failed to generate narration audio:', err);
      setAudioError(err.message || 'TTS generation failed. You can still read the synchronized script.');
    } finally {
      setIsGeneratingTts(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => {
        console.warn('Playback blocked:', err);
      });
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setCurrentSceneIndex(0);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-cyan-500/30 p-4 sm:p-6 shadow-xl flex flex-col gap-4">
      {/* Hidden Audio Player */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          muted={isMuted}
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md shadow-purple-500/10">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-slate-100">
                {historyData.arNarration?.headline || 'AR Cinematic Tour Clip'}
              </h3>
              <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                Gemini 3.8 Flash TTS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Synchronized historic voiceover with dynamic AR lens shifts
            </p>
          </div>
        </div>

        {/* Voice Selector Dropdown */}
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-purple-400 shrink-0 hidden sm:block" />
          <select
            value={selectedVoice}
            onChange={(e) => {
              const voice = e.target.value;
              setSelectedVoice(voice);
              handleGenerateTts(voice);
            }}
            disabled={isGeneratingTts}
            className="bg-slate-950 border border-slate-700 hover:border-purple-500/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition disabled:opacity-50"
          >
            {VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Active AR Scene Banner */}
      {currentScene && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-950/70 via-slate-950/90 to-purple-950/70 border border-cyan-500/30 p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono-tech text-cyan-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-bold uppercase tracking-wider">
                SCENE {currentSceneIndex + 1} OF {scenes.length}: {currentScene.title}
              </span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900/90 text-purple-300 border border-purple-500/30">
              LENS: {currentScene.recommendedLens.toUpperCase()}
            </span>
          </div>

          {/* Telemetry Fact Overlay */}
          <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-cyan-500/20 text-xs font-mono-tech text-cyan-300 flex items-center justify-between gap-2">
            <span className="truncate">{currentScene.telemetryFact}</span>
            {currentScene.targetFocalLabel && (
              <span className="shrink-0 text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                FOCUS: {currentScene.targetFocalLabel}
              </span>
            )}
          </div>

          {/* Spoken Narration Subtitle */}
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans italic border-l-2 border-cyan-400 pl-3 py-0.5">
            &ldquo;{currentScene.narrationSegment}&rdquo;
          </p>
        </div>
      )}

      {/* Audio Wave Visualizer Simulation */}
      <div className="flex items-center justify-center gap-1 h-8 px-4 bg-slate-950/80 rounded-xl border border-slate-800">
        {Array.from({ length: 36 }).map((_, i) => {
          // Dynamic height when playing
          const barHeight = isPlaying
            ? Math.max(15, Math.sin(i * 0.4 + currentTime * 8) * 80 + 35)
            : 20;

          return (
            <div
              key={i}
              style={{ height: `${barHeight}%` }}
              className={`w-1 rounded-full transition-all duration-75 ${
                isPlaying ? 'bg-gradient-to-t from-cyan-500 to-purple-400' : 'bg-slate-800'
              }`}
            />
          );
        })}
      </div>

      {/* Player Controls Bar */}
      <div className="flex flex-col gap-2">
        {/* Scrubber Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono-tech text-slate-400 w-10">
            {formatSeconds(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            disabled={!audioUrl || isGeneratingTts}
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer disabled:opacity-40"
          />
          <span className="text-[11px] font-mono-tech text-slate-400 w-10 text-right">
            {formatSeconds(duration)}
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              disabled={isGeneratingTts || !audioUrl}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition transform active:scale-95 disabled:opacity-50"
            >
              {isGeneratingTts ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Voice...</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Clip</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play AR Narration</span>
                </>
              )}
            </button>

            {/* Replay */}
            <button
              onClick={handleReplay}
              disabled={!audioUrl}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition disabled:opacity-40"
              title="Replay from Beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Mute */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              disabled={!audioUrl}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition disabled:opacity-40"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Scene Jump Pills */}
          <div className="hidden md:flex items-center gap-1.5">
            {scenes.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => {
                  setCurrentSceneIndex(idx);
                  if (audioRef.current && duration > 0) {
                    audioRef.current.currentTime = (idx / scenes.length) * duration;
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono-tech transition ${
                  currentSceneIndex === idx
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Beat {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {audioError && (
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs">
          {audioError}
        </div>
      )}
    </div>
  );
};
