import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS} from '../theme';

/**
 * Slow, continuous camera move for a whole scene so no moment ever sits still:
 * a linear push-in plus a gentle pan and a breathing float.
 */
export const Drift: React.FC<{
  dur: number; // scene length in seconds
  zoom?: number;
  panX?: number;
  panY?: number;
  origin?: string;
  children: React.ReactNode;
}> = ({dur, zoom = 0.06, panX = 0, panY = 0, origin = '50% 50%', children}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const p = Math.min(1, t / dur);
  const floatY = Math.sin(t * 1.3) * 4;
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${panX * p}px, ${panY * p + floatY}px) scale(${1 + zoom * p})`,
        transformOrigin: origin,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
