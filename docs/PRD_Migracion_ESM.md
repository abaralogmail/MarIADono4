# Product Requirements Document (PRD)

## Título
Migración del Proyecto a ESM (ECMAScript Modules) Puro

---

## 1. Resumen Ejecutivo
Este documento define el alcance, objetivos, criterios de éxito y plan de alto nivel para migrar el código base del proyecto **MarIADono** de un modelo mixto *CommonJS ↔ ESM* a un entorno **100 % ESM** compatible con Node 20 o superior. La migración permitirá un código más moderno, mejoras de rendimiento y una base de código coherente, facilitando futuras integraciones y mantenimiento.

---

## 2. Objetivos y Métricas de Éxito
| # | Objetivo | Métrica | Objetivo Numérico |
|---|----------|---------|-------------------|
| 1 | Eliminar dependencias `require`/`module.exports` | % de archivos convertidos | ≥ 99 % |
| 2 | Arranque sin flags de compatibilidad (`--experimental-specifier-resolution`) | Nº de flags en producción | 0 |
| 3 | Pasar suite de pruebas existente | % tests verdes | 100 % |
| 4 | Mantener cobertura de código | Cobertura global | ≥ 95 % |
| 5 | Sin regresiones funcionales en flujos WhatsApp | Incidentes en QA | 0 |

---

## 3. Alcance
### Incluido
1. Refactor de todos los archivos **backend** dentro del monorrepositorio.
2. Actualización de scripts *dev* y *prod* (`nodemon`, `pm2`, `docker`).
3. Adaptación de herramientas de linting y testing a ESM.
4. Conversión o sustitución de dependencias **CommonJS-only**.
5. Documentación y actualización de README.

### Excluido
- Refactor de código front-end (si aplica).
- Cambios de funcionalidad que no estén relacionados con la migración.

---

## 4. Stakeholders
| Rol | Nombre | Responsabilidad |
|-----|--------|-----------------|
| Sponsor | CTO | Priorizar y aprobar presupuesto |
| Líder Técnico | @devLead | Diseñar la estrategia de migración |
| Equipo Backend | Squad A | Implementación y QA |
| DevOps | @devops | Actualizar CI/CD y contenedores |
| QA | @qaLead | Validación y pruebas de regresión |

---

## 5. Requisitos Funcionales
1. **RF-1**: Todo el código fuente debe usar `import`/`export`.
2. **RF-2**: El proyecto debe iniciarse con `node app.js` sin errores de resolución de módulos.
3. **RF-3**: Los scripts de `package.json` deben funcionar tanto en Windows como en Docker.
4. **RF-4**: Los flujos existentes de WhatsApp y endpoints REST deben comportarse igual que antes.

## 6. Requisitos No Funcionales
1. **RNF-1**: Compatibilidad con Node 20 LTS y Node 18 (opcional, fallback).
2. **RNF-2**: Mantener o mejorar tiempos de arranque (< 1 s en entorno local).
3. **RNF-3**: Cobertura de pruebas ≥ 95 % tras la migración.
4. **RNF-4**: CI/CD debe ejecutar pruebas en Node 18 y 20.

---

## 7. Plan de Implementación (High-Level)
Las fases detalladas se basan en `docs/migration-esm-plan.md`.

1. **Auditoría Inicial**  
   • Ejecutar script para listar archivos `require` / `module.exports`.  
   • Identificar dependencias CommonJS.
2. **Configuración del Entorno ESM**  
   • Mantener `"type": "module"`.  
   • Actualizar ESLint.
3. **Refactor de Código**  
   • Carpeta `src/` (submódulos por lote).  
   • Tests y scripts.
4. **Gestión de Dependencias CJS**  
   • Buscar alternativas ESM.  
   • Documentar deudas técnicas.
5. **CI/CD y Docker**  
   • Actualizar pipelines, `Dockerfile`, `ecosystem.config`.
6. **QA y Validación**  
   • Ejecutar suites de pruebas.  
   • Pruebas manuales de flujos críticos.
7. **Despliegue Gradual**  
   • Canary en staging.  
   • Rollout a producción.

---

## 8. Cronograma Tentativo
| Fase | Fecha Inicio | Fecha Fin | Duración |
|------|--------------|-----------|----------|
| Auditoría Inicial | 02-Ene | 05-Ene | 3 d |
| Configuración Entorno | 06-Ene | 08-Ene | 3 d |
| Refactor Código | 09-Ene | 23-Ene | 10 d hábiles |
| Dependencias CJS | 24-Ene | 30-Ene | 5 d |
| CI/CD & Docker | 31-Ene | 04-Feb | 3 d |
| QA & Validación | 05-Feb | 11-Feb | 5 d |
| Despliegue | 12-Feb | 14-Feb | 2 d |

---

## 9. Riesgos y Mitigaciones
| Riesgo | Impacto | Prob. | Mitigación |
|--------|---------|-------|------------|
| Dependencia CJS sin versión ESM | Alto | Media | Import dinámico + registrar deuda técnica |
| Regresiones en flujos WhatsApp | Alto | Media | Casos de prueba E2E automáticos |
| Incompatibilidad con PM2 | Medio | Baja | Usar `ecosystem.config.mjs` + pruebas |
| Overhead de aprendizaje del equipo | Medio | Media | Workshops internos y pair-programming |

---

## 10. Criterios de Aceptación
1. Todos los tests pasan en Node 20 sin flags.
2. Pipelines CI verde en Node 18 & 20.
3. Scripts `npm run dev` y `npm start` funcionan sin cambios adicionales.
4. Pruebas de regresión en staging sin incidencias.
5. Documentación actualizada (README, guía de despliegue, docs/migration-esm-plan.md).

---

## 11. Aprobación
| Nombre | Rol | Firma | Fecha |
|--------|-----|-------|-------|
| | Sponsor | | |
| | Líder Técnico | | |
| | QA Lead | | |
