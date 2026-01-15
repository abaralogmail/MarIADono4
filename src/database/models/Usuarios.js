export default (sequelize, DataTypes) => {
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
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "role_id",
      },
    },
    {
      tableName: "usuarios",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Usuarios.associate = (db) => {
    if (db.UserRoles) {
      Usuarios.belongsTo(db.UserRoles, {
        foreignKey: "role_id",
        targetKey: "role_id",
        as: "role",
      });
    }

    // placeholder for other associations if needed in future
  };

  return Usuarios;
};