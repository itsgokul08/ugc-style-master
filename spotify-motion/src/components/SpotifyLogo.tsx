import React from 'react';
import {C} from '../theme';

// Centerlines of the three sound-wave arcs (24x24 space), widest on top.
const ARCS = [
  {d: 'M4.75 8.85 C 8.8 7.55, 15.4 7.8, 19.3 10.15', w: 1.62, len: 15.2},
  {d: 'M5.45 12.2 C 9.4 11.05, 14.8 11.6, 18.35 13.75', w: 1.38, len: 13.4},
  {d: 'M6.05 15.95 C 9.9 15.05, 13.9 15.4, 16.85 17.15', w: 1.15, len: 11.2},
];

type Props = {
  size: number;
  /** 0..1 per arc draw progress */
  arcs?: [number, number, number];
  circleScale?: number;
  color?: string;
  arcColor?: string;
  style?: React.CSSProperties;
};

export const SpotifyLogo: React.FC<Props> = ({
  size,
  arcs = [1, 1, 1],
  circleScale = 1,
  color = C.green,
  arcColor = '#000',
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block', overflow: 'visible', ...style}}>
    <circle cx="12" cy="12" r={12 * circleScale} fill={color} />
    {ARCS.map((a, i) => (
      <path
        key={i}
        d={a.d}
        fill="none"
        stroke={arcColor}
        strokeWidth={a.w}
        strokeLinecap="round"
        strokeDasharray={a.len}
        strokeDashoffset={a.len * (1 - arcs[i])}
        opacity={arcs[i] > 0.001 ? 1 : 0}
      />
    ))}
  </svg>
);
