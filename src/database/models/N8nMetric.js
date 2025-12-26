export default (sequelize, DataTypes) => {
  const N8nMetric = sequelize.define(
    "N8nMetric",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "user_id",
      },
      botName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "bot_name",
      },
      messageId: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "messageid",
      },
      interesCliente: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "interes_cliente",
      },
      etapaEmbudo: {
        type: DataTypes.STRING(10),
        allowNull: true,
        field: "etapa_embudo",
      },
      estadoHabilitacionNotificacion: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "estado_habilitacion_notificacion",
      },
      consultaReformulada: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "consulta_reformulada",
      },
      confianzaReformulada: {
        type: DataTypes.STRING(10),
        allowNull: true,
        field: "confianza_reformulada",
      },
      asistenteInformacion: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "asistente_informacion",
      },
      respuestaFinal: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "respuesta_final",
      },
    },
    {
      tableName: "n8n_metrics",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return N8nMetric;
};