# UGC Style Master

A prompt generator for UGC-style, character-sheet, and environment image prompts. Upload a reference photo (plus optional outfit/location refs), pick a scene, tune body sliders, and generate three ready-to-use prompts for whatever image model you paste them into.

This is a standalone rebuild of the original spec (which targeted Higgsfield's internal `@higgsfield/fnf` SDK and website builder) — it runs entirely on its own with a small Express server calling the Claude API directly. It only generates *text prompts*, not images.

## Structure

- `server/` — Express API. Three routes (`/api/generate/ugc`, `/api/generate/character-sheet`, `/api/generate/environment`) call Claude with the reference image(s) + your inputs and the system prompts from the original spec.
- `client/` — React + Vite + Tailwind SPA.

## Setup

1. `npm run install:all` (from this `app/` directory)
2. `cp server/.env.example server/.env` and set `ANTHROPIC_API_KEY` to your own Anthropic API key
3. `npm run dev`
4. Open http://localhost:5173

## Notes

- Images never leave your machine except to Anthropic's API (as part of the prompt-generation call).
- "Pick from gallery" reuses images you've uploaded earlier in the session — stored in browser `localStorage`, not sent anywhere.
- Sexy mode follows the original spec's guardrails: more revealing wardrobe, never explicit.
