import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/User.model.js';
import Space from '../models/Space.model.js';
import Booking from '../models/Booking.model.js';
import logger from '../config/logger.js';

const createIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB');

    logger.info('Creating indexes for User model...');
    await User.createIndexes();
    
    logger.info('Creating indexes for Space model...');
    await Space.createIndexes();
    
    logger.info('Creating indexes for Booking model...');
    await Booking.createIndexes();

    logger.info('✅ All indexes created successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error creating indexes:', error);
    process.exit(1);
  }
};

createIndexes();
