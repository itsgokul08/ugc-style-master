import React from 'react';

/** macOS-style arrow cursor. `press` 0..1 squashes it on click. */
export const Cursor: React.FC<{x: number; y: number; press?: number; opacity?: number}> = ({
  x,
  y,
  press = 0,
  opacity = 1,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      opacity,
      transform: `scale(${1 - press * 0.18})`,
      transformOrigin: '6px 4px',
      filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.55))',
      zIndex: 50,
    }}
  >
    <svg width="44" height="52" viewBox="0 0 22 26">
      <path
        d="M2 1.5v19.2l4.9-4.6 3.2 7.4 3.4-1.5-3.2-7.2h6.8z"
        fill="#fff"
        stroke="#000"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);
