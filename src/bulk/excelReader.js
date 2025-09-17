const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

class ExcelReader {
    constructor(excelFilePath) {
        this.excelFilePath = excelFilePath;
        this.workbook = null;
        this.sheet = null;
        this.range = null;
    }

    loadWorkbook() {
        try {
            if (!fs.existsSync(this.excelFilePath)) {
                console.error(`Excel file not found: ${this.excelFilePath}`);
                return false;
            }
            this.workbook = XLSX.readFile(this.excelFilePath);
            this.sheet = this.workbook.Sheets[this.workbook.SheetNames[0]];
            this.range = XLSX.utils.decode_range(this.sheet['!ref']);
            return true;
        } catch (error) {
            console.error(`Error loading Excel workbook ${this.excelFilePath}:`, error);
            return false;
        }
    }

    countMessagesSentToday() {
        if (!this.sheet || !this.range) {
            console.warn("Workbook not loaded. Cannot count messages.");
            return 0;
        }
        const today = new Date().toISOString().split('T')[0];
        let count = 0;

        for (let rowNum = this.range.s.r + 1; rowNum <= this.range.e.r; rowNum++) {
            const enviarCell = XLSX.utils.encode_cell({ r: rowNum, c: 2 });
            const cellValue = this.sheet[enviarCell] ? this.sheet[enviarCell].v : undefined;

            if (cellValue === today) {
                count++;
            }
        }
        return count;
    }

    *getRowIterator() {
        if (!this.sheet || !this.range) {
            console.error("Workbook not loaded. Cannot iterate rows.");
            return; // Return an empty iterator
        }
        for (let rowNum = this.range.s.r + 1; rowNum <= this.range.e.r; rowNum++) {
            yield {
                rowNum,
                data: this.extractRowData(rowNum)
            };
        }
    }

    extractRowData(rowNum) {
        if (!this.sheet) {
             console.error("Sheet not loaded. Cannot extract row data.");
             return null;
        }
        // Helper to safely get cell value
        const getCellValue = (col) => {
            const cell = this.sheet[XLSX.utils.encode_cell({ r: rowNum, c: col })];
            return cell ? cell.v : undefined;
        };

        return {
            telefono: getCellValue(0),
            nombre: getCellValue(1), // Assuming name is in column B (index 1)
            enviar: getCellValue(2), // Assuming 'enviar' status is in column C (index 2)
            mensaje: getCellValue(4), // Assuming message is in column E (index 4)
            imageUrl: getCellValue(12), // Assuming imageUrl is in column M (index 12)
            audioUrl: getCellValue(13), // Assuming audioUrl is in column N (index 13)
            imageFile: getCellValue(14) // Assuming imageFile is in column O (index 14)
        };
    }

    getWorkbook() {
        return this.workbook;
    }

    getSheet() {
        return this.sheet;
    }
}

module.exports = ExcelReader;
