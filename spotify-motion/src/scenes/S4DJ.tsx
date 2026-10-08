import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {Cover, PALETTES} from '../components/Cover';
import {MoreIcon, PauseIcon, SparkleIcon} from '../components/Icons';
import {SilkWave} from '../components/SilkWave';
import {WordReveal} from '../components/WordReveal';
import {C, EASE, FONT, FONT_TEXT, FPS, lerp, SCENES, sp, tween} from '../theme';

const PHONE_W = 420;
const PHONE_H = 860;
const PX = 1360; // phone center x
const PY = 540;

const FLOATERS = [
  {dx: -300, dy: -250, size: 150, p: PALETTES.violet, v: 1, depth: 1, at: 0.5},
  {dx: 300, dy: -300, size: 124, p: PALETTES.sun, v: 0, depth: 0.6, at: 0.56},
  {dx: 330, dy: 120, size: 168, p: PALETTES.blue, v: 3, depth: 1.1, at: 0.62},
  {dx: -310, dy: 250, size: 132, p: PALETTES.rose, v: 2, depth: 0.8, at: 0.68},
  {dx: 250, dy: 395, size: 104, p: PALETTES.teal, v: 1, depth: 0.5, at: 0.74},
];

const CAPTION = "Up next: feel-good throwbacks you haven't played in a while.".split(' ');

/** 11–14.5s · Brand-green chapter: the AI DJ, with a living voice orb on a phone. */
export const S4DJ: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  const phoneIn = sp(frame, 0.08, {damping: 15, stiffness: 95, mass: 1});
  const wipe = tween(frame, 3.05, 3.5, 0, 1, EASE.inOut);
  const lift = tween(frame, 3.0, 3.45, 0, 1, EASE.in);

  // DJ "speaking" amplitude
  const speaking = tween(frame, 0.9, 1.1, 0, 1) * (1 - tween(frame, 2.75, 2.95, 0, 1));
  const amp = speaking * (0.5 + 0.5 * Math.abs(Math.sin(t * 9.3) * Math.sin(t * 4.1 + 1)));

  return (
    <AbsoluteFill style={{background: C.green, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translateY(${-lift * 240}px)`, filter: lift > 0.01 ? `blur(${lift * 12}px)` : undefined}}>
        {/* depth shading */}
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(circle 900px at 1360px 560px, rgba(255,255,255,0.22) 0%, transparent 60%), radial-gradient(circle 1100px at 200px 1100px, rgba(0,0,0,0.18) 0%, transparent 70%)',
          }}
        />
        {/* Giant outline type */}
        <div
          style={{
            position: 'absolute',
            left: -60 - t * 40,
            top: -120,
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 1180,
            letterSpacing: '-0.06em',
            lineHeight: 1,
            color: 'transparent',
            WebkitTextStroke: '3px rgba(0,0,0,0.09)',
            whiteSpace: 'nowrap',
          }}
        >
          DJ DJ
        </div>

        {/* Copy */}
        <div style={{position: 'absolute', left: 150, top: 300, color: '#000', fontFamily: FONT}}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 20px 10px 14px',
              borderRadius: 999,
              background: '#000',
              color: C.green,
              fontFamily: FONT_TEXT,
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: '0.02em',
              opacity: tween(frame, 0.15, 0.45, 0, 1),
              transform: `translateY(${(1 - sp(frame, 0.15)) * 30}px)`,
            }}
          >
            <SparkleIcon size={24} />
            Made for you
          </div>
          <div style={{fontWeight: 900, fontSize: 124, lineHeight: 1.0, letterSpacing: '-0.055em', marginTop: 30}}>
            <WordReveal words={['Your', 'personal']} start={0.25} stagger={0.08} />
            <WordReveal words={['AI', 'DJ.']} start={0.42} stagger={0.1} />
          </div>
          <WordReveal
            words={['It', 'picks', 'the', 'music', '—', 'and', 'tells', 'you', 'why.']}
            start={0.7}
            stagger={0.035}
            style={{fontFamily: FONT_TEXT, fontWeight: 500, fontSize: 36, color: 'rgba(0,0,0,0.72)', marginTop: 34, letterSpacing: '-0.01em'}}
            wordGap="0.26em"
          />
        </div>

        {/* Floating covers (behind the phone ones first) */}
        {FLOATERS.map((f, i) => {
          const p = sp(frame, f.at, {damping: 12, stiffness: 120});
          const bobY = Math.sin(t * 1.8 + i * 1.3) * 10 * f.depth;
          const bobR = Math.sin(t * 1.2 + i) * 3;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: PX + f.dx * p - f.size / 2,
                top: PY + f.dy * p - f.size / 2 + bobY + (1 - phoneIn) * 600,
                transform: `scale(${p}) rotate(${(i % 2 ? 8 : -8) + bobR}deg)`,
                boxShadow: '0 30px 60px rgba(0,40,15,0.45)',
                borderRadius: 12,
                filter: f.depth < 0.7 ? 'blur(1.5px)' : undefined,
                zIndex: f.depth >= 1 ? 3 : 1,
              }}
            >
              <Cover palette={f.p} size={f.size} radius={12} variant={f.v} />
            </div>
          );
        })}

        {/* Phone */}
        <div
          style={{
            position: 'absolute',
            left: PX - PHONE_W / 2,
            top: PY - PHONE_H / 2,
            width: PHONE_W,
            height: PHONE_H,
            zIndex: 2,
            transform: `translateY(${(1 - phoneIn) * 900}px) rotate(${(1 - phoneIn) * 14 + Math.sin(t * 1.4) * 1.5}deg)`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 66,
              background: 'linear-gradient(145deg, #2a2a2a, #050505 40%, #1a1a1a)',
              boxShadow: '0 60px 120px rgba(0,50,20,0.55), inset 0 0 0 2px rgba(255,255,255,0.12)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 12,
              borderRadius: 54,
              background: 'radial-gradient(circle at 50% 30%, #10331f 0%, #0b0b0b 55%)',
              overflow: 'hidden',
              fontFamily: FONT_TEXT,
              color: C.white,
            }}
          >
            {/* dynamic island + status */}
            <div style={{position: 'absolute', left: '50%', top: 14, width: 120, height: 34, marginLeft: -60, borderRadius: 20, background: '#000'}} />
            <div style={{position: 'absolute', left: 34, top: 20, fontSize: 17, fontWeight: 600}}>9:41</div>
            <div style={{position: 'absolute', right: 30, top: 23, display: 'flex', gap: 4, alignItems: 'flex-end'}}>
              {[6, 9, 12, 15].map((h) => (
                <div key={h} style={{width: 4, height: h, borderRadius: 1, background: '#fff'}} />
              ))}
              <div style={{width: 26, height: 13, borderRadius: 4, border: '1.5px solid #fff', marginLeft: 6, padding: 1.5, boxSizing: 'border-box'}}>
                <div style={{width: '80%', height: '100%', background: '#fff', borderRadius: 2}} />
              </div>
            </div>
            {/* header */}
            <div style={{position: 'absolute', top: 76, left: 0, right: 0, textAlign: 'center', fontWeight: 800, fontSize: 22, letterSpacing: '0.02em'}}>
              DJ
            </div>
            <div style={{position: 'absolute', top: 78, right: 26}}>
              <MoreIcon size={24} color="#fff" />
            </div>

            {/* Orb */}
            <div
              style={{
                position: 'absolute',
                left: 198 - 130,
                top: 150,
                width: 260,
                height: 260,
                transform: `scale(${1 + amp * 0.12})`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: -40,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(30,215,96,0.45) 0%, transparent 65%)',
                  opacity: 0.6 + amp * 0.4,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: `${50 + Math.sin(t * 2.1) * 8}% ${50 + Math.cos(t * 1.7) * 9}% ${50 + Math.sin(t * 2.6 + 1) * 8}% ${50 + Math.cos(t * 2.3 + 2) * 9}%`,
                  background: `conic-gradient(from ${t * 120}deg, #1ED760, #0FA3B1, #3D6BFF, #8D2BE2, #1ED760)`,
                  filter: 'blur(14px)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 30,
                  borderRadius: '50%',
                  background: `conic-gradient(from ${-t * 200}deg, #B6FFCF, #1ED760, #0FA3B1, #B6FFCF)`,
                  filter: 'blur(18px)',
                  opacity: 0.9,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 85,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)',
                  filter: 'blur(6px)',
                }}
              />
            </div>

            {/* Voice waveform */}
            <SilkWave
              id="dj"
              width={372}
              height={100}
              t={t * 1.6}
              energy={0.3 + 0.9 * amp}
              strands={34}
              points={70}
              strokeWidth={1}
              colors={{edge: '#3D6BFF', mid: '#1ED760', core: '#E4FFEE'}}
              style={{position: 'absolute', top: 428, left: 12}}
            />

            {/* Karaoke caption */}
            <div
              style={{
                position: 'absolute',
                top: 528,
                left: 34,
                right: 34,
                textAlign: 'center',
                fontSize: 25,
                fontWeight: 700,
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
              }}
            >
              {CAPTION.map((w, i) => {
                const on = tween(frame, 1.0 + i * 0.16, 1.12 + i * 0.16, 0, 1, EASE.outSoft);
                return (
                  <span key={i} style={{color: `rgba(255,255,255,${0.28 + on * 0.72})`}}>
                    {w}{' '}
                  </span>
                );
              })}
            </div>

            {/* Now playing card */}
            <div
              style={{
                position: 'absolute',
                left: 20,
                right: 20,
                bottom: 30,
                padding: 16,
                borderRadius: 18,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.08)',
                opacity: tween(frame, 0.85, 1.2, 0, 1),
                transform: `translateY(${(1 - sp(frame, 0.85)) * 40}px)`,
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                <Cover palette={PALETTES.sun} size={64} radius={8} variant={0} />
                <div style={{flex: 1}}>
                  <div style={{fontSize: 19, fontWeight: 700}}>Golden Hour Drive</div>
                  <div style={{fontSize: 15, color: C.sub, marginTop: 4}}>Mira Sol</div>
                </div>
                <div style={{width: 48, height: 48, borderRadius: 24, background: C.green, display: 'grid', placeItems: 'center'}}>
                  <PauseIcon size={22} />
                </div>
              </div>
              <div style={{marginTop: 14, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)'}}>
                <div style={{width: `${lerp(8, 34, tween(frame, 1, 3.4, 0, 1, (x) => x))}%`, height: '100%', borderRadius: 2, background: '#fff'}} />
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* Dark panel wipes up into the next chapter */}
      {wipe > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 1920,
            height: 1080,
            transform: `translateY(${(1 - wipe) * 1080}px)`,
            borderRadius: `${(1 - wipe) * 140}px ${(1 - wipe) * 140}px 0 0`,
            overflow: 'hidden',
          }}
        >
          <Background offset={SCENES.dj.start} />
        </div>
      )}
    </AbsoluteFill>
  );
};
