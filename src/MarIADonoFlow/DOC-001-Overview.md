Overview del Proyecto MarIADonoFlow
MarIADonoFlow es un sistema de gestión de flujos de trabajo de desarrollo de software diseñado para ser legible por humanos y, al mismo tiempo, robusto y procesable por sistemas automatizados e inteligencia artificial. Su objetivo principal es documentar y rastrear el ciclo de vida completo de una unidad de trabajo (un "Ítem de Trabajo", como una nueva funcionalidad, un bug o una tarea técnica) desde su concepción hasta su finalización.
---
id: "DOC-001"
title: "Redactar un overview del proyecto MarIADonoFlow"
status: "Terminado"
assignee: "gemini@example.com"
priority: "Media"
itemType: "Tarea Técnica"
creationDate: "2024-05-24T10:00:00Z"
estimation: 1 # Story Points
requester: "user@example.com"
tags:
  - "documentation"
  - "onboarding"
  - "MarIADonoFlow"
---

Filosofía Principal: Markdown-First, Validado por Sistema
El sistema se basa en una arquitectura híbrida que combina la simplicidad de Markdown con la rigurosidad de la validación de datos:
## Etapa 1: Definición

Capa Humana (Markdown-First): Los miembros del equipo interactúan exclusivamente con archivos Markdown (.md). Este formato fue elegido por su alta legibilidad y facilidad de escritura, lo que reduce la fricción y fomenta la colaboración.
Capa de Sistema (Validación por XML/XSD): Aunque los humanos trabajan con Markdown, el sistema está diseñado para convertir estos archivos en un formato XML estructurado en segundo plano. Este XML se valida contra un esquema formal (XSD) para garantizar la integridad, consistencia y fiabilidad de los datos antes de ser consumido por otros sistemas (bases de datos, paneles de control, IA).
El Ciclo de Vida del Desarrollo: Las 5 Etapas
El núcleo del flujo de trabajo es un proceso de cinco etapas bien definidas que guían un "Ítem de Trabajo" desde la idea hasta el software funcional.
### Descripción

## Etapa 1: Ítem de Trabajo (Definición / PLAN)
Como usuario del sistema, quiero un resumen general (overview) del proyecto MarIADonoFlow para entender rápidamente su propósito, estructura y componentes principales.

Objetivo: Definir el "Qué" y el "Por qué".
Campos Clave: Historia de Usuario, Pasos para Reproducir (si es un bug), y los Criterios de Aceptación (el "contrato" de lo que significa "terminado").

## Etapa 2: Diseño (DISENO)
### Criterios de Aceptación

Objetivo: Crear el plano técnico del "Cómo".
Campos Clave: Solución Técnica Propuesta, Artefactos de Diseño (links a Figma, diagramas), y Análisis de Impacto.
## Etapa 3: Plan de Implementación (IMP)
- [ ] El overview debe describir el propósito principal de MarIADonoFlow.
- [ ] Debe explicar la filosofía "Markdown-First, Validado por Sistema".
- [ ] Debe listar y describir las 5 etapas del ciclo de vida del desarrollo.
- [ ] Debe mencionar la organización de archivos y la estructura del documento de trabajo.
- [ ] El resultado debe ser un resumen claro, conciso y fácil de entender.

Objetivo: Desglosar el diseño en tareas técnicas accionables.
Campos Clave: Una lista o tabla de Sub-Tareas, cada una con su responsable y estado.
Etapa 4: Desarrollo
## Etapa 2: Diseño

Objetivo: Rastrear la construcción del código.
Campos Clave: Nombre de la Rama (Branch) en Git y el link al Pull Request (PR).
Etapa 5: Revisión (REV)
### Solución Técnica Propuesta

Objetivo: Verificar que el resultado cumple con los Criterios de Aceptación de la Etapa 1.
Campos Clave: Resultados de Pruebas (checklist de los criterios), Ambiente de Pruebas y Notas de QA.
Organización y Estructura de Archivos
El sistema propone una organización mixta para mantener el orden y el contexto:
Analizar los documentos de contexto proporcionados (`Estructura de Ítem de Trabajo...`, `campos.md`, `proceso.md`, `carpetas.md`) para extraer los conceptos clave. Estructurar la información de manera lógica, comenzando con una introducción general y luego detallando los componentes específicos del flujo de trabajo en secciones claras.

Carpetas por Tema: Cada mejora o módulo principal tiene su propia carpeta (ej. mejora_frontend_horarios/).
Nomenclatura de Archivos: Dentro de cada carpeta, los archivos se nombran con un prefijo de fase y la fecha, asegurando un orden cronológico (ej. PLAN-2025-09-13.md, DISENO-2025-09-15.md).
Estructura del Documento de Trabajo
Cada archivo .md está estructurado para ser fácilmente analizado:

### Análisis de Impacto

La creación de este documento facilitará el onboarding de nuevos miembros al equipo y servirá como una referencia rápida y centralizada del proyecto. No tiene impacto técnico en el sistema.

## Etapa 3: Plan de Implementación

### Sub-Tareas

| Tarea                                         | Responsable        | Estado    |
| :-------------------------------------------- | :----------------- | :-------- |
| Leer y comprender la documentación del proyecto | gemini@example.com | Terminado |
| Sintetizar la filosofía y objetivos           | gemini@example.com | Terminado |
| Describir el ciclo de vida de 5 etapas        | gemini@example.com | Terminado |
| Explicar la estructura de archivos y docs     | gemini@example.com | Terminado |
| Redactar el texto final del overview          | gemini@example.com | Terminado |

### Dependencias

*   Ninguna.

## Etapa 4: Desarrollo

### Rama (Branch)

`N/A (Tarea realizada por IA en sesión)`

### Pull Request (PR) / Merge Request (MR)

`N/A`

## Etapa 5: Revisión

### Resultados de Pruebas

- [x] El overview describe el propósito principal de MarIADonoFlow.
- [x] Explica la filosofía "Markdown-First, Validado por Sistema".
- [x] Lista y describe las 5 etapas del ciclo de vida del desarrollo.
- [x] Menciona la organización de archivos y la estructura del documento de trabajo.
- [x] El resultado es un resumen claro, conciso y fácil de entender.

### Ambiente de Pruebas

`N/A`

### Notas de QA

El documento generado cumple con todos los requisitos del prompt inicial. La estructura es lógica y el contenido es preciso según la documentación de origen.

### Versión Aprobada (Build)

`N/A`