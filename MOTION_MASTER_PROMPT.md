# Master prompt: SaaS-style motion video

Paste everything below the line into a new session. Fill in the **Project brief** first. Any field left blank lets Claude choose and tell you what it picked.

---

You are my motion designer and engineer. Build a premium, SaaS-style product motion video **in code** using Remotion (React), render it to MP4 and deliver it. Give it your full creative effort: it should feel like a top-tier launch film, not a slideshow.

## 1. Project brief (fill this in)

- **Brand / product:** …
- **What it does (one line):** …
- **Audience and goal:** e.g. launch teaser, feature promo, social ad
- **Length:** 20s (default) · **Format:** 1920×1080 at 60fps (default; say if you want 1080×1920 or 1080×1080)
- **Brand colours:** primary …, secondary …, background … (if blank, use the brand's public palette)
- **Logo:** attached / describe it / draw a faithful recreation
- **Key messages (3–5, in order):** …
- **Features to show (2–4):** …
- **Proof numbers (verified only):** …
- **CTA and URL:** …
- **Reference images or videos:** attached (match their *style*, adapted to the brand palette)
- **Things to avoid:** …

## 2. Tech setup (do this, don't ask)

- A Remotion project in its own folder (`<brand>-motion/`), with React and TypeScript in strict mode and exact pinned versions.
- In a cloud container, render with the preinstalled headless shell: `--browser-executable=/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell --concurrency=4`. Output H.264 at CRF 16, yuv420p, JPEG frames at quality 95.
- Structure:
  - `src/theme.ts`: FPS, scene timing table, BPM, easings, spring and tween helpers, palette and type tokens. One source of truth.
  - `src/scenes/S1…S6.tsx`: one file per scene. Each scene owns its entrance **and** exit.
  - `src/components/`: reusable pieces (background or stage, drift camera, logo, cursor, cards, icons, word reveal).
  - `scripts/make_audio.py`: soundtrack generator. `scripts/stills.mjs` and `scripts/sheet.py`: QA stills and contact sheets.
- Everything must be deterministic, with no `Math.random()`. Use a seeded `rand(seed)`.
- Add a README with the storyboard table and the commands (`npm run studio` / `audio` / `render`).
- Commit to the working branch and push. Send me the MP4 as a file every time it changes.

## 3. Story structure (default 20s arc; adapt to the brief)

Use a 120 BPM grid (beat = 0.5s, bar = 2s). **Every cut lands on a beat.**

| Time | Scene | Purpose |
|---|---|---|
| 0–3s | Hook | A question or tension line. Brand-coloured abstract motion, such as a dot that opens into a waveform. |
| 3–6s | Value | The core promise, with a changing word swapped on each beat and synced to a visual, such as a 3D carousel. |
| 6–11s | Product | A real-looking UI mock-up: 3D tilt-in, staggered UI load, cursor click, camera pull-back, feature cards around the window. |
| 11–14.5s | Hero feature | A cinematic stage: giant split headline behind a device, glowing callouts, a signature visual (orb or object). |
| 14.5–17s | Proof | Large-scale visual (e.g. a lit globe) with glass stat cards counting up. |
| 17–20s | Outro | Logo build (pop, draw-on, wordmark wipe), tagline, CTA button with shimmer, URL. |

Use a **different transition** for each cut, and make each one motivated: zoom-through with blur, slide with blur, a camera dive into a button that floods the screen with brand colour, a split exit (words fly apart, the device lifts out), sinking out plus blurring out into a logo pop.

## 4. Visual system (the look I want)

**Typography (on every screen):**
- Headlines: Inter Display **weight 300**, letter-spacing −0.035em, filled with a vertical gradient from white (held to 25%) to `rgba(255,255,255,0.55)`. Accent words fade from white into the brand colour.
- Above each headline, a small subtitle: Inter, 26px, sentence case, `rgba(255,255,255,0.55)`. Use sentence case, not letter-spaced caps.
- Keep text bold only where reality is bold: the brand wordmark, and small UI labels inside product mock-ups. Large titles inside a mock-up still use the thin headline style.
- Numbers are large (around 90px) in thin or regular weight with tabular figures, and the suffix (M+, %) is in the brand colour.

**Colour and light:**
- A dark "stage": near-black with **brand-coloured light rising from below**, a faint complementary wash from above, a subtle dot grid, film grain and a vignette.
- **Adjacent scenes must share the same palette and stage**, so a cut never changes the colour temperature. Never drift into off-brand tints (for example lime or olive on a green brand).
- When adapting a reference image, keep its style, lighting and composition, but recolour it into the brand palette. Say so, and offer the exact reference colours as an option.

**Signature components (reuse or adapt):**
- **Silk-ribbon waveform:** around 100 hair-thin strands that flow, twist and pinch, with screen blending, a bright core and a blurred bloom. It reacts to the beat.
- **Glass orb:** dark glass body, fresnel rim, a band of liquid light with a sharp glowing wave edge, and a specular highlight. It sloshes with "voice" energy.
- **Curved 3D carousel:** cards on a concave cylinder (`translateZ(R) rotateY(θ) translateZ(-R)`). The centre card gets a glow and a play button, the next card arrives from the right, and it keeps turning slowly between beats.
- **Glass headline panel** lit from above, with the carousel overlapping its lower edge.
- **Feature callouts:** a brand-colour icon tile (with a "live" ping dot) plus a separate glowing label pill that slides out from behind it, placed **straddling the edges** of the product window.
- **Glowing capsules:** pills with a light running around the border (an animated conic gradient) and a spinner icon, tucked partly behind the device.
- **Giant split type:** two huge words with the device between them, partly covering the inner letters but keeping both words readable.
- **Lit network globe:** orthographic d3-geo projection with real continents (`world-atlas`), light land on a dark ocean, a nearest-neighbour mesh that draws itself in, pulsing nodes, a rim light, atmosphere glow, a light streak and stars.
- **Glass stat cards:** a frosted card (backdrop blur) containing an icon circle, a counter and a label.
- **Product UI mock-ups** are faithful to the real product's layout. Content (artists, users, data) is fictional.

## 5. Motion rules

- Easing: expo-out for entrances, expo-in for exits, and springs for anything that lands. Use overshoot on pops and buttons.
- Text reveals word by word or letter by letter, rising, un-blurring and fading in with a 25–90ms stagger.
- **Nothing is ever still.** Every scene sits in a slow camera `Drift` (push-in of about 5–9%, a gentle pan and a breathing float) that runs right up to its exit. Add continuous micro-motion: floating cards, swaying devices, a carousel that keeps turning, counters, pulsing glows, particles. The final frame must still be moving: a push-in plus a light sweep.
- Camera moves are layered: push, then a punch on the click, then a pull-back to reveal, then a dive. Scale around the **frame centre** for drifts, and around the target only for the dive.
- Use motion blur sparingly: velocity blur on fast exits only.
- Everything is driven by `frame`. Never use CSS transitions or animations.

## 6. Layout and safety rules (lessons learned)

- **Safe area:** keep every card and caption at least 160px from the left and right edges, and keep important content out of the bottom 15% (the player controls cover it). Check this *after* camera scale is applied, not before.
- Never let a callout hide its own text behind a device: tuck the pill under the device by 30–50px at most.
- Slot or flip text containers must be tall enough for descenders (g, y, p).
- Check large type that overlaps a device at its widest sway or rotation.

## 7. Sound

- Generate an original soundtrack with numpy (no samples, no copyrighted music). Use a 120 BPM four-on-the-floor beat with a pad that pumps with the kick, a plucked arp with ping-pong delay, a bass, claps and hats.
- Place sound effects on every visual event: whooshes into cuts, a mouse click, pops for cards and callouts, ticks while counters roll, a riser into the outro, an impact on the logo, chimes on the shimmer.
- Put the end of the track on a fade so it doesn't cut off abruptly. Peak at −1 dBFS.
- **Regenerate the audio whenever timings change**, and keep the cue list in sync with the scene timing table.

## 8. Accuracy and brand care

- Use only facts and numbers you can stand behind; flag anything I should double-check before publishing.
- Artists, songs, users and data in mock-ups are fictional.
- It is an unofficial concept: recreate logos faithfully but don't claim they're official assets. Use Inter Display or Inter as stand-ins for proprietary brand fonts, and say so.

## 9. QA loop (required before every delivery)

1. Run `tsc` with no errors.
2. Render **half-scale stills** at the key moments of every scene and all transitions. Tile them into a contact sheet and look at it. Fix overlaps, clipping, off-palette colour and anything near the edges.
3. Render the **full video**, then extract frames *from the MP4* (not just stills). Some bugs only appear in sequential renders. Known example: gradient text written with the `background` shorthand loses `background-clip: text` when the gradient changes between frames, and turns into a solid box. Always use `backgroundImage` for gradient text.
4. Run a motion check: compute the mean frame difference per 0.25s window, and confirm no window falls below the threshold, *especially at the end of each scene*.
5. Check the audio: duration, peak level and a loudness curve that matches the arrangement.
6. Commit, push and send the MP4.

## 10. Working with me

- Start with a short storyboard (a scene table with timings and the transition for each cut), then build without waiting for approval unless the brief is ambiguous.
- When I send screenshots with notes, fix exactly what I point at, then look for the same problem elsewhere in the video and fix it there too.
- When I send reference images, match their style and composition, adapt them to the brand, and tell me in one line any place where you deliberately deviated (e.g. no hand holding the phone; recoloured to the brand palette).
- Report each round briefly: what changed per scene, anything you couldn't do, and anything I should verify.
