# Agent Code Report: myanicrush-api Updates, Parity, and Netlify Readiness

## Objective

- Keep `myanicrush-api` up-to-date with upstream logic from `https://github.com/shafat-96/anicrush-api`.
- Retain all custom functionality present in `myanicrush-api` and ensure it works on Netlify.
- Provide a repeatable checklist and test suite to reapply updates safely when the upstream changes.

## Upstream Audit (anicrush-api-source)

- Core endpoints:
  - `GET /api/mapper/:anilistId` (maps AniList → AniCrush)
  - `GET /api/anime/search` (keyword search)
  - `GET /api/anime/episodes` (episode list)
  - `GET /api/anime/servers/:movieId` (servers)
  - `GET /api/anime/sources` (sources)
  - `GET /api/anime/hls/:movieId` (HLS from embed)
  - `GET /api/anime/:anilistId/:episodeNum` (combined AniList → HLS)
  - `GET /health` (health)

- Upstream logic highlights:
  - Uses common headers via `getCommonHeaders`.
  - Mapper uses AniList GraphQL + fuzzy matching + ani.zip when available.
  - HLS depends on an embed handler capable of parsing/decrypting MegaCloud.

## Parity and Enhancements in myanicrush-api

- Preserved and verified all upstream endpoints.
- Kept custom endpoints beyond upstream:
  - `GET /api/anime/recently-updated`
  - `GET /api/anime/most-favorite?type={home|weekly|...}`
  - `GET /api/anime/genre/:genreTag?page={n}`
  - `GET /api/anime/genres/:genreTag?page={n}&limit={m}`
  - `GET /api/anime/movielist_recently_updated?page={n}&limit={m}`
  - `GET /api/anime/movielist_most_watched?page={n}&limit={m}`

## Changes Implemented (Exhaustive)

### 1) Embed extraction update (MegaCloud v3)

- File: `myanicrush-api/embedHandler.js:1`
- Implemented v3 flow:
  - Fetch embed HTML, extract `#megacloud-player` `data-id`.
  - Extract nonce `_k` from HTML via pattern detection.
  - Call `https://megacloud.blog/embed-2/v3/e-1/getSources?id={id}&_k={nonce}`.
  - If `sources` is an array with `file`, use it directly; otherwise decrypt using a remote Google Script helper and current key.
  - Return structured `{ sources, tracks, t, server, intro, outro }`.

### 2) Convert endpoints alignment

- File: `myanicrush-api/index.js:246` — `/api/anime/embed/convert?embedUrl={url}` accepts only `embedUrl` and returns unified HLS result.
- File: `myanicrush-api/index.js:265` — `/api/anime/embed/convert/v2?embedUrl={url}` delegates to `decryptSources` which uses the same handler.
- File: `myanicrush-api/server.js:244` — aligned the convert route in the local server variant to accept only `embedUrl`.
- File: `myanicrush-api/genericHls.js:4` — removed `host` parameter, uses the updated embed handler.
- File: `myanicrush-api/sources/getEmbedSource.js:1` — now delegates to the embed handler to return consistent structure.

### 3) HLS endpoints parity

- File: `myanicrush-api/index.js:200` — `/api/anime/hls/:movieId` uses AniCrush sources to fetch embed and resolves to HLS.
- File: `myanicrush-api/netlify/functions/api.js:185` — serverless HLS supports both a direct `url` param (if provided) and computed embed (if not) for parity and flexibility.

### 4) Route collision fix

- Issue: `/api/anime/:anilistId/:episodeNum` could shadow `/api/anime/genres/:endpoint`.
- Fix: Renamed and constrained params to digits.
  - File: `myanicrush-api/index.js:291` — new route: `GET /api/anime/hls-by-anilist/:anilistId(\d+)/:episodeNum(\d+)`.

### 5) Netlify functions crash fix

- Issue: Netlify runtime crashed with `ReferenceError: File is not defined` from `undici`.
- Fix: Polyfilled `global.File` early in the serverless function.
  - File: `myanicrush-api/netlify/functions/api.js:1` — minimal `File` polyfill extending `Blob` with `name` and `lastModified`.
- Netlify function route parity:
  - `/api/anime/hls/{movieId}` supports `url` param or computed embed.
  - `/api/anime/embed/convert?embedUrl={url}` uses unified handler; no `host`.
  - All core endpoints mirrored with CORS and preflight handling.

### 6) Dependencies

- File: `myanicrush-api/package.json` — added `cheerio` required for HTML parsing in embed handler.

## Endpoint Matrix (Implemented)

- Core:
  - `GET /api/mapper/:anilistId`
  - `GET /api/anime/search?keyword={q}&page={n}&limit={n}`
  - `GET /api/anime/episodes?movieId={id}`
  - `GET /api/anime/servers/:movieId?episode={n}`
  - `GET /api/anime/sources?movieId={id}&episode={n}&server={id}&subOrDub={sub|dub}`
  - `GET /api/anime/hls/:movieId?episode={n}&server={id}&subOrDub={type}`
  - `GET /api/anime/embed/convert?embedUrl={url}`
  - `GET /api/anime/embed/convert/v2?embedUrl={url}`
  - `GET /api/anime/hls-by-anilist/:anilistId/:episodeNum?server={id}&subOrDub={type}` (added to avoid route conflict)
  - `GET /health`

- Custom (retained):
  - `GET /api/anime/recently-updated`
  - `GET /api/anime/most-favorite?type={home|weekly|...}`
  - `GET /api/anime/genre/:genreTag?page={n}`
  - `GET /api/anime/genres/:genreTag?page={n}&limit={m}`
  - `GET /api/anime/movielist_recently_updated?page={n}&limit={m}`
  - `GET /api/anime/movielist_most_watched?page={n}&limit={m}`

## Testing Guide

### Local server

- Start: `npm start` → `http://localhost:3000/`
- Queries:
  - Search: `curl "http://localhost:3000/api/anime/search?keyword=naruto&page=1&limit=2"`
  - Episodes: `curl "http://localhost:3000/api/anime/episodes?movieId=112HuM"`
  - Servers: `curl "http://localhost:3000/api/anime/servers/112HuM?episode=1"`
  - Sources: `curl "http://localhost:3000/api/anime/sources?movieId=112HuM&episode=1&server=4&subOrDub=sub"`
  - HLS: `curl "http://localhost:3000/api/anime/hls/112HuM?episode=1&server=4&subOrDub=sub"`
  - Convert v1: `curl "http://localhost:3000/api/anime/embed/convert?embedUrl=https://megacloud.blog/embed-2/v3/e-1/<id>?z="`
  - Convert v2: `curl "http://localhost:3000/api/anime/embed/convert/v2?embedUrl=https://megacloud.blog/embed-2/v3/e-1/<id>?z="`
  - Genres: `curl "http://localhost:3000/api/anime/genres/action?page=1&limit=24"`
  - Recently updated: `curl "http://localhost:3000/api/anime/movielist_recently_updated?page=1&limit=2"`
  - Most watched: `curl "http://localhost:3000/api/anime/movielist_most_watched?page=1&limit=2"`
  - Health: `curl "http://localhost:3000/health"`

### HLS validation (local)

1) Run convert v1 and parse `.result.sources[0].file`.
2) `curl -I "$M3U8_URL"` to check headers.
3) `curl "$M3U8_URL" | head -n 5` to verify playlist.

### Netlify serverless

- Redirects: `/api/*` → `/.netlify/functions/api` via `netlify.toml`.
- If functions crash with `File is not defined`, ensure polyfill exists (added) and re-deploy.
- Recommended functions runtime: Node 18 to match `package.json` engines.

## Troubleshooting Notes

- Error: `ReferenceError: File is not defined` (Netlify Functions)
  - Cause: Some runtimes lack a global `File`; `undici` expects it.
  - Fix: Early polyfill in `myanicrush-api/netlify/functions/api.js:1`.
  - If necessary, polyfill `Blob`/`FormData` similarly.

- Genres endpoint returns content but may lack `.status` key in payload; treat response as valid if items exist.

## Ongoing Update Checklist

1) Compare upstream `index.js`, `mapper.js`, `hls.js`, `embedHandler.js` for changes.
2) Update `myanicrush-api/embedHandler.js` if MegaCloud changes nonce or endpoint.
3) Keep `getCommonHeaders` aligned with upstream.
4) Maintain convert routes to accept only `embedUrl` and return unified structure.
5) Verify Netlify serverless parity; adjust function code if environment-specific issues arise.
6) Re-run full test suite (local + Netlify) and HLS validation.
7) Confirm `netlify.toml` redirects and `public/index.html` API list are consistent.

## Files Updated (Exact)

- `myanicrush-api/embedHandler.js:1` (v3 extraction, nonce, Google Script decrypt fallback)
- `myanicrush-api/genericHls.js:4` (remove `host`, use handler)
- `myanicrush-api/sources/getEmbedSource.js:1` (delegate to handler)
- `myanicrush-api/index.js:246` (convert v1 only `embedUrl`)
- `myanicrush-api/index.js:265` (convert v2 unified handler)
- `myanicrush-api/index.js:200` (HLS endpoint from embed)
- `myanicrush-api/index.js:291` (new `hls-by-anilist` with digit constraints)
- `myanicrush-api/server.js:244` (convert alignment in local server variant)
- `myanicrush-api/netlify/functions/api.js:1` (`File` polyfill)
- `myanicrush-api/netlify/functions/api.js:185` (HLS: direct `url` or computed embed)
- `myanicrush-api/netlify/functions/api.js:205` (convert v1: only `embedUrl`)
- `myanicrush-api/package.json:14` (added `cheerio`)

## Final Validation

- All endpoints (core + custom) return valid JSON on local server.
- Embed convert v1/v2 and `/api/anime/hls/:movieId` produce valid HLS streams.
- Netlify Functions no longer crash due to missing `File`; parity maintained.