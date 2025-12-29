export default (sequelize, DataTypes) => {
  /**
   * Modelo UserRoles
   * Tabla: user_roles
   */
  const UserRoles = sequelize.define(
    "UserRoles",
    {
      role_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      role_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      permission_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_system_role: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "user_roles",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  UserRoles.associate = (db) => {
    // Relación con Usuarios
    if (db.Usuarios) {
      UserRoles.hasMany(db.Usuarios, {
        foreignKey: "role_id",
        sourceKey: "role_id",
        as: "users",
      });
    }

    // Relación many-to-many con UserPermissions a través de RolePermissions
    if (db.RolePermissions && db.UserPermissions) {
      UserRoles.belongsToMany(db.UserPermissions, {
        through: db.RolePermissions,
        foreignKey: "role_id",
        otherKey: "permission_id",
        as: "permissions",
      });
    }

    if (db.RolePermissions) {
      UserRoles.hasMany(db.RolePermissions, {
        foreignKey: "role_id",
        sourceKey: "role_id",
        as: "role_permissions",
      });
    }
  };

  return UserRoles;
};