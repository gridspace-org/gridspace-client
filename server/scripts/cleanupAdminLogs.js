import { AdminAction } from '../models/AdminAction.js';
import { logger } from '../config/logger.js';

/**
 * Cleans up admin action logs older than the specified number of days
 * @param {number} [days=90] - Number of days to keep logs for
 */
const cleanupAdminLogs = async (days = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await AdminAction.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    
    if (result.deletedCount > 0) {
      logger.info(`Cleaned up ${result.deletedCount} admin action logs older than ${days} days`);
    }
    
    return result;
  } catch (error) {
    logger.error('Error cleaning up admin logs:', error);
    throw error;
  }
};

// If run directly (not required/imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  const days = process.argv[2] ? parseInt(process.argv[2]) : 90;
  cleanupAdminLogs(days)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { cleanupAdminLogs };
