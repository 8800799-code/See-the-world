import React, { useState } from 'react';
import {
  Eye,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Compass,
  MapPin,
  Calendar,
  Building2,
  ShieldCheck,
  Zap,
  Info,
  X,
} from 'lucide-react';
import { ARLensMode, LandmarkFocalPoint, RecognizedLandmark } from '../types.ts';

interface ARViewfinderOverlayProps {
  imageUrl: string;
  landmark: RecognizedLandmark;
  currentLens: ARLensMode;
  onChangeLens: (lens: ARLensMode) => void;
  highlightedFocalLabel?: string;
  onSaveToJournal: () => void;
  isSavedInJournal: boolean;
}

export const ARViewfinderOverlay: React.FC<ARViewfinderOverlayProps> = ({
  imageUrl,
  landmark,
  currentLens,
  onChangeLens,
  highlightedFocalLabel,
  onSaveToJournal,
  isSavedInJournal,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<LandmarkFocalPoint | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showTelemetry, setShowTelemetry] = useState<boolean>(true);

  // Determine active highlighted point from narration or user click
  const activeFocal =
    selectedPoint ||
    (highlightedFocalLabel
      ? landmark.keyFocalPoints.find(
          (fp) =>
            fp.label.toLowerCase().includes(highlightedFocalLabel.toLowerCase()) ||
            highlightedFocalLabel.toLowerCase().includes(fp.label.toLowerCase())
        )
      : null);

  // CSS Filter styles for each AR Lens
  const getLensFilterClass = () => {
    switch (currentLens) {
      case 'blueprint':
        return 'contrast-125 saturate-50 hue-rotate-180 brightness-90 filter drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]';
      case 'xray':
        return 'invert contrast-150 saturate-0 brightness-110 hue-rotate-90';
      case 'hologram':
        return 'hue-rotate-60 contrast-125 saturate-150 brightness-105';
      case 'normal':
      default:
        return 'brightness-100 contrast-105';
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 border-2 border-cyan-500/40 shadow-2xl shadow-cyan-950/60 transition-all select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none border-none'
          : 'aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9]'
      }`}
    >
      {/* Base Landmark Image */}
      <img
        src={imageUrl}
        alt={landmark.name}
        className={`w-full h-full object-cover transition-all duration-700 ${getLensFilterClass()}`}
      />

      {/* AR Lens Overlay Layers */}
      {/* 1. Blueprint Grid Layer */}
      {currentLens === 'blueprint' && (
        <div className="absolute inset-0 bg-blue-950/40 pointer-events-none ar-grid-overlay mix-blend-screen">
          <div className="absolute top-4 left-4 text-[10px] font-mono-tech text-blue-300 bg-blue-950/80 px-2.5 py-1 rounded border border-blue-500/40">
            [ARCHITECTURAL BLUEPRINT GRID // SCALE 1:500 // STRUCTURAL MATRIX]
          </div>
        </div>
      )}

      {/* 2. X-Ray Layer */}
      {currentLens === 'xray' && (
        <div className="absolute inset-0 bg-emerald-950/30 pointer-events-none mix-blend-color-dodge">
          <div className="absolute inset-0 ar-scanline opacity-60" />
          <div className="absolute top-4 left-4 text-[10px] font-mono-tech text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/40">
            [X-RAY DENSITY SPECTROMETRY // IRON & MASONRY SCAN]
          </div>
        </div>
      )}

      {/* 3. Cyber Hologram Layer */}
      {currentLens === 'hologram' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/30 via-transparent to-purple-900/30 mix-blend-overlay" />
          <div className="absolute inset-0 ar-scanline opacity-80" />
          <div className="absolute top-4 left-4 text-[10px] font-mono-tech text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-500/40">
            [CYBER-HOLO AR STREAM // 24000Hz SPECTRAL NARRATION SYNC]
          </div>
        </div>
      )}

      {/* 4. Global AR HUD Elements */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-20">
        {/* Top HUD Telemetry Bar */}
        <div className="flex items-center justify-between gap-2 pointer-events-auto">
          {/* Landmark Badge */}
          <div className="flex items-center gap-3 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/40 shadow-lg">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm sm:text-base text-slate-100 tracking-tight">
                  {landmark.name}
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-mono-tech font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <ShieldCheck className="w-3 h-3" />
                  {landmark.confidence}% MATCH
                </span>
              </div>
              <p className="text-[11px] text-cyan-400/90 font-mono-tech flex items-center gap-2">
                <span>{landmark.city}, {landmark.country}</span>
                <span>•</span>
                <span>{landmark.builtYear}</span>
              </p>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTelemetry(!showTelemetry)}
              className="p-2 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-cyan-300 border border-cyan-500/30 transition backdrop-blur-sm"
              title="Toggle HUD Telemetry"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-cyan-300 border border-cyan-500/30 transition backdrop-blur-sm"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen AR'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Center Reticle Crosshair Guides */}
        <div className="relative self-center w-full h-full pointer-events-none flex items-center justify-center opacity-40">
          <div className="w-12 h-12 border border-cyan-400/40 rounded-full" />
          <div className="absolute w-24 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          <div className="absolute h-24 w-0.5 bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent" />
        </div>

        {/* Bottom AR Controls & Lens Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto">
          {/* Lens Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 shadow-lg">
            <span className="text-[11px] font-mono-tech text-slate-400 px-2 hidden sm:inline">
              AR LENS:
            </span>
            <button
              onClick={() => onChangeLens('normal')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                currentLens === 'normal'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm shadow-cyan-500/30'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-900/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Natural</span>
            </button>

            <button
              onClick={() => onChangeLens('blueprint')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                currentLens === 'blueprint'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/30'
                  : 'text-slate-300 hover:text-blue-300 hover:bg-slate-900/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Blueprint</span>
            </button>

            <button
              onClick={() => onChangeLens('xray')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                currentLens === 'xray'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/30'
                  : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-900/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>X-Ray</span>
            </button>

            <button
              onClick={() => onChangeLens('hologram')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                currentLens === 'hologram'
                  ? 'bg-purple-600 text-white font-semibold shadow-sm shadow-purple-500/30'
                  : 'text-slate-300 hover:text-purple-300 hover:bg-slate-900/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hologram</span>
            </button>
          </div>

          {/* Collect Stamp Button */}
          <button
            onClick={onSaveToJournal}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold backdrop-blur-md transition shadow-lg ${
              isSavedInJournal
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSavedInJournal ? 'Stamped in Journal' : 'Stamp Travel Journal'}</span>
          </button>
        </div>
      </div>

      {/* Floating Interactive AR Anchor Pins */}
      {landmark.keyFocalPoints.map((fp) => {
        const isHighlighted =
          activeFocal?.id === fp.id ||
          (highlightedFocalLabel &&
            fp.label.toLowerCase().includes(highlightedFocalLabel.toLowerCase()));

        return (
          <div
            key={fp.id}
            style={{ left: `${fp.x}%`, top: `${fp.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 group"
          >
            {/* Pulsing Beacon Ring */}
            <div
              className={`absolute -inset-2.5 rounded-full pointer-events-none transition-all ${
                isHighlighted
                  ? 'bg-cyan-400/40 animate-beacon'
                  : 'bg-cyan-500/20 group-hover:animate-ping'
              }`}
            />

            {/* Core Pin Anchor */}
            <button
              onClick={() => setSelectedPoint(selectedPoint?.id === fp.id ? null : fp)}
              className={`relative flex items-center justify-center rounded-full transition-all transform focus:outline-none ${
                isHighlighted
                  ? 'w-7 h-7 bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/60 scale-125'
                  : 'w-5 h-5 bg-slate-950/90 text-cyan-400 border border-cyan-400/80 hover:scale-125'
              }`}
              title={fp.label}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isHighlighted ? 'bg-slate-950 animate-pulse' : 'bg-cyan-400'
                }`}
              />
            </button>

            {/* Pin Tag Bubble */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 top-7 pointer-events-none transition-all duration-300 whitespace-nowrap ${
                isHighlighted
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 -translate-y-1 scale-95 group-hover:opacity-100 group-hover:translate-y-0'
              }`}
            >
              <div className="px-2.5 py-1 rounded-md bg-slate-950/95 border border-cyan-400/60 text-[11px] font-mono-tech text-cyan-300 shadow-xl flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>{fp.label}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Selected Focal Point Architectural Info Card */}
      {selectedPoint && (
        <div className="absolute bottom-16 sm:bottom-20 left-4 sm:left-6 z-40 max-w-xs sm:max-w-sm bg-slate-950/95 backdrop-blur-md rounded-xl p-3.5 border border-cyan-400/60 shadow-2xl shadow-cyan-950/80 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-cyan-400 font-mono-tech text-[10px] uppercase font-bold tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>AR ARCHITECTURAL FOCUS</span>
            </div>
            <button
              onClick={() => setSelectedPoint(null)}
              className="text-slate-400 hover:text-slate-200 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-sm font-bold text-slate-100 mb-1">{selectedPoint.label}</h4>
          <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
            {selectedPoint.description}
          </p>

          <div className="flex items-center justify-between text-[10px] font-mono-tech text-cyan-400/80 pt-2 border-t border-slate-800">
            <span>GRID LOC: X:{selectedPoint.x}% Y:{selectedPoint.y}%</span>
            <span>TAG: #{landmark.architecturalStyle.split(' ')[0]}</span>
          </div>
        </div>
      )}
    </div>
  );
};
