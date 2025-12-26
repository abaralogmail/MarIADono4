import pkg from '@builderbot/bot';
// CommonJS package: destructure needed helpers from default
const { downloadMediaMessage } = pkg;
import { writeMediaMessage, readMediaFromContext } from './readWriteMediaMessage.js';
import fs from 'fs';
import path from 'path';



class MessageData {
    constructor() {
        this._from = '';
        this._role = '';
        this._body = '';
        this._date = '';
        this._time = '';
        this._messageId = '';
        this._pushName = '';
        this._botName = '';

        this._etapaEmbudo = '';
        this._interesCliente = '';
        //Media
        this._mediaType = null;
        this._mediaUrl = null;
        this._mediaBuffer = null; // Nuevo campo para almacenar los datos del medio en formato binario
        this._aiResponses = [];
        this._mediaFilePath = null; // Nuevo campo para almacenar la ruta del archivo descargado

        // Added userHistory
        this._chatHistory = [];
    }

    // Getters
    get from() { return this._from; }
    get role() { return this._role; }
    get body() { return this._body; }
    get date() { return this._date; }
    get time() { return this._time; }
    get messageId() { return this._messageId; }
    get pushName() { return this._pushName; }
    get etapaEmbudo() { return this._etapaEmbudo; }
    get interesCliente() { return this._interesCliente; }
    get botName() { return this._botName; }

    get mediaType() { return this._mediaType; }
    get mediaUrl() { return this._mediaUrl; }
    get mediaBuffer() { return this._mediaBuffer; } // Getter para mediaBuffer
    get aiResponses() { return this._aiResponses; }

    get mediaFilePath() { return this._mediaFilePath; } // Nuevo getter para la ruta del archivo descargado

    // Added getter for userHistory
    get chatHistory() { return this._chatHistory; }

    // Getters and setters for ctx
    get ctx() { return this._ctx; }
    set ctx(value) { this._ctx = value; }

    // Setters
    set from(value) { this._from = value; }
    set role(value) { this._role = value; }
    set body(value) { this._body = value; }
    set date(value) { this._date = value; }
    set time(value) { this._time = value; }
    set messageId(value) { this._messageId = value; }
    set pushName(value) { this._pushName = value; }
    set etapaEmbudo(value) { this._etapaEmbudo = value; }
    set interesCliente(value) { this._interesCliente = value; }
    set botName(value) { this._botName = value; }

    //Media
    set mediaType(value) { this._mediaType = value; }
    set mediaUrl(value) { this._mediaUrl = value; }
    set mediaBuffer(value) { this._mediaBuffer = value; } // Setter para mediaBuffer
    set aiResponses(value) { this._aiResponses = value; }

    set mediaFilePath(value) { this._mediaFilePath = value; } // Nuevo setter para la

    // Added setter for userHistory
    set chatHistory(value) { this._chatHistory = value; }

    async saveImageMessage(ctx) {
        const mediaFilePath = await writeMediaMessage(ctx);
        if (mediaFilePath) {
            this.mediaType = 'Image';
            this.mediaUrl = ctx.message.imageMessage.mediaMessage;
            this.mediaFilePath = mediaFilePath; // Store the path of the saved image
        } else {
            this.mediaType = 'Image';
            this.mediaUrl = '';
            this.mediaFilePath = null;
        }
    }

    // Method to create a MessageData object from ctx
    static async fromCtx(ctx) {
        const messageData = new MessageData();
        const now = new Date();
        now.setHours(now.getHours() - 3);

        messageData.from = ctx.from;
        messageData.role = ctx.role || 'incoming';
        messageData.body = ctx.body;
        messageData.date = now.toISOString().split('T')[0];
        messageData.time = now.toISOString().split('T')[1].split('.')[0];
        messageData.messageId = ctx.key.id;
        messageData.pushName = ctx.pushName;
        messageData.etapaEmbudo = ctx.etapaEmbudo || '';
        messageData.interesCliente = ctx.interesCliente || '';

        if (ctx.message && ctx.message.imageMessage) {
          //  await messageData.saveImageMessage(ctx);
        }

        // Agregar ctx como propiedad
        messageData.ctx = ctx;

        return messageData;
    }

    // Nuevos métodos para integración con DuckDB
    async loadChatHistory(limit = 15) {
        try {
            const db = await DuckDBManager.getInstance();
            this._chatHistory = await db.getChatHistory(this._from, limit);
            return this._chatHistory;
        } catch (error) {
            console.error('Error loading chat history:', error);
            return [];
        }
    }
/*
    async save() {
        try {
            const db = await DuckDBManager.getInstance();
            await db.saveConversation(this);
            console.log(`✅ Conversation saved for ${this._from}`);
        } catch (error) {
            console.error('Error saving conversation:', error);
        }
    }*/

    async saveFunnelAnalysis(confidence = 0.8, analysisData = {}) {
        try {
            const db = await DuckDBManager.getInstance();
            await db.saveFunnelAnalysis(
                this._from, 
                this._etapaEmbudo, 
                confidence, 
                {
                    ...analysisData,
                    interest: this._interesCliente,
                    message: this._body,
                    aiResponses: this._aiResponses
                }
            );
            console.log(`✅ Funnel analysis saved for ${this._from} - Stage: ${this._etapaEmbudo}`);
        } catch (error) {
            console.error('Error saving funnel analysis:', error);
        }
    }

    // Método para obtener contexto enriquecido
    async getEnrichedContext() {
        await this.loadChatHistory();
        
        return {
            currentMessage: {
                from: this._from,
                body: this._body,
                timestamp: new Date().toISOString(),
                mediaType: this._mediaType
            },
            chatHistory: this._chatHistory,
            funnelStage: this._etapaEmbudo,
            customerInterest: this._interesCliente,
            pushName: this._pushName
        };
    }

    // Método para convertir a formato JSON para logs
    /*
    toJSON() {
        return {
            from: this._from,
            role: this._role,
            body: this._body,
            date: this._date,
            time: this._time,
            messageId: this._messageId,
            pushName: this._pushName,
            botName: this._botName,
            etapaEmbudo: this._etapaEmbudo,
            interesCliente: this._interesCliente,
            mediaType: this._mediaType,
            mediaUrl: this._mediaUrl,
            aiResponses: this._aiResponses,
            timestamp: new Date().toISOString()
        };
    }*/
}

export default MessageData;