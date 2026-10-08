import {Easing, interpolate, spring, SpringConfig} from 'remotion';

export const FPS = 60;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION_SEC = 20;

// 120 BPM: one beat = 0.5s, one bar = 2s. Every cut lands on a beat.
export const BPM = 120;
export const BEAT = 60 / BPM;

export const SCENES = {
  hook: {start: 0, end: 3},
  moods: {start: 3, end: 6},
  product: {start: 6, end: 11},
  dj: {start: 11, end: 14.5},
  stats: {start: 14.5, end: 17},
  outro: {start: 17, end: 20},
} as const;

export const C = {
  green: '#1ED760',
  greenDeep: '#1DB954',
  greenDark: '#0B3D1F',
  black: '#000000',
  base: '#060606',
  panel: '#121212',
  elevated: '#1F1F1F',
  hover: '#2A2A2A',
  line: 'rgba(255,255,255,0.08)',
  white: '#FFFFFF',
  sub: '#B3B3B3',
  dim: '#6A6A6A',
};

export const FONT = '"Inter Display", "Inter", system-ui, sans-serif';
export const FONT_TEXT = '"Inter", system-ui, sans-serif';

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // expo-ish out
  outSoft: Easing.bezier(0.33, 1, 0.68, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  inOut: Easing.bezier(0.83, 0, 0.17, 1),
  inOutSoft: Easing.bezier(0.65, 0, 0.35, 1),
};

/** seconds -> frames */
export const s = (sec: number) => Math.round(sec * FPS);

/** Clamped tween between two times (in seconds, relative to the scene). */
export const tween = (
  frame: number,
  from: number,
  to: number,
  a: number,
  b: number,
  easing: (t: number) => number = EASE.out,
) =>
  interpolate(frame, [from * FPS, to * FPS], [a, b], {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/** Spring that starts at `delay` seconds. */
export const sp = (
  frame: number,
  delay: number,
  config: Partial<SpringConfig> = {},
  durationInFrames?: number,
) =>
  spring({
    frame: Math.max(0, frame - delay * FPS),
    fps: FPS,
    config: {damping: 16, stiffness: 140, mass: 0.9, ...config},
    durationInFrames,
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Decaying pulse on every beat (0..1), for audio-reactive feel. */
export const beatPulse = (globalSec: number, sharpness = 7) => {
  const phase = (globalSec % BEAT) / BEAT;
  return Math.exp(-phase * sharpness);
};

/** Deterministic pseudo-random in [0,1). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
