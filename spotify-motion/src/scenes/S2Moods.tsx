import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Cover, PALETTES, Palette} from '../components/Cover';
import {PlayIcon} from '../components/Icons';
import {WordReveal} from '../components/WordReveal';
import {C, EASE, FONT, FONT_TEXT, FPS, lerp, sp, tween} from '../theme';

// Slot word swaps land on the beat (local seconds). Each swap spins the carousel one card.
const MOODS = [
  {word: 'focus.', color: '#8FB3FF', at: 0.12},
  {word: 'the drive.', color: '#FF7BD0', at: 0.75},
  {word: 'the gym.', color: '#FF8A4C', at: 1.25},
  {word: 'every mood.', color: C.green, at: 1.75},
];

const CARDS: {title: string; p: Palette; v: number; meta: string}[] = [
  {title: 'Lo-fi\nBeats', p: PALETTES.teal, v: 1, meta: '82 songs'},
  {title: 'Sunday\nReset', p: PALETTES.sun, v: 3, meta: '64 songs'},
  {title: 'Deep\nFocus', p: PALETTES.blue, v: 0, meta: '120 songs'}, // first active
  {title: 'Night\nDrive', p: PALETTES.violet, v: 1, meta: '75 songs'},
  {title: 'Beast\nMode', p: PALETTES.ember, v: 2, meta: '90 songs'},
  {title: 'Made\nfor You', p: PALETTES.green, v: 3, meta: 'Daily Mix'},
  {title: 'Throwback\nHits', p: PALETTES.rose, v: 0, meta: '100 songs'},
  {title: 'Indie\nMix', p: PALETTES.indigo, v: 2, meta: '58 songs'},
];
const FIRST = 2;

const CARD_W = 300;
const CARD_H = 392;
const RADIUS = 1150; // cylinder radius: cards wrap around the viewer
const STEP = 17.5; // degrees between cards

/** 3–6s · Glass headline panel with a curved 3D carousel of playlists that spins on every beat. */
export const S2Moods: React.FC = () => {
  const frame = useCurrentFrame();
  const panelIn = sp(frame, 0, {damping: 20, stiffness: 110});
  const exit = tween(frame, 2.55, 3.0, 0, 1, EASE.in);
  const swaps = MOODS.map((m) => sp(frame, m.at, {damping: 18, stiffness: 170}));
  const spinIn = sp(frame, 0.05, {damping: 22, stiffness: 70});

  // Continuous carousel position (index of the card facing the viewer)
  const pos = FIRST - (1 - spinIn) * 2.2 + swaps[1] + swaps[2] + swaps[3];

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${1 + exit * 0.1}) translateY(${-exit * 40}px)`,
        filter: exit > 0.01 ? `blur(${exit * 18}px)` : undefined,
        opacity: 1 - exit,
      }}
    >
      {/* light from above */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 900,
          top: -520,
          width: 1800,
          height: 1100,
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(30,215,96,0.30) 0%, rgba(30,215,96,0.08) 45%, transparent 72%)',
          opacity: panelIn,
        }}
      />

      {/* Glass headline panel */}
      <div style={{position: 'absolute', inset: 0, perspective: 2000}}>
        <div
          style={{
            position: 'absolute',
            left: 960 - 640,
            top: 96,
            width: 1280,
            height: 600,
            borderRadius: 40,
            padding: 14,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.10), 0 60px 120px rgba(0,0,0,0.6), 0 -10px 80px rgba(30,215,96,0.12)',
            opacity: panelIn,
            transform: `translateY(${(1 - panelIn) * 80}px) rotateX(${(1 - panelIn) * 14}deg) scale(${lerp(0.94, 1, panelIn)})`,
            transformOrigin: '50% 100%',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 28,
              background: 'radial-gradient(ellipse 80% 70% at 50% 0%, #17402A 0%, #0E1D15 45%, #0A0D0B 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 0 0 1px rgba(30,215,96,0.18)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* subtle grid inside the panel */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1.2px, transparent 1.8px)',
                backgroundSize: '34px 34px',
                maskImage: 'linear-gradient(180deg, black, transparent 80%)',
                WebkitMaskImage: 'linear-gradient(180deg, black, transparent 80%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 52,
                left: 0,
                right: 0,
                fontFamily: FONT,
                fontWeight: 800,
                letterSpacing: '-0.05em',
                color: C.white,
                textAlign: 'center',
              }}
            >
              <WordReveal words={['Music', 'for']} start={0.08} stagger={0.07} style={{justifyContent: 'center', fontSize: 96, lineHeight: 1}} />
              <div style={{position: 'relative', height: 150, overflow: 'hidden', marginTop: 4}}>
                {MOODS.map((m, i) => {
                  const enter = i === 0 ? sp(frame, 0.14, {damping: 18, stiffness: 150}) : swaps[i];
                  const leave = i < MOODS.length - 1 ? swaps[i + 1] : 0;
                  const vis = enter - leave;
                  return (
                    <div
                      key={m.word}
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        fontSize: 128,
                        lineHeight: 1.1,
                        whiteSpace: 'nowrap',
                        transform: `translateY(${(1 - enter) * 150 - leave * 150}px)`,
                        filter: `blur(${(1 - Math.min(1, vis * 1.2)) * 14}px)`,
                        opacity: Math.max(0, vis),
                        background: `linear-gradient(180deg, #fff -30%, ${m.color} 60%)`,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      }}
                    >
                      {m.word}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curved carousel */}
      <div style={{position: 'absolute', inset: 0, perspective: 1500, perspectiveOrigin: '50% 40%'}}>
        <div style={{position: 'absolute', left: 960, top: 700, transformStyle: 'preserve-3d'}}>
          {CARDS.map((card, i) => {
            const rel = i - pos;
            if (Math.abs(rel) > 3.8) return null;
            const ang = -rel * STEP; // next card arrives from the right
            const focus = Math.max(0, 1 - Math.abs(rel));
            const edgeFade = 1 - tween(Math.abs(rel) * FPS, 2.6, 3.8, 0, 1, (x) => x);
            const enter = sp(frame, 0.1 + Math.abs(i - FIRST) * 0.05, {damping: 16, stiffness: 120});
            return (
              <div
                key={card.title}
                style={{
                  position: 'absolute',
                  left: -CARD_W / 2,
                  top: -CARD_H / 2,
                  width: CARD_W,
                  height: CARD_H,
                  transform: `translateY(${(1 - enter) * 420}px) translateZ(${RADIUS}px) rotateY(${ang}deg) translateZ(${-RADIUS}px) translateZ(${focus * 40}px)`,
                  opacity: Math.min(1, enter * 1.5) * edgeFade,
                  borderRadius: 26,
                  padding: 16,
                  boxSizing: 'border-box',
                  background: 'linear-gradient(180deg, rgba(44,44,44,0.97), rgba(18,18,18,0.97))',
                  border: `1.5px solid ${focus > 0.01 ? `rgba(30,215,96,${0.15 + focus * 0.6})` : 'rgba(255,255,255,0.10)'}`,
                  boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 ${focus * 60}px rgba(30,215,96,${focus * 0.35})`,
                  filter: `brightness(${0.55 + focus * 0.45})`,
                  fontFamily: FONT_TEXT,
                  color: C.white,
                }}
              >
                <Cover palette={card.p} size={CARD_W - 32} radius={16} variant={card.v} title={card.title} titleSize={46} style={{whiteSpace: 'pre-line'}} />
                <div style={{display: 'flex', alignItems: 'center', marginTop: 16}}>
                  <div>
                    <div style={{fontSize: 21, fontWeight: 700, letterSpacing: '-0.01em'}}>{card.title.replace('\n', ' ')}</div>
                    <div style={{fontSize: 15, color: C.sub, marginTop: 4}}>Playlist · {card.meta}</div>
                  </div>
                  <div
                    style={{
                      marginLeft: 'auto',
                      width: 46,
                      height: 46,
                      borderRadius: 23,
                      background: C.green,
                      display: 'grid',
                      placeItems: 'center',
                      transform: `scale(${focus})`,
                      boxShadow: '0 8px 20px rgba(30,215,96,0.4)',
                    }}
                  >
                    <PlayIcon size={22} style={{marginLeft: 2}} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
