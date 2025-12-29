'use strict';

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');

const DEFAULT_STORAGE_ROOT = path.resolve(process.cwd(), 'storage');

/**
 * Normaliza y valida el clienteId (entero).
 * @param {any} clienteId
 * @returns {number}
 */
function normalizeClienteId(clienteId) {
  const id = Number(clienteId);
  if (!Number.isFinite(id) || Number.isNaN(id) || id <= 0) {
    throw new Error('clienteId inválido');
  }
  return Math.floor(id);
}

/**
 * Devuelve la ruta absoluta al storage root (puede sobrescribirse vía env STORAGE_ROOT).
 * @returns {string}
 */
function getStorageRoot() {
  const fromEnv = process.env.STORAGE_ROOT;
  return fromEnv ? path.resolve(fromEnv) : DEFAULT_STORAGE_ROOT;
}

/**
 * Obtiene la ruta de almacenamiento para un cliente dado.
 * Ej: <root>/clients/client_123
 * @param {number|string} clienteId
 * @returns {string}
 */
function getClientStoragePath(clienteId) {
  const id = normalizeClienteId(clienteId);
  const root = getStorageRoot();
  return path.join(root, 'clients', `client_${id}`);
}

/**
 * Crea la estructura de carpetas para un cliente (imagenes, videos, audio, documents, archives).
 * Aplica mode 0o700 cuando sea soportado.
 * @param {number|string} clienteId
 * @returns {Promise<string>} ruta base creada
 */
async function createClientStorageDirs(clienteId) {
  const base = getClientStoragePath(clienteId);
  const dirs = [
    base,
    path.join(base, 'conversations'),
    path.join(base, 'media', 'images'),
    path.join(base, 'media', 'videos'),
    path.join(base, 'media', 'audio'),
    path.join(base, 'documents'),
    path.join(base, 'archives')
  ];

  // Asegurar root existe
  await ensureDir(path.dirname(base));

  for (const d of dirs) {
    await ensureDir(d);
  }

  return base;
}

async function ensureDir(dirPath) {
  try {
    await fsp.mkdir(dirPath, { recursive: true, mode: 0o700 });
    // Intentar setear permisos en sistemas que lo soporten
    try {
      await fsp.chmod(dirPath, 0o700);
    } catch (err) {
      // No crítico en Windows; ignorar
    }
  } catch (err) {
    // Si ya existe y no es directorio, propagar error
    if (err.code === 'EEXIST') {
      const stat = await fsp.stat(dirPath);
      if (!stat.isDirectory()) throw err;
    } else {
      throw err;
    }
  }
}

/**
 * Calcula checksum SHA-256 de un Buffer o Stream.
 * Si se pasa un stream se resuelve a string hex.
 * @param {Buffer|stream.Readable} input
 * @returns {Promise<string>}
 */
function computeSha256(input) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    if (Buffer.isBuffer(input)) {
      hash.update(input);
      return resolve(hash.digest('hex'));
    }

    if (input && typeof input.pipe === 'function') {
      input.on('error', reject);
      input.on('data', (chunk) => hash.update(chunk));
      input.on('end', () => resolve(hash.digest('hex')));
    } else {
      reject(new Error('Input debe ser Buffer o Stream'));
    }
  });
}

/**
 * Helper: guarda un Buffer en la ruta destino (creando dirs si hace falta) y devuelve metadata.
 * No maneja persistencia en DB, solo FS.
 * @param {string} destPath - ruta absoluta donde guardar el archivo (incluye filename)
 * @param {Buffer} buffer
 * @param {object} [options]
 * @param {number} [options.mode] - permisos, por defecto 0o600
 * @returns {Promise<{path:string, size:number, checksum:string}>}
 */
async function saveBufferToPath(destPath, buffer, options = {}) {
  const dir = path.dirname(destPath);
  await ensureDir(dir);
  const mode = options.mode || 0o600;
  await fsp.writeFile(destPath, buffer, { mode });
  try { await fsp.chmod(destPath, mode); } catch (e) { /* ignorar en Windows */ }
  const checksum = await computeSha256(buffer);
  const stat = await fsp.stat(destPath);
  return { path: destPath, size: stat.size, checksum };
}

module.exports = {
  getClientStoragePath,
  createClientStorageDirs,
  computeSha256,
  saveBufferToPath,
  getStorageRoot
};