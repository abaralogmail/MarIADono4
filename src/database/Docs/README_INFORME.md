# 📊 INFORME COMPLETO DE LA BASE DE DATOS - MARIADONO

> **Documentación integral de la base de datos SQLite del sistema MarIADono**

**Generado:** 28 de Diciembre de 2025  
**Versión:** 1.0  
**Estado:** ✅ Completo y Listo para Usar

---

## 🎯 ¿QUÉ ES ESTE INFORME?

Este es un **informe exhaustivo y profesional** que documenta completamente la base de datos del sistema MarIADono (bot conversacional con BuilderBot y Meta). Contiene:

- ✅ Estructura de 14 tablas con detalle completo
- ✅ Diagramas Entity-Relationship (ER)
- ✅ 50 consultas SQL de ejemplo
- ✅ Flujos de procesamiento de datos
- ✅ Guía de operaciones CRUD
- ✅ Recomendaciones de seguridad
- ✅ Estrategia de backup
- ✅ Roadmap de mejoras
- ✅ Troubleshooting y FAQs

---

## 📁 DOCUMENTOS INCLUIDOS (6 ARCHIVOS)

```
📦 src/database/
│
├── 📄 ÍNDICE_MAESTRO.md ⭐ COMIENZA AQUÍ
│   └─ Navegación central, búsqueda por tema, guías por perfil
│
├── 📄 RESUMEN_EJECUTIVO.md (20 min)
│   └─ Quick reference para ejecutivos y managers
│
├── 📄 INFORME_BASE_DATOS_COMPLETO.md (90 min)
│   └─ Documentación detallada y exhaustiva
│
├── 📄 DIAGRAMAS_ER_DETALLADOS.md (30 min)
│   └─ Diagramas visuales y flujos de datos
│
├── 📄 QUERY_COOKBOOK.md (referencia)
│   └─ 50 queries SQL + ejemplos
│
└── 📄 DATABASE_MAINTENANCE_GUIDE.md (existente)
    └─ Guía de mantenimiento
```

---

## 🚀 INICIO RÁPIDO

### 👤 Si eres EJECUTIVO/PM (5-30 minutos)
1. Lee [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) completo
2. Consulta sección: "Módulos Funcionales"
3. Revisa: "Roadmap Recomendado"

### 👨‍💻 Si eres DESARROLLADOR (30-60 minutos)
1. Lee [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) (25 min)
2. Usa [QUERY_COOKBOOK.md](QUERY_COOKBOOK.md) como referencia (5-10 min)
3. Consulta [DIAGRAMAS_ER_DETALLADOS.md](DIAGRAMAS_ER_DETALLADOS.md) (10 min)

### 🗄️ Si eres DBA (150+ minutos)
1. Lee [INFORME_BASE_DATOS_COMPLETO.md](INFORME_BASE_DATOS_COMPLETO.md) (90 min)
2. Estudia [DIAGRAMAS_ER_DETALLADOS.md](DIAGRAMAS_ER_DETALLADOS.md) (30 min)
3. Domina [QUERY_COOKBOOK.md](QUERY_COOKBOOK.md) (referencia)
4. Revisa recomendaciones de seguridad

### 📊 Si eres ANALISTA (45 minutos)
1. Lee tablas en [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) (5 min)
2. Consulta queries por tema en [QUERY_COOKBOOK.md](QUERY_COOKBOOK.md)
3. Estudia estructuras JSON en [DIAGRAMAS_ER_DETALLADOS.md](DIAGRAMAS_ER_DETALLADOS.md)

---

## 📚 CÓMO NAVEGAR

### Opción 1: Por Documento
```
¿Necesito info sobre...          Ir a
─────────────────────────────────────────────────────
Visión general                   → RESUMEN_EJECUTIVO.md
Tablas específicas               → INFORME_BASE_DATOS_COMPLETO.md
Relaciones entre tablas          → DIAGRAMAS_ER_DETALLADOS.md
Escritura de queries             → QUERY_COOKBOOK.md
Navegación & búsqueda            → ÍNDICE_MAESTRO.md
```

### Opción 2: Por Tema
- **Usuarios & Clientes:** § 10 en Informe + 8 queries en Cookbook
- **Conversaciones:** § 1 en Informe + 8 queries en Cookbook
- **Pedidos & Ventas:** § 8,9 en Informe + Flujo 3 en Diagramas
- **Horarios:** § 11-13 en Informe + Flujo 2 en Diagramas
- **Logs & Auditoría:** § 5,6,14 en Informe + queries en Cookbook
- **Métricas:** § 2,3 en Informe + queries en Cookbook

### Opción 3: Por Busca
→ Usa [ÍNDICE_MAESTRO.md](ÍNDICE_MAESTRO.md) § "Búsqueda Rápida por Tema"

---

## 🎯 CARACTERÍSTICAS PRINCIPALES

### 📊 Base de Datos
- **Tipo:** SQLite + Sequelize ORM
- **Tablas:** 14 modelos
- **Registros:** ~50k-500k (operación normal)
- **Tamaño:** 50-200 MB estimado
- **Persistencia:** Disco local (`src/database/data/MarIADono3DB.sqlite`)

### 🏗️ Módulos
1. **Usuarios & Conversaciones** (5 tablas)
2. **Ventas & Productos** (4 tablas)
3. **Horarios Polimórficos** (3 tablas)
4. **Logs & Monitoreo** (4 tablas)

### 🔧 Características
- ✅ Relaciones many-to-one configuradas
- ✅ Sistema de horarios flexible
- ✅ Timestamps automáticos
- ✅ JSON para datos flexibles
- ✅ Foreign keys activas
- ✅ Cascade delete en horarios

---

## 📊 TABLA RÁPIDA: 14 TABLAS

| # | Tabla | Tipo | Propósito | Registros |
|---|-------|------|----------|----------|
| 1 | conversations_log | Core | Historial de chats | ~50k |
| 2 | conversation_metricas | Analytics | Métricas de IA | ~50k |
| 3 | usuarios | Core | Base de clientes | ~500 |
| 4 | pedidos | Core | Órdenes | ~1k |
| 5 | productos | Core | Catálogo | ~500 |
| 6 | ofertas | Core | Promociones | ~100 |
| 7 | horarios | Config | Calendarios | ~20 |
| 8 | reglas_horario | Config | Franjas regulares | ~100 |
| 9 | excepciones_horario | Config | Excepciones (feriados) | ~100 |
| 10 | provider_logs | Logs | Logs de API Meta | ~100k |
| 11 | mensaje_estados | Logs | Estado de envíos | ~100k |
| 12 | ctx_logs | Logs | Context de sesiones | ~100k |
| 13 | n8n_metric | Integration | Métricas N8N | ~50k |
| 14 | (ver arriba) | - | - | - |

---

## 💡 EJEMPLOS RÁPIDOS

### Obtener conversaciones de un usuario
```javascript
import SqliteManager from './src/database/SqliteManager.js';
const db = await SqliteManager.getInstance();
const convs = await db.findConversationsByPhone('543812010781');
```

### Verificar disponibilidad del bot
```javascript
const disponible = await db.verificarDisponibilidad(
  'atencion_cliente',
  'BotAugustoTucuman'
);
console.log(disponible ? 'Disponible ✅' : 'Cerrado ❌');
```

### Consulta SQL
```javascript
const result = await db.query(`
  SELECT botName, COUNT(*) as mensajes
  FROM conversations_log
  WHERE date = date('now')
  GROUP BY botName
`);
```

### Ver todas las opciones
→ Ve a [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) § "Operaciones Comunes"  
→ O a [QUERY_COOKBOOK.md](QUERY_COOKBOOK.md)

---

## 🎓 CONTENIDO POR SECCIÓN

### INFORME_BASE_DATOS_COMPLETO.md (Principal)
```
1. Resumen Ejecutivo
2. Arquitectura y Configuración
3. Catálogo de 14 Tablas (con campos, tipos, usos)
4. Diagrama de Relaciones
5. Flujo de Datos (4 flujos principales)
6. Métodos y Operaciones (CRUD por tabla)
7. Análisis de Rendimiento
8. Seguridad y Backup
9. Recomendaciones (corto/medio/largo plazo)
10. Referencias Rápidas
```

### DIAGRAMAS_ER_DETALLADOS.md
```
1. Diagrama ER Completo (ASCII art)
2. 4 Módulos Funcionales
3. 3 Flujos de Procesamiento
4. Estructuras JSON Comunes
5. Vista de Consultas Frecuentes
6. Métricas de BD
```

### RESUMEN_EJECUTIVO.md
```
1. Información Crítica (ubicaciones, rutas)
2. Tabla Resumen de 14 Tablas
3. 4 Módulos Funcionales
4. Estado de Seguridad
5. Operaciones Comunes (código)
6. Decisiones de Diseño Clave
7. Roadmap de 4 Sprints
8. Métodos Más Usados
9. Troubleshooting Rápido
10. Checklist de Mantenimiento
```

### QUERY_COOKBOOK.md
```
1. Introducción
2. 50 Queries Categorizadas:
   • 8 de Usuarios
   • 8 de Conversaciones
   • 5 de Métricas
   • 8 de Pedidos & Productos
   • 7 de Horarios
   • 5 de Logs
   • 3 de N8N
   • 7 de Mantenimiento
3. Tips y Trucos
4. Advertencias Críticas
```

### ÍNDICE_MAESTRO.md
```
1. Mapa de Navegación
2. Lecturas por Perfil
3. Guía de Aprendizaje Progresivo
4. Búsqueda Rápida por Tema
5. Referencias Cruzadas
6. Glosario
7. Historial de Versiones
```

---

## 🔒 SEGURIDAD & BACKUP

### Estado Actual
- ✅ FK Constraints activas
- ✅ Timestamps automáticos
- ⚠️ Encriptación: NO
- ⚠️ Backup automático: NO
- ⚠️ Auditoría completa: NO

### Recomendaciones
1. Implementar backup diario
2. Agregar encriptación para números de teléfono
3. Crear tabla de auditoría
4. Definir política de retención

→ Ver detalles completos en [INFORME_BASE_DATOS_COMPLETO.md](INFORME_BASE_DATOS_COMPLETO.md) § 8

---

## 🚀 ROADMAP RECOMENDADO

### Sprint 1 (Semana 1-2)
- [ ] Crear índices faltantes
- [ ] Implementar backup automático
- [ ] Tests de integridad

### Sprint 2 (Semana 3-4)
- [ ] Tabla de auditoría
- [ ] Vistas para reportes
- [ ] Optimizar queries

### Sprint 3 (Mes 2)
- [ ] Migración a PostgreSQL (si crece)
- [ ] Data warehouse
- [ ] ETL pipeline

→ Ver detalles completos en [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) § Roadmap

---

## 📞 PREGUNTAS FRECUENTES

**P: ¿Dónde está la BD?**  
R: `src/database/data/MarIADono3DB.sqlite`

**P: ¿Cómo conecto?**  
R: `const db = await SqliteManager.getInstance();`

**P: ¿Cómo escribo una query?**  
R: Ver [QUERY_COOKBOOK.md](QUERY_COOKBOOK.md) (50 ejemplos)

**P: ¿Cuál es el sistema de horarios?**  
R: Ver [INFORME_BASE_DATOS_COMPLETO.md](INFORME_BASE_DATOS_COMPLETO.md) § 11-13

**P: ¿Cómo hago backup?**  
R: Ver [INFORME_BASE_DATOS_COMPLETO.md](INFORME_BASE_DATOS_COMPLETO.md) § 8 (estrategia)

**P: ¿Es segura la BD?**  
R: Ver [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) § Estado de Seguridad

**P: ¿Cuál es el plan a futuro?**  
R: Ver [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) § Roadmap

→ Más FAQs en [INFORME_BASE_DATOS_COMPLETO.md](INFORME_BASE_DATOS_COMPLETO.md) § Referencias

---

## 📈 ESTADÍSTICAS DE ESTE INFORME

```
Documentos:           6
Líneas totales:       ~8,500
Tablas documentadas:  14
Queries incluidas:    50
Flujos diagramados:   3
Ejemplos de código:   40+
Tablas de referencia: 25+
Diagramas ASCII:      10+

Tiempo de lectura:
  Ejecutivo:          30 min
  Developer:          60 min
  DBA:               150 min
  Analista:           45 min
```

---

## ✅ CHECKLIST ANTES DE EMPEZAR

- [ ] Descargué todos los 6 documentos
- [ ] Leí [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) completamente
- [ ] Revisé el diagrama ER en [DIAGRAMAS_ER_DETALLADOS.md](DIAGRAMAS_ER_DETALLADOS.md)
- [ ] Abiré [QUERY_COOKBOOK.md](QUERY_COOKBOOK.md) cuando necesite escribir queries
- [ ] Guardé [ÍNDICE_MAESTRO.md](ÍNDICE_MAESTRO.md) como referencia rápida
- [ ] Entiendo la estructura de 14 tablas
- [ ] Sé dónde está el archivo de BD
- [ ] Puedo conectarme con SqliteManager

---

## 🎯 SIGUIENTES PASOS

1. **Leer:** Comienza con [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) (20 min)
2. **Explorar:** Revisa [DIAGRAMAS_ER_DETALLADOS.md](DIAGRAMAS_ER_DETALLADOS.md)
3. **Practicar:** Copia queries de [QUERY_COOKBOOK.md](QUERY_COOKBOOK.md)
4. **Profundizar:** Lee [INFORME_BASE_DATOS_COMPLETO.md](INFORME_BASE_DATOS_COMPLETO.md)
5. **Referencia:** Usa [ÍNDICE_MAESTRO.md](ÍNDICE_MAESTRO.md) para búsquedas rápidas

---

## 📚 ARCHIVO DE REFERENCIA

Para consultas rápidas, abre:
- **Tablas:** [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) § Tabla Resumen
- **Queries:** [QUERY_COOKBOOK.md](QUERY_COOKBOOK.md)
- **Código:** [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) § Operaciones Comunes
- **Diagramas:** [DIAGRAMAS_ER_DETALLADOS.md](DIAGRAMAS_ER_DETALLADOS.md)
- **Todo:** [ÍNDICE_MAESTRO.md](ÍNDICE_MAESTRO.md)

---

## 🤝 MANTENER ESTE INFORME ACTUALIZADO

Este informe debe actualizarse cuando:
- Se agreguen nuevas tablas
- Cambien relaciones entre tablas
- Se optimicen queries
- Se realicen cambios arquitectónicos

→ Ver guía de mantenimiento en [ÍNDICE_MAESTRO.md](ÍNDICE_MAESTRO.md) § Mantenimiento

---

## 📄 INFORMACIÓN DEL DOCUMENTO

| Aspecto | Valor |
|---------|-------|
| **Versión** | 1.0 |
| **Generado** | 28 de Diciembre de 2025 |
| **Estado** | ✅ Completo y Listo |
| **Audiencia** | Todos (adaptado por perfil) |
| **Idioma** | Español |
| **Licencia** | Interno MarIADono |
| **Responsable** | Database Team |

---

## 🎓 CRÉDITOS Y AGRADECIMIENTOS

Este informe fue generado como documentación integral de la base de datos MarIADono, incluyendo:
- Análisis de 14 modelos Sequelize
- Documentación de todas las relaciones
- Ejemplos de queries y operaciones
- Diagramas de flujos de datos
- Recomendaciones de seguridad y performance
- Roadmap de mejoras futuras

---

## 📞 SOPORTE

¿Tienes preguntas?

1. **Busca** en [ÍNDICE_MAESTRO.md](ÍNDICE_MAESTRO.md) § Búsqueda Rápida
2. **Revisa** el documento relevante
3. **Consulta** las referencias cruzadas
4. **Contacta** al equipo de base de datos

---

**⭐ COMIENZA EN:** [ÍNDICE_MAESTRO.md](ÍNDICE_MAESTRO.md)

**O si prefieres rápido:**  
👉 [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) (20 minutos)

---

**Generated:** 28/12/2025  
**Version:** 1.0  
**Status:** ✅ Published & Ready
