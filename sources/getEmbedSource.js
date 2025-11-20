const { handleEmbed } = require('../embedHandler');

/**
 * Decrypts the sources from a given embed URL by fetching the encryption key and raw source data.
 * The function first extracts the identifier from the embed URL, then retrieves the encryption key
 * and encrypted source data using HTTP GET requests. It decrypts the source data using AES decryption
 * and parses it as JSON. Returns an object indicating the status and result, including sources, tracks,
 * intro, outro, and server data if successful. Logs an error and returns a failure status if any step fails.
 *
 * @param {string} embedUrl - The URL containing the embed source to be decrypted.
 * @returns {Promise<Object>} - An object with status indicating success or failure, and result or error message.
 */

async function decryptSources(embedUrl) {
    try {
        if (!embedUrl || !embedUrl.startsWith('http')) {
            throw new Error('Embed URL is required');
        }
        const extracted = await handleEmbed(embedUrl);
        if (!extracted || !extracted.sources || extracted.sources.length === 0) {
            throw new Error('No sources found');
        }
        return {
            status: true,
            result: {
                sources: extracted.sources,
                tracks: extracted.tracks,
                intro: extracted.intro ?? null,
                outro: extracted.outro ?? null,
                server: extracted.server ?? null
            }
        };
    } catch (error) {
        console.error(`[ERROR][decryptSources] Error decrypting ${ embedUrl }:`, error);
        return {
            status: false,
            error: error.message || 'Failed to get HLS link'
        };
    }
}

module.exports = { decryptSources };