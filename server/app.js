import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import healthcheck from 'express-healthcheck';
import logger from './config/logger.js';
import { swaggerSpec, swaggerUiOptions } from './config/swagger.js';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Input sanitization utility
const sanitizeInput = (req, res, next) => {
  // Sanitize query parameters
  for (const key in req.query) {
    if (typeof req.query[key] === 'string') {
      // Basic HTML entity encoding to prevent XSS
      req.query[key] = req.query[key].replace(/[&<>"']/g, (char) => {
        return {
          '&': '&',
          '<': '<',
          '>': '>',
          '"': '"',
          "'": '&#39;'
        }[char];
      });
    }
  }

  // Sanitize body parameters (basic XSS prevention)
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Basic HTML entity encoding
        req.body[key] = req.body[key].replace(/[&<>"']/g, (char) => {
          return {
            '&': '&',
            '<': '<',
            '>': '>',
            '"': '"',
            "'": '&#39;'
          }[char];
        });
      }
    }
  }

  // Audit logging for security events
  if (req.method !== 'GET' && req.originalUrl.includes('/auth/signin')) {
    logger.info('[SECURITY] Login attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body?.email?.substring(0, 50), // Limit logged data
      timestamp: new Date()
    });
  }

  next();
};

// Environment variable validation
const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// routes
import authRoutes from './routes/auth.js';
import spaceRoutes from './routes/space.route.js';
import bookingRoutes from './routes/bookingsRoute.js';
import adminRoutes from './routes/adminRoute.js';
import reportRoutes from './routes/reportsRoute.js';


const app = express();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // Current Mongoose options (v8+)
      maxPoolSize: 10, // Maximum connection pool size
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      // Security options
      ssl: process.env.NODE_ENV === 'production', // Use SSL in production
      // Performance monitoring
      monitorCommands: process.env.NODE_ENV === 'development'
    });
    logger.info("Connected to MongoDB successfully");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

connectDB();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Adjust based on needs
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Enhanced CORS configuration with security
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:3000', // development default
  'http://localhost:3001', // common dev ports
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

// Health check endpoint for load balancers and monitoring
const getHealthCheck = () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  memory: process.memoryUsage(),
  database: {
    state: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    name: mongoose.connection.name
  },
  version: process.env.npm_package_version || '1.0.0',
  environment: process.env.NODE_ENV || 'development'
});

app.get('/health', (req, res) => {
  const health = getHealthCheck();
  const isHealthy = health.database.state === 'connected' && health.memory.heapUsed < 500 * 1024 * 1024; // < 500MB

  res.status(isHealthy ? 200 : 503).json(health);
});

app.use(cors(corsOptions));

// Input sanitization middleware (must be after JSON parsing)
app.use(sanitizeInput);

// Interactive API Documentation (Swagger UI)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Swagger JSON specification endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use("/api/auth", authRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);

// Graceful shutdown handling - server instance provided by server.js
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  // Get server instance from app settings
  const server = app.get('server');

  // Stop accepting new connections
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed. Waiting for ongoing requests to complete...');

      try {
        // Close database connections
        await mongoose.connection.close();
        logger.info('Database connections closed successfully');

        // Allow time for ongoing requests to complete (up to 10 seconds)
        setTimeout(() => {
          logger.info('Graceful shutdown completed');
          process.exit(0);
        }, 10000);

      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

    // Force shutdown after 15 seconds if graceful shutdown fails
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 15000);
  } else {
    logger.info('No server instance found, exiting directly');
    process.exit(0);
  }
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle PM2 reload signals
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  gracefulShutdown('unhandledRejection');
});

app.get('/ping', (req, res) => res.json({ ok: true }));

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
  const isDevelopment = process.env.NODE_ENV !== 'production';

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
