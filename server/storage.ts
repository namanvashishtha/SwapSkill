import { users, type User, type InsertUser } from "../shared/schema.js";
import session from "express-session";
import createMemoryStore from "memorystore";
import MongoStore from "connect-mongo";
import { UserModel, mongoUserToAppUser, appUserToMongoUser, connectToMongoDB, MONGODB_URI } from "./db/mongodb.js";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  sessionStore: any; // Using any for now to simplify typings
  initialize(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;
  sessionStore: any; // Using any for now to simplify typings

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  async initialize(): Promise<void> {
    // Add some initial users if the map is empty
    if (this.users.size === 0) {
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
        await this.createUser(user);
      }
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    
    // Ensure null values instead of undefined for nullable fields
    // and explicitly set bio and imageUrl
    const user: User = { 
      ...insertUser, 
      id,
      fullName: insertUser.fullName || null,
      email: insertUser.email || null,
      location: insertUser.location || null,
      skillsToTeach: insertUser.skillsToTeach || null,
      skillsToLearn: insertUser.skillsToLearn || null,
      bio: insertUser.bio || '', // Empty string for optional bio
      imageUrl: insertUser.imageUrl || null // null is allowed for imageUrl since it's nullable
    };
    
    console.log('MemStorage - Creating user:', {
      ...user,
      password: '[REDACTED]'
    });
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    console.log('MemStorage - Updating user, existing data:', {
      ...existingUser,
      password: '[REDACTED]'
    });
    
    console.log('MemStorage - Updating user, new data:', {
      ...userData,
      password: userData.password ? '[REDACTED]' : undefined
    });

    // Ensure bio and imageUrl are explicitly handled
    const updatedUser = { 
      ...existingUser, 
      ...userData,
      // Explicitly handle these fields to ensure they're not lost
      bio: userData.bio !== undefined ? userData.bio : existingUser.bio || '',
      imageUrl: userData.imageUrl !== undefined ? userData.imageUrl : existingUser.imageUrl
    };
    
    console.log('MemStorage - Updated user result:', {
      ...updatedUser,
      password: '[REDACTED]'
    });
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
}

export class MongoStorage implements IStorage {
  sessionStore: any;
  private memStorage: MemStorage;
  private isConnected: boolean = false;

  constructor() {
    // Create memory storage as fallback first
    this.memStorage = new MemStorage();
    
    // In development, use memory store for sessions to avoid blocking startup
    if (process.env.NODE_ENV === 'development') {
      this.sessionStore = this.memStorage.sessionStore;
      console.log('Using memory session store for development');
      return;
    }
    
    try {
      // Create MongoDB session store for production
      this.sessionStore = MongoStore.create({
        mongoUrl: MONGODB_URI,
        ttl: 60 * 60 * 24, // 1 day
        crypto: {
          secret: 'skillswap-session-secret'
        }
      });
      console.log('MongoDB session store created successfully');
    } catch (error) {
      console.error('Failed to create MongoDB session store:', error);
      // Fall back to memory store for sessions
      this.sessionStore = this.memStorage.sessionStore;
      console.log('Using memory session store as fallback');
    }
  }

  async initialize(): Promise<void> {
    // Always initialize memory storage first as a fallback
    await this.memStorage.initialize();
    console.log('Memory storage initialized successfully');
    
    try {
      // Try to connect to MongoDB Atlas
      const connected = await connectToMongoDB();
      this.isConnected = !!connected; // Convert to boolean
      
      if (this.isConnected) {
        console.log('MongoDB connection established');
        
        // Only try to sync data if MongoDB connection is successful
        try {
          // Sync initial users to MongoDB if they don't exist
          const users = Array.from(this.memStorage['users'].values());
          
          // Use Promise.allSettled to handle individual user sync failures
          const syncResults = await Promise.allSettled(
            users.map(async (user) => {
              try {
                // Use a shorter timeout for findOne operations
                const existingUser = await UserModel.findOne({ id: user.id }).maxTimeMS(5000);
                if (!existingUser) {
                  await UserModel.create(appUserToMongoUser(user));
                  return { success: true, id: user.id };
                }
                return { success: true, id: user.id, exists: true };
              } catch (userError) {
                console.error(`Failed to sync user ${user.id} to MongoDB:`, userError);
                return { success: false, id: user.id, error: userError };
              }
            })
          );
          
          // Log sync results
          const successCount = syncResults.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
          console.log(`Successfully synced ${successCount}/${users.length} users to MongoDB`);
          
          console.log('MongoDB storage initialized successfully');
        } catch (syncError) {
          console.error('Failed to sync data to MongoDB:', syncError);
          // Continue with memory storage even if sync fails
        }
      } else {
        // If we're in development mode, this is expected behavior
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: Using memory storage as primary storage');
        } else {
          console.error('Failed to connect to MongoDB in production mode');
        }
        
        // Ensure we're using memory storage
        this.sessionStore = this.memStorage.sessionStore;
      }
    } catch (error) {
      console.error('Failed to initialize MongoDB storage:', error);
      console.log('Continuing with memory storage as fallback');
      // Ensure we're using memory storage
      this.isConnected = false;
      this.sessionStore = this.memStorage.sessionStore;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      if (this.isConnected) {
        const mongoUser = await UserModel.findOne({ id });
        if (mongoUser) {
          // Cache the user in memory storage
          const user = mongoUserToAppUser(mongoUser);
          this.memStorage['users'].set(id, user);
          return user;
        }
      }
    } catch (error) {
      console.error('MongoDB getUser error:', error);
    }
    
    // Fall back to memory storage
    return this.memStorage.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      if (this.isConnected) {
        const mongoUser = await UserModel.findOne({ username });
        if (mongoUser) {
          // Cache the user in memory storage
          const user = mongoUserToAppUser(mongoUser);
          this.memStorage['users'].set(user.id, user);
          return user;
        }
      }
    } catch (error) {
      console.error('MongoDB getUserByUsername error:', error);
    }
    
    // Fall back to memory storage
    return this.memStorage.getUserByUsername(username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // First create in memory storage to get an ID
    const user = await this.memStorage.createUser(insertUser);
    
    try {
      if (this.isConnected) {
        // Ensure bio and imageUrl are explicitly included
        const mongoUser = {
          ...appUserToMongoUser(user),
          // Explicitly set these fields to ensure they're included
          bio: user.bio || '',
          imageUrl: user.imageUrl || null
        };
        
        console.log('Creating MongoDB user with data:', {
          ...mongoUser,
          password: '[REDACTED]'
        });
        
        // Then save to MongoDB
        await UserModel.create(mongoUser);
        
        // Verify the creation by fetching the user
        const verifyUser = await UserModel.findOne({ id: user.id });
        console.log('Verified MongoDB user after creation:', {
          ...verifyUser?.toObject(),
          password: '[REDACTED]'
        });
      }
    } catch (error) {
      console.error('MongoDB createUser error:', error);
      // Continue with memory storage version
    }
    
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    // First update in memory storage. This also validates user existence and merges data.
    const memUpdatedUser = await this.memStorage.updateUser(id, userData);

    if (memUpdatedUser) {
      try {
        if (this.isConnected) {
          // Construct the $set payload for MongoDB ONLY from the original userData (Partial<User>).
          // This ensures we only update the fields that were intended to be changed.
          const mongoUpdatePayload: any = {};
          
          // Iterate over the keys in userData (the partial update)
          for (const key in userData) {
            if (Object.prototype.hasOwnProperty.call(userData, key)) {
              const K = key as keyof Partial<User>;

              // Skip 'id' and 'password' from being directly set via this generic update
              if (K === 'id' || K === 'password') {
                continue;
              }

              // If the key is present in userData (the partial update), include it in the payload.
              // This means userData[K] is not undefined.
              if (userData[K] !== undefined) {
                if (K === 'bio') {
                  mongoUpdatePayload[K] = userData[K] || ''; // Ensure bio is a string, default to empty if null/undefined in userData
                } else if (K === 'imageUrl') {
                  mongoUpdatePayload[K] = userData[K];     // imageUrl can be string or null
                } else {
                  mongoUpdatePayload[K] = userData[K];     // For other fields
                }
              }
              // If userData[K] is undefined, it means this partial update does not intend to change this field,
              // so it's not added to mongoUpdatePayload. The existing value in DB remains.
            }
          }
          
          if (Object.keys(mongoUpdatePayload).length > 0) {
            console.log('MongoDB update operation - document filter:', { id });
            console.log('MongoDB update operation - $set payload:', mongoUpdatePayload);

            const updateResult = await UserModel.updateOne(
              { id },
              { $set: mongoUpdatePayload }
            );
            
            console.log('MongoDB update operation result:', updateResult);
            
            if (updateResult.matchedCount === 0) {
              console.error('MongoDB update failed: No document matched the filter criteria for id:', id);
            } else if (updateResult.modifiedCount === 0) {
              console.warn('MongoDB update: Document matched but no changes were made for id:', id, '$set payload:', mongoUpdatePayload);
            }
            
            // Verify the update by fetching the user (optional, for debugging)
            const verifyUser = await UserModel.findOne({ id });
            console.log('Verified MongoDB user after update:', {
              id: verifyUser?.id,
              username: verifyUser?.username,
              bio: verifyUser?.bio,
              imageUrl: verifyUser?.imageUrl,
              // Log other relevant fields from verifyUser for comparison
            });

          } else {
            console.log('MongoDB update operation - no fields to update in $set payload for id:', id);
          }
        }
      } catch (error) {
        console.error('MongoDB updateUser error for id:', id, error);
        // memUpdatedUser (from memory) is still returned
      }
    }
    
    return memUpdatedUser; // Return user from memory, which should reflect the update
  }

  async deleteUser(id: number): Promise<boolean> {
    // First delete from memory storage
    const result = await this.memStorage.deleteUser(id);
    
    if (result) {
      try {
        if (this.isConnected) {
          // Then delete from MongoDB
          await UserModel.deleteOne({ id });
        }
      } catch (error) {
        console.error('MongoDB deleteUser error:', error);
        // Continue with memory storage result
      }
    }
    
    return result;
  }
}

// Create and export the MongoDB storage instance
export const storage = new MongoStorage();
