const { addKeyword } = require('@bot-whatsapp/bot');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
//const { chatWithAssistant } = require('./mensajes/Assistant.js');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to read files from a specific folder
async function getNewFiles(folderPath) {
  try {
    // Leer archivos en la carpeta especificada
    const files = await fsPromises.readdir(folderPath);

    // Leer el contenido de cada archivo
    const fileObjects = await Promise.all(files.map(async (file) => {
      const filePath = path.join(folderPath, file);
      
      // Leer el contenido del archivo usando fsPromises.readFile
      const content = await fsPromises.readFile(filePath);

      return { 
        name: file,
        content: content
      };
    }));

    return fileObjects;
  } catch (error) {
    console.error("Error leyendo los archivos:", error);
    throw error;
  }
}

const flowUpdateVectorStore = addKeyword(['updateVS', 'actualizar base de conocimientos'])
  .addAction(async (ctx, { flowDynamic }) => {
    await flowDynamic('Iniciando actualización de la base de conocimientos...');

    try {
      const assistantId = process.env.ASSISTANT_ID;
      
      // Aquí deberías implementar la lógica para obtener los nuevos archivos
      // Por ejemplo, podrías leerlos de una carpeta específica
      //const newFiles = [/* array de objetos de archivo */];

      // Usage in your flow
      
      const folderPath = './Documentos/VectorStore'; // Specify your folder path here
      //const newFiles = await getNewFiles(folderPath);
      const newFiles = ['C:\Developer\MariaDono\MariaDonoJS\base-baileys-memory\Documentos\VectorStore\cursoopmlSonnet.txt']; // Asegúrate de que sean rutas válidas

      const updatedAssistant = await updateAssistantVectorStore(assistantId, newFiles);

      await flowDynamic('Base de conocimientos actualizada exitosamente.');
      await flowDynamic(`Asistente actualizado: ${updatedAssistant.name}`);
    } catch (error) {
      console.error('Error en la actualización:', error);
      await flowDynamic('Hubo un error al actualizar la base de conocimientos. Por favor, intenta más tarde.');
    }
  });

  async function updateAssistantVectorStore(assistantId, files) {
    try {
        // 1. Validar y subir archivos
        const uploadedFiles = await Promise.all(
            files.map(async (file) => {
                // Verificar que 'file' sea una cadena
                if (typeof file !== 'string') {
                    throw new TypeError(`La ruta del archivo debe ser una cadena. Se recibió: ${typeof file}`);
                }

                // Resolver la ruta del archivo
//                const filePath = path.resolve(file);
                const filePath = typeof file === 'object' ? file.path : file;
                // Verifica si la ruta es una cadena válida antes de pasarla a fs.createReadStream
                if (typeof filePath !== 'string') {
                    throw new TypeError(`Invalid file path: ${filePath}`);
                }

                const fileStream = fs.createReadStream(filePath);

                try {
                    //const response = await openai.createFile(fileStream, 'assistants');
                    const response = openai.files.create(fileStream, 'assistants');


                    if (response && response.data && response.data.id) {
                        return response.data.id;
                    } else {
                        throw new Error('File upload failed, invalid response structure');
                    }
                } catch (uploadError) {
                    console.error(`Error subiendo el archivo ${file}:`, uploadError);
                    throw uploadError;
                }
            })
        );

        // 2. Verificar los archivos subidos
        if (!uploadedFiles || uploadedFiles.length === 0) {
            throw new Error('No se subieron archivos');
        }

        // 3. Actualizar el Asistente añadiendo los archivos subidos al vector store
        const updatedAssistant = await openai.updateAssistant(assistantId, {
            file_ids: uploadedFiles,
            tools: [{ type: 'retrieval' }] // Habilita la herramienta de retrieval
        });

        console.log('Asistente actualizado:', updatedAssistant.data);
        return updatedAssistant.data;

    } catch (error) {
        console.error('Error actualizando el vector store del Asistente:', error);
        throw error;
    }
}
  

module.exports = flowUpdateVectorStore;