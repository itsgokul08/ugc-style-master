import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {WordReveal} from '../components/WordReveal';
import {C, EASE, FONT, FONT_TEXT, FPS, rand, sp, tween} from '../theme';

const N = 1100;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const POINTS = Array.from({length: N}, (_, i) => {
  const y = 1 - (i / (N - 1)) * 2;
  const r = Math.sqrt(1 - y * y);
  const th = GOLDEN * i;
  return {x: Math.cos(th) * r, y, z: Math.sin(th) * r, hot: rand(i) > 0.9, ph: rand(i + 7) * 6.28};
});

// Connection arcs between pairs of points (indices), each with a launch time.
const LINKS = [
  {a: 12, b: 128, at: 0.5},
  {a: 150, b: 44, at: 0.72},
  {a: 83, b: 21, at: 0.94},
  {a: 132, b: 61, at: 1.16},
  {a: 100, b: 157, at: 1.38},
];

const GX = 960;
const GY = 1390;
const R = 760;

const STATS = [
  {value: 600, suffix: 'M+', label: 'listeners'},
  {value: 100, suffix: 'M+', label: 'songs'},
  {value: 180, suffix: '+', label: 'markets'},
];

/** 14.5–17s · Scale. A dotted globe rises while the numbers roll up. */
export const S5Stats: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  const rise = sp(frame, 0, {damping: 22, stiffness: 70});
  const exit = tween(frame, 2.12, 2.5, 0, 1, EASE.in);

  const rotY = 0.6 + t * 0.32;
  const tilt = 0.42;
  const project = (p: {x: number; y: number; z: number}) => {
    const x1 = p.x * Math.cos(rotY) + p.z * Math.sin(rotY);
    const z1 = -p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
    const y2 = p.y * Math.cos(tilt) - z1 * Math.sin(tilt);
    const z2 = p.y * Math.sin(tilt) + z1 * Math.cos(tilt);
    return {X: GX + R * x1, Y: GY - R * y2, Z: z2};
  };

  return (
    <AbsoluteFill>
      {/* Globe */}
      <AbsoluteFill
        style={{
          transform: `translateY(${(1 - rise) * 420 + exit * 380}px)`,
          opacity: Math.min(1, rise * 1.4) * (1 - exit),
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: GX - R - 200,
            top: GY - R - 200,
            width: (R + 200) * 2,
            height: (R + 200) * 2,
            borderRadius: '50%',
            background: `radial-gradient(circle ${R + 200}px at center, transparent ${R - 8}px, rgba(30,215,96,0.28) ${R + 2}px, rgba(30,215,96,0.06) ${R + 70}px, transparent ${R + 200}px)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: GX - R,
            top: GY - R,
            width: R * 2,
            height: R * 2,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 20%, #0c1f14 0%, #060606 60%)',
            boxShadow: 'inset 0 2px 0 rgba(30,215,96,0.35)',
          }}
        />
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {POINTS.map((p, i) => {
            const q = project(p);
            if (q.Z <= 0.02 || q.Y > 1090) return null;
            const tw = p.hot ? 0.5 + 0.5 * Math.sin(t * 4 + p.ph) : 0;
            return (
              <circle
                key={i}
                cx={q.X}
                cy={q.Y}
                r={(p.hot ? 3.6 + tw * 2 : 2.8) * (0.55 + 0.45 * q.Z)}
                fill={p.hot ? C.green : '#ffffff'}
                opacity={p.hot ? 0.55 + 0.45 * q.Z : 0.12 + 0.5 * q.Z}
              />
            );
          })}
          {LINKS.map((l, i) => {
            const A = project(POINTS[l.a]);
            const B = project(POINTS[l.b]);
            const draw = tween(frame, l.at, l.at + 0.55, 0, 1, EASE.inOutSoft);
            const fade = 1 - tween(frame, l.at + 0.6, l.at + 1.0, 0, 1);
            if (draw <= 0 || A.Z < 0 || B.Z < 0) return null;
            const mx = (A.X + B.X) / 2;
            const my = Math.min(A.Y, B.Y) - 60 - Math.abs(A.X - B.X) * 0.12;
            const len = Math.hypot(B.X - A.X, B.Y - A.Y) * 1.3 + 160;
            return (
              <g key={i} opacity={fade}>
                <path
                  d={`M${A.X} ${A.Y} Q${mx} ${my} ${B.X} ${B.Y}`}
                  fill="none"
                  stroke={C.green}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeDasharray={len}
                  strokeDashoffset={len * (1 - draw)}
                  style={{filter: 'drop-shadow(0 0 6px rgba(30,215,96,0.9))'}}
                />
                <circle cx={A.X} cy={A.Y} r={6 + draw * 10} fill="none" stroke={C.green} opacity={1 - draw} strokeWidth={2} />
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>

      {/* Copy + counters */}
      <AbsoluteFill
        style={{
          transform: `scale(${1 - exit * 0.08})`,
          filter: exit > 0.01 ? `blur(${exit * 16}px)` : undefined,
          opacity: 1 - exit,
        }}
      >
        <div style={{position: 'absolute', top: 128, left: 0, right: 0, textAlign: 'center'}}>
          <div
            style={{
              fontFamily: FONT_TEXT,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.24em',
              color: C.green,
              opacity: tween(frame, 0.05, 0.4, 0, 1),
              transform: `translateY(${tween(frame, 0.05, 0.5, 16, 0)}px)`,
            }}
          >
            SPOTIFY BY THE NUMBERS
          </div>
          <WordReveal
            words={['One', 'app.', 'The', 'whole', 'world', 'listening.']}
            start={0.12}
            stagger={0.05}
            style={{
              justifyContent: 'center',
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 76,
              letterSpacing: '-0.045em',
              color: C.white,
              marginTop: 18,
            }}
            wordGap="0.22em"
          />
        </div>

        <div style={{position: 'absolute', top: 360, left: 120, right: 120, display: 'flex'}}>
          {STATS.map((st, i) => {
            const at = 0.35 + i * 0.14;
            const p = sp(frame, at, {damping: 18, stiffness: 120});
            const count = tween(frame, at, at + 1.15, 0, 1, EASE.out);
            const v = Math.round(st.value * count);
            const line = tween(frame, at + 0.1, at + 0.6, 0, 1, EASE.out);
            return (
              <div key={st.label} style={{flex: 1, position: 'relative', textAlign: 'center'}}>
                {i > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 20,
                      width: 1,
                      height: 190,
                      background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.22), transparent)',
                      transform: `scaleY(${line})`,
                    }}
                  />
                )}
                <div
                  style={{
                    fontFamily: FONT,
                    fontWeight: 800,
                    fontSize: 150,
                    letterSpacing: '-0.05em',
                    lineHeight: 1,
                    color: C.white,
                    fontVariantNumeric: 'tabular-nums',
                    opacity: Math.min(1, p * 1.5),
                    transform: `translateY(${(1 - p) * 70}px)`,
                    filter: `blur(${(1 - p) * 12}px)`,
                  }}
                >
                  {v}
                  <span style={{color: C.green}}>{st.suffix}</span>
                </div>
                <div
                  style={{
                    fontFamily: FONT_TEXT,
                    fontSize: 30,
                    fontWeight: 500,
                    color: C.sub,
                    marginTop: 16,
                    opacity: tween(frame, at + 0.2, at + 0.6, 0, 1),
                  }}
                >
                  {st.label}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
