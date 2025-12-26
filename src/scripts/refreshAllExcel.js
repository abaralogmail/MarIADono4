import { exec } from 'child_process';
import ExcelJS from 'exceljs';
import xlsx from 'node-xlsx';
import path from 'path';

//const config = require('../config/config.json');

async function runMacro() {
  console.log("Ejecutando macro...");
//  const rutaArchivo = '../..//BD_Clientes//Conexion_Clientes.xlsm';
  const rutaArchivo = 'C:\\Developer\\MariaDono\\MariaDonoJS\\MarIADono3\\BD_Clientes\\Conexion_Clientes.xlsm';

  console.log("Current Working Directory:", process.cwd());
const resolvedPath = path.resolve(__dirname, rutaArchivo);
console.log("Resolved Path:", resolvedPath);

  const nombreMacro = "RefreshAll";

  try {
  //  const workbook = XLSX.readFile(rutaArchivo);
    //ejecutar macro
  
    
    const workbook = xlsx.parse(rutaArchivo);
    const macro = workbook.macro.run
    getMacro(nombreMacro);
    macro.run();
    //const workbook = new ExcelJS.Workbook();
    //await workbook.xlsx.readFile(rutaArchivo);
    
    // Aquí puedes realizar operaciones con Excel
   // const worksheet = workbook.getWorksheet(1);
    
       // Ejecutar la macro
      
        
       // Guardar cambios (opcional)
       workbook.Save();
       
       // Cerrar el archivo
       workbook.Close();
       
       // Cerrar Excel
       //excel.Quit();
       
       // Liberar los objetos COM
       workbook = null;
       //excel = null;
       
       return true;
  } catch (error) {
    console.error("Error al ejecutar la macro:", error.message);
    return false;
  }
}

export default { runMacro };


