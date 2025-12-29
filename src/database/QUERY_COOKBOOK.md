# 🔍 QUERY COOKBOOK - CONSULTAS ÚTILES

**Base de Datos:** MarIADono SQLite | **Versión:** 1.0 | **Fecha:** 28/12/2025

---

## 📌 INTRODUCCIÓN

Este documento contiene consultas SQL listas para copiar y usar en la base de datos MarIADono. Se pueden ejecutar de dos formas:

### Opción 1: Desde Node.js
```javascript
import SqliteManager from './src/database/SqliteManager.js';
const db = await SqliteManager.getInstance();
const result = await db.query(/* SQL query */);
```

### Opción 2: Desde SQLite CLI
```bash
sqlite3 src/database/data/MarIADono3DB.sqlite
sqlite> SELECT * FROM conversations_log LIMIT 10;
```

### Opción 3: Desde DB Browser
1. Descargar: [DB Browser for SQLite](https://sqlitebrowser.org/)
2. File → Open → `src/database/data/MarIADono3DB.sqlite`
3. Execute SQL

---

## 👥 QUERIES - USUARIOS

### 1. Listar todos los usuarios
```sql
SELECT 
  id,
  phoneNumber,
  nombre,
  email,
  fechaRegistro,
  activo,
  created_at
FROM usuarios
ORDER BY created_at DESC;
```

### 2. Usuarios activos registrados en el último mes
```sql
SELECT 
  *
FROM usuarios
WHERE activo = 1
  AND fechaRegistro >= date('now', '-30 days')
ORDER BY fechaRegistro DESC;
```

### 3. Contar usuarios únicos por día
```sql
SELECT 
  date(created_at) as fecha,
  COUNT(*) as usuarios_nuevos
FROM usuarios
GROUP BY date(created_at)
ORDER BY fecha DESC;
```

### 4. Buscar usuario por teléfono
```sql
SELECT *
FROM usuarios
WHERE phoneNumber = '543812010781';
```

### 5. Usuarios sin email registrado
```sql
SELECT 
  id,
  phoneNumber,
  nombre,
  email
FROM usuarios
WHERE email IS NULL OR email = ''
ORDER BY nombre;
```

### 6. Desactivar usuario
```sql
UPDATE usuarios
SET activo = 0
WHERE phoneNumber = '543812010781';
```

### 7. Actualizar datos de usuario
```sql
UPDATE usuarios
SET 
  nombre = 'Juan Carlos Pérez',
  email = 'juan@example.com'
WHERE phoneNumber = '543812010781';
```

---

## 💬 QUERIES - CONVERSACIONES

### 8. Historial de conversación con usuario
```sql
SELECT 
  id,
  date,
  time,
  role,
  pushName,
  body,
  botName,
  etapaEmbudo,
  interesCliente
FROM conversations_log
WHERE from = '543812010781'
ORDER BY date DESC, time DESC
LIMIT 100;
```

### 9. Conversaciones de hoy
```sql
SELECT 
  date,
  COUNT(*) as total_messages,
  COUNT(DISTINCT from) as unique_users
FROM conversations_log
WHERE date = date('now')
GROUP BY date;
```

### 10. Mensajes por bot
```sql
SELECT 
  botName,
  date,
  COUNT(*) as total_messages
FROM conversations_log
WHERE date >= date('now', '-7 days')
GROUP BY botName, date
ORDER BY date DESC, botName;
```

### 11. Usuarios más activos (últimos 30 días)
```sql
SELECT 
  from as phoneNumber,
  pushName,
  COUNT(*) as total_messages,
  COUNT(DISTINCT date) as dias_activos,
  MAX(date) as ultimo_contacto
FROM conversations_log
WHERE date >= date('now', '-30 days')
GROUP BY from
ORDER BY total_messages DESC
LIMIT 20;
```

### 12. Conversaciones sin métrica asociada
```sql
SELECT 
  c.id,
  c.messageId,
  c.date,
  c.body,
  cm.id as tiene_metrica
FROM conversations_log c
LEFT JOIN conversation_metricas cm 
  ON c.messageId = cm.messageId
WHERE cm.id IS NULL
LIMIT 50;
```

### 13. Búsqueda de mensaje por contenido
```sql
SELECT 
  id,
  date,
  time,
  from,
  pushName,
  body
FROM conversations_log
WHERE body LIKE '%producto%'
  AND date >= date('now', '-7 days')
ORDER BY date DESC;
```

### 14. Últimas conversaciones por usuario
```sql
SELECT 
  from,
  pushName,
  MAX(date) as ultima_fecha,
  MAX(time) as ultima_hora,
  COUNT(*) as total_msgs
FROM conversations_log
WHERE date >= date('now', '-30 days')
GROUP BY from
ORDER BY MAX(date) DESC
LIMIT 50;
```

### 15. Estadísticas por etapa del funnel
```sql
SELECT 
  etapaEmbudo,
  COUNT(*) as total_mensajes,
  COUNT(DISTINCT from) as usuarios_unicos,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM conversations_log), 2) as porcentaje
FROM conversations_log
WHERE etapaEmbudo IS NOT NULL
GROUP BY etapaEmbudo
ORDER BY total_mensajes DESC;
```

---

## 📊 QUERIES - MÉTRICAS

### 16. Calidad de respuestas del bot
```sql
SELECT 
  cm.confianzaReformulada,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM conversation_metricas WHERE confianzaReformulada IS NOT NULL), 2) as porcentaje
FROM conversation_metricas cm
WHERE confianzaReformulada IS NOT NULL
GROUP BY cm.confianzaReformulada
ORDER BY confianzaReformulada DESC;
```

### 17. Intereses de clientes (top 10)
```sql
SELECT 
  interesCliente,
  COUNT(*) as total_consultas,
  COUNT(DISTINCT (SELECT from FROM conversations_log WHERE messageId = conversation_metricas.messageId)) as usuarios
FROM conversation_metricas
WHERE interesCliente IS NOT NULL
  AND interesCliente != ''
GROUP BY interesCliente
ORDER BY total_consultas DESC
LIMIT 10;
```

### 18. Conversaciones con notificaciones habilitadas
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN estadoHabilitacionNotificacion = 1 THEN 1 ELSE 0 END) as notificaciones_on,
  SUM(CASE WHEN estadoHabilitacionNotificacion = 0 THEN 1 ELSE 0 END) as notificaciones_off,
  ROUND(SUM(CASE WHEN estadoHabilitacionNotificacion = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as porcentaje_on
FROM conversation_metricas
WHERE estadoHabilitacionNotificacion IS NOT NULL;
```

### 19. Métricas por bot (últimas 30 días)
```sql
SELECT 
  c.botName,
  COUNT(DISTINCT c.messageId) as total_mensajes,
  AVG(CAST(cm.confianzaReformulada AS FLOAT)) as confianza_promedio,
  COUNT(DISTINCT c.from) as usuarios_unicos
FROM conversations_log c
LEFT JOIN conversation_metricas cm ON c.messageId = cm.messageId
WHERE c.date >= date('now', '-30 days')
GROUP BY c.botName
ORDER BY total_mensajes DESC;
```

### 20. Respuestas más comunes del bot
```sql
SELECT 
  SUBSTR(respuesta, 1, 100) as respuesta_preview,
  COUNT(*) as veces_usada,
  COUNT(DISTINCT (SELECT from FROM conversations_log WHERE messageId = conversation_metricas.messageId)) as usuarios
FROM conversation_metricas
WHERE respuesta IS NOT NULL
  AND respuesta != ''
GROUP BY SUBSTR(respuesta, 1, 100)
ORDER BY veces_usada DESC
LIMIT 20;
```

---

## 📦 QUERIES - PEDIDOS & PRODUCTOS

### 21. Últimos pedidos (últimas 48 horas)
```sql
SELECT 
  p.id,
  p.numeroPedido,
  u.nombre,
  u.phoneNumber,
  p.fechaPedido,
  p.total,
  p.estado,
  p.created_at
FROM pedidos p
JOIN usuarios u ON p.clienteId = u.id
WHERE p.fechaPedido >= date('now', '-2 days')
ORDER BY p.fechaPedido DESC;
```

### 22. Pedidos por estado
```sql
SELECT 
  estado,
  COUNT(*) as total,
  SUM(total) as monto_total,
  ROUND(AVG(total), 2) as ticket_promedio
FROM pedidos
GROUP BY estado
ORDER BY total DESC;
```

### 23. Top 10 productos más vendidos
```sql
SELECT 
  p.codigo,
  p.nombre,
  p.categoria,
  COUNT(*) as veces_pedida,
  SUM(p.precio) as ingresos_totales
FROM productos p
LEFT JOIN pedidos pd ON p.id = pd.id
WHERE pd.id IS NOT NULL
GROUP BY p.id, p.nombre
ORDER BY veces_pedida DESC
LIMIT 10;
```

### 24. Productos sin stock
```sql
SELECT 
  id,
  codigo,
  nombre,
  stock,
  precio,
  categoria
FROM productos
WHERE stock = 0 OR stock IS NULL
ORDER BY nombre;
```

### 25. Actualizar stock de producto
```sql
UPDATE productos
SET stock = stock - 1
WHERE codigo = 'PROD-001'
  AND stock > 0;
```

### 26. Ventas por categoría (últimos 30 días)
```sql
SELECT 
  p.categoria,
  COUNT(pd.id) as pedidos,
  SUM(pd.total) as monto_total,
  ROUND(AVG(pd.total), 2) as ticket_promedio
FROM productos p
JOIN pedidos pd ON p.id = pd.id
WHERE pd.fechaPedido >= date('now', '-30 days')
GROUP BY p.categoria
ORDER BY monto_total DESC;
```

### 27. Clientes que compraron (con historial)
```sql
SELECT 
  u.id,
  u.nombre,
  u.phoneNumber,
  COUNT(p.id) as total_pedidos,
  SUM(p.total) as monto_total,
  MAX(p.fechaPedido) as ultimo_pedido
FROM usuarios u
JOIN pedidos p ON u.id = p.clienteId
GROUP BY u.id
ORDER BY monto_total DESC
LIMIT 20;
```

### 28. Ofertas activas
```sql
SELECT 
  id,
  codigo,
  SUBSTR(descripcion, 1, 50) as descripcion,
  precio,
  fechaOferta,
  created_at
FROM ofertas
WHERE fechaOferta <= date('now')
  AND fechaOferta >= date('now', '-30 days')
ORDER BY fechaOferta DESC;
```

---

## ⏰ QUERIES - HORARIOS

### 29. Horarios activos por bot
```sql
SELECT 
  horario_id,
  nombre,
  bot_name,
  tipo_horario_id,
  zona_horaria,
  activo,
  created_at
FROM horarios
WHERE activo = 1
ORDER BY bot_name, nombre;
```

### 30. Reglas de un horario específico
```sql
SELECT 
  r.regla_id,
  CASE r.dia_semana
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Lunes'
    WHEN 2 THEN 'Martes'
    WHEN 3 THEN 'Miércoles'
    WHEN 4 THEN 'Jueves'
    WHEN 5 THEN 'Viernes'
    WHEN 6 THEN 'Sábado'
  END as dia,
  r.hora_inicio,
  r.hora_fin,
  r.activo
FROM reglas_horario r
WHERE r.horario_id = 1
ORDER BY r.dia_semana;
```

### 31. Excepciones (feriados, cierres)
```sql
SELECT 
  e.excepcion_id,
  e.fecha_excepcion,
  e.estado,
  e.hora_inicio,
  e.hora_fin,
  e.descripcion
FROM excepciones_horario e
WHERE e.horario_id = 1
ORDER BY e.fecha_excepcion DESC;
```

### 32. Ver si bot está disponible ahora
```sql
-- Función helper (pseudocódigo)
-- Usar: await manager.verificarDisponibilidad('atencion_cliente', 'BotAugustoTucuman')

-- Query manual para ver reglas de hoy:
SELECT 
  h.nombre,
  h.bot_name,
  r.hora_inicio,
  r.hora_fin
FROM horarios h
JOIN reglas_horario r ON h.horario_id = r.horario_id
WHERE h.bot_name = 'BotAugustoTucuman'
  AND h.activo = 1
  AND r.dia_semana = CAST(strftime('%w', 'now') AS INTEGER)
  AND r.activo = 1;
```

### 33. Próximos cierres/excepciones
```sql
SELECT 
  e.excepcion_id,
  e.fecha_excepcion,
  e.estado,
  e.descripcion,
  h.bot_name,
  CAST((JULIANDAY(e.fecha_excepcion) - JULIANDAY('now')) AS INTEGER) as dias_para
FROM excepciones_horario e
JOIN horarios h ON e.horario_id = h.horario_id
WHERE e.fecha_excepcion >= date('now')
ORDER BY e.fecha_excepcion
LIMIT 10;
```

### 34. Crear nuevo horario (INSERT)
```sql
INSERT INTO horarios (nombre, descripcion, bot_name, tipo_horario_id, zona_horaria, activo, created_at, updated_at)
VALUES (
  'Atención 9-18',
  'Horario comercial regular',
  'BotAugustoTucuman',
  'atencion_cliente',
  'America/Argentina/Buenos_Aires',
  1,
  datetime('now'),
  datetime('now')
);
```

### 35. Agregar regla a horario
```sql
INSERT INTO reglas_horario (horario_id, dia_semana, hora_inicio, hora_fin, activo, created_at, updated_at)
VALUES (
  1,                    -- horario_id
  1,                    -- Lunes (0=domingo, 1=lunes, etc)
  '09:00:00',          -- Inicio
  '18:00:00',          -- Fin
  1,                    -- Activa
  datetime('now'),
  datetime('now')
);
```

---

## 📝 QUERIES - LOGS & AUDITORÍA

### 36. Últimos errores en provider logs
```sql
SELECT 
  id,
  phoneNumber,
  providerName,
  action,
  timestamp,
  created_at
FROM provider_logs
WHERE action LIKE '%error%'
  OR action LIKE '%failed%'
ORDER BY created_at DESC
LIMIT 50;
```

### 37. Logs de API Meta (últimas 24h)
```sql
SELECT 
  id,
  phoneNumber,
  action,
  timestamp,
  created_at
FROM provider_logs
WHERE providerName = 'meta'
  AND created_at >= datetime('now', '-1 day')
ORDER BY created_at DESC
LIMIT 100;
```

### 38. Estado de mensajes sin entregar
```sql
SELECT 
  messageId,
  estado,
  timestamp,
  COUNT(*) as cantidad
FROM mensaje_estados
WHERE estado IN ('pending', 'failed')
  AND timestamp >= datetime('now', '-24 hours')
GROUP BY messageId, estado
ORDER BY timestamp DESC;
```

### 39. Contexto de sesión de usuario
```sql
SELECT 
  id,
  phoneNumber,
  contextData,
  timestamp,
  created_at
FROM ctx_logs
WHERE phoneNumber = '543812010781'
ORDER BY created_at DESC
LIMIT 5;
```

### 40. Sesiones activas (últimas 2 horas)
```sql
SELECT 
  DISTINCT phoneNumber,
  COUNT(*) as acciones,
  MAX(created_at) as ultima_actividad
FROM ctx_logs
WHERE created_at >= datetime('now', '-2 hours')
GROUP BY phoneNumber
ORDER BY ultima_actividad DESC;
```

---

## 📊 QUERIES - N8N INTEGRATION

### 41. Métricas de N8N por bot
```sql
SELECT 
  botName,
  COUNT(*) as total_eventos,
  COUNT(DISTINCT userId) as usuarios_unicos,
  MAX(created_at) as ultima_actividad
FROM n8n_metric
WHERE created_at >= datetime('now', '-7 days')
GROUP BY botName
ORDER BY total_eventos DESC;
```

### 42. Tasa de éxito en N8N (confianza)
```sql
SELECT 
  confianzaReformulada,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM n8n_metric), 2) as porcentaje
FROM n8n_metric
WHERE confianzaReformulada IS NOT NULL
GROUP BY confianzaReformulada
ORDER BY COUNT(*) DESC;
```

### 43. Top consultas reformuladas
```sql
SELECT 
  SUBSTR(consultaReformulada, 1, 50) as consulta,
  COUNT(*) as frecuencia
FROM n8n_metric
WHERE consultaReformulada IS NOT NULL
GROUP BY consultaReformulada
ORDER BY frecuencia DESC
LIMIT 20;
```

---

## 🔧 QUERIES - MANTENIMIENTO

### 44. Ver tamaño de BD
```sql
-- En SQLite: Este query se ejecuta desde CLI
-- sqlite3> SELECT page_count * page_size as size_bytes FROM pragma_page_count(), pragma_page_size();
```

### 45. Verificar integridad
```sql
-- Desde CLI:
-- sqlite3> PRAGMA integrity_check;
-- Respuesta esperada: "ok"
```

### 46. Optimizar BD (VACUUM)
```sql
-- Liberar espacio no usado:
-- sqlite3> VACUUM;
```

### 47. Ver estadísticas de tablas
```sql
SELECT 
  name,
  type,
  sql
FROM sqlite_master
WHERE type = 'table'
ORDER BY name;
```

### 48. Contar registros por tabla
```sql
SELECT 'conversations_log' as tabla, COUNT(*) as registros FROM conversations_log
UNION ALL
SELECT 'usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'pedidos', COUNT(*) FROM pedidos
UNION ALL
SELECT 'productos', COUNT(*) FROM productos
UNION ALL
SELECT 'conversation_metricas', COUNT(*) FROM conversation_metricas
UNION ALL
SELECT 'provider_logs', COUNT(*) FROM provider_logs
UNION ALL
SELECT 'mensaje_estados', COUNT(*) FROM mensaje_estados
UNION ALL
SELECT 'ctx_logs', COUNT(*) FROM ctx_logs
UNION ALL
SELECT 'horarios', COUNT(*) FROM horarios
UNION ALL
SELECT 'reglas_horario', COUNT(*) FROM reglas_horario
UNION ALL
SELECT 'excepciones_horario', COUNT(*) FROM excepciones_horario
UNION ALL
SELECT 'ofertas', COUNT(*) FROM ofertas
UNION ALL
SELECT 'n8n_metric', COUNT(*) FROM n8n_metric
ORDER BY registros DESC;
```

### 49. Limpiar registros antiguos (ARCHIVE)
```sql
-- CUIDADO: Esto BORRA datos

-- Eliminar conversaciones > 1 año
DELETE FROM conversations_log
WHERE date < date('now', '-365 days')
  AND id NOT IN (
    SELECT messageId FROM conversation_metricas
  );

-- Limpiar logs antiguos (> 6 meses)
DELETE FROM provider_logs
WHERE created_at < datetime('now', '-180 days');

DELETE FROM ctx_logs
WHERE created_at < datetime('now', '-180 days');
```

### 50. Backup manual
```bash
# Desde terminal:
sqlite3 src/database/data/MarIADono3DB.sqlite ".backup backup_$(date +%Y%m%d_%H%M%S).db"

# O con cp:
cp src/database/data/MarIADono3DB.sqlite backups/MarIADono3DB_$(date +%Y%m%d).sqlite
gzip backups/MarIADono3DB_$(date +%Y%m%d).sqlite
```

---

## 💡 TIPS Y TRUCOS

### Query con JOIN (usuarios + pedidos)
```sql
SELECT 
  u.nombre,
  u.phoneNumber,
  p.numeroPedido,
  p.fechaPedido,
  p.total,
  p.estado
FROM usuarios u
LEFT JOIN pedidos p ON u.id = p.clienteId
WHERE p.estado != 'entregado'
ORDER BY u.nombre, p.fechaPedido DESC;
```

### Usar CASE para condicionales
```sql
SELECT 
  phoneNumber,
  CASE 
    WHEN total > 1000 THEN 'VIP'
    WHEN total > 500 THEN 'Preferencial'
    ELSE 'Regular'
  END as segmento
FROM (
  SELECT u.phoneNumber, SUM(p.total) as total
  FROM usuarios u
  LEFT JOIN pedidos p ON u.id = p.clienteId
  GROUP BY u.id
);
```

### Usar CTE (Common Table Expression) - útil para queries complejas
```sql
WITH usuario_stats AS (
  SELECT 
    u.id,
    u.nombre,
    COUNT(p.id) as pedidos,
    SUM(p.total) as gasto_total
  FROM usuarios u
  LEFT JOIN pedidos p ON u.id = p.clienteId
  GROUP BY u.id
)
SELECT *
FROM usuario_stats
WHERE pedidos > 0
ORDER BY gasto_total DESC;
```

### Buscar valores NULL
```sql
SELECT * FROM usuarios WHERE email IS NULL;
SELECT * FROM productos WHERE stock IS NULL;
```

### Buscar valores duplicados
```sql
SELECT phoneNumber, COUNT(*) as cantidad
FROM usuarios
GROUP BY phoneNumber
HAVING COUNT(*) > 1;
```

### Actualización condicional
```sql
UPDATE pedidos
SET estado = 'entregado'
WHERE estado = 'enviado'
  AND fechaPedido < date('now', '-15 days');
```

---

## 🚨 ADVERTENCIAS

⚠️ **DELETE sin WHERE:** Borra TODA la tabla
```sql
DELETE FROM conversations_log;  -- ❌ ¡PELIGRO! Borra todo
DELETE FROM conversations_log   -- ✅ Seguro
WHERE date < date('now', '-365 days');
```

⚠️ **UPDATE sin WHERE:** Actualiza TODOS los registros
```sql
UPDATE usuarios SET activo = 0;  -- ❌ ¡Desactiva todos!
```

⚠️ **Performance:** Las búsquedas LIKE son lentas con muchos registros
```sql
SELECT * FROM conversations_log WHERE body LIKE '%hola%';  -- ⚠️ Lento
-- Usar índices o Full Text Search para mejor rendimiento
```

⚠️ **Transacciones:** Para operaciones múltiples relacionadas
```javascript
const transaction = await db.sequelize.transaction();
try {
  // Operación 1
  // Operación 2
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
}
```

---

## 📞 SOPORTE

- **Más ejemplos:** Ver `src/database/DatabaseQueries.js`
- **Documentación completa:** Ver `INFORME_BASE_DATOS_COMPLETO.md`
- **ER Diagram:** Ver `DIAGRAMAS_ER_DETALLADOS.md`

---

**Versión:** 1.0 | **Última actualización:** 28/12/2025 | **Estado:** ✅ Completo
