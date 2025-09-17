# Guía de Mantenimiento de la Base de Datos (SQLite + Sequelize)

Este documento sirve como la guía de referencia principal para entender y mantener la base de datos del proyecto.

## Resumen Ejecutivo

La arquitectura de la base de datos se sostiene sobre tres pilares fundamentales. Conocerlos es clave para cualquier tarea de mantenimiento, depuración o modificación.

1.  **El Orquestador (`SqliteManager.js`):** El punto de control central que gestiona la conexión y la configuración.
2.  **Los Planos (`Model/`):** El directorio que define la estructura de cada tabla. Es la "fuente de la verdad".
3.  **La Caja Fuerte (`Data/MarIADono3DB.sqlite`):** El archivo físico que contiene todos los datos.

---

## 1. El Orquestador: `SqliteManager.js`

*   **Función Principal:** Es el **punto de control central**. Este archivo es el único responsable de la conexión con la base de datos.

*   **Responsabilidades Clave:**
    1.  **Establecer la Conexión:** Configura Sequelize para que utilice el archivo de base de datos ubicado en `Data/MarIADono3DB.sqlite`.
    2.  **Cargar los Modelos:** Descubre y registra automáticamente todos los archivos de definición de tablas (modelos) que se encuentran en la carpeta `Model/`.
    3.  **Sincronizar el Esquema:** Ejecuta `sequelize.sync()`, el comando que asegura que las tablas definidas en el código existan en el archivo físico de la base de datos.

*   **Relevancia para Mantenimiento:**
    *   **Problemas de Conexión:** Si la aplicación no puede acceder a la base de datos, este es el **primer archivo que se debe revisar**.
    *   **Depuración de Consultas:** Para ver el SQL exacto que Sequelize está ejecutando, se debe activar la opción `logging: console.log` en la configuración de la instancia de Sequelize dentro de este archivo.

---

## 2. Los Planos: El Directorio `Model/`

*   **Función Principal:** Es la **fuente de la verdad** para la estructura de la base de datos. Cada archivo `.js` dentro de este directorio define una tabla, sus columnas, tipos de datos y relaciones.

*   **Contenido Actual:**
    *   `conversations_LogModel.js` → Define la tabla `conversations_log`.
    *   `metricasModel.js` → Define la tabla `metricas`.

*   **Relevancia para Mantenimiento:**
    *   **Modificar una Tabla:** Para añadir, eliminar o cambiar una columna, se debe editar el archivo del modelo correspondiente en este directorio.
    *   **Crear una Nueva Tabla:** Para añadir una nueva tabla a la base de datos, se debe crear un nuevo archivo de modelo en este directorio.
    *   **Documentación Viva:** Este directorio actúa como la documentación principal de la estructura de la base de datos.

---

## 3. La Caja Fuerte: `Data/MarIADono3DB.sqlite`

*   **Función Principal:** Es el **activo físico**. Este único archivo contiene todas las tablas, relaciones y, lo más importante, todos los datos de la aplicación.

*   **Características:**
    *   Es un archivo binario gestionado internamente por el motor de SQLite.
    *   Es portable y autocontenido.

*   **Relevancia para Mantenimiento:**
    *   **Copias de Seguridad (Backups):** Realizar un backup es tan simple como **copiar este archivo** a una ubicación segura.
    *   **Restauración:** Para restaurar la base de datos, simplemente se reemplaza el archivo existente con una copia de seguridad previa.
    *   **Inspección Directa:** Se puede utilizar una herramienta externa como **DB Browser for SQLite** para abrir este archivo, inspeccionar los datos visualmente, y ejecutar consultas SQL directamente para diagnósticos avanzados.

---

## Tabla Resumen de Mantenimiento

| Archivo / Directorio | Función Principal | ¿Cuándo lo modificamos o usamos? |
| :--- | :--- | :--- |
| `SqliteManager.js` | **Conexión y Configuración** | Para depurar problemas de conexión o activar logs. |
| `Model/` | **Definición de Tablas** | **Siempre** que necesitemos cambiar la estructura de la BD. |
| `Data/MarIADono3DB.sqlite`| **Almacén de Datos** | Para hacer/restaurar backups o para inspección manual. |
