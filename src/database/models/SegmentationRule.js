/**
 * src/database/models/SegmentationRule.js
 * Modelo Sequelize para segmentation_rules
 */

export default (sequelize, DataTypes) => {
  const SegmentationRule = sequelize.define(
    "SegmentationRule",
    {
      rule_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "custom", // demographic, behavioral, engagement, transactional, custom
      },
      criteria_json: {
        type: DataTypes.TEXT, // JSON stored as TEXT for SQLite
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      owner_usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "segmentation_rules",
      timestamps: false,
      underscored: true,
    }
  );

  SegmentationRule.associate = (models) => {
    if (models.Usuarios) {
      SegmentationRule.belongsTo(models.Usuarios, {
        foreignKey: "owner_usuario_id",
        as: "owner",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
    }
  };

  return SegmentationRule;
};