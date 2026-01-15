'use strict';

const path = require('path');

describe('WhatsApp Groups - modelos', () => {
  let models;

  beforeAll(async () => {
    // Cargar el index de modelos (debe inicializar sequelize y asociaciones)
    models = require(path.join(__dirname, '..', 'database', 'models'));
    if (models.sequelize && typeof models.sequelize.authenticate === 'function') {
      await models.sequelize.authenticate();
    }
  }, 10000);

  afterAll(async () => {
    if (models && models.sequelize && typeof models.sequelize.close === 'function') {
      await models.sequelize.close();
    }
  });

  test('Modelos definidos', () => {
    expect(models.WhatsAppGroup).toBeDefined();
    expect(models.WhatsAppGroupMember).toBeDefined();
    expect(models.WhatsAppGroupMessagesLog).toBeDefined();
  });

  test('Nombres de tablas coinciden con migraciones', () => {
    expect(typeof models.WhatsAppGroup.getTableName === 'function' ? models.WhatsAppGroup.getTableName() : models.WhatsAppGroup.tableName).toBe('whatsapp_groups');
    expect(typeof models.WhatsAppGroupMember.getTableName === 'function' ? models.WhatsAppGroupMember.getTableName() : models.WhatsAppGroupMember.tableName).toBe('whatsapp_group_members');
    const messagesTable = typeof models.WhatsAppGroupMessagesLog?.getTableName === 'function'
      ? models.WhatsAppGroupMessagesLog.getTableName()
      : models.WhatsAppGroupMessagesLog?.tableName;
    expect(messagesTable).toBe('whatsapp_group_messages_log');
  });
});