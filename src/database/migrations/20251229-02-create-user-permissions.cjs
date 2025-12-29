'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_permissions', {
      permission_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      permission_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    // Seeds iniciales para permisos
    await queryInterface.bulkInsert('user_permissions', [
      {
        permission_name: 'manage_users',
        description: 'Crear, editar y eliminar usuarios',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        permission_name: 'manage_roles',
        description: 'Crear y asignar roles',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        permission_name: 'view_reports',
        description: 'Acceder a informes y métricas',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('user_permissions', null, {});
    await queryInterface.dropTable('user_permissions');
  },
};