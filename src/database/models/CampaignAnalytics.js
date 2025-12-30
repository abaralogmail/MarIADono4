/**
 * src/database/models/CampaignAnalytics.js
 * Modelo Sequelize para campaign_analytics
 */

export default (sequelize, DataTypes) => {
  const CampaignAnalytics = sequelize.define(
    "CampaignAnalytics",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      campaign_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      recipients_total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      delivered: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      failed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      opens: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      clicks: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      bounces: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      ctr: {
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
      tableName: "campaign_analytics",
      timestamps: false,
      underscored: true,
    }
  );

  CampaignAnalytics.associate = (models) => {
    if (models.Campaign) {
      CampaignAnalytics.belongsTo(models.Campaign, {
        foreignKey: "campaign_id",
        as: "campaign",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  };

  return CampaignAnalytics;
};