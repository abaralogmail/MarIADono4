# 📋 PRD: MEJORAS DE LA BASE DE DATOS - SISTEMA MARIADONO

**Versión:** 1.0  
**Fecha:** 29 de Diciembre de 2025  
**Proyecto:** MarIADonoMeta  
**Tipo de Documento:** Product Requirements Document (PRD)  
**Estado:** En Revisión

---

## 📌 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Objetivos Estratégicos](#objetivos-estratégicos)
3. [Especificación de Requerimientos](#especificación-de-requerimientos)
4. [Arquitectura de Base de Datos](#arquitectura-de-base-de-datos)
5. [Roadmap de Implementación](#roadmap-de-implementación)
6. [Consideraciones de Seguridad y Performance](#consideraciones-de-seguridad-y-performance)
7. [Métricas de Éxito](#métricas-de-éxito)

---

## 🎯 RESUMEN EJECUTIVO

Este PRD define las mejoras fundamentales para la base de datos de MarIADono, enfocadas en:

- **Gestión de archivos y conversaciones** por cliente con persistencia en carpetas dedicadas
- **Relaciones complejas** entre grupos de WhatsApp y clientes
- **Control de acceso** mediante niveles/roles de usuario
- **Multi-plataforma** (SMS, WhatsApp, otros canales)
- **Automatización de campañas** y reportes avanzados
- **Gestión de templates** de Meta
- **Segmentación inteligente** de clientes

**Impacto esperado:** Mejorar la capacidad operativa del sistema, escalabilidad y capacidad de análisis de datos.

---

## 📊 OBJETIVOS ESTRATÉGICOS

| Objetivo | Descripción | Beneficio |
|----------|-------------|-----------|
| **Persistencia de archivos** | Guardar conversaciones y archivos multimedia por cliente | Trazabilidad y cumplimiento normativo |
| **Gestión de grupos** | Rastrear grupos de WhatsApp y relaciones cliente | Mejor segmentación de audiencias |
| **Control de acceso** | Implementar niveles de usuario granulares | Seguridad y control operacional |
| **Multi-canal** | Soportar múltiples plataformas de origen | Flexibilidad y escalabilidad |
| **Automatización** | Campañas, templates y reportes | Eficiencia operativa |
| **Analytics** | Segmentación y análisis de clientes | Mejor toma de decisiones |

---

## 🗄️ ESPECIFICACIÓN DE REQUERIMIENTOS

### 1️⃣ GESTIÓN DE ARCHIVOS Y CARPETAS POR CLIENTE

**Objetivo:** Almacenar historial de conversaciones y archivos multimedia en carpetas específicas por cliente.

#### Nuevas Tablas:

**`client_file_storage`**
```sql
CREATE TABLE client_file_storage (
  file_id UUID PRIMARY KEY,
  cliente_id INT NOT NULL (FK → usuarios.id),
  message_id VARCHAR(255) UNIQUE,
  file_type ENUM('image', 'video', 'audio', 'document', 'other') NOT NULL,
  mime_type VARCHAR(100),
  original_filename VARCHAR(500),
  file_size INT,
  file_path VARCHAR(500) NOT NULL,
  storage_location ENUM('local', 's3', 'azure', 'gcs') DEFAULT 'local',
  bucket_name VARCHAR(255),
  object_key VARCHAR(500),
  checksum_sha256 VARCHAR(64),
  is_archived BOOLEAN DEFAULT FALSE,
  upload_timestamp TIMESTAMP,
  accessed_count INT DEFAULT 0,
  last_accessed TIMESTAMP,
  retention_days INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_client_file ON client_file_storage(cliente_id, created_at);
CREATE INDEX idx_file_type ON client_file_storage(file_type);
```

**`client_conversation_archive`**
```sql
CREATE TABLE client_conversation_archive (
  archive_id UUID PRIMARY KEY,
  cliente_id INT NOT NULL (FK → usuarios.id),
  conversation_thread_id VARCHAR(255),
  archive_content LONGTEXT,
  format ENUM('json', 'pdf', 'html', 'txt') DEFAULT 'json',
  file_path VARCHAR(500),
  start_date DATE,
  end_date DATE,
  message_count INT,
  storage_status ENUM('active', 'archived', 'deleted') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_client_conversation ON client_conversation_archive(cliente_id, start_date);
```

**Rutas de almacenamiento:**
```
📁 storage/
  ├── clients/
  │   ├── client_${id}/
  │   │   ├── conversations/  (historial textual)
  │   │   ├── media/          (imágenes, videos, audio)
  │   │   │   ├── images/
  │   │   │   ├── videos/
  │   │   │   └── audio/
  │   │   ├── documents/      (PDFs, archivos)
  │   │   └── archives/       (backups y archivos comprimidos)
```

#### Casos de Uso:

- **UC-001:** Guardar archivos multimedia de conversaciones
- **UC-002:** Generar copias de seguridad del historial por cliente
- **UC-003:** Restaurar conversaciones anteriores
- **UC-004:** Auditar acceso a archivos del cliente

---

### 2️⃣ HISTORIAL Y RELACIONES DE GRUPOS DE WHATSAPP

**Objetivo:** Rastrear grupos de WhatsApp, miembros y su relación con clientes.

#### Nuevas Tablas:

**`whatsapp_groups`**
```sql
CREATE TABLE whatsapp_groups (
  group_id VARCHAR(255) PRIMARY KEY,
  group_name VARCHAR(255) NOT NULL,
  group_jid VARCHAR(255) UNIQUE NOT NULL,
  group_subject_timestamp TIMESTAMP,
  group_description TEXT,
  group_profile_picture_url VARCHAR(500),
  group_creation_date TIMESTAMP,
  owner_phone_number VARCHAR(20) (FK → usuarios.phoneNumber),
  total_members INT,
  is_active BOOLEAN DEFAULT TRUE,
  parent_cliente_id INT (FK → usuarios.id),
  sync_status ENUM('synced', 'pending', 'failed') DEFAULT 'pending',
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_group_client ON whatsapp_groups(parent_cliente_id);
CREATE INDEX idx_group_active ON whatsapp_groups(is_active, parent_cliente_id);
```

**`whatsapp_group_members`**
```sql
CREATE TABLE whatsapp_group_members (
  membership_id UUID PRIMARY KEY,
  group_id VARCHAR(255) NOT NULL (FK → whatsapp_groups.group_id),
  member_phone_number VARCHAR(20) NOT NULL,
  member_name VARCHAR(255),
  joined_date TIMESTAMP,
  left_date TIMESTAMP,
  is_admin BOOLEAN DEFAULT FALSE,
  is_superadmin BOOLEAN DEFAULT FALSE,
  member_status ENUM('active', 'left', 'removed', 'banned') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_member (group_id, member_phone_number)
);

CREATE INDEX idx_member_group ON whatsapp_group_members(group_id);
CREATE INDEX idx_member_status ON whatsapp_group_members(member_status);
```

**`whatsapp_group_cliente_mapping`**
```sql
CREATE TABLE whatsapp_group_cliente_mapping (
  mapping_id UUID PRIMARY KEY,
  cliente_id INT NOT NULL (FK → usuarios.id),
  group_id VARCHAR(255) NOT NULL (FK → whatsapp_groups.group_id),
  relationship_type ENUM('owner', 'member', 'target_audience', 'support_group') NOT NULL,
  purpose VARCHAR(255),
  message_count INT DEFAULT 0,
  last_message_date TIMESTAMP,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_mapping (cliente_id, group_id)
);

CREATE INDEX idx_client_groups ON whatsapp_group_cliente_mapping(cliente_id);
```

**`whatsapp_group_messages_log`**
```sql
CREATE TABLE whatsapp_group_messages_log (
  message_id VARCHAR(255) PRIMARY KEY,
  group_id VARCHAR(255) NOT NULL (FK → whatsapp_groups.group_id),
  sender_phone_number VARCHAR(20),
  sender_name VARCHAR(255),
  message_body TEXT,
  message_type ENUM('text', 'image', 'video', 'audio', 'document', 'sticker', 'reaction') NOT NULL,
  media_url VARCHAR(500),
  is_bot_message BOOLEAN DEFAULT FALSE,
  message_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_group_messages ON whatsapp_group_messages_log(group_id, message_timestamp);
CREATE INDEX idx_sender_messages ON whatsapp_group_messages_log(sender_phone_number);
```

#### Casos de Uso:

- **UC-201:** Sincronizar grupos de WhatsApp con clientes
- **UC-202:** Rastrear cambios en membresía de grupos
- **UC-203:** Generar reportes de participación en grupos
- **UC-204:** Asignar grupos a clientes como audiencias objetivo

---

### 3️⃣ NIVELES Y ROLES DE USUARIO

**Objetivo:** Implementar control granular de acceso basado en roles.

#### Nuevas Tablas:

**`user_roles`**
```sql
CREATE TABLE user_roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  permission_level INT (valores 1-100, donde 1=viewer, 100=admin),
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles predefinidos
INSERT INTO user_roles (role_name, description, permission_level, is_system_role) VALUES
('super_admin', 'Acceso total al sistema', 100, TRUE),
('admin', 'Administrador de clientes', 80, TRUE),
('manager', 'Gerente de campañas y reportes', 60, TRUE),
('agent', 'Agente de soporte', 40, TRUE),
('analyst', 'Analista de datos', 30, TRUE),
('viewer', 'Solo lectura', 10, TRUE);
```

**`user_permissions`**
```sql
CREATE TABLE user_permissions (
  permission_id INT PRIMARY KEY AUTO_INCREMENT,
  permission_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  module VARCHAR(50),
  action VARCHAR(50),
  resource_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permisos predefinidos
INSERT INTO user_permissions (permission_name, description, module, action, resource_type) VALUES
('users.create', 'Crear usuarios', 'users', 'create', 'usuario'),
('users.read', 'Ver usuarios', 'users', 'read', 'usuario'),
('users.update', 'Actualizar usuarios', 'users', 'update', 'usuario'),
('users.delete', 'Eliminar usuarios', 'users', 'delete', 'usuario'),
('campaigns.create', 'Crear campañas', 'campaigns', 'create', 'campaign'),
('campaigns.send', 'Enviar campañas', 'campaigns', 'send', 'campaign'),
('reports.view', 'Ver reportes', 'reports', 'read', 'report'),
('files.download', 'Descargar archivos de cliente', 'files', 'download', 'file'),
('analytics.view', 'Ver analytics', 'analytics', 'read', 'analytics'),
('templates.manage', 'Gestionar templates', 'templates', 'manage', 'template');
```

**`role_permissions`**
```sql
CREATE TABLE role_permissions (
  role_permission_id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL (FK → user_roles.role_id),
  permission_id INT NOT NULL (FK → user_permissions.permission_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_role_permission (role_id, permission_id)
);
```

**`usuarios` (ACTUALIZAR)**
```sql
-- Agregar columnas a tabla existente
ALTER TABLE usuarios ADD COLUMN (
  role_id INT (FK → user_roles.role_id),
  user_type ENUM('client', 'agent', 'admin', 'analyst') NOT NULL DEFAULT 'client',
  last_login TIMESTAMP,
  login_count INT DEFAULT 0,
  password_hash VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  account_status ENUM('active', 'suspended', 'inactive') DEFAULT 'active'
);

CREATE INDEX idx_user_role ON usuarios(role_id);
CREATE INDEX idx_user_active ON usuarios(is_active);
```

#### Casos de Uso:

- **UC-301:** Asignar roles a usuarios
- **UC-302:** Validar permisos antes de acciones sensibles
- **UC-303:** Auditar cambios de acceso
- **UC-304:** Generar reportes de acceso por usuario

---

### 4️⃣ PLATAFORMA DE ORIGEN DEL MENSAJE

**Objetivo:** Rastrear el canal/plataforma de origen de cada mensaje.

#### Nuevas Tablas:

**`message_channels`**
```sql
CREATE TABLE message_channels (
  channel_id INT PRIMARY KEY AUTO_INCREMENT,
  channel_name VARCHAR(100) UNIQUE NOT NULL,
  channel_type ENUM('whatsapp', 'sms', 'telegram', 'email', 'web', 'instagram', 'facebook') NOT NULL,
  description TEXT,
  api_endpoint VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO message_channels (channel_name, channel_type) VALUES
('WhatsApp', 'whatsapp'),
('SMS Local', 'sms'),
('SMS Internacional', 'sms'),
('Telegram', 'telegram'),
('Email', 'email'),
('Web Chat', 'web'),
('Instagram Direct', 'instagram'),
('Facebook Messenger', 'facebook');
```

**`conversations_log` (ACTUALIZAR)**
```sql
-- Agregar columnas a tabla existente
ALTER TABLE conversations_log ADD COLUMN (
  channel_id INT (FK → message_channels.channel_id),
  platform_origin VARCHAR(50),
  sms_gateway_provider VARCHAR(100),
  message_direction ENUM('inbound', 'outbound') NOT NULL DEFAULT 'inbound'
);

CREATE INDEX idx_channel_date ON conversations_log(channel_id, date);
```

**`channel_statistics`**
```sql
CREATE TABLE channel_statistics (
  stat_id UUID PRIMARY KEY,
  channel_id INT NOT NULL (FK → message_channels.channel_id),
  date DATE NOT NULL,
  total_inbound_messages INT DEFAULT 0,
  total_outbound_messages INT DEFAULT 0,
  total_failed_messages INT DEFAULT 0,
  average_response_time_seconds INT,
  unique_users INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_channel_date (channel_id, date)
);

CREATE INDEX idx_channel_stats ON channel_statistics(channel_id, date);
```

#### Casos de Uso:

- **UC-401:** Identificar canal de origen para cada mensaje
- **UC-402:** Generar reportes por canal
- **UC-403:** Optimizar recursos por plataforma
- **UC-404:** Rastrear costos por canal (SMS vs WhatsApp)

---

### 5️⃣ CAMPAÑAS Y REPORTES

**Objetivo:** Sistema completo de campañas de marketing y reportes avanzados.

#### Nuevas Tablas:

**`campaigns`**
```sql
CREATE TABLE campaigns (
  campaign_id UUID PRIMARY KEY,
  campaign_name VARCHAR(255) NOT NULL,
  campaign_type ENUM('broadcast', 'drip', 'trigger', 'scheduled', 'one_time') NOT NULL,
  description TEXT,
  created_by_user_id INT NOT NULL (FK → usuarios.id),
  status ENUM('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled') DEFAULT 'draft',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  channel_id INT NOT NULL (FK → message_channels.channel_id),
  target_segment_id UUID (FK → customer_segments.segment_id),
  total_recipients INT DEFAULT 0,
  messages_sent INT DEFAULT 0,
  messages_failed INT DEFAULT 0,
  unique_clicks INT DEFAULT 0,
  conversion_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaign_status ON campaigns(status);
CREATE INDEX idx_campaign_dates ON campaigns(start_date, end_date);
```

**`campaign_messages`**
```sql
CREATE TABLE campaign_messages (
  campaign_message_id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL (FK → campaigns.campaign_id),
  message_body TEXT NOT NULL,
  message_template_id UUID (FK → message_templates.template_id),
  sequence_order INT,
  delay_seconds INT,
  status ENUM('pending', 'sending', 'sent', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaign_messages ON campaign_messages(campaign_id);
```

**`campaign_recipient_log`**
```sql
CREATE TABLE campaign_recipient_log (
  recipient_log_id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL (FK → campaigns.campaign_id),
  cliente_id INT NOT NULL (FK → usuarios.id),
  message_id VARCHAR(255),
  send_status ENUM('pending', 'sent', 'delivered', 'read', 'failed', 'bounced') DEFAULT 'pending',
  sent_timestamp TIMESTAMP,
  delivered_timestamp TIMESTAMP,
  read_timestamp TIMESTAMP,
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recipient_campaign ON campaign_recipient_log(campaign_id);
CREATE INDEX idx_recipient_status ON campaign_recipient_log(send_status);
```

**`campaign_analytics`**
```sql
CREATE TABLE campaign_analytics (
  analytics_id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL (FK → campaigns.campaign_id),
  metric_name VARCHAR(100),
  metric_value DECIMAL(10, 2),
  metric_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Métricas clave: impressions, clicks, conversions, engagement_rate, bounce_rate, unsubscribe_count
```

**`customer_reports`**
```sql
CREATE TABLE customer_reports (
  report_id UUID PRIMARY KEY,
  cliente_id INT NOT NULL (FK → usuarios.id),
  report_type ENUM('monthly_activity', 'campaign_performance', 'channel_analysis', 'growth', 'custom') NOT NULL,
  report_title VARCHAR(255),
  report_body LONGTEXT,
  generated_by_user_id INT (FK → usuarios.id),
  date_from DATE,
  date_to DATE,
  file_path VARCHAR(500),
  format ENUM('pdf', 'csv', 'json', 'html') DEFAULT 'pdf',
  is_scheduled BOOLEAN DEFAULT FALSE,
  schedule_frequency ENUM('daily', 'weekly', 'monthly') DEFAULT 'weekly',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_client_reports ON customer_reports(cliente_id, created_at);
```

**`campaign_goals`**
```sql
CREATE TABLE campaign_goals (
  goal_id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL (FK → campaigns.campaign_id),
  goal_name VARCHAR(255),
  goal_type ENUM('conversion', 'engagement', 'reach', 'revenue') NOT NULL,
  target_value INT,
  actual_value INT DEFAULT 0,
  target_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Casos de Uso:

- **UC-501:** Crear y programar campañas de marketing
- **UC-502:** Enviar campañas a segmentos de clientes
- **UC-503:** Rastrear KPIs de campañas
- **UC-504:** Generar reportes periódicos automáticos
- **UC-505:** Analizar ROI por campaña

---

### 6️⃣ TEMPLATES DE MENSAJE DE META

**Objetivo:** Gestionar y versionear templates de WhatsApp/Meta.

#### Nuevas Tablas:

**`message_templates`**
```sql
CREATE TABLE message_templates (
  template_id UUID PRIMARY KEY,
  template_name VARCHAR(255) UNIQUE NOT NULL,
  template_category ENUM('marketing', 'transactional', 'support', 'notification') NOT NULL,
  language_code VARCHAR(10) DEFAULT 'es_ES',
  meta_template_name VARCHAR(255),
  meta_template_id VARCHAR(255),
  status ENUM('draft', 'pending_approval', 'approved', 'rejected', 'archived') DEFAULT 'draft',
  approval_status_meta ENUM('pending', 'approved', 'rejected', 'disabled') DEFAULT 'pending',
  rejection_reason TEXT,
  header_type ENUM('text', 'image', 'video', 'document') DEFAULT 'text',
  header_content TEXT,
  body_text TEXT NOT NULL,
  footer_text TEXT,
  created_by_user_id INT NOT NULL (FK → usuarios.id),
  approved_by_user_id INT (FK → usuarios.id),
  approval_date TIMESTAMP,
  meta_response_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_template_status ON message_templates(status);
CREATE INDEX idx_template_meta ON message_templates(meta_template_name);
```

**`template_buttons`**
```sql
CREATE TABLE template_buttons (
  button_id UUID PRIMARY KEY,
  template_id UUID NOT NULL (FK → message_templates.template_id),
  button_text VARCHAR(255) NOT NULL,
  button_type ENUM('call_phone_number', 'visit_website', 'quick_reply') NOT NULL,
  button_value VARCHAR(500),
  button_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_template_buttons ON template_buttons(template_id);
```

**`template_variables`**
```sql
CREATE TABLE template_variables (
  variable_id UUID PRIMARY KEY,
  template_id UUID NOT NULL (FK → message_templates.template_id),
  variable_name VARCHAR(100),
  variable_placeholder VARCHAR(100),
  variable_type ENUM('text', 'phone', 'email', 'url', 'datetime') NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  example_value VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_variable_template ON template_variables(template_id);
```

**`template_usage_log`**
```sql
CREATE TABLE template_usage_log (
  usage_id UUID PRIMARY KEY,
  template_id UUID NOT NULL (FK → message_templates.template_id),
  campaign_id UUID (FK → campaigns.campaign_id),
  message_id VARCHAR(255),
  cliente_id INT (FK → usuarios.id),
  usage_timestamp TIMESTAMP,
  status ENUM('sent', 'delivered', 'read', 'failed') DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_template_usage ON template_usage_log(template_id, usage_timestamp);
CREATE INDEX idx_template_campaign ON template_usage_log(campaign_id);
```

**`template_versions`**
```sql
CREATE TABLE template_versions (
  version_id UUID PRIMARY KEY,
  template_id UUID NOT NULL (FK → message_templates.template_id),
  version_number INT,
  body_text TEXT,
  header_content TEXT,
  footer_text TEXT,
  changed_by_user_id INT (FK → usuarios.id),
  change_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_template_versions ON template_versions(template_id, version_number);
```

#### Casos de Uso:

- **UC-601:** Crear templates de WhatsApp/Meta
- **UC-602:** Versionar y auditar cambios en templates
- **UC-603:** Sincronizar con API de Meta para aprobación
- **UC-604:** Reutilizar templates en campañas
- **UC-605:** Rastrear uso de templates

---

### 7️⃣ SEGMENTACIÓN DE CLIENTES

**Objetivo:** Segmentar clientes por múltiples criterios para campañas dirigidas.

#### Nuevas Tablas:

**`segmentation_rules`**
```sql
CREATE TABLE segmentation_rules (
  rule_id UUID PRIMARY KEY,
  rule_name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_type ENUM('demographic', 'behavioral', 'engagement', 'transactional', 'custom') NOT NULL,
  criteria_json JSON NOT NULL,
  created_by_user_id INT NOT NULL (FK → usuarios.id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rule_active ON segmentation_rules(is_active);
```

**`customer_segments`**
```sql
CREATE TABLE customer_segments (
  segment_id UUID PRIMARY KEY,
  segment_name VARCHAR(255) NOT NULL,
  segment_description TEXT,
  segment_type ENUM('manual', 'dynamic', 'hybrid') NOT NULL,
  rule_id UUID (FK → segmentation_rules.rule_id),
  total_customers INT DEFAULT 0,
  active_customers INT DEFAULT 0,
  created_by_user_id INT NOT NULL (FK → usuarios.id),
  is_active BOOLEAN DEFAULT TRUE,
  last_updated TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_segment_active ON customer_segments(is_active);
CREATE INDEX idx_segment_rule ON customer_segments(rule_id);
```

**`segment_members`**
```sql
CREATE TABLE segment_members (
  member_id UUID PRIMARY KEY,
  segment_id UUID NOT NULL (FK → customer_segments.segment_id),
  cliente_id INT NOT NULL (FK → usuarios.id),
  joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  reason_joined VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_segment_member (segment_id, cliente_id)
);

CREATE INDEX idx_segment_members ON segment_members(segment_id, is_active);
CREATE INDEX idx_cliente_segments ON segment_members(cliente_id);
```

**`segment_performance`**
```sql
CREATE TABLE segment_performance (
  performance_id UUID PRIMARY KEY,
  segment_id UUID NOT NULL (FK → customer_segments.segment_id),
  date DATE,
  metric_name VARCHAR(100),
  metric_value DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Métricas: engagement_rate, conversion_rate, churn_rate, avg_purchase_value, lifetime_value
```

**`customer_scores`**
```sql
CREATE TABLE customer_scores (
  score_id UUID PRIMARY KEY,
  cliente_id INT NOT NULL (FK → usuarios.id),
  score_type ENUM('engagement', 'loyalty', 'purchase_propensity', 'churn_risk', 'lifetime_value') NOT NULL,
  score_value DECIMAL(5, 2),
  score_percentile INT,
  last_calculated TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_customer_score (cliente_id, score_type)
);

CREATE INDEX idx_customer_scores ON customer_scores(cliente_id);
CREATE INDEX idx_score_type ON customer_scores(score_type, score_value);
```

#### Criterios de Segmentación Soportados:

```json
{
  "demographic": {
    "location": "región",
    "age_range": "18-35",
    "user_type": "client|agent"
  },
  "behavioral": {
    "purchase_frequency": "high|medium|low",
    "engagement_level": "active|moderate|inactive",
    "preferred_channel": "whatsapp|sms|email"
  },
  "engagement": {
    "last_interaction_days": 30,
    "message_count_threshold": 10,
    "response_rate_min": 0.5
  },
  "transactional": {
    "total_purchases": 5,
    "total_spent": 1000,
    "last_purchase_days": 60
  }
}
```

#### Casos de Uso:

- **UC-701:** Crear segmentos manuales o dinámicos
- **UC-702:** Asignar clientes a segmentos automáticamente
- **UC-703:** Medir performance de segmentos
- **UC-704:** Calcular scores de clientes
- **UC-705:** Dirigir campañas a segmentos específicos

---

## 📐 ARQUITECTURA DE BASE DE DATOS

### Diagrama de Relaciones (ERD Simplificado)

```
┌─────────────────────────────────────────────────────────────────┐
│                        TABLAS EXISTENTES                         │
├─────────────────────────────────────────────────────────────────┤
│ usuarios ◄──────────────┐                                        │
│ ├─ id (PK)             │                                         │
│ ├─ phoneNumber (UQ)    │                                         │
│ ├─ nombre              │                                         │
│ ├─ [NEW] role_id ──────┼──► user_roles                           │
│ ├─ [NEW] user_type     │    ├─ role_id (PK)                      │
│ └─ [NEW] password_hash │    └─ role_name                         │
│                        └──────────────────┐                       │
│                                           ▼                       │
│ conversations_log      │          role_permissions              │
│ ├─ id (PK)            │          ├─ role_id (FK)               │
│ ├─ [NEW] channel_id ──┼──────────┐ └─ permission_id (FK)       │
│ └─ [NEW] platform      │         │         ▲                    │
│                        │         │         │                    │
│                        │         └────────────────┐              │
│ pedidos                │                          │              │
│ ├─ clienteId (FK)      │                   user_permissions      │
│ └─ estado              │                   ├─ permission_id (PK) │
│                        │                   └─ permission_name    │
│                        │                                         │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         ▼
           ┌─────────────────────────┐
           │   message_channels      │
           ├─ channel_id (PK)        │
           ├─ channel_name           │
           └─ channel_type           │

┌──────────────────────────────────────────────────────────────────┐
│                        NUEVAS TABLAS                              │
├──────────────────────────────────────────────────────────────────┤

┌──────────────────────────────────────────────────────────────────┐
│ GESTIÓN DE ARCHIVOS Y CONVERSACIONES                             │
├──────────────────────────────────────────────────────────────────┤
│ client_file_storage            client_conversation_archive       │
│ ├─ file_id (PK)               ├─ archive_id (PK)                │
│ ├─ cliente_id (FK)◄───────────┴─ cliente_id (FK)                │
│ ├─ message_id (UK)             └─ archive_content               │
│ ├─ file_type                                                    │
│ └─ file_path                                                    │

┌──────────────────────────────────────────────────────────────────┐
│ GRUPOS DE WHATSAPP                                               │
├──────────────────────────────────────────────────────────────────┤
│ whatsapp_groups                whatsapp_group_members            │
│ ├─ group_id (PK)              ├─ membership_id (PK)             │
│ ├─ group_name                 ├─ group_id (FK)                  │
│ ├─ parent_cliente_id (FK)     └─ member_phone_number            │
│ └─ is_active                  ▲                                 │
│    │                          │                                 │
│    └──────┬────────────────────┘                                │
│           │                                                     │
│    whatsapp_group_cliente_mapping   whatsapp_group_messages_log │
│    ├─ mapping_id (PK)               ├─ message_id (PK)          │
│    ├─ cliente_id (FK)               ├─ group_id (FK)            │
│    ├─ group_id (FK)                 └─ message_body             │
│    └─ relationship_type                                         │

┌──────────────────────────────────────────────────────────────────┐
│ CAMPAÑAS Y REPORTES                                              │
├──────────────────────────────────────────────────────────────────┤
│ campaigns ◄─────────────────────┐                                │
│ ├─ campaign_id (PK)            │                                │
│ ├─ campaign_name               │                                │
│ ├─ target_segment_id ──────────┼─────────────────────────┐       │
│ ├─ channel_id (FK)             │                         ▼       │
│ └─ status                      │                 customer_segments
│    │                           │                 ├─ segment_id (PK)
│    ├──────┬──────┬─────────────┤                 ├─ rule_id (FK)
│    │      │      │             │                 └─ segment_name
│    ▼      ▼      ▼             │                    ▲            │
│ campaign_messages              │                    │            │
│ campaign_recipient_log    campaign_goals    segment_members      │
│ campaign_analytics                          ├─ cliente_id (FK)  │
│                                             └─ segment_id (FK)  │
│ customer_reports                                                 │
│ ├─ report_id (PK)                          segmentation_rules   │
│ └─ cliente_id (FK)                         ├─ rule_id (PK)      │
│                                            └─ criteria_json    │

┌──────────────────────────────────────────────────────────────────┐
│ TEMPLATES DE META                                                │
├──────────────────────────────────────────────────────────────────┤
│ message_templates ◄──┐                                           │
│ ├─ template_id (PK) │                                           │
│ ├─ template_name    │                                           │
│ └─ status           │                                           │
│    │                │                                           │
│    ├──┬──┬────────────┤                                          │
│    ▼  ▼  ▼            │                                          │
│ template_buttons   template_variables   template_usage_log      │
│ template_versions  template_usage_log                           │

┌──────────────────────────────────────────────────────────────────┐
│ SEGMENTACIÓN                                                     │
├──────────────────────────────────────────────────────────────────┤
│ customer_scores                                                  │
│ ├─ score_id (PK)                                               │
│ ├─ cliente_id (FK)                                             │
│ └─ score_type                                                  │

└──────────────────────────────────────────────────────────────────┘
```

### Relaciones Clave:

| De | A | Tipo | Descripción |
|----|----|------|-------------|
| `usuarios` | `user_roles` | N:1 | Cada usuario tiene un rol |
| `user_roles` | `role_permissions` | 1:N | Rol tiene múltiples permisos |
| `conversations_log` | `message_channels` | N:1 | Mensaje en un canal |
| `client_file_storage` | `usuarios` | N:1 | Archivos de cliente |
| `whatsapp_groups` | `usuarios` | N:1 | Grupo pertenece a cliente |
| `whatsapp_group_members` | `whatsapp_groups` | N:1 | Miembro en grupo |
| `whatsapp_group_cliente_mapping` | `usuarios` | N:1 | Cliente mapea grupos |
| `campaigns` | `customer_segments` | N:1 | Campaña dirigida a segmento |
| `campaign_recipient_log` | `campaigns` | N:1 | Registro de envío |
| `message_templates` | `campaigns` | 1:N | Template usado en campaña |
| `customer_segments` | `segmentation_rules` | N:1 | Segmento usa regla |
| `segment_members` | `customer_segments` | N:1 | Cliente en segmento |
| `customer_scores` | `usuarios` | N:1 | Scores de cliente |

---

## 🛣️ ROADMAP DE IMPLEMENTACIÓN

### **Fase 1: Cimientos (Semana 1-2)**
- [ ] **1.1** Crear tablas: `user_roles`, `user_permissions`, `role_permissions`
- [ ] **1.2** Agregar columnas a `usuarios` (role_id, user_type, password_hash)
- [ ] **1.3** Crear tabla `message_channels`
- [ ] **1.4** Agregar columnas a `conversations_log` (channel_id, platform_origin)
- [ ] **1.5** Implementar middleware de autenticación y validación de roles

**Entregables:** Sistema de roles funcional, usuarios con roles asignados

---

### **Fase 2: Gestión de Archivos (Semana 3-4)**
- [ ] **2.1** Crear tablas: `client_file_storage`, `client_conversation_archive`
- [ ] **2.2** Implementar métodos en `SqliteManager`:
  - `saveClientFile(cliente_id, file_data)`
  - `getClientFiles(cliente_id, filter)`
  - `archiveConversation(cliente_id, date_range)`
- [ ] **2.3** Crear estructura de carpetas en sistema de archivos
- [ ] **2.4** Implementar endpoint API para descargar archivos
- [ ] **2.5** Agregar auditoría de acceso a archivos

**Entregables:** Sistema funcional de almacenamiento de archivos y conversaciones

---

### **Fase 3: Grupos de WhatsApp (Semana 5-6)**
- [ ] **3.1** Crear tablas: `whatsapp_groups`, `whatsapp_group_members`, `whatsapp_group_cliente_mapping`, `whatsapp_group_messages_log`
- [ ] **3.2** Integración con Baileys para sincronización de grupos
- [ ] **3.3** Implementar métodos en `SqliteManager`:
  - `syncWhatsAppGroups()`
  - `mapGroupToClient(group_id, cliente_id)`
  - `getClientGroups(cliente_id)`
- [ ] **3.4** Crear dashboard de grupos por cliente

**Entregables:** Sincronización de grupos WhatsApp y mapeo con clientes

---

### **Fase 4: Campañas y Reportes (Semana 7-9)**
- [ ] **4.1** Crear tablas: `campaigns`, `campaign_messages`, `campaign_recipient_log`, `campaign_analytics`, `customer_reports`, `campaign_goals`
- [ ] **4.2** Implementar servicio de campañas (`CampaignService.js`):
  - Crear campaña
  - Programar envío
  - Rastrear métricas
- [ ] **4.3** Implementar generador de reportes:
  - Reportes mensuales
  - Reportes por campaña
  - Reportes por canal
- [ ] **4.4** Crear endpoints API para CRUD de campañas
- [ ] **4.5** Scheduler para campañas programadas (usar `node-cron` o similar)

**Entregables:** Sistema completo de campañas y reportes

---

### **Fase 5: Templates de Meta (Semana 10-11)**
- [ ] **5.1** Crear tablas: `message_templates`, `template_buttons`, `template_variables`, `template_usage_log`, `template_versions`
- [ ] **5.2** Integración con API de Meta:
  - Sincronizar templates aprobados
  - Enviar templates para aprobación
  - Rastrear estado de aprobación
- [ ] **5.3** Implementar versionado de templates
- [ ] **5.4** Crear interfaz de gestión de templates
- [ ] **5.5** Integrar templates en campañas

**Entregables:** Gestión completa de templates con versionado y aprobación

---

### **Fase 6: Segmentación Avanzada (Semana 12-14)**
- [ ] **6.1** Crear tablas: `segmentation_rules`, `customer_segments`, `segment_members`, `segment_performance`, `customer_scores`
- [ ] **6.2** Implementar motor de segmentación:
  - Evaluar reglas
  - Asignar clientes a segmentos
  - Recalcular dinámicamente
- [ ] **6.3** Implementar cálculo de customer scores:
  - Engagement score
  - Loyalty score
  - Churn risk score
  - Lifetime value
- [ ] **6.4** Crear dashboard de segmentos
- [ ] **6.5** Integrar segmentación en campañas

**Entregables:** Motor de segmentación funcional con scoring de clientes

---

### **Fase 7: Optimización e Integración (Semana 15-16)**
- [ ] **7.1** Agregar índices de performance
- [ ] **7.2** Implementar caché (Redis) para queries frecuentes
- [ ] **7.3** Pruebas de carga
- [ ] **7.4** Documentación de API
- [ ] **7.5** Entrenamiento a usuarios finales

**Entregables:** Sistema optimizado y documentado

---

## 📊 ESTIMACIÓN DE ESFUERZO

| Fase | Tareas | Duración | Puntos Story |
|------|--------|----------|--------------|
| **Fase 1** | Setup roles y canales | 2 semanas | 13 |
| **Fase 2** | Archivos y conversaciones | 2 semanas | 21 |
| **Fase 3** | Grupos WhatsApp | 2 semanas | 21 |
| **Fase 4** | Campañas y reportes | 3 semanas | 34 |
| **Fase 5** | Templates de Meta | 2 semanas | 21 |
| **Fase 6** | Segmentación | 3 semanas | 34 |
| **Fase 7** | Optimización | 2 semanas | 13 |
| **TOTAL** | | **16 semanas** | **157** |

---

## 🔒 CONSIDERACIONES DE SEGURIDAD Y PERFORMANCE

### Seguridad:

1. **Autenticación:**
   - JWT tokens con expiración
   - MFA para usuarios admin
   - Validación de roles en cada endpoint

2. **Autorización:**
   - RBAC en todas las operaciones sensibles
   - Auditoría de cambios de acceso
   - Encriptación de contraseñas (bcrypt)

3. **Protección de Datos:**
   - Encriptación de datos sensibles (teléfonos, emails)
   - Hash SHA-256 para archivos (detección de duplicados)
   - Cumplimiento con GDPR/CCPA

4. **Auditoría:**
   - Log de todas las operaciones de usuario
   - Rastreo de cambios en templates
   - Registro de acceso a archivos del cliente

### Performance:

1. **Indexación Estratégica:**
   ```sql
   -- Índices críticos
   CREATE INDEX idx_conv_date ON conversations_log(date);
   CREATE INDEX idx_conv_client ON conversations_log(from, date);
   CREATE INDEX idx_campaign_status ON campaigns(status);
   CREATE INDEX idx_segment_active ON customer_segments(is_active);
   CREATE INDEX idx_template_usage ON template_usage_log(template_id, usage_timestamp);
   ```

2. **Caché:**
   - Redis para roles y permisos
   - Caché de templates (actualizar cada 6 horas)
   - Caché de segmentos dinámicos (1 hora)

3. **Escalabilidad:**
   - Particionamiento por fecha para `conversations_log`
   - Archivado automático de datos antiguos
   - Tablas de resumen para reportes

4. **Batch Processing:**
   - Envío de campañas en lotes (1000 mensajes/lote)
   - Cálculo de scores nocturnamente
   - Generación de reportes programada

---

## 📈 MÉTRICAS DE ÉXITO

### Técnicas:

| Métrica | Meta | Período |
|---------|------|---------|
| **Cobertura de tests** | > 85% | Sprint |
| **Query P95 latency** | < 500ms | Diario |
| **Disponibilidad del sistema** | > 99.9% | Mensual |
| **Tiempo de carga de archivos** | < 2s | Diario |
| **Precisión de segmentación** | > 95% | Semanal |

### Funcionales:

| Métrica | Meta | Período |
|---------|------|---------|
| **Adopción de roles** | 100% usuarios con rol | Sprint 1 |
| **Campañas creadas** | 5+ por semana | Mensual |
| **Tasa de apertura de reportes** | > 70% | Mensual |
| **Segmentos activos** | 10+ segmentos | Mensual |
| **Uso de templates** | 80%+ mensajes vía template | Mensual |

### Negocio:

| Métrica | Meta | Período |
|---------|------|---------|
| **ROI de campañas** | > 300% | Trimestral |
| **Retención de clientes** | > 85% | Trimestral |
| **Satisfacción de usuario** | > 4.5/5 | Trimestral |
| **Reducción de tiempo de operación** | > 40% | Trimestral |

---

## 📚 REFERENCIAS Y DOCUMENTACIÓN

### Documentos Relacionados:
- [INFORME_BASE_DATOS_COMPLETO.md](./INFORME_BASE_DATOS_COMPLETO.md)
- [Project_Database_Architecture.md](../Project_Database_Architecture.md)
- [MarIADonoMeta.md](../../MarIADonoMeta.md)

### Tecnologías Utilizadas:
- **ORM:** Sequelize
- **Base de Datos:** SQLite 3
- **Caché:** Redis (opcional)
- **Autenticación:** JWT + bcrypt
- **Logging:** Winston o similar
- **Scheduler:** node-cron o bull

### APIs Externas:
- **Meta Graph API:** Para templates de WhatsApp
- **Baileys:** Para sincronización de grupos
- **SMS Providers:** Twilio, Vonage (si aplica)

---

## ✅ APROBACIÓN Y SEGUIMIENTO

| Rol | Responsable | Estado | Fecha |
|-----|-------------|--------|-------|
| **Product Manager** | [TBD] | ⏳ Pendiente | - |
| **Tech Lead** | [TBD] | ⏳ Pendiente | - |
| **Security Lead** | [TBD] | ⏳ Pendiente | - |
| **QA Lead** | [TBD] | ⏳ Pendiente | - |

---

**Documento versión 1.0**  
**Última actualización:** 29 de Diciembre de 2025  
**Próxima revisión:** 12 de Enero de 2026

---

**Notas Finales:**

Este PRD proporciona una hoja de ruta completa para mejorar sustancialmente la capacidad de MarIADono. La implementación en 7 fases permite entregar valor incrementalmente mientras se gestiona el riesgo técnico.

Se recomienda:
1. Revisar y validar con stakeholders
2. Ajustar estimaciones después de refinamiento
3. Priorizar según impacto de negocio
4. Establecer sprints de 2 semanas
5. Realizar demos semanales de avance
