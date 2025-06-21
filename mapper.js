const axios = require('axios');

// Common headers for API requests
const getCommonHeaders = () => ({
    'Accept': 'application/json, text/plain, */*',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    'x-site': 'anicrush',
    'Referer': 'https://anicrush.to/',
    'Origin': 'https://anicrush.to',
    'sec-fetch-site': 'same-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty'
});

// GraphQL query for AniList with synonyms
const ANILIST_QUERY = `
query ($id: Int) {
    Media(id: $id, type: ANIME) {
        id
        title {
            romaji
            english
            native
        }
        synonyms
        episodes
        format
        status
        countryOfOrigin
        seasonYear
        description
        genres
        tags {
            name
        }
    }
}`;

// Function to calculate string similarity using Levenshtein distance
function calculateLevenshteinSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();

    const matrix = Array(str2.length + 1).fill(null)
        .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
            );
        }
    }

    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 100;
    return ((maxLength - matrix[str2.length][str1.length]) / maxLength) * 100;
}

// Function to calculate word-based similarity
function calculateWordSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    const words1 = str1.toLowerCase().split(/\s+/).filter(Boolean);
    const words2 = str2.toLowerCase().split(/\s+/).filter(Boolean);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalUniqueWords = new Set([...words1, ...words2]).size;
    
    return (commonWords.length / totalUniqueWords) * 100;
}

// Function to normalize title for comparison
function normalizeTitle(title) {
    if (!title) return '';
    return title.toLowerCase()
        .replace(/[^a-z0-9\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\uff00-\uff9f]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Function to get anime details from AniList
async function getAniListDetails(anilistId) {
    try {
        const response = await axios({
            url: 'https://graphql.anilist.co',
            method: 'POST',
            data: {
                query: ANILIST_QUERY,
                variables: {
                    id: parseInt(anilistId)
                }
            }
        });

        if (!response.data?.data?.Media) {
            throw new Error('Anime not found on AniList');
        }

        return response.data.data.Media;
    } catch (error) {
        console.error('Error fetching from AniList:', error.message);
        throw new Error('Failed to fetch anime details from AniList');
    }
}

// Function to search anime on anicrush
async function searchAnicrush(title) {
    if (!title) {
        throw new Error('Search title is required');
    }

    try {
        const headers = getCommonHeaders();
        const response = await axios({
            method: 'GET',
            url: 'https://api.anicrush.to/shared/v2/movie/list',
            params: {
                keyword: title,
                page: 1,
                limit: 24
            },
            headers
        });

        if (response.data?.status === false) {
            throw new Error(response.data.message || 'Search failed');
        }

        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Search API error:', error.response.data);
            throw new Error(error.response.data.message || 'Search request failed');
        } else if (error.request) {
            console.error('No response received:', error.request);
            throw new Error('No response from search API');
        } else {
            console.error('Search error:', error.message);
            throw new Error('Failed to search anime');
        }
    }
}

// Function to get episode list from anicrush
async function getEpisodeList(movieId) {
    if (!movieId) {
        throw new Error('Movie ID is required');
    }

    try {
        const headers = getCommonHeaders();
        const response = await axios({
            method: 'GET',
            url: 'https://api.anicrush.to/shared/v2/episode/list',
            params: {
                _movieId: movieId
            },
            headers
        });

        if (response.data?.status === false) {
            throw new Error(response.data.message || 'Failed to fetch episode list');
        }

        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Episode list API error:', error.response.data);
            throw new Error(error.response.data.message || 'Episode list request failed');
        } else if (error.request) {
            console.error('No response received:', error.request);
            throw new Error('No response from episode list API');
        } else {
            console.error('Episode list error:', error.message);
            throw new Error('Failed to fetch episode list');
        }
    }
}

// Function to calculate title similarity
function calculateTitleSimilarity(title1, title2) {
    const normalized1 = normalizeTitle(title1);
    const normalized2 = normalizeTitle(title2);
    
    const levenshteinScore = calculateLevenshteinSimilarity(normalized1, normalized2);
    const wordScore = calculateWordSimilarity(normalized1, normalized2);
    
    return Math.max(levenshteinScore, wordScore);
}

// Function to find the best match from search results
function findBestMatch(anilistData, anicrushResults) {
    if (!anicrushResults?.result?.movies || anicrushResults.result.movies.length === 0) {
        return null;
    }

    const movies = anicrushResults.result.movies;
    let bestMatch = null;
    let bestScore = 0;

    // Get all possible titles from AniList data
    const anilistTitles = [
        anilistData.title?.romaji,
        anilistData.title?.english,
        anilistData.title?.native,
        ...(anilistData.synonyms || [])
    ].filter(Boolean);

    for (const movie of movies) {
        const movieTitles = [
            movie.name,
            movie.name_english
        ].filter(Boolean);

        let movieBestScore = 0;

        for (const anilistTitle of anilistTitles) {
            for (const movieTitle of movieTitles) {
                const score = calculateTitleSimilarity(anilistTitle, movieTitle);
                movieBestScore = Math.max(movieBestScore, score);
            }
        }

        if (movieBestScore > bestScore) {
            bestScore = movieBestScore;
            bestMatch = movie;
        }
    }

    // Only return match if similarity is above threshold
    return bestScore >= 60 ? bestMatch : null;
}

// Function to parse episode list and extract episode numbers
function parseEpisodeList(episodeList) {
    if (!episodeList?.result?.episodes) {
        return [];
    }

    return episodeList.result.episodes.map(episode => ({
        episode: episode.episode,
        title: episode.title || `Episode ${episode.episode}`,
        id: episode.id
    }));
}

// Function to get AniZip mappings (if available)
async function getAniZipMappings(anilistId) {
    try {
        const response = await axios.get(`https://raw.githubusercontent.com/AniZip/AniZip/main/mappings/anilist/${anilistId}.json`);
        return response.data;
    } catch (error) {
        console.log('No AniZip mapping found for AniList ID:', anilistId);
        return null;
    }
}

// Main function to map AniList ID to AniCrush data
async function mapAniListToAnicrush(anilistId) {
    try {
        // Get AniList data
        const anilistData = await getAniListDetails(anilistId);
        
        // Try to get AniZip mapping first
        const anizipMapping = await getAniZipMappings(anilistId);
        
        if (anizipMapping?.sites?.anicrush?.id) {
            // Use AniZip mapping if available
            const movieId = anizipMapping.sites.anicrush.id;
            const episodeList = await getEpisodeList(movieId);
            
            return {
                success: true,
                anilistId: parseInt(anilistId),
                anicrushId: movieId,
                title: anilistData.title?.romaji || anilistData.title?.english,
                episodes: parseEpisodeList(episodeList),
                source: 'anizip'
            };
        }

        // Fallback to search-based mapping
        const searchTitle = anilistData.title?.romaji || anilistData.title?.english;
        const searchResults = await searchAnicrush(searchTitle);
        const bestMatch = findBestMatch(anilistData, searchResults);

        if (!bestMatch) {
            return {
                success: false,
                anilistId: parseInt(anilistId),
                title: searchTitle,
                message: 'No matching anime found on AniCrush'
            };
        }

        // Get episode list for the matched anime
        const episodeList = await getEpisodeList(bestMatch.id);

        return {
            success: true,
            anilistId: parseInt(anilistId),
            anicrushId: bestMatch.id,
            title: bestMatch.name,
            englishTitle: bestMatch.name_english,
            episodes: parseEpisodeList(episodeList),
            source: 'search'
        };

    } catch (error) {
        console.error('Mapping error:', error.message);
        return {
            success: false,
            anilistId: parseInt(anilistId),
            message: error.message
        };
    }
}

module.exports = {
    getCommonHeaders,
    mapAniListToAnicrush
};
