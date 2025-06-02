// Test MongoDB connection
import 'dotenv/config';
import { connectToMongoDB } from './server/db/mongodb.js';

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
  
  try {
    const result = await connectToMongoDB();
    if (result) {
      console.log('✅ MongoDB connection successful!');
    } else {
      console.log('❌ MongoDB connection failed');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
  }
  
  process.exit(0);
}

testConnection();