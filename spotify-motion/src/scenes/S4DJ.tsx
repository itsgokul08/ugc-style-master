import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Cover, PALETTES} from '../components/Cover';
import {GlassOrb} from '../components/GlassOrb';
import {Drift} from '../components/Drift';
import {MoreIcon, PauseIcon} from '../components/Icons';
import {Stage} from '../components/Stage';
import {SilkWave} from '../components/SilkWave';
import {C, EASE, FONT_TEXT, FPS, HEADLINE, lerp, SCENES, sp, SUBTITLE, tween} from '../theme';

const PHONE_W = 420;
const PHONE_H = 860;
const PX = 940; // phone center x
const PY = 600;

const CAPTION = "Up next: feel-good throwbacks you haven't played in a while.".split(' ');

// Glowing DJ callouts: tucked behind the phone edges, in front of the giant type.
const CALLOUTS = [
  {x: 250, y: 600, text: 'Picked for your morning run', at: 0.7},
  {x: 1115, y: 690, text: 'Up next: feel-good throwbacks', at: 0.86},
  {x: 300, y: 795, text: "Mixing in songs you'll love", at: 1.02},
];

const Callout: React.FC<{text: string; p: number; t: number; i: number}> = ({text, p, t, i}) => {
  const sweep = (t * 140 + i * 90) % 360;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        height: 74,
        padding: '0 30px 0 12px',
        borderRadius: 999,
        border: '2px solid transparent',
        background: `linear-gradient(180deg, rgba(10,34,20,0.92), rgba(4,14,8,0.92)) padding-box, conic-gradient(from ${sweep}deg, rgba(30,215,96,0.25), #1ED760, #B6FFCF, #1ED760, rgba(30,215,96,0.25) 60%, rgba(30,215,96,0.25)) border-box`,
        boxShadow: '0 0 34px rgba(30,215,96,0.35), inset 0 0 22px rgba(30,215,96,0.12), 0 24px 50px rgba(0,0,0,0.5)',
        fontFamily: FONT_TEXT,
        color: C.white,
        whiteSpace: 'nowrap',
        opacity: Math.min(1, p * 1.4),
        filter: p < 0.99 ? `blur(${(1 - p) * 10}px)` : undefined,
        transform: `scale(${lerp(0.8, 1, p)})`,
      }}
    >
      {/* AI "thinking" ring */}
      <div style={{width: 48, height: 48, borderRadius: 24, background: 'rgba(30,215,96,0.12)', display: 'grid', placeItems: 'center'}}>
        <svg width={30} height={30} viewBox="0 0 30 30" style={{transform: `rotate(${t * 300 + i * 60}deg)`}}>
          <circle cx={15} cy={15} r={11} fill="none" stroke="rgba(30,215,96,0.25)" strokeWidth={3} />
          <circle cx={15} cy={15} r={11} fill="none" stroke={C.green} strokeWidth={3} strokeLinecap="round" strokeDasharray="22 70" />
        </svg>
      </div>
      <div style={{fontSize: 23, letterSpacing: '-0.01em'}}>
        <b style={{color: C.green, fontWeight: 800}}>DJ</b>
        <span style={{color: 'rgba(255,255,255,0.4)', margin: '0 10px'}}>·</span>
        <span style={{fontWeight: 600}}>{text}</span>
      </div>
    </div>
  );
};

/** 11–14.5s · Cinematic AI DJ: giant type split by the phone, glowing callouts, voice orb. */
export const S4DJ: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  const phoneIn = sp(frame, 0.05, {damping: 16, stiffness: 95, mass: 1});
  const words = sp(frame, 0.3, {damping: 20, stiffness: 90});
  const greenFade = tween(frame, 0.0, 0.55, 1, 0, EASE.outSoft);
  const exit = tween(frame, 3.02, 3.5, 0, 1, EASE.in);

  // DJ "speaking" amplitude
  const speaking = tween(frame, 0.9, 1.1, 0, 1) * (1 - tween(frame, 2.75, 2.95, 0, 1));
  const amp = speaking * (0.5 + 0.5 * Math.abs(Math.sin(t * 9.3) * Math.sin(t * 4.1 + 1)));

  const bigType: React.CSSProperties = {
    position: 'absolute',
    top: 230,
    ...HEADLINE,
    fontSize: 270,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    filter: `drop-shadow(0 0 40px rgba(30,215,96,0.2))${words < 0.99 ? ` blur(${(1 - words) * 16}px)` : ''}`,
    opacity: words,
  };

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* Shared brand stage (continues seamlessly into the numbers chapter) */}
      <Stage offset={SCENES.dj.start} />

      <Drift dur={3.5} zoom={0.05} panY={-12}>
      {/* Subtitle */}
      <div
        style={{
          ...SUBTITLE,
          position: 'absolute',
          top: 96,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: tween(frame, 0.45, 0.8, 0, 1) * (1 - exit),
          transform: `translateY(${tween(frame, 0.45, 0.9, 14, 0) - exit * 60}px)`,
        }}
      >
        Made for you · Powered by AI
      </div>

      {/* Giant type, split by the phone */}
      <div
        style={{
          ...bigType,
          right: 1920 - 765,
          backgroundImage: 'linear-gradient(180deg, #FFFFFF 25%, rgba(255,255,255,0.55) 100%)',
          transform: `translateX(${(1 - words) * 260 - t * 10 - exit * 900}px)`,
        }}
      >
        Your
      </div>
      <div
        style={{
          ...bigType,
          left: 1128,
          backgroundImage: 'linear-gradient(180deg, #FFFFFF 15%, #1ED760 100%)',
          transform: `translateX(${-(1 - words) * 260 + t * 10 + exit * 900}px)`,
        }}
      >
        AI DJ
      </div>

      {/* Glowing callouts */}
      {CALLOUTS.map((c, i) => {
        const p = sp(frame, c.at, {damping: 15, stiffness: 140});
        const bob = Math.sin(t * 1.9 + i * 1.7) * 6;
        return (
          <div
            key={c.text}
            style={{
              position: 'absolute',
              left: c.x,
              top: c.y,
              transform: `translate(${(c.x < 960 ? -1 : 1) * exit * 900}px, ${bob}px)`,
            }}
          >
            <Callout text={c.text} p={p} t={t} i={i} />
          </div>
        );
      })}

      {/* Phone */}
      <div style={{position: 'absolute', inset: 0, perspective: 2400}}>
        <div
          style={{
            position: 'absolute',
            left: PX - PHONE_W / 2,
            top: PY - PHONE_H / 2,
            width: PHONE_W,
            height: PHONE_H,
            transform: `translateY(${(1 - phoneIn) * 900 - exit * 1200}px) rotateY(${Math.sin(t * 1.1) * 7}deg) rotateX(${Math.sin(t * 0.9 + 1) * 3}deg) rotateZ(${(1 - phoneIn) * 12 + exit * -8}deg)`,
            filter: exit > 0.01 ? `blur(${exit * 10}px)` : undefined,
          }}
        >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 66,
                background: 'linear-gradient(145deg, #2a2a2a, #050505 40%, #1a1a1a)',
                boxShadow: '0 60px 140px rgba(0,0,0,0.8), 0 0 90px rgba(30,215,96,0.25), inset 0 0 0 2px rgba(255,255,255,0.14)',
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

              {/* Glass orb */}
              <GlassOrb
                id="dj"
                size={250}
                t={t}
                energy={amp}
                style={{position: 'absolute', left: 198 - 125, top: 150, transform: `scale(${1 + amp * 0.06})`}}
              />

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
      </div>

      </Drift>

      {/* Hand-off from the green takeover */}
      {greenFade > 0 && <AbsoluteFill style={{background: C.green, opacity: greenFade}} />}
    </AbsoluteFill>
  );
};
