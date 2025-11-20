import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.model.js';
import Wallet from '../models/Wallet.model.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const createMissingWallets = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully');

    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users in the database`);

    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Check if wallet already exists for this user
        const existingWallet = await Wallet.findOne({ userId: user._id });

        if (existingWallet) {
          // Ensure user has the walletId reference
          if (!user.walletId || user.walletId.toString() !== existingWallet._id.toString()) {
            user.walletId = existingWallet._id;
            await user.save({ validateBeforeSave: false });
            console.log(`Updated wallet reference for user: ${user.email}`);
          } else {
            skippedCount++;
          }
          continue;
        }

        // Create new wallet
        const newWallet = new Wallet({
          userId: user._id,
          availableBalance: 0,
          pendingBalance: 0,
          currency: 'NGN',
          isActive: true
        });

        await newWallet.save();

        // Update user with wallet reference
        user.walletId = newWallet._id;
        await user.save({ validateBeforeSave: false });

        console.log(`Created wallet for user: ${user.email}`);
        createdCount++;

      } catch (err) {
        console.error(`Error processing user ${user.email}:`, err.message);
        errorCount++;
      }
    }

    console.log('\nMigration Summary:');
    console.log(`------------------`);
    console.log(`Total Users: ${users.length}`);
    console.log(`Wallets Created: ${createdCount}`);
    console.log(`Wallets Skipped (Already Existed): ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the migration
createMissingWallets();
