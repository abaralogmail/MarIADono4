'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Roles
    await queryInterface.bulkInsert(
      'user_roles',
      [
        { role_name: 'super_admin', permission_level: 100, is_system_role: true, created_at: now, updated_at: now },
        { role_name: 'admin', permission_level: 80, is_system_role: true, created_at: now, updated_at: now },
        { role_name: 'user', permission_level: 10, is_system_role: true, created_at: now, updated_at: now },
      ],
      {}
    );

    // Permissions
    await queryInterface.bulkInsert(
      'user_permissions',
      [
        { permission_name: 'manage_users', description: 'Crear, editar y eliminar usuarios', created_at: now, updated_at: now },
        { permission_name: 'manage_roles', description: 'Crear y asignar roles', created_at: now, updated_at: now },
        { permission_name: 'view_reports', description: 'Acceder a informes y métricas', created_at: now, updated_at: now },
      ],
      {}
    );

    // Role - Permission mappings (assume ordering of inserts as above)
    await queryInterface.bulkInsert(
      'role_permissions',
      [
        // super_admin => all
        { role_id: 1, permission_id: 1, created_at: now, updated_at: now },
        { role_id: 1, permission_id: 2, created_at: now, updated_at: now },
        { role_id: 1, permission_id: 3, created_at: now, updated_at: now },
        // admin => manage_users, manage_roles
        { role_id: 2, permission_id: 1, created_at: now, updated_at: now },
        { role_id: 2, permission_id: 2, created_at: now, updated_at: now },
        // user => view_reports
        { role_id: 3, permission_id: 3, created_at: now, updated_at: now },
      ],
      {}
    );

    // Message channels por defecto
    await queryInterface.bulkInsert(
      'message_channels',
      [
        { channel_name: 'whatsapp', provider: 'meta', config: JSON.stringify({}), active: true, created_at: now, updated_at: now },
        { channel_name: 'telegram', provider: 'telegram', config: JSON.stringify({}), active: true, created_at: now, updated_at: now },
        { channel_name: 'sms', provider: 'twilio', config: JSON.stringify({}), active: false, created_at: now, updated_at: now },
        { channel_name: 'email', provider: 'smtp', config: JSON.stringify({}), active: true, created_at: now, updated_at: now },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('message_channels', null, {});
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('user_permissions', null, {});
    await queryInterface.bulkDelete('user_roles', null, {});
  },
};