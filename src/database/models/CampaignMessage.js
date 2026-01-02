/**
 * src/database/models/CampaignMessage.js
 * Modelo Sequelize para campaign_messages
 */

export default (sequelize, DataTypes) => {
  const CampaignMessage = sequelize.define(
    "CampaignMessage",
    {
      message_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      campaign_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      channel_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      template_ref: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      send_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
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
      tableName: "campaign_messages",
      timestamps: false,
      underscored: true,
    }
  );

  CampaignMessage.associate = (models) => {
    if (models.Campaign) {
      CampaignMessage.belongsTo(models.Campaign, {
        foreignKey: "campaign_id",
        as: "campaign",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
    const channelModel = models.MessageChannel || models.MessageChannels || null;
    if (channelModel) {
      CampaignMessage.belongsTo(channelModel, {
        foreignKey: "channel_id",
        as: "channel",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
    }
  };

  return CampaignMessage;
};