module.exports = (sequelize, DataTypes) => {
  const MensajeEstados = sequelize.define(
    "MensajeEstados",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      messageId: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "messageid",
      },
      estado: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
      },
    },
    {
      tableName: "mensaje_estados",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );
  return MensajeEstados;
};