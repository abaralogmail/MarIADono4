const XLSX = require('xlsx');

class ExcelUpdater {
    constructor(workbook, sheet, excelFilePath) {
        this.workbook = workbook;
        this.sheet = sheet;
        this.excelFilePath = excelFilePath;
    }

    updateSentStatus(rowNum) {
        if (!this.workbook || !this.sheet) {
            console.error("Workbook or sheet not loaded. Cannot update Excel.");
            return;
        }
        const now = new Date();
        const formattedDate = now.toISOString().split('T')[0];
        const enviarCell = XLSX.utils.encode_cell({ r: rowNum, c: 2 }); // Column C (index 2) for 'enviar' status
        this.sheet[enviarCell] = { t: 's', v: formattedDate }; // Mark with date sent
        XLSX.writeFile(this.workbook, this.excelFilePath);
    }
}

module.exports = ExcelUpdater;
