import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Background, Grain, Vignette} from './components/Background';
import {S1Hook} from './scenes/S1Hook';
import {S2Moods} from './scenes/S2Moods';
import {S3Product} from './scenes/S3Product';
import {S4DJ} from './scenes/S4DJ';
import {S5Stats} from './scenes/S5Stats';
import {S6Outro} from './scenes/S6Outro';
import {s, SCENES} from './theme';

const Scene: React.FC<{k: keyof typeof SCENES; children: React.ReactNode}> = ({k, children}) => {
  const {start, end} = SCENES[k];
  return (
    <Sequence name={k} from={s(start)} durationInFrames={s(end) - s(start)}>
      {children}
    </Sequence>
  );
};

export const SpotifyPromo: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Background />
    <Scene k="hook">
      <S1Hook />
    </Scene>
    <Scene k="moods">
      <S2Moods />
    </Scene>
    <Scene k="product">
      <S3Product />
    </Scene>
    <Scene k="dj">
      <S4DJ />
    </Scene>
    <Scene k="stats">
      <S5Stats />
    </Scene>
    <Scene k="outro">
      <S6Outro />
    </Scene>
    <Vignette />
    <Grain />
    <Audio src={staticFile('soundtrack.wav')} />
  </AbsoluteFill>
);
