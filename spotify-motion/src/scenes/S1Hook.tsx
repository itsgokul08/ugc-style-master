import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Drift} from '../components/Drift';
import {SilkWave} from '../components/SilkWave';
import {WordReveal} from '../components/WordReveal';
import {beatPulse, C, EASE, FPS, gradText, HEADLINE, lerp, sp, SUBTITLE, tween} from '../theme';

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
    backgroundImage: `linear-gradient(92deg, #1ED760 0%, #B6FFCF ${40 + Math.sin(t * 2) * 15}%, #1ED760 100%)`,
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
      <Drift dur={3} zoom={0.07} panY={-14}>
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
          top: 200,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            ...SUBTITLE,
            opacity: tween(frame, 0.4, 0.75, 0, 1),
            transform: `translateY(${tween(frame, 0.4, 0.85, 14, 0)}px)`,
            marginBottom: 14,
          }}
        >
          Spotify · Music for every moment
        </div>
        <div style={{...HEADLINE, fontSize: 150, lineHeight: 1.04, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <WordReveal words={['What', 'does', 'your']} start={0.55} stagger={0.08} wordStyle={gradText()} wordGap="0.22em" />
          <WordReveal
            words={['day', {text: 'sound', style: accent}, 'like?']}
            start={0.82}
            stagger={0.09}
            wordStyle={gradText()}
            wordGap="0.22em"
          />
        </div>
      </div>
      </Drift>
    </AbsoluteFill>
  );
};
