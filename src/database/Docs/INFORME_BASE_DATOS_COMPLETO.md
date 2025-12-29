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
# INFORME DE LA BASE DE DATOS - SISTEMA MARIADONO (RESUMIDO)

**Fecha:** 28/12/2025
**Proyecto:** MarIADonoMeta
**BD:** SQLite (Sequelize) — `src/database/data/MarIADono3DB.sqlite`

Resumen breve: instancia SQLite gestionada por `SqliteManager` (singleton). Contiene modelos para conversaciones, usuarios, productos, pedidos, métricas, horarios y logs. A continuación se conservan las descripciones de tablas, campos y métodos clave.

## Componentes clave
- `src/database/SqliteManager.js`: conexión, carga de modelos, sincronización y métodos utilitarios.
  - Métodos: `getInstance()`, `initialize()`, `testConnection()`, `saveConversation()`, `query()`, `defineAssociations()`, `verificarDisponibilidad()`.
- `src/database/DatabaseQueries.js`: consultas reutilizables: `mensajesBulkEnviadosHoy()`, `mensajesBulkEnviadosEstaSemana()`, `mensajesBulkEnviadosEsteMes()`, `guardarMetricasConversacion()`.
- Modelos: 14 archivos en `src/database/models/` (definición estándar Sequelize con `created_at`/`updated_at`).

## Catálogo de tablas (descripción y campos)

1) conversations_log — Registro de mensajes
  - Campos: `id` (PK), `date`, `time`, `from`, `role`, `pushName`, `body`, `messageId`, `etapaEmbudo`, `interesCliente`, `botName`, `created_at`, `updated_at`.

2) conversation_metricas — Métricas por conversación
  - Campos: `id` (PK), `messageId`, `respuesta`, `metricasCliente` (JSON), `interesCliente`, `estadoHabilitacionNotificacion`, `etapaEmbudo`, `consultaReformulada`, `confianzaReformulada`, `asistenteInformacion`, `created_at`, `updated_at`.

3) n8n_metric — Métricas de integraciones N8N
  - Campos: `id`, `userId`, `botName`, `messageId`, `interesCliente`, `etapaEmbudo`, `estadoHabilitacionNotificacion`, `consultaReformulada`, `confianzaReformulada`, `asistenteInformacion`, `created_at`, `updated_at`.

4) mensaje_estados — Estados de entrega
  - Campos: `id`, `messageId`, `estado` (`pending|sent|delivered|read|failed|error`), `timestamp`, `created_at`.

5) ctx_logs — Contextos de sesión
  - Campos: `id`, `phoneNumber`, `contextData` (JSON), `timestamp`, `created_at`.

6) provider_logs — Logs de provider/API
  - Campos: `id`, `phoneNumber`, `providerName`, `action`, `data` (JSON), `timestamp`, `created_at`.

7) ofertas — Ofertas y promociones
  - Campos: `id`, `codigo`, `descripcion`, `precio`, `fechaOferta`, `created_at`.

8) pedidos — Órdenes de compra
  - Campos: `id`, `numeroPedido`, `clienteId` (FK→usuarios.id), `fechaPedido`, `total`, `estado`, `created_at`.

9) productos — Catálogo de productos
  - Campos: `id`, `codigo`, `nombre`, `descripcion`, `precio`, `stock`, `categoria`, `created_at`.

10) usuarios — Clientes registrados
  - Campos: `id`, `phoneNumber` (UNIQUE), `nombre`, `email`, `fechaRegistro`, `activo`, `created_at`.

11) horarios — Configuración de horarios (polimórfico)
  - Campos: `horario_id` (PK), `nombre`, `descripcion`, `bot_name`, `tipo_horario_id`, `zona_horaria`, `activo`, `created_at`, `updated_at`.
  - Relaciones: `hasMany` → `reglas_horario`, `excepciones_horario`.

12) reglas_horario — Reglas semanales
  - Campos: `regla_id`, `horario_id` (FK), `dia_semana` (0-6), `hora_inicio`, `hora_fin`, `activo`, `created_at`, `updated_at`.

13) excepciones_horario — Excepciones por fecha
  - Campos: `excepcion_id`, `horario_id` (FK), `fecha_excepcion`, `estado` (`cerrado|horario_personalizado`), `hora_inicio`, `hora_fin`, `descripcion`, `created_at`, `updated_at`.

14) Relación Horarios ↔ Reglas ↔ Excepciones: jerarquía donde `horarios` contiene `reglas_horario` y `excepciones_horario`. `verificarDisponibilidad()` prioriza excepciones sobre reglas.

## Notas operativas (resumido)
- Indices comunes: PKs por id; recomendable indexar `conversations_log(date)`, `conversations_log(from, date)`, `pedidos(estado)`, `horarios(bot_name, tipo_horario_id)` para consultas frecuentes.
- Backup: BD en `src/database/data/MarIADono3DB.sqlite`; usar copias periódicas y pruebas de restauración.
- Variables de entorno: `SQLITE_DB_PATH` (opcional), `NODE_ENV`.

---

**Versión:** 1.0 — Última actualización: 28/12/2025

---

**Versión del Informe:** 1.0  
**Última Actualización:** 28/12/2025  
**Responsable:** Sistema MarIADono  
**Estado:** ✅ Completo y Actualizado
