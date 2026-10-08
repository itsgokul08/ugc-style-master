import React from 'react';

export type Palette = {a: string; b: string; c: string};

export const PALETTES: Record<string, Palette> = {
  blue: {a: '#0D1B4C', b: '#3D6BFF', c: '#9FC2FF'},
  violet: {a: '#2A0B4F', b: '#8D2BE2', c: '#FF6EC7'},
  ember: {a: '#4A0A12', b: '#E8115B', c: '#FF9F45'},
  green: {a: '#032614', b: '#1DB954', c: '#B6FFCF'},
  teal: {a: '#022B33', b: '#0FA3B1', c: '#9DF3E5'},
  sun: {a: '#4A2600', b: '#F59B23', c: '#FFE38A'},
  rose: {a: '#3B0A2A', b: '#E91E63', c: '#FFB3D1'},
  indigo: {a: '#140B3B', b: '#5038A0', c: '#B39DFF'},
};

/**
 * Generative album-art: layered gradients + shapes. Pure CSS so it stays crisp at any size.
 * `variant` changes the composition.
 */
export const Cover: React.FC<{
  palette: Palette;
  size: number;
  radius?: number;
  variant?: number;
  title?: string;
  titleSize?: number;
  style?: React.CSSProperties;
  label?: string;
}> = ({palette, size, radius = 8, variant = 0, title, titleSize, style, label}) => {
  const {a, b, c} = palette;
  const v = variant % 4;
  const art =
    v === 0
      ? `radial-gradient(circle at 72% 28%, ${c} 0%, ${b} 28%, transparent 60%), linear-gradient(135deg, ${b} 0%, ${a} 85%)`
      : v === 1
        ? `radial-gradient(circle at 30% 75%, ${c} 0%, transparent 45%), conic-gradient(from 200deg at 60% 40%, ${a}, ${b}, ${c}, ${b}, ${a})`
        : v === 2
          ? `linear-gradient(160deg, ${c} 0%, ${b} 35%, ${a} 100%)`
          : `radial-gradient(ellipse at 50% 110%, ${c} 0%, ${b} 40%, ${a} 80%)`;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: art,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        ...style,
      }}
    >
      {v === 0 && (
        <div
          style={{
            position: 'absolute',
            width: size * 0.9,
            height: size * 0.9,
            left: -size * 0.25,
            bottom: -size * 0.45,
            borderRadius: '50%',
            border: `${Math.max(2, size * 0.035)}px solid ${c}`,
            opacity: 0.5,
          }}
        />
      )}
      {v === 2 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `repeating-linear-gradient(90deg, transparent 0 ${size * 0.08}px, rgba(255,255,255,0.10) ${size * 0.08}px ${size * 0.1}px)`,
            maskImage: 'linear-gradient(180deg, transparent 20%, black 100%)',
          }}
        />
      )}
      {v === 3 && (
        <div
          style={{
            position: 'absolute',
            width: size * 0.5,
            height: size * 0.5,
            left: size * 0.25,
            top: size * 0.14,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, #fff 0%, ${c} 30%, ${b} 100%)`,
            boxShadow: `0 0 ${size * 0.2}px ${c}`,
          }}
        />
      )}
      {label && (
        <div
          style={{
            position: 'absolute',
            left: size * 0.07,
            top: size * 0.07,
            fontFamily: '"Inter", sans-serif',
            fontWeight: 700,
            fontSize: size * 0.045,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          {label}
        </div>
      )}
      {title && (
        <div
          style={{
            position: 'absolute',
            left: size * 0.07,
            right: size * 0.07,
            bottom: size * 0.06,
            fontFamily: '"Inter Display", sans-serif',
            fontWeight: 800,
            fontSize: titleSize ?? size * 0.15,
            lineHeight: 0.92,
            letterSpacing: '-0.035em',
            color: '#fff',
            textShadow: '0 4px 24px rgba(0,0,0,0.25)',
          }}
        >
          {title}
        </div>
      )}
    </div>
  );
};
