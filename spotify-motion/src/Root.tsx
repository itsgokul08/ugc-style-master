import React from 'react';
import {Composition} from 'remotion';
import {SpotifyPromo} from './Video';
import {DURATION_SEC, FPS, HEIGHT, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="SpotifyPromo"
    component={SpotifyPromo}
    durationInFrames={DURATION_SEC * FPS}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
