import type { BodyWeight, BoobsSize, ScenePreset } from "./types";

export const SCENE_PRESETS: ScenePreset[] = [
  { id: "cafe", label: "Cafe candid", description: "Sitting at a cozy cafe table with a coffee cup, warm window light" },
  { id: "street", label: "Street style", description: "Walking down a city sidewalk, urban buildings in the background" },
  { id: "bedroom", label: "Bedroom vibe", description: "Relaxed in a cozy bedroom, soft morning light through the curtains" },
  { id: "gym", label: "Gym mirror", description: "Standing in front of a gym mirror after a workout, gym equipment around" },
  { id: "office", label: "Office desk", description: "At a work desk with a laptop, casual office setting" },
  { id: "beach", label: "Beach day", description: "Standing on a sandy beach, ocean waves and sky in the background" },
  { id: "rooftop", label: "Rooftop sunset", description: "On a rooftop terrace at golden hour, city skyline behind" },
  { id: "park", label: "Park picnic", description: "Sitting on a blanket in a sunny park, picnic spread nearby" },
  { id: "library", label: "Library quiet", description: "Standing between bookshelves in a quiet library, soft ambient light" },
  { id: "poolside", label: "Poolside", description: "Lounging poolside on a sunny day, pool water sparkling nearby" },
  { id: "night", label: "Night out", description: "Out at night with city lights and neon signs in the background" },
  { id: "studio", label: "Studio photoshoot", description: "Casual moment backstage at a studio photoshoot, equipment visible" },
  { id: "concert", label: "Concert crowd", description: "In a lively concert crowd, stage lights glowing in the background" },
  { id: "airport", label: "Airport terminal", description: "Waiting at an airport terminal with luggage, travel gates in the background" },
];

export const BODY_WEIGHT_OPTIONS: { value: BodyWeight; label: string }[] = [
  { value: "slim", label: "Slim" },
  { value: "average", label: "Average" },
  { value: "athletic", label: "Athletic" },
  { value: "curvy", label: "Curvy" },
];

export const BOOBS_OPTIONS: { value: BoobsSize; label: string }[] = [
  { value: "flat", label: "Flat" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];
