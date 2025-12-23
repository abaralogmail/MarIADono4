## **Resumen Ejecutivo**

- **Proyecto:** MarIADonoMeta — plantilla de bot con BuilderBot y Provider Meta.
- **Propósito:** Bot basado en `@builderbot/bot` usando `provider-meta` y `MemoryDB` para muestras y flujos de registro.
- **Estado:** Código fuente en `src/`, `Dockerfile` presente; sin base de datos persistente.

## **Arquitectura General**

- **Core:** `@builderbot/bot` (gestiona flows, provider y DB).
- **Proveedor:** `@builderbot/provider-meta` (adaptador para Meta).
- **DB:** `MemoryDB` (memoria — no persistente).
- **Entrypoint:** `src/src/y` crea bot, provider y expone endpoints HTTP.
- **Contenedorización:** `Dockerfile` preparado con `node:21-alpine` y `pnpm`.

## **Estructura del Proyecto**

- `src/src/app.js` : (raíz) la entrada real.
- `Dockerfile` : Docker multi-stage (Node 21, pnpm).
- `nodemon.json` : configuración nodemon.
- `.env` : presente (variables no detalladas).
- `package.json` : scripts y dependencias.
- `assets/` : recursos (ej. `assets/sample.png` referenciado).
- `src/`
  - `core.class.log`, `queue.class.log` : archivos de logs presentes.

## **Instalación y Requisitos**

- **SO:** Windows para desarrollo. Docker para despliegue.
- **Node:** No especificado en `package.json`. Dockerfile usa `node:21`.
- **Gestor de paquetes:** NPM local; Dockerfile usa `pnpm`.
- **Comandos (PowerShell):**

```
pnpm install; pnpm run dev
pnpm install; pnpm start
pnpm run lint
```

## **Configuración**

- **Archivos clave:** `.env`, `package.json`, `nodemon.json`, `.eslintrc.json`.
- **Variables detectadas:** `PORT` (por defecto `3008`). En `src/app.js` se usan credenciales del provider (`jwtToken`, `numberId`, `verifyToken`, `version`) que no están externalizadas en el repo.
- **Puertos:** `PORT` = `3008` por defecto.

## **Scripts y Comandos**

- `lint`: `eslint . --no-ignore`
- `dev`: `npm run lint && nodemon --signal SIGKILL ./src/app.js`
- `start`: `node ./src/app.js`

## **Ejecución**

- Desarrollo (PowerShell):

```
pnpm install; pnpm run dev
```

- Producción local:

```
pnpm install; pnpm start
```

- Docker (ejemplo):

```
docker build -t base-bailey-json .; docker run -e PORT=3008 -p 3008:3008 base-bailey-json
```

## **Servicios y Dependencias**

- **Dependencias:** `@builderbot/bot`, `@builderbot/provider-meta`, `dotenv`.
- **DevDependencies:** `eslint`, `nodemon`, plugins de eslint.
- **Servicios externos:** Meta provider (requiere credenciales reales).

## **Base de Datos**

- **Tipo:** `MemoryDB` (in-memory) importado desde `@builderbot/bot`.
- **Persistencia:** No persistente. Si se requiere, migrar a adaptador persistente (No especificado).

## **Flujos y Lógica**

- **Flows principales (en `src/app.js`):**
  - `welcomeFlow` — saludo y enlace a `doc`.
  - `discordFlow` — respuesta con documentación y navegación a `registerFlow`.
  - `registerFlow` — captura `name` y `age`, confirma datos.
  - `fullSamplesFlow` — envía media (imagen local, video/audio/url, PDF).
- **Endpoints HTTP expuestos por provider:**
  - `POST /v1/messages` — enviar mensaje.
  - `POST /v1/register` — disparar `REGISTER_FLOW`.
  - `POST /v1/samples` — disparar `SAMPLES`.
  - `POST /v1/blacklist` — añadir/quitar número de lista negra.

## **Panel Web**

- **Estado:** No se detecta interfaz web de administración.

## **Docker y Despliegue**

- **Dockerfile:** Multi-stage con `node:21-alpine3.18`, usa `pnpm`.
- **docker-compose:** No especificado.
- **Ejemplo:** ver sección Ejecución.

## **Pruebas y Calidad**

- **Linting:** `eslint` configurado.
- **Tests:** No especificado.

## **Seguridad y Logs**

- **Logs detectados:** `core.class.log`, `queue.class.log`.
- **Recomendaciones:** externalizar credenciales en `.env`, no commitear secretos, añadir persistencia si se requiere retención.



## **Referencias (archivos clave)**

- `package.json`
- `src/app.js`
- `Dockerfile`
- `.env` (presente)
- `nodemon.json`
- `.eslintrc.json`
- `assets/`

---

## **Explicación: comando `curl` para enviar plantilla WhatsApp**

- **Propósito:** Envía un mensaje tipo *template* por WhatsApp usando la Graph API de Meta.

- **Comando (resumen):**

```bash
curl -i -X POST "https://graph.facebook.com/v22.0/949297758255988/messages" \
  -H 'Authorization: Bearer <ACCESS_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{ "messaging_product": "whatsapp", "to": "543812010781", "type": "template", "template": { "name": "jaspers_market_plain_text_v1", "language": { "code": "en_US" } } }'
```

- **Desglose rápido:**
  - **`-i`**: muestra cabeceras HTTP en la respuesta.
  - **`-X POST`**: método HTTP POST.
  - **URL**: `https://graph.facebook.com/v22.0/<PHONE_NUMBER_ID>/messages` — el número `949297758255988` es el `PHONE_NUMBER_ID` del teléfono configurado en WhatsApp Business.
  - **Header `Authorization`**: `Bearer <ACCESS_TOKEN>` — token de acceso de tu cuenta Meta/WhatsApp Cloud API.
  - **Header `Content-Type`**: `application/json` indicando JSON en el cuerpo.
  - **Body (`-d`)**: payload JSON que indica `messaging_product: "whatsapp"`, el `to` (destino), el `type: "template"` y los datos de la plantilla (`template.name` y `template.language.code`).

- **Estructura del JSON (campo relevantes):**

```json
{
  "messaging_product": "whatsapp",
  "to": "543812010781",
  "type": "template",
  "template": {
    "name": "jaspers_market_plain_text_v1",
    "language": { "code": "en_US" }
  }
}
```

- **Relación con la app en este repositorio:**
  - El provider Meta usado por la app (archivo `src/app.js`) gestiona internamente llamadas equivalentes a este `curl` mediante `@builderbot/provider-meta`.
  - Mapeo de valores:
    - **`Authorization: Bearer` →** token configurado en la app (p. ej. `jwtToken` o `access token`) que debe provenir de variables de entorno (`.env`).
    - **`949297758255988` →** `numberId` usado en la configuración del provider en `src/src/app.js`.
    - **`to` →** número del usuario final; los flows de la app (por ejemplo `registerFlow`, `fullSamplesFlow`) usan números similares para enviar mensajes.
  - En vez de ejecutar `curl` manual, la app crea y envía mensajes llamando al provider; internamente el provider realiza una petición POST a `https://graph.facebook.com/v{version}/{numberId}/messages` con el mismo payload.

- **Buenas prácticas y advertencias:**
  - No subir el `ACCESS_TOKEN` al repositorio; usar `.env` y `process.env` en `src/app.js`.
  - Asegurar que la plantilla (`template.name`) está aprobada en WhatsApp Business Manager.
  - Validar que el número `to` esté en formato internacional (E.164), sin el signo `+` si tu llamada lo requiere.
  - Comprobar la versión de la Graph API (`v22.0`) y actualizar si tu configuración usa otra versión (`version` en la configuración del provider).

- **Equivalente en Node (pseudocódigo):**

```js
// ejemplo simple con fetch/axios
fetch(`https://graph.facebook.com/v${version}/${numberId}/messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});
```
