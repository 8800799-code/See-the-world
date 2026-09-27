import { GroundingMetadata, LandmarkHistoryData, RecognizedLandmark } from '../types.ts';

export async function convertImageUrlToBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const mimeType = blob.type || 'image/jpeg';
      resolve({ base64: result, mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function recognizeLandmark(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  cityHint?: string
): Promise<RecognizedLandmark> {
  const res = await fetch('/api/recognize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, cityHint }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Landmark recognition failed with status ${res.status}`);
  }

  const json = await res.json();
  return json.landmark;
}

export async function fetchLandmarkHistory(
  landmarkName: string,
  city: string,
  country?: string
): Promise<{ data: LandmarkHistoryData; grounding: GroundingMetadata }> {
  const res = await fetch('/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ landmarkName, city, country }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Fetching landmark history failed with status ${res.status}`);
  }

  const json = await res.json();
  return {
    data: json.data,
    grounding: json.grounding,
  };
}

export async function generateNarrationTts(
  text: string,
  voiceName: string = 'Kore',
  speakerStyle?: string
): Promise<{ audioUrl: string; voice: string }> {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceName, speakerStyle }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Speech generation failed with status ${res.status}`);
  }

  const json = await res.json();
  return {
    audioUrl: json.audioUrl,
    voice: json.voice,
  };
}

export async function askTourGuide(
  question: string,
  landmarkName: string,
  city: string,
  country?: string
): Promise<{ answer: string; sources: Array<{ title: string; uri: string }> }> {
  const res = await fetch('/api/ask-guide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, landmarkName, city, country }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Asking guide failed with status ${res.status}`);
  }

  const json = await res.json();
  return {
    answer: json.answer,
    sources: json.sources || [],
  };
}
