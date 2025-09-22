module.exports = (sequelize, DataTypes) => {
  const ExcepcionesHorario = sequelize.define(
    "ExcepcionesHorario",
    {
      excepcionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "excepcion_id",
      },
      horarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "horario_id",
      },
      fechaExcepcion: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "fecha_excepcion",
      },
      estado: {
        type: DataTypes.ENUM("cerrado", "horario_personalizado"),
        allowNull: false,
        defaultValue: "cerrado",
      },
      horaInicio: {
        type: DataTypes.TIME,
        allowNull: true,
        field: "hora_inicio",
      },
      horaFin: {
        type: DataTypes.TIME,
        allowNull: true,
        field: "hora_fin",
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "excepciones_horario",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return ExcepcionesHorario;
};