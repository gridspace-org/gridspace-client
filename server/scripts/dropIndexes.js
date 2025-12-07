import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const dropAllIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`Dropping indexes for collection: ${collectionName}`);
      
      try {
        // Drop all indexes except _id
        await db.collection(collectionName).dropIndexes();
        console.log(`✅ Dropped indexes for ${collectionName}`);
      } catch (error) {
        console.log(`⚠️  Could not drop indexes for ${collectionName}: ${error.message}`);
      }
    }

    console.log('✅ All indexes dropped successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

dropAllIndexes();