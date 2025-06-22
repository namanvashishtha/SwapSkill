import { users, type User, type InsertUser } from "../shared/schema.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import { MongoClient, ObjectId, Filter, Document } from "mongodb";
import { 
  UserModel, 
  SkillModel, 
  AvailableSkillModel,
  MatchModel, 
  NotificationModel, 
  ChatMessageModel,
  ReviewModel,
  SessionModel,
  mongoUserToAppUser, 
  appUserToMongoUser, 
  connectToMongoDB, 
  MONGODB_URI,
  initializeAvailableSkills
} from "./db/mongodb.js";

// Helper function to create properly typed MongoDB filters
function createFilter<T extends Document>(filter: Record<string, any>): Filter<T> {
  return filter as Filter<T>;
}

// Simplified interface for pure MongoDB storage
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  sessionStore: any;
  initialize(): Promise<void>;
  // MongoDB-specific methods
  saveMatch(match: any): Promise<any>;
  saveNotification(notification: any): Promise<void>;
  saveMessage(message: any): Promise<any>;
  saveReview(review: any): Promise<void>;
  getNextId(): Promise<number>;
  // Query methods
  getMatches(filter?: any): Promise<any[]>;
  getMatch(id: number): Promise<any | undefined>;
  updateMatch(id: number, updateData: any): Promise<any | undefined>;
  deleteMatch(id: number): Promise<boolean>;
  getNotifications(filter?: any): Promise<any[]>;
  updateNotification(id: number, updateData: any): Promise<any | undefined>;
  deleteNotification(id: number): Promise<boolean>;
  getMessages(filter?: any): Promise<any[]>;
  updateMessage(id: number, updateData: any): Promise<any | undefined>;
  getReviews(filter?: any): Promise<any[]>;
  // Additional methods for better organization
  deleteMessage(id: number): Promise<boolean>;
  deleteChatMessages(filter?: any): Promise<boolean>;
  // Available skills methods
  getAvailableSkills(filter?: any): Promise<any[]>;
  getAvailableSkill(id: number): Promise<any | undefined>;
  createAvailableSkill(skill: any): Promise<any>;
  updateAvailableSkill(id: number, updateData: any): Promise<any | undefined>;
  // Session methods
  saveSession(session: any): Promise<any>;
  getSessions(filter?: any): Promise<any[]>;
  getSession(id: number): Promise<any | undefined>;
  updateSession(id: number, updateData: any): Promise<any | undefined>;
  deleteSession(id: number): Promise<boolean>;
  deleteAvailableSkill(id: number): Promise<boolean>;
}

export class MongoStorage implements IStorage {
  sessionStore: any;
  private isConnected: boolean = false;
  private currentId: number = 1;

  constructor() {
    // Create MongoDB session store with improved configuration
    this.sessionStore = MongoStore.create({
      mongoUrl: MONGODB_URI,
      ttl: 60 * 60 * 24, // 1 day
      crypto: {
        secret: process.env.SESSION_SECRET || 'skillswap-session-secret'
      },
      autoRemove: 'native', // Use MongoDB TTL for expired session cleanup
      autoRemoveInterval: 10, // Check for expired sessions every 10 minutes
      touchAfter: 24 * 3600, // Reduce write operations
      collectionName: 'sessions',
      stringify: false,
      // Add additional options to handle potential duplicate key issues
      transformId: (raw) => {
        // Ensure session IDs are never null
        return raw || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      },
      // Add proper MongoDB client options
      clientPromise: (async () => {
        const client = new MongoClient(MONGODB_URI, {
          maxPoolSize: 10,
          minPoolSize: 1,
          socketTimeoutMS: 45000,
          connectTimeoutMS: 15000,
          serverSelectionTimeoutMS: 15000,
        });
        await client.connect();
        return client;
      })()
    });
    
    // Add error handling for session store
    this.sessionStore.on('error', (error) => {
      console.error('Session store error:', error);
      // If it's a decryption error, the session will be ignored
      if (error.message.includes('Unable to parse ciphertext')) {
        console.log('Ignoring corrupted session');
      }
    });
    
    // The session ID generation will be handled by express-session
    console.log('MongoDB session store created');
  }

  // Simplified session store initialization
  async initializeSessionStore(): Promise<void> {
    try {
      // Add error event listener to the session store
      this.sessionStore.on('error', (error: any) => {
        console.error('Session Store Error:', error);
        // Log and continue - don't crash the app
      });

      console.log('Session store initialized successfully');
    } catch (error) {
      console.error('Failed to initialize session store:', error);
      throw error;
    }
  }

  // Simplified and more reliable initialize method
  async initialize(): Promise<void> {
    try {
      // Connect to MongoDB - this will throw an error if connection fails
      await connectToMongoDB();
      this.isConnected = true;
      
      console.log('MongoDB connection established');
      
      // Initialize session store with error handling
      await this.initializeSessionStore();
      
      // Set the current ID based on existing data
      await this.initializeCurrentId();
      
      // Create initial users if they don't exist
      await this.createInitialUsers();
      
      // Initialize available skills if they don't exist
      await initializeAvailableSkills();
      
      console.log('MongoDB storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MongoDB storage:', error);
      this.isConnected = false;
      throw error; // Always fail if MongoDB is not available
    }
  }
  
  // Direct MongoDB cleanup for sessions with null IDs to prevent duplicate key errors
  async forceRemoveNullIdSessions(): Promise<void> {
    try {
      console.log('Performing direct MongoDB cleanup of sessions with null IDs...');
      
      // Connect directly to MongoDB to clean up sessions
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const db = client.db();
      
      // List of possible session collection names
      const possibleCollections = ['sessions', 'Sessions', 'session'];
      
      for (const collName of possibleCollections) {
        try {
          // Check if collection exists
          const collections = await db.listCollections({ name: collName }).toArray();
          if (collections.length > 0) {
            const collection = db.collection(collName);
            
            // Remove all documents with id: null
            const deleteResult = await collection.deleteMany(createFilter<Document>({ id: null }));
            console.log(`Removed ${deleteResult.deletedCount} sessions with null IDs from ${collName}`);
            
            // Also remove documents with _id: null if any exist
            // Use our helper function to create properly typed filters
            const deleteIdResult = await collection.deleteMany(createFilter<Document>({ 
              $or: [
                { _id: { $exists: false } },
                { _id: { $type: 10 } }  // 10 is the BSON type for null
              ]
            }));
            
            if (deleteIdResult.deletedCount > 0) {
              console.log(`Removed ${deleteIdResult.deletedCount} sessions with null _id from ${collName}`);
            }
          }
        } catch (e) {
          // Ignore errors if collection doesn't exist
          console.log(`Collection ${collName} not found or error accessing it`);
        }
      }
      
      await client.close();
      console.log('Direct MongoDB cleanup completed');
    } catch (error) {
      console.error('Error during direct MongoDB session cleanup:', error);
      // Don't throw error, try to continue
    }
  }
  
  // Method to forcibly clear all sessions as a last resort
  async purgeAllSessions(): Promise<void> {
    try {
      console.log('PURGING ALL SESSIONS due to persistent corruption issues...');
      
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const db = client.db();
      
      // Try to clean both potential session collections
      const collections = ['sessions', 'Sessions'];
      
      for (const collectionName of collections) {
        try {
          const exists = await db.listCollections({ name: collectionName }).toArray();
          if (exists.length > 0) {
            // Drop entire collection to completely reset sessions
            await db.dropCollection(collectionName);
            console.log(`Dropped entire ${collectionName} collection to resolve persistent session issues`);
          }
        } catch (err) {
          console.log(`Collection ${collectionName} not found or could not be dropped`);
        }
      }
      
      await client.close();
      console.log('Session purge complete. All sessions have been cleared.');
    } catch (error) {
      console.error('Error during session purge:', error);
    }
  }
  
  // Method to clear corrupted sessions (sessions with null IDs)
  async clearCorruptedSessions(): Promise<void> {
    try {
      console.log('Starting cleanup of corrupted sessions...');
      
      // First approach: Try to access sessions collection directly from MongoDB (more reliable method)
      try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db();
        
        // Check for multiple collections that might contain sessions
        const collections = ['sessions', 'Sessions'];
        
        for (const collectionName of collections) {
          try {
            const sessionsCollection = db.collection(collectionName);
            
            // Remove any sessions with null IDs that would cause duplicate key errors
            const result = await sessionsCollection.deleteMany(createFilter<Document>({ id: null }));
            if (result.deletedCount > 0) {
              console.log(`Cleaned up ${result.deletedCount} corrupted sessions from ${collectionName} collection`);
            }
            
            // Also clean up sessions with invalid _id if any
            const nullIdResult = await sessionsCollection.deleteMany(createFilter<Document>({ 
              $or: [
                { _id: { $exists: false } },
                { _id: { $type: 10 } }  // 10 is the BSON type for null
              ] 
            }));
            if (nullIdResult.deletedCount > 0) {
              console.log(`Cleaned up ${nullIdResult.deletedCount} sessions with null _id from ${collectionName} collection`);
            }
            
            // Also clean up sessions that might have corrupted data
            try {
              // Find all sessions to check for corruption
              const allSessions = await sessionsCollection.find({}).toArray();
              let corruptedCount = 0;
              
              for (const session of allSessions) {
                // Check for signs of corruption in the session data
                try {
                  if (
                    (session.session && typeof session.session === 'string' && 
                     (session.session.includes('Unable to parse') || !session.session.startsWith('{'))) ||
                    (session.expires && new Date(session.expires) < new Date())
                  ) {
                    // Delete corrupted session
                    await sessionsCollection.deleteOne({ _id: session._id });
                    corruptedCount++;
                  }
                } catch (parseError) {
                  // If there's an error checking the session, it's likely corrupted
                  await sessionsCollection.deleteOne({ _id: session._id });
                  corruptedCount++;
                }
              }
              
              if (corruptedCount > 0) {
                console.log(`Removed ${corruptedCount} corrupted or expired sessions from ${collectionName}`);
              }
            } catch (sessionError) {
              console.error(`Error cleaning corrupted sessions in ${collectionName}:`, sessionError);
            }
          } catch (collErr) {
            console.log(`Collection ${collectionName} not found or could not be accessed`);
          }
        }
        
        await client.close();
      } catch (mongoErr) {
        console.error('Direct MongoDB cleanup failed, trying alternative method:', mongoErr);
        
        // Second approach: Using Mongoose model
        const SessionModel = await this.getSessionModel();
        if (SessionModel) {
          // Remove any sessions with null IDs - using type assertion for mongoose
          const result = await SessionModel.deleteMany({ id: null } as any);
          if (result.deletedCount > 0) {
            console.log(`Cleaned up ${result.deletedCount} corrupted sessions using SessionModel`);
          }
        }
      }
      
      // Third approach: Try using the session store directly if available
      if (this.sessionStore && typeof this.sessionStore.all === 'function') {
        try {
          // Using purely callback style for connect-mongo
          await new Promise<void>((resolve) => {
            try {
              // The .all() method in connect-mongo is callback-based
              this.sessionStore.all((err: Error | null, sessions: Record<string, any> | null) => {
                if (err) {
                  console.error('Error retrieving sessions:', err);
                  return resolve(); // Continue even if we can't get sessions
                }
                
                if (!sessions || typeof sessions !== 'object') {
                  console.log('No sessions found or invalid sessions object');
                  return resolve();
                }
                
                let cleaned = 0;
                const sessionIds = Object.keys(sessions);
                
                // No sessions to process
                if (sessionIds.length === 0) {
                  return resolve();
                }
                
                // Process each session one by one
                let processed = 0;
                
                sessionIds.forEach((sid) => {
                  const session = sessions[sid];
                  
                  if (!session || session.id === null) {
                    this.sessionStore.destroy(sid, (destroyErr: Error | null) => {
                      if (destroyErr) {
                        console.error(`Error destroying session ${sid}:`, destroyErr);
                      } else {
                        cleaned++;
                      }
                      
                      processed++;
                      if (processed === sessionIds.length) {
                        if (cleaned > 0) {
                          console.log(`Cleaned up ${cleaned} corrupted sessions using sessionStore`);
                        }
                        resolve();
                      }
                    });
                  } else {
                    processed++;
                    if (processed === sessionIds.length) {
                      if (cleaned > 0) {
                        console.log(`Cleaned up ${cleaned} corrupted sessions using sessionStore`);
                      }
                      resolve();
                    }
                  }
                });
              });
            } catch (error) {
              console.error('Error in session store all() operation:', error);
              resolve(); // Continue execution even if there's an error
            }
          });
        } catch (storeErr) {
          console.error('Session store cleanup failed:', storeErr);
        }
      }
      
      console.log('Corrupted session cleanup completed');
    } catch (error) {
      console.error('Error clearing corrupted sessions:', error);
    }
  }
  
  // Method to get the session model (needed for clearCorruptedSessions)
  private async getSessionModel() {
    try {
      // This will use the MongoDB model to access the sessions collection
      return SessionModel;
    } catch (error) {
      console.error('Error getting session model:', error);
      return null;
    }
  }
  
  // Method to clear expired sessions
  async clearExpiredSessions(): Promise<void> {
    try {
      // First method: Clear expired sessions from the session store
      if (this.sessionStore && typeof this.sessionStore.all === 'function') {
        const now = new Date();
        
        try {
          // Using purely callback style for connect-mongo
          await new Promise<void>((resolve) => {
            try {
              // The .all() method in connect-mongo is callback-based
              this.sessionStore.all((err: Error | null, sessions: Record<string, any> | null) => {
                if (err) {
                  console.error('Error retrieving sessions:', err);
                  return resolve(); // Continue even if we can't get sessions
                }
                
                if (!sessions || typeof sessions !== 'object') {
                  console.log('No sessions found or invalid sessions object');
                  return resolve();
                }
                
                let expired = 0;
                const sessionIds = Object.keys(sessions);
                
                // No sessions to process
                if (sessionIds.length === 0) {
                  return resolve();
                }
                
                // Process each session one by one
                let processed = 0;
                
                sessionIds.forEach((sid) => {
                  const session = sessions[sid];
                  
                  if (session && session.expires && new Date(session.expires) < now) {
                    this.sessionStore.destroy(sid, (destroyErr: Error | null) => {
                      if (destroyErr) {
                        console.error(`Error destroying expired session ${sid}:`, destroyErr);
                      } else {
                        expired++;
                      }
                      
                      processed++;
                      if (processed === sessionIds.length) {
                        if (expired > 0) {
                          console.log(`Cleaned up ${expired} expired sessions`);
                        }
                        resolve();
                      }
                    });
                  } else {
                    processed++;
                    if (processed === sessionIds.length) {
                      if (expired > 0) {
                        console.log(`Cleaned up ${expired} expired sessions`);
                      }
                      resolve();
                    }
                  }
                });
              });
            } catch (error) {
              console.error('Error in session store all() operation:', error);
              resolve(); // Continue execution even if there's an error
            }
          });
        } catch (error) {
          console.error('Error clearing expired sessions from session store:', error);
        }
      }

      // Second method: Clear expired sessions from the MongoDB collection directly
      const now = new Date();
      await SessionModel.deleteMany({ expires: { $lt: now } });
      
      console.log('Expired sessions cleared');
    } catch (error) {
      console.error('Error during session cleanup:', error);
    }
  }

  private async initializeCurrentId(): Promise<void> {
    try {
      // Find the highest ID across all collections
      const [maxUserId, maxMatchId, maxNotificationId, maxMessageId, maxReviewId, maxSessionId] = await Promise.all([
        UserModel.findOne({}, { id: 1 }).sort({ id: -1 }).lean(),
        MatchModel.findOne({}, { id: 1 }).sort({ id: -1 }).lean(),
        NotificationModel.findOne({}, { id: 1 }).sort({ id: -1 }).lean(),
        ChatMessageModel.findOne({}, { id: 1 }).sort({ id: -1 }).lean(),
        ReviewModel.findOne({}, { id: 1 }).sort({ id: -1 }).lean(),
        SessionModel.findOne({}, { id: 1 }).sort({ id: -1 }).lean()
      ]);

      const maxId = Math.max(
        maxUserId?.id || 0,
        maxMatchId?.id || 0,
        maxNotificationId?.id || 0,
        maxMessageId?.id || 0,
        maxReviewId?.id || 0,
        maxSessionId?.id || 0
      );

      this.currentId = maxId + 1;
      console.log(`Set currentId to ${this.currentId} based on existing data`);
    } catch (error) {
      console.error('Error initializing currentId:', error);
      this.currentId = 1; // Default fallback
    }
  }

  private async createInitialUsers(): Promise<void> {
    const initialUsers: InsertUser[] = [
      {
        username: "priya_sharma",
        password: "$2b$10$5DdJMx9lIKUhpL0JFCYQgOEJgZGWOVJ6.s57aCGxzn5Zix5OXw4NO", // "password123"
        fullName: "Priya Sharma",
        email: "priya.sharma@example.com",
        location: "Mumbai, India",
        skillsToTeach: ["Yoga", "Meditation"],
        skillsToLearn: ["Python", "Web Development"],
      },
      {
        username: "raj_patel",
        password: "$2b$10$5DdJMx9lIKUhpL0JFCYQgOEJgZGWOVJ6.s57aCGxzn5Zix5OXw4NO", // "password123"
        fullName: "Raj Patel",
        email: "raj.patel@example.com",
        location: "Bangalore, India",
        skillsToTeach: ["Guitar", "Music Theory"],
        skillsToLearn: ["Digital Marketing", "SEO"],
      },
      {
        username: "ananya_desai",
        password: "$2b$10$5DdJMx9lIKUhpL0JFCYQgOEJgZGWOVJ6.s57aCGxzn5Zix5OXw4NO", // "password123"
        fullName: "Ananya Desai",
        email: "ananya.desai@example.com",
        location: "Delhi, India",
        skillsToTeach: ["Cooking", "Baking"],
        skillsToLearn: ["Photography", "Video Editing"],
      },
    ];
    
    for (const user of initialUsers) {
      try {
        // Check if user already exists by username before creating
        const existingUser = await this.getUserByUsername(user.username);
        if (!existingUser) {
          await this.createUser(user);
          console.log(`Created initial user: ${user.username}`);
        } else {
          console.log(`Initial user ${user.username} already exists, skipping creation`);
        }
      } catch (error) {
        console.error(`Error creating initial user ${user.username}:`, error);
      }
    }
  }

  async getNextId(): Promise<number> {
    return this.currentId++;
  }

  async getUser(id: number): Promise<User | undefined> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot retrieve user data.');
    }
    
    try {
      const mongoUser = await UserModel.findOne({ id }).lean();
      if (mongoUser) {
        return mongoUserToAppUser(mongoUser);
      }
      return undefined;
    } catch (error) {
      console.error('MongoDB getUser error:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot retrieve user data.');
    }
    
    try {
      const mongoUser = await UserModel.findOne({ username }).lean();
      if (mongoUser) {
        return mongoUserToAppUser(mongoUser);
      }
      return undefined;
    } catch (error) {
      console.error('MongoDB getUserByUsername error:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot create user.');
    }
    
    try {
      const id = await this.getNextId();
      
      // Create user object with proper defaults
      const user: User = { 
        ...insertUser, 
        id,
        fullName: insertUser.fullName || null,
        email: insertUser.email || null,
        location: insertUser.location || null,
        skillsToTeach: insertUser.skillsToTeach || [],
        skillsToLearn: insertUser.skillsToLearn || [],
        bio: insertUser.bio || '',
        imageUrl: insertUser.imageUrl || null
      };
      
      console.log('MongoDB - Creating user:', {
        ...user,
        password: '[REDACTED]'
      });
      
      // Convert to MongoDB format and save
      const mongoUser = appUserToMongoUser(user);
      await UserModel.create(mongoUser);
      
      console.log(`User ${user.username} created successfully with ID ${id}`);
      return user;
    } catch (error) {
      console.error('MongoDB createUser error:', error);
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot update user.');
    }
    
    try {
      // Build update payload
      const updatePayload: any = {};
      
      for (const key in userData) {
        if (Object.prototype.hasOwnProperty.call(userData, key)) {
          const K = key as keyof Partial<User>;
          
          // Skip 'id' from being updated
          if (K === 'id') continue;
          
          if (userData[K] !== undefined) {
            if (K === 'bio') {
              updatePayload[K] = userData[K] || '';
            } else {
              updatePayload[K] = userData[K];
            }
          }
        }
      }
      
      if (Object.keys(updatePayload).length === 0) {
        console.log('No fields to update');
        return this.getUser(id);
      }
      
      console.log('MongoDB update operation:', { id, updatePayload });
      
      const updateResult = await UserModel.updateOne(
        { id },
        { $set: updatePayload }
      );
      
      console.log('MongoDB update result:', updateResult);
      
      if (updateResult.matchedCount === 0) {
        console.error('No user found with id:', id);
        return undefined;
      }
      
      // Return the updated user
      return this.getUser(id);
    } catch (error) {
      console.error('MongoDB updateUser error:', error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot delete user.');
    }
    
    try {
      const result = await UserModel.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('MongoDB deleteUser error:', error);
      throw error;
    }
  }

  // MongoDB-specific methods for other data types
  async saveMatch(match: any): Promise<any> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot save match.');
    }
    
    try {
      if (!match.id) {
        match.id = await this.getNextId();
      }
      
      const savedMatch = await MatchModel.findOneAndUpdate(
        { id: match.id },
        match,
        { upsert: true, new: true }
      );
      console.log('Match saved to MongoDB:', match.id);
      return savedMatch;
    } catch (error) {
      console.error('Error saving match to MongoDB:', error);
      throw error;
    }
  }

  async saveNotification(notification: any): Promise<void> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot save notification.');
    }
    
    try {
      if (!notification.id) {
        notification.id = await this.getNextId();
      }
      
      await NotificationModel.findOneAndUpdate(
        { id: notification.id },
        notification,
        { upsert: true, new: true }
      );
      console.log('Notification saved to MongoDB:', notification.id);
    } catch (error) {
      console.error('Error saving notification to MongoDB:', error);
      throw error;
    }
  }

  async saveMessage(message: any): Promise<any> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot save message.');
    }
    
    try {
      if (!message.id) {
        message.id = await this.getNextId();
      }
      
      const savedMessage = await ChatMessageModel.findOneAndUpdate(
        { id: message.id },
        message,
        { upsert: true, new: true }
      );
      console.log('Message saved to MongoDB:', message.id);
      return savedMessage;
    } catch (error) {
      console.error('Error saving message to MongoDB:', error);
      throw error;
    }
  }

  // Helper methods for querying notifications

  async getNotifications(filter: any = {}): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot retrieve notifications.');
    }
    
    try {
      const notifications = await NotificationModel.find(filter).lean();
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async updateNotification(id: number, updateData: any): Promise<any | undefined> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot update notification.');
    }
    
    try {
      const updatedNotification = await NotificationModel.findOneAndUpdate(
        { id },
        { $set: { ...updateData, updatedAt: new Date() } },
        { new: true }
      ).lean();
      return updatedNotification;
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  }

  async deleteNotification(id: number): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot delete notification.');
    }
    
    try {
      const result = await NotificationModel.deleteOne({ id });
      console.log(`Deleted notification ${id}, deletedCount: ${result.deletedCount}`);
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }



  // Message-related methods
  async getMessages(filter: any = {}): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot retrieve messages.');
    }
    
    try {
      console.log('getMessages called with filter:', JSON.stringify(filter));
      const messages = await ChatMessageModel.find(filter).sort({ createdAt: 1 }).lean();
      console.log(`getMessages found ${messages.length} messages`);
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async updateMessage(id: number, updateData: any): Promise<any | undefined> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot update message.');
    }
    
    try {
      console.log(`updateMessage called for id: ${id} with data:`, JSON.stringify(updateData));
      const updatedMessage = await ChatMessageModel.findOneAndUpdate(
        { id },
        { $set: { ...updateData, updatedAt: new Date() } },
        { new: true }
      ).lean();
      console.log(`updateMessage result:`, updatedMessage ? 'SUCCESS' : 'NOT_FOUND');
      return updatedMessage;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  async deleteMessage(id: number): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot delete message.');
    }
    
    try {
      const result = await ChatMessageModel.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Match-related methods
  async getMatches(filter: any = {}): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot retrieve matches.');
    }
    
    try {
      console.log('getMatches called with filter:', JSON.stringify(filter));
      const matches = await MatchModel.find(filter).lean();
      console.log(`getMatches found ${matches.length} matches`);
      return matches;
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw error;
    }
  }

  async getMatch(id: number): Promise<any | null> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot retrieve match.');
    }
    
    try {
      console.log(`getMatch called for id: ${id}`);
      const match = await MatchModel.findOne({ id }).lean();
      console.log(`getMatch found match:`, match ? 'YES' : 'NO');
      return match;
    } catch (error) {
      console.error('Error fetching match:', error);
      throw error;
    }
  }

  async updateMatch(id: number, updateData: any): Promise<any | undefined> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot update match.');
    }
    
    try {
      console.log(`updateMatch called for id: ${id} with data:`, updateData);
      const updatedMatch = await MatchModel.findOneAndUpdate(
        { id },
        { $set: { ...updateData, updatedAt: new Date() } },
        { new: true }
      ).lean();
      
      console.log(`updateMatch result:`, updatedMatch ? 'SUCCESS' : 'NOT_FOUND');
      return updatedMatch || undefined;
    } catch (error) {
      console.error('Error updating match:', error);
      throw error;
    }
  }

  async deleteMatch(id: number): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot delete match.');
    }
    
    try {
      console.log(`deleteMatch called for id: ${id}`);
      const result = await MatchModel.deleteOne({ id });
      console.log(`deleteMatch result: deleted ${result.deletedCount} documents`);
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting match:', error);
      throw error;
    }
  }

  async deleteChatMessages(filter: any = {}): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot delete chat messages.');
    }
    
    try {
      console.log(`deleteChatMessages called with filter:`, filter);
      const result = await ChatMessageModel.deleteMany(filter);
      console.log(`deleteChatMessages result: deleted ${result.deletedCount} messages`);
      return result.deletedCount >= 0; // Return true even if 0 messages were deleted (no messages to delete)
    } catch (error) {
      console.error('Error deleting chat messages:', error);
      throw error;
    }
  }

  // Chat message methods (aliases for existing methods)
  async getChatMessages(filter: any = {}): Promise<any[]> {
    return this.getMessages(filter);
  }

  async saveChatMessage(message: any): Promise<any> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot save chat message.');
    }
    
    try {
      if (!message.id) {
        message.id = await this.getNextId();
      }
      
      console.log('Saving chat message:', JSON.stringify(message));
      
      const savedMessage = await ChatMessageModel.findOneAndUpdate(
        { id: message.id },
        message,
        { upsert: true, new: true }
      ).lean();
      
      console.log('Chat message saved to MongoDB:', savedMessage.id);
      return savedMessage;
    } catch (error) {
      console.error('Error saving chat message to MongoDB:', error);
      throw error;
    }
  }

  async updateChatMessage(id: number, updateData: any): Promise<any | undefined> {
    return this.updateMessage(id, updateData);
  }

  // Review methods
  async saveReview(review: any): Promise<void> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot save review.');
    }
    
    try {
      if (!review.id) {
        review.id = await this.getNextId();
      }
      
      await ReviewModel.findOneAndUpdate(
        { id: review.id },
        review,
        { upsert: true, new: true }
      );
      console.log('Review saved to MongoDB:', review.id);
    } catch (error) {
      console.error('Error saving review to MongoDB:', error);
      throw error;
    }
  }

  async getReviews(filter: any = {}): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot retrieve reviews.');
    }
    
    try {
      const reviews = await ReviewModel.find(filter).lean();
      return reviews;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  // Available skills methods
  async getAvailableSkills(filter: any = {}): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot retrieve available skills.');
    }
    
    try {
      const skills = await AvailableSkillModel.find({ isActive: true, ...filter }).lean();
      return skills;
    } catch (error) {
      console.error('Error fetching available skills:', error);
      throw error;
    }
  }

  async getAvailableSkill(id: number): Promise<any | undefined> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot retrieve available skill.');
    }
    
    try {
      const skill = await AvailableSkillModel.findOne({ id, isActive: true }).lean();
      return skill || undefined;
    } catch (error) {
      console.error('Error fetching available skill:', error);
      throw error;
    }
  }

  async createAvailableSkill(skillData: any): Promise<any> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot create available skill.');
    }
    
    try {
      // Check if skill already exists
      const existingSkill = await AvailableSkillModel.findOne({ 
        name: { $regex: new RegExp(`^${skillData.name}$`, 'i') } 
      }).lean();
      
      if (existingSkill) {
        return existingSkill;
      }

      // Get next ID
      const nextId = await this.getNextId();
      
      const newSkill = new AvailableSkillModel({
        id: nextId,
        name: skillData.name,
        category: skillData.category || 'Other',
        description: skillData.description || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedSkill = await newSkill.save();
      return savedSkill.toObject();
    } catch (error) {
      console.error('Error creating available skill:', error);
      throw error;
    }
  }

  async updateAvailableSkill(id: number, updateData: any): Promise<any | undefined> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot update available skill.');
    }
    
    try {
      const updatedSkill = await AvailableSkillModel.findOneAndUpdate(
        { id },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      ).lean();
      
      return updatedSkill || undefined;
    } catch (error) {
      console.error('Error updating available skill:', error);
      throw error;
    }
  }

  async deleteAvailableSkill(id: number): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot delete available skill.');
    }
    
    try {
      // Soft delete by setting isActive to false
      const result = await AvailableSkillModel.updateOne(
        { id },
        { isActive: false, updatedAt: new Date() }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error deleting available skill:', error);
      throw error;
    }
  }

  // Session methods
  async saveSession(sessionData: any): Promise<any> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot save session.');
    }
    
    try {
      const sessionWithId = {
        ...sessionData,
        id: await this.getNextId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const session = new SessionModel(sessionWithId);
      const savedSession = await session.save();
      console.log('Session saved successfully:', savedSession.id);
      return savedSession.toObject();
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  }

  async getSessions(filter: any = {}): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot get sessions.');
    }
    
    try {
      const sessions = await SessionModel.find(filter).sort({ createdAt: -1 }).lean();
      return sessions;
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw error;
    }
  }

  async getSession(id: number): Promise<any | undefined> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot get session.');
    }
    
    try {
      const session = await SessionModel.findOne({ id }).lean();
      return session || undefined;
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  async updateSession(id: number, updateData: any): Promise<any | undefined> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot update session.');
    }
    
    try {
      const updatedSession = await SessionModel.findOneAndUpdate(
        { id },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      ).lean();
      
      return updatedSession || undefined;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  async deleteSession(id: number): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot delete session.');
    }
    
    try {
      const result = await SessionModel.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }


}

// Create and export the pure MongoDB storage instance
export const storage = new MongoStorage();
