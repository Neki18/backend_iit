"use strict";
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },

      // 🔹 Basic User Details
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },

      // 🔹 Role Management
      // 1 = Admin, 2 = Applicant, 3 = Job Provider
      role: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 2 },

      // 🔹 Gender
      gender: { type: Sequelize.BIGINT, allowNull: true },

      // 🔹 System Fields
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

      // 🔹 Sequelize Defaults
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    {
      tableName: "Users",
      timestamps: true,
    }
  );

  // ✅ Associations
  User.associate = (models) => {
    // Add associations if needed later
  };

  return User;
};
