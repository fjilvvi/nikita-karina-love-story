# Project guide

This is a static browser game built with Vite, TypeScript, and Phaser 3. The site's interface lives in `src/main.ts` and `src/style.css`; the Phaser scenes and procedural pixel art live in `src/game/`; story facts and chapter text belong in `src/content/`. Put licensed or client-supplied assets in `public/assets/` and document their source.

Keep historical details faithful to the supplied transcript and media. Do not invent names, dates, places, dialogue, or a proposal. Structure narrative data so later corrections do not require rewriting game logic. Preserve keyboard and touch controls.

After source changes, run `npm run typecheck` and `npm run build`. The site must run via `npm run dev` and ship as static files from `dist/`.
