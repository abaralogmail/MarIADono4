/**
 * src/database/models/CustomerScore.js
 * Modelo Sequelize para customer_scores
 */

export default (sequelize, DataTypes) => {
  const CustomerScore = sequelize.define(
    "CustomerScore",
    {
      score_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      segment_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      engagement: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      loyalty: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      churn_risk: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      lifetime_value: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      computed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "customer_scores",
      timestamps: false,
      underscored: true,
    }
  );

  CustomerScore.associate = (models) => {
    if (models.CustomerSegment) {
      CustomerScore.belongsTo(models.CustomerSegment, {
        foreignKey: "segment_id",
        as: "segment",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
    }

    if (models.Usuarios) {
      // optional association if cliente_id maps to Usuarios
      CustomerScore.belongsTo(models.Usuarios, {
        foreignKey: "cliente_id",
        as: "cliente",
        constraints: false,
      });
    }
  };

  return CustomerScore;
};