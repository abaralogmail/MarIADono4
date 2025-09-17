// Script para generar archivo Excel de configuración para bots
// Necesitamos usar las bibliotecas SheetJS para trabajar con Excel
// Nota: Este código está diseñado para ejecutarse en un entorno que tenga las bibliotecas necesarias



const XLSX = require('xlsx');


// Función para crear el archivo Excel de configuración de bots
function createBotConfigExcel() {
  // Crear un nuevo libro de trabajo
  const workbook = XLSX.utils.book_new();
  
  // Definir los datos para la hoja "Configuraciones"
  const configData = [
    // Encabezados
    [
      'botName', 
      'description', 
      'bulkMessagesEnabled', 
      'autoResponseEnabled', 
      'dailyMessageLimit', 
      'workingDays', 
      'bulkMessageStartTime', 
      'bulkMessageEndTime', 
      'autoResponseStartTime', 
      'autoResponseEndTime', 
      'holidays', 
      'excelFilePath', 
      'webhookUrl', 
      'logLevel', 
      'customPrompt'
    ],
    
    // Ejemplo de configuración para un bot
    [
      'AsistenteVentas', 
      'Bot para atención automática de consultas de ventas', 
      true, 
      true, 
      1000, 
      '1,2,3,4,5', 
      '09:00', 
      '19:00', 
      '08:00', 
      '20:00', 
      '2024-01-01,2024-05-01,2024-12-25', 
      'C:/bots/mensajes/ventas_mensajes.xlsx', 
      'https://empresa.com/webhooks/notificaciones', 
      'info', 
      'Por favor responde de manera amable y profesional. Firma siempre como Asistente de Ventas.'
    ],
    
    // Ejemplo de configuración para otro bot
    [
      'SoporteTecnico', 
      'Bot para soporte técnico de productos', 
      false, 
      true, 
      500, 
      '1,2,3,4,5,6', 
      '08:00', 
      '17:00', 
      '07:00', 
      '22:00', 
      '2024-01-01,2024-12-25', 
      'C:/bots/mensajes/soporte_mensajes.xlsx', 
      'https://empresa.com/webhooks/soporte', 
      'debug', 
      'Responde con precisión técnica y solicita detalles específicos cuando sea necesario.'
    ]
  ];
  
  // Crear una hoja de trabajo con los datos
  const worksheet = XLSX.utils.aoa_to_sheet(configData);
  
  // Ajustar el ancho de las columnas para mejor visualización
  const colWidths = [
    { wch: 15 },  // botName
    { wch: 40 },  // description
    { wch: 18 },  // bulkMessagesEnabled
    { wch: 20 },  // autoResponseEnabled
    { wch: 18 },  // dailyMessageLimit
    { wch: 15 },  // workingDays
    { wch: 20 },  // bulkMessageStartTime
    { wch: 20 },  // bulkMessageEndTime
    { wch: 22 },  // autoResponseStartTime
    { wch: 22 },  // autoResponseEndTime
    { wch: 30 },  // holidays
    { wch: 40 },  // excelFilePath
    { wch: 40 },  // webhookUrl
    { wch: 10 },  // logLevel
    { wch: 60 },  // customPrompt
  ];
  
  worksheet['!cols'] = colWidths;
  
  // Añadir la hoja al libro
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Configuraciones');
  
  // Guardar el archivo Excel
  XLSX.writeFile(workbook, 'BotConfig.xlsx');
  
  console.log('Archivo BotConfig.xlsx generado correctamente');
}

// Ejecutar la función para crear el archivo
createBotConfigExcel();

module.exports = { createBotConfigExcel }; // Use CommonJS export syntax


// Nota: Para utilizar este script necesitas:
// 1. Tener Node.js instalado
// 2. Instalar la biblioteca SheetJS con: npm install xlsx
// 3. Guardar este código como un archivo .js
// 4. Ejecutarlo con: node nombre_del_archivo.js