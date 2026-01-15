crear una app profesional

que Muestre el Registro completo de conversaciones WhatsApp (conversations_log).
Métricas de conversación y seguimiento de SLA (conversation_metricas).
Canales de envío y configuración de proveedores (message_channels, provider_logs).
Creación y gestión de campañas multicanal (campaigns, campaign_messages, campaign_analytics).
Registro de interacción de destinatarios y tracking (campaign_recipient_log).
Segmentación de clientes dinámica y estática (customer_segments, segmentation_rules, segment_members).
Scoring y performance de segmentos (customer_scores, segment_performance).
Catálogo de productos y gestión de stock (productos, ofertas).
Gestión de pedidos y estados de pedido (pedidos).
Horarios de atención y reglas/excepciones (horarios, reglas_horario, excepciones_horario).
Administración de grupos de WhatsApp y miembros (whatsapp_groups, whatsapp_group_members, whatsapp_group_cliente_mapping).
Plantillas reutilizables de mensajes (message_templates).
Almacenamiento y gestión de archivos de clientes (client_files).
Registro de estados de mensajes y seguimiento de entregabilidad (mensaje_estados).
Archivo y recuperación de conversaciones por cliente (client_conversation_archive).
Métricas externas (p. ej. ejecuciones n8n) y reporting (n8n_metrics).

Campos conversations_log: `id`, `date`, `time`, `from` (E.164), `role` (cliente/bot/agent), `pushname`, `body`, `messageid` (externo), `etapaembudo`, `interescliente`, `botname`.

Campos horarios:
- `horarios`: `horario_id`, `nombre`, `descripcion`, `bot_name`, `tipo_horario_id`, `zona_horaria`, `activo`, `created_at`, `updated_at`.
- `reglas_horario`: `regla_id`, `horario_id`, `dia_semana` (0-6), `hora_inicio`, `hora_fin`, `estado` (open/closed).
- `excepciones_horario`: `excepcion_id`, `horario_id`, `fecha`, `estado` (closed/open_especial), `descripcion`.