<!--
Sync Impact Report:
Version change: 1.2.0 → 1.3.0
Modified principles:
- "IV. Flujos de Conversación Modulares" → "IV. Flujo de Conversación Centralizado"
- "V. Inteligencia y Lógica Centralizadas en n8n" → More specific, referencing Webhook_workflow.json
- "VII. Lógica de Mensajería Masiva Aislada" → More specific, referencing FormatearBulkMessageN8n.json
Added sections: None
Removed sections: None
Templates requiring updates:
- F:\developer\MariaDono\MarIADono3\src\.specify\templates\plan-template.md ⚠ pending
Follow-up TODOs: TODO(FECHA_RATIFICACION): Fecha de adopción original desconocida
-->
# Constitución de MarIADono3

## Principios Fundamentales

### I. Orquestación Centralizada
**Principio:** `app.js` es el único punto de entrada y orquestador principal del sistema.
**Razón:** Centraliza el inicio y la gestión de todas las instancias de bots, asegurando un control unificado y predecible. Cada bot operará en un puerto distinto para evitar conflictos.

### II. Gestión de Configuración Aislada
**Principio:** Toda la configuración del sistema debe residir en el directorio `config/`.
**Razón:** Separa la configuración de la lógica de la aplicación, permitiendo modificaciones y personalizaciones sin alterar el código fuente. `botConfigManager.js` gestiona la configuración de los bots y `userConfig.json` los datos de usuario.

### III. Persistencia de Datos Abstraída
**Principio:** La interacción con la base de datos se realizará exclusivamente a través de los módulos en el directorio `database/`.
**Razón:** `SqliteManager.js` actúa como una capa de abstracción, encapsulando la lógica de conexión, los modelos y las consultas. Esto desacopla el resto de la aplicación de la implementación específica de la base de datos.

### IV. Flujo de Conversación Centralizado
**Principio:** `flowPrincipal.js` actúa como el enrutador principal para la lógica de conversación, manejando múltiples responsabilidades para dirigir los mensajes entrantes a los flujos o servicios correspondientes.
**Razón:** Centralizar el enrutamiento inicial en un solo archivo clarifica el punto de entrada de todos los mensajes, lo que facilita el mantenimiento y la depuración de la lógica conversacional.

### V. Inteligencia y Lógica Centralizadas en n8n
**Principio:** Toda la inteligencia del bot, incluyendo la integración con IA y la lógica de negocio, reside en flujos de trabajo de n8n, principalmente orquestados por `Webhook_workflow.json`.
**Razón:** Centraliza el "cerebro" del bot en una plataforma de automatización externa. Esto permite modificar la lógica de negocio sin redesplegar la aplicación, y el código local en `Logica/` se limita a ser un conector.

### VI. Automatización y Servicios Desacoplados
**Principio:** Los procesos automatizados (workflows de n8n) y los servicios de fondo (`services/`) deben operar de manera independiente y desacoplada del núcleo de la aplicación.
**Razón:** Permite que los flujos de trabajo complejos y los servicios en segundo plano (como la gestión de horarios o el servidor web) evolucionen y se mantengan sin impactar directamente la lógica de mensajería principal.

### VII. Lógica de Mensajería Masiva Aislada
**Principio:** Toda la funcionalidad para el envío de mensajes masivos está contenida en el directorio `bulk/` y utiliza flujos de trabajo como `FormatearBulkMessageN8n.json` para la personalización.
**Razón:** Aísla la complejidad del envío masivo, la lectura de datos y la personalización de mensajes, evitando que afecte al flujo de conversación normal.

### VIII. Interfaz Web y Scripts como Componentes Separados
**Principio:** La interfaz de administración web (`views/`, `routes/`, `public/`) y los scripts de mantenimiento (`scripts/`) deben ser componentes independientes.
**Razón:** Mantiene una clara separación de preocupaciones entre la aplicación principal del bot, su interfaz de administración y las herramientas de desarrollo.

## Gobernanza
Esta Constitución prevalece sobre cualquier otra práctica o convención. Las enmiendas requieren documentación, aprobación y un plan de migración. Todas las Pull Requests (PRs) y revisiones de código deben verificar el cumplimiento de estos principios. La complejidad introducida debe estar justificada. Para la guía de desarrollo en tiempo de ejecución, utilice los archivos de guía específicos del proyecto.

**Versión**: 1.3.0 | **Ratificado**: TODO(FECHA_RATIFICACION): Fecha de adopción original desconocida | **Última Enmienda**: 2025-10-06
