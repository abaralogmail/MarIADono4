module.exports = (sequelize, DataTypes) => {
  const ProviderLogs = sequelize.define(
    "ProviderLogs",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      phoneNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "phone_number",
      },
      providerName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "provider_name",
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "provider_logs",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );
  return ProviderLogs;
};