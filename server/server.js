import app from './app.js';
import logger from './config/logger.js';
import { executeBackupRoutine } from './config/backup.js';
import cron from 'node-cron';

const PORT = process.env.PORT || 5000;

// Create server instance and make it available to app.js graceful shutdown
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📚 API Documentation: http://localhost:${PORT}/api/auth/test`);
  logger.info(`❤️ Health check: http://localhost:${PORT}/health`);
  logger.info(`📖 Interactive API Docs: http://localhost:${PORT}/api-docs`);
  logger.info(`📄 Swagger JSON Spec: http://localhost:${PORT}/api-docs.json`);

  // Schedule automated database backups (daily at 2 AM)
  if (process.env.NODE_ENV === 'production') {
    cron.schedule('0 2 * * *', async () => {
      logger.info('Running scheduled backup job');
      try {
        await executeBackupRoutine();
      } catch (error) {
        logger.error('Scheduled backup failed:', error);
      }
    });
    logger.info('📅 Automated database backups scheduled for 2:00 AM daily');
  }
});

// Make server instance available to app.js
app.set('server', server);

// Graceful shutdown for PM2 or Docker
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});
