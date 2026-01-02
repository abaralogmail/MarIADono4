'use strict';

/**
 * Modelo Sequelize: WhatsAppGroup
 * Tabla: whatsapp_groups
 */

module.exports = (sequelize, DataTypes) => {
  const WhatsAppGroup = sequelize.define('WhatsAppGroup', {
    group_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    sync_status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'unknown'
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    last_sync_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'whatsapp_groups',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  WhatsAppGroup.associate = function(models) {
    // Asociación con members
    if (models.WhatsAppGroupMember) {
      WhatsAppGroup.hasMany(models.WhatsAppGroupMember, {
        as: 'members',
        foreignKey: 'group_id',
        sourceKey: 'group_id'
      });
    }
    // Asociación con mapping cliente (si existe modelo)
    if (models.WhatsAppGroupClienteMapping) {
      WhatsAppGroup.hasMany(models.WhatsAppGroupClienteMapping, {
        as: 'mappings',
        foreignKey: 'group_id',
        sourceKey: 'group_id'
      });
    }
    // Asociación con logs de mensajes
    if (models.WhatsAppGroupMessagesLog) {
      WhatsAppGroup.hasMany(models.WhatsAppGroupMessagesLog, {
        as: 'messages',
        foreignKey: 'group_id',
        sourceKey: 'group_id'
      });
    }
  };

  return WhatsAppGroup;
};