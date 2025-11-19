if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); // Load .env only in development
}

let CONFIG = {};

// General
CONFIG.app = process.env.APP || "trusted-discovery-dev";
CONFIG.port = process.env.PORT || 3001;

// Database
CONFIG.db_dialect     = process.env.DB_DIALECT || "postgres";
CONFIG.db_host        = process.env.DB_HOST || "localhost";
CONFIG.db_port        = process.env.DB_PORT || 3001;
CONFIG.db_name        = process.env.DB_NAME || "job";
CONFIG.db_user        = process.env.DB_USER || "postgres";
CONFIG.db_password    = process.env.DB_PASSWORD || "pass1122me";
CONFIG.db_usePassword = (process.env.DB_USE_PASSWORD || "true") === "true";

// JWT
CONFIG.jwt_encryption = process.env.JWT_SECRET || "defaultSecretKey";
CONFIG.jwt_expiration = process.env.JWT_EXPIRES_IN || "24h";

module.exports = CONFIG;
