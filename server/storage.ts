import { users, type User, type InsertUser } from "../shared/schema.js";
import session from "express-session";
import MongoStore from "connect-mongo";
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
  MONGODB_URI 
} from "./db/mongodb.js";

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
      touchAfter: 24 * 3600, // Reduce write operations
      collectionName: 'sessions',
      stringify: false
      // Note: Custom session ID generation should be configured in express-session options
    });
    console.log('MongoDB session store created');
  }

  // Add a method to handle session-related errors
  private handleSessionStoreError(error: any) {
    console.error('Session Store Error:', error);
    // You might want to implement more sophisticated error handling here
    // For example, reconnecting to the database or logging the error
  }

  // Modify the session store initialization to add error handling
  async initializeSessionStore(): Promise<void> {
    try {
      // Add error event listener to the session store
      this.sessionStore.on('error', (error: any) => {
        this.handleSessionStoreError(error);
      });

      console.log('Session store initialized successfully');
    } catch (error) {
      console.error('Failed to initialize session store:', error);
      throw error;
    }
  }

  // Modify the initialize method to call initializeSessionStore
  async initialize(): Promise<void> {
    try {
      // Connect to MongoDB - this will throw an error if connection fails
      await connectToMongoDB();
      this.isConnected = true;
      
      console.log('MongoDB connection established');
      
      // Initialize session store
      await this.initializeSessionStore();
      
      // Clear any corrupted sessions
      await this.clearCorruptedSessions();
      
      // Set the current ID based on existing data
      await this.initializeCurrentId();
      
      // Create initial users if they don't exist
      await this.createInitialUsers();
      
      console.log('MongoDB storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MongoDB storage:', error);
      this.isConnected = false;
      throw error; // Always fail if MongoDB is not available
    }
  }
  
  // Method to clear corrupted sessions (sessions with null IDs)
  async clearCorruptedSessions(): Promise<void> {
    try {
      const SessionModel = await this.getSessionModel();
      if (SessionModel) {
        // Remove any sessions with null IDs
        const result = await SessionModel.deleteMany({ id: null });
        if (result.deletedCount > 0) {
          console.log(`Cleaned up ${result.deletedCount} corrupted sessions`);
        }
      }
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
        const sessions = await this.sessionStore.all();
        
        // Define a type for session data
        interface SessionData {
          expires?: Date | string;
          [key: string]: any; // Allow other properties
        }
        
        for (const [sid, session] of Object.entries(sessions) as [string, SessionData][]) {
          if (session.expires && new Date(session.expires) < now) {
            await this.sessionStore.destroy(sid);
          }
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
