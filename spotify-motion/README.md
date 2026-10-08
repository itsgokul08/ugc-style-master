# Spotify — 20s SaaS motion promo

An unofficial concept promo, built in code with [Remotion](https://remotion.dev): 1920×1080, 60 fps, 20 s, with a synthesized soundtrack synced to the picture.

**Final render:** `out/spotify-promo.mp4`

## Storyboard (120 BPM, every cut lands on a beat)

| Time | Scene | Motion |
|---|---|---|
| 0–3s | **Hook**: "What does your day *sound* like?" | A green dot springs in and stretches into a beat-reactive equalizer. Words blur in one at a time, then the whole frame zooms through. |
| 3–6s | **Moods**: "Music for focus / the drive / the gym / every mood." | The word swaps like a slot machine on each beat while playlist covers fly in and stack in 3D. |
| 6–11s | **Product** | A desktop app tilts up into place and its UI loads in a stagger. A cursor clicks play (ripple, pause icon, equalizer), feature chips float in, and the camera dives into the play button. |
| 11–14.5s | **AI DJ** (on brand green) | A phone springs up with a voice orb, a waveform and karaoke-style captions, surrounded by floating album art. A dark panel then wipes up. |
| 14.5–17s | **Scale** | A dotted globe rises with connection arcs while the counters roll up to 600M+ listeners, 100M+ songs and 180+ markets. |
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
- `src/components/` contains the background (aurora, dot grid, grain), the logo with draw-on arcs, the cursor, the generative album covers, the word reveal and the icons
- `scripts/make_audio.py` builds the soundtrack: a pad with sidechain, an arp with ping-pong delay, drums and bass, plus whooshes, clicks, pops, ticks, an impact and chimes, all placed at the video's cue times
- `scripts/stills.mjs` and `scripts/sheet.py` render QA stills and contact sheets

Fonts: Inter Display / Inter, standing in for Spotify's proprietary Circular. The artists, tracks and covers are fictional.
