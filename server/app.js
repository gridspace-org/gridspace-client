import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "@exortek/express-mongo-sanitize";
import xss from "xss";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import cookieParser from "cookie-parser";

import mongoose from "mongoose";
import logger from "./config/logger.js";
import env from "./config/env.js";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

import { swaggerSpec, swaggerUiOptions } from "./config/swagger.js";
import {
  passwordComplexity,
  requestLimits,
  securityHeaders,
  corsConfig,
  healthCheckConfig,
} from "./config/security.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("App.js loaded - starting server");

const auditLoginAttempts = (req, res, next) => {
  if (req.method !== "GET" && req.originalUrl.includes("/auth/signin")) {
    logger.info("[SECURITY] Login attempt", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      email: req.body?.email?.substring(0, 50),
      environment: env.environment,
      timestamp: new Date(),
    });
  }

  next();
};

// Validate JWT secret strength (skip in test environment)
if (process.env.NODE_ENV !== "test") {
  const jwtSecret = process.env.JWT_SECRET || "";
  if (jwtSecret.length < 32) {
    logger.error(
      "JWT_SECRET must be at least 32 characters long. Please provide a stronger secret."
    );
    process.exit(1);
  }
}

// routes
import v1Routes from "./routes/index.js";

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

export const connectDB = async () => {
  try {
    // Connect to MongoDB with retry logic
    const maxRetries = 5;
    let retryCount = 0;

    const connectWithRetry = async () => {
      try {
        await mongoose.connect(env.mongoUri);
        logger.info("Connected to MongoDB successfully");
      } catch (error) {
        retryCount++;
        if (retryCount < maxRetries) {
          logger.warn(
            `MongoDB connection attempt ${retryCount} failed, retrying in 5 seconds...`
          );
          setTimeout(connectWithRetry, 5000);
        } else {
          logger.error("MongoDB connection failed after retries:", error);
          process.exit(1);
        }
      }
    };

    await connectWithRetry();
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Apply request parsing with limits
app.use(express.json(requestLimits.json));
app.use(express.urlencoded(requestLimits.urlencoded));
app.use(cookieParser());

// Apply security headers
app.use(helmet(securityHeaders));

// Apply CORS configuration
const corsOptions = corsConfig(env.corsOrigins);

// Health check endpoint for load balancers and monitoring
const getHealthCheck = () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  memory: process.memoryUsage(),
  database: {
    state: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    name: mongoose.connection.name,
  },
  ...healthCheckConfig.info,
});

app.get("/health", (req, res) => {
  const health = getHealthCheck();
  const isHealthy =
    health.database.state === "connected" &&
    health.memory.heapUsed < healthCheckConfig.memoryThreshold;

  res.status(isHealthy ? 200 : 503).json(health);
});

app.use(cors(corsOptions));

// NoSQL injection protection handled by custom sanitizer

// Input sanitization middleware (must be after JSON parsing)
app.use(sanitizeRequest);
app.use(auditLoginAttempts);

// Interactive API Documentation (Swagger UI)
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions)
);

// Swagger JSON specification endpoint
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use("/api/v1", v1Routes);

app.use(errorConverter);
app.use(errorHandler);

// Graceful shutdown handling - server instance provided by server.js
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  // Get server instance from app settings
  const server = app.get("server");

  // Stop accepting new connections
  if (server) {
    server.close(async () => {
      logger.info(
        "HTTP server closed. Waiting for ongoing requests to complete..."
      );

      try {
        // Close database connections
        await mongoose.connection.close();
        logger.info("Database connections closed successfully");

        // Allow time for ongoing requests to complete (up to 10 seconds)
        setTimeout(() => {
          logger.info("Graceful shutdown completed");
          process.exit(0);
        }, 10000);
      } catch (error) {
        logger.error("Error during graceful shutdown:", error);
        process.exit(1);
      }
    });

    // Force shutdown after 15 seconds if graceful shutdown fails
    setTimeout(() => {
      logger.error("Forced shutdown due to timeout");
      process.exit(1);
    }, 15000);
  } else {
    logger.info("No server instance found, exiting directly");
    process.exit(0);
  }
};

// Handle termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle PM2 reload signals
process.on("SIGUSR2", () => gracefulShutdown("SIGUSR2"));

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
  gracefulShutdown("unhandledRejection");
});

app.get("/ping", (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  logger.error("Error:", err);

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: errors,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Prevent information leakage in production
  const isDevelopment = process.env.NODE_ENV !== "production";

  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : "Internal Server Error",
    ...(isDevelopment && { stack: err.stack }), // Only show stack in development
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;
