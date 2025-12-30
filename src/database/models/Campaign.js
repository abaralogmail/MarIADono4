/**
 * src/database/models/Campaign.js
 * Modelo Sequelize para campaigns y asociaciones básicas.
 */

export default (sequelize, DataTypes) => {
  const Campaign = sequelize.define(
    "Campaign",
    {
      campaign_id: {
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
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "draft",
      },
      channel_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      owner_usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.TEXT, // JSON stored as TEXT for SQLite
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
      tableName: "campaigns",
      timestamps: false,
      underscored: true,
    }
  );

  // Asociaciones ligeras; SqliteManager.defineAssociations puede reafirmarlas.
  Campaign.associate = (models) => {
    if (models.Usuarios) {
      Campaign.belongsTo(models.Usuarios, {
        foreignKey: "owner_usuario_id",
        as: "owner",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
    }

    const channelModel = models.MessageChannel || models.MessageChannels || null;
    if (channelModel) {
      Campaign.belongsTo(channelModel, {
        foreignKey: "channel_id",
        as: "channel",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
    }

    if (models.CampaignMessage) {
      Campaign.hasMany(models.CampaignMessage, {
        foreignKey: "campaign_id",
        as: "messages",
        onDelete: "CASCADE",
        hooks: true,
      });
    }

    if (models.CampaignRecipientLog) {
      Campaign.hasMany(models.CampaignRecipientLog, {
        foreignKey: "campaign_id",
        as: "recipient_log",
        onDelete: "CASCADE",
        hooks: true,
      });
    }

    if (models.CampaignAnalytics) {
      Campaign.hasMany(models.CampaignAnalytics, {
        foreignKey: "campaign_id",
        as: "analytics",
        onDelete: "CASCADE",
        hooks: true,
      });
    }

    if (models.CampaignGoal) {
      Campaign.hasMany(models.CampaignGoal, {
        foreignKey: "campaign_id",
        as: "goals",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
  };

  return Campaign;
};