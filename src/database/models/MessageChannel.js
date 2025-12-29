export default (sequelize, DataTypes) => {
  /**
   * Modelo MessageChannel
   * Tabla: message_channels
   */
  const MessageChannel = sequelize.define(
    "MessageChannel",
    {
      channel_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      channel_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      provider: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "generic",
      },
      config: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      tableName: "message_channels",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  MessageChannel.associate = (db) => {
    // si existe Conversations u otros modelos que apunten a channel_id, definir relaciones aquí
    if (db.Conversations) {
      MessageChannel.hasMany(db.Conversations, {
        foreignKey: "channel_id",
        sourceKey: "channel_id",
        as: "conversations",
      });
    }
  };

  return MessageChannel;
};