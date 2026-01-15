# Modelo de Datos Completo - MarIADono Database

## 📋 Contenido
1. [Descripción General](#descripción-general)
2. [Tablas Principales](#tablas-principales)
3. [Tablas de Usuarios y Roles](#tablas-de-usuarios-y-roles)
4. [Tablas de Conversaciones](#tablas-de-conversaciones)
5. [Tablas de Campañas](#tablas-de-campañas)
6. [Tablas de Segmentación](#tablas-de-segmentación)
7. [Tablas de Productos y Pedidos](#tablas-de-productos-y-pedidos)
8. [Tablas de Horarios](#tablas-de-horarios)
9. [Tablas de WhatsApp](#tablas-de-whatsapp)
10. [Tablas de Métricas y Logs](#tablas-de-métricas-y-logs)
11. [Diagrama de Relaciones](#diagrama-de-relaciones)

---

## Descripción General

**Sistema:** MarIADono Database  
**ORM:** Sequelize  
**Motor Base de Datos:** SQLite  
**Almacenamiento:** `Data/MarIADono3DB.sqlite`  

El modelo de datos está diseñado para gestionar:
- ✅ Conversaciones de WhatsApp
- ✅ Administración de usuarios y roles
- ✅ Campañas de marketing
- ✅ Segmentación de clientes
- ✅ Gestión de productos y pedidos
- ✅ Horarios de atención
- ✅ Métricas y análisis
- ✅ Grupos de WhatsApp
- ✅ Almacenamiento de archivos de clientes

---

## Tablas Principales

### 1. **Usuarios**

**Tabla:** `usuarios`  
**Descripción:** Gestiona los usuarios del sistema.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO INCREMENT | Identificador único del usuario |
| `phone_number` | STRING(50) | UNIQUE, NULLABLE | Número de teléfono del usuario |
| `nombre` | STRING(100) | NULLABLE | Nombre completo del usuario |
| `email` | STRING(100) | NULLABLE | Correo electrónico |
| `fecha_registro` | DATE | NULLABLE | Fecha de registro en el sistema |
| `activo` | BOOLEAN | DEFAULT: true | Estado activo/inactivo del usuario |
| `role_id` | INTEGER | FOREIGN KEY | Referencia a tabla `user_roles` |
| `created_at` | TIMESTAMP | AUTO | Fecha de creación del registro |
| `updated_at` | TIMESTAMP | AUTO | Fecha de última actualización |

**Relaciones:**
- ➜ Pertenece a: `UserRoles` (rol del usuario)
- ➜ Propietario de: `Campaign` (campañas)
- ➜ Propietario de: `CustomerSegment` (segmentos)
- ➜ Propietario de: `MessageTemplate` (plantillas)

---

## Tablas de Usuarios y Roles

### 2. **UserRoles**

**Tabla:** `user_roles`  
**Descripción:** Define los roles disponibles en el sistema.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `role_id` | INTEGER | PRIMARY KEY | Identificador único del rol |
| `role_name` | STRING(100) | UNIQUE | Nombre del rol (admin, agent, user, etc.) |
| `description` | TEXT | NULLABLE | Descripción del rol |

**Roles Típicos:**
- `admin` - Administrador del sistema
- `agent` - Agente de atención
- `user` - Usuario estándar
- `bot` - Bot automático

---

### 3. **UserPermissions**

**Tabla:** `user_permissions`  
**Descripción:** Define permisos granulares del sistema.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `permission_id` | INTEGER | PRIMARY KEY | Identificador único |
| `permission_name` | STRING(100) | UNIQUE | Nombre del permiso |
| `description` | TEXT | NULLABLE | Descripción del permiso |

**Permisos Típicos:**
- `read:campaigns`
- `create:campaigns`
- `edit:campaigns`
- `delete:campaigns`
- `view:analytics`
- `manage:users`

---

### 4. **RolePermissions**

**Tabla:** `role_permissions`  
**Descripción:** Tabla de unión que asigna permisos a roles.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `role_permission_id` | INTEGER | PRIMARY KEY | Identificador único |
| `role_id` | INTEGER | FOREIGN KEY | Referencia a `user_roles` |
| `permission_id` | INTEGER | FOREIGN KEY | Referencia a `user_permissions` |

**Relaciones:**
- ➜ Pertenece a: `UserRoles`
- ➜ Pertenece a: `UserPermissions`

---

## Tablas de Conversaciones

### 5. **ConversationsLog**

**Tabla:** `conversations_log`  
**Descripción:** Registro de todas las conversaciones de WhatsApp.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO INCREMENT | Identificador único del mensaje |
| `date` | DATE | NULLABLE | Fecha del mensaje |
| `time` | TIME | NULLABLE | Hora del mensaje |
| `from` | STRING(20) | NULLABLE | Número de teléfono remitente |
| `role` | STRING(20) | NULLABLE | Rol del remitente (cliente, bot, agent) |
| `pushname` | STRING(100) | NULLABLE | Nombre del contacto |
| `body` | TEXT | NULLABLE | Contenido del mensaje |
| `messageid` | STRING(50) | NULLABLE | ID único del mensaje en WhatsApp |
| `etapaembudo` | STRING(10) | NULLABLE | Etapa del embudo de ventas |
| `interescliente` | STRING(50) | NULLABLE | Interés expresado del cliente |
| `botname` | STRING(50) | NULLABLE | Nombre del bot que procesó el mensaje |

**Funcionalidad:**
- Registro completo de conversaciones
- Seguimiento de etapas del embudo
- Análisis de intereses del cliente
- Identificación del bot respondente

---

### 6. **ConversationMetricas**

**Tabla:** `conversation_metricas`  
**Descripción:** Métricas agregadas de las conversaciones.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Identificador único |
| `conversation_id` | INTEGER | FOREIGN KEY | Referencia a `conversations_log` |
| `respuesta_time` | INTEGER | NULLABLE | Tiempo de respuesta en segundos |
| `satisfaction_score` | FLOAT | NULLABLE | Puntuación de satisfacción (0-5) |
| `resolution_status` | STRING(50) | NULLABLE | Estado de resolución |

---

### 7. **MessageChannel**

**Tabla:** `message_channels`  
**Descripción:** Canales disponibles para enviar mensajes.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `channel_id` | INTEGER | PRIMARY KEY, AUTO INCREMENT | Identificador único del canal |
| `channel_name` | STRING(100) | UNIQUE | Nombre del canal (WhatsApp, Email, SMS) |
| `channel_type` | STRING(50) | NULLABLE | Tipo de canal |
| `configuration` | TEXT | NULLABLE | Configuración JSON del canal |
| `is_active` | BOOLEAN | DEFAULT: true | Si el canal está activo |
| `created_at` | TIMESTAMP | AUTO | Fecha de creación |

**Canales Típicos:**
- WhatsApp
- Email
- SMS
- Telegram
- Instagram

---

### 8. **CtxLogs**

**Tabla:** `ctx_logs`  
**Descripción:** Logs de contexto para seguimiento detallado.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Identificador único |
| `conversation_id` | INTEGER | NULLABLE | Referencia a conversación |
| `context_data` | TEXT | NULLABLE | Datos de contexto JSON |
| `timestamp` | TIMESTAMP | AUTO | Marca de tiempo |

---

## Tablas de Campañas

### 9. **Campaign**

**Tabla:** `campaigns`  
**Descripción:** Campañas de marketing o comunicación.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `campaign_id` | UUID | PRIMARY KEY | Identificador único de campaña |
| `name` | STRING(200) | NOT NULL | Nombre de la campaña |
| `description` | TEXT | NULLABLE | Descripción detallada |
| `status` | STRING(50) | DEFAULT: 'draft' | Estado (draft, active, paused, completed) |
| `channel_id` | INTEGER | FOREIGN KEY | Referencia a `message_channels` |
| `owner_usuario_id` | INTEGER | FOREIGN KEY | Propietario de la campaña |
| `start_date` | DATE | NULLABLE | Fecha de inicio |
| `end_date` | DATE | NULLABLE | Fecha de fin |
| `metadata` | TEXT | NULLABLE | JSON con datos adicionales |
| `created_at` | TIMESTAMP | AUTO | Fecha de creación |
| `updated_at` | TIMESTAMP | AUTO | Fecha de actualización |

**Estados Posibles:**
- `draft` - Borrador
- `active` - En ejecución
- `paused` - Pausada
- `completed` - Completada
- `cancelled` - Cancelada

---

### 10. **CampaignMessage**

**Tabla:** `campaign_messages`  
**Descripción:** Mensajes individuales de una campaña.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `message_id` | UUID | PRIMARY KEY | Identificador único |
| `campaign_id` | UUID | FOREIGN KEY | Referencia a `campaigns` |
| `recipient_id` | INTEGER | NULLABLE | Identificador del destinatario |
| `message_content` | TEXT | NULLABLE | Contenido del mensaje |
| `send_status` | STRING(50) | NULLABLE | Estado (pending, sent, delivered, failed) |
| `sent_at` | TIMESTAMP | NULLABLE | Fecha/hora de envío |
| `read_at` | TIMESTAMP | NULLABLE | Fecha/hora de lectura |

---

### 11. **CampaignRecipientLog**

**Tabla:** `campaign_recipient_log`  
**Descripción:** Registro de interacciones de destinatarios.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `log_id` | INTEGER | PRIMARY KEY | Identificador único |
| `campaign_id` | UUID | FOREIGN KEY | Referencia a campaña |
| `recipient_id` | INTEGER | NULLABLE | Identificador del destinatario |
| `action` | STRING(50) | NULLABLE | Acción realizada (sent, clicked, converted) |
| `action_timestamp` | TIMESTAMP | AUTO | Marca de tiempo de la acción |

---

### 12. **CampaignAnalytics**

**Tabla:** `campaign_analytics`  
**Descripción:** Métricas agregadas de campañas.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Identificador único |
| `campaign_id` | UUID | FOREIGN KEY | Referencia a campaña |
| `total_sent` | INTEGER | NULLABLE | Total de mensajes enviados |
| `total_delivered` | INTEGER | NULLABLE | Total de mensajes entregados |
| `total_read` | INTEGER | NULLABLE | Total de mensajes leídos |
| `total_clicked` | INTEGER | NULLABLE | Total de clics |
| `total_converted` | INTEGER | NULLABLE | Total de conversiones |
| `engagement_rate` | FLOAT | NULLABLE | Tasa de engagement (%) |
| `conversion_rate` | FLOAT | NULLABLE | Tasa de conversión (%) |
| `updated_at` | TIMESTAMP | AUTO | Última actualización |

---

### 13. **CampaignGoal**

**Tabla:** `campaign_goals`  
**Descripción:** Objetivos y metas de las campañas.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `goal_id` | INTEGER | PRIMARY KEY | Identificador único |
| `campaign_id` | UUID | FOREIGN KEY | Referencia a campaña |
| `goal_name` | STRING(200) | NULLABLE | Nombre del objetivo |
| `goal_type` | STRING(50) | NULLABLE | Tipo (sales, engagement, awareness) |
| `target_value` | INTEGER | NULLABLE | Valor objetivo |
| `metric_name` | STRING(100) | NULLABLE | Métrica a medir |

---

## Tablas de Segmentación

### 14. **CustomerSegment**

**Tabla:** `customer_segments`  
**Descripción:** Segmentos de clientes para targeting.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `segment_id` | UUID | PRIMARY KEY | Identificador único del segmento |
| `segment_name` | STRING(200) | UNIQUE, NOT NULL | Nombre del segmento |
| `description` | TEXT | NULLABLE | Descripción del segmento |
| `owner_usuario_id` | INTEGER | FOREIGN KEY | Propietario del segmento |
| `is_dynamic` | BOOLEAN | DEFAULT: true | Si es dinámico o estático |
| `members_count` | INTEGER | DEFAULT: 0 | Cantidad de miembros |
| `metadata` | TEXT | NULLABLE | Datos adicionales JSON |
| `created_at` | TIMESTAMP | AUTO | Fecha de creación |
| `updated_at` | TIMESTAMP | AUTO | Fecha de actualización |

**Tipos de Segmentos:**
- Dinámicos: Calculados por reglas automáticamente
- Estáticos: Definidos manualmente

---

### 15. **SegmentationRule**

**Tabla:** `segmentation_rules`  
**Descripción:** Reglas para segmentación dinámica.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `rule_id` | UUID | PRIMARY KEY | Identificador único |
| `segment_id` | UUID | FOREIGN KEY | Referencia a segmento |
| `field_name` | STRING(100) | NULLABLE | Campo a evaluar |
| `operator` | STRING(20) | NULLABLE | Operador (=, >, <, contains, etc.) |
| `field_value` | TEXT | NULLABLE | Valor a comparar |
| `logical_operator` | STRING(10) | NULLABLE | AND/OR |

**Operadores Soportados:**
- Igualdad: `=`, `!=`
- Comparación: `>`, `<`, `>=`, `<=`
- Texto: `contains`, `starts_with`, `ends_with`
- Lógica: `AND`, `OR`

---

### 16. **SegmentMember**

**Tabla:** `segment_members`  
**Descripción:** Miembros de un segmento.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `member_id` | INTEGER | PRIMARY KEY | Identificador único |
| `segment_id` | UUID | FOREIGN KEY | Referencia a segmento |
| `customer_id` | INTEGER | FOREIGN KEY | Identificador del cliente |
| `date_added` | TIMESTAMP | AUTO | Fecha de adición al segmento |

---

### 17. **CustomerScore**

**Tabla:** `customer_scores`  
**Descripción:** Puntuaciones de clientes para ranking.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `score_id` | UUID | PRIMARY KEY | Identificador único |
| `customer_id` | INTEGER | NULLABLE | Identificador del cliente |
| `segment_id` | UUID | FOREIGN KEY | Referencia a segmento |
| `score_type` | STRING(100) | NULLABLE | Tipo de puntuación (lifetime_value, engagement, etc.) |
| `score_value` | FLOAT | NULLABLE | Valor de la puntuación |
| `calculated_at` | TIMESTAMP | AUTO | Fecha de cálculo |

**Tipos de Puntuación:**
- `lifetime_value` - Valor de vida del cliente
- `engagement_score` - Puntuación de engagement
- `conversion_probability` - Probabilidad de conversión
- `churn_risk` - Riesgo de abandono

---

### 18. **SegmentPerformance**

**Tabla:** `segment_performance`  
**Descripción:** Métricas de rendimiento de segmentos.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `perf_id` | INTEGER | PRIMARY KEY | Identificador único |
| `segment_id` | UUID | FOREIGN KEY | Referencia a segmento |
| `metric_name` | STRING(100) | NULLABLE | Nombre de métrica |
| `metric_value` | FLOAT | NULLABLE | Valor de la métrica |
| `period_start` | DATE | NULLABLE | Inicio del período |
| `period_end` | DATE | NULLABLE | Fin del período |

---

## Tablas de Productos y Pedidos

### 19. **Productos**

**Tabla:** `productos`  
**Descripción:** Catálogo de productos.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO INCREMENT | Identificador único |
| `codigo` | STRING(50) | NULLABLE | Código de producto |
| `nombre` | STRING(200) | NULLABLE | Nombre del producto |
| `descripcion` | TEXT | NULLABLE | Descripción detallada |
| `precio` | DECIMAL(10,2) | NULLABLE | Precio unitario |
| `stock` | INTEGER | NULLABLE | Cantidad en stock |
| `categoria` | STRING(100) | NULLABLE | Categoría del producto |
| `created_at` | TIMESTAMP | AUTO | Fecha de creación |

---

### 20. **Pedidos**

**Tabla:** `pedidos`  
**Descripción:** Pedidos de clientes.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO INCREMENT | Identificador único |
| `numero_pedido` | STRING(50) | NULLABLE | Número de referencia |
| `cliente_id` | INTEGER | NULLABLE | ID del cliente |
| `fecha_pedido` | DATE | NULLABLE | Fecha del pedido |
| `total` | DECIMAL(10,2) | NULLABLE | Monto total |
| `estado` | STRING(50) | NULLABLE | Estado (pending, confirmed, shipped, delivered) |
| `created_at` | TIMESTAMP | AUTO | Fecha de creación |

**Estados Posibles:**
- `pending` - Pendiente
- `confirmed` - Confirmado
- `shipped` - Enviado
- `delivered` - Entregado
- `cancelled` - Cancelado

---

### 21. **Ofertas**

**Tabla:** `ofertas`  
**Descripción:** Ofertas y promociones.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Identificador único |
| `codigo_oferta` | STRING(50) | UNIQUE | Código de la oferta |
| `descripcion` | TEXT | NULLABLE | Descripción de la oferta |
| `descuento` | DECIMAL(5,2) | NULLABLE | Porcentaje de descuento |
| `fecha_inicio` | DATE | NULLABLE | Fecha de inicio |
| `fecha_fin` | DATE | NULLABLE | Fecha de fin |
| `activo` | BOOLEAN | DEFAULT: true | Si la oferta está activa |

---

## Tablas de Horarios

### 22. **Horarios**

**Tabla:** `horarios`  
**Descripción:** Horarios de atención del sistema.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `horario_id` | INTEGER | PRIMARY KEY, AUTO INCREMENT | Identificador único |
| `nombre` | STRING(100) | NOT NULL | Nombre del horario |
| `descripcion` | TEXT | NULLABLE | Descripción |
| `bot_name` | STRING(50) | NOT NULL | Nombre del bot asociado |
| `tipo_horario_id` | STRING(50) | NOT NULL | Tipo de horario |
| `zona_horaria` | STRING(50) | DEFAULT: 'America/Argentina/Buenos_Aires' | Zona horaria |
| `activo` | BOOLEAN | DEFAULT: true | Si está activo |
| `created_at` | TIMESTAMP | AUTO | Fecha de creación |
| `updated_at` | TIMESTAMP | AUTO | Fecha de actualización |

---

### 23. **ReglasHorario**

**Tabla:** `reglas_horario`  
**Descripción:** Reglas específicas dentro de un horario.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `regla_id` | INTEGER | PRIMARY KEY | Identificador único |
| `horario_id` | INTEGER | FOREIGN KEY | Referencia a `horarios` |
| `dia_semana` | INTEGER | NULLABLE | Día de la semana (0-6) |
| `hora_inicio` | TIME | NULLABLE | Hora de inicio |
| `hora_fin` | TIME | NULLABLE | Hora de fin |
| `estado` | STRING(50) | NULLABLE | Estado (open, closed) |

---

### 24. **ExcepcionesHorario**

**Tabla:** `excepciones_horario`  
**Descripción:** Excepciones a los horarios regulares.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `excepcion_id` | INTEGER | PRIMARY KEY | Identificador único |
| `horario_id` | INTEGER | FOREIGN KEY | Referencia a `horarios` |
| `fecha` | DATE | NOT NULL | Fecha de la excepción |
| `estado` | STRING(50) | NULLABLE | Estado especial (cerrado, abierto_especial) |
| `descripcion` | TEXT | NULLABLE | Motivo de la excepción |

**Casos Típicos:**
- Feriados
- Días especiales
- Cierres excepcionales

---

## Tablas de WhatsApp

### 25. **WhatsAppGroup**

**Tabla:** `whatsapp_groups`  
**Descripción:** Grupos de WhatsApp gestionados.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `group_id` | UUID | PRIMARY KEY | Identificador único del grupo |
| `group_name` | STRING(200) | NULLABLE | Nombre del grupo |
| `group_jid` | STRING(100) | UNIQUE | JID único de WhatsApp |
| `description` | TEXT | NULLABLE | Descripción del grupo |
| `owner_phone` | STRING(20) | NULLABLE | Número del propietario |
| `member_count` | INTEGER | DEFAULT: 0 | Número de miembros |
| `is_active` | BOOLEAN | DEFAULT: true | Si el grupo está activo |
| `created_at` | TIMESTAMP | AUTO | Fecha de creación |
| `updated_at` | TIMESTAMP | AUTO | Fecha de actualización |

---

### 26. **WhatsAppGroupMember**

**Tabla:** `whatsapp_group_members`  
**Descripción:** Miembros de grupos de WhatsApp.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `member_id` | UUID | PRIMARY KEY | Identificador único |
| `group_id` | UUID | FOREIGN KEY | Referencia a `whatsapp_groups` |
| `phone_number` | STRING(20) | NULLABLE | Número de teléfono |
| `member_name` | STRING(100) | NULLABLE | Nombre del miembro |
| `role` | STRING(50) | NULLABLE | Rol (admin, member) |
| `joined_at` | TIMESTAMP | AUTO | Fecha de ingreso |

---

### 27. **WhatsAppGroupClienteMapping**

**Tabla:** `whatsapp_group_cliente_mapping`  
**Descripción:** Mapeo entre grupos de WhatsApp y clientes.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `mapping_id` | INTEGER | PRIMARY KEY | Identificador único |
| `group_id` | UUID | FOREIGN KEY | Referencia a `whatsapp_groups` |
| `cliente_id` | INTEGER | NULLABLE | Identificador del cliente |
| `phone_number` | STRING(20) | NULLABLE | Teléfono del cliente |
| `mapped_at` | TIMESTAMP | AUTO | Fecha del mapeo |

---

## Tablas de Métricas y Logs

### 28. **MensajeEstados**

**Tabla:** `mensaje_estados`  
**Descripción:** Estados posibles de los mensajes.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `estado_id` | INTEGER | PRIMARY KEY | Identificador único |
| `estado_nombre` | STRING(50) | UNIQUE | Nombre del estado |
| `descripcion` | TEXT | NULLABLE | Descripción del estado |

**Estados Típicos:**
- `pending` - Pendiente
- `sent` - Enviado
- `delivered` - Entregado
- `read` - Leído
- `failed` - Fallido

---

### 29. **ProviderLogs**

**Tabla:** `provider_logs`  
**Descripción:** Logs de interacciones con proveedores externos.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `log_id` | INTEGER | PRIMARY KEY | Identificador único |
| `provider_name` | STRING(100) | NULLABLE | Nombre del proveedor |
| `provider_type` | STRING(50) | NULLABLE | Tipo (WhatsApp, AI, etc.) |
| `request_data` | TEXT | NULLABLE | Datos de la solicitud JSON |
| `response_data` | TEXT | NULLABLE | Datos de la respuesta JSON |
| `status_code` | INTEGER | NULLABLE | Código HTTP |
| `error_message` | TEXT | NULLABLE | Mensaje de error si aplica |
| `timestamp` | TIMESTAMP | AUTO | Marca de tiempo |

---

### 30. **N8nMetric**

**Tabla:** `n8n_metrics`  
**Descripción:** Métricas de ejecuciones de n8n.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `metric_id` | INTEGER | PRIMARY KEY | Identificador único |
| `workflow_id` | STRING(100) | NULLABLE | ID del workflow en n8n |
| `workflow_name` | STRING(200) | NULLABLE | Nombre del workflow |
| `execution_count` | INTEGER | NULLABLE | Número de ejecuciones |
| `success_count` | INTEGER | NULLABLE | Ejecuciones exitosas |
| `error_count` | INTEGER | NULLABLE | Ejecuciones con error |
| `last_execution_time` | TIMESTAMP | NULLABLE | Última ejecución |
| `avg_execution_duration` | INTEGER | NULLABLE | Duración promedio (ms) |

---

### 31. **ClientFile**

**Tabla:** `client_files`  
**Descripción:** Almacenamiento de archivos de clientes.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `file_id` | UUID | PRIMARY KEY | Identificador único |
| `client_id` | INTEGER | NULLABLE | Identificador del cliente |
| `file_name` | STRING(200) | NULLABLE | Nombre del archivo |
| `file_path` | TEXT | NULLABLE | Ruta del archivo |
| `file_type` | STRING(50) | NULLABLE | Tipo MIME |
| `file_size` | INTEGER | NULLABLE | Tamaño en bytes |
| `upload_date` | TIMESTAMP | AUTO | Fecha de carga |
| `description` | TEXT | NULLABLE | Descripción |

---

### 32. **MessageTemplate**

**Tabla:** `message_templates`  
**Descripción:** Plantillas de mensajes reutilizables.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `template_id` | UUID | PRIMARY KEY | Identificador único |
| `template_name` | STRING(200) | NOT NULL | Nombre de la plantilla |
| `template_content` | TEXT | NULLABLE | Contenido con variables |
| `channel_id` | INTEGER | FOREIGN KEY | Canal asociado |
| `owner_usuario_id` | INTEGER | FOREIGN KEY | Propietario |
| `variables` | TEXT | NULLABLE | Variables JSON (ej: {name}, {date}) |
| `category` | STRING(100) | NULLABLE | Categoría de la plantilla |
| `is_active` | BOOLEAN | DEFAULT: true | Si está activa |
| `created_at` | TIMESTAMP | AUTO | Fecha de creación |
| `updated_at` | TIMESTAMP | AUTO | Fecha de actualización |

**Ejemplo de Plantillas:**
- Bienvenida
- Confirmación de pedido
- Recordatorio de cita
- Ofertas especiales
- Seguimiento post-venta

---

### 33. **ClientConversationArchive**

**Tabla:** `client_conversation_archive`  
**Descripción:** Archivo de conversaciones de clientes.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `archive_id` | UUID | PRIMARY KEY | Identificador único |
| `client_id` | INTEGER | NULLABLE | Identificador del cliente |
| `conversation_id` | INTEGER | FOREIGN KEY | Referencia a `conversations_log` |
| `archived_at` | TIMESTAMP | AUTO | Fecha de archivo |
| `reason` | TEXT | NULLABLE | Motivo del archivo |
| `is_searchable` | BOOLEAN | DEFAULT: true | Si es consultable |

---

## Diagrama de Relaciones

```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIOS                              │
│  id, phone_number, nombre, email, role_id                  │
└──────────────────┬──────────────────────────────────────────┘
                   │ 1:N
                   ├──> USER_ROLES
                   │    └──> ROLE_PERMISSIONS <─── USER_PERMISSIONS
                   │
                   ├──> CAMPAIGNS ──┬──> CAMPAIGN_MESSAGES
                   │                ├──> CAMPAIGN_RECIPIENT_LOG
                   │                ├──> CAMPAIGN_ANALYTICS
                   │                └──> CAMPAIGN_GOALS
                   │
                   ├──> CUSTOMER_SEGMENTS ──┬──> SEGMENTATION_RULES
                   │                        ├──> SEGMENT_MEMBERS
                   │                        ├──> CUSTOMER_SCORES
                   │                        └──> SEGMENT_PERFORMANCE
                   │
                   └──> MESSAGE_TEMPLATES


┌─────────────────────────────────────────────────────────────┐
│               CONVERSACIONES Y MENSAJES                      │
└─────────────────────────────────────────────────────────────┘

    CONVERSATIONS_LOG ──┬──> CONVERSATION_METRICAS
                       ├──> CTX_LOGS
                       └──> CLIENT_CONVERSATION_ARCHIVE
                       
    MESSAGE_CHANNELS ──┬──> CAMPAIGNS
                       └──> MESSAGE_TEMPLATES


┌─────────────────────────────────────────────────────────────┐
│               PRODUCTOS Y PEDIDOS                            │
└─────────────────────────────────────────────────────────────┘

    PRODUCTOS ──> OFERTAS
    PEDIDOS ─────> PRODUCTOS


┌─────────────────────────────────────────────────────────────┐
│               HORARIOS Y EXCEPCIONES                         │
└─────────────────────────────────────────────────────────────┘

    HORARIOS ──┬──> REGLAS_HORARIO
               └──> EXCEPCIONES_HORARIO


┌─────────────────────────────────────────────────────────────┐
│               WHATSAPP Y GRUPOS                              │
└─────────────────────────────────────────────────────────────┘

    WHATSAPP_GROUPS ──┬──> WHATSAPP_GROUP_MEMBERS
                      └──> WHATSAPP_GROUP_CLIENTE_MAPPING


┌─────────────────────────────────────────────────────────────┐
│               LOGS Y MÉTRICAS                                │
└─────────────────────────────────────────────────────────────┘

    PROVIDER_LOGS
    N8N_METRICS
    MENSAJE_ESTADOS
    CLIENT_FILES
```

---

## Resumen de Campos Comunes

### Timestamps
Todos los modelos utilizan estas columnas automáticas:
- `created_at` - Timestamp de creación
- `updated_at` - Timestamp de última actualización (solo en algunos)

### Identificadores
- **INTEGER con AUTO INCREMENT**: Tablas locales simples (usuarios, productos, etc.)
- **UUID**: Entidades complejas con relaciones (campaigns, segments, etc.)

### Estados
Campos `status` / `estado` con valores predefinidos:
- Campañas: `draft`, `active`, `paused`, `completed`
- Pedidos: `pending`, `confirmed`, `shipped`, `delivered`
- Mensajes: `pending`, `sent`, `delivered`, `read`, `failed`

### JSON Storage
Para datos flexibles se usa `TEXT` como:
- `metadata` en campaigns
- `configuration` en message channels
- `variables` en message templates
- `request_data` / `response_data` en provider logs

---

## Notas de Implementación

### Base de Datos SQLite
- Ideal para aplicaciones medianas sin necesidad de servidor
- Archivo único: `Data/MarIADono3DB.sqlite`
- Soporte completo de ACID
- Sin requerimiento de instalación externa

### ORM Sequelize
- Proporciona queries type-safe
- Manejo automático de migraciones
- Asociaciones relacionales declarativas
- Hooks para lógica personalizada

### Performance
- Índices en `phone_number`, `role_id`, `campaign_id`
- Claves foráneas para integridad referencial
- Denormalización selectiva en tablas de métricas

### Escalabilidad Futura
- Estructura preparada para migración a PostgreSQL/MySQL
- UUID para distribución
- Arquitectura modular de segmentos

---

## Acceso a la Base de Datos

### Conexión
```javascript
import SqliteManager from './SqliteManager.js';

const db = await SqliteManager.getInstance();
await db.initialize();
```

### Operaciones CRUD
```javascript
// CREATE
const usuario = await db.Usuarios.create({ nombre: 'Juan', email: 'juan@example.com' });

// READ
const users = await db.Usuarios.findAll();

// UPDATE
await usuario.update({ activo: false });

// DELETE
await usuario.destroy();
```

---

**Documento generado:** Diciembre 30, 2025  
**Versión:** 1.0  
**Estado:** Completo
