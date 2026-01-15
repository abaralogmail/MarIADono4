import { handleMediaProcessing } from './mediaHandler.js';
import { handleVoiceTranscription } from './voiceHandler.js';

/**
 * Unified manager for voice and media message processing
 * @class VoiceMediaManager
 */
class VoiceMediaManager {
  constructor() {
    this.processingQueue = new Map();
  }

  /**
   * Process voice or media message based on message type
   * @param {Object} ctx - Message context
   * @param {Function} flowDynamic - Flow dynamic function
   * @returns {Object} - Processing result with appropriate body text
   */
  async processMessage(ctx, flowDynamic) {
    const messageId = ctx.key?.id || `${ctx.from}_${Date.now()}`;

    // Prevent duplicate processing
    if (this.processingQueue.has(messageId)) {
      console.log(`Message ${messageId} is already being processed`);
      return this.processingQueue.get(messageId);
    }

    try {
      const processingPromise = this._processMessageInternal(ctx, flowDynamic);
      this.processingQueue.set(messageId, processingPromise);

      const result = await processingPromise;

      // Add body property based on message type
      if (result.success) {
        if (result.messageType === "voice" || result.messageType === "audio") {
          result.body = result.transcription || "";
        } else if (
          ["image", "video", "document"].includes(result.messageType)
        ) {
          result.body = result.description || "";
        }
      } else {
        result.body = "";
      }

      return result;
    } catch (error) {
      console.error("Error in VoiceMediaManager:", error);
      return {
        success: false,
        error: error.message,
        messageType: "unknown",
        body: "",
      };
    } finally {
      // Clean up processing queue
      setTimeout(() => {
        this.processingQueue.delete(messageId);
      }, 5000);
    }
  }

  /**
   * Internal message processing logic
   * @private
   */
  async _processMessageInternal(ctx, flowDynamic) {
    const messageType = this._getMessageType(ctx);

    console.log(`Processing ${messageType} message from ${ctx.from}`);

    switch (messageType) {
      case "voice":
        return await this._processVoiceMessage(ctx, flowDynamic);

      case "audio":
        return await this._processAudioMessage(ctx, flowDynamic);

      case "image":
      case "video":
      case "document":
        return await this._processMediaMessage(ctx, flowDynamic);

      default:
        return {
          success: false,
          error: "Unsupported message type",
          messageType: messageType,
        };
    }
  }

  /**
   * Process voice message (ptt - push to talk)
   * @private
   */
  async _processVoiceMessage(ctx, flowDynamic) {
    try {
      const result = await handleVoiceTranscription(ctx, flowDynamic);

      return {
        success: result.success,
        messageType: "voice",
        transcription: result.transcription,
        transcriptionSent: result.transcriptionSent,
        error: result.error || null,
      };
    } catch (error) {
      console.error("Error processing voice message:", error);
      return {
        success: false,
        messageType: "voice",
        error: error.message,
        transcription: null,
        transcriptionSent: false,
      };
    }
  }

  /**
   * Process audio message (regular audio file)
   * @private
   */
  async _processAudioMessage(ctx, flowDynamic) {
    try {
      // For audio files, we can try transcription first, then media processing
      let transcriptionResult = null;
      let mediaResult = null;

      // Try transcription for audio files
      try {
        transcriptionResult = await handleVoiceTranscription(ctx, flowDynamic);
      } catch (transcriptionError) {
        console.log(
          "Audio transcription failed, trying media processing:",
          transcriptionError.message
        );
      }

      // Process as media (for file handling and description)
      //es media?
      if (!transcriptionResult || !transcriptionResult.success) {
        try {
          mediaResult = await handleMediaProcessing(ctx, flowDynamic);
        } catch (mediaError) {
          console.log("Audio media processing failed:", mediaError.message);
        }
      }
      return {
        success: transcriptionResult?.success || mediaResult?.success || false,
        messageType: "audio",
        transcription: transcriptionResult?.transcription || null,
        transcriptionSent: transcriptionResult?.transcriptionSent || false,
        description: mediaResult?.description || "Audio file processed",
        filePath: mediaResult?.filePath || null,
        buffer: mediaResult?.buffer || null,
        descriptionSent: mediaResult?.descriptionSent || false,
        error:
          !transcriptionResult?.success && !mediaResult?.success
            ? "Failed to process audio file"
            : null,
      };
    } catch (error) {
      console.error("Error processing audio message:", error);
      return {
        success: false,
        messageType: "audio",
        error: error.message,
      };
    }
  }

  /**
   * Process media message (image, video, document)
   * @private
   */
  async _processMediaMessage(ctx, flowDynamic) {
    try {
      const result = await handleMediaProcessing(ctx, flowDynamic);

      return {
        success: result.success,
        messageType: this._getMessageType(ctx),
        description: result.description,
        filePath: result.filePath,
        buffer: result.buffer,
        descriptionSent: result.descriptionSent,
        error: result.error || null,
      };
    } catch (error) {
      console.error("Error processing media message:", error);
      return {
        success: false,
        messageType: this._getMessageType(ctx),
        error: error.message,
        description: null,
        filePath: null,
        buffer: null,
        descriptionSent: false,
      };
    }
  }

  /**
   * Determine message type from context
   * @private
   */
  _getMessageType(ctx) {
    if (!ctx.message) return "unknown";

    // Voice messages (push to talk)
    if (ctx.message.audioMessage && ctx.message.audioMessage.ptt) {
      return "voice";
    }

    // Regular audio files
    if (ctx.message.audioMessage) {
      return "audio";
    }

    // Image messages
    if (ctx.message.imageMessage) {
      return "image";
    }

    // Video messages
    if (ctx.message.videoMessage) {
      return "video";
    }

    // Document messages
    if (ctx.message.documentMessage) {
      return "document";
    }

    return "unknown";
  }

  /**
   * Check if message contains voice or media content
   * @param {Object} ctx - Message context
   * @returns {boolean}
   */
  hasVoiceOrMedia(ctx) {
    return this._getMessageType(ctx) !== "unknown";
  }

  /**
   * Get media info for logging purposes
   * @param {Object} ctx - Message context
   * @returns {Object}
   */
  getMediaInfo(ctx) {
    const messageType = this._getMessageType(ctx);

    return {
      hasAnyMedia: messageType !== "unknown",
      mediaType: messageType,
      isVoice: messageType === "voice",
      isAudio: messageType === "audio",
      hasMedia: ["image", "video", "document"].includes(messageType),
      messageType: messageType,
    };
  }

  /**
   * Get processing queue status
   * @returns {Object}
   */
  getQueueStatus() {
    return {
      activeProcessing: this.processingQueue.size,
      processingMessages: Array.from(this.processingQueue.keys()),
    };
  }

  /**
   * Clear processing queue (for cleanup)
   */
  clearQueue() {
    this.processingQueue.clear();
  }
}

// Export singleton instance
const voiceMediaManager = new VoiceMediaManager();

// Helper wrappers for named exports
const processVoiceOrMedia = (ctx, flowDynamic) =>
  voiceMediaManager.processMessage(ctx, flowDynamic);
const hasVoiceOrMedia = (ctx) => voiceMediaManager.hasVoiceOrMedia(ctx);
const getMediaInfo = (ctx) => voiceMediaManager.getMediaInfo(ctx);

export default {
  VoiceMediaManager,
  voiceMediaManager,
  // Export individual functions for backward compatibility
  processVoiceOrMedia,
  hasVoiceOrMedia,
  getMediaInfo,
};

// Named exports for compatibility
export {
  VoiceMediaManager,
  voiceMediaManager,
  // Individual helper functions
  // Note: these are thin wrappers around the singleton
  processVoiceOrMedia,
  hasVoiceOrMedia,
  getMediaInfo
};
