import mongoose from 'mongoose';
import { createWriteStream } from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backup configuration
export const backupConfig = {
  backupDir: path.join(__dirname, '../backups'),
  retentionDays: 30, // Keep backups for 30 days
  schedule: '0 2 * * *', // Daily at 2 AM
  maxBackupCount: 30
};

/**
 * Create a database backup using mongodump
 */
export const createDatabaseBackup = () => {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupFilename = `gridspace-backup-${timestamp}.archive`;
    const backupPath = path.join(backupConfig.backupDir, backupFilename);

    // Parse MongoDB connection string
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      const error = new Error('MONGO_URI not configured for backup');
      logger.error('Database backup failed:', error.message);
      reject(error);
      return;
    }

    try {
      const url = new URL(mongoUri);
      const host = url.hostname;
      const port = url.port || 27017;
      const database = url.pathname.slice(1); // Remove leading slash
      const auth = url.username && url.password
        ? `--username ${url.username} --password ${url.password} --authenticationDatabase admin`
        : '';

      // Create backup directory if it doesn't exist
      exec(`mkdir -p "${backupConfig.backupDir}"`, (error) => {
        if (error) {
          logger.error('Failed to create backup directory:', error.message);
          reject(error);
          return;
        }

        // Execute mongodump
        const dumpCommand = `mongodump --host ${host} --port ${port} --db ${database} ${auth} --archive="${backupPath}" --gzip`;

        logger.info('Starting database backup:', backupFilename);

        exec(dumpCommand, (error, stdout, stderr) => {
          if (error) {
            logger.error('Database backup failed:', error.message);
            reject(error);
            return;
          }

          if (stderr && !stderr.includes('done dumping')) {
            logger.warn('Backup warnings:', stderr);
          }

          logger.info('Database backup completed successfully:', backupFilename);
          resolve(backupPath);
        });
      });

    } catch (error) {
      logger.error('Invalid MONGO_URI format:', error.message);
      reject(error);
    }
  });
};

/**
 * Clean up old backups (keep only the most recent ones within retention period)
 */
export const cleanupOldBackups = () => {
  return new Promise((resolve, reject) => {
    import('fs').then(({ readdir, stat, unlink }) => {
      const backupDir = backupConfig.backupDir;

      readdir(backupDir, (error, files) => {
        if (error) {
          logger.error('Failed to read backup directory:', error.message);
          resolve(); // Don't fail the entire process
          return;
        }

        const backupFiles = files
          .filter(file => file.startsWith('gridspace-backup-'))
          .map(file => ({
            name: file,
            path: path.join(backupDir, file),
            timestamp: new Date(file.replace('gridspace-backup-', '').replace('.archive', '').replace(/-/g, ':'))
          }))
          .sort((a, b) => b.timestamp - a.timestamp); // Most recent first

        // Keep only the most recent backups within retention period
        const maxAge = backupConfig.retentionDays * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        const now = new Date();
        let deletedCount = 0;

        backupFiles.forEach((file, index) => {
          if (index >= backupConfig.maxBackupCount || (now - file.timestamp) > maxAge) {
            unlink(file.path, (error) => {
              if (error) {
                logger.error(`Failed to delete old backup ${file.name}:`, error.message);
              } else {
                logger.info('Deleted old backup:', file.name);
                deletedCount++;
              }
            });
          }
        });

        logger.info(`Cleanup completed. Deleted ${deletedCount} old backup files.`);
        resolve();
      });
    });
  });
};

/**
 * Get backup statistics
 */
export const getBackupStats = () => {
  return new Promise((resolve, reject) => {
    import('fs').then(({ readdir, stat }) => {
      const backupDir = backupConfig.backupDir;

      readdir(backupDir, (error, files) => {
        if (error) {
          resolve({
            totalBackups: 0,
            oldestBackup: null,
            newestBackup: null,
            totalSize: 0,
            error: 'Failed to read backup directory'
          });
          return;
        }

        const backupFiles = files
          .filter(file => file.startsWith('gridspace-backup-'))
          .map(file => ({
            name: file,
            path: path.join(backupDir, file),
            timestamp: new Date(file.replace('gridspace-backup-', '').replace('.archive', '').replace(/-/g, ':'))
          }));

        if (backupFiles.length === 0) {
          resolve({
            totalBackups: 0,
            oldestBackup: null,
            newestBackup: null,
            totalSize: 0
          });
          return;
        }

        // Get file sizes
        const statPromises = backupFiles.map(file =>
          new Promise((resolve) => {
            stat(file.path, (error, stats) => {
              resolve({
                ...file,
                size: error ? 0 : stats.size
              });
            });
          })
        );

        Promise.all(statPromises).then(filesWithStats => {
          const totalSize = filesWithStats.reduce((sum, file) => sum + file.size, 0);
          const sortedByDate = filesWithStats.sort((a, b) => b.timestamp - a.timestamp);

          resolve({
            totalBackups: backupFiles.length,
            oldestBackup: sortedByDate[sortedByDate.length - 1]?.timestamp || null,
            newestBackup: sortedByDate[0]?.timestamp || null,
            totalSize: totalSize,
            averageSize: Math.round(totalSize / backupFiles.length),
            backups: sortedByDate.slice(0, 5).map(file => ({
              name: file.name,
              date: file.timestamp,
              size: file.size
            }))
          });
        });
      });
    });
  });
};

/**
 * Execute complete backup routine
 */
export const executeBackupRoutine = async () => {
  try {
    logger.info('Starting automated backup routine');

    // Create backup
    const backupPath = await createDatabaseBackup();

    // Cleanup old backups
    await cleanupOldBackups();

    // Log success
    const stats = await getBackupStats();
    logger.info('Backup routine completed successfully', {
      backupPath,
      totalBackups: stats.totalBackups,
      totalSizeBytes: stats.totalSize
    });

    return {
      success: true,
      backupPath,
      stats
    };

  } catch (error) {
    logger.error('Backup routine failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  createDatabaseBackup,
  cleanupOldBackups,
  getBackupStats,
  executeBackupRoutine,
  backupConfig
};
