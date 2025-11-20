# Agent Code Report: myanicrush-api Updates and Verification

## Overview

- Goal: Align `myanicrush-api` with the latest upstream behavior while retaining custom endpoints and Netlify deployment.
- Actions: Updated embed extraction (MegaCloud v3), resolved routing conflicts, ensured parity with upstream endpoints, added robust serverless handling, and verified all Crush API endpoints including video output.

## Source Project Referenced

- Upstream: `https://github.com/shafat-96/anicrush-api` (latest working reference)
- Files consulted: `index.js`, `mapper.js`, `hls.js`, `embedHandler.js`, `README.md`

## Changes Implemented

- Embed extraction rework
  - Implemented MegaCloud v3 nonce-based extraction with fallback decryption.
  - File: `myanicrush-api/embedHandler.js`
  - Behavior: Reads embed HTML, extracts `data-id` and nonce `_k`, calls `embed-2/v3/e-1/getSources`, decrypts sources when needed, returns `sources`, `tracks`, `intro/outro`, `server`.

- Embed conversion endpoints
  - `/api/anime/embed/convert?embedUrl={url}` now accepts only `embedUrl` (no `host`).
  - `/api/anime/embed/convert/v2?embedUrl={url}` uses unified handler and returns consistent structure.
  - Files: `myanicrush-api/index.js`, `myanicrush-api/server.js`, `myanicrush-api/netlify/functions/api.js`, `myanicrush-api/genericHls.js`, `myanicrush-api/sources/getEmbedSource.js`.

- HLS endpoints
  - `/api/anime/hls/:movieId` computes embed and returns HLS data.
  - Added `/api/anime/hls-by-anilist/:anilistId/:episodeNum` (digit-constrained) to avoid route collisions.
  - File: `myanicrush-api/index.js`

- Route collision fix
  - Constrained AniList route params to digits and renamed path to prevent masking `/api/anime/genres/...`.
  - File: `myanicrush-api/index.js`

- Netlify parity
  - Serverless function updated to support HLS via `url` or computed embed; convert endpoints accept only `embedUrl`.
  - File: `myanicrush-api/netlify/functions/api.js`

- Dependencies
  - Added `cheerio` used by the embed handler.
  - File: `myanicrush-api/package.json`

## Endpoint Matrix

Implemented and verified endpoints:

- `GET /api/mapper/:anilistId`
- `GET /api/anime/search?keyword={q}&page={n}&limit={n}`
- `GET /api/anime/episodes?movieId={id}`
- `GET /api/anime/servers/:movieId?episode={n}`
- `GET /api/anime/sources?movieId={id}&episode={n}&server={id}&subOrDub={sub|dub}`
- `GET /api/anime/hls/:movieId?episode={n}&server={id}&subOrDub={sub|dub}`
- `GET /api/anime/embed/convert?embedUrl={url}`
- `GET /api/anime/embed/convert/v2?embedUrl={url}`
- `GET /api/anime/recently-updated`
- `GET /api/anime/most-favorite?type={home|weekly|...}`
- `GET /api/anime/genre/:genreTag?page={n}`
- `GET /api/anime/genres/:genreTag?page={n}&limit={m}`
- `GET /api/anime/movielist_recently_updated?page={n}&limit={m}`
- `GET /api/anime/movielist_most_watched?page={n}&limit={m}`
- `GET /health`
- Optional: `GET /api/anime/hls-by-anilist/:anilistId/:episodeNum?server={id}&subOrDub={type}`

## Test Commands

Run the server: `npm start` (port `3000`).

Sample test calls:

- Search: `curl "http://localhost:3000/api/anime/search?keyword=naruto&page=1&limit=2"`
- Episodes: `curl "http://localhost:3000/api/anime/episodes?movieId=112HuM"`
- Servers: `curl "http://localhost:3000/api/anime/servers/112HuM?episode=1"`
- Sources: `curl "http://localhost:3000/api/anime/sources?movieId=112HuM&episode=1&server=4&subOrDub=sub"`
- HLS: `curl "http://localhost:3000/api/anime/hls/112HuM?episode=1&server=4&subOrDub=sub"`
- Genres (limit): `curl "http://localhost:3000/api/anime/genres/action?page=1&limit=24"`
- Recently updated: `curl "http://localhost:3000/api/anime/movielist_recently_updated?page=1&limit=2"`
- Most watched: `curl "http://localhost:3000/api/anime/movielist_most_watched?page=1&limit=2"`
- Convert v1: `curl "http://localhost:3000/api/anime/embed/convert?embedUrl=https://megacloud.blog/embed-2/v3/e-1/<id>?z="`
- Convert v2: `curl "http://localhost:3000/api/anime/embed/convert/v2?embedUrl=https://megacloud.blog/embed-2/v3/e-1/<id>?z="`
- Health: `curl "http://localhost:3000/health"`

HLS validation:

1) Call convert v1; parse `.result.sources[0].file` (m3u8).
2) Fetch headers: `curl -I "$M3U8_URL"`.
3) Fetch playlist head: `curl "$M3U8_URL" | head -n 5`.

## Netlify Notes

- `netlify.toml`: redirects `/api/*` → `/.netlify/functions/api`, publish dir `public`.
- Serverless function: supports mapper, search, episodes, servers, sources, HLS (either `url` or computed), convert v1/v2, genre, movielists.

## Rationale and Findings

- MegaCloud switched to v3 nonce-based API; legacy v2 decryption paths were unreliable.
- The generic convert endpoint should accept only `embedUrl` to match the Crush API.
- Route collision occurred with `/api/anime/:anilistId/:episodeNum`; constraining params and renaming avoided masking `/api/anime/genres/...`.
- Upstream does not include movielist endpoints; these were preserved from your custom implementation.

## Files Updated

- `myanicrush-api/embedHandler.js` (new v3 extraction)
- `myanicrush-api/genericHls.js` (no `host`, unified handler)
- `myanicrush-api/sources/getEmbedSource.js` (delegates to handler)
- `myanicrush-api/index.js` (routes added/adjusted; collision fix)
- `myanicrush-api/server.js` (convert aligned)
- `myanicrush-api/netlify/functions/api.js` (parity + convert alignment)
- `myanicrush-api/package.json` (added `cheerio`)

## Final Verification

- All endpoints listed above return valid JSON; HLS `.m3u8` playlists were fetched and parsed.
- Netlify routing remains compatible; serverless handler supports required endpoints.