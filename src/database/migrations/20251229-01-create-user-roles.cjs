'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_roles', {
      role_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      role_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      permission_level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_system_role: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    // Seeds iniciales para roles
    await queryInterface.bulkInsert('user_roles', [
      {
        role_name: 'super_admin',
        permission_level: 100,
        is_system_role: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_name: 'admin',
        permission_level: 80,
        is_system_role: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_name: 'user',
        permission_level: 10,
        is_system_role: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.dropTable('user_roles');
  },
};