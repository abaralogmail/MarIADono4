/**
 * Middleware RBAC simple con caché L1 por role_id.
 * Uso:
 *   const { rbac } = require('../middleware/rbac');
 *   router.post('/sensitive', authJwt({ required: true }), rbac(['campaign:write']), handler);
 *
 * Exports:
 *  - rbac(requiredPermissions)
 *  - clearRoleCache()
 */

const { RolePermissions } = require('../database/models');
const { getPermissionsFor } = require('./authJwt');

const roleCache = new Map(); // role_id -> { perms: Array, expiresAt: timestamp }
const DEFAULT_TTL_MS = 30 * 1000; // 30s TTL

async function fetchPermissionsForRole(roleId) {
  if (!roleId) return [];
  try {
    const now = Date.now();
    const cached = roleCache.get(roleId);
    if (cached && cached.expiresAt > now) return cached.perms;

    const rows = await RolePermissions.findAll({
      where: { role_id: roleId },
      raw: true,
    });

    const perms = rows.map(r => r.permission || r.perm).filter(Boolean);
    roleCache.set(roleId, { perms, expiresAt: now + DEFAULT_TTL_MS });
    return perms;
  } catch (err) {
    return [];
  }
}

/**
 * Normalize requiredPermissions into array
 */
function normalizeRequired(required) {
  if (!required) return [];
  if (Array.isArray(required)) return required;
  if (typeof required === 'string') return [required];
  return [];
}

/**
 * rbac middleware factory
 * required: array|string of permissions that must all be present
 */
function rbac(required) {
  const requiredPerms = normalizeRequired(required);

  return async function (req, res, next) {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'unauthenticated' });

    // Obtener permisos: priorizar req.user.permissions -> user-specific DB -> role cache
    let perms = Array.isArray(user.permissions) ? user.permissions.slice() : [];

    if ((!perms || perms.length === 0) && (user.id || user.role_id)) {
      // intentar obtener permisos a nivel usuario/role via helper
      perms = await getPermissionsFor(user);
    }

    // Si todavía vacío, intentar cargar desde role cache directamente
    if ((!perms || perms.length === 0) && user.role_id) {
      const rolePerms = await fetchPermissionsForRole(user.role_id);
      perms = rolePerms;
    }

    const hasAll = requiredPerms.every(rp => perms.includes(rp));
    if (!hasAll) return res.status(403).json({ error: 'forbidden' });

    return next();
  };
}

/**
 * Utility para limpiar caché en tests o despliegues.
 */
function clearRoleCache() {
  roleCache.clear();
}

module.exports = {
  rbac,
  clearRoleCache,
};