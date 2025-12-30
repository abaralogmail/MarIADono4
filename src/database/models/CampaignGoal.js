/**
 * src/database/models/CampaignGoal.js
 * Modelo Sequelize para campaign_goals
 */

export default (sequelize, DataTypes) => {
  const CampaignGoal = sequelize.define(
    "CampaignGoal",
    {
      goal_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      campaign_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      goal_type: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      target_value: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      achieved_value: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "pending",
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
      tableName: "campaign_goals",
      timestamps: false,
      underscored: true,
    }
  );

  CampaignGoal.associate = (models) => {
    if (models.Campaign) {
      CampaignGoal.belongsTo(models.Campaign, {
        foreignKey: "campaign_id",
        as: "campaign",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  };

  return CampaignGoal;
};