/**
 * Middleware de autenticación JWT y utilidades mínimas.
 * - Extrae Bearer token, verifica y añade `req.user`.
 * - Si falta información de permisos en el token, intenta cargar desde DB (silencioso si falla).
 * - Exponer generateToken para uso en login/registro.
 *
 * Requiere: process.env.JWT_SECRET (recomendado).
 */

const jwt = require('jsonwebtoken');
const { RolePermissions, UserPermissions } = require('../database/models');

const JWT_SECRET = process.env.JWT_SECRET || 'please_change_this_secret';
const DEFAULT_EXPIRES_IN = '1h';

async function loadPermissionsFromDB(userId, roleId) {
  try {
    const permsSet = new Set();

    if (roleId && RolePermissions && RolePermissions.findAll) {
      const rolePerms = await RolePermissions.findAll({
        where: { role_id: roleId },
        raw: true,
      });
      rolePerms.forEach(r => {
        if (r.permission) permsSet.add(r.permission);
        if (r.perm) permsSet.add(r.perm);
      });
    }

    if (userId && UserPermissions && UserPermissions.findAll) {
      const userPerms = await UserPermissions.findAll({
        where: { usuario_id: userId },
        raw: true,
      });
      userPerms.forEach(u => {
        if (u.permission) permsSet.add(u.permission);
        if (u.perm) permsSet.add(u.perm);
      });
    }

    return Array.from(permsSet);
  } catch (err) {
    // No romper la app si la consulta falla; retornar array vacío
    return [];
  }
}

/**
 * Middleware principal: verifica JWT y añade req.user
 */
function authJwt(opts = {}) {
  // opts: { required: boolean } - si true, fuerza 401 cuando no hay token
  return async function (req, res, next) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (opts.required) return res.status(401).json({ error: 'missing_token' });
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      // Normalizar user object
      const user = {
        id: payload.id || payload.userId || payload.sub,
        role_id: payload.role_id || payload.roleId || payload.role,
        email: payload.email,
        // incluir cualquier claim extra
        ...payload,
      };

      // Si no vienen permisos en el token, intentar cargarlos desde DB
      if (!payload.permissions && (user.id || user.role_id)) {
        user.permissions = await loadPermissionsFromDB(user.id, user.role_id);
      } else {
        user.permissions = payload.permissions || [];
      }

      req.user = user;
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'invalid_token' });
    }
  };
}

/**
 * Genera un JWT a partir de un objeto user mínimo.
 * - `user` debe contener al menos `id` y opcionalmente `role_id` y `permissions`.
 */
function generateToken(user = {}, opts = {}) {
  const payload = {
    id: user.id,
    role_id: user.role_id,
    email: user.email,
    permissions: user.permissions || [],
  };
  const expiresIn = opts.expiresIn || DEFAULT_EXPIRES_IN;
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Helper para obtener permisos (útil en RBAC middleware)
 */
async function getPermissionsFor(user) {
  if (!user) return [];
  if (Array.isArray(user.permissions) && user.permissions.length) return user.permissions;
  return await loadPermissionsFromDB(user.id, user.role_id);
}

module.exports = {
  authJwt,
  generateToken,
  getPermissionsFor,
};