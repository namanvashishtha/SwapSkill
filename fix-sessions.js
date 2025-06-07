// Load environment variables from .env file
import 'dotenv/config';
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/SkillSwap";

async function clearCorruptedSessions() {
  console.log("Starting session cleanup script...");
  
  let client;
  try {
    // Connect to MongoDB directly
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db();
    const sessionsCollection = db.collection('sessions');
    
    // Remove any sessions with null IDs that would cause duplicate key errors
    const result = await sessionsCollection.deleteMany({ id: null });
    console.log(`Cleaned up ${result.deletedCount} sessions with null IDs`);
    
    // Also delete any other potentially problematic sessions
    // This is a more aggressive approach to clear session-related issues
    const indexesResult = await sessionsCollection.listIndexes().toArray();
    console.log("Current indexes:", indexesResult);
    
    console.log("Session cleanup completed successfully");
  } catch (error) {
    console.error("Error during session cleanup:", error);
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
    process.exit(0);
  }
}

// Run the function
clearCorruptedSessions();