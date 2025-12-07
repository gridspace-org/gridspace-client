import mongoose from 'mongoose';
import Wallet from '../models/Wallet.model.js';
import env from '../config/env.js';

const hostId = '68fbedb7b1ada3a7db5bdaf8';

// Connect to MongoDB
await mongoose.connect(env.mongoUri);

setTimeout(async () => {
  try {
    const wallet = await Wallet.findOne({ userId: hostId });
    
    console.log('\n=== HOST WALLET STATUS ===');
    console.log('Host ID:', hostId);
    console.log('Wallet ID:', wallet?._id?.toString() || 'NO WALLET');
    console.log('Available Balance:', wallet?.availableBalance || 0);
    console.log('Pending Balance:', wallet?.pendingBalance || 0);
    console.log('Total Balance:', (wallet?.availableBalance || 0) + (wallet?.pendingBalance || 0));
    console.log('=========================\n');
    
    if (!wallet) {
      console.log('❌ Host has NO wallet!');
    } else if (wallet.pendingBalance === 0 && wallet.availableBalance === 0) {
      console.log('⚠️  Wallet exists but all balances are 0');
      console.log('   → Transaction was likely rolled back due to session issue');
    } else if (wallet.pendingBalance === 13800) {
      console.log('✅ Pending balance is correct (₦13,800)');
      console.log('   → Verification should work now');
    } else if (wallet.pendingBalance > 0) {
      console.log('✅ Has pending balance but different amount');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}, 2000);
