'use strict';

/**
 * Rutas para gestión/descarga de archivos de cliente.
 *
 * - GET /clients/:id/files/:fileId/download
 *   Protegido: authJwt(required) + rbac(['files.download'])
 *
 * Nota: usa consultas directas via db.sequelize.query para no depender de un modelo Sequelize
 * (las migraciones ya crean la tabla `client_file_storage`).
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const { authJwt } = require('../middleware/authJwt');
const { rbac } = require('../middleware/rbac');
const storageManager = require('../auxiliares/storageManager');
const db = require('../database/models');

/**
 * Descarga segura de archivo:
 * - Verifica existencia del registro en DB (tabla client_file_storage)
 * - Resuelve ruta absoluta y evita path traversal fuera del storage root
 * - Stream de descarga con increment de accessed_count
 */
router.get(
  '/clients/:id/files/:fileId/download',
  authJwt({ required: true }),
  rbac(['files.download']),
  async (req, res) => {
    try {
      const clienteId = Number(req.params.id);
      const fileId = Number(req.params.fileId);
      if (!Number.isFinite(clienteId) || !Number.isFinite(fileId)) {
        return res.status(400).json({ error: 'invalid_params' });
      }

      // Consultar tabla creada por migración
      const replacements = [fileId, clienteId];
      const rows = await db.sequelize.query(
        'SELECT * FROM client_file_storage WHERE id = ? AND cliente_id = ? AND is_deleted = 0 LIMIT 1',
        { replacements, type: db.Sequelize.QueryTypes.SELECT }
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'file_not_found' });
      }

      const file = rows[0];

      // Resolver ruta absoluta: si en DB se guardó ruta absoluta, respetarla; si fue relativa, unir con storage root
      const storageRoot = storageManager.getStorageRoot();
      const candidate = file.file_path || file.path || '';
      let absPath = path.isAbsolute(candidate) ? candidate : path.join(storageRoot, candidate);

      // Normalizar y proteger del path traversal: must start with storageRoot
      absPath = path.resolve(absPath);
      const normalizedRoot = path.resolve(storageRoot);
      if (!absPath.startsWith(normalizedRoot)) {
        return res.status(400).json({ error: 'invalid_file_path' });
      }

      if (!fs.existsSync(absPath)) {
        return res.status(404).json({ error: 'file_missing_on_disk' });
      }

      // Incrementar contador de accesos (no bloquear la descarga por el update)
      db.sequelize
        .query('UPDATE client_file_storage SET accessed_count = accessed_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', {
          replacements: [fileId],
          type: db.Sequelize.QueryTypes.UPDATE,
        })
        .catch((e) => {
          // log y continuar
          console.error('failed to increment accessed_count', e);
        });

      // Stream de descarga con nombre original
      const downloadName = file.original_filename || path.basename(absPath);
      res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`);

      const stream = fs.createReadStream(absPath);
      stream.on('error', (err) => {
        console.error('stream error', err);
        if (!res.headersSent) res.status(500).json({ error: 'read_error' });
      });
      stream.pipe(res);
    } catch (err) {
      console.error('download error', err);
      return res.status(500).json({ error: 'internal_error' });
    }
  }
);

module.exports = router;