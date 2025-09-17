const fs = require('fs');
const path = require('path');

/**
 * Converts a JSON file to a CSV file.
 * @param {string} jsonFilePath - The absolute path to the input JSON file.
 * @param {string} csvFilePath - The absolute path to the output CSV file.
 */
function convertJsonToCsv(jsonFilePath, csvFilePath) {
  try {
    // Read and parse the JSON file
    const jsonString = fs.readFileSync(jsonFilePath, 'utf8');
    const jsonData = JSON.parse(jsonString);

    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      console.log('El archivo JSON está vacío o no es un array. No se generó ningún archivo CSV.');
      return;
    }

    // Get headers from the keys of the first object
    const headers = Object.keys(jsonData[0]);
    
    // Function to escape CSV fields
    const escapeCsvField = (field) => {
      if (field === null || field === undefined) {
        return '';
      }
      const stringField = String(field);
      // Escape quotes by doubling them and wrap the field in quotes if it contains commas, quotes, or newlines
      if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n') || stringField.includes('\r')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    // Convert JSON data to CSV format
    const csvRows = [
      headers.join(','), // Header row
      ...jsonData.map(row =>
        headers.map(header => escapeCsvField(row[header])).join(',')
      )
    ];

    const csvString = csvRows.join('\n');

    // Write the CSV string to the output file
    fs.writeFileSync(csvFilePath, csvString, 'utf8');

    console.log(`¡Éxito! El archivo se ha convertido a ${csvFilePath}`);

  } catch (error) {
    console.error('Ocurrió un error durante la conversión:', error);
  }
}

// File paths from arguments
const jsonPath = process.argv[2];
const csvPath = process.argv[3];

if (!jsonPath || !csvPath) {
  console.error('Por favor, proporciona las rutas de los archivos de entrada (JSON) y salida (CSV).');
  process.exit(1);
}

// Resolve to absolute paths to be safe
const absoluteJsonPath = path.resolve(jsonPath);
const absoluteCsvPath = path.resolve(csvPath);

convertJsonToCsv(absoluteJsonPath, absoluteCsvPath);
