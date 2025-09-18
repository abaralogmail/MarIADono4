# 📂 Organización mixta con ID (Tema/Proyecto + Fase + Fecha + ID)

Este modelo combina tres niveles de trazabilidad:
- Carpeta por tema/proyecto, identificada por el ID del ítem de trabajo principal.
- Archivos con prefijo de fase y fecha, también identificados por el mismo ID (o el específico de cada subtarea).
- Referencias internas entre fases/archivos para mantener el hilo de decisiones.

---

## 🧭 Convenciones de nomenclatura

- Carpeta por tema/proyecto: {ID_PRINCIPAL}_{tema_en_snake_case}/
  - Ej.: HORA-123_mejora_frontend_horarios/
- Archivos dentro de la carpeta: {ID_DE_TRABAJO}_{FASE}-{YYYY-MM-DD}.md
  - FASE ∈ {PLAN, DISENO, IMP, REV}
  - Ej.: HORA-123_PLAN-2025-09-13.md

### Reglas
- ID: use el identificador del sistema de gestión (Jira, Linear, etc.). Formato recomendado: letras mayúsculas, números y guion medio (ej.: ABC-42).
- Tema en snake_case, en español claro: palabras en minúscula separadas por guiones bajos.
- Fechas ISO (YYYY-MM-DD) para orden cronológico consistente.
- Un solo tema por carpeta. Si una iniciativa se descompone en varias subtareas:
  - Mantener la carpeta con el ID principal (epic/feature).
  - Cada archivo puede llevar su propio ID si corresponde a una subtarea distinta.

---

## 🔎 Ejemplo aplicado a “Frontend de horarios automáticos”

```plaintext
/workflow/
│
├── HORA-123_mejora_frontend_horarios/
│   ├── HORA-123_PLAN-2025-09-13.md
│   ├── HORA-123_DISENO-2025-09-15.md
│   ├── HORA-123_IMP-2025-09-20.md
│   └── HORA-123_REV-2025-09-25.md
│
├── OA-456_integracion_openai/
│   ├── OA-456_PLAN-2025-10-01.md
│   ├── OA-456_DISENO-2025-10-05.md
│   ├── OA-456_IMP-2025-10-08.md
│   └── OA-456_REV-2025-10-10.md
│
└── BULK-789_modulo_bulk_messaging/
    ├── BULK-789_PLAN-2025-10-12.md
    ├── BULK-789_DISENO-2025-10-14.md
    ├── BULK-789_IMP-2025-10-18.md
    └── BULK-789_REV-2025-10-20.md
```

---

## 🔗 Relación entre niveles

1. Por tema/proyecto → localizar todo lo de “frontend de horarios” en la carpeta HORA-123_mejora_frontend_horarios/.
2. Por nomenclatura → dentro de la carpeta, los archivos se ordenan por fase y fecha: PLAN → DISENO → IMP → REV.
3. Por referencias internas → al final de cada archivo, incluir una sección “Referencias” con vínculos y citas explícitas:
   - “Este diseño responde a HORA-123_PLAN-2025-09-13.”
   - “Esta implementación implementa OA-456_DISENO-2025-10-05.”

Así, la trazabilidad queda reforzada en tres niveles: carpeta → nombre → contenido.

---

## 🎯 Ventajas

- Contexto completo: cada mejora vive en su carpeta con su ID principal.
- Orden cronológico: las fechas en el nombre mantienen el flujo claro.
- Escalabilidad: decenas de proyectos activos sin perder claridad.
- Auditoría simple: ver el ciclo de vida completo abriendo una sola carpeta.
- Búsqueda rápida: buscar por ID (ej.: “HORA-123”) devuelve todos los artefactos relacionados.

---

## 📐 Guía para múltiples IDs y subtareas

- Un epic/feature con subtareas:
  - Carpeta: {ID_EPIC}_{tema}/
  - Archivos:
    - Si el documento aplica al epic completo, usar ID_EPIC (ej.: HORA-123_PLAN-...).
    - Si el documento pertenece a una subtarea, usar el ID de la subtarea (ej.: HORA-127_IMP-...).
- Si no existe un ID principal:
  - Definir uno (por ejemplo, el epic) antes de crear la carpeta.
  - Excepción temporal: usar un placeholder PEND-XXX_{tema}/ y reemplazar cuando exista el ID definitivo.

Ejemplo mixto con subtareas:
```plaintext
HORA-123_mejora_frontend_horarios/
├── HORA-123_PLAN-2025-09-13.md
├── HORA-124_DISENO-2025-09-16.md   (subtarea de diseño)
└── HORA-127_IMP-2025-09-22.md      (subtarea de implementación)
```

---

## ✍️ Plantilla sugerida para archivos

Inicio del archivo:
- Título descriptivo.
- Metadatos mínimos: ID, Fase, Fecha, Autor, Estado (Draft/Final).
- Resumen de una línea.

Sección final “Referencias”:
- Antecedentes: “Responde a {ID}_PLAN-YYYY-MM-DD”
- Dependencias: “Depende de {ID}_DISENO-YYYY-MM-DD”
- Enlaces a PRs/issues: “Implementado en PR #123 (repo X)”

---

## ✅ Checklist rápido antes de crear algo nuevo

- ¿Ya existe el ID? Si no, créalo en el sistema de trabajo.
- ¿La carpeta usa {ID}_{tema_snake}? 
- ¿El archivo usa {ID}_{FASE}-{YYYY-MM-DD}.md?
- ¿Se agregó la sección “Referencias” al final?
- ¿El título y el resumen describen el propósito en una línea?

---

## 🔄 Migración/renombrado (opcional)

- Renombrar carpetas existentes añadiendo el ID principal al inicio.
- Renombrar archivos existentes añadiendo el ID al inicio y verificando la fase/fecha.
- Actualizar enlaces internos si hay referencias cruzadas.

Ejemplo de pauta de renombre:
- De: mejora_frontend_horarios/ → A: HORA-123_mejora_frontend_horarios/
- De: DISENO-2025-09-15.md → A: HORA-123_DISENO-2025-09-15.md

---

## 🧪 Ejemplo de lectura para un nuevo integrante

Al abrir /workflow/ debería poder responder de inmediato:
- Qué temas hay en curso (por nombre de carpeta).
- Qué fase completó cada tema (por archivos presentes).
- Dónde está el historial y decisiones (por referencias y fechas).