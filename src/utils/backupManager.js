const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { parse } = require('json2csv');
const iconv = require('iconv-lite');

class BackupManager {
    constructor() {
        this.backupDir = path.join(process.cwd(), 'backups');
        this.maxBackups = 12;
        this.filesToBackup = [
            'Logs/conversations_log.xlsx',
            'Logs/conversations_log.csv',
            'Logs/conversations_log.json',
            'Logs/ctx_logs.json',
            'userThreads.json',
            'mensajes/blocked_users.json',
            'src/config/userConfig.json'
        ];
        
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    async createWeeklyBackup() {
        await this.convertJsonToCsv('Logs/conversations_log.json', 'Logs/conversations_log.csv');

        const timestamp = new Date().toISOString().slice(0,10);
        const backupFileName = `backup_${timestamp}.zip`;
        const output = fs.createWriteStream(path.join(this.backupDir, backupFileName));
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.pipe(output);

        this.filesToBackup.forEach(file => {
            if (fs.existsSync(file)) {
                archive.file(file, { name: path.basename(file) });
                console.log(`Added ${file} to backup`);
            }
        });

        await archive.finalize();
        console.log(`Weekly backup created: ${backupFileName}`);
        this.cleanOldBackups();
    }

    async convertJsonToCsv(jsonFilePath, csvFilePath) {
        if (fs.existsSync(jsonFilePath)) {
            const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
            const csvData = parse(jsonData);
            const encodedCsvData = iconv.encode(csvData, 'windows-1258');
            fs.writeFileSync(csvFilePath, encodedCsvData);
            console.log(`Converted ${jsonFilePath} to ${csvFilePath}`);
        } else {
            console.log(`File ${jsonFilePath} does not exist`);
        }
    }

    cleanOldBackups() {
        const files = fs.readdirSync(this.backupDir);
        if (files.length > this.maxBackups) {
            const oldestFiles = files
                .map(f => ({ name: f, time: fs.statSync(path.join(this.backupDir, f)).mtime.getTime() }))
                .sort((a, b) => a.time - b.time)
                .slice(0, files.length - this.maxBackups);
            
            oldestFiles.forEach(file => {
                fs.unlinkSync(path.join(this.backupDir, file.name));
                console.log(`Removed old backup: ${file.name}`);
            });
        }
    }
}

module.exports = BackupManager;