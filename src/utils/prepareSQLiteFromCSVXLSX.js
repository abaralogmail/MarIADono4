import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
const sqlite3Verbose = sqlite3.verbose();
import csv from 'csv-parser';
import xlsx from 'xlsx';

class PrepareSQLFromTabularData {
    constructor(storedCsvXlsxDirectory) {
        this.storedCsvXlsxDirectory = storedCsvXlsxDirectory;
        this.dbPath = path.join(__dirname, 'database.sqlite');
    }

    async runPipeline() {
        const db = new sqlite3Verbose.Database(this.dbPath);
        //dbpath
        console.log('dbpath: ', this.dbPath);

        try {
            const files = fs.readdirSync(this.storedCsvXlsxDirectory);

            for (const file of files) {
                const filePath = path.join(this.storedCsvXlsxDirectory, file);
                const fileExt = path.extname(file).toLowerCase();
                console.log('fileExt: ', fileExt);
                console.log('filePath: ', filePath);
                if (fileExt === '.csv') {
                    await this.processCSV(db, filePath);
                } else if (fileExt === '.xlsx') {
                    await this.processXLSX(db, filePath);
                }
            }

            console.log('Database preparation completed successfully.');
        } catch (error) {
            console.error('Error preparing database:', error);
        } finally {
            db.close();
        }
    }

    async processCSV(db, filePath) {
        return new Promise((resolve, reject) => {
            const tableName = path.basename(filePath, '.csv');
            const columns = [];
            const values = [];

            fs.createReadStream(filePath)
                .pipe(csv())
                .on('headers', (headers) => {
                    columns.push(...headers);
                })
                .on('data', (row) => {
                    values.push(Object.values(row));
                })
                .on('end', () => {
                    this.createTable(db, tableName, columns);
                    this.insertData(db, tableName, columns, values);
                    resolve();
                })
                .on('error', reject);
        });
    }

    async processXLSX(db, filePath) {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        const tableName = path.basename(filePath, '.xlsx');
        const columns = Object.keys(data[0]);
        const values = data.map(row => Object.values(row));

        this.createTable(db, tableName, columns);
        this.insertData(db, tableName, columns, values);
    }

    createTable(db, tableName, columns) {
        const columnDefs = columns.map(col => `${col} TEXT`).join(', ');
        const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs})`;
        db.run(sql);
    }

    insertData(db, tableName, columns, values) {
        const placeholders = columns.map(() => '?').join(', ');
        const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        const stmt = db.prepare(sql);

        values.forEach(row => {
            stmt.run(row);
        });

        stmt.finalize();
    }
}

export default PrepareSQLFromTabularData;
