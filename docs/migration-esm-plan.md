# Plan de Migración a ESM Puro

> Objetivo: eliminar la compatibilidad mixta CommonJS ⇄ ESM y mantener el proyecto 100 % módulos ECMAScript (Node 20 +).

## 1. Auditoría Inicial
- Listar archivos que usan `require` / `module.exports`.
- Detectar dependencias que solo exportan CommonJS.
- Revisar scripts de arranque, herramientas y pruebas.

## 2. Configuración del Entorno
- Mantener `"type": "module"` en `package.json`.
- Añadir campo `"exports"` si se publicará como paquete.
- Ajustar ESLint a `sourceType: 'module'`.

## 3. Refactor del Código
1. Sustituir `require()` por `import`.
2. Convertir `module.exports` a `export` / `export default`.
3. Reemplazar `__dirname` / `__filename`:
   ```js
   import { dirname } from 'path'
   import { fileURLToPath } from 'url'
   const __filename = fileURLToPath(import.meta.url)
   const __dirname  = dirname(__filename)
   ```
4. Eliminar usos temporales de `createRequire` (por ejemplo en `app.js`).

## 4. Dependencias CommonJS
- Buscar variantes ESM de cada paquete.
- Si no existe, importar con `import pkg from 'cjs-lib'` (Node 20 lo permite) y registrar como deuda técnica.

## 5. Scripts y Herramientas
- Convertir tests a ESM (`node --test`).
- Actualizar scripts en `package.json`.
- Nodemon/PM2: usar `node --experimental-specifier-resolution=node` si fuera necesario.

## 6. CI/CD
- Añadir lint + tests en Node 18 y 20.
- Ejecutar `node --conditions production` en producción.

## 7. Docker / PM2
- Cambiar `ecosystem.config.js` ➜ `ecosystem.config.mjs` o `.cjs`.
- Simplificar `Dockerfile`, eliminar compatibilidad Babel/TS innecesaria.

## 8. Validación
- Ejecutar pruebas automatizadas.
- Validar flujos de WhatsApp y endpoints REST.

## 9. Limpieza y Documentación
- Eliminar archivos `.cjs` temporales.
- Actualizar README con requisito "Node 20+ ESM".

## 10. Despliegue Gradual
1. Crear rama `migration-esm`.
2. Trabajar por carpetas (src/, tests/, tools/).
3. Deploy canary en entorno de staging.
4. Cuando pase QA, fusionar en `main`.

---
Este archivo sirve como guía de referencia durante toda la migración.
