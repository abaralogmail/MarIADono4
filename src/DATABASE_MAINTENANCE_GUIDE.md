# Guía de Mantenimiento de la Base de Datos (SQLite + Sequelize)

Este documento sirve como la guía de referencia principal para entender y mantener la base de datos del proyecto.

## Base de Datos (`src/database/`)

Contiene toda la lógica de persistencia de datos. La documentación detallada se encuentra en `DATABASE_MAINTENANCE_GUIDE.md`.

*   **`SqliteManager.js`**: El "Orquestador" de la base de datos SQLite. Gestiona la conexión, carga los modelos de datos (tablas) y sincroniza el esquema. Es el punto central para la capa de datos. Los modelos gestionados incluyen:
    * **ConversationsLog**: Registra las conversaciones entre el bot y los usuarios.
    * **ConversationMetricas**: Almacena métricas relacionadas con cada conversación.
    * **MensajeEstados**: Define el estado de los mensajes enviados.
    * **CtxLogs**: Guarda el contexto de las conversaciones.
    * **ProviderLogs**: Mantiene registros de las interacciones con proveedores.
    * **Ofertas**: Gestiona información sobre ofertas disponibles.
    * **Pedidos**: Controla los pedidos realizados por los usuarios.
    * **Productos**: Almacena información sobre productos disponibles en el sistema.
    * **Usuarios**: Registra datos de los usuarios que interactúan con el sistema.
    * **Horarios, ReglasHorario, ExcepcionesHorario**: Implementan un sistema de horarios polimórfico para la disponibilidad de los bots.
*   **`DatabaseQueries.js`**: Proporciona una capa de abstracción para realizar consultas comunes a la base de datos, simplificando la interacción desde otras partes del código.
*   **`models/`**: Directorio que contiene los "Planos" de la base de datos. Cada archivo define una tabla (modelo) usando Sequelize.
*   **`Data/MarIADono3DB.sqlite`**: El archivo físico de la base de datos SQLite, la "Caja Fuerte" que contiene todos los datos.

---

## Nota sobre el Directorio `database/models/`

En este proyecto, cada modelo de base de datos se define en un archivo separado dentro del directorio `database/models/`. Este enfoque promueve la modularidad y facilita la gestión de un esquema de base de datos en crecimiento. Por lo tanto, el directorio `database/models/` es la **fuente de la verdad** para la estructura de la base de datos. Cualquier cambio en el esquema debe realizarse en el archivo de modelo correspondiente dentro de este directorio.

---

## Tabla Resumen de Mantenimiento

| Archivo / Directorio | Función Principal | ¿Cuándo lo modificamos o usamos? |
| :--- | :--- | :--- |
| `database/SqliteManager.js` | **Orquestador y Definidor de Modelos** | **Siempre** que necesitemos cambiar la estructura de la BD, o para depurar la conexión. |
| `database/DatabaseQueries.js` | **Abstracción de Consultas** | Para añadir o modificar consultas complejas y reutilizables. |
| `Data/MarIADono3DB.sqlite` | **Almacén de Datos** | Para hacer/restaurar backups o para inspección manual. |
