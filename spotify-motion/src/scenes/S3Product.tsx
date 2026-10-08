import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Cover, PALETTES, Palette} from '../components/Cover';
import {Cursor} from '../components/Cursor';
import {
  ClockIcon,
  DownloadIcon,
  HeartIcon,
  HomeIcon,
  LibraryIcon,
  MoreIcon,
  NextIcon,
  NoAdsIcon,
  OfflineIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  PrevIcon,
  RepeatIcon,
  SearchIcon,
  ShuffleIcon,
  SparkleIcon,
  VolumeIcon,
  WaveIcon,
} from '../components/Icons';
import {SpotifyLogo} from '../components/SpotifyLogo';
import {C, EASE, FONT, FONT_TEXT, FPS, lerp, sp, tween} from '../theme';

// Window geometry (screen space)
const WX = 210;
const WY = 100;
const WW = 1500;
const WH = 880;
const TOP = 64;
const PLAYER = 88;
const SIDE = 320;
const MAIN_X = 8 + SIDE + 8;
const MAIN_W = WW - MAIN_X - 8;
const MAIN_H = WH - TOP - PLAYER;
const HEADER_H = 290;
// Big green play button center
const PLAY_X = WX + MAIN_X + 64;
const PLAY_Y = WY + TOP + HEADER_H + 50;

const CLICK = 2.5; // local seconds (global 8.5s, on the beat)

const LIBRARY: {name: string; sub: string; p: Palette; v: number}[] = [
  {name: 'Liked Songs', sub: 'Playlist · 1,284 songs', p: PALETTES.indigo, v: 2},
  {name: 'Daily Mix 1', sub: 'Playlist · Made for you', p: PALETTES.green, v: 3},
  {name: 'Discover Weekly', sub: 'Playlist · Made for you', p: PALETTES.teal, v: 0},
  {name: 'Night Drive', sub: 'Playlist · You', p: PALETTES.violet, v: 1},
  {name: 'Deep Focus', sub: 'Playlist · You', p: PALETTES.blue, v: 0},
  {name: 'Beast Mode', sub: 'Playlist · You', p: PALETTES.ember, v: 2},
  {name: 'Sunday Reset', sub: 'Playlist · You', p: PALETTES.sun, v: 3},
];

const TRACKS: {title: string; artist: string; album: string; time: string; p: Palette; v: number}[] = [
  {title: 'Velvet Echoes', artist: 'Kairo', album: 'Afterlight', time: '3:24', p: PALETTES.rose, v: 1},
  {title: 'Satellite Hearts', artist: 'Juniper Lane', album: 'Orbit Season', time: '2:58', p: PALETTES.teal, v: 3},
  {title: 'Golden Hour Drive', artist: 'Mira Sol', album: 'Coastline', time: '3:41', p: PALETTES.sun, v: 0},
  {title: 'Slow Bloom', artist: 'Nadia Rey', album: 'Greenhouse', time: '4:05', p: PALETTES.green, v: 2},
  {title: 'Neon Skyline', artist: 'Polar Youth', album: 'City Static', time: '3:12', p: PALETTES.blue, v: 1},
];

const CHIPS = [
  {x: 255, y: 250, icon: WaveIcon, title: '100M+ songs', sub: 'and counting', at: 2.78},
  {x: 1290, y: 215, icon: NoAdsIcon, title: 'Ad-free listening', sub: 'with Premium', at: 2.9},
  {x: 1330, y: 610, icon: OfflineIcon, title: 'Offline mode', sub: 'download anything', at: 3.02},
  {x: 265, y: 600, icon: SparkleIcon, title: 'Lossless audio', sub: 'up to 24-bit / 44.1 kHz', at: 3.14},
];

const MiniEq: React.FC<{t: number; color?: string}> = ({t, color = C.green}) => (
  <div style={{display: 'flex', alignItems: 'flex-end', gap: 3, height: 16, width: 18}}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: 4,
          borderRadius: 1,
          background: color,
          height: 4 + 12 * Math.abs(Math.sin(t * (7 + i * 2.3) + i * 1.7)),
        }}
      />
    ))}
  </div>
);

/** 6–11s · The product: app flies in, cursor hits play, features pop, camera dives into the play button. */
export const S3Product: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  const reveal = (at: number, dist = 24): React.CSSProperties => {
    const p = tween(frame, at, at + 0.6, 0, 1, EASE.out);
    return {opacity: p, transform: `translateY(${(1 - p) * dist}px)`};
  };

  // Window entrance (3D tilt settle)
  const enter = sp(frame, 0, {damping: 20, stiffness: 90, mass: 1.1});
  const enterOpacity = tween(frame, 0, 0.25, 0, 1);

  // Click & playback
  const pressDown = tween(frame, CLICK - 0.08, CLICK, 0, 1, EASE.outSoft);
  const pressUp = tween(frame, CLICK, CLICK + 0.14, 0, 1, EASE.outSoft);
  const press = pressDown * (1 - pressUp);
  const playing = t >= CLICK;
  const sinceClick = Math.max(0, t - CLICK);
  const ripple = tween(frame, CLICK, CLICK + 0.7, 0, 1, EASE.out);
  const btnPop = sp(frame, CLICK, {damping: 8, stiffness: 260});

  // Cursor path (quadratic bezier)
  const mv = tween(frame, 1.5, 2.38, 0, 1, EASE.inOut);
  const [x0, y0, cx, cy, x1, y1] = [1780, 1060, 1350, 560, PLAY_X - 4, PLAY_Y - 3];
  const curX = (1 - mv) ** 2 * x0 + 2 * (1 - mv) * mv * cx + mv ** 2 * x1;
  const curY = (1 - mv) ** 2 * y0 + 2 * (1 - mv) * mv * cy + mv ** 2 * y1;
  const curOpacity = tween(frame, 1.45, 1.6, 0, 1) * (1 - tween(frame, 3.1, 3.35, 0, 1));

  // Camera: gentle push, click punch, then a dive into the play button.
  const push = tween(frame, 0.9, 2.45, 0, 0.06, EASE.inOutSoft);
  const punch = playing ? Math.sin(Math.min(1, sinceClick / 0.35) * Math.PI) * 0.018 : 0;
  const drift = tween(frame, 2.6, 4.3, 0, 0.05, EASE.inOutSoft);
  const dive = tween(frame, 4.25, 5.0, 0, 1, EASE.in);
  const camScale = 1 + push + punch + drift; // around frame center, so edge chips stay in frame
  const diveScale = 1 + dive * 26; // around the play button

  // Green takeover that hands off to the DJ scene
  const fill = tween(frame, 4.5, 4.98, 0, 1, EASE.in);

  const elapsed = 41 + Math.floor(sinceClick * 1); // seconds into the track
  const progress = (elapsed + (sinceClick % 1)) / 204;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `scale(${diveScale})`,
          transformOrigin: `${960 + (PLAY_X - 960) * camScale}px ${540 + (PLAY_Y - 540) * camScale}px`,
          filter: dive > 0.02 ? `blur(${dive * 10}px)` : undefined,
        }}
      >
      <AbsoluteFill style={{transform: `scale(${camScale})`, transformOrigin: '960px 540px'}}>
        {/* Window with 3D entrance */}
        <div style={{position: 'absolute', inset: 0, perspective: 2200}}>
          <div
            style={{
              position: 'absolute',
              left: WX,
              top: WY,
              width: WW,
              height: WH,
              borderRadius: 18,
              background: C.black,
              overflow: 'hidden',
              opacity: enterOpacity,
              transform: `translateY(${(1 - enter) * 520}px) rotateX(${(1 - enter) * 32}deg) rotateZ(${(1 - enter) * -5}deg) scale(${lerp(0.84, 1, enter)})`,
              transformOrigin: '50% 100%',
              boxShadow: '0 80px 160px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.09), 0 0 120px rgba(30,215,96,0.08)',
              fontFamily: FONT_TEXT,
              color: C.white,
            }}
          >
            {/* Top bar */}
            <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: TOP, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16}}>
              <div style={{display: 'flex', gap: 9}}>
                {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
                  <div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c, opacity: 0.85}} />
                ))}
              </div>
              <div style={{marginLeft: 24, ...reveal(0.35, 10)}}>
                <SpotifyLogo size={34} color={C.white} />
              </div>
              <div style={{flex: 1, display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center', ...reveal(0.4, 10)}}>
                <div style={{width: 48, height: 48, borderRadius: 24, background: C.elevated, display: 'grid', placeItems: 'center'}}>
                  <HomeIcon size={24} />
                </div>
                <div
                  style={{
                    width: 470,
                    height: 48,
                    borderRadius: 24,
                    background: C.elevated,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '0 18px',
                    color: C.sub,
                    fontSize: 17,
                  }}
                >
                  <SearchIcon size={22} color={C.sub} />
                  What do you want to play?
                </div>
              </div>
              <div style={{width: 40, height: 40, borderRadius: 20, background: 'linear-gradient(135deg,#FF9F45,#E8115B)', border: '4px solid #1f1f1f', ...reveal(0.45, 10)}} />
            </div>

            {/* Sidebar */}
            <div
              style={{
                position: 'absolute',
                left: 8,
                top: TOP,
                width: SIDE,
                height: MAIN_H,
                borderRadius: 10,
                background: C.panel,
                padding: '20px 14px',
                boxSizing: 'border-box',
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px', fontWeight: 700, fontSize: 18, ...reveal(0.4)}}>
                <LibraryIcon size={24} />
                Your Library
                <div style={{marginLeft: 'auto'}}>
                  <PlusIcon size={22} />
                </div>
              </div>
              <div style={{display: 'flex', gap: 8, margin: '18px 8px 14px', ...reveal(0.46)}}>
                {['Playlists', 'Artists', 'Albums'].map((l) => (
                  <div key={l} style={{padding: '7px 14px', borderRadius: 16, background: C.elevated, fontSize: 14, fontWeight: 500}}>
                    {l}
                  </div>
                ))}
              </div>
              {LIBRARY.map((it, i) => (
                <div
                  key={it.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 8,
                    borderRadius: 6,
                    background: i === 1 ? C.elevated : 'transparent',
                    ...reveal(0.5 + i * 0.05),
                  }}
                >
                  <Cover palette={it.p} size={52} radius={5} variant={it.v} />
                  <div>
                    <div style={{fontSize: 16, fontWeight: 600, color: i === 1 && playing ? C.green : C.white}}>{it.name}</div>
                    <div style={{fontSize: 13.5, color: C.sub, marginTop: 4}}>{it.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main panel */}
            <div
              style={{
                position: 'absolute',
                left: MAIN_X,
                top: TOP,
                width: MAIN_W,
                height: MAIN_H,
                borderRadius: 10,
                overflow: 'hidden',
                background: `linear-gradient(180deg, #1F7A45 0%, #14432A 34%, ${C.panel} 62%)`,
              }}
            >
              {/* Header */}
              <div style={{position: 'absolute', left: 32, bottom: MAIN_H - HEADER_H + 26, display: 'flex', alignItems: 'flex-end', gap: 30}}>
                <div style={{...reveal(0.45, 30), boxShadow: '0 20px 60px rgba(0,0,0,0.5)'}}>
                  <Cover palette={PALETTES.green} size={220} radius={6} variant={3} title="Daily Mix 1" titleSize={30} />
                </div>
                <div style={{paddingBottom: 6}}>
                  <div style={{fontSize: 16, fontWeight: 600, ...reveal(0.55)}}>Playlist</div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 96,
                      fontWeight: 900,
                      letterSpacing: '-0.045em',
                      lineHeight: 1,
                      margin: '10px 0 18px',
                      ...reveal(0.6, 40),
                    }}
                  >
                    Daily Mix 1
                  </div>
                  <div style={{fontSize: 16, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 8, ...reveal(0.7)}}>
                    <SpotifyLogo size={22} />
                    <b style={{color: C.white}}>Made for you</b> · Kairo, Juniper Lane, Mira Sol and more · 50 songs, about 3 hr
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div style={{position: 'absolute', left: 32, top: HEADER_H, height: 100, display: 'flex', alignItems: 'center', gap: 30}}>
                <div style={{position: 'relative', width: 64, height: 64, ...reveal(0.75, 16)}}>
                  {/* ripple */}
                  {ripple > 0 && ripple < 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 32 - (32 + ripple * 80),
                        top: 32 - (32 + ripple * 80),
                        width: (32 + ripple * 80) * 2,
                        height: (32 + ripple * 80) * 2,
                        borderRadius: '50%',
                        border: `3px solid ${C.green}`,
                        opacity: (1 - ripple) * 0.8,
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      background: C.green,
                      display: 'grid',
                      placeItems: 'center',
                      transform: `scale(${(1 - press * 0.12) * (playing ? lerp(0.9, 1, btnPop) : 1)})`,
                      boxShadow: `0 8px 30px rgba(30,215,96,${playing ? 0.45 : 0.25})`,
                    }}
                  >
                    {playing ? <PauseIcon size={28} /> : <PlayIcon size={30} style={{marginLeft: 3}} />}
                  </div>
                </div>
                <div style={{...reveal(0.8, 16)}}>
                  <ShuffleIcon size={34} color={C.sub} />
                </div>
                <div style={{...reveal(0.84, 16)}}>
                  <DownloadIcon size={34} color={C.sub} />
                </div>
                <div style={{...reveal(0.88, 16)}}>
                  <MoreIcon size={34} color={C.sub} />
                </div>
              </div>

              {/* Track list */}
              <div style={{position: 'absolute', left: 24, right: 24, top: HEADER_H + 100}}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 300px 80px',
                    padding: '0 16px 10px',
                    color: C.sub,
                    fontSize: 14,
                    borderBottom: `1px solid ${C.line}`,
                    ...reveal(0.85, 10),
                  }}
                >
                  <div>#</div>
                  <div>Title</div>
                  <div>Album</div>
                  <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <ClockIcon size={18} />
                  </div>
                </div>
                {TRACKS.map((tr, i) => {
                  const active = playing && i === 0;
                  return (
                    <div
                      key={tr.title}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '40px 1fr 300px 80px',
                        alignItems: 'center',
                        padding: '8px 16px',
                        marginTop: i === 0 ? 8 : 0,
                        borderRadius: 6,
                        background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                        ...reveal(0.9 + i * 0.06, 20),
                      }}
                    >
                      <div style={{color: C.sub, fontSize: 16}}>{active ? <MiniEq t={t} /> : i + 1}</div>
                      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                        <Cover palette={tr.p} size={44} radius={4} variant={tr.v} />
                        <div>
                          <div style={{fontSize: 17, fontWeight: 500, color: active ? C.green : C.white}}>{tr.title}</div>
                          <div style={{fontSize: 14, color: C.sub, marginTop: 3}}>{tr.artist}</div>
                        </div>
                      </div>
                      <div style={{color: C.sub, fontSize: 15}}>{tr.album}</div>
                      <div style={{color: C.sub, fontSize: 15, textAlign: 'right'}}>{tr.time}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Now playing bar */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: PLAYER,
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                ...reveal(0.95, 30),
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: 14, width: 380}}>
                <Cover palette={PALETTES.rose} size={58} radius={5} variant={1} />
                <div>
                  <div style={{fontSize: 16, fontWeight: 600}}>Velvet Echoes</div>
                  <div style={{fontSize: 13.5, color: C.sub, marginTop: 4}}>Kairo</div>
                </div>
                <HeartIcon size={22} color={C.green} filled style={{marginLeft: 14}} />
              </div>
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
                  <ShuffleIcon size={20} color={C.green} />
                  <PrevIcon size={22} />
                  <div style={{width: 38, height: 38, borderRadius: 19, background: C.white, display: 'grid', placeItems: 'center'}}>
                    {playing ? <PauseIcon size={18} /> : <PlayIcon size={20} style={{marginLeft: 2}} />}
                  </div>
                  <NextIcon size={22} />
                  <RepeatIcon size={20} />
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: C.sub, fontVariantNumeric: 'tabular-nums'}}>
                  <span>{`0:${String(playing ? elapsed : 41).padStart(2, '0')}`}</span>
                  <div style={{width: 520, height: 4, borderRadius: 2, background: '#4D4D4D', position: 'relative'}}>
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${(playing ? progress : 41 / 204) * 100}%`,
                        borderRadius: 2,
                        background: playing ? C.green : C.white,
                      }}
                    />
                  </div>
                  <span>3:24</span>
                </div>
              </div>
              <div style={{width: 380, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10}}>
                <VolumeIcon size={22} />
                <div style={{width: 110, height: 4, borderRadius: 2, background: '#4D4D4D'}}>
                  <div style={{width: '70%', height: '100%', borderRadius: 2, background: C.white}} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature chips, floating in front of the window */}
        {CHIPS.map((ch, i) => {
          const p = sp(frame, ch.at, {damping: 13, stiffness: 160});
          const out = tween(frame, 4.0 + i * 0.03, 4.3 + i * 0.03, 0, 1, EASE.in);
          const bob = Math.sin(t * 2 + i * 1.4) * 7;
          const Icon = ch.icon;
          const fromLeft = ch.x < 960;
          return (
            <div
              key={ch.title}
              style={{
                position: 'absolute',
                left: ch.x,
                top: ch.y,
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '18px 28px 18px 18px',
                borderRadius: 22,
                background: 'linear-gradient(180deg, rgba(40,40,40,0.96), rgba(22,22,22,0.96))',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
                fontFamily: FONT_TEXT,
                opacity: Math.min(1, p * 1.5) * (1 - out),
                transform: `translate(${(1 - p) * (fromLeft ? -80 : 80)}px, ${bob + (1 - p) * 40}px) scale(${lerp(0.6, 1, p) * (1 - out * 0.3)})`,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'rgba(30,215,96,0.14)',
                  border: '1px solid rgba(30,215,96,0.35)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon size={30} color={C.green} />
              </div>
              <div>
                <div style={{fontSize: 27, fontWeight: 700, color: C.white, letterSpacing: '-0.01em'}}>{ch.title}</div>
                <div style={{fontSize: 18, color: C.sub, marginTop: 3}}>{ch.sub}</div>
              </div>
            </div>
          );
        })}

        <Cursor x={curX} y={curY} press={press} opacity={curOpacity} />
      </AbsoluteFill>
      </AbsoluteFill>

      {/* Green circle takeover */}
      {fill > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 960 + (PLAY_X - 960) * camScale - fill * 2400,
            top: 540 + (PLAY_Y - 540) * camScale - fill * 2400,
            width: fill * 4800,
            height: fill * 4800,
            borderRadius: '50%',
            background: C.green,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
