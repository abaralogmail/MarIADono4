# Resumen del Esquema de la Base de Datos

Este documento proporciona un análisis detallado del modelo de datos del proyecto, tal como se define en `SqliteManager.js` utilizando Sequelize.

## Resumen General

El esquema de la base de datos se divide en tres categorías funcionales principales:

1.  **Logs y Métricas**: Tablas dedicadas a registrar la actividad del bot y las interacciones de los usuarios.
2.  **Lógica de Negocio**: Tablas que definen el núcleo del negocio, como usuarios, productos y pedidos.
3.  **Sistema de Horarios**: Un conjunto de tablas para gestionar la disponibilidad y los horarios de atención de los bots.

---

## 1. Tablas de Logs y Métricas

-   **`conversations_log`**
    -   **Propósito**: Almacena cada mensaje enviado y recibido. Es el registro principal de todas las conversaciones.
    -   **Campos Clave**: `id`, `date`, `time`, `from` (número de teléfono), `role` (incoming/Outgoing), `pushName`, `body` (contenido del mensaje), `messageId`, `botName`.

-   **`conversation_metricas`**
    -   **Propósito**: Guarda datos analíticos derivados de una conversación para entender mejor al cliente.
    -   **Campos Clave**: `id`, `messageId`, `respuesta`, `metricas_cliente`, `interes_cliente`, `etapa_embudo`.

-   **`mensaje_estados`**
    -   **Propósito**: Rastrea el estado de los mensajes (ej. 'enviado', 'leído').
    -   **Campos Clave**: `id`, `messageId`, `estado`, `timestamp`.

-   **`ctx_logs`**
    -   **Propósito**: Guarda el "contexto" o estado de la conversación de un usuario en un punto determinado.
    -   **Campos Clave**: `id`, `phoneNumber`, `contextData` (JSON).

-   **`provider_logs`**
    -   **Propósito**: Registra las acciones realizadas por el "provider" (el conector de WhatsApp, Baileys).
    -   **Campos Clave**: `id`, `phoneNumber`, `providerName`, `action`, `data` (JSON).

---

## 2. Tablas de Lógica de Negocio

-   **`usuarios`**
    -   **Propósito**: Almacena la información de los usuarios o clientes que interactúan con el bot.
    -   **Campos Clave**: `id`, `phoneNumber` (único), `nombre`, `email`, `fechaRegistro`.

-   **`productos`**
    -   **Propósito**: Catálogo de productos.
    -   **Campos Clave**: `id`, `codigo`, `nombre`, `descripcion`, `precio`, `stock`, `categoria`.

-   **`ofertas`**
    -   **Propósito**: Almacena ofertas especiales de productos.
    -   **Campos Clave**: `id`, `codigo`, `descripcion`, `precio`, `fecha_oferta`.

-   **`pedidos`**
    -   **Propósito**: Registra los pedidos realizados por los clientes.
    -   **Campos Clave**: `id`, `numero_pedido`, `cliente_id`, `fecha_pedido`, `total`, `estado`.

---

## 3. Tablas del Sistema de Horarios

Este es un sistema polimórfico diseñado para gestionar la disponibilidad de los bots.

-   **`horarios`**
    -   **Propósito**: Define un horario general para un bot específico.
    -   **Campos Clave**: `horario_id`, `nombre`, `bot_name`, `tipo_horario_id`, `activo`.

-   **`reglas_horario`**
    -   **Propósito**: Define las reglas semanales recurrentes para un horario.
    -   **Campos Clave**: `regla_id`, `horario_id`, `diaSemana` (0-6), `hora_inicio`, `hora_fin`.

-   **`excepciones_horario`**
    -   **Propósito**: Define excepciones a las reglas normales, como días festivos o eventos especiales.
    -   **Campos Clave**: `excepcion_id`, `horario_id`, `fecha_excepcion`, `estado` ('cerrado' o 'horario_personalizado').

---

## Relaciones entre Tablas

Las siguientes relaciones están **activas** y son aplicadas por Sequelize:

-   **`Horarios` tiene muchas `ReglasHorario`**: `Horarios.hasMany(ReglasHorario)`
-   **`Horarios` tiene muchas `ExcepcionesHorario`**: `Horarios.hasMany(ExcepcionesHorario)`
-   **`ReglasHorario` pertenece a `Horarios`**: `ReglasHorario.belongsTo(Horarios)`
-   **`ExcepcionesHorario` pertenece a `Horarios`**: `ExcepcionesHorario.belongsTo(Horarios)`

### Nota sobre Relaciones Deshabilitadas

En el archivo `SqliteManager.js`, las asociaciones que vincularían `ConversationMetricas` y `MensajeEstados` con `ConversationsLog` (a través de `messageId`) están **comentadas**. Esto significa que, aunque la relación lógica existe, Sequelize **no está aplicando restricciones de clave foránea** en la base de datos para estas tablas. Lo mismo ocurre con la relación entre `Pedidos` y `Usuarios`.
