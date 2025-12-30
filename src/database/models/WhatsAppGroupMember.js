'use strict';

/**
 * Modelo Sequelize: WhatsAppGroupMember
 * Tabla: whatsapp_group_members
 */

module.exports = (sequelize, DataTypes) => {
  const WhatsAppGroupMember = sequelize.define('WhatsAppGroupMember', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    group_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    member_phone_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    member_role: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    left_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
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
    tableName: 'whatsapp_group_members',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  WhatsAppGroupMember.associate = function(models) {
    if (models.WhatsAppGroup) {
      WhatsAppGroupMember.belongsTo(models.WhatsAppGroup, {
        as: 'group',
        foreignKey: 'group_id',
        targetKey: 'group_id'
      });
    }
    // Mapping to cliente through mapping table if needed
    if (models.WhatsAppGroupClienteMapping) {
      // no direct association required here, mapping lives in separate model
    }
  };

  // Asegurar índice/constraint de unicidad a nivel de modelo para consistencia
  WhatsAppGroupMember.addIndex = async function() {
    // Este helper puede ser usado por migraciones o scripts de inicialización
    try {
      await sequelize.getQueryInterface().addConstraint('whatsapp_group_members', {
        fields: ['group_id', 'member_phone_number'],
        type: 'unique',
        name: 'uk_whatsapp_group_member_groupid_phone'
      });
    } catch (e) {
      // ignore si ya existe
    }
  };

  return WhatsAppGroupMember;
};