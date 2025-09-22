module.exports = (sequelize, DataTypes) => {
  const Ofertas = sequelize.define(
    "Ofertas",
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
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      fechaOferta: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "fecha_oferta",
      },
    },
    {
      tableName: "ofertas",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );
  return Ofertas;
};