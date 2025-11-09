import util from 'util';
import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import sanitizeLogEntry from '../utils/logSanitizer.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format((info) => sanitizeLogEntry(info))(),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length
      ? `\n${util.inspect(meta, { colors: true, depth: 5, compact: false })}`
      : '';
    return `${timestamp} [${level}]: ${message}${metaString}`;
  })
);

// Create a format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format((info) => sanitizeLogEntry(info))(),
  winston.format.json()
);

// Configure transports
const transports = [
  // Console transport for all environments
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.LOG_LEVEL || 'info',
  }),
];

// Add file transport for production
if (process.env.NODE_ENV === 'production') {
  const logsDir = path.join(__dirname, '../../logs');
  
  // Error logs
  transports.push(
    new winston.transports.DailyRotateFile({
      level: 'error',
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat
    })
  );
  
  // Combined logs
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat
    })
  );
}

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { 
    service: 'gridspace-backend',
    env: process.env.NODE_ENV || 'development',
    hostname: process.env.HOSTNAME || 'localhost'
  },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format((info) => sanitizeLogEntry(info))()
  ),
  transports,
  exitOnError: false, // Don't exit on handled exceptions
});

// Handle uncaught exceptions and unhandled rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection at:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  // Don't exit for now, let the process continue
  // process.exit(1);
});

// Support both named and default exports
export { logger };
export default logger;