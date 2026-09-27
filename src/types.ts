export interface LandmarkFocalPoint {
  id: string;
  label: string;
  description: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
}

export interface RecognizedLandmark {
  name: string;
  alternateNames?: string[];
  city: string;
  country: string;
  confidence: number;
  architecturalStyle: string;
  builtYear: string;
  architect?: string;
  summary: string;
  estimatedCoordinates?: {
    latitude: number;
    longitude: number;
  };
  keyFocalPoints: LandmarkFocalPoint[];
  tags: string[];
}

export type ARLensMode = 'normal' | 'blueprint' | 'xray' | 'hologram';

export interface ARScene {
  id: number;
  title: string;
  targetFocalLabel?: string;
  recommendedLens: ARLensMode;
  telemetryFact: string;
  narrationSegment: string;
}

export interface LandmarkHistoryData {
  landmarkName: string;
  city: string;
  country?: string;
  historicalContext: string;
  timeline: Array<{
    year: string;
    event: string;
    impact: string;
  }>;
  fascinatingSecrets: Array<{
    title: string;
    description: string;
    category: 'engineering' | 'legend' | 'scandal' | 'secret_room' | string;
  }>;
  visitorIntel: {
    currentStatus: string;
    bestTimeToVisit: string;
    proTravelTip: string;
  };
  arNarration: {
    headline: string;
    fullScript: string;
    scenes: ARScene[];
  };
}

export interface GroundingMetadata {
  sources: Array<{
    title: string;
    uri: string;
  }>;
  queries: string[];
}

export interface TravelStamp {
  id: string;
  name: string;
  city: string;
  country: string;
  timestamp: string;
  photoUrl: string;
  summary: string;
  architecturalStyle: string;
  builtYear: string;
  audioUrl?: string;
  tags: string[];
}

export interface ShareStampResponse {
  success: boolean;
  shareId: string;
  shareUrl: string;
  stamp: TravelStamp & { shareId: string; sharedAt: string };
}

export interface PresetLandmark {
  id: string;
  name: string;
  city: string;
  country: string;
  style: string;
  year: string;
  imageUrl: string;
  thumbnailUrl: string;
  cityHint: string;
  description: string;
}
