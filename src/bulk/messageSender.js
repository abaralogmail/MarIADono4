const fs = require('fs');
const path = require('path');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class MessageSender {
    constructor(provider) {
        this.provider = provider;
    }

    async enviarMensaje(messageData) {
        const { from, body, imageUrl, audioUrl, mediaUrl, imageFile, videoUrl } = messageData;

        const recipient = `${from}@c.us`; // Assuming standard WhatsApp number format

        try {
            let messageId = null;

            // Envio de texto
            if (body) {
                messageId = await this.provider.sendMessage(`${from}@s.whatsapp.net`, body, "");
                // console.log(`Text message sent to ${recipient}: ${body} (messageId: ${messageId})`);
            }

            // Envio de imagen desde archivo
            if (imageFile) {
                const fullImagePath = path.resolve(imageFile);
                if (fs.existsSync(fullImagePath)) {
                    messageId = await this.provider.sendImage(`${from}@s.whatsapp.net`, fullImagePath, "");
                    console.log(`Image file sent to ${from}@s.whatsapp.net: ${fullImagePath}`);
                } else {
                    console.error(`Image file not found: ${fullImagePath}`);
                }
            } else if (imageUrl) { // Envio de imagen desde URL
                messageId = await this.provider.sendImage(`${from}@s.whatsapp.net`, imageUrl, "");
                console.log(`Image URL sent to ${from}@s.whatsapp.net: ${imageUrl}`);
            }

            // Envio de audio
            if (audioUrl) {
                messageId = await this.provider.sendAudio(`${from}@s.whatsapp.net`, audioUrl);
                console.log(`Audio URL sent to ${from}@s.whatsapp.net: ${audioUrl}`);
            }
            
            // Envio de media
            if (mediaUrl) {
                messageId = await this.provider.sendMedia(`${from}@s.whatsapp.net`, mediaUrl );
                console.log(`Media URL sent to ${from}@s.whatsapp.net: ${mediaUrl}`);
            }

            // Nuevo bloque para enviar videos
            if (videoUrl) {
                messageId = await this.provider.sendVideo(`${from}@s.whatsapp.net`, videoUrl);
                console.log(`Video URL sent to ${from}@s.whatsapp.net: ${videoUrl}`);
            }

            return {
                success: true,
                messageId: messageId.key.id, // Return the messageId obtained from sendText
            };
        } catch (error) {
            console.error(`Error sending message to ${recipient}:`, error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async handleDelay(rowNum) {
        console.log('Waiting 10 seconds before next message...');
        await delay(10000); // 10 seconds

        if ((rowNum + 1) % 10 === 0) {
            console.log('Taking an additional 5-minute break...');
            await delay(300000); // 5 minutes
        }
    }
}

module.exports = MessageSender;