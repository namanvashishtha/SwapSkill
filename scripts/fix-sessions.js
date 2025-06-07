// Script to fix corrupted sessions in MongoDB
import { MongoClient } from 'mongodb';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://user:System123@cluster0.bwfouog.mongodb.net/SkillSwap?retryWrites=true&w=majority';

async function fixSessions() {
  console.log('Starting session fix script...');
  console.log('Connecting to MongoDB...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const sessionsCollection = db.collection('sessions');
    
    // 1. Delete sessions with null IDs
    console.log('Removing sessions with null IDs...');
    const nullResult = await sessionsCollection.deleteMany({ id: null });
    console.log(`Removed ${nullResult.deletedCount} sessions with null IDs`);
    
    // 2. Find and remove expired sessions
    console.log('Removing expired sessions...');
    const now = new Date();
    const expiredResult = await sessionsCollection.deleteMany({
      expires: { $lt: now }
    });
    console.log(`Removed ${expiredResult.deletedCount} expired sessions`);
    
    // 3. Count remaining sessions
    const remainingCount = await sessionsCollection.countDocuments();
    console.log(`Remaining valid sessions: ${remainingCount}`);
    
    console.log('Session fix completed successfully');
  } catch (error) {
    console.error('Error fixing sessions:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
fixSessions().catch(console.error);