export default (sequelize, DataTypes) => {
  const Pedidos = sequelize.define(
    "Pedidos",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      numeroPedido: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "numero_pedido",
      },
      clienteId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "cliente_id",
      },
      fechaPedido: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "fecha_pedido",
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      estado: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      tableName: "pedidos",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );
  return Pedidos;
};