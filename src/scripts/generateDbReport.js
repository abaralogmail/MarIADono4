const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

// Setup a temporary Sequelize instance for SQLite to inspect models
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'Data', 'MarIA_Dono_v3_DB.sqlite'), // Using the correct DB name from user context
  logging: false,
});

// Dynamically import all models from the database/Model directory
const modelsDir = path.join(__dirname, '..', 'database', 'Model');
const models = {};
let reportGenerated = false;

try {
  fs.readdirSync(modelsDir)
    .filter(file => file.endsWith('.js'))
    .forEach(file => {
      try {
        const modelDefinition = require(path.join(modelsDir, file));
        // Check if it's a valid Sequelize model definition function
        if (typeof modelDefinition === 'function') {
            const model = modelDefinition(sequelize, Sequelize.DataTypes);
            models[model.name] = model;
        } else {
            console.warn(`Advertencia: El archivo ${file} no exporta una función de modelo de Sequelize válida.`);
        }
      } catch (error) {
        console.error(`Error al cargar el modelo desde ${file}:`, error);
      }
    });

  if (Object.keys(models).length === 0) {
    throw new Error("No se encontraron o cargaron modelos de Sequelize válidos en el directorio 'database/Model'.");
  }

  let markdownContent = '# Informe de la Base de Datos (SQLite)\n\n';
  markdownContent += `*Este informe fue generado automáticamente el ${new Date().toLocaleString()} inspeccionando los modelos de Sequelize.*\n\n`;

  for (const modelName in models) {
    const model = models[modelName];
    const tableName = model.tableName;
    const attributes = model.getAttributes();

    markdownContent += `## Tabla: \`${tableName}\`\n\n`;
    markdownContent += `**Modelo de Sequelize:** \`${modelName}\`\n\n`;
    
    markdownContent += '| Columna | Tipo de Dato | ¿Permite Nulos? | ¿Clave Primaria? | Valor por Defecto |\n';
    markdownContent += '|---|---|---|---|---|\n';

    for (const attrName in attributes) {
      const attr = attributes[attrName];
      const type = attr.type.constructor.name + (attr.type._length ? `(${attr.type._length})` : '');
      const allowNull = attr.allowNull ? 'Sí' : 'No';
      const primaryKey = attr.primaryKey ? 'Sí' : 'No';
      const defaultValue = attr.defaultValue !== undefined && attr.defaultValue !== null ? `\`${JSON.stringify(attr.defaultValue)}\`` : 'Ninguno';
      
      markdownContent += `| \`${attrName}\` | ${type} | ${allowNull} | ${primaryKey} | ${defaultValue} |\n`;
    }
    markdownContent += '\n';
  }

  const outputPath = path.join(__dirname, '..', 'informe_base_de_datos.md');
  fs.writeFileSync(outputPath, markdownContent);

  console.log(`Informe generado exitosamente en: ${outputPath}`);
  reportGenerated = true;

} catch (error) {
  console.error("Error al generar el informe de la base de datos:", error.message);
}

if (!reportGenerated) {
    console.log("\nEl informe no pudo ser generado. Revisa los errores anteriores para más detalles.");
}
