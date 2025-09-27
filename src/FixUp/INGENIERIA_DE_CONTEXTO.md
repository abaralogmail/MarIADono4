# Ingenieria de Contexto
**Overview del Proyecto**

Este documento describe un sistema de gestión de flujos de trabajo diseñado para facilitar la construcción de proyectos en colaboración con IA para cualquier persona. No requiere conocimientos técnicos y, al mismo tiempo, es robusto y procesable por sistemas automatizados e inteligencia artificial. Cada etapa del plan es el prompt de la siguiente etapa. Su objetivo principal es proveer la información necesaria para que la inteligencia artificial pueda dar la solución correcta, pasando cada etapa del ítem de trabajo a la IA para realizar la próxima etapa. Si el resultado de la próxima etapa es incorrecto, quiere decir que la etapa anterior no está bien definida. Así queda documentado y rastreado el ciclo de vida completo de una unidad de trabajo (un "Ítem de Trabajo", como un proyecto, una nueva funcionalidad, un bug o una tarea técnica) desde su concepción hasta su finalización. Esto se traduce en una ingeniería de contexto, ya que el proceso se basa únicamente en la documentación, sin necesidad de profundizar en las vicisitudes del desarrollo de código.

## **Las 5 etapas del ciclo de vida del desarrollo.**

### **Etapa 1: Ítem de Trabajo (Definición / PLAN)**

- **Objetivo:** Definir el "Qué" y el "Por qué".
- **Campos Clave:** Historia de Usuario, Pasos para Reproducir (si es un bug), y los Criterios de Aceptación (el "contrato" de lo que significa "terminado").

### **Etapa 2: Diseño (DISENO)**

- **Objetivo:** Crear el plano técnico del "Cómo".
- **Campos Clave:** Solución Técnica Propuesta, Artefactos de Diseño (links , diagramas), y Análisis de Impacto.

### **Etapa 3: Guía de Implementación (IMP)**

- **Objetivo:** Desglosar el diseño en tareas técnicas accionables.
- **Campos Clave:** Una lista o tabla de Sub-Tareas, cada una con su responsable y estado.

### **Etapa 4: Desarrollo**

- **Objetivo:** Rastrear la construcción del código.
- **Campos Clave:** Nombre de la Rama (Branch) en Git y el link al Pull Request (PR).

### **Etapa 5: Revisión (REV)**

- **Objetivo:** Verificar que el resultado cumple con los Criterios de Aceptación de la Etapa 1.
- **Campos Clave:** Resultados de Pruebas (checklist de los criterios), Ambiente de Pruebas y Notas de QA.

## **Organización y Estructura de Archivos**

El sistema propone una organización mixta para mantener el orden y el contexto:

- **Carpetas por Tema:** Cada mejora o módulo principal tiene su propia carpeta (ej. mejora_xxxx/).
- **Nomenclatura de Archivos:** Dentro de cada carpeta, los archivos se nombran con un prefijo de fase y la fecha, asegurando un orden cronológico (ej. XXXX-PLAN-YYYY-MM-DD.md, XXXX-DISENO-YYYY-MM-DD.md).