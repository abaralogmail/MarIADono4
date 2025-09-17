//const OllamaFunnelClassifier = require('../OllamaFunnelClassifier');
const N8nWebhookListener = require('../../src/Logica/N8nWebhookListener');
const { getInstance: getBotConfigManager } = require('../../src/config/botConfigManager');

class MessageFormatter {
    constructor(botName) {
        this.botName = botName;
        this.configManager = getBotConfigManager();
       // this.classifier = new OllamaFunnelClassifier({ model: 'llama3.2:latest' }); // Consider making model configurable
        // N8nWebhookListener instance might be better managed externally or made optional
        // this.n8nWebhook = new N8nWebhookListener('http://localhost:5678/webhook/formattedN8nSendBulkMessages');
    }

    async formatWhatsAppMessage(messageData) {
        const config = this.configManager.getBotConfig(this.botName);
        const customPrompt = config.customPrompt;

        if (this.botName === "BotAdministracionSalta") {
            // Skip formatting for this specific bot
            return messageData.body;
        }

        // Use custom prompt if available, otherwise use default
        const promptTemplate = customPrompt || `
Formatea el siguiente mensaje para WhatsApp:
- Ofrece el producto de manera atractiva y concisa
- Agrega emojis relevantes
- Usa negritas (*texto*) para palabras clave
- Agrega saltos de línea para mejor legibilidad
- Mantén un tono amigable y profesional

Mensaje original:
{text}

Mensaje formateado:
`;

        try {
            const formattedMessage = await this.classifier.processCustomPrompt(promptTemplate, messageData.body);
            // Consider sending to N8n webhook here if needed, or handle it in the manager
            // if (this.n8nWebhook) {
            //     await this.n8nWebhook.sendData({ original: messageData.body, formatted: formattedMessage.text });
            // }
            return formattedMessage.text.trim();
        } catch (error) {
            console.error("Error formatting message:", error);
            // Return original message if formatting fails
            return messageData.body;
        }
    }
}

module.exports = MessageFormatter;
