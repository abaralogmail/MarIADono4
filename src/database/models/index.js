import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

// Import all models
import ConversationsLogModel from './ConversationsLog.js';
import ConversationMetricasModel from './ConversationMetricas.js';
import MensajeEstadosModel from './MensajeEstados.js';
import CtxLogsModel from './CtxLogs.js';
import ProviderLogsModel from './ProviderLogs.js';
import OfertasModel from './Ofertas.js';
import PedidosModel from './Pedidos.js';
import ProductosModel from './Productos.js';
import UsuariosModel from './Usuarios.js';
import HorariosModel from './Horarios.js';
import ReglasHorarioModel from './ReglasHorario.js';
import ExcepcionesHorarioModel from './ExcepcionesHorario.js';
import N8nMetricModel from './N8nMetric.js';
import ClientFileModel from './ClientFile.js';
import SegmentationRuleModel from './SegmentationRule.js';
import CustomerSegmentModel from './CustomerSegment.js';
import SegmentMemberModel from './SegmentMember.js';
import SegmentPerformanceModel from './SegmentPerformance.js';
import CustomerScoreModel from './CustomerScore.js';
import RolePermissionsModel from './RolePermissions.js';
import UserPermissionsModel from './UserPermissions.js';
import UserRolesModel from './UserRoles.js';
import CampaignModel from './Campaign.js';
import CampaignAnalyticsModel from './CampaignAnalytics.js';
import CampaignGoalModel from './CampaignGoal.js';
import CampaignMessageModel from './CampaignMessage.js';
import CampaignRecipientLogModel from './CampaignRecipientLog.js';
import MessageChannelModel from './MessageChannel.js';
import MessageTemplates from './MessageTemplates.js'; // This is an object
import WhatsAppGroupModel from './WhatsAppGroup.js';
import WhatsAppGroupClienteMappingModel from './WhatsAppGroupClienteMapping.js';
import WhatsAppGroupMemberModel from './WhatsAppGroupMember.js';

const db = {};

// Helper to initialize model
const initModel = (modelDef) => {
  if (typeof modelDef === 'function') {
    return modelDef(sequelize, DataTypes);
  }
  return null;
};

// Initialize models
db.ConversationsLog = initModel(ConversationsLogModel);
db.ConversationMetricas = initModel(ConversationMetricasModel);
db.MensajeEstados = initModel(MensajeEstadosModel);
db.CtxLogs = initModel(CtxLogsModel);
db.ProviderLogs = initModel(ProviderLogsModel);
db.Ofertas = initModel(OfertasModel);
db.Pedidos = initModel(PedidosModel);
db.Productos = initModel(ProductosModel);
db.Usuarios = initModel(UsuariosModel);
db.Horarios = initModel(HorariosModel);
db.ReglasHorario = initModel(ReglasHorarioModel);
db.ExcepcionesHorario = initModel(ExcepcionesHorarioModel);
db.N8nMetric = initModel(N8nMetricModel);
db.ClientFile = initModel(ClientFileModel);
db.SegmentationRule = initModel(SegmentationRuleModel);
db.CustomerSegment = initModel(CustomerSegmentModel);
db.SegmentMember = initModel(SegmentMemberModel);
db.SegmentPerformance = initModel(SegmentPerformanceModel);
db.CustomerScore = initModel(CustomerScoreModel);
db.RolePermissions = initModel(RolePermissionsModel);
db.UserPermissions = initModel(UserPermissionsModel);
db.UserRoles = initModel(UserRolesModel);
db.Campaign = initModel(CampaignModel);
db.CampaignAnalytics = initModel(CampaignAnalyticsModel);
db.CampaignGoal = initModel(CampaignGoalModel);
db.CampaignMessage = initModel(CampaignMessageModel);
db.CampaignRecipientLog = initModel(CampaignRecipientLogModel);
db.MessageChannel = initModel(MessageChannelModel);
db.WhatsAppGroup = initModel(WhatsAppGroupModel);
db.WhatsAppGroupClienteMapping = initModel(WhatsAppGroupClienteMappingModel);
db.WhatsAppGroupMember = initModel(WhatsAppGroupMemberModel);

// Handle MessageTemplates (Multiple models in one file)
if (MessageTemplates && typeof MessageTemplates === 'object') {
  if (MessageTemplates.MessageTemplateModel) db.MessageTemplate = MessageTemplates.MessageTemplateModel(sequelize, DataTypes);
  if (MessageTemplates.TemplateButtonModel) db.TemplateButton = MessageTemplates.TemplateButtonModel(sequelize, DataTypes);
  if (MessageTemplates.TemplateVariableModel) db.TemplateVariable = MessageTemplates.TemplateVariableModel(sequelize, DataTypes);
  if (MessageTemplates.TemplateVersionModel) db.TemplateVersion = MessageTemplates.TemplateVersionModel(sequelize, DataTypes);
  if (MessageTemplates.TemplateUsageLogModel) db.TemplateUsageLog = MessageTemplates.TemplateUsageLogModel(sequelize, DataTypes);
}

// Associations
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  } else if (modelName === 'Horarios') {
    // Manual association for Horarios as it was in original SqliteManager
    if (db.ReglasHorario) db.Horarios.hasMany(db.ReglasHorario, { foreignKey: 'horario_id', as: 'reglas', onDelete: 'CASCADE', hooks: true });
    if (db.ExcepcionesHorario) db.Horarios.hasMany(db.ExcepcionesHorario, { foreignKey: 'horario_id', as: 'excepciones', onDelete: 'CASCADE', hooks: true });
  } else if (modelName === 'ReglasHorario' && db.Horarios) {
    db.ReglasHorario.belongsTo(db.Horarios, { foreignKey: 'horario_id', as: 'horario' });
  } else if (modelName === 'ExcepcionesHorario' && db.Horarios) {
    db.ExcepcionesHorario.belongsTo(db.Horarios, { foreignKey: 'horario_id', as: 'horario' });
  }
});

db.sequelize = sequelize;

// Export all models
export const {
  ConversationsLog,
  ConversationMetricas,
  MensajeEstados,
  CtxLogs,
  ProviderLogs,
  Ofertas,
  Pedidos,
  Productos,
  Usuarios,
  Horarios,
  ReglasHorario,
  ExcepcionesHorario,
  N8nMetric,
  ClientFile,
  SegmentationRule,
  CustomerSegment,
  SegmentMember,
  SegmentPerformance,
  CustomerScore,
  RolePermissions,
  UserPermissions,
  UserRoles,
  Campaign,
  CampaignAnalytics,
  CampaignGoal,
  CampaignMessage,
  CampaignRecipientLog,
  MessageChannel,
  MessageTemplate,
  TemplateButton,
  TemplateVariable,
  TemplateVersion,
  TemplateUsageLog,
  WhatsAppGroup,
  WhatsAppGroupClienteMapping,
  WhatsAppGroupMember
} = db;

export default db;
