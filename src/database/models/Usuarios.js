module.exports = (sequelize, DataTypes) => {
  const Usuarios = sequelize.define(
    "Usuarios",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      phoneNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        field: "phone_number",
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      fechaRegistro: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "fecha_registro",
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "usuarios",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );
  return Usuarios;
};