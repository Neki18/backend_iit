"use strict";
const CONFIG = require("../config/config");
const logger = require("../utils/logger.service");

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const db = {};

// Ensure password is always a string
const dbPassword = CONFIG.db_usePassword ? String(CONFIG.db_password) : null;

// ────── Sequelize Connection ─────────────────────────────
const sequelize = new Sequelize(
  CONFIG.db_name,
  CONFIG.db_user,
  dbPassword,
  {
    host: CONFIG.db_host,
    port: CONFIG.db_port,
    dialect: "postgres",
    pool: { max: 20, min: 0, acquire: 30000, idle: 10000 },
    logging: msg => logger.debug(msg),
  }
);

// ────── LOAD ALL MODELS (.js files inside models folder) ──────
fs.readdirSync(__dirname)
  .filter(file => file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js")
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

console.log("📦 Models loaded:", Object.keys(db));

// ────── APPLY ASSOCIATIONS IF EXISTS ─────────────────────
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// ────── EXPORT ───────────────────────────────────────────
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
