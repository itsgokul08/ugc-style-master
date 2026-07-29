export type ReferenceAsset = {
  name: string;
  type: string;
  src: string; // data URL
};

export type ScenePreset = {
  id: string;
  label: string;
  description: string;
};

export type BodyWeight = "slim" | "average" | "athletic" | "curvy";
export type BoobsSize = "flat" | "small" | "medium" | "large";
export type AspectRatio = "9:16" | "16:9" | "1:1";

export type PickerTarget = "reference" | "outfit" | "location" | "pose" | "base";
