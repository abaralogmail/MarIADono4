# Informe sobre la Interfaz Web

## 11. Interfaz Web (`views/`, `routes/` y `public/`)

Esta sección cubre los componentes que construyen la interfaz de usuario web para la administración y monitoreo del sistema.

### `views/`

Contiene las plantillas HTML (renderizadas con EJS) que forman las páginas del panel de administración.

- **`schedule-manager.html`**: 
  La vista principal para la gestión de horarios de los bots. Proporciona una interfaz intuitiva para visualizar, agregar y modificar los horarios asignados a los bots.

- **`dashboard.html`**: 
  El panel de control general del sistema. Muestra estadísticas y un resumen sobre el estado de los bots y los horarios, permitiendo una supervisión rápida del sistema.

### `routes/`

Define los endpoints de la API REST que la interfaz web consume para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar).

- **`scheduleRoutes.js`**: 
  Maneja las peticiones relacionadas con los horarios, como obtener, guardar o eliminar un horario. Proporciona una interfaz para que el cliente interactúe con el backend y gestione los datos necesarios para las operaciones de los bots.

### `public/`

Almacena los archivos estáticos que se sirven al cliente.

- **`js/schedule-manager.js`**: 
  El script del lado del cliente que contiene la lógica para interactuar con la página de gestión de horarios. Realiza llamadas a la API para cargar y guardar la información, asegurando que la interfaz se mantenga actualizada con los datos más recientes.
