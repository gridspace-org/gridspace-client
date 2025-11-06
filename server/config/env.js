/**
 * Environment Configuration
 * Centralized management of environment variables and validation
 */

// Required environment variables
const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

// Optional environment variables with defaults
const optionalEnvVars = {
  NODE_ENV: 'development',
  PORT: 5000,
  CORS_ORIGIN: 'http://localhost:3000,http://localhost:3001',
  // Token configuration
  ACCESS_TOKEN_EXPIRES: '15m',        // 15 minutes
  REFRESH_TOKEN_EXPIRES: '7d',        // 7 days
  JWT_ISSUER: 'gridspace-backend',    // Token issuer
  JWT_AUDIENCE: 'gridspace-client',   // Token audience
  // API configuration
  API_URL: 'http://localhost:5000',   // Base URL for API calls
  // Security
  RATE_LIMIT_WINDOW_MS: '15 * 60 * 1000', // 15 minutes
  RATE_LIMIT_MAX: '100',              // 100 requests per window
};

// Validate required environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
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
      type: 'access',
    },
    refresh: {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
      type: 'refresh',
    },
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  },
  
  // Security settings
  security: {
    rateLimit: {
      windowMs: eval(process.env.RATE_LIMIT_WINDOW_MS), // Using eval to parse the expression
      max: parseInt(process.env.RATE_LIMIT_MAX, 10),
    },
  },
  
  // API configuration
  api: {
    url: process.env.API_URL,
    version: 'v1',
  },
  
  // Application settings
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10),
  corsOrigins: process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || [],
  
  // Helper methods
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
};

export default env;
