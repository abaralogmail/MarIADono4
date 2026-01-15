/**
 * src/services/SegmentService.js
 *
 * Motor simple de segmentación y scoring.
 * - evaluateCriteria: evalúa un criteria_json (formato simple) contra un objeto userData
 * - recalculateSegments: recalcula miembros para segmentos dinámicos basados en metadata.rule_ids
 *
 * Nota: implementación conservadora y segura; ampliar operadores/consultas según necesidades.
 */

import SqliteManager from "../database/SqliteManager.js";

class SegmentService {
  static instance = null;

  static async getInstance() {
    if (!SegmentService.instance) {
      SegmentService.instance = new SegmentService();
      SegmentService.instance.manager = await SqliteManager.getInstance();
    }
    return SegmentService.instance;
  }

  // criteriaJson puede ser:
  // { "operator": "and", "conditions":[ { "field":"age","op":">=","value":30 }, ... ] }
  // o una lista simple de condiciones.
  evaluateCriteria(userData = {}, criteriaJson) {
    if (!criteriaJson) return false;
    let criteria;
    try {
      criteria = typeof criteriaJson === "string" ? JSON.parse(criteriaJson) : criteriaJson;
    } catch (e) {
      // invalid JSON
      return false;
    }

    const conditions = Array.isArray(criteria) ? criteria : criteria.conditions || [];
    const operator = (criteria.operator || "and").toLowerCase();

    const evalCondition = (cond) => {
      const { field, op, value } = cond;
      const vLeft = this.getValueByPath(userData, field);
      const vRight = value;

      switch ((op || "eq").toLowerCase()) {
        case "eq":
        case "==":
          return vLeft == vRight;
        case "neq":
        case "!=":
          return vLeft != vRight;
        case "gt":
          return Number(vLeft) > Number(vRight);
        case "gte":
          return Number(vLeft) >= Number(vRight);
        case "lt":
          return Number(vLeft) < Number(vRight);
        case "lte":
          return Number(vLeft) <= Number(vRight);
        case "in":
          return Array.isArray(vRight) && vRight.includes(vLeft);
        case "contains":
          return (vLeft || "").toString().includes(vRight);
        case "range":
          if (!Array.isArray(vRight) || vRight.length < 2) return false;
          return Number(vLeft) >= Number(vRight[0]) && Number(vLeft) <= Number(vRight[1]);
        default:
          return false;
      }
    };

    if (operator === "or") {
      return conditions.some(evalCondition);
    }
    // default and
    return conditions.every(evalCondition);
  }

  getValueByPath(obj, path) {
    if (!path) return undefined;
    const parts = path.split(".");
    let cur = obj;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return cur;
  }

  // Recalcula segmentos dinámicos.
  // Opciones:
  //  - batchSize: cuantos usuarios procesar por iteración
  //  - limitUsers: opcional, para pruebas
  async recalculateSegments({ batchSize = 500, limitUsers = null } = {}) {
    const mgr = await SqliteManager.getInstance();
    const { SegmentationRule, CustomerSegment, SegmentMember, Usuarios } = mgr.models;

    // Cargar reglas activas
    const rules = await SegmentationRule.findAll({ where: { is_active: true }, raw: true });
    const rulesById = new Map(rules.map(r => [String(r.rule_id), r]));

    // Cargar segmentos dinámicos
    const segments = await CustomerSegment.findAll({ where: { is_dynamic: true }, raw: true });

    if (!segments || segments.length === 0) return { processedSegments: 0, processedUsers: 0 };

    // Cargar usuarios (solo campos comunes; ampliar según necesidades)
    const usersQuery = { attributes: ["id", "telefono", "email", "created_at"], raw: true };
    if (limitUsers) usersQuery.limit = limitUsers;
    const users = await Usuarios.findAll(usersQuery);

    let processedUsers = 0;

    for (const segment of segments) {
      // metadata puede contener { "rule_ids": ["uuid1","uuid2"], "match": "any" }
      let meta = {};
      try { meta = segment.metadata ? JSON.parse(segment.metadata) : {}; } catch(e) { meta = {}; }

      const ruleIds = Array.isArray(meta.rule_ids) ? meta.rule_ids : [];
      if (ruleIds.length === 0) {
        // Si no hay rule_ids explícitos, intentar inferir por tipo (no obligatorio)
        // saltar si no hay reglas asignadas
        continue;
      }

      const matchMode = (meta.match || "any").toLowerCase(); // any = OR, all = AND

      for (let i = 0; i < users.length; i++) {
        const u = users[i];
        processedUsers++;

        // Construir userData básico; se pueden añadir consultas agregadas (conversations, pedidos) si es necesario
        const userData = {
          id: u.id,
          telefono: u.telefono,
          email: u.email,
          created_at: u.created_at,
        };

        // Evaluar reglas asignadas al segmento
        const evaluations = ruleIds.map(rid => {
          const rule = rulesById.get(String(rid));
          if (!rule) return false;
          return this.evaluateCriteria(userData, rule.criteria_json);
        });

        const matches = matchMode === "all" ? evaluations.every(Boolean) : evaluations.some(Boolean);

        try {
          if (matches) {
            // upsert miembro
            const [instance, created] = await SegmentMember.findOrCreate({
              where: { segment_id: segment.segment_id, cliente_id: u.id },
              defaults: { membership_score: 1.0, metadata: null, created_at: new Date() },
            });
            if (!created) {
              // actualizar score mínima si es necesario
              await instance.update({ membership_score: 1.0 });
            }
          } else {
            // eliminar miembro si existe
            await SegmentMember.destroy({ where: { segment_id: segment.segment_id, cliente_id: u.id } });
          }
        } catch (e) {
          // log pero no abortar todo el proceso
          console.error("[SegmentService.recalculateSegments] DB error:", e.message || e);
        }

        // batch throttle simple
        if (batchSize && processedUsers % batchSize === 0) {
          // permitir event loop
          await new Promise((res) => setTimeout(res, 10));
        }
      }

      // actualizar contador de miembros en customer_segments
      try {
        const count = await SegmentMember.count({ where: { segment_id: segment.segment_id } });
        await CustomerSegment.update({ members_count: count }, { where: { segment_id: segment.segment_id } });
      } catch (e) {
        console.error("[SegmentService.recalculateSegments] update members_count failed:", e.message || e);
      }
    }

    return { processedSegments: segments.length, processedUsers };
  }
}

export default SegmentService;