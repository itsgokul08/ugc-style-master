import React from 'react';

type Props = {
  width: number;
  height: number;
  /** time in seconds (drives the flow) */
  t: number;
  /** 0..1 amplitude, e.g. audio-reactive */
  energy: number;
  /** 0..1 horizontal unfurl from the center */
  reveal?: number;
  strands?: number;
  points?: number;
  colors?: {edge: string; mid: string; core: string};
  glow?: number;
  strokeWidth?: number;
  id: string;
  style?: React.CSSProperties;
};

/**
 * Silky light-ribbon waveform: dozens of hair-thin strands that flow, twist and pinch
 * together. Overlapping strands add up (screen blend) into a bright core with a soft bloom.
 */
export const SilkWave: React.FC<Props> = ({
  width,
  height,
  t,
  energy,
  reveal = 1,
  strands = 64,
  points = 110,
  colors = {edge: '#7C3AED', mid: '#1ED760', core: '#E4FFEE'},
  glow = 1,
  strokeWidth = 1.2,
  id,
  style,
}) => {
  const cx = width / 2;
  const cy = height / 2;
  const half = (width / 2) * Math.max(0.0001, reveal);
  const amp = height * 0.5;

  const paths: {d: string; v: number}[] = [];
  for (let s = 0; s < strands; s++) {
    const v = s / (strands - 1) - 0.5; // -0.5..0.5 across the ribbon
    let d = '';
    for (let j = 0; j <= points; j++) {
      const xr = (j / points) * 2 - 1; // -1..1 within the revealed span
      const x = cx + xr * half;
      const xa = (x - cx) / (width / 2); // absolute position, keeps the shape stable while unfurling
      const env = Math.pow(Math.cos((xr * Math.PI) / 2), 1.5);
      const w1 = Math.sin(xa * 2.4 + t * 1.25 + v * 1.1);
      const w2 = Math.sin(xa * 4.9 - t * 1.8 + v * 2.2) * 0.32;
      const twist = Math.cos(xa * 3.1 - t * 0.85 + 0.5);
      const y = cy + env * amp * (energy * (0.6 * w1 + 0.25 * w2) + v * 1.35 * (0.22 + 0.78 * twist) * (0.5 + 0.5 * energy));
      d += `${j === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    paths.push({d, v});
  }

  const gid = `silk-grad-${id}`;
  const fid = `silk-blur-${id}`;
  const coreId = `silk-core-${id}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{overflow: 'visible', display: 'block', ...style}}>
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={width} y2={0}>
          <stop offset="0" stopColor={colors.edge} stopOpacity="0" />
          <stop offset="0.16" stopColor={colors.edge} stopOpacity="0.9" />
          <stop offset="0.36" stopColor={colors.mid} />
          <stop offset="0.5" stopColor={colors.core} />
          <stop offset="0.64" stopColor={colors.mid} />
          <stop offset="0.84" stopColor={colors.edge} stopOpacity="0.9" />
          <stop offset="1" stopColor={colors.edge} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={coreId}>
          <stop offset="0" stopColor={colors.core} stopOpacity="0.6" />
          <stop offset="0.45" stopColor={colors.mid} stopOpacity="0.18" />
          <stop offset="1" stopColor={colors.mid} stopOpacity="0" />
        </radialGradient>
        <filter id={fid} x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation={Math.max(2, height * 0.035)} />
        </filter>
      </defs>
      {/* soft bloom behind the core */}
      <ellipse cx={cx} cy={cy} rx={half * 0.75} ry={amp * 0.8} fill={`url(#${coreId})`} opacity={glow * (0.5 + 0.5 * energy)} />
      <g id={`silk-strands-${id}`} style={{mixBlendMode: 'screen'}}>
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke={`url(#${gid})`}
            strokeWidth={strokeWidth}
            opacity={0.22 + 0.3 * (1 - Math.abs(p.v) * 2)}
          />
        ))}
      </g>
      {/* bloom: the same strands, blurred and screened on top */}
      {glow > 0 && <use href={`#silk-strands-${id}`} filter={`url(#${fid})`} opacity={Math.min(1, 1.1 * glow)} style={{mixBlendMode: 'screen'}} />}
    </svg>
  );
};
