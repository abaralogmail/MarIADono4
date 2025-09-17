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

