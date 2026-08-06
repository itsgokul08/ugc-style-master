import type { AspectRatio, BodyWeight, BoobsSize } from "./types";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.error || `Request to ${path} failed`);
  }
  return json.value as T;
}

const MAX_IMAGE_DIMENSION = 1600;

// Claude's vision API only accepts JPEG/PNG/GIF/WebP. Phone photos are often HEIC
// (or otherwise mislabeled), so every upload is decoded and re-encoded as JPEG here
// rather than trusting the browser-reported file type. Also caps the long edge to
// keep image token cost down.
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not process that image in this browser."));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Couldn't read that image — try exporting it as a JPG or PNG first."));
    };

    img.src = objectUrl;
  });
}

export function generateUgcPrompt(input: {
  referenceImage: string;
  outfitImage?: string;
  locationImage?: string;
  poseImage?: string;
  sceneDescription: string;
  aspectRatio: AspectRatio;
  sexyMode: boolean;
  headroomMode: boolean;
  customInstructions?: string;
  ageRange: number;
  bodyWeight: BodyWeight;
  boobsSize: BoobsSize;
}) {
  return post<{ prompt: string }>("/api/generate/ugc", input);
}

export function generateCharacterSheetPrompt(input: {
  referenceImage: string;
  outfitImage?: string;
  locationImage?: string;
  sexyMode: boolean;
  ageRange: number;
  bodyWeight: BodyWeight;
  boobsSize: BoobsSize;
}) {
  return post<{ prompt: string }>("/api/generate/character-sheet", input);
}

export function generateEnvironmentPrompt(input: {
  sceneDescription: string;
  aspectRatio: AspectRatio;
  locationImage?: string;
}) {
  return post<{ prompt: string }>("/api/generate/environment", input);
}

export function generateReversePrompt(input: {
  baseImage: string;
  faceImage?: string;
  outfitImage?: string;
  sexyMode: boolean;
  headroomMode: boolean;
  customInstructions?: string;
  ageRange: number;
  bodyWeight: BodyWeight;
  boobsSize: BoobsSize;
}) {
  return post<{ prompt: string }>("/api/generate/reverse", input);
}
