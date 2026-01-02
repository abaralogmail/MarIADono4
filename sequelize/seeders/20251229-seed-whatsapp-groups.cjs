'use strict';

/**
 * Seeder: whatsapp groups, members y mapping de ejemplo
 * Genera datos iniciales para desarrollo/QA.
 */

module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();

    // Grupos de ejemplo
    await queryInterface.bulkInsert('whatsapp_groups', [
      {
        group_id: 'sample-group-1',
        name: 'Grupo Demo',
        description: 'Grupo de demostración generado por seeder',
        is_active: true,
        sync_status: 'synced',
        metadata: JSON.stringify({source: 'seeder'}),
        last_sync_at: now,
        created_at: now,
        updated_at: now
      }
    ], {});

    // Miembros de ejemplo
    await queryInterface.bulkInsert('whatsapp_group_members', [
      {
        group_id: 'sample-group-1',
        member_phone_number: '5493516000000',
        member_role: 'member',
        is_admin: false,
        joined_at: now,
        metadata: JSON.stringify({nickname: 'UsuarioDemo'}),
        created_at: now,
        updated_at: now
      },
      {
        group_id: 'sample-group-1',
        member_phone_number: '5493516000001',
        member_role: 'admin',
        is_admin: true,
        joined_at: now,
        metadata: JSON.stringify({nickname: 'AdminDemo'}),
        created_at: now,
        updated_at: now
      }
    ], {});

    // Mapping cliente <-> grupo (ejemplo)
    await queryInterface.bulkInsert('whatsapp_group_cliente_mapping', [
      {
        cliente_id: 1,
        group_id: 'sample-group-1',
        mapped_at: now,
        notes: 'Mapeo de ejemplo para cliente 1'
      }
    ], {});

    // Log de mensajes de grupo de ejemplo
    await queryInterface.bulkInsert('whatsapp_group_messages_log', [
      {
        group_id: 'sample-group-1',
        message_id: 'msg-sample-1',
        sender_number: '5493516000000',
        message_type: 'text',
        body: 'Mensaje de prueba en grupo demo',
        media_url: null,
        is_bot_message: false,
        received_at: now,
        metadata: JSON.stringify({source: 'seeder'})
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('whatsapp_group_messages_log', { group_id: 'sample-group-1' }, {});
    await queryInterface.bulkDelete('whatsapp_group_cliente_mapping', { group_id: 'sample-group-1' }, {});
    await queryInterface.bulkDelete('whatsapp_group_members', { group_id: 'sample-group-1' }, {});
    await queryInterface.bulkDelete('whatsapp_groups', { group_id: 'sample-group-1' }, {});
  }
};