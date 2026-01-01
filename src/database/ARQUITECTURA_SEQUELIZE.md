# Arquitectura de Base de Datos con Sequelize

## 📋 Descripción General

Este documento describe la organización y estructura de la base de datos del proyecto **MarIADono** utilizando **Sequelize ORM** con **SQLite** como motor de base de datos.

La base de datos está diseñada para gestionar conversaciones de WhatsApp, administración de campañas, segmentación de clientes, horarios de atención y métricas de negocio.

---

## 🗂️ Estructura de Carpetas

```
src/database/
├── config/                    # Configuración de Sequelize
│   └── config.json           # Configuración por ambiente
├── migrations/               # Scripts de migración de esquema
├── models/                   # Modelos Sequelize (ORM)
│   ├── index.js             # Inicializador de modelos
│   ├── Usuarios.js
│   ├── Campaign.js
│   ├── ConversationsLog.js
│   ├── ... (otros modelos)
│   └── (34+ archivos de modelos)
├── seeders/                  # Datos iniciales (seeders)
├── schemas/                  # (Vacío - esquemas de validación opcionales)
├── scripts/                  # Scripts auxiliares
│   ├── sequelize.js         # Configuración Sequelize
│   ├── seed.js
│   └── ... (queries y utilidades)
├── SqliteManager.js         # Manager singleton de la BD
├── DatabaseQueries.js       # Queries reutilizables
├── loadData.js             # Carga de datos
└── Database_Schema_Overview.md
```

---

## 🔧 Configuración

### config.json

La configuración se encuentra en `src/database/config/config.json`:

```json
{
  "development": {
    "dialect": "sqlite",
    "storage": "./src/database/Data/MarIADono3DB.sqlite"
  },
  "test": {
    "dialect": "sqlite",
    "storage": ":memory:"
  },
  "production": {
    "dialect": "sqlite",
    "storage": "./src/database/Data/MarIADono3DB.sqlite"
  }
}
```

**Características:**
- Motor: **SQLite** (sin requerimiento de servidor externo)
- Almacenamiento: Archivo físico en `Data/MarIADono3DB.sqlite`
- Soporte para múltiples ambientes (development, test, production)

### SqliteManager.js

Clase singleton que gestiona la conexión y ciclo de vida de Sequelize:

```javascript
// Uso
const db = await SqliteManager.getInstance();
await db.initialize();
```

**Responsabilidades:**
- Inicializar instancia de Sequelize
- Definir todos los modelos
- Configurar asociaciones entre tablas
- Sincronizar esquema con la base de datos
- Proporcionar métodos de CRUD

---

## 📦 Modelos (Models)

### Estructura de un Modelo

Cada modelo sigue el patrón estándar de Sequelize:

```javascript
export default (sequelize, DataTypes) => {
  const NombreModelo = sequelize.define(
    "NombreModelo",
    {
      // Atributos/campos
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      tableName: "nombre_tabla",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // Definir asociaciones
  NombreModelo.associate = (db) => {
    // Relaciones con otros modelos
  };

  return NombreModelo;
};
```

### Categorías de Modelos

#### 1. **Gestión de Usuarios y Permisos**
- `Usuarios.js` - Información de usuarios/clientes
- `UserRoles.js` - Roles de usuario
- `UserPermissions.js` - Permisos específicos
- `RolePermissions.js` - Relación entre roles y permisos

#### 2. **Conversaciones y Comunicación**
- `ConversationsLog.js` - Registro de todos los mensajes
- `ConversationMetricas.js` - Métricas derivadas de conversaciones
- `MensajeEstados.js` - Estados de mensajes (enviado, leído, etc.)
- `CtxLogs.js` - Contexto/estado de conversación
- `MessageChannel.js` - Canales de comunicación (WhatsApp, etc.)
- `MessageTemplates.js` - Plantillas de mensajes
- `ProviderLogs.js` - Registros del proveedor (Baileys)

#### 3. **Campañas y Marketing**
- `Campaign.js` - Campañas de marketing
- `CampaignGoal.js` - Objetivos de campaña
- `CampaignMessage.js` - Mensajes de campaña
- `CampaignRecipientLog.js` - Registro de destinatarios
- `CampaignAnalytics.js` - Análisis de campañas

#### 4. **Negocio y Productos**
- `Productos.js` - Catálogo de productos
- `Pedidos.js` - Órdenes de compra
- `Ofertas.js` - Ofertas comerciales
- `Horarios.js` - Horarios de atención
- `ReglasHorario.js` - Reglas de horarios
- `ExcepcionesHorario.js` - Excepciones (días festivos, etc.)

#### 5. **Segmentación y Scoring**
- `SegmentationRule.js` - Reglas de segmentación
- `CustomerSegment.js` - Segmentos de clientes
- `SegmentMember.js` - Miembros de segmentos
- `SegmentPerformance.js` - Performance de segmentos
- `CustomerScore.js` - Puntuación/scoring de clientes

#### 6. **Archivo y Almacenamiento**
- `ClientFile.js` - Almacenamiento de archivos de clientes
- `WhatsAppGroup.js` - Grupos de WhatsApp
- `WhatsAppGroupMember.js` - Miembros de grupos
- `WhatsAppGroupClienteMapping.js` - Mapeo grupo-cliente

#### 7. **Métricas y N8n**
- `N8nMetric.js` - Métricas de N8n (automación)

---

## 🔗 Asociaciones (Relaciones)

Las asociaciones en Sequelize definen las relaciones entre tablas:

### Relaciones Principales

#### Horarios y Reglas
```javascript
// Un horario tiene muchas reglas
Horarios.hasMany(ReglasHorario, {
  foreignKey: "horario_id",
  as: "reglas",
  onDelete: "CASCADE",
});

// Una regla pertenece a un horario
ReglasHorario.belongsTo(Horarios, {
  foreignKey: "horario_id",
  as: "horario",
});
```

#### Usuarios y Roles
```javascript
// Un usuario pertenece a un rol
Usuarios.belongsTo(UserRoles, {
  foreignKey: "role_id",
  targetKey: "role_id",
  as: "role",
});
```

#### Campañas
```javascript
// Una campaña es propiedad de un usuario
Campaign.belongsTo(Usuarios, {
  foreignKey: "owner_usuario_id",
  as: "owner",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
```

---

## 🚀 Migraciones

### Ubicación
`src/database/migrations/`

### Estructura de Nombres
Todas las migraciones usan timestamp: `YYYYMMDD-NN-descripcion.cjs`

**Ejemplos:**
- `20251229-00-create-usuarios.cjs` - Crear tabla usuarios
- `20251229-01-create-user-roles.cjs` - Crear tabla user_roles
- `20251230-00-create-campaigns.cjs` - Crear tabla campaigns
- `20251230-02-create-segmentation-and-scores.cjs` - Segmentación

### Estructura de una Migración
```javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla o realizar cambios
    await queryInterface.createTable('tabla', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // más campos...
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir cambios
    await queryInterface.dropTable('tabla');
  }
};
```

### Cómo Ejecutar Migraciones
```bash
# Ejecutar todas las migraciones pendientes
npx sequelize-cli db:migrate

# Deshacer la última migración
npx sequelize-cli db:migrate:undo

# Ver estado de migraciones
npx sequelize-cli db:migrate:status
```

---

## 📊 Diagrama de Relaciones

### Núcleo de Usuarios y Autorización
```
Usuarios
├── UserRoles
│   └── RolePermissions
│       └── UserPermissions
└── Campaigns (como owner)
```

### Flujo de Conversaciones
```
ConversationsLog (mensajes)
├── ConversationMetricas (análisis)
├── MensajeEstados (estado del mensaje)
├── CtxLogs (contexto de conversación)
└── MessageChannel (canal utilizado)
```

### Gestión de Campañas
```
Campaign
├── CampaignGoal (objetivos)
├── CampaignMessage (contenido)
├── CampaignRecipientLog (destinatarios)
├── CampaignAnalytics (resultados)
└── MessageTemplates (plantillas)
```

### Segmentación y Scoring
```
CustomerSegment
├── SegmentationRule (criterios)
├── SegmentMember (clientes en segmento)
├── SegmentPerformance (métricas)
└── CustomerScore (puntuación individual)
```

---

## 💾 Tipos de Datos Utilizados

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `INTEGER` | Números enteros | ID, contadores |
| `STRING(n)` | Texto limitado | Nombres, emails |
| `TEXT` | Texto largo | Descripciones, JSON |
| `BOOLEAN` | Verdadero/Falso | Estados activos |
| `DATE` | Fecha y hora | Timestamps |
| `DATEONLY` | Solo fecha | Fechas de registro |
| `FLOAT` | Números decimales | Precios, métricas |
| `UUID` | Identificador único | IDs de campaña |

---

## 🔑 Convenciones de Naming

### Nombres de Tablas (en BD)
- Minúsculas
- Con guiones bajos para separar palabras
- Plural o singular según contexto
- Ejemplos: `usuarios`, `conversations_log`, `campaigns`

### Nombres de Atributos en Modelos
- camelCase en el modelo JavaScript
- snake_case en la base de datos
- Mapeados con propiedad `field`

```javascript
phoneNumber: {
  type: DataTypes.STRING(50),
  field: "phone_number",  // Así se guarda en la BD
}
```

### Claves Foráneas
- Sufijo `_id`
- Ejemplo: `user_id`, `campaign_id`, `horario_id`

---

## ⚙️ Inicialización y Sincronización

### Proceso de Inicialización

1. **Crear instancia de Sequelize**
   ```javascript
   const sequelize = new Sequelize({
     dialect: "sqlite",
     storage: "./Data/MarIADono3DB.sqlite",
   });
   ```

2. **Definir modelos**
   - Cargar archivos de modelo desde carpeta `models/`
   - Ejecutar función de cada modelo

3. **Establecer asociaciones**
   - Ejecutar método `associate()` de cada modelo
   - Definir relaciones entre tablas

4. **Sincronizar con BD**
   ```javascript
   await sequelize.sync({ alter: false });
   ```

### Opciones de Sincronización
- `sync()` - Solo crea tablas que no existen
- `sync({ alter: true })` - Modifica tablas existentes
- `sync({ force: true })` - Elimina y recrea todas las tablas ⚠️

---

## 📝 Operaciones CRUD

### Create (Crear)
```javascript
const nuevoUsuario = await db.models.Usuarios.create({
  nombre: "Juan",
  email: "juan@example.com",
  phoneNumber: "1234567890"
});
```

### Read (Leer)
```javascript
// Uno
const usuario = await db.models.Usuarios.findByPk(1);

// Todos
const usuarios = await db.models.Usuarios.findAll();

// Con condiciones
const activos = await db.models.Usuarios.findAll({
  where: { activo: true }
});
```

### Update (Actualizar)
```javascript
await db.models.Usuarios.update(
  { nombre: "Juan Actualizado" },
  { where: { id: 1 } }
);
```

### Delete (Eliminar)
```javascript
await db.models.Usuarios.destroy({
  where: { id: 1 }
});
```

---

## 🔐 Características de Seguridad

### Claves Foráneas en SQLite
```javascript
const sequelize = new Sequelize({
  dialectOptions: {
    foreignKeys: true,  // Habilitar FK en SQLite
  },
});
```

### ON DELETE Actions
- `CASCADE` - Elimina registros relacionados
- `SET NULL` - Establece NULL en la FK
- `RESTRICT` - Impide eliminación si existen referencias

### Timestamps Automáticos
```javascript
timestamps: true,
createdAt: "created_at",
updatedAt: "updated_at",
```

---

## 📈 Escalabilidad y Mantenimiento

### Ventajas de SQLite
✅ Sin servidor externo
✅ Archivo único portátil
✅ Bajo footprint de recursos
✅ Perfecto para desarrollo y aplicaciones medianas

### Limitaciones
⚠️ Concurrencia limitada
⚠️ Rendimiento con millones de registros
⚠️ No ideal para aplicaciones distribuidas

### Migración Futura
Para pasar a PostgreSQL o MySQL:
1. Cambiar `dialect` en `config.json`
2. Actualizar credenciales de conexión
3. Ajustar tipos de datos si es necesario
4. Ejecutar migraciones nuevamente

---

## 🛠️ Desarrollo

### Agregar un Nuevo Modelo

1. **Crear archivo en `models/`**
   ```javascript
   // models/MiModelo.js
   export default (sequelize, DataTypes) => {
     const MiModelo = sequelize.define("MiModelo", {
       // atributos
     });
     
     MiModelo.associate = (db) => {
       // asociaciones
     };
     
     return MiModelo;
   };
   ```

2. **Importar en `SqliteManager.js`**
   ```javascript
   import MiModeloModel from "./models/MiModelo.js";
   
   // En defineModels():
   this.models.MiModelo = MiModeloModel(this.sequelize, DataTypes);
   ```

3. **Crear migración**
   ```bash
   npx sequelize-cli migration:generate --name create-mi-modelo
   ```

4. **Definir asociaciones en `defineAssociations()`**

### Debug
```javascript
// Ver SQL ejecutado
logging: console.log,

// O solo en desarrollo
logging: process.env.NODE_ENV === "development" ? console.log : false,
```

---

## 📚 Referencias Útiles

- [Documentación Sequelize](https://sequelize.org/)
- [SQLite en Sequelize](https://sequelize.org/docs/v6/getting-started/#connecting-to-sqlite)
- [Migraciones CLI](https://sequelize.org/docs/v6/other-topics/migrations/)
- [Asociaciones](https://sequelize.org/docs/v6/core-concepts/assocs/)

---

## 📌 Notas Importantes

- La base de datos SQLite se almacena en `src/database/Data/MarIADono3DB.sqlite`
- Los archivos `.sqlite-shm` y `.sqlite-wal` son archivos temporales de SQLite
- Para desarrollo, usar `NODE_ENV=development` para ver SQL
- Las migraciones deben ser idempotentes (ejecutables múltiples veces)
- Mantener coherencia en snake_case (BD) vs camelCase (Modelos)

---

**Última actualización:** Diciembre 30, 2025
**Versión:** 1.0
