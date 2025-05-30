// Script to directly fix a user document in MongoDB
const mongoose = require('mongoose');

// MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://user:System123@cluster0.bwfouog.mongodb.net/SkillSwap?retryWrites=true&w=majority';

// Define the user schema
const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String },
  email: { type: String },
  location: { type: String },
  skillsToTeach: { type: [String], default: [] },
  skillsToLearn: { type: [String], default: [] },
  bio: { type: String, default: '' },
  imageUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Create the model
const UserModel = mongoose.model('User', userSchema);

async function fixUser(userId) {
  try {
    console.log(`Fixing user with ID: ${userId}`);
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('Connected to MongoDB');
    
    // Find the user
    const user = await UserModel.findOne({ id: userId });
    
    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return;
    }
    
    console.log('Found user:', {
      id: user.id,
      username: user.username,
      bio: user.bio,
      imageUrl: user.imageUrl
    });
    
    // Update the user with bio and imageUrl fields
    const result = await UserModel.updateOne(
      { id: userId },
      { 
        $set: { 
          bio: user.bio || '',
          imageUrl: user.imageUrl || null
        } 
      }
    );
    
    console.log('Update result:', result);
    
    // Verify the update
    const updatedUser = await UserModel.findOne({ id: userId });
    
    console.log('Updated user:', {
      id: updatedUser.id,
      username: updatedUser.username,
      bio: updatedUser.bio,
      imageUrl: updatedUser.imageUrl
    });
    
    // Try a direct update using the native MongoDB driver
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    const nativeResult = await collection.updateOne(
      { id: userId },
      { 
        $set: { 
          bio: '',
          imageUrl: null
        } 
      }
    );
    
    console.log('Native MongoDB update result:', nativeResult);
    
    // Verify again
    const finalUser = await UserModel.findOne({ id: userId });
    
    console.log('Final user state:', {
      id: finalUser.id,
      username: finalUser.username,
      bio: finalUser.bio,
      imageUrl: finalUser.imageUrl,
      // Show all fields
      allFields: Object.keys(finalUser._doc)
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Get the user ID from command line arguments
const userId = process.argv[2] ? parseInt(process.argv[2], 10) : 4;

// Run the function
fixUser(userId).catch(console.error);