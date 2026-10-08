import React from 'react';

type P = {size?: number; color?: string; style?: React.CSSProperties};

const svg = (size: number, style: React.CSSProperties | undefined, children: React.ReactNode, vb = '0 0 24 24') => (
  <svg width={size} height={size} viewBox={vb} style={{display: 'block', ...style}}>
    {children}
  </svg>
);

export const PlayIcon: React.FC<P> = ({size = 24, color = '#000', style}) =>
  svg(size, style, <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.6-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" fill={color} />);

export const PauseIcon: React.FC<P> = ({size = 24, color = '#000', style}) =>
  svg(
    size,
    style,
    <>
      <rect x="5.5" y="4" width="4.6" height="16" rx="1.2" fill={color} />
      <rect x="13.9" y="4" width="4.6" height="16" rx="1.2" fill={color} />
    </>,
  );

export const HomeIcon: React.FC<P> = ({size = 24, color = '#fff', style}) =>
  svg(size, style, <path d="M12 3 3 10v11h6.5v-6.5h5V21H21V10z" fill={color} />);

export const SearchIcon: React.FC<P> = ({size = 24, color = '#fff', style}) =>
  svg(
    size,
    style,
    <>
      <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke={color} strokeWidth="2.2" />
      <path d="m15.5 15.5 5 5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </>,
  );

export const LibraryIcon: React.FC<P> = ({size = 24, color = '#fff', style}) =>
  svg(
    size,
    style,
    <>
      <path d="M4 3v18M9 3v18" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d="m14 3.5 6 17" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </>,
  );

export const ShuffleIcon: React.FC<P> = ({size = 24, color = '#b3b3b3', style}) =>
  svg(
    size,
    style,
    <path
      d="M3 7h3.5c2 0 3.2 1 4.3 2.7l2.4 4.6C14.3 16 15.5 17 17.5 17H21M3 17h3.5c1.2 0 2.1-.4 2.8-1.1M14.7 8.1c.7-.7 1.6-1.1 2.8-1.1H21M18.5 4.5 21 7l-2.5 2.5M18.5 14.5 21 17l-2.5 2.5"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
  );

export const PrevIcon: React.FC<P> = ({size = 24, color = '#b3b3b3', style}) =>
  svg(
    size,
    style,
    <>
      <rect x="4.5" y="5" width="2.4" height="14" rx="1" fill={color} />
      <path d="M19.5 5.6v12.8a.9.9 0 0 1-1.4.75L8.6 12.75a.9.9 0 0 1 0-1.5l9.5-6.4a.9.9 0 0 1 1.4.75z" fill={color} />
    </>,
  );

export const NextIcon: React.FC<P> = ({size = 24, color = '#b3b3b3', style}) =>
  svg(
    size,
    style,
    <>
      <rect x="17.1" y="5" width="2.4" height="14" rx="1" fill={color} />
      <path d="M4.5 5.6v12.8a.9.9 0 0 0 1.4.75l9.5-6.4a.9.9 0 0 0 0-1.5L5.9 4.85a.9.9 0 0 0-1.4.75z" fill={color} />
    </>,
  );

export const RepeatIcon: React.FC<P> = ({size = 24, color = '#b3b3b3', style}) =>
  svg(
    size,
    style,
    <path
      d="M4 11V9a3 3 0 0 1 3-3h12m-3-3 3 3-3 3M20 13v2a3 3 0 0 1-3 3H5m3 3-3-3 3-3"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
  );

export const HeartIcon: React.FC<P & {filled?: boolean}> = ({size = 24, color = '#b3b3b3', style, filled}) =>
  svg(
    size,
    style,
    <path
      d="M12 20.5s-8-4.8-8-11A4.5 4.5 0 0 1 12 6.7 4.5 4.5 0 0 1 20 9.5c0 6.2-8 11-8 11z"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />,
  );

export const DownloadIcon: React.FC<P> = ({size = 24, color = '#b3b3b3', style}) =>
  svg(
    size,
    style,
    <>
      <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="1.8" />
      <path d="M12 7.5v8m-3.5-3.5 3.5 3.5 3.5-3.5" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>,
  );

export const MoreIcon: React.FC<P> = ({size = 24, color = '#b3b3b3', style}) =>
  svg(
    size,
    style,
    <>
      <circle cx="5" cy="12" r="1.9" fill={color} />
      <circle cx="12" cy="12" r="1.9" fill={color} />
      <circle cx="19" cy="12" r="1.9" fill={color} />
    </>,
  );

export const VolumeIcon: React.FC<P> = ({size = 24, color = '#b3b3b3', style}) =>
  svg(
    size,
    style,
    <>
      <path d="M3.5 9.5h3.5L12 5v14l-5-4.5H3.5z" fill={color} />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </>,
  );

export const PlusIcon: React.FC<P> = ({size = 24, color = '#b3b3b3', style}) =>
  svg(size, style, <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round" />);

export const ChevronIcon: React.FC<P & {dir?: 'left' | 'right'}> = ({size = 24, color = '#fff', style, dir = 'left'}) =>
  svg(
    size,
    style,
    <path
      d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
  );

export const ClockIcon: React.FC<P> = ({size = 24, color = '#b3b3b3', style}) =>
  svg(
    size,
    style,
    <>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke={color} strokeWidth="1.8" />
      <path d="M12 7.5V12l3 2" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </>,
  );

export const SparkleIcon: React.FC<P> = ({size = 24, color = '#1ED760', style}) =>
  svg(size, style, <path d="M12 2.5c.6 4.9 2.6 6.9 7.5 7.5-4.9.6-6.9 2.6-7.5 7.5-.6-4.9-2.6-6.9-7.5-7.5 4.9-.6 6.9-2.6 7.5-7.5zM19 15c.25 2 1.05 2.75 3 3-1.95.25-2.75 1-3 3-.25-2-1.05-2.75-3-3 1.95-.25 2.75-1 3-3z" fill={color} />);

export const WaveIcon: React.FC<P> = ({size = 24, color = '#1ED760', style}) =>
  svg(
    size,
    style,
    <path d="M3 12h1.5M7 8v8M10.5 5v14M14 9v6M17.5 6.5v11M21 12h-.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />,
  );

export const OfflineIcon: React.FC<P> = ({size = 24, color = '#1ED760', style}) =>
  svg(
    size,
    style,
    <>
      <path d="M12 3.5v11m-4.5-4.5 4.5 4.5 4.5-4.5" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19.5h14" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </>,
  );

export const NoAdsIcon: React.FC<P> = ({size = 24, color = '#1ED760', style}) =>
  svg(
    size,
    style,
    <>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke={color} strokeWidth="2.2" />
      <path d="m6 6 12 12" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </>,
  );

export const ArrowRightIcon: React.FC<P> = ({size = 24, color = '#000', style}) =>
  svg(size, style, <path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />);
