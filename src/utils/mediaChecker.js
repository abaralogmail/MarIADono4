/**
 * Utility functions to check message media types
 */

/**
 * Check if the message contains media (image, video, document, etc.)
 * @param {Object} ctx - The message context object
 * @returns {boolean} - True if message contains media
 */
const isMediaMessage = (ctx) => {
    if (!ctx) return false;
    
    // Check for different media types
    const hasImage = ctx.message?.imageMessage;
    const hasVideo = ctx.message?.videoMessage;
    const hasDocument = ctx.message?.documentMessage;
    const hasSticker = ctx.message?.stickerMessage;
    
    return !!(hasImage || hasVideo || hasDocument || hasSticker);
};

/**
 * Check if the message is a voice message
 * @param {Object} ctx - The message context object
 * @returns {boolean} - True if message is voice
 */
const isVoiceMessage = (ctx) => {
    if (!ctx) return false;
    
    return !!(ctx.message?.audioMessage?.ptt || ctx.message?.voiceMessage);
};

/**
 * Check if the message is an audio message (not voice note)
 * @param {Object} ctx - The message context object
 * @returns {boolean} - True if message is audio but not voice
 */
const isAudioMessage = (ctx) => {
    if (!ctx) return false;
    
    const audioMessage = ctx.message?.audioMessage;
    return !!(audioMessage && !audioMessage.ptt);
};

/**
 * Get the media type of the message
 * @param {Object} ctx - The message context object
 * @returns {string|null} - The media type or null if no media
 */
const getMediaType = (ctx) => {
    if (!ctx) return null;
    
    if (ctx.message?.imageMessage) return 'image';
    if (ctx.message?.videoMessage) return 'video';
    if (ctx.message?.documentMessage) return 'document';
    if (ctx.message?.stickerMessage) return 'sticker';
    if (ctx.message?.audioMessage?.ptt || ctx.message?.voiceMessage) return 'voice';
    if (ctx.message?.audioMessage) return 'audio';
    
    return null;
};

/**
 * Check if message has any type of media or voice
 * @param {Object} ctx - The message context object
 * @returns {boolean} - True if message has media or voice
 */
const hasMediaOrVoice = (ctx) => {
    return isMediaMessage(ctx) || isVoiceMessage(ctx) || isAudioMessage(ctx);
};

/**
 * Get detailed media information
 * @param {Object} ctx - The message context object
 * @returns {Object} - Detailed media information
 */
const getMediaInfo = (ctx) => {
    if (!ctx) return { hasMedia: false, mediaType: null, isVoice: false };
    
    return {
        hasMedia: isMediaMessage(ctx),
        mediaType: getMediaType(ctx),
        isVoice: isVoiceMessage(ctx),
        isAudio: isAudioMessage(ctx),
        hasAnyMedia: hasMediaOrVoice(ctx)
    };
};

export default {
    isMediaMessage,
    isVoiceMessage,
    isAudioMessage,
    getMediaType,
    hasMediaOrVoice,
    getMediaInfo
};

// Named exports for compatibility with import { ... } usage
export {
    isMediaMessage,
    isVoiceMessage,
    isAudioMessage,
    getMediaType,
    hasMediaOrVoice,
    getMediaInfo
};
