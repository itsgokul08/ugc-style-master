import React from 'react';

type Props = {
  size: number;
  /** time in seconds */
  t: number;
  /** 0..1 voice energy: makes the liquid slosh harder */
  energy?: number;
  id: string;
  style?: React.CSSProperties;
};

/**
 * Glossy glass sphere with a band of liquid light inside: dark core, fresnel rim,
 * a sharp flowing wave edge and a soft haze above it.
 */
export const GlassOrb: React.FC<Props> = ({size, t, energy = 0, id, style}) => {
  const r = size / 2;
  const c = r;
  const A = r * (0.16 + 0.12 * energy); // wave amplitude
  const level = c + Math.sin(t * 1.3) * r * 0.05; // liquid surface height
  const phase = t * 2.2;

  // Wave surface across the sphere (sampled; clipped to the circle)
  const pts: [number, number][] = [];
  for (let i = 0; i <= 48; i++) {
    const x = (i / 48) * size;
    const u = (x / size) * Math.PI * 2;
    const y = level - A * Math.sin(u * 0.9 + phase) - A * 0.35 * Math.sin(u * 1.9 - phase * 1.4);
    pts.push([x, y]);
  }
  const surface = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
  const liquid = `${surface} L${size} ${size} L0 ${size} Z`;

  const g = (n: string) => `orb-${n}-${id}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{overflow: 'visible', display: 'block', ...style}}>
      <defs>
        <clipPath id={g('clip')}>
          <circle cx={c} cy={c} r={r} />
        </clipPath>
        {/* dark glass body, a touch lighter toward the rim */}
        <radialGradient id={g('body')} cx="50%" cy="46%" r="50%">
          <stop offset="0" stopColor="#020A12" />
          <stop offset="0.62" stopColor="#04182A" />
          <stop offset="0.9" stopColor="#0A3A5C" />
          <stop offset="1" stopColor="#1B6FA0" />
        </radialGradient>
        {/* fresnel rim */}
        <radialGradient id={g('rim')} cx="50%" cy="50%" r="50%">
          <stop offset="0.8" stopColor="#38BDF8" stopOpacity="0" />
          <stop offset="0.95" stopColor="#4CC9FF" stopOpacity="0.38" />
          <stop offset="1" stopColor="#9BE7FF" stopOpacity="0.8" />
        </radialGradient>
        <linearGradient id={g('liquid')} x1="0" y1={level - A} x2="0" y2={size} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#B4FFF4" stopOpacity="0.95" />
          <stop offset="0.16" stopColor="#4FF0E0" stopOpacity="0.9" />
          <stop offset="0.45" stopColor="#1ED7B0" stopOpacity="0.35" />
          <stop offset="0.8" stopColor="#0A4D7A" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={g('edge')} x1="0" y1="0" x2={size} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7DF9FF" stopOpacity="0.2" />
          <stop offset="0.45" stopColor="#7DF9FF" />
          <stop offset="0.8" stopColor="#8A6CFF" />
          <stop offset="1" stopColor="#8A6CFF" stopOpacity="0.3" />
        </linearGradient>
        <radialGradient id={g('haze')} cx="32%" cy="38%" r="45%">
          <stop offset="0" stopColor="#5CC8FF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#5CC8FF" stopOpacity="0" />
        </radialGradient>
        <filter id={g('soft')} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={size * 0.03} />
        </filter>
        <filter id={g('glow')} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={size * 0.012} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* outer bloom */}
      <circle cx={c} cy={c} r={r * 1.02} fill="none" stroke="#2FA8FF" strokeOpacity={0.35 + 0.25 * energy} strokeWidth={size * 0.06} filter={`url(#${g('soft')})`} />

      <g clipPath={`url(#${g('clip')})`}>
        <circle cx={c} cy={c} r={r} fill={`url(#${g('body')})`} />
        <ellipse cx={c * 0.7} cy={c * 0.78} rx={r * 0.7} ry={r * 0.45} fill={`url(#${g('haze')})`} />
        <path d={liquid} fill={`url(#${g('liquid')})`} filter={`url(#${g('soft')})`} />
        <path d={surface} fill="none" stroke={`url(#${g('edge')})`} strokeWidth={size * 0.012} filter={`url(#${g('glow')})`} />
        {/* lower body darkening for depth */}
        <ellipse cx={c} cy={size * 1.02} rx={r * 0.95} ry={r * 0.5} fill="#020A12" opacity={0.75} filter={`url(#${g('soft')})`} />
        <circle cx={c} cy={c} r={r} fill={`url(#${g('rim')})`} />
        {/* specular */}
        <ellipse cx={c * 0.78} cy={c * 0.34} rx={r * 0.32} ry={r * 0.1} fill="#fff" opacity={0.12} filter={`url(#${g('soft')})`} />
      </g>
      <circle cx={c} cy={c} r={r - 0.75} fill="none" stroke="#9BE7FF" strokeOpacity={0.35} strokeWidth={1.5} />
    </svg>
  );
};
