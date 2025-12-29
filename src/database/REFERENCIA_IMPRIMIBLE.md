# 📋 REFERENCIA RÁPIDA PARA IMPRIMIR

**Base de Datos MarIADono | Generado: 28/12/2025 | Versión 1.0**

---

## PÁGINA 1: ESTRUCTURA DE TABLAS

### 🗂️ TABLA 1: conversations_log
```
┌─────────────────────────────────────┐
│ conversations_log                   │
├─────────────────────────────────────┤
│ PK: id (INTEGER)                    │
│ from (VARCHAR 20) - Usuario         │
│ date (DATE)                         │
│ time (TIME)                         │
│ body (TEXT) - Mensaje               │
│ messageId (VARCHAR 50)              │
│ botName (VARCHAR 50)                │
│ etapaEmbudo (VARCHAR 10)            │
│ role (VARCHAR 20)                   │
│ pushName (VARCHAR 100)              │
│ interesCliente (VARCHAR 50)         │
│ Timestamps: created_at, updated_at  │
└─────────────────────────────────────┘
Uso: Historial de mensajes
```

### 🗂️ TABLA 2: usuarios
```
┌─────────────────────────────────────┐
│ usuarios                            │
├─────────────────────────────────────┤
│ PK: id (INTEGER)                    │
│ phoneNumber (VARCHAR 50, UNIQUE)    │
│ nombre (VARCHAR 100)                │
│ email (VARCHAR 100)                 │
│ fechaRegistro (DATE)                │
│ activo (BOOLEAN, default: true)     │
│ Timestamps: created_at              │
└─────────────────────────────────────┘
Uso: Base de clientes
```

### 🗂️ TABLA 3: pedidos
```
┌─────────────────────────────────────┐
│ pedidos                             │
├─────────────────────────────────────┤
│ PK: id (INTEGER)                    │
│ numeroPedido (VARCHAR 50)           │
│ clienteId (INTEGER, FK)             │
│ fechaPedido (DATE)                  │
│ total (DECIMAL 10,2)                │
│ estado (VARCHAR 50)                 │
│ Timestamps: created_at              │
└─────────────────────────────────────┘
Uso: Órdenes de compra
Estado: pendiente|confirmado|enviado|entregado|cancelado
```

### 🗂️ TABLA 4: productos
```
┌─────────────────────────────────────┐
│ productos                           │
├─────────────────────────────────────┤
│ PK: id (INTEGER)                    │
│ codigo (VARCHAR 50)                 │
│ nombre (VARCHAR 200)                │
│ descripcion (TEXT)                  │
│ precio (DECIMAL 10,2)               │
│ stock (INTEGER)                     │
│ categoria (VARCHAR 100)             │
│ Timestamps: created_at              │
└─────────────────────────────────────┘
Uso: Catálogo de productos
```

### 🗂️ TABLA 5: horarios
```
┌─────────────────────────────────────┐
│ horarios                            │
├─────────────────────────────────────┤
│ PK: horario_id (INTEGER)            │
│ nombre (VARCHAR 100)                │
│ botName (VARCHAR 50, REQUIRED)      │
│ tipo_horario_id (VARCHAR 50)        │
│ zona_horaria (VARCHAR 50)           │
│ activo (BOOLEAN)                    │
│ Timestamps: created_at, updated_at  │
│ HAS MANY: reglas_horario            │
│ HAS MANY: excepciones_horario       │
└─────────────────────────────────────┘
Uso: Configuración de disponibilidad
Relaciones: 1:N con reglas y excepciones
```

---

## PÁGINA 2: QUICK OPERATIONS

### 📍 CONECTAR A BD
```javascript
import SqliteManager from './src/database/SqliteManager.js';
const db = await SqliteManager.getInstance();
```

### 💬 GUARDAR MENSAJE
```javascript
await db.saveConversation({
  from: '543812010781',
  body: 'Hola',
  botName: 'BotAugustoTucuman',
  role: 'user',
  etapaEmbudo: 'interes'
});
```

### 👤 OBTENER USUARIO
```javascript
const user = await db.models.Usuarios.findOne({
  where: { phoneNumber: '543812010781' }
});
```

### 💬 HISTORIAL DE USUARIO
```javascript
const convs = await db.findConversationsByPhone('543812010781');
```

### ⏰ VERIFICAR DISPONIBILIDAD
```javascript
const disponible = await db.verificarDisponibilidad(
  'atencion_cliente',
  'BotAugustoTucuman'
);
```

### 📊 QUERY PERSONALIZADO
```javascript
const result = await db.query(`
  SELECT * FROM conversations_log 
  WHERE date = date('now')
  LIMIT 100
`);
```

### 📦 CREAR PEDIDO
```javascript
await db.models.Pedidos.create({
  numeroPedido: 'PED-001',
  clienteId: 1,
  fechaPedido: new Date(),
  total: 150.50,
  estado: 'pendiente'
});
```

### ⏰ CREAR HORARIO
```javascript
const horario = await db.crearHorario({
  nombre: 'Atención 9-18',
  botName: 'BotAugustoTucuman',
  tipo_horario_id: 'atencion_cliente'
});
```

### ⏰ AGREGAR REGLA
```javascript
await db.crearReglaHorario({
  horario_id: 1,
  dia_semana: 1,           // Lunes
  hora_inicio: '09:00:00',
  hora_fin: '18:00:00'
});
```

### ⏰ AGREGAR EXCEPCIÓN
```javascript
await db.crearExcepcionHorario({
  horario_id: 1,
  fecha_excepcion: '2025-01-01',
  estado: 'cerrado',        // o 'horario_personalizado'
  descripcion: 'Año Nuevo'
});
```

---

## PÁGINA 3: QUERIES MÁS USADAS

### 1️⃣ Historial de usuario
```sql
SELECT * FROM conversations_log 
WHERE from = '543812010781'
ORDER BY date DESC, time DESC LIMIT 50;
```

### 2️⃣ Mensajes del día
```sql
SELECT COUNT(*) as total, botName
FROM conversations_log 
WHERE date = date('now')
GROUP BY botName;
```

### 3️⃣ Usuarios registrados
```sql
SELECT COUNT(*) as total, 
  date(fechaRegistro) as fecha
FROM usuarios
GROUP BY date(fechaRegistro)
ORDER BY fecha DESC;
```

### 4️⃣ Top usuarios activos
```sql
SELECT from, COUNT(*) as mensajes
FROM conversations_log
WHERE date >= date('now', '-7 days')
GROUP BY from
ORDER BY mensajes DESC
LIMIT 20;
```

### 5️⃣ Pedidos pendientes
```sql
SELECT p.*, u.nombre, u.phoneNumber
FROM pedidos p
JOIN usuarios u ON p.clienteId = u.id
WHERE p.estado = 'pendiente'
ORDER BY p.fechaPedido DESC;
```

### 6️⃣ Stock de productos
```sql
SELECT codigo, nombre, precio, stock, categoria
FROM productos
WHERE stock > 0
ORDER BY stock DESC;
```

### 7️⃣ Horarios activos
```sql
SELECT h.nombre, h.bot_name, COUNT(r.regla_id) as reglas
FROM horarios h
LEFT JOIN reglas_horario r ON h.horario_id = r.horario_id
WHERE h.activo = 1
GROUP BY h.horario_id;
```

### 8️⃣ Reglas de un horario
```sql
SELECT 
  CASE dia_semana 
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Lunes'
    WHEN 2 THEN 'Martes'
    WHEN 3 THEN 'Miércoles'
    WHEN 4 THEN 'Jueves'
    WHEN 5 THEN 'Viernes'
    WHEN 6 THEN 'Sábado'
  END as dia,
  hora_inicio, hora_fin, activo
FROM reglas_horario
WHERE horario_id = 1
ORDER BY dia_semana;
```

---

## PÁGINA 4: TABLAS DE REFERENCIA

### Equivalencias de día_semana
```
0 = Domingo
1 = Lunes
2 = Martes
3 = Miércoles
4 = Jueves
5 = Viernes
6 = Sábado
```

### Estados de Pedidos
```
pendiente    → Esperando confirmación
confirmado   → Cliente confirmó
procesando   → En preparación
enviado      → En tránsito
entregado    → Cliente lo recibió
cancelado    → Cancelado
```

### Etapas del Funnel
```
atraccion    → Conocimiento inicial
interes      → Mostró interés
consideracion → Evaluando opciones
conversion   → Realizó compra
retencion    → Cliente recurrente
```

### Estados de Excepción
```
cerrado              → Completamente cerrado
horario_personalizado → Horario diferente al normal
```

### Estados de Mensajes
```
pending      → Pendiente envío
sent         → Enviado al servidor
delivered    → Entregado al dispositivo
read         → Leído por usuario
failed       → Falló el envío
error        → Error en la entrega
```

---

## PÁGINA 5: TROUBLESHOOTING

### ❌ "No puedo conectar a BD"
```
1. Verificar ruta: src/database/data/MarIADono3DB.sqlite
2. Verificar permisos de lectura/escritura
3. Crear directorio si no existe
4. Reiniciar aplicación
```

### ❌ "Query muy lenta"
```
1. Agregar LIMIT si no hay
2. Verificar que use índices
3. Usar WHERE con campos indexados
4. Ver INFORME § 7 (índices recomendados)
```

### ❌ "Foreign Key constraint failed"
```
1. Verificar que clienteId existe en usuarios
2. No eliminar usuario con pedidos
3. Usar transacciones para múltiples operaciones
4. Ver QUERY_COOKBOOK.md § Advertencias
```

### ❌ "BD se cuelga"
```
1. Verificar pool.max (default: 5)
2. Cerrar conexiones: db.cleanup()
3. Ejecutar: VACUUM en SQLite
4. Aumentar timeout en config
```

### ✅ "Verificar integridad"
```bash
sqlite3 src/database/data/MarIADono3DB.sqlite
sqlite> PRAGMA integrity_check;
# Debe responder: ok
```

---

## PÁGINA 6: CHECKLIST DIARIO

- [ ] ¿BD está activa?
- [ ] ¿Mensajes se guardan correctamente?
- [ ] ¿Bots responden horarios?
- [ ] ¿Número de registros es normal?
- [ ] ¿Sin errores en logs?
- [ ] ¿Backup realizado? (diario)

### Checklist Semanal
- [ ] PRAGMA integrity_check
- [ ] Revisar logs de error
- [ ] Estadísticas de uso
- [ ] Performance de queries

### Checklist Mensual
- [ ] Restore test de backup
- [ ] Análisis de crecimiento
- [ ] Optimización de queries
- [ ] Limpieza de datos antiguos

---

## PÁGINA 7: CONTACTOS & REFERENCIAS

### Documentos en src/database/
```
README_INFORME.md                 ← Comienza aquí
ÍNDICE_MAESTRO.md                 ← Navegación
RESUMEN_EJECUTIVO.md              ← 20 min overview
INFORME_BASE_DATOS_COMPLETO.md    ← Detalle completo
DIAGRAMAS_ER_DETALLADOS.md        ← Visuales
QUERY_COOKBOOK.md                 ← 50 queries
DATABASE_MAINTENANCE_GUIDE.md     ← Mantenimiento
```

### Comandos Útiles
```bash
# Backup
sqlite3 db.sqlite ".backup backup_$(date +%Y%m%d).db"

# Restore
sqlite3 new.sqlite ".restore backup_20250101.db"

# Verificar
sqlite3 db.sqlite "PRAGMA integrity_check;"

# Info
sqlite3 db.sqlite "SELECT page_count * page_size FROM pragma_page_count();"
```

### Contactos
- **Tech Lead:** [ver proyecto]
- **DBA:** [ver proyecto]
- **Support:** [email@mariadono.com]

---

## PÁGINA 8: HOJA DE RESUMEN FINAL

### Base de Datos en 30 segundos
```
✅ SQLite + Sequelize
✅ 14 tablas / 4 módulos
✅ 50k-500k registros
✅ Ubicación: src/database/data/MarIADono3DB.sqlite
⚠️ Sin backup automático todavía
⚠️ Sin encriptación todavía
✅ Sistema de horarios flexible
✅ Relaciones bien configuradas
```

### Top 5 Queries para recordar
1. `db.findConversationsByPhone()` - Historial
2. `db.verificarDisponibilidad()` - Horarios
3. `db.saveConversation()` - Guardar mensaje
4. `db.models.Usuarios.findOne()` - Buscar usuario
5. `db.query()` - SQL personalizado

### Top 3 Tablas más importantes
1. **conversations_log** - Corazón del bot
2. **usuarios** - Base de clientes
3. **horarios** - Disponibilidad

### Recordar SIEMPRE
- ✅ Hacer backup diariamente
- ✅ Verificar integridad mensualmente
- ✅ Crear índices para queries frecuentes
- ⚠️ NO cambiar schema sin migración
- ⚠️ NO ejecutar DELETE sin WHERE

---

**Impresa desde:** src/database/REFERENCIA_IMPRIMIBLE.md  
**Válida hasta:** Cuando se agreguen tablas nuevas  
**Versión:** 1.0  
**Status:** ✅ Listo para imprimir y usar como desk reference
