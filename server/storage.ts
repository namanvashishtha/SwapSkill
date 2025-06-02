import { users, type User, type InsertUser } from "../shared/schema.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import { 
  UserModel, 
  SkillModel, 
  MatchModel, 
  NotificationModel, 
  ChatMessageModel,
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
  saveMessage(message: any): Promise<void>;
  getNextId(): Promise<number>;
  // Query methods
  getMatches(filter?: any): Promise<any[]>;
  getMatch(id: number): Promise<any | undefined>;
  updateMatch(id: number, updateData: any): Promise<any | undefined>;
  getNotifications(filter?: any): Promise<any[]>;
  updateNotification(id: number, updateData: any): Promise<any | undefined>;
  getMessages(filter?: any): Promise<any[]>;
}

export class MongoStorage implements IStorage {
  sessionStore: any;
  private isConnected: boolean = false;
  private currentId: number = 1;

  constructor() {
    // Create MongoDB session store
    this.sessionStore = MongoStore.create({
      mongoUrl: MONGODB_URI,
      ttl: 60 * 60 * 24, // 1 day
      crypto: {
        secret: process.env.SESSION_SECRET || 'skillswap-session-secret'
      }
    });
    console.log('MongoDB session store created');
  }

  async initialize(): Promise<void> {
    try {
      // Connect to MongoDB - this will throw an error if connection fails
      await connectToMongoDB();
      this.isConnected = true;
      
      console.log('MongoDB connection established');
      
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

  private async initializeCurrentId(): Promise<void> {
    try {
      // Find the highest ID across all collections
      const [maxUserId, maxMatchId, maxNotificationId, maxMessageId] = await Promise.all([
        UserModel.findOne({}, { id: 1 }).sort({ id: -1 }).lean(),
        MatchModel.findOne({}, { id: 1 }).sort({ id: -1 }).lean(),
        NotificationModel.findOne({}, { id: 1 }).sort({ id: -1 }).lean(),
        ChatMessageModel.findOne({}, { id: 1 }).sort({ id: -1 }).lean()
      ]);

      const maxId = Math.max(
        maxUserId?.id || 0,
        maxMatchId?.id || 0,
        maxNotificationId?.id || 0,
        maxMessageId?.id || 0
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

  async saveMessage(message: any): Promise<void> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot save message.');
    }
    
    try {
      if (!message.id) {
        message.id = await this.getNextId();
      }
      
      await ChatMessageModel.findOneAndUpdate(
        { id: message.id },
        message,
        { upsert: true, new: true }
      );
      console.log('Message saved to MongoDB:', message.id);
    } catch (error) {
      console.error('Error saving message to MongoDB:', error);
      throw error;
    }
  }

  // Helper methods for querying matches, notifications, and messages
  async getMatches(filter: any = {}): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot retrieve matches.');
    }
    
    try {
      const matches = await MatchModel.find(filter).lean();
      return matches;
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw error;
    }
  }

  async getMatch(id: number): Promise<any | undefined> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot retrieve match.');
    }
    
    try {
      const match = await MatchModel.findOne({ id }).lean();
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
      const updatedMatch = await MatchModel.findOneAndUpdate(
        { id },
        { $set: { ...updateData, updatedAt: new Date() } },
        { new: true }
      ).lean();
      return updatedMatch;
    } catch (error) {
      console.error('Error updating match:', error);
      throw error;
    }
  }

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

  async getMessages(filter: any = {}): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('MongoDB is not connected. Cannot retrieve messages.');
    }
    
    try {
      const messages = await ChatMessageModel.find(filter).lean();
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }
}

// Create and export the pure MongoDB storage instance
export const storage = new MongoStorage();
