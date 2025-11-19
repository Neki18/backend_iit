require("dotenv").config();
console.log("📌 Trusted Discovery Backend Loaded");

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const expressWinston = require("express-winston");

const model = require("./models/index");           // Sequelize models + sequelize instance
const CONFIG = require("./config/config");
const v1 = require("./routes/v1");
const logger = require("./utils/logger.service");

const app = express();

// ──────────────────────────────────────────────
// GLOBAL MIDDLEWARE
// ──────────────────────────────────────────────
app.disable("x-powered-by");

// Body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Gzip compression
app.use(compression());

// ──────────────────────────────────────────────
// CORS CONFIG
// ──────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  "https://trusted-discovery.com",
  "https://www.trusted-discovery.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("🔎 Incoming request origin:", origin);

    if (!origin) return callback(null, true);

    if (!allowedOrigins.includes(origin)) {
      return callback(new Error("CORS policy: This origin is not allowed"), false);
    }

    return callback(null, true);
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// ──────────────────────────────────────────────
// LOGGING (before routes)
// ──────────────────────────────────────────────
app.use(
  expressWinston.logger({
    winstonInstance: logger,
    expressFormat: true,
    ignoreRoute: req => req.path === "/api/healthz"
  })
);

// ──────────────────────────────────────────────
// API ROUTES
// ──────────────────────────────────────────────
app.use("/api/v1", v1);

// ──────────────────────────────────────────────
// HEALTH CHECK
// ──────────────────────────────────────────────
app.get("/api/healthz", async (req, res) => {
  try {
    const result = await model.sequelize.query("SELECT 1+1 AS result", {
      type: model.sequelize.QueryTypes.SELECT
    });

    return result[0].result === 2
      ? res.status(200).send("OK")
      : res.status(500).send("Database Error");

  } catch (err) {
    logger.error("Health check failed", err);
    return res.status(500).send("Database Error");
  }
});

// ──────────────────────────────────────────────
// ERROR LOGGER
// ──────────────────────────────────────────────
app.use(
  expressWinston.errorLogger({
    winstonInstance: logger,
    expressFormat: true
  })
);

// ──────────────────────────────────────────────
// DATABASE INIT (Sequelize authenticate + sync)
// ──────────────────────────────────────────────
model.sequelize
  .authenticate()
  .then(() => logger.info("sequelize: Database Connection Success"))
  .then(() => model.sequelize.sync())
  .then(() => logger.info("sequelize: Database Sync Success"))
  .catch(err => {
    logger.error("sequelize: Database Init Failed", err);
    process.exit(1);
  });

// ──────────────────────────────────────────────
// START SERVER
// ──────────────────────────────────────────────
const PORT = CONFIG.port || 5000;

app.listen(PORT, () =>
  logger.info(`express: Trusted Discovery server running on port ${PORT}`)
);

module.exports = app;
