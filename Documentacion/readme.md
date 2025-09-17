# MarIaDono3

## Descripción del Proyecto
MarIaDono3 es una plataforma automatizada para la gestión de interacciones de mensajes, diseñada para optimizar el envío y recepción de mensajes masivos (BulkMessage) y mensajes entrantes (Incoming) en aplicaciones de mensajería, como WhatsApp. El proyecto se enfoca en la entrega eficiente de contenido, análisis de interacciones y la gestión de usuarios.

## Características
- Envío y recepción de mensajes masivos e interacciones.
- Análisis de datos y generación de reportes sobre el comportamiento del usuario.
- Gestión de usuarios y registro de conversaciones.
- Integración de flujos de trabajo para respuestas automáticas y procesamiento de voz.
- Persistencia de datos utilizando un ORM (Sequelize) con una base de datos.

## Requisitos
- Node.js (versión X.X.X o superior)
- npm (Node Package Manager)
- Base de datos (por ejemplo, PostgreSQL, SQLite)

## Instalación
1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu_usuario/MarIaDono3.git
   cd MarIaDono3
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno necesarias. Crea un archivo `.env` en la raíz del proyecto y define las siguientes variables:
   ```env
   OPENAI_API_KEY=tu_api_key
   DB_CONNECTION_STRING=tu_string_de_conexion
   ```

4. (Opcional) Si utilizas una base de datos, asegúrate de que está correctamente configurada y ejecuta las migraciones si es necesario.

## Uso
Para iniciar la aplicación, ejecuta el siguiente comando:
```bash
npm start
```

## Estructura del Proyecto
```
/Documentacion       - Documentación del proyecto
/src                  - Código fuente del proyecto
   /bulk             - Lógica relacionada con mensajes masivos
   /database         - Manejo de la base de datos
   /flows            - Flujos de conversación y procesamiento
   /utils            - Funciones de utilidad
   ...
```

## Pruebas
Para ejecutar las pruebas, utiliza el siguiente comando:
```bash
npm test
```

## Contribuciones
Las contribuciones son bienvenidas. Si deseas contribuir al proyecto, por favor sigue los siguientes pasos:
1. Haz un fork del repositorio.
2. Crea una nueva rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz un commit (`git commit -m 'Agregué nueva funcionalidad'`).
4. Envía un pull request.

## Soporte
Si tienes alguna pregunta o necesitas ayuda, por favor abre un issue en el repositorio.

## Licencia
Este proyecto está licenciado bajo la MIT License - consulta el archivo [LICENSE](./LICENSE) para más detalles.