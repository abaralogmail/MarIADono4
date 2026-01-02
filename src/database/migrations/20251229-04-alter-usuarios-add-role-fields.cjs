'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Manejar variaciones en el nombre de la tabla (case-sensitive en algunos dialectos)
    const candidates = ['usuarios', 'Usuarios'];
    let tableName = null;
    let tableDesc = null;

    for (const t of candidates) {
      try {
        tableDesc = await queryInterface.describeTable(t);
        tableName = t;
        break;
      } catch (e) {
        // continuar buscando
      }
    }

    if (!tableDesc) {
      // Intentar buscar una coincidencia case-insensitive en la lista de tablas
      const all = await queryInterface.showAllTables();
      const found = all.find((x) => String(x).toLowerCase() === 'usuarios');
      if (found) {
        tableName = found;
        tableDesc = await queryInterface.describeTable(found);
      } else {
        throw new Error('No description found for "usuarios" table. Check the table name and schema; remember, they _are_ case sensitive.');
      }
    }

    // Comprobar existencia de columnas antes de agregarlas (mejor compatibilidad con SQLite y ejecuciones repetidas)
    if (!tableDesc.role_id) {
      await queryInterface.addColumn(tableName, 'role_id', {
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
      await queryInterface.addColumn(tableName, 'user_type', {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'external', // valores posibles: 'internal','external','system' (validar en app)
      });
    }

    if (!tableDesc.last_login) {
      await queryInterface.addColumn(tableName, 'last_login', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    if (!tableDesc.login_count) {
      await queryInterface.addColumn(tableName, 'login_count', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!tableDesc.password_hash) {
      await queryInterface.addColumn(tableName, 'password_hash', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }

    if (!tableDesc.is_active) {
      await queryInterface.addColumn(tableName, 'is_active', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }

    if (!tableDesc.account_status) {
      await queryInterface.addColumn(tableName, 'account_status', {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'active', // e.g. 'active','suspended','closed'
      });
    }

    // Añadir índices si no existen (sequelize puede lanzar si ya existen)
    try {
      await queryInterface.addIndex(tableName, ['role_id'], { name: 'idx_usuarios_role_id' });
    } catch (err) {
      // ignorar si ya existe
      if (!/already exists|duplicate/i.test(err.message)) {
        throw err;
      }
    }

    try {
      await queryInterface.addIndex(tableName, ['user_type'], { name: 'idx_usuarios_user_type' });
    } catch (err) {
      if (!/already exists|duplicate/i.test(err.message)) {
        throw err;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Determinar nombre de tabla como en up()
    const candidates = ['usuarios', 'Usuarios'];
    let tableName = null;
    let tableDesc = null;

    for (const t of candidates) {
      try {
        tableDesc = await queryInterface.describeTable(t);
        tableName = t;
        break;
      } catch (e) {
        // continuar
      }
    }

    if (!tableDesc) {
      const all = await queryInterface.showAllTables();
      const found = all.find((x) => String(x).toLowerCase() === 'usuarios');
      if (found) {
        tableName = found;
        tableDesc = await queryInterface.describeTable(found);
      } else {
        // nada que eliminar
        return;
      }
    }

    // Remover índices si existen
    try {
      await queryInterface.removeIndex(tableName, 'idx_usuarios_user_type');
    } catch (err) {
      // ignorar si no existe
    }
    try {
      await queryInterface.removeIndex(tableName, 'idx_usuarios_role_id');
    } catch (err) {
      // ignorar si no existe
    }

    // Remover columnas si existen
    if (tableDesc.account_status) {
      await queryInterface.removeColumn(tableName, 'account_status');
    }
    if (tableDesc.is_active) {
      await queryInterface.removeColumn(tableName, 'is_active');
    }
    if (tableDesc.password_hash) {
      await queryInterface.removeColumn(tableName, 'password_hash');
    }
    if (tableDesc.login_count) {
      await queryInterface.removeColumn(tableName, 'login_count');
    }
    if (tableDesc.last_login) {
      await queryInterface.removeColumn(tableName, 'last_login');
    }
    if (tableDesc.user_type) {
      await queryInterface.removeColumn(tableName, 'user_type');
    }
    if (tableDesc.role_id) {
      try {
        await queryInterface.removeColumn(tableName, 'role_id');
      } catch (err) {
        // En SQLite la eliminación de columnas con FKs puede fallar; logueamos para visibilidad y rethrow si es crítico.
        console.warn('removeColumn role_id failed:', err.message || err);
        throw err;
      }
    }
  },
};