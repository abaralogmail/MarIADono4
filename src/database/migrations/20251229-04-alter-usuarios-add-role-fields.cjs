'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Comprobar existencia de columnas antes de agregarlas (mejor compatibilidad con SQLite y ejecuciones repetidas)
    const tableDesc = await queryInterface.describeTable('usuarios');

    if (!tableDesc.role_id) {
      await queryInterface.addColumn('usuarios', 'role_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'user_roles',
          key: 'role_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }

    if (!tableDesc.user_type) {
      await queryInterface.addColumn('usuarios', 'user_type', {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'external', // valores posibles: 'internal','external','system' (validar en app)
      });
    }

    if (!tableDesc.last_login) {
      await queryInterface.addColumn('usuarios', 'last_login', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    if (!tableDesc.login_count) {
      await queryInterface.addColumn('usuarios', 'login_count', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!tableDesc.password_hash) {
      await queryInterface.addColumn('usuarios', 'password_hash', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }

    if (!tableDesc.is_active) {
      await queryInterface.addColumn('usuarios', 'is_active', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }

    if (!tableDesc.account_status) {
      await queryInterface.addColumn('usuarios', 'account_status', {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'active', // e.g. 'active','suspended','closed'
      });
    }

    // Añadir índices si no existen (sequelize puede lanzar si ya existen)
    try {
      await queryInterface.addIndex('usuarios', ['role_id'], { name: 'idx_usuarios_role_id' });
    } catch (err) {
      // ignorar si ya existe
      if (!/already exists|duplicate/i.test(err.message)) {
        throw err;
      }
    }

    try {
      await queryInterface.addIndex('usuarios', ['user_type'], { name: 'idx_usuarios_user_type' });
    } catch (err) {
      if (!/already exists|duplicate/i.test(err.message)) {
        throw err;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remover índices si existen
    try {
      await queryInterface.removeIndex('usuarios', 'idx_usuarios_user_type');
    } catch (err) {
      // ignorar si no existe
    }
    try {
      await queryInterface.removeIndex('usuarios', 'idx_usuarios_role_id');
    } catch (err) {
      // ignorar si no existe
    }

    // Remover columnas si existen
    const tableDesc = await queryInterface.describeTable('usuarios');
    if (tableDesc.account_status) {
      await queryInterface.removeColumn('usuarios', 'account_status');
    }
    if (tableDesc.is_active) {
      await queryInterface.removeColumn('usuarios', 'is_active');
    }
    if (tableDesc.password_hash) {
      await queryInterface.removeColumn('usuarios', 'password_hash');
    }
    if (tableDesc.login_count) {
      await queryInterface.removeColumn('usuarios', 'login_count');
    }
    if (tableDesc.last_login) {
      await queryInterface.removeColumn('usuarios', 'last_login');
    }
    if (tableDesc.user_type) {
      await queryInterface.removeColumn('usuarios', 'user_type');
    }
    if (tableDesc.role_id) {
      try {
        await queryInterface.removeColumn('usuarios', 'role_id');
      } catch (err) {
        // En SQLite la eliminación de columnas con FKs puede fallar; logueamos para visibilidad y rethrow si es crítico.
        console.warn('removeColumn role_id failed:', err.message || err);
        throw err;
      }
    }
  },
};