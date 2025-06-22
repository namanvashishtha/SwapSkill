import { MongoClient } from 'mongodb';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://user:System123@cluster0.bwfouog.mongodb.net/SkillSwap?retryWrites=true&w=majority';

async function fixSessions() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    
    const db = client.db();
    console.log('Connected successfully');
    
    // Get all collections to check for sessions
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Check for session collections
    const sessionCollections = collections.filter(c => 
      c.name.toLowerCase().includes('session')
    );
    
    if (sessionCollections.length === 0) {
      console.log('No session collections found, creating fresh sessions collection...');
      // Create a new sessions collection to ensure it exists
      await db.createCollection('sessions');
      console.log('Created fresh sessions collection');
    } else {
      console.log('Found session collections:', sessionCollections.map(c => c.name));
      
      // Drop all session collections to start fresh
      for (const collection of sessionCollections) {
        console.log(`Dropping collection: ${collection.name}`);
        try {
          await db.dropCollection(collection.name);
          console.log(`Successfully dropped ${collection.name}`);
        } catch (error) {
          console.log(`Could not drop ${collection.name}:`, error.message);
        }
      }
      
      // Create fresh sessions collection
      await db.createCollection('sessions');
      console.log('Created fresh sessions collection');
    }
    
    console.log('Session cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error fixing sessions:', error);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

// Run the fix
console.log('Starting critical session fix...');
fixSessions()
  .then(() => {
    console.log('Session fix completed. You can now restart your server.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Session fix failed:', error);
    process.exit(1);
  });