<<<<<<< HEAD
# AniCrush API

A Node.js/Express API for fetching anime sources and information from AniCrush.

## Features

- 🔍 Search anime by keyword
- 📺 Get anime details and information
- 📝 Fetch episode lists
- 🎬 Get video sources and streaming links
- 🌐 CORS enabled for cross-origin requests
- 🔒 Secure API endpoints

## API Endpoints

### Search Anime
```
GET /api/anime/search?keyword={keyword}&page={page}&limit={limit}
```

### Get Anime Info
```
GET /api/anime/info/{movieId}
```

### Get Episodes
```
GET /api/anime/episodes?movieId={movieId}
```

### Get Servers
```
GET /api/anime/servers/{movieId}?episode={episode}
```

### Get Sources
```
GET /api/anime/sources?movieId={movieId}&episode={episode}&server={server}&format={format}
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/anicrush-api.git
cd anicrush-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```bash
PORT=3001
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Usage Examples

### Search for anime:
```bash
curl "http://localhost:3001/api/anime/search?keyword=naruto&page=1&limit=5"
```

### Get anime details:
```bash
curl "http://localhost:3001/api/anime/info/d1YCXh"
```

### Get episodes:
```bash
curl "http://localhost:3001/api/anime/episodes?movieId=d1YCXh"
```

## Deployment

### Vercel (Recommended)
1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Railway
1. Connect your GitHub repository to Railway
2. Railway will automatically detect and deploy your Node.js app

### Heroku
1. Create a Heroku app
2. Push to Heroku:
```bash
heroku create your-app-name
git push heroku main
```

## Environment Variables

- `PORT` - Server port (default: 3001)

## Dependencies

- **express** - Web framework
- **axios** - HTTP client
- **cors** - Cross-origin resource sharing
- **crypto-js** - Encryption/decryption
- **dotenv** - Environment variables

## Development

- **nodemon** - Auto-restart on file changes

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

If you encounter any issues, please open an issue on GitHub. 
=======
# Anime Sources API

A simple API wrapper for fetching anime sources from anicrush.to.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Map AniList ID to Anicrush

```
GET /api/mapper/{anilistId}
```

Maps an AniList ID to anicrush.to anime ID and episode information.

Example Request:
```
GET http://localhost:3000/api/mapper/21
```

Example Response:
```json
{
    "anilist_id": "21",
    "anicrush_id": "vRPjMA",
    "titles": {
        "romaji": "One Piece",
        "english": "One Piece",
        "native": "ワンピース",
        "anicrush": "One Piece"
    },
    "total_episodes": 1000,
    "episodes": [
        {
            "number": 1,
            "id": "vRPjMA&episode=1"
        },
        // ... more episodes
    ],
    "format": "TV",
    "status": "RELEASING"
}
```

### Search Anime

```
GET /api/anime/search
```

Query Parameters:
- `keyword` (required): Search term
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 24)

### Get Episode List

```
GET /api/anime/episodes
```

Query Parameters:
- `movieId` (required): The ID of the movie/anime

### Get Servers

```
GET /api/anime/servers/{id}
```

Query Parameters:
- `movieId` (required): The ID of the movie/anime
- `episode` (optional): Episode number (default: 1)

### Get Sources

```
GET /api/anime/sources
```

Query Parameters:
- `movieId` (required): The ID of the movie/anime (e.g., "vRPjMA")
- `episode` (optional): Episode number (default: 1)
- `server` (optional): Server number (default: 4)
- `subOrDub` (optional): "sub" or "dub" (default: "sub")

Example Request:
```
GET http://localhost:3000/api/anime/sources?movieId=vRPjMA&episode=1&server=4&subOrDub=sub
```

### Get HLS Link

```
GET /api/anime/hls/{animeId}?episode={ep}&server={id}&subOrDub={type}
```

Fetches HLS (HTTP Live Streaming) links with additional metadata for a specific episode.

Query Parameters:
- `episode` (optional): Episode number (default: 1)
- `server` (optional): Server number (default: 4)
- `subOrDub` (optional): "sub" or "dub" (default: "sub")

Example Request:
```
GET http://localhost:3000/api/anime/hls/vRPjMA?episode=1&server=4&subOrDub=sub
```

Example Response:
```json
{
    "status": true,
    "result": {
        "sources": [
            {
                "file": "https://example.com/hls/video.m3u8",
                "type": "hls"
            }
        ],
        "tracks": [
            {
                "file": "https://example.com/subtitles.vtt",
                "label": "English",
                "kind": "captions"
            }
        ],
        "intro": {
            "start": 0,
            "end": 90
        },
        "outro": {
            "start": 1290,
            "end": 1380
        },
        "server": 4
    }
}
```

### Health Check

```
GET /health
```

Returns the API status.

## Error Handling

The API will return appropriate error messages with corresponding HTTP status codes:
- 400: Bad Request (missing required parameters)
- 404: Not Found (anime or episode not found)
- 500: Internal Server Error (server-side issues)

## Notes

- The API includes necessary headers for authentication
- CORS is enabled for cross-origin requests
- The server runs on port 3000 by default (can be changed via PORT environment variable) 
>>>>>>> 2520c427dc124e4a6bf932292f600dc73f283529
