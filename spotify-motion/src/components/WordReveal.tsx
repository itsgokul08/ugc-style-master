import React from 'react';
import {useCurrentFrame} from 'remotion';
import {EASE, FPS, tween} from '../theme';

type Word = {text: string; style?: React.CSSProperties};

/**
 * Staggered per-word reveal: each word rises, un-blurs and fades in.
 * `start` and `stagger` are in seconds relative to the parent sequence.
 */
export const WordReveal: React.FC<{
  words: (string | Word)[];
  start: number;
  stagger?: number;
  duration?: number;
  rise?: number;
  blur?: number;
  style?: React.CSSProperties;
  wordGap?: string;
}> = ({words, start, stagger = 0.06, duration = 0.7, rise = 0.55, blur = 16, style, wordGap = '0.24em'}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', columnGap: wordGap, ...style}}>
      {words.map((w, i) => {
        const word = typeof w === 'string' ? {text: w} : w;
        const t0 = start + i * stagger;
        const p = tween(frame, t0, t0 + duration, 0, 1, EASE.out);
        const o = tween(frame, t0, t0 + duration * 0.5, 0, 1, EASE.outSoft);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${(1 - p) * rise}em) rotate(${(1 - p) * 4}deg)`,
              transformOrigin: 'left bottom',
              filter: `blur(${(1 - p) * blur}px)`,
              opacity: o,
              ...word.style,
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};

export const useLocalSec = () => useCurrentFrame() / FPS;
