# Guía de Estudio: SQLite y Sequelize

Esta guía proporciona una visión completa de cómo utilizar SQLite junto con el ORM Sequelize en un entorno de Node.js. Cubriremos desde los conceptos básicos hasta las mejores prácticas.

## 1. ¿Qué es SQLite?

**SQLite** es un motor de base de datos relacional autónomo, sin servidor y de configuración cero. A diferencia de sistemas como MySQL o PostgreSQL, no requiere un proceso de servidor separado. La base de datos completa se almacena en un único archivo `.sqlite` en el disco.

### Ventajas Clave:
- **Portabilidad**: Al ser un solo archivo, es increíblemente fácil de mover, copiar y compartir.
- **Simplicidad**: No requiere instalación ni configuración de un servidor.
- **Ideal para Desarrollo**: Perfecto para entornos de desarrollo y pruebas locales antes de pasar a sistemas de bases de datos más robustos en producción.
- **Aplicaciones Embebidas**: Excelente para aplicaciones de escritorio, móviles o cualquier software que necesite una base de datos local.

## 2. ¿Qué es Sequelize?

**Sequelize** es un **ORM (Object-Relational Mapper)** para Node.js. Su función es "mapear" los modelos de datos de tu aplicación (objetos de JavaScript) a las tablas de una base de datos relacional.

### Ventajas de Usar un ORM como Sequelize:
- **Abstracción**: Escribes código JavaScript en lugar de SQL puro. Sequelize traduce tus operaciones a SQL compatible con diferentes dialectos (SQLite, MySQL, PostgreSQL, etc.).
- **Productividad**: Simplifica las operaciones comunes de la base de datos (CRUD: Create, Read, Update, Delete).
- **Seguridad**: Ayuda a prevenir ataques de inyección SQL al utilizar consultas parametrizadas por defecto.
- **Portabilidad**: Facilita el cambio de una base de datos a otra con mínimas modificaciones en el código.

## 3. Configuración del Entorno

Para empezar, necesitas instalar Sequelize y el controlador de SQLite en tu proyecto de Node.js.

## 4. Conexión a la Base de Datos

Crea un archivo para gestionar la conexión. Por ejemplo, `database.js`.

```javascript
// database.js
const { Sequelize } = require('sequelize');

// Crea una nueva instancia de Sequelize, conectándose a un archivo de base de datos SQLite.
// El archivo 'database.sqlite' se creará en la raíz del proyecto si no existe.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // Ruta al archivo de la base de datos
  logging: console.log // Muestra las consultas SQL en la consola (útil para depurar)
});

// Función para probar la conexión
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
  }
}

testConnection();

module.exports = sequelize;
```

## 5. Definición de Modelos

Un modelo es una clase que representa una tabla en tu base de datos. Por ejemplo, para una tabla `Users`, el modelo se vería así:

```javascript
// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // Importa la instancia de Sequelize

const User = sequelize.define('User', {
  // Define los atributos del modelo
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false // No permite valores nulos
  },
  lastName: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    unique: true // Asegura que el email sea único
  }
}, {
  // Opciones adicionales del modelo
  tableName: 'users', // Nombre explícito de la tabla
  timestamps: true // Añade los campos createdAt y updatedAt automáticamente
});

// Sincroniza el modelo con la base de datos (crea la tabla si no existe)
User.sync({ force: false }) // force: true eliminará y recreará la tabla
  .then(() => console.log("Tabla 'users' creada o ya existente."));

module.exports = User;
```

## 6. Operaciones CRUD Básicas

Una vez definido el modelo, puedes realizar operaciones CRUD fácilmente.

```javascript
const User = require('./models/User');

async function manageUsers() {
  // CREATE: Crear un nuevo usuario
  const newUser = await User.create({
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@example.com'
  });
  console.log('Usuario creado:', newUser.toJSON());

  // READ: Encontrar todos los usuarios
  const users = await User.findAll();
  console.log('Todos los usuarios:', users.map(u => u.toJSON()));

  // READ: Encontrar un usuario por su ID
  const userById = await User.findByPk(1);
  console.log('Usuario con ID 1:', userById.toJSON());

  // UPDATE: Actualizar un usuario
  await User.update({ lastName: 'García' }, {
    where: {
      id: 1
    }
  });
  console.log('Usuario actualizado.');

  // DELETE: Eliminar un usuario
  await User.destroy({
    where: {
      id: 1
    }
  });
  console.log('Usuario eliminado.');
}

manageUsers();
```

## 7. Asociaciones (Relaciones)

Sequelize permite definir relaciones entre modelos.

### Uno a Muchos (One-to-Many)
Un `User` puede tener muchos `Posts`.

```javascript
// models/Post.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const User = require('./User');

const Post = sequelize.define('Post', {
  title: DataTypes.STRING,
  content: DataTypes.TEXT
});

// Definir la asociación
User.hasMany(Post); // Un usuario tiene muchos posts
Post.belongsTo(User); // Un post pertenece a un usuario

// Sincronizar modelos
sequelize.sync();
```

### Cargar datos relacionados (Eager Loading)
Para evitar múltiples consultas a la base de datos, usa `include` para cargar los posts de un usuario en una sola consulta.

```javascript
const userWithPosts = await User.findByPk(1, {
  include: Post // Incluye los posts asociados
});
console.log(userWithPosts.toJSON());
```

## 8. Migraciones

A medida que tu aplicación evoluciona, el esquema de tu base de datos cambiará. Las **migraciones** son una forma de gestionar estos cambios de manera versionada y controlada.

Para usar migraciones, es recomendable instalar `sequelize-cli`.

1.  **Inicializar Sequelize CLI**:
    ```bash
    sequelize init
    ```
    Esto crea las carpetas `config`, `migrations`, `models` y `seeders`.

2.  **Crear una migración**:
    Por ejemplo, para añadir una columna `status` a la tabla `users`.
    ```bash
    sequelize migration:generate --name add-status-to-users
    ```

3.  **Editar el archivo de migración**:
    El archivo generado tendrá dos funciones: `up` (aplica el cambio) y `down` (revierte el cambio).

    ```javascript
    // En el archivo de migración
    module.exports = {
      up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'status', {
          type: Sequelize.STRING,
          defaultValue: 'active'
        });
      },
      down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'status');
      }
    };
    ```

4.  **Ejecutar la migración**:
    ```bash
    sequelize db:migrate
    ```

## 9. Mejores Prácticas

- **Usa Migraciones**: No uses `sync({ force: true })` en producción. Las migraciones son la forma segura de evolucionar tu base de datos.
- **Centraliza la Configuración**: Mantén la configuración de Sequelize en un único lugar.
- **Eager Loading (`include`)**: Carga previamente las asociaciones para evitar el problema N+1 y mejorar el rendimiento.
- **Manejo de Errores**: Envuelve siempre tus operaciones de base de datos en bloques `try...catch` o usa promesas `.catch()`.
- **Variables de Entorno**: No escribas credenciales o rutas directamente en el código. Usa variables de entorno (con paquetes como `dotenv`).
- **Consultas Raw**: Para consultas muy complejas o que requieren un rendimiento máximo, Sequelize permite ejecutar SQL puro con `sequelize.query()`.
