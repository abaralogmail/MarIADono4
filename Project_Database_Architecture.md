# Arquitectura de la Base de Datos: SQLite y Sequelize en MarIADono3

Este documento describe la organización y la lógica de la base de datos en este proyecto, centrada en el uso de SQLite como motor y Sequelize como ORM.

## 1. Resumen de la Arquitectura

El proyecto utiliza una arquitectura de base de datos centralizada y bien definida, cuyas características principales son:

- **Motor de Base de Datos**: **SQLite**. La base de datos completa se gestiona como un único archivo, lo que es ideal para el desarrollo, las pruebas y la portabilidad.
- **ORM**: **Sequelize**. Se utiliza para abstraer las interacciones con la base de datos, permitiendo trabajar con objetos de JavaScript en lugar de escribir SQL puro.
- **Gestión Centralizada**: Toda la lógica de conexión, definición de modelos y operaciones básicas está encapsulada en una única clase gestora.

## 2. Componentes Principales

La lógica de la base de datos se encuentra principalmente en el directorio `src/database/` y se compone de los siguientes archivos clave:

### `src/database/SqliteManager.js`

Este archivo es el **corazón de la gestión de la base de datos**. Sus responsabilidades son:

1.  **Conexión Única (Singleton)**: Implementa un patrón Singleton (`getInstance`) para asegurar que solo exista una instancia de conexión a la base de datos en toda la aplicación, optimizando los recursos.
2.  **Inicialización**: Se conecta al archivo de la base de datos SQLite ubicado (por defecto) en `database/Data/MarIADono3DB.sqlite`.
3.  **Definición de Modelos**: Todos los modelos de la base de datos (que representan a las tablas) se definen dentro del método `defineModels()` de esta clase. Esto incluye `ConversationsLog`, `Usuarios`, `Productos`, el sistema de `Horarios` y muchos otros.
4.  **Definición de Asociaciones**: Las relaciones entre los modelos (ej. `hasMany`, `belongsTo`) se establecen en el método `defineAssociations()`.
5.  **Métodos de Acceso a Datos**: Proporciona métodos de alto nivel para interactuar con la base de datos (ej. `saveConversation`, `verificarDisponibilidad`, `crearHorario`), encapsulando la lógica de Sequelize.

### `src/database/DatabaseQueries.js`

Este archivo está diseñado para **separar las consultas complejas** de la lógica principal de `SqliteManager`. Su propósito es albergar funciones que realicen búsquedas específicas o agregaciones de datos, manteniendo el código más limpio y organizado.

## 3. Estructura de Directorios en `src/database/`

- **`Data/`**: Contiene el archivo físico de la base de datos SQLite (`.sqlite`).
- **`migrations/`**: Almacena los archivos de migración generados por `sequelize-cli`. Cada archivo representa un cambio versionado en el esquema de la base de datos.
- **`seeders/`**: Contiene scripts para poblar la base de datos con datos iniciales o de prueba.
- **`models/`**: Aunque los modelos se definen en `SqliteManager.js`, esta carpeta es el lugar estándar donde `sequelize-cli` espera encontrar las definiciones de modelos si se gestionan como archivos separados.

## 4. Flujo de Funcionamiento

1.  **Inicio de la Aplicación**: Cuando la aplicación se inicia, cualquier parte del código que necesite acceso a la base de datos solicita la instancia de `SqliteManager`.
2.  **Conexión**: En la primera solicitud, `SqliteManager` se inicializa, se conecta al archivo SQLite y prueba la conexión.
3.  **Sincronización de Modelos**: A continuación, define todos los modelos y los sincroniza con la base de datos (`sequelize.sync()`), creando las tablas si aún no existen.
4.  **Operaciones**: Una vez inicializado, el resto de la aplicación utiliza la instancia del manager o los modelos de Sequelize para realizar operaciones CRUD, consultar datos o ejecutar lógica de negocio.

## 5. Gestión del Esquema (Migraciones)

El proyecto está preparado para usar **`sequelize-cli`** para la gestión de cambios en el esquema de la base de datos. En lugar de modificar manualmente las tablas o usar `sync({ force: true })`, el flujo de trabajo correcto es:

1.  Generar un nuevo archivo de migración con `sequelize-cli`.
2.  Definir los cambios en las funciones `up` (aplicar) y `down` (revertir) de la migración.
3.  Ejecutar la migración con el comando `sequelize db:migrate`.

Este enfoque asegura que los cambios en la base de datos sean consistentes, versionados y seguros, especialmente en un entorno de equipo o al desplegar en producción.
