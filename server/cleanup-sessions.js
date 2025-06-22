import { MongoClient } from 'mongodb';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://user:System123@cluster0.bwfouog.mongodb.net/SkillSwap?retryWrites=true&w=majority';

async function cleanupSessions() {
  try {
    console.log('Connecting to MongoDB to clean up sessions...');
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    // Try different possible session collection names
    const possibleCollections = ['sessions', 'Sessions', 'session'];
    
    for (const collectionName of possibleCollections) {
      try {
        const collections = await db.listCollections({ name: collectionName }).toArray();
        if (collections.length > 0) {
          console.log(`Found session collection: ${collectionName}`);
          const collection = db.collection(collectionName);
          
          // Delete all sessions to start fresh
          const result = await collection.deleteMany({});
          console.log(`Deleted ${result.deletedCount} sessions from ${collectionName}`);
        }
      } catch (err) {
        console.log(`Collection ${collectionName} not found or error accessing it`);
      }
    }
    
    await client.close();
    console.log('Session cleanup completed successfully');
  } catch (error) {
    console.error('Error during session cleanup:', error);
  }
}

cleanupSessions();