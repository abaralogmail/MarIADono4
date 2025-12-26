export default (sequelize, DataTypes) => {
  const ReglasHorario = sequelize.define(
    "ReglasHorario",
    {
      reglaId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "regla_id",
      },
      horarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "horario_id",
      },
      diaSemana: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "dia_semana",
        validate: {
          min: 0,
          max: 6,
        },
      },
      horaInicio: {
        type: DataTypes.TIME,
        allowNull: false,
        field: "hora_inicio",
      },
      horaFin: {
        type: DataTypes.TIME,
        allowNull: false,
        field: "hora_fin",
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "reglas_horario",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return ReglasHorario;
};