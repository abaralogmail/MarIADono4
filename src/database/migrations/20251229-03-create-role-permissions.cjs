'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('role_permissions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_roles',
          key: 'role_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      permission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_permissions',
          key: 'permission_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Seeds iniciales de role_permissions (asume IDs insertados previamente: roles 1:super_admin,2:admin,3:user; permisos 1..3)
    await queryInterface.bulkInsert('role_permissions', [
      // super_admin => all (map to permission ids 1..3)
      { role_id: 1, permission_id: 1, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 2, created_at: new Date(), updated_at: new Date() },
      { role_id: 1, permission_id: 3, created_at: new Date(), updated_at: new Date() },
      // admin => manage_users, manage_roles (permission_id 1,2)
      { role_id: 2, permission_id: 1, created_at: new Date(), updated_at: new Date() },
      { role_id: 2, permission_id: 2, created_at: new Date(), updated_at: new Date() },
      // user => view_reports (permission_id 3)
      { role_id: 3, permission_id: 3, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.dropTable('role_permissions');
  },
};