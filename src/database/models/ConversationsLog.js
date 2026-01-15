export default (sequelize, DataTypes) => {
  const ConversationsLog = sequelize.define(
    "ConversationsLog",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      from: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      pushName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "pushname",
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      messageId: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "messageid",
      },
      etapaEmbudo: {
        type: DataTypes.STRING(10),
        allowNull: true,
        field: "etapaembudo",
      },
      interesCliente: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "interescliente",
      },
      botName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "botname",
      },
    },
    {
      tableName: "conversations_log",
      timestamps: false,
    }
  );
  return ConversationsLog;
};