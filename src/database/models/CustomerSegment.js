/**
 * src/database/models/CustomerSegment.js
 * Modelo Sequelize para customer_segments
 */

export default (sequelize, DataTypes) => {
  const CustomerSegment = sequelize.define(
    "CustomerSegment",
    {
      segment_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      segment_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      owner_usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_dynamic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      members_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      metadata: {
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
      tableName: "customer_segments",
      timestamps: false,
      underscored: true,
    }
  );

  CustomerSegment.associate = (models) => {
    if (models.Usuarios) {
      CustomerSegment.belongsTo(models.Usuarios, {
        foreignKey: "owner_usuario_id",
        as: "owner",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
    }

    if (models.SegmentMember) {
      CustomerSegment.hasMany(models.SegmentMember, {
        foreignKey: "segment_id",
        as: "members",
        onDelete: "CASCADE",
        hooks: true,
      });
    }

    if (models.SegmentPerformance) {
      CustomerSegment.hasMany(models.SegmentPerformance, {
        foreignKey: "segment_id",
        as: "performance",
        onDelete: "CASCADE",
        hooks: true,
      });
    }

    if (models.CustomerScore) {
      CustomerSegment.hasMany(models.CustomerScore, {
        foreignKey: "segment_id",
        as: "scores",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
  };

  return CustomerSegment;
};