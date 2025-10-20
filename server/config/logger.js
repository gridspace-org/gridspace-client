import winston from '../libs/winston.js';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.simple()
  ),
  defaultMeta: { service: "gridspace-backend" },
  transports: [new winston.transports.Console()],
});

export default logger;