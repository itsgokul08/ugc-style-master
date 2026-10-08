# Spotify — 20s SaaS motion promo

An unofficial concept promo, built in code with [Remotion](https://remotion.dev): 1920×1080, 60 fps, 20 s, with a synthesized soundtrack synced to the picture.

**Final render:** `out/spotify-promo.mp4`

## Storyboard (120 BPM, every cut lands on a beat)

| Time | Scene | Motion |
|---|---|---|
| 0–3s | **Hook**: "What does your day *sound* like?" | A green dot springs in and opens into a glowing silk-ribbon waveform that pulses with the beat. Words blur in one at a time, then the whole frame zooms through. |
| 3–6s | **Moods**: "Music for focus / the drive / the gym / every mood." | The headline sits on a glass panel lit from above. A curved 3D carousel of playlist cards wraps around the viewer and turns one card per beat, in sync with the changing word. |
| 6–11s | **Product** | A desktop app tilts up into place and its UI loads in a stagger. A cursor clicks play (ripple, pause icon, equalizer), then the camera pulls back. Feature chips (icon tile plus glowing label) pop in over the window edges, and the camera dives into the play button. |
| 11–14.5s | **AI DJ** | On a dark stage lit green from below, giant gradient type "Your · AI DJ" is split by the phone. A glass orb with a flowing liquid wave and a silk-ribbon voice wave sit on the phone, with glowing DJ callouts around it. Everything splits apart on exit. |
| 14.5–17s | **Scale**: "The world listens." | A huge thin headline over a lit, rotating globe (real continents, a network mesh that draws itself in, pulsing nodes, a rim light) and glass cards with counters for 600M+, 100M+ and 180+. |
| 17–20s | **Outro** | The logo pops with a shockwave, its arcs draw on, the wordmark wipes in, then "Music for everyone." and a CTA with a shimmer. |

## Commands

```bash
npm install
npm run audio    # regenerate public/soundtrack.wav (python3 + numpy)
npm run studio   # live preview / scrub timeline
npm run render   # -> out/spotify-promo.mp4
```

In a container without Remotion's Chrome download, add `--browser-executable=/path/to/chrome-headless-shell`.

## Structure

- `src/theme.ts` holds the timing (scene table, BPM), easing curves, springs and palette
- `src/scenes/S1–S6` has one file per scene, and each scene owns its entrance and exit
- `src/components/` contains the background (aurora, dot grid, grain), the silk-ribbon wave, the glass orb, the logo with draw-on arcs, the cursor, the generative album covers, the word reveal and the icons
- `scripts/make_audio.py` builds the soundtrack: a pad with sidechain, an arp with ping-pong delay, drums and bass, plus whooshes, clicks, pops, ticks, an impact and chimes, all placed at the video's cue times
- `scripts/stills.mjs` and `scripts/sheet.py` render QA stills and contact sheets

Fonts: Inter Display / Inter, standing in for Spotify's proprietary Circular. The artists, tracks and covers are fictional. Continent shapes come from `world-atlas` (Natural Earth, public domain).
