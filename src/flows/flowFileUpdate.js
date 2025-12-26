import pkg from '@builderbot/bot';
const { addKeyword, EVENTS } = pkg;
import fs from 'fs';
import path from 'path';
import { botFileMapping } from '../utils/botFileMapping.js';
import { downloadMediaMessage } from "@adiwajshing/baileys";
import { writeMediaMessage } from '../utils/readWriteMediaMessage.js';

const flowFileUpdate = addKeyword(EVENTS.DOCUMENT)
    .addAction(async (ctx, { flowDynamic }) => {
        try {
            // Get the filename from the message
            const fileName = ctx.message?.documentMessage?.fileName || ctx.message?.documentMessage?.title || '';
            
            if (!fileName) {
                //await flowDynamic([{ body: '❌ No se pudo obtener el nombre del archivo.' }]);
                return;
            }

            console.log(`Archivo recibido: ${fileName}`);
            
            // Check if the filename matches any key in botFileMapping
            const matchingBot = Object.keys(botFileMapping).find(bot => 
                fileName.includes(bot) || fileName.toLowerCase().includes(bot.toLowerCase())
            );

            if (matchingBot) {
                await flowDynamic([{ body: `📄 Archivo recibido: ${fileName}\n\nEste archivo corresponde a lista de mensajes de bot.` }]);
                return;
            }

            // Get the target path from the mapping
            const targetPath = botFileMapping[matchingBot];
            
            // Create backup of the existing file
            if (fs.existsSync(targetPath)) {
                const backupDir = path.join(path.dirname(targetPath), 'backups');
                
                // Create backup directory if it doesn't exist
                if (!fs.existsSync(backupDir)) {
                    fs.mkdirSync(backupDir, { recursive: true });
                }
                
                // Create backup filename with timestamp
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupFileName = `${path.basename(targetPath, path.extname(targetPath))}_${timestamp}${path.extname(targetPath)}`;
                const backupPath = path.join(backupDir, backupFileName);
                
                // Copy the existing file to backup
                fs.copyFileSync(targetPath, backupPath);
                console.log(`Backup created at: ${backupPath}`);
            }

            // Download and save the new file
            const mediaData = await downloadMediaMessage(ctx, "buffer");
            
            // Ensure the target directory exists
            const targetDir = path.dirname(targetPath);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            
            // Write the new file
            fs.writeFileSync(targetPath, mediaData);
            
            await flowDynamic([{ 
                body: `✅ Archivo actualizado correctamente:\n\n` +
                      `📁 Bot: ${matchingBot}\n` +
                      `📄 Archivo: ${path.basename(targetPath)}\n` +
                      `🔄 Se ha creado una copia de seguridad del archivo anterior.`
            }]);
            
        } catch (error) {
            console.error('Error en flowFileUpdate:', error);
            await flowDynamic([{ body: '❌ Ocurrió un error al procesar el archivo.' }]);
        }
    });

export default flowFileUpdate;
