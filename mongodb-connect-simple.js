// Simple MongoDB connection test with CommonJS
const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb+srv://user:System123@cluster0.bwfouog.mongodb.net/?retryWrites=true&w=majority';

// Create a new MongoClient
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Connect to MongoDB
async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas");
    
    // Get the list of databases
    const adminDb = client.db('admin');
    const dbs = await adminDb.admin().listDatabases();
    
    console.log('Available databases:');
    dbs.databases.forEach(db => console.log(` - ${db.name}`));
    
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);