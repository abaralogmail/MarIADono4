El "Ítem de Trabajo" es el objeto principal (el ticket), y este objeto debe tener campos globales que lo acompañan siempre, y campos específicos que se rellenan en cada etapa de tu flujo.

Aquí tienes un desglose de los campos clave que cada etapa (definida por ti) debe gestionar:

A. Campos Globales (Presentes en TODAS las etapas) Estos campos viven en el "Ítem de Trabajo" desde su creación hasta su cierre:

ID (Identificador Único): (Ej: TSK-101). Es el "número de caso" para rastrearlo.

Título: La descripción corta. (Ej: "Botón de exportar a PDF").

Estado (Status): El campo más importante. Indica en cuál de tus 5 etapas se encuentra actualmente. (Ej: Nuevo → En Diseño → Listo para Desarrollo → En Desarrollo → En Revisión → Terminado).

Responsable (Asignado): ¿Quién tiene la "pelota" en este momento? (Puede cambiar en cada etapa).

Prioridad: (Ej: Alta, Media, Baja).

Tipo de Ítem: (El campo que definimos: Feature, Issue/Bug, Tarea Técnica).

Fecha de Creación: Cuándo nació el ítem.

B. Campos por Etapa (Lo que se rellena en cada fase) Estos son los campos que tu equipo debe completar para poder mover el ítem a la siguiente etapa de tu flujo.

Etapa 1: Ítem de Trabajo (Definición/Backlog) El objetivo aquí es definir el "Qué" y el "Por qué" sin ambigüedad.

Descripción (Cuerpo):

Si es Feature: La "Historia de Usuario" (Como [rol], quiero [objetivo], para [valor]).

Si es Issue/Bug: Pasos para Reproducir, Comportamiento Esperado, Comportamiento Actual.

Criterios de Aceptación (¡El campo más crítico!): Una lista (checklist) que define EXACTAMENTE qué significa "terminado". Es el "contrato" que usará la Etapa 5 (Revisión) para aprobar o rechazar el trabajo.

Solicitante (Reportado por): ¿Quién pidió esto?

Estimación (Opcional pero recomendado): ¿Qué tan grande es esto? (Ej: Story Points, Tallas de camiseta, Horas).

Etapa 2: Diseño El objetivo es crear el "plano" (el "Cómo" técnico).

Solución Técnica Propuesta: Un texto explicando cómo se va a resolver (la arquitectura).

Artefactos de Diseño (Adjuntos/Links): Este es el campo clave. No es solo texto, son los entregables del diseño. (Ej: Links a diagramas de base de datos, diseños de Figma, especificaciones de API, etc.).

Análisis de Impacto: ¿Qué otras partes del sistema afecta este cambio?

Etapa 3: Plan de Implementación El objetivo es desglosar el "Diseño" en tareas accionables (las "Tareas").

Sub-Tareas (o Lista de Tareas): Este es el campo principal. Es una relación 1-a-Muchos. Tu "Ítem de Trabajo" (la Feature) ahora se divide en "mini-ítems" (las tareas técnicas que listamos antes, como "Crear API", "Crear UI", etc.). Cada sub-tarea tendrá su propio responsable y estado (pendiente/terminada).

Dependencias: ¿Este ítem depende de que otro ítem se termine primero?

Etapa 4: Desarrollo El objetivo es rastrear el "Hacer" (la construcción del código).

Rama (Branch): (Campo de texto/link) El nombre de la rama en el repositorio de código (Ej: Git) donde este código se está escribiendo. (Fundamental para la trazabilidad).

Pull Request (PR) / Merge Request (MR): Un link directo al PR. Este es el indicador de que el desarrollador cree que terminó, y el código está listo para ser revisado (por pares) y fusionado.

Etapa 5: Revisión El objetivo es "Verificar" que el código cumple con la Etapa 1.

Resultados de Pruebas (Checklist): El equipo de QA (o quien revise) debe tomar los "Criterios de Aceptación" (de la Etapa 1) y marcarlos uno por uno (Pasó / No Pasó).

Ambiente de Pruebas: ¿Dónde se probó esto? (Ej: "Servidor de QA", "Staging").

Notas de QA: (Campo de texto) Cualquier comentario, o evidencia (screenshots) de que las pruebas pasaron o fallaron.

Versión Aprobada (Build): (Si aplica) En qué versión del software se incluirá este cambio.