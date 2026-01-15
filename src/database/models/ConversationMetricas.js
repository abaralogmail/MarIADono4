export default (sequelize, DataTypes) => {
  const ConversationMetricas = sequelize.define(
    "ConversationMetricas",
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
      respuesta: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metricasCliente: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "metricas_cliente",
      },
      interesCliente: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "interes_cliente",
      },
      estadoHabilitacionNotificacion: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: "estado_habilitacion_notificacion",
      },
      etapaEmbudo: {
        type: DataTypes.STRING(10),
        allowNull: true,
        field: "etapa_embudo",
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
    },
    {
      tableName: "conversation_metricas",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );
  return ConversationMetricas;
};