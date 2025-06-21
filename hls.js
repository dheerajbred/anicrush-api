<<<<<<< HEAD
=======
const axios = require('axios');
>>>>>>> 2520c427dc124e4a6bf932292f600dc73f283529
const { getCommonHeaders } = require('./mapper');
const { handleEmbed } = require('./embedHandler');

// Function to get HLS link
async function getHlsLink(embedUrl) {
    try {
        if (!embedUrl) {
            throw new Error('Embed URL is required');
        }

        // Use rabbit.js to decode the embed URL and get sources
<<<<<<< HEAD
        const embedSources = await handleEmbed(embedUrl, 'https://megacloud.club/');
=======
        const embedSources = await handleEmbed(embedUrl, 'https://anicrush.to');
>>>>>>> 2520c427dc124e4a6bf932292f600dc73f283529

        if (!embedSources || !embedSources.sources || !embedSources.sources.length) {
            throw new Error('No sources found');
        }

        // Return the complete response
        return {
            status: true,
            result: {
                sources: embedSources.sources,
                tracks: embedSources.tracks,
                t: embedSources.t,
                intro: embedSources.intro,
                outro: embedSources.outro,
                server: embedSources.server
            }
        };

    } catch (error) {
        console.error('Error getting HLS link:', error);
        return {
            status: false,
            error: error.message || 'Failed to get HLS link'
        };
    }
}

module.exports = {
    getHlsLink
<<<<<<< HEAD
};
=======
}; 
>>>>>>> 2520c427dc124e4a6bf932292f600dc73f283529
