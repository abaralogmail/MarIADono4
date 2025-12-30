/**
 * src/database/models/SegmentPerformance.js
 * Modelo Sequelize para segment_performance
 */

export default (sequelize, DataTypes) => {
  const SegmentPerformance = sequelize.define(
    "SegmentPerformance",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      segment_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      period_start: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      period_end: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      members_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      engagement_score: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      conversion_rate: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      computed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "segment_performance",
      timestamps: false,
      underscored: true,
    }
  );

  SegmentPerformance.associate = (models) => {
    if (models.CustomerSegment) {
      SegmentPerformance.belongsTo(models.CustomerSegment, {
        foreignKey: "segment_id",
        as: "segment",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  };

  return SegmentPerformance;
};