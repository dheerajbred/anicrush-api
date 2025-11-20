const { handleEmbed } = require('./embedHandler');

// Function to get HLS link
async function getGenericHlsLink(embedUrl) {
    try {
        if (!embedUrl || !embedUrl.startsWith('http')) {
            throw new Error('Embed URL is required');
        }

        const embedSources = await handleEmbed(embedUrl);

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
        
        if(error.message.startsWith('Process exited with code 1')) {
            error.message = 'Could not convert from embedUrl to HLS link. Are you certain the embed url is valid and has not expired?';
        }

        return {
            status: false,
            error: error.message || 'Failed to get HLS link'
        };
    }
}

module.exports = {
    getGenericHlsLink
};