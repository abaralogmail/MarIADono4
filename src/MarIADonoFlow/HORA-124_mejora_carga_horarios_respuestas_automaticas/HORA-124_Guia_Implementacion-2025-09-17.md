# Guía de Implementación para Carga de Horarios en la Interfaz Web (HORA-124)

## 1. Introducción
Este documento detalla la guía de implementación para la interfaz web de carga y edición de horarios en el proyecto MarIADono, basándose en el diseño establecido en el plan HORA-124.

## 2. Objetivos de Implementación
- Desarrollar una interfaz de usuario intuitiva y funcional para la gestión de horarios.
- Asegurar la persistencia y correcta manipulación de los datos de horarios y excepciones en la base de datos.
- Mantener la coherencia con la arquitectura existente del proyecto.

## 3. Prototipos de Implementación y Tareas Detalladas

### 3.1. Vista General de Horarios
- **Descripción:** La pantalla principal (`views/schedule-manager.html`) mostrará los horarios configurados para cada día de la semana en un formato de tabla o cuadrícula.
- **Componentes clave y Tareas:**
  - **Estructura HTML:** Crear una tabla HTML (`<table>`) o una cuadrícula (`<div>` con CSS Grid/Flexbox) en `schedule-manager.html` para representar los 7 días de la semana.
  - **Celdas de Horario:** Para cada día, implementar celdas que contengan:
    - **Inputs de Hora:** Utilizar `<input type="time">` para definir la `horaInicio` y `horaFin` de cada regla de horario. Estos inputs deben ser dinámicos, permitiendo añadir múltiples rangos horarios por día.
    - **Botones de Acción:** Incluir botones para "Añadir Horario" (nueva regla), "Editar Horario" (modificar regla existente) y "Eliminar Horario" (borrar regla).
  - **Botón de Recarga:** Implementar un botón "Recargar Horarios" que, al ser clickeado, dispare una función JavaScript para obtener los datos actualizados del backend y refrescar la interfaz.
  - **Lógica Frontend (`views/schedule-manager.js`):**

    - Desarrollar manejadores de eventos para los botones de añadir, editar y eliminar horarios, enviando las peticiones correspondientes a la API.
    - Incluir lógica de validación básica para los rangos de tiempo (ej. `horaFin` > `horaInicio`).
    - Renderizar dinámicamente las reglas de horario en la tabla/cuadrícula.

### 3.2. Manejo de Excepciones
- **Descripción:** Una sección dedicada en `views/schedule-manager.html` para definir y gestionar excepciones a los horarios regulares.
- **Componentes clave y Tareas:**
  - **Formulario de Excepción:** Crear un formulario con los siguientes campos:
    - **Selector de Fecha:** `<input type="date">` para `fechaExcepcion`.
    - **Tipo de Excepción:** Un `select` o radio buttons para `estado` (ej. "cerrado", "horario_personalizado").
    - **Inputs de Hora (condicional):** Si `estado` es "horario_personalizado", mostrar `<input type="time">` para `horaInicio` y `horaFin` de la excepción.
    - **Descripción:** `<textarea>` para `descripcion` de la excepción.
  - **Listado de Excepciones:** Mostrar las excepciones existentes en una tabla o lista, con botones para "Editar" y "Eliminar" cada excepción.
  - **Lógica Frontend (`views/schedule-manager.js`):**
    - Funciones para cargar, añadir, editar y eliminar excepciones a través de la API (`/api/exceptions`).
    - Lógica para mostrar/ocultar los campos de hora según el `estado` seleccionado.
    - Validación de fechas y horas para excepciones.

### 3.3. Estilo Visual
- **Paleta de colores:** Utilizar las variables CSS definidas globalmente para mantener la coherencia de la marca. Se recomienda el uso de un framework CSS ligero si es necesario para agilizar el desarrollo.
- **Tipografía:** Aplicar las fuentes definidas en el diseño global del proyecto para asegurar legibilidad y accesibilidad.

## 4. Especificaciones Técnicas
- **Tecnologías a utilizar:**
  - **Frontend:** HTML, CSS, JavaScript (Vanilla JS o una librería ligera como jQuery si ya está en el proyecto), EJS para renderizado de vistas en `views/`.
  - **Backend:** Node.js con Express.js para:
    - Servir los archivos estáticos (`public/`).
    - Renderizar las plantillas EJS (`views/`).
    - Definir y manejar las rutas de la API REST en `routes/scheduleRoutes.js`.
  - **API REST (`routes/scheduleRoutes.js`):**
    - Implementar endpoints para:
      - `GET /api/schedules`: Obtener todos los horarios y sus reglas/excepciones.
      - `POST /api/schedules`: Crear un nuevo horario.
      - `PUT /api/schedules/:id`: Actualizar un horario existente.
      - `DELETE /api/schedules/:id`: Eliminar un horario.
      - `POST /api/schedules/:horarioId/rules`: Añadir una regla a un horario.
      - `PUT /api/schedules/:horarioId/rules/:ruleId`: Actualizar una regla.
      - `DELETE /api/schedules/:horarioId/rules/:ruleId`: Eliminar una regla.
      - `POST /api/schedules/:horarioId/exceptions`: Añadir una excepción a un horario.
      - `PUT /api/schedules/:horarioId/exceptions/:exceptionId`: Actualizar una excepción.
      - `DELETE /api/schedules/:horarioId/exceptions/:exceptionId`: Eliminar una excepción.

- **Base de datos:**
  - La base de datos se implementa utilizando SQLite gestionado con Sequelize.
  - Los modelos de la base de datos (`Horarios`, `ReglasHorario`, `ExcepcionesHorario`) se definen en archivos separados dentro del directorio `database/models/`, donde cada archivo es la fuente de la verdad para la estructura de la base de datos, siguiendo las directrices establecidas en la `DATABASE_MAINTENANCE_GUIDE.md`.
  - Las interacciones con la base de datos se realizarán a través de los métodos definidos en `SqliteManager.js` y `DatabaseQueries.js`.

## 5. Conclusión
Esta guía de implementación proporciona los pasos detallados para desarrollar la funcionalidad de carga de horarios, asegurando la alineación con el diseño y los objetivos del proyecto. Se recomienda un enfoque iterativo, probando cada componente a medida que se implementa.

**Fecha:** 2025-09-17
---
<doc>
  <id>HORA-124_GUIA_IMPLEMENTACION</id>
  <title>Guía de Implementación para Carga de Horarios en la Interfaz Web</title>
  <status>En implementación</status>
  <assignee>user@example.com</assignee>
  <priority>Alta</priority>
  <itemType>Guía de Implementación</itemType>
  <creationDate>2025-09-17T00:00:00Z</creationDate>
</doc>
---