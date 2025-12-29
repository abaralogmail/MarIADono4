# 📊 INFORME COMPLETO DE LA BASE DE DATOS - SISTEMA MARIADONO

**Fecha de Generación:** Diciembre 28, 2025  
**Proyecto:** MarIADonoMeta  
**Tipo de Base de Datos:** SQLite + Sequelize ORM  
**Ubicación del archivo BD:** `src/database/data/MarIADono3DB.sqlite`

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura y Configuración](#arquitectura-y-configuración)
3. [Catálogo Completo de Tablas](#catálogo-completo-de-tablas)
4. [Diagrama de Relaciones](#diagrama-de-relaciones)
5. [Flujo de Datos](#flujo-de-datos)
6. [Métodos y Operaciones](#métodos-y-operaciones)
7. [Análisis de Rendimiento](#análisis-de-rendimiento)
8. [Seguridad y Backup](#seguridad-y-backup)
9. [Recomendaciones](#recomendaciones)

---

## 🎯 RESUMEN EJECUTIVO

### Descripción General
La base de datos del sistema MarIADono es una instancia **SQLite** gestionada mediante **Sequelize ORM**. Almacena la información operacional completa del bot conversacional, incluyendo:

- **Conversaciones:** registros de interacciones usuario-bot
- **Usuarios:** datos de clientes registrados
- **Productos & Ofertas:** catálogo disponible
- **Pedidos:** órdenes realizadas por usuarios
- **Métricas:** análisis de conversaciones y comportamiento
- **Horarios:** sistema de disponibilidad polimórfico
- **Logs:** registro de eventos del sistema

### Características Principales
- ✅ **Persistencia:** Almacenamiento en disco local
- ✅ **ORM:** Sequelize para operaciones CRUD abstracción
- ✅ **Relaciones:** Asociaciones one-to-many (Horarios → Reglas/Excepciones)
- ✅ **Transacciones:** Compatible con múltiples operaciones concurrentes
- ✅ **Timestamps:** Auditoría con `created_at` y `updated_at`
- ✅ **Validación:** Restricciones a nivel de modelo

### Estadísticas Técnicas
- **Total de Tablas:** 14 modelos definidos
- **Claves Primarias:** Todas las tablas las poseen (auto-increment)
- **Relaciones Configuradas:** 6 asociaciones (Horarios polimórfico)
- **ORM Framework:** Sequelize v6+
- **Dialect:** sqlite3

---

## 🏗️ ARQUITECTURA Y CONFIGURACIÓN

### Componentes Principales

#### 1. **SqliteManager.js** (Orquestador Principal)
**Ubicación:** `src/database/SqliteManager.js`  
**Responsabilidad:** Gestor centralizado de la conexión a BD y modelos

```
SqliteManager (Singleton Pattern)
├── Conexión Sequelize
├── Carga de 14 modelos
├── Sincronización de esquema
├── Métodos CRUD de utilidad
└── Métodos especializados (horarios, conversaciones)
```

**Métodos Principales:**
| Método | Descripción |
|--------|-------------|
| `getInstance()` | Obtiene instancia singleton |
| `initialize()` | Inicializa BD y sincroniza modelos |
| `testConnection()` | Verifica conectividad |
| `saveConversation()` | Almacena conversaciones |
| `query()` | Ejecuta SQL personalizado |
| `defineAssociations()` | Configura relaciones entre modelos |

#### 2. **DatabaseQueries.js** (Capa de Abstracción)
**Ubicación:** `src/database/DatabaseQueries.js`  
**Responsabilidad:** Métodos reutilizables para consultas comunes

**Métodos Disponibles:**
- `mensajesBulkEnviadosHoy()` - Mensajes masivos del día actual
- `mensajesBulkEnviadosEstaSemana()` - Mensajes de la semana
- `mensajesBulkEnviadosEsteMes()` - Mensajes del mes
- `guardarMetricasConversacion()` - Persistencia de métricas

#### 3. **Directorio de Modelos** (`src/database/models/`)
**Ubicación:** `src/database/models/`  
**Contenido:** 14 archivos de definición de tablas (Sequelize Models)

**Patrón de Definición:**
```javascript
export default (sequelize, DataTypes) => {
  const ModelName = sequelize.define('ModelName', {
    // columnas
  }, {
    tableName: 'table_name',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return ModelName;
};
```

---

## 📊 CATÁLOGO COMPLETO DE TABLAS

### 1. **conversations_log** (ConversationsLog)
**Descripción:** Registro de todas las conversaciones entre usuarios y el bot  
**Tabla SQL:** `conversations_log`  
**Propósito:** Auditoría y análisis de interacciones

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| id | INTEGER | NO | PK, Auto-increment |
| date | DATEONLY | SÍ | Fecha de la conversación (YYYY-MM-DD) |
| time | TIME | SÍ | Hora de la conversación (HH:MM:SS) |
| from | VARCHAR(20) | SÍ | Número de teléfono del usuario (E.164) |
| role | VARCHAR(20) | SÍ | Rol: 'user', 'bot', etc. |
| pushName | VARCHAR(100) | SÍ | Nombre visible del contacto en WhatsApp |
| body | TEXT | SÍ | Contenido del mensaje |
| messageId | VARCHAR(50) | SÍ | ID único del mensaje en Meta |
| etapaEmbudo | VARCHAR(10) | SÍ | Etapa del funnel: 'atraccion', 'interes', etc. |
| interesCliente | VARCHAR(50) | SÍ | Categoría de interés del cliente |
| botName | VARCHAR(50) | SÍ | Nombre del bot que respondió |
| created_at | TIMESTAMP | NO | Timestamp de creación (automático) |
| updated_at | TIMESTAMP | SÍ | Timestamp de actualización |

**Índices Implícitos:**
- PK en `id`
- Índice en `from` (búsquedas por usuario)
- Índice compuesto en `date + time`

**Casos de Uso:**
- Obtener historial de conversaciones por usuario
- Análisis de patrones de comunicación
- Reportes de etapas del funnel
- Exportación de transcripciones

---

### 2. **conversation_metricas** (ConversationMetricas)
**Descripción:** Métricas detalladas de cada conversación  
**Tabla SQL:** `conversation_metricas`  
**Propósito:** Análisis de calidad y comportamiento

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| id | INTEGER | NO | PK, Auto-increment |
| messageId | VARCHAR(50) | SÍ | FK a conversations_log.messageId |
| respuesta | TEXT | SÍ | Respuesta del bot a la consulta |
| metricasCliente | TEXT | SÍ | JSON con métricas del cliente |
| interesCliente | TEXT | SÍ | Análisis de interés (JSON) |
| estadoHabilitacionNotificacion | BOOLEAN | SÍ | ¿Notificaciones habilitadas? |
| etapaEmbudo | VARCHAR(10) | SÍ | Etapa del funnel |
| consultaReformulada | TEXT | SÍ | Pregunta procesada por IA |
| confianzaReformulada | VARCHAR(10) | SÍ | Confidence score (0-1) |
| asistenteInformacion | TEXT | SÍ | Info del asistente IA que respondió |
| created_at | TIMESTAMP | NO | Timestamp de creación |
| updated_at | TIMESTAMP | SÍ | Timestamp de actualización |

**Casos de Uso:**
- Evaluar calidad de respuestas del bot
- Análisis de confianza en reformulaciones
- Segmentación por intereses
- Auditoría de notificaciones

---

### 3. **n8n_metric** (N8nMetric)
**Descripción:** Métricas de integraciones con N8N (workflow automation)  
**Tabla SQL:** `n8n_metric`  
**Propósito:** Monitoreo de automatizaciones

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| id | INTEGER | NO | PK, Auto-increment |
| userId | VARCHAR(50) | NO | ID del usuario |
| botName | VARCHAR(50) | NO | Bot que ejecutó |
| messageId | VARCHAR(50) | SÍ | Mensaje asociado |
| interesCliente | TEXT | SÍ | Interés clasificado |
| etapaEmbudo | VARCHAR(10) | SÍ | Fase del funnel |
| estadoHabilitacionNotificacion | INTEGER | SÍ | Estado (0/1) |
| consultaReformulada | TEXT | SÍ | Consulta procesada |
| confianzaReformulada | VARCHAR(10) | SÍ | Score confianza |
| asistenteInformacion | TEXT | SÍ | Información asistente |
| created_at | TIMESTAMP | NO | Creación |
| updated_at | TIMESTAMP | SÍ | Actualización |

**Casos de Uso:**
- Seguimiento de workflows en N8N
- Auditoría de automatizaciones
- Análisis de tasas de éxito

---

### 4. **mensaje_estados** (MensajeEstados)
**Descripción:** Estados de entrega de mensajes  
**Tabla SQL:** `mensaje_estados`  
**Propósito:** Tracking de entregas

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| id | INTEGER | NO | PK |
| messageId | VARCHAR(50) | SÍ | ID del mensaje |
| estado | VARCHAR(50) | SÍ | Estado: 'sent', 'delivered', 'read', 'failed' |
| timestamp | DATE | SÍ | Timestamp del cambio |
| created_at | TIMESTAMP | NO | Creación |

**Estados Válidos:**
- `pending` - Pendiente de envío
- `sent` - Enviado al servidor Meta
- `delivered` - Entregado al dispositivo
- `read` - Leído por el usuario
- `failed` - Falló el envío
- `error` - Error en la entrega

**Casos de Uso:**
- Verificar entrega de mensajes
- Análisis de tasa de lectura
- Debugging de fallos de envío

---

### 5. **ctx_logs** (CtxLogs)
**Descripción:** Logs de contexto de conversaciones  
**Tabla SQL:** `ctx_logs`  
**Propósito:** Debugging y análisis de sesiones

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| id | INTEGER | NO | PK |
| phoneNumber | VARCHAR(50) | NO | Número del usuario |
| contextData | JSON | SÍ | Contexto serializado (variables de sesión) |
| timestamp | DATE | NO | Cuándo se capturó |
| created_at | TIMESTAMP | NO | Creación |

**Estructura Típica de contextData:**
```json
{
  "sessionId": "xxxxx",
  "variables": {"name": "Juan", "age": 30},
  "flowState": "registerFlow",
  "lastMessage": "Hola",
  "timestamps": {"entry": "2025-01-15T10:30:00Z"}
}
```

**Casos de Uso:**
- Restaurar sesiones de usuarios
- Debugging de flows
- Análisis de cambios de estado

---

### 6. **provider_logs** (ProviderLogs)
**Descripción:** Logs de interacciones con Meta Provider  
**Tabla SQL:** `provider_logs`  
**Propósito:** Auditoría de API calls

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| id | INTEGER | NO | PK |
| phoneNumber | VARCHAR(50) | SÍ | Usuario destino |
| providerName | VARCHAR(100) | SÍ | Proveedor: 'meta', 'whatsapp', etc. |
| action | VARCHAR(100) | SÍ | Acción: 'send_message', 'webhook', etc. |
| data | JSON | SÍ | Payload completo de la operación |
| timestamp | DATE | NO | Cuándo ocurrió |
| created_at | TIMESTAMP | NO | Creación |

**Casos de Uso:**
- Monitorear API calls a Meta
- Debugging de webhooks
- Análisis de latencia
- Auditoría de operaciones

---

### 7. **ofertas** (Ofertas)
**Descripción:** Catálogo de ofertas y promociones  
**Tabla SQL:** `ofertas`  
**Propósito:** Gestión de promociones

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| id | INTEGER | NO | PK |
| codigo | VARCHAR(50) | SÍ | Código único de la oferta |
| descripcion | TEXT | SÍ | Detalles de la promoción |
| precio | DECIMAL(10,2) | SÍ | Precio en oferta |
| fechaOferta | DATEONLY | SÍ | Fecha de la oferta |
| created_at | TIMESTAMP | NO | Creación |

**Casos de Uso:**
- Consultar ofertas activas
- Historial de promociones
- Análisis de conversiones por oferta

---

### 8. **pedidos** (Pedidos)
**Descripción:** Órdenes de compra de usuarios  
**Tabla SQL:** `pedidos`  
**Propósito:** Gestión de ventas

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| id | INTEGER | NO | PK |
| numeroPedido | VARCHAR(50) | SÍ | ID de referencia |
| clienteId | INTEGER | SÍ | FK a usuarios.id |
| fechaPedido | DATEONLY | SÍ | Cuándo se realizó |
| total | DECIMAL(10,2) | SÍ | Monto total |
| estado | VARCHAR(50) | SÍ | Estado: 'pendiente', 'confirmado', 'enviado' |
| created_at | TIMESTAMP | NO | Creación |

**Estados Válidos:**
- `pendiente` - Awaiting confirmation
- `confirmado` - Order confirmed
- `procesando` - Being processed
- `enviado` - Shipped
- `entregado` - Delivered
- `cancelado` - Cancelled

**Casos de Uso:**
- Consultas de pedidos por cliente
- Reportes de ventas
- Seguimiento de estado

---

### 9. **productos** (Productos)
**Descripción:** Catálogo de productos  
**Tabla SQL:** `productos`  
**Propósito:** Gestión de inventario

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| id | INTEGER | NO | PK |
| codigo | VARCHAR(50) | SÍ | SKU |
| nombre | VARCHAR(200) | SÍ | Nombre del producto |
| descripcion | TEXT | SÍ | Detalles técnicos |
| precio | DECIMAL(10,2) | SÍ | Precio unitario |
| stock | INTEGER | SÍ | Cantidad disponible |
| categoria | VARCHAR(100) | SÍ | Categoría: 'electrónica', 'ropa', etc. |
| created_at | TIMESTAMP | NO | Creación |

**Casos de Uso:**
- Búsqueda de productos
- Consulta de disponibilidad
- Listado por categoría
- Gestión de inventario

---

### 10. **usuarios** (Usuarios)
**Descripción:** Usuarios registrados en el sistema  
**Tabla SQL:** `usuarios`  
**Propósito:** Gestión de clientes

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| id | INTEGER | NO | PK |
| phoneNumber | VARCHAR(50) | SÍ | Teléfono (unique) |
| nombre | VARCHAR(100) | SÍ | Nombre completo |
| email | VARCHAR(100) | SÍ | Correo electrónico |
| fechaRegistro | DATEONLY | SÍ | Cuándo se registró |
| activo | BOOLEAN | NO | ¿Cuenta activa? (default: true) |
| created_at | TIMESTAMP | NO | Creación |

**Restricciones:**
- `phoneNumber` es UNIQUE (un teléfono = un usuario)

**Casos de Uso:**
- Validar si usuario está registrado
- Obtener perfil de cliente
- Listar usuarios activos
- Filtrar por fecha de registro

---

### 11. **horarios** (Horarios) ⭐ SISTEMA POLIMÓRFICO
**Descripción:** Configuración de horarios de disponibilidad  
**Tabla SQL:** `horarios`  
**Propósito:** Gestión de franjas horarias para bots

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| horario_id | INTEGER | NO | PK |
| nombre | VARCHAR(100) | NO | Nombre descriptivo |
| descripcion | TEXT | SÍ | Descripción larga |
| bot_name | VARCHAR(50) | NO | Bot asociado (ej. 'BotAugustoTucuman') |
| tipo_horario_id | VARCHAR(50) | NO | Tipo: 'atencion_cliente', 'horario_comercial' |
| zona_horaria | VARCHAR(50) | NO | TZ (default: America/Argentina/Buenos_Aires) |
| activo | BOOLEAN | NO | ¿Horario activo? |
| created_at | TIMESTAMP | NO | Creación |
| updated_at | TIMESTAMP | SÍ | Actualización |

**Relaciones:**
- `hasMany` → `ReglasHorario` (as 'reglas') [CASCADE DELETE]
- `hasMany` → `ExcepcionesHorario` (as 'excepciones') [CASCADE DELETE]

**Ejemplo de Uso:**
```javascript
const horario = await manager.obtenerHorarioCompleto('atencion_cliente', 'BotAugustoTucuman');
// Retorna:
// {
//   horarioId: 1,
//   nombre: "Atención 9-18",
//   botName: "BotAugustoTucuman",
//   reglas: [
//     { reglaId: 1, diaSemana: 1, horaInicio: "09:00:00", horaFin: "18:00:00" },
//     ...
//   ],
//   excepciones: [ ... ]
// }
```

**Casos de Uso:**
- Definir horas de atención
- Controlar disponibilidad por bot
- Soportar múltiples zonas horarias

---

### 12. **reglas_horario** (ReglasHorario)
**Descripción:** Reglas de horarios regulares (lunes-viernes)  
**Tabla SQL:** `reglas_horario`  
**Propósito:** Definir franjas horarias por día de semana

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| regla_id | INTEGER | NO | PK |
| horario_id | INTEGER | NO | FK → horarios.horario_id |
| dia_semana | INTEGER | NO | 0-6 (domingo=0, lunes=1, ..., sábado=6) |
| hora_inicio | TIME | NO | HH:MM:SS (ej. "09:00:00") |
| hora_fin | TIME | NO | HH:MM:SS (ej. "18:00:00") |
| activo | BOOLEAN | NO | ¿Regla activa? |
| created_at | TIMESTAMP | NO | Creación |
| updated_at | TIMESTAMP | SÍ | Actualización |

**Restricciones:**
- `dia_semana` validado entre 0-6
- `hora_fin` > `hora_inicio`

**Ejemplo:**
```
horario_id=1, dia_semana=1, hora_inicio="09:00:00", hora_fin="18:00:00"
→ Lunes, 9 AM a 6 PM
```

**Casos de Uso:**
- Definir horario comercial semanal
- Validar disponibilidad actual
- Mostrar "disponible hasta las X"

---

### 13. **excepciones_horario** (ExcepcionesHorario)
**Descripción:** Excepciones a las reglas regulares (feriados, días especiales)  
**Tabla SQL:** `excepciones_horario`  
**Propósito:** Sobreescribir horarios en fechas específicas

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| excepcion_id | INTEGER | NO | PK |
| horario_id | INTEGER | NO | FK → horarios.horario_id |
| fecha_excepcion | DATEONLY | NO | Fecha específica (YYYY-MM-DD) |
| estado | ENUM | NO | 'cerrado' \| 'horario_personalizado' |
| hora_inicio | TIME | SÍ | Req si estado='horario_personalizado' |
| hora_fin | TIME | SÍ | Req si estado='horario_personalizado' |
| descripcion | TEXT | SÍ | Razón: "Feriado", "Cierre especial" |
| created_at | TIMESTAMP | NO | Creación |
| updated_at | TIMESTAMP | SÍ | Actualización |

**Estados:**
- `cerrado` - Día completamente cerrado
- `horario_personalizado` - Horario diferente al regular

**Ejemplo 1 (Feriado):**
```
horario_id=1, fecha_excepcion="2025-01-01", estado="cerrado"
→ Año nuevo: Bot no disponible
```

**Ejemplo 2 (Horario reducido):**
```
horario_id=1, fecha_excepcion="2025-12-24", estado="horario_personalizado",
hora_inicio="09:00:00", hora_fin="12:00:00"
→ Nochebuena: 9 AM a 12 PM solo
```

**Casos de Uso:**
- Marcar feriados
- Horarios especiales (Black Friday, etc.)
- Pausas o cierre temporal

---

### 14. **Tabla Relacional: Horarios ↔ Reglas ↔ Excepciones**

**Estructura Jerárquica:**
```
Horarios (1 por bot/tipo)
├── ReglasHorario (múltiples, 1 por día de semana)
│   ├── Lunes: 09:00-18:00
│   ├── Martes: 09:00-18:00
│   └── ...
└── ExcepcionesHorario (múltiples, 1 por fecha especial)
    ├── 2025-01-01: Cerrado
    ├── 2025-12-24: 09:00-12:00
    └── ...
```

**Lógica de Verificación de Disponibilidad:**
```
verificarDisponibilidad(tipo_horario_id, botName, fechaHora):
  1. Obtener horario activo para bot
  2. Verificar si hay excepción para la fecha
     a. Si estado = "cerrado" → NO disponible
     b. Si estado = "horario_personalizado" → verificar franja
  3. Si no hay excepción, verificar regla para día_semana
  4. Retornar true/false según franja horaria
```

**Implementación en SqliteManager:**
```javascript
async verificarDisponibilidad(tipo_horario_id, botName, fechaHora) {
  // Obtiene horario con reglas y excepciones
  // Verifica excepciones primero (mayor prioridad)
  // Luego verifica reglas regulares
  // Retorna disponibilidad
}
```

---

## 🔗 DIAGRAMA DE RELACIONES

```
usuarios
├─ id (PK)
├─ phoneNumber (UNIQUE)
└─ (contiene N-conversaciones)
   └─ conversations_log
      ├─ id (PK)
      ├─ from (FK → phoneNumber)
      └─ (contiene 0-1 métrica)
         └─ conversation_metricas
            ├─ id (PK)
            └─ messageId (FK)

usuario → pedido
├─ usuarios.id (PK)
└─ pedidos.cliente_id (FK)
   ├─ numeroPedido
   ├─ fechaPedido
   └─ estado

productos
├─ id (PK)
├─ codigo (UNIQUE)
├─ nombre
├─ stock
└─ (usado en pedidos)

ofertas
├─ id (PK)
├─ codigo
├─ precio
└─ fechaOferta

horarios (Sistema Polimórfico)
├─ horario_id (PK)
├─ bot_name
├─ tipo_horario_id
└─ (contiene N-reglas con CASCADE DELETE)
   └─ reglas_horario
      ├─ regla_id (PK)
      ├─ horario_id (FK)
      ├─ dia_semana
      ├─ hora_inicio
      └─ hora_fin
└─ (contiene N-excepciones con CASCADE DELETE)
   └─ excepciones_horario
      ├─ excepcion_id (PK)
      ├─ horario_id (FK)
      ├─ fecha_excepcion
      ├─ estado (ENUM)
      ├─ hora_inicio
      └─ hora_fin

Logs & Monitoring
├─ ctx_logs
│  ├─ id (PK)
│  ├─ phoneNumber (FK)
│  └─ contextData (JSON)
├─ provider_logs
│  ├─ id (PK)
│  ├─ phoneNumber
│  ├─ action
│  └─ data (JSON)
├─ mensaje_estados
│  ├─ id (PK)
│  ├─ messageId (FK)
│  └─ estado (ENUM)
└─ n8n_metric
   ├─ id (PK)
   ├─ userId
   ├─ botName
   └─ etapaEmbudo
```

---

## 📤 FLUJO DE DATOS

### Flujo 1: Conversación Entrante
```
User WhatsApp
    ↓
Meta Webhook
    ↓
app.js (provider-meta)
    ↓
SqliteManager.saveConversation()
    ↓
✅ conversations_log
✅ conversation_metricas (si IA procesa)
✅ ctx_logs (si contexto se guarda)
```

### Flujo 2: Pedido de Producto
```
Mensaje "Quiero comprar X"
    ↓
Bot interpreta conversación
    ↓
verificar productos.stock
    ↓
crear pedidos (estado: "pendiente")
    ↓
guardar en DB
    ↓
enviar confirmación → mensaje_estados
```

### Flujo 3: Verificación de Disponibilidad
```
Usuario envía mensaje
    ↓
verificarDisponibilidad(tipo_horario_id, botName)
    ↓
obtener horarios con reglas/excepciones
    ↓
verificar excepciones (fecha actual)
    ↓
verificar reglas (día_semana + hora)
    ↓
retornar disponible: true/false
    ↓
si no disponible → "Estamos cerrados"
```

### Flujo 4: Integración N8N
```
Webhook N8N
    ↓
guardarMetricasConversacion()
    ↓
crear registro en n8n_metric
    ↓
crear registro en conversation_metricas
```

---

## 🔧 MÉTODOS Y OPERACIONES

### Operaciones CRUD (Create, Read, Update, Delete)

#### Conversaciones
```javascript
// CREATE
const msg = {
  from: '543812010781',
  role: 'user',
  pushName: 'Juan',
  body: 'Hola',
  botName: 'BotAugustoTucuman'
};
await manager.saveConversation(msg);

// READ
const convs = await manager.findConversationsByPhone('543812010781');

// Custom Query
const result = await manager.query(`
  SELECT * FROM conversations_log 
  WHERE date = '2025-01-15' 
  LIMIT 10
`);
```

#### Usuarios
```javascript
// CREATE
await manager.models.Usuarios.create({
  phoneNumber: '543812010781',
  nombre: 'Juan Pérez',
  email: 'juan@example.com'
});

// READ
const user = await manager.models.Usuarios.findOne({
  where: { phoneNumber: '543812010781' }
});

// UPDATE
await user.update({ nombre: 'Juan Carlos' });

// DELETE
await user.destroy();
```

#### Horarios (Polimórfico)
```javascript
// CREATE Horario
const horario = await manager.crearHorario({
  nombre: 'Atención Normal',
  botName: 'BotAugustoTucuman',
  tipo_horario_id: 'atencion_cliente',
  zonaHoraria: 'America/Argentina/Buenos_Aires'
});

// CREATE Regla
await manager.crearReglaHorario({
  horario_id: horario.horarioId,
  dia_semana: 1, // Lunes
  hora_inicio: '09:00:00',
  hora_fin: '18:00:00'
});

// CREATE Excepción
await manager.crearExcepcionHorario({
  horario_id: horario.horarioId,
  fecha_excepcion: '2025-01-01',
  estado: 'cerrado',
  descripcion: 'Año Nuevo'
});

// READ + Verificar
const disponible = await manager.verificarDisponibilidad(
  'atencion_cliente',
  'BotAugustoTucuman',
  new Date()
);
console.log(disponible ? 'Disponible' : 'Cerrado');
```

### Consultas Analíticas (DatabaseQueries)

```javascript
// Mensajes del día
const today = await DatabaseQueries.mensajesBulkEnviadosHoy();

// Mensajes de la semana
const week = await DatabaseQueries.mensajesBulkEnviadosEstaSemana();

// Mensajes del mes
const month = await DatabaseQueries.mensajesBulkEnviadosEsteMes();

// Guardar métricas
await DatabaseQueries.guardarMetricasConversacion({
  messageId: 'msg_123',
  respuesta: 'Hola, ¿en qué puedo ayudarte?',
  interesCliente: 'Productos electrónicos',
  etapaEmbudo: 'interes',
  confianza_reformulada: '0.95'
});
```

---

## 📈 ANÁLISIS DE RENDIMIENTO

### Índices Actuales
| Tabla | Campos Indexados | Tipo |
|-------|------------------|------|
| conversations_log | id | PRIMARY KEY |
| conversations_log | from | Implícito (FK lookup) |
| users | id, phoneNumber | PRIMARY KEY + UNIQUE |
| horarios | horario_id, bot_name | PRIMARY KEY |
| reglas_horario | horario_id | FOREIGN KEY |

### Recomendaciones de Optimización

#### 1. Índices Recomendados
```sql
-- Para búsquedas por fecha en conversations_log
CREATE INDEX idx_conversations_date ON conversations_log(date);

-- Para búsquedas por usuario + fecha
CREATE INDEX idx_conversations_from_date ON conversations_log(from, date);

-- Para búsquedas por estado en pedidos
CREATE INDEX idx_pedidos_estado ON pedidos(estado);

-- Para búsquedas en horarios por bot
CREATE INDEX idx_horarios_bot_tipo ON horarios(bot_name, tipo_horario_id);
```

#### 2. Archiving Strategy (Conversaciones Antiguas)
```javascript
// Archivar conversaciones > 6 meses
async archiveOldConversations(monthsOld = 6) {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsOld);
  
  await manager.query(`
    INSERT INTO conversations_log_archive
    SELECT * FROM conversations_log
    WHERE date < '${cutoffDate.toISOString().slice(0, 10)}'
  `);
  
  await manager.query(`
    DELETE FROM conversations_log
    WHERE date < '${cutoffDate.toISOString().slice(0, 10)}'
  `);
}
```

#### 3. Particionamiento por Fecha
Considerar dividir `conversations_log` por rango de fechas (anual o trimestral) para datasets muy grandes.

### Estimación de Tamaño de Base de Datos
```
conversations_log:    ~100-500KB por 10k registros
conversation_metricas: ~200-800KB por 10k registros
Total esperado:       50-500MB (para 6 meses de datos activos)
SQLite es eficiente hasta ~1GB
```

---

## 🔐 SEGURIDAD Y BACKUP

### Configuración Actual
```javascript
// src/database/SqliteManager.js
const config = {
  dialect: 'sqlite',
  storage: 'src/database/data/MarIADono3DB.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    foreignKeys: true // FK habilitadas
  }
};
```

### Mejoras de Seguridad Recomendadas

#### 1. Encriptación de Datos Sensibles
```javascript
// En lugar de guardar números completos:
// ❌ phoneNumber: '543812010781'
// ✅ phoneNumber: hash('543812010781')
// ✅ phoneNumberLast4: '0781'

import crypto from 'crypto';

function hashPhone(phone) {
  return crypto.createHash('sha256').update(phone).digest('hex');
}
```

#### 2. Restricción de Acceso
```javascript
// Usar roles en aplicación
// - ADMIN: acceso total
// - BOT_OPERATOR: lectura/escritura conversaciones
// - ANALYTICS: solo lectura
```

#### 3. Auditoría de Cambios
```javascript
// Crear tabla de auditoría
// cambios_auditoria
// ├─ id, timestamp, usuario, tabla, operacion
// ├─ registro_anterior (JSON)
// └─ registro_nuevo (JSON)
```

### Estrategia de Backup

#### Daily Backup
```javascript
// Ejecutar cada 24h
import fs from 'fs';
import { execSync } from 'child_process';

async function backupDatabase() {
  const timestamp = new Date().toISOString().slice(0, 10);
  const backupPath = `backups/MarIADono3DB_${timestamp}.sqlite`;
  
  // Copiar archivo
  execSync(`cp src/database/data/MarIADono3DB.sqlite ${backupPath}`);
  
  // Comprimir
  execSync(`gzip ${backupPath}`);
  
  console.log(`✅ Backup creado: ${backupPath}.gz`);
}
```

#### Backup Location
- **Local:** `backups/` en raíz del proyecto
- **Cloud:** Considerar AWS S3, Google Cloud Storage, o Backblaze
- **Retention:** Mantener últimos 30 días

#### Test Restores
- Restaurar backup mensual en BD de prueba
- Verificar integridad de datos
- Documentar procedimiento

---

## 💡 RECOMENDACIONES

### Corto Plazo (1-2 semanas)

1. **Crear Índices**
   - ✅ Índice en `conversations_log(date)`
   - ✅ Índice en `pedidos(estado)`
   - ✅ Índice en `horarios(bot_name, tipo_horario_id)`

2. **Implementar Backup Automático**
   - Daily backup a `backups/`
   - Script en cron/task scheduler
   - Retención de 30 días

3. **Auditoría Básica**
   - Registrar cambios en `usuarios` y `pedidos`
   - Guardar `updated_by` y `updated_at`

### Mediano Plazo (1-3 meses)

4. **Versionado de Schema**
   - Crear carpeta `src/database/migrations/`
   - Usar `sequelize-cli` para migraciones
   - Documentar cambios de schema

5. **Tablas de Soporte**
   - `cambios_auditoria` - Auditoría completa
   - `configuracion` - Settings globales
   - `plantillas_mensaje` - Templates reutilizables

6. **Reporting & Analytics**
   - Vista consolidada de conversiones
   - Dashboard de métricas diarias
   - Exportación a CSV/Excel

### Largo Plazo (3-6 meses)

7. **Escalar a PostgreSQL**
   - SQLite es excelente para dev/pequeña escala
   - PostgreSQL recomendado para +1GB datos
   - Migración transparente con Sequelize

8. **Caché & Optimización**
   - Redis para cache de ofertas/productos
   - Query caching para reportes
   - Pre-computar métricas diarias

9. **Data Warehouse**
   - Réplica de BD para analytics
   - Tablas desnormalizadas para BI
   - ETL diario

### Checklist de Mantenimiento

- [ ] Daily: Backup automático
- [ ] Weekly: Revisar logs de error
- [ ] Weekly: Verificar disponibilidad de bots
- [ ] Monthly: Audit trail review
- [ ] Monthly: Restore test de backup
- [ ] Quarterly: Análisis de rendimiento
- [ ] Quarterly: Optimización de queries
- [ ] Annually: Cambio de schema review

---

## 📚 REFERENCIA RÁPIDA

### Conexión a la Base de Datos
```javascript
import SqliteManager from './src/database/SqliteManager.js';

// Obtener instancia
const db = await SqliteManager.getInstance();

// Acceder a modelos
const conversations = await db.models.ConversationsLog.findAll();
const users = await db.models.Usuarios.findAll();

// Ejecutar queries
const result = await db.query('SELECT COUNT(*) as total FROM conversations_log');
```

### Variables de Entorno
```bash
# .env (opcional)
SQLITE_DB_PATH=src/database/data/MarIADono3DB.sqlite
NODE_ENV=development
```

### Archivos Clave
| Archivo | Propósito |
|---------|----------|
| `src/database/SqliteManager.js` | Orquestador principal |
| `src/database/DatabaseQueries.js` | Queries comunes |
| `src/database/models/*.js` | Definiciones de tablas |
| `src/database/data/MarIADono3DB.sqlite` | BD física |
| `backups/` | Respaldos |

---

## 📞 SOPORTE

Para más información sobre operaciones específicas, consultar:
- **CRUD Operations:** Sección [Métodos y Operaciones](#métodos-y-operaciones)
- **Tablas:** Sección [Catálogo Completo](#catálogo-completo-de-tablas)
- **Queries:** `src/database/DatabaseQueries.js`
- **Scheduler/Horarios:** Sección [Horarios Polimórficos](#11-horarios-horarios--sistema-polimórfico)

---

**Versión del Informe:** 1.0  
**Última Actualización:** 28/12/2025  
**Responsable:** Sistema MarIADono  
**Estado:** ✅ Completo y Actualizado
