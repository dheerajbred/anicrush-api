// Polyfill File for Netlify Functions environments where global File is missing
try {
  if (typeof global.File === 'undefined') {
    const { Blob } = require('buffer');
    class SimpleFile extends Blob {
      constructor(parts, name, options = {}) {
        super(parts, options);
        this.name = String(name || 'file');
        this.lastModified = options.lastModified || Date.now();
      }
    }
    global.File = SimpleFile;
  }
} catch (_) {
  // ignore
}

const axios = require('axios');
const { mapAniListToAnicrush, getCommonHeaders } = require('../../mapper');
const { getHlsLink } = require('../../hls');
const { getGenericHlsLink } = require('../../genericHls');
const { decryptSources } = require('../../sources/getEmbedSource');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const { path, queryStringParameters } = event;
  const params = queryStringParameters || {};

  try {
    // Route handling
    if (path.includes('/api/mapper/') && event.httpMethod === 'GET') {
      const anilistId = path.split('/api/mapper/')[1];
      if (!anilistId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'AniList ID is required' })
        };
      }
      const mappedData = await mapAniListToAnicrush(anilistId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(mappedData)
      };
    }

    if (path === '/api/anime/search' && event.httpMethod === 'GET') {
      const { keyword, page = 1, limit = 24 } = params;
      if (!keyword) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Search keyword is required' })
        };
      }

      const response = await axios({
        method: 'GET',
        url: `https://api.anicrush.to/shared/v2/movie/list`,
        params: { keyword, page, limit },
        headers: getCommonHeaders()
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.data)
      };
    }

    if (path === '/api/anime/episodes' && event.httpMethod === 'GET') {
      const { movieId } = params;
      if (!movieId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Movie ID is required' })
        };
      }

      const response = await axios({
        method: 'GET',
        url: `https://api.anicrush.to/shared/v2/episode/list`,
        params: { _movieId: movieId },
        headers: getCommonHeaders()
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.data)
      };
    }

    if (path.includes('/api/anime/servers/') && event.httpMethod === 'GET') {
      const movieId = path.split('/api/anime/servers/')[1];
      const { episode } = params;
      
      if (!movieId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Movie ID is required' })
        };
      }

      const response = await axios({
        method: 'GET',
        url: `https://api.anicrush.to/shared/v2/episode/servers`,
        params: { _movieId: movieId, ep: episode || 1 },
        headers: getCommonHeaders()
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.data)
      };
    }

    if (path === '/api/anime/sources' && event.httpMethod === 'GET') {
      const { movieId, episode, server, subOrDub } = params;
      
      if (!movieId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Movie ID is required' })
        };
      }

      const headers = getCommonHeaders();

      // Check episode list
      const episodeListResponse = await axios({
        method: 'GET',
        url: `https://api.anicrush.to/shared/v2/episode/list`,
        params: { _movieId: movieId },
        headers
      });

      if (!episodeListResponse.data || episodeListResponse.data.status === false) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Episode list not found' })
        };
      }

      // Get servers
      const serversResponse = await axios({
        method: 'GET',
        url: `https://api.anicrush.to/shared/v2/episode/servers`,
        params: { _movieId: movieId, ep: episode || 1 },
        headers
      });

      if (!serversResponse.data || serversResponse.data.status === false) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Servers not found' })
        };
      }

      // Get sources
      const sourcesResponse = await axios({
        method: 'GET',
        url: `https://api.anicrush.to/shared/v2/episode/sources`,
        params: {
          _movieId: movieId,
          ep: episode || 1,
          sv: server || 4,
          sc: subOrDub || 'sub'
        },
        headers
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(sourcesResponse.data)
      };
    }

    if (path.includes('/api/anime/hls/') && event.httpMethod === 'GET') {
      const movieId = path.split('/api/anime/hls/')[1];
      const { url, episode = 1, server = 4, subOrDub = 'sub' } = params;

      if (url) {
        const hlsLink = await getHlsLink(url);
        return { statusCode: 200, headers, body: JSON.stringify(hlsLink) };
      }

      if (!movieId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Movie ID is required' }) };
      }

      const embedResponse = await axios({
        method: 'GET',
        url: `https://api.anicrush.to/shared/v2/episode/sources`,
        params: { _movieId: movieId, ep: episode, sv: server, sc: subOrDub },
        headers: getCommonHeaders()
      });

      if (!embedResponse.data || embedResponse.data.status === false) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Embed link not found' }) };
      }

      const embedUrl = embedResponse.data.result.link;
      const hlsData = await getHlsLink(embedUrl);
      return { statusCode: 200, headers, body: JSON.stringify(hlsData) };
    }

    // Embed conversion endpoints
    if (path === '/api/anime/embed/convert' && event.httpMethod === 'GET') {
      const { embedUrl } = params;

      if (!embedUrl || !embedUrl.startsWith('http')) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Embed URL is required' })
        };
      }
      
      const hlsData = await getGenericHlsLink(embedUrl);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(hlsData)
      };
    }

    if (path === '/api/anime/embed/convert/v2' && event.httpMethod === 'GET') {
      const { embedUrl } = params;

      if (!embedUrl || !embedUrl.startsWith('http')) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Embed URL is required' })
        };
      }
      
      const hlsData = await decryptSources(embedUrl);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(hlsData)
      };
    }

    if (path === '/api/anime/recently-updated' && event.httpMethod === 'GET') {
      const response = await axios({
        method: 'GET',
        url: `https://api.anicrush.to/shared/v2/movie/recentlyUpdated/home`,
        headers: getCommonHeaders()
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.data)
      };
    }

    if (path === '/api/anime/most-favorite' && event.httpMethod === 'GET') {
      const { type = 'home' } = params;
      
      const response = await axios({
        method: 'GET',
        url: `https://api.anicrush.to/shared/v2/movie/mostFavorite`,
        params: { type },
        headers: getCommonHeaders()
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.data)
      };
    }

    if (path.startsWith('/api/anime/genre/') && event.httpMethod === 'GET') {
      const genreTag = path.split('/api/anime/genre/')[1];
      const { page = 1 } = params;

      if (!genreTag) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Genre tag is required' })
        };
      }

      const response = await axios({
        method: 'GET',
        url: `https://api.anicrush.to/shared/v1/genre/detail/${genreTag}`,
        params: { page },
        headers: getCommonHeaders()
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.data)
      };
    }

    if (path === '/api/anime/movielist_recently_updated' && event.httpMethod === 'GET') {
      const { page = 1, limit = 50 } = params;
      
      const response = await axios({
        method: 'GET',
        url: `https://api.anicrush.to/shared/v2/movie/list`,
        params: {
          limit,
          page,
          sortBy: 'recently_updated'
        },
        headers: getCommonHeaders()
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.data)
      };
    }

    if (path === '/api/anime/movielist_most_watched' && event.httpMethod === 'GET') {
      const { page = 1, limit = 50 } = params;
      
      const response = await axios({
        method: 'GET',
        url: `https://api.anicrush.to/shared/v2/movie/list`,
        params: {
          limit,
          page,
          sortBy: 'most_watched'
        },
        headers: getCommonHeaders()
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.data)
      };
    }

    if (path.startsWith('/api/anime/genres/') && event.httpMethod === 'GET') {
      const genreTag = path.split('/api/anime/genres/')[1];
      const { page = 1, limit = 24 } = params;

      if (!genreTag) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Genre tag is required' })
        };
      }

      const response = await axios({
        method: 'GET',
        url: `https://api.anicrush.to/shared/v1/genre/detail/${genreTag}`,
        params: { limit, page },
        headers: getCommonHeaders()
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.data)
      };
    }

    // Default response for unknown routes
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};