import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {WordReveal} from '../components/WordReveal';
import {beatPulse, C, EASE, FONT, FPS, lerp, sp, tween} from '../theme';

const BARS = 48;

/** 0–3s · "What does your day sound like?" A single green pulse becomes a living equalizer. */
export const S1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // Green dot pops in, then drops and stretches into an equalizer.
  const dotIn = sp(frame, 0.05, {damping: 9, stiffness: 190});
  const spread = tween(frame, 0.42, 1.15, 0, 1, EASE.out);
  const drop = tween(frame, 0.35, 0.9, 0, 1, EASE.inOutSoft);
  const eqY = lerp(540, 790, drop);

  // Exit: zoom-through with blur.
  const exit = tween(frame, 2.62, 3.0, 0, 1, EASE.in);
  const kick = t > 0.9 ? beatPulse(t, 6) : 0;

  const accent: React.CSSProperties = {
    background: 'linear-gradient(92deg, #1ED760 0%, #8CFFB9 55%, #1ED760 100%)',
    backgroundSize: '200% 100%',
    backgroundPosition: `${(t * 60) % 200}% 0`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    paddingRight: '0.04em',
  };

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${1 + exit * 0.35})`,
        filter: `blur(${exit * 22}px)`,
        opacity: 1 - exit,
      }}
    >
      {/* Soft glow that breathes with the kick */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 700,
          top: eqY - 300,
          width: 1400,
          height: 600,
          background: `radial-gradient(ellipse at center, rgba(30,215,96,${0.18 * spread + 0.12 * kick * spread}) 0%, transparent 65%)`,
        }}
      />

      {/* Equalizer */}
      <div style={{position: 'absolute', left: 960, top: eqY}}>
        {Array.from({length: BARS}).map((_, i) => {
          const c = (i - (BARS - 1) / 2) / ((BARS - 1) / 2); // -1..1
          const env = Math.exp(-c * c * 2.4);
          const wobble =
            0.55 * Math.abs(Math.sin(t * 5.1 + i * 0.62)) +
            0.45 * Math.abs(Math.sin(t * 3.3 - i * 0.37 + 1.3));
          const h = 14 + spread * (env * (50 + 150 * wobble) + kick * env * 90) * (1 + exit * 1.5);
          const x = c * 470 * spread;
          const w = lerp(34 * dotIn, 11, spread);
          const op = spread < 0.02 ? (i === Math.floor(BARS / 2) ? 1 : 0) : 0.35 + 0.65 * env;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x - w / 2,
                top: -h / 2,
                width: w,
                height: spread < 0.02 ? 34 * dotIn : h,
                borderRadius: 999,
                opacity: op,
                background: `linear-gradient(180deg, #9CFFC2 0%, ${C.green} 45%, #0E8F3E 100%)`,
                boxShadow: `0 0 ${18 + kick * 20}px rgba(30,215,96,${0.35 * env})`,
              }}
            />
          );
        })}
      </div>

      {/* Headline */}
      <div
        style={{
          position: 'absolute',
          top: 250,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 132,
          lineHeight: 1.02,
          letterSpacing: '-0.05em',
          color: C.white,
        }}
      >
        <WordReveal words={['What', 'does', 'your']} start={0.55} stagger={0.08} />
        <WordReveal
          words={['day', {text: 'sound', style: accent}, 'like?']}
          start={0.82}
          stagger={0.09}
        />
      </div>
    </AbsoluteFill>
  );
};
