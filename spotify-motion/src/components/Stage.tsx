import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {beatPulse, FPS} from '../theme';

/**
 * Dark brand stage shared by the DJ and numbers chapters: near-black with Spotify-green
 * light rising from below, a teal wash from above and a faint dot grid.
 */
export const Stage: React.FC<{offset?: number; glowY?: number}> = ({offset = 0, glowY = 105}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS + offset;
  const pulse = beatPulse(t, 5) * 0.08;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: '#020604'}} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 45% at 50% ${glowY}%, rgba(30,215,96,${0.5 + pulse}) 0%, rgba(30,215,96,0.12) 50%, transparent 80%), radial-gradient(ellipse 50% 40% at 50% -5%, rgba(15,163,177,0.22) 0%, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1.2px, transparent 1.8px)',
          backgroundSize: '44px 44px',
          backgroundPosition: `${(t * 6) % 44}px ${(t * 10) % 44}px`,
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 0%, transparent 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
