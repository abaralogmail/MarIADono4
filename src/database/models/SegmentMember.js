/**
 * src/database/models/SegmentMember.js
 * Modelo Sequelize para segment_members
 */

export default (sequelize, DataTypes) => {
  const SegmentMember = sequelize.define(
    "SegmentMember",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      segment_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      membership_score: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },
      metadata: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "segment_members",
      timestamps: false,
      underscored: true,
    }
  );

  SegmentMember.associate = (models) => {
    if (models.CustomerSegment) {
      SegmentMember.belongsTo(models.CustomerSegment, {
        foreignKey: "segment_id",
        as: "segment",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }

    if (models.Usuarios) {
      // optional association if cliente_id maps to a Usuarios model
      SegmentMember.belongsTo(models.Usuarios, {
        foreignKey: "cliente_id",
        as: "cliente",
        constraints: false,
      });
    }
  };

  return SegmentMember;
};