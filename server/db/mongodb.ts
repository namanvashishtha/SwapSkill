import mongoose from 'mongoose';
import { User } from '../../shared/schema.js';

// MongoDB Atlas connection string
// Use environment variable if available, otherwise use the default connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://user:System123@cluster0.bwfouog.mongodb.net/SkillSwap?retryWrites=true&w=majority';

export { MONGODB_URI };

export async function connectToMongoDB() {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    
    // Check if the connection string is properly set
    if (!MONGODB_URI || MONGODB_URI.includes('user:System123')) {
      console.warn('Warning: Using default MongoDB connection string. Consider setting MONGODB_URI environment variable.');
    }

    // First attempt with standard configuration
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,  // Increased timeout for better reliability
        connectTimeoutMS: 15000,          // Increased timeout for better reliability
        socketTimeoutMS: 45000,           // Timeout for socket inactivity
        maxPoolSize: 10,                  // Maintain up to 10 socket connections
        minPoolSize: 1,                   // Reduced minimum connections
        maxIdleTimeMS: 30000,             // Close connections after 30 seconds of inactivity
        bufferCommands: false,            // Disable mongoose buffering
        retryWrites: true,                // Enable retryable writes
        w: 'majority',                    // Write concern
        // Family 4 forces IPv4, which can help with some connection issues
        family: 4,
      });
      console.log('Connected using primary configuration');
    } catch (primaryError) {
      console.log('Primary connection attempt failed, trying fallback configuration...');
      console.log('Primary error:', primaryError instanceof Error ? primaryError.message : String(primaryError));
      
      // Fallback attempt with different settings
      if (process.env.NODE_ENV === 'development') {
        try {
          await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 20000,
            connectTimeoutMS: 20000,
            socketTimeoutMS: 60000,
            maxPoolSize: 5,
            minPoolSize: 1,
            bufferCommands: false,
            retryWrites: true,
            w: 'majority',
            // Try without explicit family setting
          });
          console.log('Connected using fallback configuration (development mode)');
        } catch (fallbackError) {
          console.log('Fallback connection also failed:', fallbackError instanceof Error ? fallbackError.message : String(fallbackError));
          throw primaryError; // Re-throw the original error
        }
      } else {
        throw primaryError; // Re-throw the original error in production
      }
    }
    
    // Test the connection by performing a simple operation
    // Check if connection.db exists before trying to access it
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
    } else {
      // If db is not available, we can just check if the connection state is connected
      if (mongoose.connection.readyState !== 1) { // 1 = connected
        throw new Error('MongoDB connection not ready');
      }
    }
    
    console.log('Connected to MongoDB Atlas with Mongoose');
    
    // Fix existing user documents that might be missing bio and imageUrl fields
    try {
      console.log('Checking for users with missing bio or imageUrl fields...');
      
      // Find users without bio or imageUrl fields
      const usersToFix = await UserModel.find({
        $or: [
          { bio: { $exists: false } },
          { imageUrl: { $exists: false } }
        ]
      });
      
      if (usersToFix.length > 0) {
        console.log(`Found ${usersToFix.length} users with missing fields. Fixing...`);
        
        // Update each user to add the missing fields
        for (const user of usersToFix) {
          await UserModel.updateOne(
            { _id: user._id },
            { 
              $set: { 
                bio: user.bio || '',
                imageUrl: user.imageUrl || null
              } 
            }
          );
        }
        
        console.log('Fixed users with missing fields');
      } else {
        console.log('No users with missing fields found');
      }
    } catch (fixError) {
      console.error('Error fixing user documents:', fixError);
      // Continue even if fixing fails
    }
    
    return true;
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error instanceof Error ? error.message : String(error));
    
    // Provide more helpful error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || error.message.includes('failed to connect')) {
        console.error('Connection error: Check your internet connection and MongoDB Atlas hostname');
      } else if (error.message.includes('Authentication failed')) {
        console.error('Authentication error: Check your MongoDB Atlas username and password');
      } else if (error.message.includes('not whitelisted')) {
        console.error('IP whitelist error: Your current IP address needs to be added to MongoDB Atlas whitelist');
        console.error('Visit: https://www.mongodb.com/docs/atlas/security-whitelist/ for instructions');
      } else if (error.message.includes('SSL') || error.message.includes('TLS') || error.message.includes('ssl') || error.message.includes('tls')) {
        console.error('SSL/TLS error: There is an issue with the secure connection to MongoDB Atlas');
        console.error('This could be due to:');
        console.error('1. Network firewall blocking SSL connections');
        console.error('2. Corporate proxy interfering with SSL');
        console.error('3. Outdated Node.js version');
        console.error('4. MongoDB Atlas cluster configuration issue');
        console.error('Continuing with memory storage for development...');
      } else if (error.message.includes('MongoNetworkError')) {
        console.error('Network error: Unable to reach MongoDB Atlas');
        console.error('This could be due to network connectivity issues or firewall restrictions');
      }
    }
    
    // Always throw error - MongoDB is required for all environments
    throw error;
  }
}

// Define MongoDB schemas
const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String },
  email: { type: String },
  location: { type: String },
  skillsToTeach: { type: [String], default: [] },
  skillsToLearn: { type: [String], default: [] },
  bio: { type: String, default: '' }, // Bio field with default empty string
  imageUrl: { type: String, default: null }, // Keep imageUrl optional but with default null
  createdAt: { type: Date, default: Date.now }
});

const skillSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true },
  skillName: { type: String, required: true },
  skillType: { type: String, required: true, enum: ['teach', 'learn'] },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Match schema for skill matching system
const matchSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  fromUserId: { type: Number, required: true },
  toUserId: { type: Number, required: true },
  status: { type: String, required: true, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Notification schema
const notificationSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true },
  type: { type: String, required: true, enum: ['match_request', 'match_accepted', 'message'] },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedUserId: { type: Number },
  relatedMatchId: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

// Chat message schema
const chatMessageSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  matchId: { type: Number, required: true },
  senderId: { type: Number, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Review schema
const reviewSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  reviewerId: { type: Number, required: true },
  revieweeId: { type: Number, required: true },
  matchId: { type: Number, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Create models
export const UserModel = mongoose.model('User', userSchema);
export const SkillModel = mongoose.model('Skill', skillSchema);
export const MatchModel = mongoose.model('Match', matchSchema);
export const NotificationModel = mongoose.model('Notification', notificationSchema);
export const ChatMessageModel = mongoose.model('ChatMessage', chatMessageSchema);
export const ReviewModel = mongoose.model('Review', reviewSchema);

// Helper functions
export function mongoUserToAppUser(mongoUser: any): User & { bio?: string; imageUrl?: string | null } {
  // Log the MongoDB user object for debugging
  console.log('Converting MongoDB user to app user:', {
    ...mongoUser,
    password: mongoUser.password ? '[REDACTED]' : undefined
  });
  
  return {
    id: mongoUser.id,
    username: mongoUser.username,
    password: mongoUser.password,
    fullName: mongoUser.fullName || null,
    email: mongoUser.email || null,
    location: mongoUser.location || null,
    skillsToTeach: mongoUser.skillsToTeach || [],
    skillsToLearn: mongoUser.skillsToLearn || [],
    bio: mongoUser.bio || '',
    imageUrl: mongoUser.imageUrl || null,
  };
}

export function appUserToMongoUser(user: User & { bio?: string; imageUrl?: string | null }) {
  // Create the MongoDB user object with explicit bio and imageUrl fields
  const mongoUser = {
    id: user.id,
    username: user.username,
    password: user.password,
    fullName: user.fullName,
    email: user.email,
    location: user.location,
    skillsToTeach: user.skillsToTeach || [],
    skillsToLearn: user.skillsToLearn || [],
    bio: user.bio || '',
    imageUrl: user.imageUrl || null,
  };
  
  // Log the conversion for debugging
  console.log('Converting app user to MongoDB user:', {
    ...mongoUser,
    password: '[REDACTED]'
  });
  
  return mongoUser;
}

// Add a direct function to update user bio and image
export async function updateUserBioAndImage(userId: number, bio: string, imageUrl: string | null): Promise<boolean> {
  try {
    console.log(`Direct MongoDB update for user ${userId}:`, { bio, imageUrl });
    
    // Use updateOne with $set to ensure fields are added
    const result = await UserModel.updateOne(
      { id: userId },
      { 
        $set: { 
          bio: bio || '',
          imageUrl: imageUrl
        } 
      }
    );
    
    console.log('Direct MongoDB update result:', result);
    
    // Check if the update was successful
    if (result.matchedCount === 0) {
      console.error('Direct MongoDB update failed: No document matched the filter criteria');
      return false;
    }
    
    // Verify the update
    const verifyUser = await UserModel.findOne({ id: userId });
    console.log('Verified user after direct update:', {
      id: verifyUser?.id,
      bio: verifyUser?.bio,
      imageUrl: verifyUser?.imageUrl
    });
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Direct MongoDB update error:', error);
    return false;
  }
} 