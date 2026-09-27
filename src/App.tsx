import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { CameraViewfinder } from './components/CameraViewfinder.tsx';
import { ARViewfinderOverlay } from './components/ARViewfinderOverlay.tsx';
import { ARNarratorPlayer } from './components/ARNarratorPlayer.tsx';
import { HistoryTimelineDrawer } from './components/HistoryTimelineDrawer.tsx';
import { TourGuideChat } from './components/TourGuideChat.tsx';
import { TravelJournalModal } from './components/TravelJournalModal.tsx';
import { ShareStampModal } from './components/ShareStampModal.tsx';
import { SharedStampBanner } from './components/SharedStampBanner.tsx';
import {
  ARLensMode,
  ARScene,
  GroundingMetadata,
  LandmarkHistoryData,
  PresetLandmark,
  RecognizedLandmark,
  TravelStamp,
} from './types.ts';
import {
  convertImageUrlToBase64,
  fetchLandmarkHistory,
  fetchSharedStamp,
  recognizeLandmark,
} from './services/api.ts';
import { AlertCircle, Camera, Sparkles } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'urbanlens_travel_stamps_v1';

export default function App() {
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [recognizedLandmark, setRecognizedLandmark] = useState<RecognizedLandmark | null>(null);
  const [historyData, setHistoryData] = useState<LandmarkHistoryData | null>(null);
  const [grounding, setGrounding] = useState<GroundingMetadata | null>(null);
  const [cachedAudioUrl, setCachedAudioUrl] = useState<string | undefined>(undefined);

  const [currentLens, setCurrentLens] = useState<ARLensMode>('normal');
  const [activeScene, setActiveScene] = useState<ARScene | null>(null);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Journal Stamping State
  const [journalStamps, setJournalStamps] = useState<TravelStamp[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isJournalOpen, setIsJournalOpen] = useState<boolean>(false);

  // Sharing State
  const [sharingStamp, setSharingStamp] = useState<TravelStamp | null>(null);
  const [sharedIncomingStamp, setSharedIncomingStamp] = useState<
    (TravelStamp & { shareId?: string; sharedAt?: string }) | null
  >(null);

  // Check URL query params for incoming shared stamp link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stampId = params.get('stamp');
    if (stampId) {
      fetchSharedStamp(stampId)
        .then((stamp) => {
          setSharedIncomingStamp(stamp);
        })
        .catch((err) => {
          console.warn('Failed to load shared stamp from link:', err);
        });
    }
  }, []);

  // Save to LocalStorage on stamp update
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(journalStamps));
    } catch (e) {
      console.warn('Could not save travel stamps:', e);
    }
  }, [journalStamps]);

  // Main Scan Pipeline: Image -> Gemini 3.1 Pro -> Gemini 3.5 Flash Search Grounding
  const handleAnalyzePhoto = async (base64Image: string, cityHint?: string) => {
    setIsScanning(true);
    setErrorMessage(null);
    setActivePhoto(base64Image);
    setRecognizedLandmark(null);
    setHistoryData(null);
    setGrounding(null);
    setCachedAudioUrl(undefined);
    setCurrentLens('normal');

    try {
      // Step 1: Image Understanding via Gemini 3.1 Pro
      setScanStep('Analyzing architectural geometry with Gemini 3.1 Pro...');
      const landmark = await recognizeLandmark(base64Image, 'image/jpeg', cityHint);
      setRecognizedLandmark(landmark);

      // Step 2: Search Grounding via Gemini 3.5 Flash
      setScanStep(
        `Grounding history & secret archives via Google Search with Gemini 3.5 Flash for ${landmark.name}...`
      );
      const historyResult = await fetchLandmarkHistory(
        landmark.name,
        landmark.city,
        landmark.country
      );
      setHistoryData(historyResult.data);
      setGrounding(historyResult.grounding);

      // Pre-set lens from first scene if available
      if (historyResult.data.arNarration?.scenes?.[0]?.recommendedLens) {
        setCurrentLens(historyResult.data.arNarration.scenes[0].recommendedLens);
      }
    } catch (err: any) {
      console.error('Pipeline error:', err);
      setErrorMessage(
        err.message ||
          'Failed to complete landmark analysis. Please ensure your API key is configured.'
      );
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  // Preset Selection Flow
  const handleSelectPreset = async (preset: PresetLandmark) => {
    setIsScanning(true);
    setScanStep(`Fetching high-resolution view of ${preset.name}...`);
    setErrorMessage(null);

    try {
      const { base64 } = await convertImageUrlToBase64(preset.imageUrl);
      await handleAnalyzePhoto(base64, preset.cityHint);
    } catch (err: any) {
      console.error('Preset loading error:', err);
      setErrorMessage(err.message || 'Failed to load preset tour image.');
      setIsScanning(false);
    }
  };

  // Stamp in Journal
  const handleStampJournal = () => {
    if (!recognizedLandmark || !activePhoto) return;

    const existingIndex = journalStamps.findIndex((s) => s.name === recognizedLandmark.name);
    if (existingIndex >= 0) return; // already stamped

    const newStamp: TravelStamp = {
      id: Date.now().toString(),
      name: recognizedLandmark.name,
      city: recognizedLandmark.city,
      country: recognizedLandmark.country,
      timestamp: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      photoUrl: activePhoto,
      summary: recognizedLandmark.summary,
      architecturalStyle: recognizedLandmark.architecturalStyle,
      builtYear: recognizedLandmark.builtYear,
      audioUrl: cachedAudioUrl,
      tags: recognizedLandmark.tags,
    };

    setJournalStamps((prev) => [newStamp, ...prev]);
  };

  const handleDeleteStamp = (id: string) => {
    setJournalStamps((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearAllStamps = () => {
    if (window.confirm('Clear all passport souvenir stamps?')) {
      setJournalStamps([]);
    }
  };

  // Load stamp back into active view
  const handleSelectStamp = (stamp: TravelStamp) => {
    setActivePhoto(stamp.photoUrl);
    // Trigger analysis or mock view
    handleAnalyzePhoto(stamp.photoUrl, `${stamp.city}, ${stamp.country}`);
  };

  // Experience an incoming shared stamp directly in AR
  const handleExperienceSharedStampInAR = () => {
    if (!sharedIncomingStamp) return;
    setActivePhoto(sharedIncomingStamp.photoUrl);
    if (sharedIncomingStamp.audioUrl) {
      setCachedAudioUrl(sharedIncomingStamp.audioUrl);
    }
    handleAnalyzePhoto(
      sharedIncomingStamp.photoUrl,
      `${sharedIncomingStamp.city}, ${sharedIncomingStamp.country}`
    );
  };

  // Save incoming shared stamp directly into local passport journal
  const handleSaveSharedStampToJournal = () => {
    if (!sharedIncomingStamp) return;
    const exists = journalStamps.some((s) => s.name === sharedIncomingStamp.name);
    if (!exists) {
      const newStamp: TravelStamp = {
        id: Date.now().toString(),
        name: sharedIncomingStamp.name,
        city: sharedIncomingStamp.city,
        country: sharedIncomingStamp.country,
        timestamp: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        photoUrl: sharedIncomingStamp.photoUrl,
        summary: sharedIncomingStamp.summary,
        architecturalStyle: sharedIncomingStamp.architecturalStyle,
        builtYear: sharedIncomingStamp.builtYear,
        audioUrl: sharedIncomingStamp.audioUrl,
        tags: sharedIncomingStamp.tags,
      };
      setJournalStamps((prev) => [newStamp, ...prev]);
    }
  };

  // Reset to viewfinder
  const handleReset = () => {
    setActivePhoto(null);
    setRecognizedLandmark(null);
    setHistoryData(null);
    setGrounding(null);
    setCachedAudioUrl(undefined);
    setErrorMessage(null);
    setSharedIncomingStamp(null);
  };

  const isSavedInJournal = Boolean(
    recognizedLandmark && journalStamps.some((s) => s.name === recognizedLandmark.name)
  );

  const isSharedStampInJournal = Boolean(
    sharedIncomingStamp && journalStamps.some((s) => s.name === sharedIncomingStamp.name)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Header
        onOpenJournal={() => setIsJournalOpen(true)}
        journalCount={journalStamps.length}
        onReset={handleReset}
        hasActiveLandmark={Boolean(recognizedLandmark)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Incoming Shared Stamp Banner (from public link) */}
        {sharedIncomingStamp && !recognizedLandmark && (
          <SharedStampBanner
            sharedStamp={sharedIncomingStamp}
            onExperienceInAR={handleExperienceSharedStampInAR}
            onSaveToMyJournal={handleSaveSharedStampToJournal}
            isSavedInJournal={isSharedStampInJournal}
            onDismiss={() => setSharedIncomingStamp(null)}
          />
        )}

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="w-full max-w-3xl mx-auto p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-sm flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-rose-300 mb-0.5">Recognition Issue</h4>
              <p className="text-xs text-rose-200/90 leading-relaxed">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-400 hover:text-rose-200 px-2 py-1 rounded bg-rose-900/40"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* State 1: Camera Viewfinder (Capture / Upload / Presets) */}
        {!recognizedLandmark && (
          <CameraViewfinder
            onCaptureImage={handleAnalyzePhoto}
            onSelectPreset={handleSelectPreset}
            isScanning={isScanning}
            scanStep={scanStep}
          />
        )}

        {/* State 2: Active Landmark AR Tour Experience */}
        {recognizedLandmark && activePhoto && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Top AR Viewfinder Lens Screen */}
            <div className="w-full">
              <ARViewfinderOverlay
                imageUrl={activePhoto}
                landmark={recognizedLandmark}
                currentLens={currentLens}
                onChangeLens={setCurrentLens}
                highlightedFocalLabel={activeScene?.targetFocalLabel}
                onSaveToJournal={handleStampJournal}
                isSavedInJournal={isSavedInJournal}
              />
            </div>

            {/* Synchronized AR Narrator Player */}
            {historyData && (
              <ARNarratorPlayer
                historyData={historyData}
                onSceneChange={setActiveScene}
                onLensChange={setCurrentLens}
                cachedAudioUrl={cachedAudioUrl}
                onAudioGenerated={setCachedAudioUrl}
              />
            )}

            {/* Bottom 2-Column Grid: Deep History Chronicle + Live Q&A */}
            {historyData && grounding && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <HistoryTimelineDrawer
                    historyData={historyData}
                    grounding={grounding}
                  />
                </div>
                <div className="lg:col-span-1">
                  <TourGuideChat
                    landmarkName={recognizedLandmark.name}
                    city={recognizedLandmark.city}
                    country={recognizedLandmark.country}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Travel Passport Journal Modal */}
      <TravelJournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        stamps={journalStamps}
        onDeleteStamp={handleDeleteStamp}
        onClearAll={handleClearAllStamps}
        onSelectStamp={handleSelectStamp}
        onShareStamp={(stamp) => setSharingStamp(stamp)}
      />

      {/* Share Stamp Modal */}
      <ShareStampModal
        stamp={sharingStamp}
        isOpen={Boolean(sharingStamp)}
        onClose={() => setSharingStamp(null)}
      />
    </div>
  );
}
