Resumen técnico — cómo funciona Node.js y los archivos de configuración en este proyecto

1) Conceptos clave de Node.js (rápido)
- Node.js es un runtime JavaScript sobre V8 + libuv: modelo de I/O no bloqueante y loop de eventos que permite manejar muchas conexiones sin hilos por petición.  
- Código se ejecuta en un hilo principal; operaciones de I/O (fs, red, procesos nativos) se delegan a la capa asíncrona.  
- Módulos: este proyecto usa CommonJS (require/module.exports) por defecto (ver estilo en AGENTS.md). El punto de entrada está declarado en [`package.json`](package.json:1) -> "main": "app.js".

2) [`package.json`](package.json:1) — rol y cómo lo usa el proyecto
- Propósito: metadatos del proyecto, dependencias, scripts y entrypoint.  
- Dependencias vs devDependencies: run-time libs (ej. `@adiwajshing/baileys`, `sqlite3`, `openai`) en "dependencies"; herramientas de desarrollo (eslint, sequelize-cli) en "devDependencies".  
- Scripts relevantes del repo:
  - "prestart": ejecuta `npx eslint . --no-ignore` — obliga lint antes de iniciar.  
  - "start": `node app.js` — inicia la app usando el archivo principal (`app.js`).  
  - Otros scripts de mantenimiento (reportes, pre-copy).  
- npm ci en Dockerfile usa package-lock.json para instalación reproducible y más rápida; `npm install` se usa localmente si se quiere.

3) Desarrollo y recarga — [`nodemon.json`](nodemon.json:1)
- `nodemon` observa cambios y reinicia la app en dev. Aquí está configurado para:
  - watch: carpeta `src`  
  - ext: `.js`  
  - ignore: archivos de test  
  - delay: 3s  
- Flujo típico dev: ejecutar `npx nodemon` o configurar un script "dev" que invoque nodemon; nodemon usa esta configuración para decidir cuándo reiniciar.

4) Calidad de código — [`.eslintrc.json`](.eslintrc.json:1)
- Define entorno (node, browser), reglas y extends.  
- El repo ejecuta ESLint antes de `start` (prestart), lo que previene lanzar código con errores de estilo básicos.  
- Plugins y reglas personalizadas (`plugin:builderbot/recommended`) reflejan convenciones del proyecto; algunas reglas están desactivadas localmente.

5) Archivo de entrada y estructura del proyecto
- `package.json` apunta a `app.js` como main; en el árbol hay implementaciones en `src/` (por ejemplo [`src/app_BuilderBot.js`](src/app_BuilderBot.js:67) contiene la creación/orquestación del bot). El servidor web y servicios se inician desde esos módulos y se exportan handlers/servidores HTTP para el portal y dashboard.

6) Contenerización — [`Dockerfile`](Dockerfile:1)
- Multi-stage/base: usa `node:20-alpine`.  
- Instala dependencias del sistema (sqlite, ffmpeg, chromium, compiladores) necesarias para módulos nativos y procesado multimedia.  
- Copia `package*.json` y ejecuta `npm ci --only=production` para instalar solo dependencias de producción dentro de la imagen.  
- Copia el código, crea directorios persistentes (sesiones de bots, logs, tmp), cambia a usuario no root (`app`) por seguridad.  
- Define variables de entorno por defecto (p. ej. `OPENAI_API_KEY`, `SQLITE_DB_PATH`) que pueden ser sobrescritas en tiempo de ejecución.  
- Healthcheck y CMD final (`npm start`) para ejecutar `node app.js`.

7) Orquestación multi-contenedor y persistencia — [`docker-compose.yml`](docker-compose.yml:1)
- Servicio `mariadono3` construye la imagen usando `Dockerfile`, expone puertos del portal (3000), dashboard (4152) y múltiples puertos de bots (6001-6009).  
- Volúmenes declarados para persistir sesiones de bot, base de datos y logs (evita pérdida de estado cuando el contenedor se recrea).  
- Variables de entorno mapeadas con sustitución `${VAR}` para inyectar secretos desde el host/CI; restart policy `unless-stopped`.

8) Variables de entorno y secretos
- Fuentes comunes: .env local (no presente aquí), variables CI/CD, `docker-compose` env substitution o secrets manager.  
- En Docker, las ENV en [`Dockerfile`](Dockerfile:1) solo son valores por defecto; preferir `docker-compose` o runtime env para valores secretos (no en imágenes).  
- Ejemplos críticos: `OPENAI_API_KEY`, `DB_*`, `N8N_WEBHOOK_*`.

9) Flujos de ejecución y comandos útiles (ejemplos aplicables a este repo)
- Desarrollo local (lint + run):  
  - Ejecutar lint: npx eslint . --no-ignore  
  - Ejecutar app: node app.js  (o si quieres recarga: npx nodemon)  
- Producción via Docker:  
  - Construir imagen: docker compose build mariadono3  
  - Levantar servicio: docker compose up -d mariadono3  
  - Ver logs: docker compose logs -f mariadono3  
- Comandos dentro del contenedor: usar `docker compose exec mariadono3 sh` y comprobar `/app` y los volúmenes montados.

10) Debugging y observabilidad
- Logs: revisar carpeta `Logs` montada en volumen o salida `docker logs`.  
- Si un módulo nativo falla (sqlite, ffmpeg), verificar que las dependencias del sistema estén instaladas (ver [`Dockerfile`](Dockerfile:1) instalaciones apk).  
- Para problemas de arranque, ejecutar `node app.js` localmente tras desactivar `prestart` o resolver errores reportados por ESLint para distinguir problemas de lint vs runtime.

11) Buenas prácticas aplicadas al proyecto
- Persistencia de sesiones y datos en volúmenes para bots (evitar perder sesiones de WhatsApp).  
- Uso de `npm ci` en CI/pipeline para instalaciones reproducibles.  
- Separación de dev deps y prod deps para imágenes más ligeras.  
- Usuario no root en contenedor para minimizar riesgos.

12) Resumen rápido de archivos que debes conocer
- Configuración y arranque: [`package.json`](package.json:1)  
- Recarga dev: [`nodemon.json`](nodemon.json:1)  
- Lint: [`.eslintrc.json`](.eslintrc.json:1) y script "prestart" en [`package.json`](package.json:1)  
- Contenerización: [`Dockerfile`](Dockerfile:1) y [`docker-compose.yml`](docker-compose.yml:1)  
- Punto de inicio / bootstrap app: `app.js` (declarado en [`package.json`](package.json:1)) y módulos en `src/` (ej. [`src/app_BuilderBot.js`](src/app_BuilderBot.js:67)).

Comandos recomendados (rápido)
- Local dev: npx nodemon (usa [`nodemon.json`](nodemon.json:1))  
- Lint antes de prod: npx eslint . --no-ignore (script "prestart")  
- Build y run en Docker: docker compose up --build -d

He explicado el runtime Node.js y cómo los archivos de configuración del proyecto controlan instalación, arranque, recarga y contenerización.