Overview del Proyecto MarIADonoFlow
MarIADonoFlow es un sistema de gestión de flujos de trabajo de desarrollo de software diseñado para ser legible por humanos y, al mismo tiempo, robusto y procesable por sistemas automatizados e inteligencia artificial. Su objetivo principal es documentar y rastrear el ciclo de vida completo de una unidad de trabajo (un "Ítem de Trabajo", como una nueva funcionalidad, un bug o una tarea técnica) desde su concepción hasta su finalización.

Filosofía Principal: Markdown-First, Validado por Sistema
El sistema se basa en una arquitectura híbrida que combina la simplicidad de Markdown con la rigurosidad de la validación de datos:

Capa Humana (Markdown-First): Los miembros del equipo interactúan exclusivamente con archivos Markdown (.md). Este formato fue elegido por su alta legibilidad y facilidad de escritura, lo que reduce la fricción y fomenta la colaboración.
Capa de Sistema (Validación por XML/XSD): Aunque los humanos trabajan con Markdown, el sistema está diseñado para convertir estos archivos en un formato XML estructurado en segundo plano. Este XML se valida contra un esquema formal (XSD) para garantizar la integridad, consistencia y fiabilidad de los datos antes de ser consumido por otros sistemas (bases de datos, paneles de control, IA).
El Ciclo de Vida del Desarrollo: Las 5 Etapas
El núcleo del flujo de trabajo es un proceso de cinco etapas bien definidas que guían un "Ítem de Trabajo" desde la idea hasta el software funcional.

Etapa 1: Ítem de Trabajo (Definición / PLAN)

Objetivo: Definir el "Qué" y el "Por qué".
Campos Clave: Historia de Usuario, Pasos para Reproducir (si es un bug), y los Criterios de Aceptación (el "contrato" de lo que significa "terminado").
Etapa 2: Diseño (DISENO)

Objetivo: Crear el plano técnico del "Cómo".
Campos Clave: Solución Técnica Propuesta, Artefactos de Diseño (links a Figma, diagramas), y Análisis de Impacto.
Etapa 3: Plan de Implementación (IMP)

Objetivo: Desglosar el diseño en tareas técnicas accionables.
Campos Clave: Una lista o tabla de Sub-Tareas, cada una con su responsable y estado.
Etapa 4: Desarrollo

Objetivo: Rastrear la construcción del código.
Campos Clave: Nombre de la Rama (Branch) en Git y el link al Pull Request (PR).
Etapa 5: Revisión (REV)

Objetivo: Verificar que el resultado cumple con los Criterios de Aceptación de la Etapa 1.
Campos Clave: Resultados de Pruebas (checklist de los criterios), Ambiente de Pruebas y Notas de QA.
Organización y Estructura de Archivos
El sistema propone una organización mixta para mantener el orden y el contexto:

Carpetas por Tema: Cada mejora o módulo principal tiene su propia carpeta (ej. mejora_frontend_horarios/).
Nomenclatura de Archivos: Dentro de cada carpeta, los archivos se nombran con un prefijo de fase y la fecha, asegurando un orden cronológico (ej. PLAN-2025-09-13.md, DISENO-2025-09-15.md).
Estructura del Documento de Trabajo
Cada archivo .md está estructurado para ser fácilmente analizado:

Metadatos Globales (YAML Front Matter): La cabecera del archivo contiene los campos globales en formato YAML, como id, title, status, assignee, priority, etc. Esto permite a los sistemas obtener un resumen rápido del estado del ítem sin procesar todo el documento.
Cuerpo del Documento (Markdown Estructurado): El resto del archivo utiliza encabezados de Markdown (##, ###) para delimitar claramente la información de cada etapa, y formatos específicos como checklists (- [ ]) para los criterios de aceptación o tablas para las sub-tareas.
En resumen, MarIADonoFlow es un sistema de flujo de trabajo metódico y bien documentado que equilibra la necesidad de una colaboración humana ágil con los requisitos de integridad de datos y automatización de los sistemas modernos, preparándolo para aplicaciones avanzadas de IA como el análisis predictivo y la búsqueda semántica.
