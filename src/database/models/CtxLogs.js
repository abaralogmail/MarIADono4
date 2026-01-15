export default (sequelize, DataTypes) => {
  const CtxLogs = sequelize.define(
    "CtxLogs",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      phoneNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "phone_number",
      },
      contextData: {
        type: DataTypes.JSON,
        allowNull: true,
        field: "context_data",
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "ctx_logs",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );
  return CtxLogs;
};