# AniCrush API - Unofficial

An unofficial, robust Node.js/Express API designed to scrape and fetch anime information, sources, and streaming links from AniCrush. It acts as a reliable proxy, providing clean JSON responses for seamless integration into your applications.

## Features

- 🔍 **Anime Search**: Find anime by keyword with pagination.
- 📺 **Detailed Info**: Get comprehensive details about a specific anime.
- 📝 **Episode Lists**: Fetch a complete list of episodes for any anime.
- 🎬 **Video Sources**: Retrieve streaming links and server information.
- ✨ **Recently Updated**: Get a list of the latest updated anime.
- ❤️ **Most Favorite**: Fetch the most popular anime (home, weekly, etc.).
- 🎯 **Genre Filter**: Browse anime by specific genres with pagination.
- 🗺️ **AniList Mapping**: Map AniList IDs to AniCrush IDs and get metadata.
- ⚡ **HLS Links**: Directly get HLS streaming links for episodes.
- 🌐 **CORS Enabled**: Cross-origin requests supported for easy integration.
- 🔒 **Secure & Reliable**: Built with security and stability in mind.
- 🚀 **Multi-Platform Deployment**: Ready for Vercel, Netlify, and Railway.

## API Endpoints

All endpoints are prefixed with `/api`.

### Anime Endpoints

| Method | Endpoint                          | Description                                      | Parameters                                       |
|--------|-----------------------------------|--------------------------------------------------|--------------------------------------------------|
| `GET`  | `/anime/search`                   | Search for anime by keyword.                     | `keyword` (required), `page` (1), `limit` (24)   |
| `GET`  | `/anime/info/:movieId`            | Get detailed information about a specific anime. | `movieId` (required)                             |
| `GET`  | `/anime/episodes`                 | Get the list of episodes for an anime.           | `movieId` (required)                             |
| `GET`  | `/anime/servers/:movieId`         | Get available servers for a specific episode.    | `movieId` (required), `episode` (1)              |
| `GET`  | `/anime/sources`                  | Get streaming sources for an episode.            | `movieId` (required), `episode`, `server`, `subOrDub` |
| `GET`  | `/anime/hls/:movieId`             | Get HLS streaming link for an episode.           | `movieId` (required), `episode`, `server`, `subOrDub` |
| `GET`  | `/anime/:anilistId/:episodeNum`   | Get HLS stream directly with AniList ID.         | `anilistId` (required), `episodeNum` (required)  |
| `GET`  | `/anime/recently-updated`         | Get a list of recently updated anime.            | -                                                |
| `GET`  | `/anime/most-favorite`            | Get the most favorite anime.                     | `type` (home, weekly, etc.)                      |
| `GET`  | `/anime/genre/:genreTag`          | Get anime list by genre.                         | `genreTag` (required), `page` (1)                |
| `GET`  | `/anime/movielist_recently_updated` | Get recently updated movie list.                 | `page` (1), `limit` (50)                         |
| `GET`  | `/anime/movielist_most_watched`      | Get most watched movie list.                     | `page` (1), `limit` (50)                         |

### Utility Endpoints

| Method | Endpoint                          | Description                                      | Parameters                                       |
|--------|-----------------------------------|--------------------------------------------------|--------------------------------------------------|
| `GET`  | `/mapper/:anilistId`              | Map AniList ID to AniCrush ID and metadata.      | `anilistId` (required)                             |
| `GET`  | `/anime/embed/convert/v2`         | Convert embed URL to HLS link (new method).      | `embedUrl` (required)                            |
| `GET`  | `/health`                         | Health check endpoint.                           | -                                                |

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/dheerajbred/anicrush-api.git
    cd anicrush-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file (optional):**
    ```
    PORT=3001
    ```

4.  **Start the server:**
    -   Production: `npm start`
    -   Development (with auto-reload): `npm run dev`

## Usage Examples

### Search for anime
```bash
curl "http://localhost:3001/api/anime/search?keyword=naruto&page=1"
```

### Get recently updated anime
```bash
curl "http://localhost:3001/api/anime/recently-updated"
```

### Get most favorite anime (weekly)
```bash
curl "http://localhost:3001/api/anime/most-favorite?type=weekly"
```

### Get anime by genre
```bash
curl "http://localhost:3001/api/anime/genre/action?page=1"
```

### Get recently updated movie list
```bash
curl "http://localhost:3001/api/anime/movielist_recently_updated"
```

### Get most watched movie list
```bash
curl "http://localhost:3001/api/anime/movielist_most_watched"
```

### Map AniList ID
```bash
curl "http://localhost:3001/api/mapper/21"
```

### Get direct stream with AniList ID
```bash
curl "http://localhost:3001/api/anime/21/1"
```

## Deployment

This API is ready for deployment on multiple platforms.

### Vercel (Recommended)
1.  Install Vercel CLI: `npm i -g vercel`
2.  Deploy: `vercel`

### Netlify
1.  Connect your GitHub repository to Netlify.
2.  Set build command to `npm run build` and publish directory to `public`.
3.  Deploy automatically on git push.

### Railway
1.  Connect your GitHub repository to Railway.
2.  Railway will automatically detect and deploy the Node.js app.

## Dependencies

- **express**: Web framework for Node.js
- **axios**: Promise-based HTTP client
- **cors**: Middleware for enabling CORS
- **crypto-js**: Library for standard and secure cryptographic algorithms
- **dotenv**: Module for loading environment variables from a `.env` file

## Development Dependencies

- **nodemon**: Utility that monitors for changes and automatically restarts the server.

## License

This project is licensed under the **MIT License**.

## Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/your-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/your-feature`).
5.  Open a Pull Request.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/dheerajbred/anicrush-api/issues) on GitHub.
