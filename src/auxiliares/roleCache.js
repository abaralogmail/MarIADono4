/**
 * roleCache L1 en memoria (TTL configurable)
 *
 * API:
 *  - async getRolePermissions(roleId, fetcher, opts)
 *      Obtiene permisos desde cache o usando `fetcher(roleId)` si no existe.
 *      `fetcher` debe devolver Array<string>.
 *  - setRolePermissions(roleId, perms, ttlMs)
 *  - invalidateRole(roleId)
 *  - clear()
 *
 * Diseño:
 *  - Map con entries { perms, expiresAt }
 *  - TTL por defecto 30s (configurable)
 */

const DEFAULT_TTL_MS = 30 * 1000; // 30s

const cache = new Map(); // roleId -> { perms: Array, expiresAt: number }

function now() {
  return Date.now();
}

function isValidEntry(entry) {
  return entry && Array.isArray(entry.perms) && entry.expiresAt && entry.expiresAt > now();
}

async function getRolePermissions(roleId, fetcher, opts = {}) {
  if (!roleId) return [];
  const ttlMs = opts.ttlMs || DEFAULT_TTL_MS;

  const existing = cache.get(roleId);
  if (isValidEntry(existing)) return existing.perms.slice();

  if (typeof fetcher !== 'function') {
    // No fetcher proporcionado; retornar vacío y no cachear
    return [];
  }

  try {
    const perms = await Promise.resolve(fetcher(roleId) || []);
    const normalized = Array.isArray(perms) ? perms.filter(Boolean) : [];
    cache.set(roleId, { perms: normalized, expiresAt: now() + ttlMs });
    return normalized.slice();
  } catch (err) {
    // En caso de error del fetcher, no romper la app; retornar vacío
    return [];
  }
}

function setRolePermissions(roleId, perms, ttlMs = DEFAULT_TTL_MS) {
  if (!roleId) return false;
  const normalized = Array.isArray(perms) ? perms.filter(Boolean) : [];
  cache.set(roleId, { perms: normalized, expiresAt: now() + ttlMs });
  return true;
}

function invalidateRole(roleId) {
  if (!roleId) return false;
  return cache.delete(roleId);
}

function clear() {
  cache.clear();
}

function stats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}

module.exports = {
  getRolePermissions,
  setRolePermissions,
  invalidateRole,
  clear,
  stats,
  DEFAULT_TTL_MS,
};