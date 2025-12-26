import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import pkg from '@builderbot/bot';
const { downloadMediaMessage } = pkg;
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import FormData from 'form-data';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const voiceToText = async (filePath) => {
    if (!fs.existsSync(filePath)) {
        throw new Error('No se encuentra el archivo');
    }
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: 'whisper-1',
        });
        return transcription.text;
    } catch (err) {
        console.error('voiceToText error:', err?.message ?? err);
        return 'ERROR';
    }
};

const convertOggMp3 = async (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        const outputStream = fs.createWriteStream(outputPath);
        ffmpeg(inputPath)
            .audioCodec('libmp3lame')
            .audioBitrate(128)
            .format('mp3')
            .on('end', () => {
                outputStream.end();
                resolve(true);
            })
            .on('error', (err) => {
                outputStream.end();
                reject(err);
            })
            .pipe(outputStream);
    });
};

export const handlerAI = async (ctx) => {
    const buffer = await downloadMediaMessage(ctx, 'buffer');

    const pathTmpOgg = path.join(process.cwd(), 'tmp', `voice-note-${Date.now()}.ogg`);
    const pathTmpMp3 = path.join(process.cwd(), 'tmp', `voice-note-${Date.now()}.mp3`);

    fs.writeFileSync(pathTmpOgg, buffer);
    await convertOggMp3(pathTmpOgg, pathTmpMp3);

    const text = await voiceToText(pathTmpMp3);

    try { fs.unlinkSync(pathTmpMp3); } catch (e) { /* ignore */ }
    try { fs.unlinkSync(pathTmpOgg); } catch (e) { /* ignore */ }

    return text;
};

export default { handlerAI };