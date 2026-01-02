export default (sequelize, DataTypes) => {
  /**
   * Modelo UserPermissions
   * Tabla: user_permissions
   */
  const UserPermissions = sequelize.define(
    "UserPermissions",
    {
      permission_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      permission_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: "user_permissions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  UserPermissions.associate = (db) => {
    if (db.UserRoles && db.RolePermissions) {
      UserPermissions.belongsToMany(db.UserRoles, {
        through: db.RolePermissions,
        foreignKey: "permission_id",
        otherKey: "role_id",
        as: "roles",
      });
    }

    if (db.RolePermissions) {
      UserPermissions.hasMany(db.RolePermissions, {
        foreignKey: "permission_id",
        sourceKey: "permission_id",
        as: "permission_roles",
      });
    }
  };

  return UserPermissions;
};