'use strict';

/**
 * Modelo Sequelize: WhatsAppGroupClienteMapping
 * Tabla: whatsapp_group_cliente_mapping
 */

export default (sequelize, DataTypes) => {
  const WhatsAppGroupClienteMapping = sequelize.define('WhatsAppGroupClienteMapping', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    group_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mapped_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    notes: {
      type: DataTypes.TEXT,
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
    tableName: 'whatsapp_group_cliente_mapping',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  WhatsAppGroupClienteMapping.associate = function(models) {
    if (models.WhatsAppGroup) {
      WhatsAppGroupClienteMapping.belongsTo(models.WhatsAppGroup, {
        as: 'group',
        foreignKey: 'group_id',
        targetKey: 'group_id'
      });
    }
    // Asociar al modelo de cliente si existe (puede ser 'Cliente' o 'Usuario' según repo)
    if (models.Cliente) {
      WhatsAppGroupClienteMapping.belongsTo(models.Cliente, {
        as: 'cliente',
        foreignKey: 'cliente_id',
        targetKey: 'id'
      });
    } else if (models.Usuario) {
      WhatsAppGroupClienteMapping.belongsTo(models.Usuario, {
        as: 'cliente',
        foreignKey: 'cliente_id',
        targetKey: 'id'
      });
    }
  };

  return WhatsAppGroupClienteMapping;
};