import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ArrowRightIcon} from '../components/Icons';
import {SpotifyLogo} from '../components/SpotifyLogo';
import {WordReveal} from '../components/WordReveal';
import {beatPulse, C, EASE, FONT, FONT_TEXT, FPS, gradText, HEADLINE, lerp, rand, SCENES, sp, tween} from '../theme';

const WORD = 'Spotify';
// Lockup geometry
const LOGO_END = 196;
const GAP = 36;
const WORD_W = 600; // measured width of the wordmark at 190px
const LOCK_W = LOGO_END + GAP + WORD_W;
const LOCK_Y = 450;
const LOGO_END_X = 960 - LOCK_W / 2 + LOGO_END / 2;

const PARTICLES = Array.from({length: 46}, (_, i) => ({
  x: rand(i * 3.1) * 1920,
  speed: 30 + rand(i * 5.7) * 90,
  size: 2 + rand(i * 9.3) * 4,
  phase: rand(i * 1.9) * 1080,
  green: rand(i * 2.2) > 0.55,
}));

/** 17–20s · Logo lockup: pop, arcs draw on, wordmark wipes in, CTA. */
export const S6Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const gt = t + SCENES.outro.start;

  const pop = sp(frame, 0, {damping: 9, stiffness: 150});
  const arcs: [number, number, number] = [
    tween(frame, 0.22, 0.62, 0, 1, EASE.out),
    tween(frame, 0.32, 0.72, 0, 1, EASE.out),
    tween(frame, 0.42, 0.82, 0, 1, EASE.out),
  ];
  const slide = tween(frame, 0.9, 1.45, 0, 1, EASE.inOut);
  const logoSize = lerp(300, LOGO_END, slide);
  const logoX = lerp(960, LOGO_END_X, slide);
  const logoY = lerp(540, LOCK_Y, slide);

  const wordP = tween(frame, 1.22, 1.78, 0, 1, EASE.out);
  const shock = tween(frame, 0.0, 0.9, 0, 1, EASE.out);
  const pulse = beatPulse(gt, 6);
  const push = tween(frame, 0, 3, 1, 1.09, (x) => x); // never stops moving, even on the last frame
  const sweep = tween(frame, 2.2, 3.0, -0.2, 1.2, EASE.inOutSoft);

  const cta = sp(frame, 2.0, {damping: 13, stiffness: 160});
  const shimmer = tween(frame, 2.35, 2.95, -0.3, 1.3, EASE.inOutSoft);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* particles */}
      {PARTICLES.map((p, i) => {
        const y = 1080 - ((p.phase + t * p.speed) % 1180);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: p.green ? C.green : '#fff',
              opacity: (p.green ? 0.55 : 0.25) * tween(frame, 0.2, 1.0, 0, 1),
            }}
          />
        );
      })}

      <AbsoluteFill style={{transform: `scale(${push})`}}>
        {/* glow */}
        <div
          style={{
            position: 'absolute',
            left: logoX - 600,
            top: logoY - 600,
            width: 1200,
            height: 1200,
            background: `radial-gradient(circle, rgba(30,215,96,${0.22 + pulse * 0.1}) 0%, transparent 60%)`,
            opacity: pop,
          }}
        />
        {/* shockwave */}
        {shock < 1 && (
          <div
            style={{
              position: 'absolute',
              left: 960 - (150 + shock * 650),
              top: 540 - (150 + shock * 650),
              width: (150 + shock * 650) * 2,
              height: (150 + shock * 650) * 2,
              borderRadius: '50%',
              border: `${(1 - shock) * 8}px solid ${C.green}`,
              opacity: (1 - shock) * 0.7,
            }}
          />
        )}

        {/* wordmark */}
        <div
          style={{
            position: 'absolute',
            left: LOGO_END_X + LOGO_END / 2 + GAP,
            top: LOCK_Y - 125,
            height: 250,
            width: WORD_W + 40,
            display: 'flex',
            alignItems: 'center',
            clipPath: `inset(-20px ${(1 - wordP) * 100}% -20px 0)`,
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 190,
            letterSpacing: '-0.05em',
            color: C.white,
          }}
        >
          {WORD.split('').map((ch, i) => {
            const lp = tween(frame, 1.22 + i * 0.04, 1.75 + i * 0.04, 0, 1, EASE.out);
            return (
              <span
                key={i}
                style={{display: 'inline-block', transform: `translateX(${(1 - lp) * -60}px)`, opacity: lp, filter: `blur(${(1 - lp) * 8}px)`}}
              >
                {ch}
              </span>
            );
          })}
        </div>

        {/* logo */}
        <div
          style={{
            position: 'absolute',
            left: logoX - logoSize / 2,
            top: logoY - logoSize / 2,
            transform: `scale(${pop})`,
            filter: `drop-shadow(0 20px 60px rgba(30,215,96,${0.35 + pulse * 0.15}))`,
          }}
        >
          <SpotifyLogo size={logoSize} arcs={arcs} />
        </div>

        {/* light sweep over the lockup */}
        <div
          style={{
            position: 'absolute',
            top: LOCK_Y - 200,
            height: 400,
            left: `${sweep * 100}%`,
            width: 260,
            marginLeft: -130,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)',
            transform: 'skewX(-20deg)',
            mixBlendMode: 'screen',
            opacity: sweep > -0.2 && sweep < 1.2 ? 1 : 0,
          }}
        />

        {/* tagline */}
        <div style={{position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <WordReveal
            words={['Music', 'for', {text: 'everyone.', style: gradText('#FFFFFF', C.green, 10)}]}
            start={1.62}
            stagger={0.09}
            style={{...HEADLINE, fontSize: 76}}
            wordStyle={gradText()}
            wordGap="0.24em"
          />
        </div>

        {/* CTA */}
        <div style={{position: 'absolute', top: 770, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '24px 40px 24px 46px',
              borderRadius: 999,
              background: C.green,
              color: '#000',
              fontFamily: FONT_TEXT,
              fontWeight: 700,
              fontSize: 32,
              letterSpacing: '-0.01em',
              opacity: Math.min(1, cta * 1.6),
              transform: `translateY(${(1 - cta) * 40}px) scale(${lerp(0.8, 1, cta)})`,
              boxShadow: `0 20px 50px rgba(30,215,96,${0.3 + pulse * 0.1})`,
            }}
          >
            Get Spotify Free
            <ArrowRightIcon size={30} />
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${shimmer * 100}%`,
                width: 120,
                marginLeft: -60,
                background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.65), transparent)',
                transform: 'skewX(-20deg)',
              }}
            />
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 900,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: FONT_TEXT,
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: '0.08em',
            color: C.dim,
            opacity: tween(frame, 2.2, 2.6, 0, 1),
          }}
        >
          spotify.com
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
