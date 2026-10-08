import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Cover, PALETTES} from '../components/Cover';
import {WordReveal} from '../components/WordReveal';
import {C, EASE, FONT, FPS, sp, tween} from '../theme';

// Each swap lands on a beat (local seconds).
const MOODS = [
  {word: 'focus.', color: '#8FB3FF', title: 'Deep\nFocus', palette: PALETTES.blue, at: 0.12, rot: -7, variant: 0},
  {word: 'the drive.', color: '#FF7BD0', title: 'Night\nDrive', palette: PALETTES.violet, at: 0.75, rot: 5, variant: 1},
  {word: 'the gym.', color: '#FF8A4C', title: 'Beast\nMode', palette: PALETTES.ember, at: 1.25, rot: -4, variant: 2},
  {word: 'every mood.', color: C.green, title: 'Made\nfor You', palette: PALETTES.green, at: 1.75, rot: 2, variant: 3},
];

const CARD = 470;

/** 3–6s · "Music for every ___" with a slot-machine word and a stack of playlist covers. */
export const S2Moods: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const exit = tween(frame, 2.55, 3.0, 0, 1, EASE.in);

  const swaps = MOODS.map((m) => sp(frame, m.at, {damping: 18, stiffness: 170}));

  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${-exit * 420}px)`,
        filter: `blur(${exit * 18}px)`,
        opacity: 1 - exit,
      }}
    >
      {/* Copy */}
      <div
        style={{
          position: 'absolute',
          left: 150,
          top: 330,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 138,
          lineHeight: 1.02,
          letterSpacing: '-0.05em',
          color: C.white,
        }}
      >
        <WordReveal words={['Music', 'for']} start={0} stagger={0.07} />
        <div style={{position: 'relative', height: 190, width: 1000, overflow: 'hidden', marginTop: -6}}>
          {MOODS.map((m, i) => {
            const enter = i === 0 ? sp(frame, 0.1, {damping: 18, stiffness: 150}) : swaps[i];
            const leave = i < MOODS.length - 1 ? swaps[i + 1] : 0;
            const y = (1 - enter) * 180 - leave * 180;
            const vis = enter - leave;
            return (
              <div
                key={m.word}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 4,
                  whiteSpace: 'nowrap',
                  transform: `translateY(${y}px)`,
                  filter: `blur(${(1 - Math.min(1, vis * 1.2)) * 14}px)`,
                  opacity: Math.max(0, vis),
                  color: m.color,
                  textShadow: `0 0 60px ${m.color}55`,
                }}
              >
                {m.word}
              </div>
            );
          })}
        </div>
        <WordReveal
          words={['Playlists', 'that', 'get', 'you.']}
          start={0.35}
          stagger={0.05}
          style={{fontSize: 40, fontWeight: 500, letterSpacing: '-0.01em', color: C.sub, marginTop: 10}}
          wordGap="0.28em"
        />
      </div>

      {/* Cover stack */}
      <div style={{position: 'absolute', left: 1360, top: 540, perspective: 1800}}>
        {MOODS.map((m, i) => {
          const land = swaps[i];
          // How many newer cards have landed on top of this one (continuous).
          const depth = swaps.slice(i + 1).reduce((a, b) => a + b, 0);
          const x = (1 - land) * 760 - depth * 46;
          const y = (1 - land) * 260 - depth * 34;
          const rot = m.rot + (1 - land) * 28 - depth * 2;
          const scale = (0.82 + land * 0.18) * Math.pow(0.93, depth);
          const bob = Math.sin(t * 2.2 + i) * 6;
          return (
            <div
              key={m.title}
              style={{
                position: 'absolute',
                left: -CARD / 2,
                top: -CARD / 2,
                transform: `translate(${x}px, ${y + bob}px) rotate(${rot}deg) rotateY(${(1 - land) * -35}deg) scale(${scale})`,
                opacity: land > 0.001 ? 1 : 0,
                filter: `brightness(${1 - Math.min(depth, 3) * 0.18})`,
                boxShadow: '0 50px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)',
                borderRadius: 18,
              }}
            >
              <Cover
                palette={m.palette}
                size={CARD}
                radius={18}
                variant={m.variant}
                title={m.title}
                titleSize={86}
                label="Playlist"
                style={{whiteSpace: 'pre-line'}}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
