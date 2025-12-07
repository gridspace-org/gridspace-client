/**
 * Environment Configuration
 * Centralized management of environment variables and validation
 */

// Safe time expression parser (replaces dangerous eval())
const parseTimeExpression = (expression) => {
  if (!expression || typeof expression !== "string") {
    return 15 * 60 * 1000; // Default 15 minutes
  }

  // Parse expressions like "15 * 60 * 1000" or "15m"
  const cleanExpression = expression.replace(/\s/g, "");

  // Handle multiplication expressions (e.g., "15*60*1000")
  if (cleanExpression.includes("*")) {
    const parts = cleanExpression.split("*");
    if (parts.length === 3) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      const milliseconds = parseInt(parts[2], 10);
      if (!isNaN(minutes) && !isNaN(seconds) && !isNaN(milliseconds)) {
        return minutes * seconds * milliseconds;
      }
    }
  }

  // Handle short format (e.g., "15m", "1h", "30s")
  const match = cleanExpression.match(/^(\d+)([smhd])$/);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case "s":
        return value * 1000;
      case "m":
        return value * 60 * 1000;
      case "h":
        return value * 60 * 60 * 1000;
      case "d":
        return value * 24 * 60 * 60 * 1000;
    }
  }

  // Fallback to default
  return 15 * 60 * 1000;
};

// Required environment variables
const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

// Optional environment variables with defaults (development-friendly)
const optionalEnvVars = {
  NODE_ENV: "development",
  PORT: 5002,
  CORS_ORIGIN: "http://localhost:3000,http://localhost:3001",
  FRONTEND_URL: "http://localhost:3000",
  // Token configuration
  ACCESS_TOKEN_EXPIRES: "15m", // 15 minutes
  REFRESH_TOKEN_EXPIRES: "7d", // 7 days
  JWT_ISSUER: "gridspace-backend", // Token issuer
  JWT_AUDIENCE: "gridspace-client", // Token audience
  // API configuration
  API_URL: "http://localhost:5002", // Base URL for API calls (use PORT env var if different)
  // Security
  RATE_LIMIT_WINDOW_MS: "15 * 60 * 1000", // 15 minutes
  RATE_LIMIT_MAX: "100", // 100 requests per window
  // Monnify Payment Gateway
  MONNIFY_BASE_URL: "https://sandbox.monnify.com",
  MONNIFY_API_KEY: "",
  MONNIFY_SECRET_KEY: "",
  MONNIFY_CONTRACT_CODE: "",
  // Wallet Configuration
  WALLET_DAILY_WITHDRAWAL_LIMIT: "50000",
  WALLET_MONTHLY_WITHDRAWAL_LIMIT: "500000",
  WALLET_MIN_WITHDRAWAL: "500",
  WALLET_CURRENCY: "NGN",
};

// Validate required environment variables
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingVars.join(", ")}`
  );
  process.exit(1);
}

// Validate production-specific environment variables
if (process.env.NODE_ENV === "production") {
  const productionRequiredVars = [
    "CORS_ORIGIN",
    "FRONTEND_URL",
    "API_URL",
    "MONNIFY_WEBHOOK_SECRET",
  ];

  const missingProductionVars = productionRequiredVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingProductionVars.length > 0) {
    console.error(
      `Missing required production environment variables: ${missingProductionVars.join(
        ", "
      )}`
    );
    console.error(
      "Production requires CORS_ORIGIN, FRONTEND_URL, API_URL, and MONNIFY_WEBHOOK_SECRET to be set in .env"
    );
    process.exit(1);
  }
}

// Apply default values for optional variables
Object.entries(optionalEnvVars).forEach(([key, defaultValue]) => {
  if (!(key in process.env)) {
    process.env[key] = defaultValue;
  }
});

// Export the validated environment
const env = {
  // Required variables
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // Token configuration
  tokens: {
    access: {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
      type: "access",
    },
    refresh: {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
      type: "refresh",
    },
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  },

  // Security settings
  security: {
    rateLimit: {
      windowMs: parseTimeExpression(process.env.RATE_LIMIT_WINDOW_MS),
      max: parseInt(process.env.RATE_LIMIT_MAX, 10),
    },
  },

  // API configuration
  api: {
    url: process.env.API_URL,
    version: "v1",
  },

  // Application settings
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10),
  corsOrigins: process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()) || [],
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  // Monnify payment gateway
  monnify: {
    baseUrl: process.env.MONNIFY_BASE_URL,
    apiKey: process.env.MONNIFY_API_KEY,
    secretKey: process.env.MONNIFY_SECRET_KEY,
    contractCode: process.env.MONNIFY_CONTRACT_CODE,
    webhookSecret: process.env.MONNIFY_WEBHOOK_SECRET || "",
    enabled: !!(process.env.MONNIFY_API_KEY && process.env.MONNIFY_SECRET_KEY),
  },

  // Wallet configuration
  wallet: {
    dailyWithdrawalLimit: parseInt(
      process.env.WALLET_DAILY_WITHDRAWAL_LIMIT,
      10
    ),
    monthlyWithdrawalLimit: parseInt(
      process.env.WALLET_MONTHLY_WITHDRAWAL_LIMIT,
      10
    ),
    minWithdrawal: parseInt(process.env.WALLET_MIN_WITHDRAWAL, 10),
    currency: process.env.WALLET_CURRENCY,
  },

  // Helper methods
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
};

export default env;
