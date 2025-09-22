module.exports = (sequelize, DataTypes) => {
  const Productos = sequelize.define(
    "Productos",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      codigo: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      nombre: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      categoria: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      tableName: "productos",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );
  return Productos;
};