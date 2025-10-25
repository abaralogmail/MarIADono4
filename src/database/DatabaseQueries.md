## Descripción de Funcionalidades

### 1. **Método: `mensajesBulkEnviadosHoy`**
- **Propósito**: Consulta los registros de mensajes enviados en un día específico para un bot específico.

- **Parámetros**: 
  - Ninguno.

- **Proceso**:
  - Establecer la fecha actual.
  - Definir el nombre del bot (`providerBotName`).
  - Ejecutar una consulta SQL para obtener registros de log de conversaciones.
  
- **Devoluciones**:
  - Retorna los resultados de la consulta.
  
- **Manejo de errores**:
  - Captura de excepciones en caso de error en la consulta y logging correspondiente.

### 2. **Método: `guardarMetricasConversacion`**
- **Propósito**: Guarda métricas de conversación usando el modelo `ConversationMetricas` de Sequelize.

- **Parámetros**:
  - `datos`: Objeto que contiene información relevante de la conversación.

- **Proceso**:
  - Mapeo de los datos del objeto `datos` al formato requerido por el modelo.
  - Invocación del método `saveMetricas` en `sqliteDb` para guardar esos datos.

- **Devoluciones**:
  - Retorna el resultado de la operación de guardado.

- **Manejo de errores**:
  - Captura de errores al guardar las métricas y logging correspondiente.

## 3. **Importaciones**
- Se requiere el módulo `SqliteManager` para la gestión de la base de datos.
- Se usa `QueryTypes` de `sequelize` para especificar el tipo de consulta.

---

*Nota: Este archivo de markdown debe ser mantenido en paralelo con el código en `DatabaseQueries.js` para asegurar que ambos reflejen las mismas funcionalidades y lógica.*