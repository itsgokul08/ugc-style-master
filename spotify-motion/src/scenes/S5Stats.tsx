import React from 'react';
import {geoDistance, geoOrthographic, geoPath} from 'd3-geo';
import type {Feature, MultiLineString} from 'geojson';
import {feature} from 'topojson-client';
import landTopo from 'world-atlas/land-110m.json';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Drift} from '../components/Drift';
import {WaveIcon} from '../components/Icons';
import {Stage} from '../components/Stage';
import {C, EASE, FONT, FONT_TEXT, FPS, gradText, HEADLINE, lerp, rand, SCENES, sp, SUBTITLE, tween} from '../theme';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LAND = feature(landTopo as any, (landTopo as any).objects.land) as unknown as Feature;

// Network mesh: Fibonacci points on the sphere, each linked to its nearest neighbours.
const NODE_COUNT = 110;
const NODES: [number, number][] = Array.from({length: NODE_COUNT}, (_, i) => {
  const y = 1 - ((i + 0.5) / NODE_COUNT) * 2;
  const lon = ((i * 137.508) % 360) - 180;
  return [lon, (Math.asin(y) * 180) / Math.PI];
});
const EDGES: [number, number][] = (() => {
  const seen = new Set<string>();
  const out: [number, number][] = [];
  NODES.forEach((a, i) => {
    NODES.map((b, j) => ({j, d: geoDistance(a, b)}))
      .filter((n) => n.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 4)
      .forEach(({j}) => {
        const k = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(k)) {
          seen.add(k);
          out.push([i, j]);
        }
      });
  });
  return out;
})();
const MESH: Feature<MultiLineString> = {
  type: 'Feature',
  properties: {},
  geometry: {type: 'MultiLineString', coordinates: EDGES.map(([a, b]) => [NODES[a], NODES[b]])},
};
const HOT = new Set(NODES.map((_, i) => i).filter((i) => rand(i * 3.3) > 0.78));

const STARS = Array.from({length: 90}, (_, i) => ({
  x: rand(i * 1.7) * 1920,
  y: rand(i * 2.9) * 640,
  r: 0.6 + rand(i * 4.1) * 1.4,
  ph: rand(i * 5.3) * 6.28,
}));

const GX = 960;
const GY = 1250;
const R = 830;

const STATS = [
  {x: 250, y: 690, value: 600, suffix: 'M+', label: 'monthly listeners', icon: 'head', at: 0.55},
  {x: 770, y: 575, value: 100, suffix: 'M+', label: 'songs to explore', icon: 'wave', at: 0.7},
  {x: 1330, y: 655, value: 180, suffix: '+', label: 'markets worldwide', icon: 'globe', at: 0.85},
];

const TITLE = 'The world listens.';

const StatIcon: React.FC<{kind: string}> = ({kind}) => {
  if (kind === 'wave') return <WaveIcon size={24} color="#E8FFE9" />;
  if (kind === 'globe')
    return (
      <svg width={24} height={24} viewBox="0 0 24 24">
        <circle cx={12} cy={12} r={9} fill="none" stroke="#E8FFE9" strokeWidth={1.8} />
        <path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18" fill="none" stroke="#E8FFE9" strokeWidth={1.6} />
      </svg>
    );
  return (
    <svg width={24} height={24} viewBox="0 0 24 24">
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" fill="none" stroke="#E8FFE9" strokeWidth={1.8} />
      <rect x={3} y={13} width={5} height={7} rx={2} fill="#E8FFE9" />
      <rect x={16} y={13} width={5} height={7} rx={2} fill="#E8FFE9" />
    </svg>
  );
};

/** 14.5–17s · "The world listens." A lit, rotating network globe with glass stat cards. */
export const S5Stats: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  const rise = sp(frame, 0, {damping: 24, stiffness: 70});
  const exit = tween(frame, 2.12, 2.5, 0, 1, EASE.in);
  const mesh = tween(frame, 0.3, 1.5, 0, 1, EASE.inOutSoft);

  const projection = geoOrthographic()
    .scale(R)
    .translate([GX, GY])
    .rotate([38 - t * 8, -22, 0]) // centered on the Atlantic
    .clipAngle(90);
  const path = geoPath(projection);
  const center = projection.invert!([GX, GY]) as [number, number];
  const atm = R / (R * 1.35); // globe edge as a fraction of the atmosphere radius

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: 1 - exit}}>
        <Stage offset={SCENES.stats.start} glowY={115} />
      </AbsoluteFill>
      <Drift dur={2.5} zoom={0.05} panY={-10}>
      {/* stars */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: tween(frame, 0, 0.6, 0, 1) * (1 - exit)}}>
        {STARS.map((st, i) => (
          <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#fff" opacity={0.25 + 0.35 * Math.abs(Math.sin(t * 1.5 + st.ph))} />
        ))}
      </svg>

      {/* Globe */}
      <AbsoluteFill style={{transform: `translateY(${(1 - rise) * 520 + exit * 420}px)`, opacity: Math.min(1, rise * 1.5) * (1 - exit)}}>
        {/* atmosphere */}
        <div
          style={{
            position: 'absolute',
            left: GX - R * 1.35,
            top: GY - R * 1.35,
            width: R * 2.7,
            height: R * 2.7,
            borderRadius: '50%',
            background: `radial-gradient(circle closest-side, transparent ${atm * 100 - 1}%, rgba(30,215,96,0.38) ${atm * 100 + 0.5}%, rgba(30,215,96,0.10) ${atm * 100 + 8}%, transparent 100%)`,
          }}
        />
        {/* sun-side glow, top-right */}
        <div
          style={{
            position: 'absolute',
            left: GX + R * 0.05,
            top: GY - R * 1.25,
            width: R * 1.2,
            height: R * 0.8,
            background: 'radial-gradient(ellipse at 50% 60%, rgba(30,215,96,0.4) 0%, rgba(15,163,177,0.12) 45%, transparent 68%)',
            filter: 'blur(20px)',
          }}
        />
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <defs>
            <radialGradient id="g-body" cx="68%" cy="10%" r="95%">
              <stop offset="0" stopColor="#168A44" />
              <stop offset="0.3" stopColor="#0A4524" />
              <stop offset="0.65" stopColor="#03200F" />
              <stop offset="1" stopColor="#010604" />
            </radialGradient>
            <linearGradient id="g-land" gradientUnits="userSpaceOnUse" x1={GX + R * 0.7} y1={GY - R} x2={GX - R * 0.7} y2={GY}>
              <stop offset="0" stopColor="#E9FFF1" stopOpacity="0.92" />
              <stop offset="0.5" stopColor="#8CFFB9" stopOpacity="0.62" />
              <stop offset="1" stopColor="#1ED760" stopOpacity="0.35" />
            </linearGradient>
            <radialGradient id="g-shade" cx="70%" cy="5%" r="100%">
              <stop offset="0.35" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#000" stopOpacity="0.65" />
            </radialGradient>
            <linearGradient id="g-rim" gradientUnits="userSpaceOnUse" x1={GX - R} y1={GY} x2={GX + R * 0.6} y2={GY - R}>
              <stop offset="0" stopColor="#1ED760" stopOpacity="0" />
              <stop offset="0.55" stopColor="#1ED760" stopOpacity="0.45" />
              <stop offset="1" stopColor="#B6FFCF" stopOpacity="1" />
            </linearGradient>
            <filter id="g-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="g-bloom" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
          </defs>

          <circle cx={GX} cy={GY} r={R} fill="url(#g-body)" />
          <path d={path(LAND) ?? ''} fill="url(#g-land)" />
          <circle cx={GX} cy={GY} r={R} fill="url(#g-shade)" />

          {/* network mesh draws itself in */}
          <path
            d={path(MESH) ?? ''}
            fill="none"
            stroke="#8DFFA8"
            strokeWidth={1.5}
            strokeOpacity={0.6}
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - mesh}
            filter="url(#g-glow)"
          />
          {NODES.map((n, i) => {
            if (geoDistance(n, center) > Math.PI / 2 - 0.05) return null;
            const p = projection(n);
            if (!p) return null;
            const pop = tween(frame, 0.4 + (i % 20) * 0.04, 0.7 + (i % 20) * 0.04, 0, 1, EASE.out);
            const hot = HOT.has(i);
            const pulse = hot ? (t * 0.9 + rand(i)) % 1 : 0;
            return (
              <g key={i} opacity={pop}>
                {hot && <circle cx={p[0]} cy={p[1]} r={4 + pulse * 22} fill="none" stroke="#1ED760" strokeWidth={1.5} opacity={(1 - pulse) * 0.8} />}
                <circle cx={p[0]} cy={p[1]} r={hot ? 4.5 : 2.8} fill={hot ? '#E9FFF1' : '#8CFFB9'} filter="url(#g-glow)" />
              </g>
            );
          })}

          {/* rim light */}
          <circle cx={GX} cy={GY} r={R} fill="none" stroke="url(#g-rim)" strokeWidth={26} filter="url(#g-bloom)" opacity={0.9} />
          <circle cx={GX} cy={GY} r={R - 1.5} fill="none" stroke="url(#g-rim)" strokeWidth={3} />
        </svg>
        {/* light streak */}
        <div
          style={{
            position: 'absolute',
            left: 1350,
            top: 860,
            width: 900,
            height: 120,
            background: 'linear-gradient(90deg, transparent, rgba(180,255,210,0.4), rgba(53,208,192,0.22), transparent)',
            filter: 'blur(18px)',
            transform: `rotate(-38deg) translateX(${Math.sin(t * 0.8) * 30}px)`,
            mixBlendMode: 'screen',
          }}
        />
      </AbsoluteFill>

      {/* Copy */}
      <AbsoluteFill style={{filter: exit > 0.01 ? `blur(${exit * 16}px)` : undefined, opacity: 1 - exit}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center'}}>
          <div style={{width: 1440}}>
            <div
              style={{
                ...SUBTITLE,
                marginLeft: 12,
                opacity: tween(frame, 0.1, 0.45, 0, 1),
                transform: `translateY(${tween(frame, 0.1, 0.5, 14, 0)}px)`,
              }}
            >
              Spotify by the numbers
            </div>
            <div
              style={{
                ...HEADLINE,
                fontSize: 182,
                lineHeight: 1.05,
                marginTop: 6,
                whiteSpace: 'pre',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {TITLE.split('').map((ch, i) => {
                const p = tween(frame, 0.15 + i * 0.025, 0.75 + i * 0.025, 0, 1, EASE.out);
                return (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      ...gradText(),
                      opacity: p,
                      filter: p < 0.99 ? `blur(${(1 - p) * 14}px)` : undefined,
                      transform: `translateY(${(1 - p) * 40}px)`,
                    }}
                  >
                    {ch}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Glass stat cards */}
        {STATS.map((st, i) => {
          const p = sp(frame, st.at, {damping: 15, stiffness: 130});
          const count = tween(frame, st.at, st.at + 1.1, 0, 1, EASE.out);
          const bob = Math.sin(t * 1.8 + i * 1.9) * 6;
          return (
            <div
              key={st.label}
              style={{
                position: 'absolute',
                left: st.x,
                top: st.y,
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '18px 30px 18px 18px',
                borderRadius: 20,
                background: 'linear-gradient(180deg, rgba(34,48,40,0.55), rgba(8,16,11,0.6))',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.16)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 24px 50px rgba(0,0,0,0.45)',
                fontFamily: FONT_TEXT,
                color: C.white,
                opacity: Math.min(1, p * 1.5),
                transform: `translateY(${(1 - p) * 50 + bob}px) scale(${lerp(0.85, 1, p)})`,
                filter: p < 0.99 ? `blur(${(1 - p) * 8}px)` : undefined,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <StatIcon kind={st.icon} />
              </div>
              <div>
                <div style={{fontFamily: FONT, fontSize: 50, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
                  {Math.round(st.value * count)}
                  <span style={{color: C.green}}>{st.suffix}</span>
                </div>
                <div style={{fontSize: 19, color: 'rgba(255,255,255,0.68)', marginTop: 6}}>{st.label}</div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
      </Drift>
    </AbsoluteFill>
  );
};
