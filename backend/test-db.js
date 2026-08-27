import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notice from './models/Notice.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notice2action';

console.log('Testing connection to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connection successful!');
    
    // Query document counts to test schema queries
    const count = await Notice.countDocuments();
    console.log(`ℹ️ Current number of notices stored: ${count}`);
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed. Test passed!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });
