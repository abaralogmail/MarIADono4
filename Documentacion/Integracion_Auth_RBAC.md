# Integración: Auth JWT y RBAC

Resumen breve:
- Middlewares disponibles: [`src/middleware/authJwt.js`](src/middleware/authJwt.js:1) y [`src/middleware/rbac.js`](src/middleware/rbac.js:1).
- Cache L1: [`src/auxiliares/roleCache.js`](src/auxiliares/roleCache.js:1).
- Migración MFA añadida: [`src/database/migrations/20251229-06-add-mfa-to-usuarios.cjs`](src/database/migrations/20251229-06-add-mfa-to-usuarios.cjs:1).

Requisitos
- Definir `process.env.JWT_SECRET` en `.env`.
- Ejecutar migraciones Sequelize para aplicar `mfa_enabled` si se desea.

Ejemplo: proteger endpoints del provider en [`app_BuilderBot.js`](app_BuilderBot.js:1)

```js
// app_BuilderBot.js (fragmento)
const { authJwt } = require('./src/middleware/authJwt');
const { rbac } = require('./src/middleware/rbac');

// Proteger endpoint para enviar mensajes
adapterProvider.server.post(
  '/v1/messages',
  authJwt({ required: true }),            // exige token válido
  rbac(['messages:send']),                // requiere permiso específico
  handleCtx(async (bot, req, res) => {
    const { number, message, urlMedia } = req.body;
    await bot.sendMessage(number, message, { media: urlMedia ?? null });
    return res.end('sended');
  })
);
```

Ejemplo: rutas REST en controladores (crear `src/controllers/campaigns.js`)

```js
// src/controllers/campaigns.js (skeleton)
const { authJwt } = require('../middleware/authJwt');
const { rbac } = require('../middleware/rbac');

async function createCampaign(bot, req, res) {
  const payload = req.body;
  // lógica para crear campaña...
  res.status(201).json({ ok: true, payload });
}

module.exports = {
  createCampaign,
};

// Registro de ruta en app principal:
adapterProvider.server.post(
  '/v1/campaigns',
  authJwt({ required: true }),
  rbac(['campaign:create']),
  handleCtx(createCampaign)
);
```

Notas operativas
- Tokens: incluya header `Authorization: Bearer <token>`. Ejemplo curl:
  curl -H "Authorization: Bearer <TOKEN>" -X POST https://host/v1/campaigns -d '{"name":"x"}' -H 'Content-Type: application/json'
- Los permisos pueden provenir del token (`permissions` claim) o consultarse en DB por `role_id`.
- TTL de cache L1 por defecto: 30s (configurable en [`src/auxiliares/roleCache.js`](src/auxiliares/roleCache.js:1)).
- Manejo de errores: middlewares devuelven 401 (missing/invalid token) o 403 (forbidden).
- Para admins con MFA: usar campo `mfa_enabled` del modelo `Usuarios` (migración incluida); la implementación del flujo MFA queda como placeholder.

Testing
- Tests sugeridos con `supertest`:
  - Sin token -> 401
  - Token inválido -> 401
  - Token válido sin permisos -> 403
  - Token válido con permisos -> 200/201

Referencias rápidas
- Middlewares: [`src/middleware/authJwt.js`](src/middleware/authJwt.js:1), [`src/middleware/rbac.js`](src/middleware/rbac.js:1)
- Cache: [`src/auxiliares/roleCache.js`](src/auxiliares/roleCache.js:1)
- Migración MFA: [`src/database/migrations/20251229-06-add-mfa-to-usuarios.cjs`](src/database/migrations/20251229-06-add-mfa-to-usuarios.cjs:1)
