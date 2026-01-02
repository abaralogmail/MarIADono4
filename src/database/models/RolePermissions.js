export default (sequelize, DataTypes) => {
  /**
   * Modelo RolePermissions
   * Tabla: role_permissions
   */
  const RolePermissions = sequelize.define(
    "RolePermissions",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "role_id",
      },
      permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "permission_id",
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
      tableName: "role_permissions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  RolePermissions.associate = (db) => {
    if (db.UserRoles) {
      RolePermissions.belongsTo(db.UserRoles, {
        foreignKey: "role_id",
        targetKey: "role_id",
        as: "role",
      });
    }

    if (db.UserPermissions) {
      RolePermissions.belongsTo(db.UserPermissions, {
        foreignKey: "permission_id",
        targetKey: "permission_id",
        as: "permission",
      });
    }
  };

  return RolePermissions;
};