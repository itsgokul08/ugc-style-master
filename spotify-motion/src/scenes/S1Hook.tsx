import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SilkWave} from '../components/SilkWave';
import {WordReveal} from '../components/WordReveal';
import {beatPulse, C, EASE, FONT, FPS, lerp, sp, tween} from '../theme';

/** 0–3s · "What does your day sound like?" A single green pulse unfurls into a silk-ribbon waveform. */
export const S1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // Green dot pops in, then drops and unfurls into the waveform.
  const dotIn = sp(frame, 0.05, {damping: 9, stiffness: 190});
  const spread = tween(frame, 0.42, 1.15, 0, 1, EASE.out);
  const drop = tween(frame, 0.35, 0.9, 0, 1, EASE.inOutSoft);
  const eqY = lerp(540, 770, drop);

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
      {/* Green dot: the seed of the waveform */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 17,
          top: eqY - 17,
          width: 34,
          height: 34,
          borderRadius: 17,
          background: C.green,
          boxShadow: '0 0 40px rgba(30,215,96,0.8)',
          transform: `scale(${dotIn * (1 - spread)})`,
          opacity: 1 - tween(frame, 0.45, 0.75, 0, 1),
        }}
      />

      {/* Silk-ribbon audio wave, unfurling from the dot and breathing with the kick */}
      <SilkWave
        id="hook"
        width={1720}
        height={460}
        t={t}
        reveal={spread}
        energy={spread * (0.75 + 0.4 * kick) * (1 + exit * 0.8)}
        strands={96}
        strokeWidth={1.3}
        style={{position: 'absolute', left: 960 - 860, top: eqY - 230}}
      />

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
