import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {beatPulse, C, FPS} from '../theme';

const NOISE_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
);

/** Film grain that re-seeds every 2 frames (cheap: one tiled image, shifted). */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 2);
  const x = (step * 73) % 300;
  const y = (step * 151) % 300;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("data:image/svg+xml,${NOISE_SVG}")`,
        backgroundPosition: `${x}px ${y}px`,
        opacity,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};

/** Persistent dark stage: drifting aurora blobs + dot grid + vignette. */
export const Background: React.FC<{intensity?: number; offset?: number}> = ({intensity = 1, offset = 0}) => {
  const frame = useCurrentFrame();
  // `offset` (s) lets a copy rendered inside a Sequence stay in sync with the global one.
  const t = frame / FPS + offset;
  const pulse = beatPulse(t, 5) * 0.25;
  const blob = (x: number, y: number, r: number, color: string, alpha: number) =>
    `radial-gradient(circle ${r}px at ${x}px ${y}px, ${color.replace('A', String(alpha))} 0%, transparent 100%)`;
  const g = intensity * (0.9 + pulse);
  return (
    <AbsoluteFill style={{backgroundColor: C.base}}>
      <AbsoluteFill
        style={{
          background: [
            blob(960 + Math.sin(t * 0.5) * 380, 820 + Math.cos(t * 0.4) * 120, 900, 'rgba(30,215,96,A)', 0.2 * g),
            blob(380 + Math.cos(t * 0.35) * 200, 200 + Math.sin(t * 0.45) * 140, 760, 'rgba(124,58,237,A)', 0.16 * g),
            blob(1600 + Math.sin(t * 0.3) * 160, 260 + Math.cos(t * 0.5) * 160, 700, 'rgba(14,165,233,A)', 0.1 * g),
          ].join(','),
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.075) 1.2px, transparent 1.8px)',
          backgroundSize: '44px 44px',
          backgroundPosition: `${(t * 6) % 44}px ${(t * 10) % 44}px`,
          maskImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, black 0%, transparent 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: 'none',
    }}
  />
);
