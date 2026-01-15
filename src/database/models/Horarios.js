export default (sequelize, DataTypes) => {
  const Horarios = sequelize.define(
    "Horarios",
    {
      horarioId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "horario_id",
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      botName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "bot_name",
      },
      tipoHorario_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "tipo_horario_id",
      },
      zonaHoraria: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "America/Argentina/Buenos_Aires",
        field: "zona_horaria",
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "horarios",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Horarios;
};