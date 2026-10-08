// Render PNG stills at given seconds for quick visual QA: node scripts/stills.mjs 1.2 4.5 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const browserExecutable = process.env.REMOTION_BROWSER || undefined;
const outDir = process.env.OUT_DIR || 'out/stills';
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'SpotifyPromo', browserExecutable});
for (const sec of process.argv.slice(2).map(Number)) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(sec * composition.fps));
  const output = path.join(outDir, `t${sec.toFixed(2)}.png`);
  await renderStill({serveUrl, composition, frame, output, browserExecutable, scale: Number(process.env.SCALE || 0.5)});
  console.log(output);
}
