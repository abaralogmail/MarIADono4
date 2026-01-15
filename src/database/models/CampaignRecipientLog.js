/**
 * src/database/models/CampaignRecipientLog.js
 * Modelo Sequelize para campaign_recipient_log
 */

export default (sequelize, DataTypes) => {
  const CampaignRecipientLog = sequelize.define(
    "CampaignRecipientLog",
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
      recipient_phone: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      recipient_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      message_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "pending",
      },
      status_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      delivered_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "campaign_recipient_log",
      timestamps: false,
      underscored: true,
    }
  );

  CampaignRecipientLog.associate = (models) => {
    if (models.Campaign) {
      CampaignRecipientLog.belongsTo(models.Campaign, {
        foreignKey: "campaign_id",
        as: "campaign",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  };

  return CampaignRecipientLog;
};