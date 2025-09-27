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

# 📂 Organización Mixta (Nomenclatura + Tema)

En lugar de elegir solo un criterio, se combinan ambos:

* **Carpetas por tema/proyecto** → encapsulan cada mejora o módulo (ej. “mejora\_frontend\_horarios”).
* **Nombres de archivos con prefijos de fase (PLAN, DISENO, IMP, REV)** + fecha → mantienen orden cronológico dentro de la carpeta.

---

## 🔎 Ejemplo aplicado a *Frontend de horarios automáticos*

```plaintext
/workflow/
│
├── mejora_frontend_horarios/
│   ├── PLAN-2025-09-13.md
│   ├── DISENO-2025-09-15.md
│   ├── IMP-2025-09-20.md
│   └── REV-2025-09-25.md
│
├── integracion_openai/
│   ├── PLAN-2025-10-01.md
│   ├── DISENO-2025-10-05.md
│   ├── IMP-2025-10-08.md
│   └── REV-2025-10-10.md
│
└── modulo_bulk_messaging/
    ├── PLAN-2025-10-12.md
    ├── DISENO-2025-10-14.md
    ├── IMP-2025-10-18.md
    └── REV-2025-10-20.md
```

---

## 🔗 Cómo se relaciona

1. **Por tema** → si buscás todo sobre “frontend de horarios”, vas directo a la carpeta `mejora_frontend_horarios/`.
2. **Por nomenclatura** → dentro de la carpeta, los archivos están ordenados por fase y fecha (`PLAN`, `DISENO`, `IMP`, `REV`).
3. **Por referencias internas** → dentro de cada archivo, podés escribir al final:

   * “Este diseño se vincula con PLAN-2025-09-13”.
   * “Esta implementación responde a DISENO-2025-09-15”.

Así, la trazabilidad está reforzada en **tres niveles**: carpeta → nombre → contenido.

---

## 🎯 Ventajas de esta organización

* **Contexto completo**: cada mejora vive en su carpeta.
* **Orden cronológico**: dentro de cada carpeta, los nombres mantienen el flujo de fases.
* **Escalabilidad**: podés tener decenas de proyectos activos, cada uno en su espacio.
* **Auditoría simple**: en un año, abrís la carpeta de cualquier tema y ves toda la historia del ciclo de vida.

---

👉 Con este modelo, un nuevo integrante del equipo abre `/workflow/` y entiende enseguida:

* Qué temas hay en curso.
* Qué fase completó cada tema.
* Cuál fue el recorrido de decisiones y revisiones.

Has creado la secuencia perfecta. Este flujo que acabas de definir:
Ítem de trabajo \rightarrow Diseño \rightarrow Plan de Implementación \rightarrow Desarrollo \rightarrow Revisión
Es exactamente el ciclo de vida de una sola característica (el "átomo" de la producción de software) en cualquier metodología moderna y funcional.
Tu secuencia es lógica, robusta y es la base de la mayoría de los equipos de alto rendimiento. Has creado un "micro-proceso" excelente.
Ahora, unamos cada etapa y explayémonos en cómo funciona este flujo en la práctica.
El Flujo Detallado: El Ciclo de Vida de tu Ítem de Trabajo
Este proceso toma una "idea" (el ítem) y la transforma en "software funcional verificado".
1. Ítem de Trabajo (El "Qué" Queremos)
Esta es la puerta de entrada a todo tu proceso. Como definimos, este "Elemento de Trabajo" puede ser:
 * Una Feature (Historia de Usuario): Algo nuevo que aporta valor. (Ej: "Como usuario, quiero un botón para exportar mi reporte a PDF").
 * Un Issue (Bug): Algo roto que hay que arreglar. (Ej: "La exportación a PDF no funciona en el navegador Safari").
 * Una Tarea Técnica (Deuda): Algo que hay que hacer "debajo del capó" que el usuario no ve. (Ej: "Actualizar la librería que genera los PDF a la versión 3.0").
Unión (Conexión): Este ítem es el requisito y el ancla. Define el "alcance" de todo lo que sigue. No se puede diseñar (etapa 2) si no se sabe qué se va a diseñar.
2. Diseño (El "Cómo" lo Haremos)
Una vez que el equipo entiende el "Qué" (el Ítem), necesitan definir el "Cómo" técnico.
 * Si es una Feature (PDF): El Diseño define los planos. ¿Cómo se verá el botón (Diseño UX/UI)? ¿Qué arquitectura usaremos? ¿Qué datos tomará el PDF? ¿El proceso será inmediato o se enviará por email?
 * Si es un Issue (Bug): El Diseño aquí es el diagnóstico o "análisis de causa raíz". El desarrollador investiga por qué falla en Safari. La "solución de diseño" podría ser: "El problema es que Safari no soporta la fuente X; la solución es usar la fuente Y".
Unión: El Diseño toma la "demanda" (Ítem) y la convierte en una especificación técnica (un plano). Este plano es la entrada obligatoria para la siguiente etapa.
3. Plan de Implementación (Las "Tareas" Específicas)
Esta es una etapa crucial que muchos equipos omiten (para su desgracia). Tener un "Diseño" (un plano) es genial, pero ahora necesitas un "Manual de Construcción".
Esta etapa toma el Diseño (el "Cómo" conceptual) y lo desglosa en una lista de tareas técnicas accionables que deben realizarse para construirlo.
Siguiendo el ejemplo del PDF:
 * Tarea 1: Maquetar el botón "Exportar PDF" en la interfaz (Front-End).
 * Tarea 2: Crear el API (Back-End) que reciba la solicitud de exportación.
 * Tarea 3: Escribir la lógica que genera el archivo PDF en el servidor.
 * Tarea 4: Crear la prueba unitaria para el generador de PDF.
Unión: Este Plan convierte el Diseño (abstracto) en una check-list concreta (el Plan) que sirve como guía exacta para la siguiente fase.
4. Desarrollo (El "Hacer")
Esta es la fase de "construcción" pura. Es donde los programadores toman las tareas del "Plan de Implementación" (etapa 3) y escriben el código.
Siguen el Diseño (etapa 2) como un mapa y usan el Plan (etapa 3) como su lista de tareas. Esta es la etapa donde el concepto se vuelve tangible (código).
Unión: Esta fase toma el "Plan" y produce software (código funcional). El resultado (el output) de esta etapa es el producto listo para ser validado.
5. Revisión (El "Verificar")
Esta es la fase final y la más importante para garantizar la calidad. Recibe el código producido en "Desarrollo".
La Revisión tiene un solo objetivo: Confirmar que el software producido (etapa 4) cumple exacta y completamente con el "Ítem de Trabajo" original (etapa 1).
Esta fase (Revisión) incluye:
 * Control de Calidad (Testing/QA): Un tester (o el mismo desarrollador) prueba la funcionalidad. ¿El botón de PDF aparece? ¿El PDF se genera? ¿Funciona en Safari (si era un bug)?
 * Aceptación del Usuario (UAT): A veces (en Ágil), se le muestra al cliente/usuario para que confirme: "¿Es este el PDF que querías?".
Unión (El Cierre del Ciclo):
 * Si la Revisión PASA: ¡Éxito! El Ítem de Trabajo se marca como "Terminado" y el ciclo se cierra.
 * Si la Revisión FALLA: (Ej: "El PDF funciona, pero los números están mal"). El ciclo se rompe. Se debe crear un nuevo "Issue" (Bug) y ese nuevo ítem debe volver a entrar en la etapa 1 (o, a veces, se reabre el ítem original).
Resumen de tu Modelo:
Tu secuencia es el corazón de las metodologías Iterativas (como Ágil) y las que se basan en el flujo (como Kanban).
 * En Cascada (la corriente antigua): Hacen todas las etapas 1 y 2 para 500 ítems a la vez (durante 6 meses). Luego hacen la etapa 3 y 4 para esos 500 ítems (otros 6 meses). Y al final, hacen la etapa 5 para todo (últimos 3 meses).
 * En tu modelo (la corriente moderna): Tomas un solo Ítem de Trabajo y lo pasas por las 5 etapas lo más rápido posible (quizás en 3 días). Luego tomas el siguiente ítem y repites el ciclo.