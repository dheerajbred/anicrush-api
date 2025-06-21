# AniCrush API

A Node.js/Express API for fetching anime sources and information from AniCrush.

## Features

- 🔍 Search anime by keyword
- 📺 Get anime details and information
- 📝 Fetch episode lists
- 🎬 Get video sources and streaming links
- 🌐 CORS enabled for cross-origin requests
- 🔒 Secure API endpoints
- 🗺️ Map AniList IDs to AniCrush IDs

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
GET /api/anime/sources?movieId={movieId}&episode={episode}&server={server}&subOrDub={subOrDub}
```

### Get HLS Link
```
GET /api/anime/hls/{movieId}?url={url}
```

### Map AniList ID to AniCrush
```
GET /api/mapper/{anilistId}
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/dheerajbred/anicrush-api.git
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

### Map AniList ID:
```bash
curl "http://localhost:3001/api/mapper/21"
```

## Deployment

### Netlify (Serverless Functions)
1. Connect your GitHub repository to Netlify
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `public`
3. Deploy automatically

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
