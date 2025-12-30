'use strict';

import * as storageManager from '../../auxiliares/storageManager.js';
const storage = storageManager.default || storageManager;

export default (sequelize, DataTypes) => {
  const ClientFile = sequelize.define(
    'ClientFile',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      file_path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      original_filename: {
        type: DataTypes.STRING,
      },
      mime_type: {
        type: DataTypes.STRING,
      },
      checksum_sha256: {
        type: DataTypes.STRING(128),
      },
      file_size: {
        type: DataTypes.BIGINT,
      },
      uploaded_by: {
        type: DataTypes.INTEGER,
      },
      uploaded_at: {
        type: DataTypes.DATE,
      },
      accessed_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'client_file_storage',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      defaultScope: {
        where: {
          is_deleted: false,
        },
      },
    }
  );

  /**
   * Hooks:
   * - Antes de crear/actualizar: si se proporciona _fileBuffer en la instancia,
   *   calcula checksum_sha256 y file_size automáticamente usando storageManager.
   *
   * Nota de uso: al crear/actualizar desde el código, asignar la propiedad
   * instance._fileBuffer = Buffer(...) antes de save() para que el hook calcule el checksum.
   */
  ClientFile.beforeCreate(async (instance) => {
    try {
      if (!instance.checksum_sha256 && instance._fileBuffer) {
        instance.checksum_sha256 = await storage.computeSha256(instance._fileBuffer);
        instance.file_size = instance._fileBuffer.length;
      }
      if (!instance.uploaded_at) instance.uploaded_at = new Date();
    } catch (err) {
      // no bloquear el flow, dejar que sequelize maneje el error si es crítico
      console.error('ClientFile.beforeCreate hook error', err);
    }
  });

  ClientFile.beforeUpdate(async (instance) => {
    try {
      if (instance._fileBuffer) {
        instance.checksum_sha256 = await storage.computeSha256(instance._fileBuffer);
        instance.file_size = instance._fileBuffer.length;
      }
    } catch (err) {
      console.error('ClientFile.beforeUpdate hook error', err);
    }
  });

  return ClientFile;
};