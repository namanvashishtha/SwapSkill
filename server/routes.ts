import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth.js";
import { storage } from "./storage.js";
import { setupStatusRoutes } from "./routes/status.js";
import { setupAdminRoutes } from "./routes/admin.js";
import { 
  updateUserBioAndImage, 
  UserModel, 
  SkillModel, 
  MatchModel, 
  NotificationModel, 
  ChatMessageModel, 
  ReviewModel, 
  mongoUserToAppUser 
} from "./db/mongodb.js";
import multer from "multer";
import path from "path";
import * as fs from "fs";
import { User } from "../shared/schema.js";
import { autoCreateSkills, getOrCreateSkillsWithCategories, categorizeSkillAdvanced } from "./services/skillCategorization.js";
import { categorizeSkillWithAI, categorizeSkillsWithAI, getSkillCategoryStats } from "./services/aiCategorization.js";

// Get __dirname equivalent in a way that works with both ESM and CommonJS
const __dirname = path.resolve();

// Set up multer for file uploads
let uploadDir: string | null = null; // Initialize with null to avoid "used before assigned" error
let storage_config: multer.StorageEngine;

try {
  uploadDir = path.join(__dirname, "uploads");
  console.log("====== Multer: Resolved uploadDir:", uploadDir, "======");
  console.log("====== Multer: Current __dirname:", __dirname, "======");

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    console.log("====== Multer: Upload directory does not exist, creating:", uploadDir, "======");
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("====== Multer: Upload directory created successfully:", uploadDir, "======");
  } else {
    console.log("====== Multer: Upload directory already exists:", uploadDir, "======");
  }

  storage_config = multer.diskStorage({
    destination: function (req, file, cb) {
      console.log("====== Multer destination function called for file:", file.originalname, "Target dir:", uploadDir, "======");
      // Ensure uploadDir is valid before using it
      if (!uploadDir || !fs.existsSync(uploadDir)) {
        console.error("Upload directory is invalid or does not exist:", uploadDir);
        // When there's an error, we still need to provide both arguments to the callback
        // First argument is the error, second is the destination (can be empty string as it won't be used)
        return cb(new Error("Upload directory is not available"), "");
      }
      cb(null, uploadDir as string);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  });
  console.log("====== Multer: diskStorage configured successfully. ======");
} catch (e: any) {
  console.error("====== FATAL ERROR during multer.diskStorage setup ======");
  console.error("Error message:", e.message);
  console.error("Error stack:", e.stack);
  console.error("Resolved uploadDir at time of error:", uploadDir);
  
  // Create a fallback upload directory in the current working directory
  try {
    uploadDir = path.resolve('./uploads');
    console.log("====== Multer: Using fallback uploadDir:", uploadDir, "======");
    
    // Ensure fallback upload directory exists
    if (!fs.existsSync(uploadDir)) {
      console.log("====== Multer: Fallback upload directory does not exist, creating:", uploadDir, "======");
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log("====== Multer: Fallback upload directory created successfully:", uploadDir, "======");
    }
  } catch (fallbackError: any) {
    console.error("====== FATAL ERROR creating fallback upload directory ======");
    console.error("Error message:", fallbackError.message);
    console.error("Error stack:", fallbackError.stack);
    // If even the fallback fails, set uploadDir to null to prevent further errors
    uploadDir = null;
  }
  
  // Fallback to memory storage if disk storage setup fails, to allow server to start
  // but file uploads will likely fail or not persist as expected.
  console.warn("====== Multer: Falling back to memoryStorage due to diskStorage setup error. File uploads may not work correctly. ======");
  storage_config = multer.memoryStorage();
}

// Custom error handler for multer
const multerErrorHandler = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log("====== एंटर्ड multerErrorHandler ======"); // Log entry into multerErrorHandler
  if (err) {
    console.error("multerErrorHandler ने त्रुटि पकड़ी:", err); // Log the error if present
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: "फ़ाइल बहुत बड़ी है। अधिकतम आकार 5MB है।" });
      }
      return res.status(400).json({ message: `अपलोड त्रुटि: ${err.message}` });
    } else {
      // An unknown error occurred
      return res.status(400).json({ message: err.message || "फ़ाइल अपलोड करने में त्रुटि हुई" });
    }
  }
  console.log("====== multerErrorHandler: कोई त्रुटि नहीं, next() को कॉल किया जा रहा है ======"); // Log if no error and calling next()
  next();
};

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Simple in-memory storage for notification states (per user session)
const userNotificationStates = new Map<number, {
  notificationsCleared: boolean;
  matchRequestsCleared: boolean;
  clearedAt: Date;
}>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Setup status routes
  setupStatusRoutes(app);
  
  // Setup admin routes
  setupAdminRoutes(app);

  // Test endpoint to create sample notifications (for debugging)
  app.post("/api/test/create-notifications", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      console.log(`Creating test notifications for user ${userId}`);
      
      // Create a few test notifications
      const testNotifications = [
        {
          userId: userId,
          type: 'message' as const,
          title: 'Test Message',
          message: 'This is a test notification',
          isRead: false,
          createdAt: new Date()
        },
        {
          userId: userId,
          type: 'match_request' as const,
          title: 'Test Match Request',
          message: 'Someone wants to match with you',
          isRead: false,
          createdAt: new Date()
        }
      ];
      
      for (const notification of testNotifications) {
        await storage.saveNotification(notification);
        console.log(`Created notification: ${notification.title}`);
      }
      
      res.json({ message: `Created ${testNotifications.length} test notifications` });
    } catch (error) {
      console.error("Error creating test notifications:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error creating test notifications" 
      });
    }
  });

  // Test endpoint to check current notifications (for debugging)
  app.get("/api/test/check-notifications", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      console.log(`Checking notifications for user ${userId}`);
      
      const allNotifications = await storage.getNotifications({ userId: userId });
      const unreadNotifications = await storage.getNotifications({ userId: userId, isRead: false });
      
      console.log(`Found ${allNotifications.length} total notifications, ${unreadNotifications.length} unread`);
      
      res.json({ 
        userId: userId,
        totalNotifications: allNotifications.length,
        unreadNotifications: unreadNotifications.length,
        notifications: allNotifications
      });
    } catch (error) {
      console.error("Error checking notifications:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error checking notifications" 
      });
    }
  });

  // Available skills API
  app.get("/api/available-skills", async (req: express.Request, res: express.Response) => {
    try {
      const skills = await storage.getAvailableSkills();
      res.json(skills);
    } catch (error) {
      console.error("Error fetching available skills:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching available skills" 
      });
    }
  });

  // Get available skills grouped by category
  app.get("/api/available-skills/grouped", async (req: express.Request, res: express.Response) => {
    try {
      const skills = await storage.getAvailableSkills();
      
      // Group skills by category
      const groupedSkills = skills.reduce((acc: any, skill: any) => {
        if (!acc[skill.category]) {
          acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
      }, {});
      
      res.json(groupedSkills);
    } catch (error) {
      console.error("Error fetching grouped available skills:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching available skills" 
      });
    }
  });

  // Create a new available skill
  app.post("/api/available-skills", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to add skills" });
      }

      const { name, category, description } = req.body;
      
      if (!name || !category) {
        return res.status(400).json({ message: "Skill name and category are required" });
      }

      const newSkill = await storage.createAvailableSkill({
        name: name.trim(),
        category: category.trim(),
        description: description?.trim() || null
      });

      res.status(201).json(newSkill);
    } catch (error) {
      console.error("Error creating available skill:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error creating skill" 
      });
    }
  });

  // Search available skills
  app.get("/api/available-skills/search", async (req: express.Request, res: express.Response) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }

      const skills = await storage.getAvailableSkills({
        name: { $regex: new RegExp(q, 'i') }
      });
      
      res.json(skills);
    } catch (error) {
      console.error("Error searching available skills:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error searching skills" 
      });
    }
  });

  // AI-powered skill categorization endpoint
  app.post("/api/skills/categorize", async (req: express.Request, res: express.Response) => {
    try {
      const { skillName } = req.body;
      
      if (!skillName || typeof skillName !== 'string') {
        return res.status(400).json({ message: "Skill name is required" });
      }

      const prediction = categorizeSkillWithAI(skillName.trim());
      
      res.json({ 
        skillName: skillName.trim(),
        category: prediction.category,
        confidence: prediction.confidence,
        reasoning: prediction.reasoning
      });
    } catch (error) {
      console.error("Error categorizing skill:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error categorizing skill" 
      });
    }
  });

  // Advanced batch categorization with detailed analysis
  app.post("/api/skills/categorize-batch", async (req: express.Request, res: express.Response) => {
    try {
      const { skills } = req.body;
      
      if (!Array.isArray(skills)) {
        return res.status(400).json({ message: "Skills must be an array" });
      }

      const predictions = categorizeSkillsWithAI(skills);
      const stats = getSkillCategoryStats(skills);
      
      res.json({ 
        predictions: predictions,
        statistics: stats,
        totalSkills: skills.length
      });
    } catch (error) {
      console.error("Error batch categorizing skills:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error categorizing skills" 
      });
    }
  });

  // Batch skill categorization and auto-creation
  app.post("/api/skills/batch-process", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }

      const { skills } = req.body;
      
      if (!Array.isArray(skills)) {
        return res.status(400).json({ message: "Skills must be an array" });
      }

      const processedSkills = await getOrCreateSkillsWithCategories(skills);
      
      res.json({ 
        processedSkills: processedSkills,
        message: `Processed ${processedSkills.length} skills`
      });
    } catch (error) {
      console.error("Error batch processing skills:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error processing skills" 
      });
    }
  });

  // Get skill suggestions based on partial input
  app.get("/api/skills/suggestions", async (req: express.Request, res: express.Response) => {
    try {
      const { q, category } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }

      const filter: any = {
        name: { $regex: new RegExp(q, 'i') },
        isActive: true
      };

      if (category && typeof category === 'string') {
        filter.category = category;
      }

      const skills = await storage.getAvailableSkills(filter);
      
      // Limit to top 10 suggestions
      const suggestions = skills.slice(0, 10).map(skill => ({
        name: skill.name,
        category: skill.category,
        description: skill.description
      }));
      
      res.json(suggestions);
    } catch (error) {
      console.error("Error getting skill suggestions:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error getting suggestions" 
      });
    }
  });
  
  // User profile API
  app.put("/api/user/profile", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to update your profile" });
      }
      
      const userId = (req.user as User).id;
      const { fullName, email, location, skillsToTeach, skillsToLearn, bio } = req.body;
      
      // Validate required fields
      if (!fullName || !email || !location) {
        return res.status(400).json({ message: "Name, email, and location are required" });
      }
      
      // Get current user to ensure we preserve imageUrl
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("PUT /api/user/profile - Current user:", {
        ...currentUser,
        password: "[REDACTED]"
      });
      
      // Auto-create new skills in the available skills collection
      const allSkills = [...(skillsToTeach || []), ...(skillsToLearn || [])];
      if (allSkills.length > 0) {
        try {
          await autoCreateSkills(allSkills);
          console.log("Auto-created skills completed");
        } catch (error) {
          console.error("Error auto-creating skills:", error);
          // Continue with profile update even if skill creation fails
        }
      }
      
      // Update through storage layer. This will handle both MemStorage and MongoDB.
      // The imageUrl from currentUser is passed to preserve it if not otherwise specified by this PUT.
      const updatedUser = await storage.updateUser(userId, {
        fullName,
        email,
        location,
        skillsToTeach: skillsToTeach || [],
        skillsToLearn: skillsToLearn || [],
        bio: bio || '', // Include bio in the update
        imageUrl: currentUser.imageUrl === undefined ? null : currentUser.imageUrl // Ensure imageUrl is never undefined
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("PUT /api/user/profile - Updated user:", {
        ...updatedUser,
        password: "[REDACTED]"
      });
      
      // Return updated user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      // Handle errors directly instead of passing to next
      console.error("Profile update error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Something went wrong while updating your profile" 
      });
    }
  });
  
  // Handle profile image and bio updates
  app.post("/api/user/profile", upload.single("image"), multerErrorHandler, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log("====== एंटर्ड POST /api/user/profile मुख्य हैंडलर ======"); // Log entry into the main handler
    // The detailed logs for req.body and req.file are already here from a previous step.
    // We'll keep them to see if execution reaches this far.
    console.log("--------------------------------------------------");
    console.log("POST /api/user/profile - RAW req.body:", JSON.stringify(req.body));
    const receivedBio = typeof req.body.bio === 'string' ? req.body.bio : "";
    console.log("POST /api/user/profile - Parsed bio from req.body.bio:", receivedBio);
    console.log("POST /api/user/profile - Received file object:", req.file ? JSON.stringify(req.file) : "none");
    console.log("--------------------------------------------------");
  
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to update your profile" });
      }
      
      const userId = (req.user as User).id;
      // Ensure bio is treated as a string, defaulting to empty if not provided or is null/undefined
      const receivedBio = typeof req.body.bio === 'string' ? req.body.bio : "";
      
      console.log("--------------------------------------------------");
      console.log("POST /api/user/profile - RAW req.body:", JSON.stringify(req.body));
      console.log("POST /api/user/profile - Parsed bio from req.body.bio:", receivedBio);
      console.log("POST /api/user/profile - Received file object:", req.file ? JSON.stringify(req.file) : "none");
      console.log("--------------------------------------------------");
      
      // Prepare update data
      const updateData: any = { bio: receivedBio };
      
      // If an image was uploaded, save its URL
      if (req.file) {
        // Create a relative URL for the image
        const imageUrl = `/uploads/${req.file.filename}`;
        updateData.imageUrl = imageUrl;
      }
      
      console.log("POST /api/user/profile - Update data:", updateData);
      
      // Get current user to ensure we have all fields
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update through storage layer. This will handle both MemStorage and MongoDB.
      // Determine the correct imageUrl to save.
      let finalImageUrl: string | null;
      if (updateData.imageUrl !== undefined) { // If a new image was uploaded and its path is in updateData
        finalImageUrl = updateData.imageUrl;
      } else if (currentUser && currentUser.imageUrl !== undefined) { // Otherwise, retain current user's image URL
        finalImageUrl = currentUser.imageUrl;
      } else { // Default to null if no image exists or is being uploaded
        finalImageUrl = null;
      }

      const updatedUser = await storage.updateUser(userId, {
        bio: updateData.bio, // Bio from the POST request's FormData
        imageUrl: finalImageUrl // The determined image URL (new or existing)
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("POST /api/user/profile - Updated user:", {
        ...updatedUser,
        password: "[REDACTED]"
      });
      
      // Return updated user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      // Handle errors as JSON responses instead of passing to the default error handler
      console.error("Profile update error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Something went wrong while saving your profile" 
      });
    }
  });

  // Delete user account API
  app.delete("/api/user/delete-account", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to delete your account" });
      }
      
      const userId = (req.user as User).id;
      console.log(`DELETE /api/user/delete-account - Deleting account for user ${userId}`);
      
      // Delete user from storage (this will handle both MemStorage and MongoDB)
      const deleted = await storage.deleteUser(userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Also delete related data from MongoDB if using MongoDB
      try {
        // Delete user's skills
        await SkillModel.deleteMany({ userId: userId });
        console.log(`Deleted skills for user ${userId}`);
        
        // Delete user's matches
        await MatchModel.deleteMany({ 
          $or: [{ fromUserId: userId }, { toUserId: userId }] 
        });
        console.log(`Deleted matches for user ${userId}`);
        
        // Delete user's notifications
        await NotificationModel.deleteMany({ userId: userId });
        console.log(`Deleted notifications for user ${userId}`);
        
        // Delete user's chat messages
        const userMatches = await MatchModel.find({ 
          $or: [{ fromUserId: userId }, { toUserId: userId }] 
        });
        const matchIds = userMatches.map(match => match.id);
        if (matchIds.length > 0) {
          await ChatMessageModel.deleteMany({ matchId: { $in: matchIds } });
          console.log(`Deleted chat messages for user ${userId}`);
        }
        
        // Delete user's reviews (both given and received)
        await ReviewModel.deleteMany({ 
          $or: [{ reviewerId: userId }, { revieweeId: userId }] 
        });
        console.log(`Deleted reviews for user ${userId}`);
        
        // Finally delete the user from MongoDB
        await UserModel.deleteOne({ id: userId });
        console.log(`Deleted user ${userId} from MongoDB`);
        
      } catch (mongoError) {
        console.error("Error deleting related data from MongoDB:", mongoError);
        // Continue even if MongoDB cleanup fails
      }
      
      // Log out the user
      req.logout((err) => {
        if (err) {
          console.error("Error logging out user after account deletion:", err);
        }
      });
      
      console.log(`Successfully deleted account for user ${userId}`);
      res.status(200).json({ message: "Account deleted successfully" });
      
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to delete account" 
      });
    }
  });
  
  // Serve uploaded files
  if (uploadDir) {
    console.log("Setting up static file serving for uploads directory:", uploadDir);
    app.use("/uploads", express.static(uploadDir as string));
  } else {
    console.error("Cannot serve uploaded files: uploadDir is not defined");
  }
  
  // Get all users API (for skill matching)
  app.get("/api/users", async (req: express.Request, res: express.Response) => {
    try {
      console.log("GET /api/users - Starting to fetch users...");
      
      // Check authentication
      if (!req.isAuthenticated()) {
        console.log("GET /api/users - User not authenticated");
        return res.status(401).json({ message: "You must be logged in to view users" });
      }
      
      console.log("GET /api/users - User authenticated:", (req.user as User).username);
      
      // Test MongoDB connection first
      console.log("GET /api/users - Testing MongoDB connection...");
      const mongoose = await import("mongoose");
      console.log("GET /api/users - MongoDB connection state:", mongoose.default.connection.readyState);
      
      // Get all users from MongoDB
      console.log("GET /api/users - Fetching users from MongoDB...");
      const mongoUsers = await UserModel.find({}).lean();
      console.log(`GET /api/users - Found ${mongoUsers.length} users in MongoDB`);
      
      if (mongoUsers.length > 0) {
        console.log("GET /api/users - Sample user:", {
          ...mongoUsers[0],
          password: "[REDACTED]"
        });
      }
      
      const users = mongoUsers.map(mongoUser => {
        console.log("GET /api/users - Converting user:", mongoUser.id || mongoUser._id);
        const user = mongoUserToAppUser(mongoUser);
        // Don't return passwords
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      console.log(`GET /api/users - Processed ${users.length} users, sending response`);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      console.error("Error name:", error instanceof Error ? error.name : "Unknown");
      console.error("Error constructor:", error instanceof Error ? error.constructor.name : "Unknown");
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching users" 
      });
    }
  });

  // Get individual user by ID
  app.get("/api/users/:userId", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }

      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching user" 
      });
    }
  });
  
  // Special route to fix a specific user's bio and imageUrl
  app.post("/api/admin/fix-user/:id", async (req: express.Request, res: express.Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const { bio, imageUrl } = req.body;
      
      console.log(`Manual fix for user ${userId}:`, { bio, imageUrl });
      
      // First try direct MongoDB update
      // Ensure imageUrl is never undefined by converting to null
      const imageUrlForUpdate: string | null = imageUrl === undefined ? null : imageUrl;
      
      const directUpdateSuccess = await updateUserBioAndImage(userId, bio || '', imageUrlForUpdate);
      
      // Then update through storage layer
      const updatedUser = await storage.updateUser(userId, {
        bio: bio || '',
        imageUrl: imageUrlForUpdate // Use the same value we prepared for MongoDB update
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({
        message: "User fixed successfully",
        directUpdateSuccess,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          bio: updatedUser.bio,
          imageUrl: updatedUser.imageUrl
        }
      });
    } catch (error) {
      console.error("Error fixing user:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fixing user" 
      });
    }
  });

  // Matching system API routes
  
  // Get all match requests for current user
  app.get("/api/matches", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      
      // Get all matches where user is either sender or receiver
      const matches = await storage.getMatches({
        $or: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      });
      
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching matches" 
      });
    }
  });

  // Get pending match requests count for current user
  app.get("/api/matches/pending/count", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      
      // Count pending matches where current user is the receiver
      const pendingMatches = await storage.getMatches({
        toUserId: userId,
        status: 'pending'
      });
      const pendingCount = pendingMatches.length;
      
      res.json({ count: pendingCount });
    } catch (error) {
      console.error("Error fetching pending matches count:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching pending matches count" 
      });
    }
  });

  // Get pending match requests received by current user
  app.get("/api/matches/pending", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      
      // Get pending matches where current user is the receiver
      const pendingMatchesRaw = await storage.getMatches({
        toUserId: userId,
        status: 'pending'
      });
      
      const pendingMatches = await Promise.all(
        pendingMatchesRaw.map(async (match) => {
          const fromUser = await storage.getUser(match.fromUserId);
          return {
            ...match,
            fromUser: fromUser ? {
              id: fromUser.id,
              username: fromUser.username,
              fullName: fromUser.fullName,
              imageUrl: fromUser.imageUrl,
              skillsToTeach: fromUser.skillsToTeach,
              skillsToLearn: fromUser.skillsToLearn
            } : null
          };
        })
      );
      
      const filteredPendingMatches = pendingMatches.filter(match => match.fromUser !== null);
      
      res.json(filteredPendingMatches);
    } catch (error) {
      console.error("Error fetching pending matches:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching pending matches" 
      });
    }
  });

  // Get accepted matches count for current user
  app.get("/api/matches/accepted/count", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      
      // Count accepted matches where current user is involved
      const acceptedMatches = await storage.getMatches({
        $or: [
          { fromUserId: userId },
          { toUserId: userId }
        ],
        status: 'accepted'
      });
      const acceptedCount = acceptedMatches.length;
      
      res.json({ count: acceptedCount });
    } catch (error) {
      console.error("Error fetching accepted matches count:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching accepted matches count" 
      });
    }
  });

  // Get accepted matches for current user
  app.get("/api/matches/accepted", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      
      // Get accepted matches where current user is involved
      const acceptedMatchesRaw = await storage.getMatches({
        $or: [
          { fromUserId: userId },
          { toUserId: userId }
        ],
        status: 'accepted'
      });
      
      const acceptedMatches = await Promise.all(
        acceptedMatchesRaw.map(async (match) => {
          const otherUserId = match.fromUserId === userId ? match.toUserId : match.fromUserId;
          const otherUser = await storage.getUser(otherUserId);
          return {
            ...match,
            otherUser: otherUser ? {
              id: otherUser.id,
              username: otherUser.username,
              fullName: otherUser.fullName,
              imageUrl: otherUser.imageUrl,
              skillsToTeach: otherUser.skillsToTeach,
              skillsToLearn: otherUser.skillsToLearn
            } : null
          };
        })
      );
      
      const filteredAcceptedMatches = acceptedMatches.filter(match => match.otherUser !== null);
      
      res.json(filteredAcceptedMatches);
    } catch (error) {
      console.error("Error fetching accepted matches:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching accepted matches" 
      });
    }
  });

  // Send a match request
  app.post("/api/matches", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const fromUserId = (req.user as User).id;
      const { toUserId } = req.body;
      
      if (!toUserId || fromUserId === toUserId) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if target user exists
      const targetUser = await storage.getUser(toUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if match request already exists
      const existingMatches = await storage.getMatches({
        $or: [
          { fromUserId: fromUserId, toUserId: toUserId },
          { fromUserId: toUserId, toUserId: fromUserId }
        ]
      });
      const existingMatch = existingMatches.length > 0 ? existingMatches[0] : null;
      
      if (existingMatch) {
        return res.status(400).json({ message: "Match request already exists" });
      }
      
      // Create new match request
      const newMatch = {
        fromUserId,
        toUserId,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Save match to MongoDB (this will assign an ID)
      const savedMatch = await storage.saveMatch(newMatch);
      
      // Create notification for the target user
      const notification = {
        userId: toUserId,
        type: 'match_request' as const,
        title: 'New Match Request',
        message: `${(req.user as User).username} wants to match with you!`,
        isRead: false,
        relatedUserId: fromUserId,
        relatedMatchId: savedMatch.id, // Use the saved match which has an id property
        createdAt: new Date()
      };
      
      // Save notification to MongoDB (this will assign an ID)
      await storage.saveNotification(notification);
      
      res.status(201).json(savedMatch);
    } catch (error) {
      console.error("Error creating match request:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error creating match request" 
      });
    }
  });

  // Accept a match request
  app.post("/api/matches/:matchId/accept", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      const matchId = parseInt(req.params.matchId, 10);
      
      const match = await storage.getMatch(matchId);
      if (!match) {
        return res.status(404).json({ message: "Match request not found" });
      }
      
      // Only the receiver can accept the match
      if (match.toUserId !== userId) {
        return res.status(403).json({ message: "You can only accept match requests sent to you" });
      }
      
      if (match.status !== 'pending') {
        return res.status(400).json({ message: "Match request is no longer pending" });
      }
      
      // Update match status
      const updatedMatch = await storage.updateMatch(matchId, {
        status: 'accepted'
      });
      
      // Create notification for the sender
      const notification = {
        userId: match.fromUserId,
        type: 'match_accepted' as const,
        title: 'Match Accepted!',
        message: `${(req.user as User).username} accepted your match request!`,
        isRead: false,
        relatedUserId: userId,
        relatedMatchId: matchId,
        createdAt: new Date()
      };
      
      // Save notification to MongoDB (this will assign an ID)
      await storage.saveNotification(notification);
      
      res.json({ message: "Match request accepted", match: updatedMatch });
    } catch (error) {
      console.error("Error accepting match request:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error accepting match request" 
      });
    }
  });

  // Reject a match request
  app.post("/api/matches/:matchId/reject", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      const matchId = parseInt(req.params.matchId, 10);
      
      const match = await storage.getMatch(matchId);
      if (!match) {
        return res.status(404).json({ message: "Match request not found" });
      }
      
      // Only the receiver can reject the match
      if (match.toUserId !== userId) {
        return res.status(403).json({ message: "You can only reject match requests sent to you" });
      }
      
      if (match.status !== 'pending') {
        return res.status(400).json({ message: "Match request is no longer pending" });
      }
      
      // Update match status
      await storage.updateMatch(matchId, {
        status: 'rejected'
      });
      
      res.json({ message: "Match request rejected" });
    } catch (error) {
      console.error("Error rejecting match request:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error rejecting match request" 
      });
    }
  });

  // Get notifications count for current user
  app.get("/api/notifications/count", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      const userState = userNotificationStates.get(userId);
      
      // If notifications were cleared recently, return 0
      if (userState && userState.notificationsCleared) {
        const timeSinceCleared = Date.now() - userState.clearedAt.getTime();
        // Keep cleared state for 5 minutes to prevent immediate reappearance
        if (timeSinceCleared < 5 * 60 * 1000) {
          return res.json({ count: 0 });
        }
      }
      
      try {
        const notifications = await storage.getNotifications({
          userId: userId,
          isRead: false
        });
        const unreadCount = notifications.length;
        res.json({ count: unreadCount });
      } catch (storageError) {
        // Fallback to mock data if storage fails
        console.warn("Storage failed, using mock data:", storageError);
        const count = userState?.notificationsCleared ? 0 : (userId % 5);
        res.json({ count });
      }
    } catch (error) {
      console.error("Error fetching notifications count:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching notifications count" 
      });
    }
  });

  // Get notifications for current user
  app.get("/api/notifications", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      
      const notifications = await storage.getNotifications({
        userId: userId
      });
      
      // Sort by creation date (newest first)
      notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching notifications" 
      });
    }
  });

  // Mark notification as read
  app.post("/api/notifications/:notificationId/read", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      const notificationId = parseInt(req.params.notificationId, 10);
      
      // Get the notification first to verify ownership
      const notifications = await storage.getNotifications({
        id: notificationId,
        userId: userId
      });
      
      if (notifications.length === 0) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      const notification = notifications[0];
      
      if (notification.userId !== userId) {
        return res.status(403).json({ message: "You can only mark your own notifications as read" });
      }
      
      // Update the notification to mark as read
      const updatedNotification = await storage.updateNotification(notificationId, {
        isRead: true
      });
      
      res.json({ message: "Notification marked as read", notification: updatedNotification });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error marking notification as read" 
      });
    }
  });

  // Get unread messages count for current user
  app.get("/api/messages/unread/count", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      
      // Get all accepted matches for the user
      const acceptedMatches = await storage.getMatches({
        $or: [
          { fromUserId: userId },
          { toUserId: userId }
        ],
        status: 'accepted'
      });
      
      let unreadCount = 0;
      
      // For each match, count unread messages not sent by the current user
      for (const match of acceptedMatches) {
        const unreadMessages = await storage.getMessages({
          matchId: match.id,
          senderId: { $ne: userId },
          isRead: false
        });
        unreadCount += unreadMessages.length;
      }
      
      res.json({ count: unreadCount });
    } catch (error) {
      console.error("Error fetching unread messages count:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching unread messages count" 
      });
    }
  });

  // Get messages for a match
  app.get("/api/matches/:matchId/messages", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      const matchId = parseInt(req.params.matchId, 10);
      
      const match = await storage.getMatch(matchId);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Check if user is part of this match
      if (match.fromUserId !== userId && match.toUserId !== userId) {
        return res.status(403).json({ message: "You can only view messages for your own matches" });
      }
      
      if (match.status !== 'accepted') {
        return res.status(400).json({ message: "You can only chat with accepted matches" });
      }
      
      const messages = await storage.getMessages({
        matchId: matchId
      });
      
      // Sort by creation date (oldest first for chat)
      messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching messages" 
      });
    }
  });

  // Send a message
  app.post("/api/matches/:matchId/messages", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      const matchId = parseInt(req.params.matchId, 10);
      const { message } = req.body;
      
      if (!message || !message.trim()) {
        return res.status(400).json({ message: "Message cannot be empty" });
      }
      
      const match = await storage.getMatch(matchId);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Check if user is part of this match
      if (match.fromUserId !== userId && match.toUserId !== userId) {
        return res.status(403).json({ message: "You can only send messages to your own matches" });
      }
      
      if (match.status !== 'accepted') {
        return res.status(400).json({ message: "You can only chat with accepted matches" });
      }
      
      const newMessage = {
        matchId,
        senderId: userId,
        message: message.trim(),
        createdAt: new Date()
      };
      
      // Save message to MongoDB (this will assign an ID)
      const savedMessage = await storage.saveMessage(newMessage);
      
      // Create notification for the other user
      const otherUserId = match.fromUserId === userId ? match.toUserId : match.fromUserId;
      const notification = {
        userId: otherUserId,
        type: 'message' as const,
        title: 'New Message',
        message: `${(req.user as User).username} sent you a message`,
        isRead: false,
        relatedUserId: userId,
        relatedMatchId: matchId,
        createdAt: new Date()
      };
      
      // Save notification to MongoDB
      await storage.saveNotification(notification);
      
      res.status(201).json(savedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error sending message" 
      });
    }
  });

  // Review API routes
  
  // Get reviews for a user
  app.get("/api/users/:userId/reviews", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = parseInt(req.params.userId, 10);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get reviews where the user is the reviewee (reviews about them)
      const reviews = await storage.getReviews({ revieweeId: userId });
      
      // Get reviewer information for each review
      const reviewsWithReviewers = await Promise.all(
        reviews.map(async (review) => {
          const reviewer = await storage.getUser(review.reviewerId);
          return {
            ...review,
            reviewer: reviewer ? {
              id: reviewer.id,
              username: reviewer.username,
              fullName: reviewer.fullName,
              imageUrl: reviewer.imageUrl
            } : null
          };
        })
      );
      
      // Sort by creation date (newest first)
      reviewsWithReviewers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(reviewsWithReviewers);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching reviews" 
      });
    }
  });

  // Create a new review
  app.post("/api/reviews", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const reviewerId = (req.user as User).id;
      const { revieweeId, matchId, rating, comment } = req.body;
      
      // Validate required fields
      if (!revieweeId || !matchId || !rating) {
        return res.status(400).json({ message: "Reviewee ID, match ID, and rating are required" });
      }
      
      // Validate rating range
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      
      // Check if the match exists and involves both users
      const match = await storage.getMatch(matchId);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Verify that the reviewer is part of this match
      if (match.fromUserId !== reviewerId && match.toUserId !== reviewerId) {
        return res.status(403).json({ message: "You can only review users from your own matches" });
      }
      
      // Verify that the reviewee is the other person in the match
      const expectedRevieweeId = match.fromUserId === reviewerId ? match.toUserId : match.fromUserId;
      if (revieweeId !== expectedRevieweeId) {
        return res.status(400).json({ message: "Invalid reviewee for this match" });
      }
      
      // Check if the match is accepted
      if (match.status !== 'accepted') {
        return res.status(400).json({ message: "You can only review users from accepted matches" });
      }
      
      // Check if a review already exists for this match and reviewer
      const existingReviews = await storage.getReviews({ 
        reviewerId, 
        revieweeId, 
        matchId 
      });
      
      if (existingReviews.length > 0) {
        return res.status(400).json({ message: "You have already reviewed this user for this match" });
      }
      
      const newReview = {
        reviewerId,
        revieweeId,
        matchId,
        rating,
        comment: comment || '',
        createdAt: new Date()
      };
      
      // Save review to MongoDB
      await storage.saveReview(newReview);
      
      res.status(201).json({ message: "Review created successfully", review: newReview });
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error creating review" 
      });
    }
  });

  // Get average rating for a user
  app.get("/api/users/:userId/rating", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = parseInt(req.params.userId, 10);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get all reviews for this user
      const reviews = await storage.getReviews({ revieweeId: userId });
      
      if (reviews.length === 0) {
        return res.json({ 
          averageRating: 0, 
          totalReviews: 0 
        });
      }
      
      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      res.json({ 
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalReviews: reviews.length 
      });
    } catch (error) {
      console.error("Error fetching user rating:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching user rating" 
      });
    }
  });

  // Notification API endpoints
  app.get("/api/notifications", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      
      try {
        // Fetch notifications from database
        const notifications = await storage.getNotifications({ userId: userId });
        res.json(notifications);
      } catch (storageError) {
        console.warn("Storage operation failed, returning empty array:", storageError);
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching notifications" 
      });
    }
  });

  // Notification count endpoint
  app.get("/api/notifications/count", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      
      try {
        // Get unread notifications count from database
        const unreadNotifications = await storage.getNotifications({ 
          userId: userId, 
          isRead: false 
        });
        
        const count = unreadNotifications.length;
        res.json({ count });
      } catch (storageError) {
        console.warn("Storage operation failed for notification count:", storageError);
        // Return 0 as fallback
        res.json({ count: 0 });
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching notification count" 
      });
    }
  });

  app.post("/api/notifications/mark-all-read", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      
      try {
        // Mark all unread notifications as read in the database
        const unreadNotifications = await storage.getNotifications({
          userId: userId,
          isRead: false
        });
        
        for (const notification of unreadNotifications) {
          await storage.updateNotification(notification.id, { isRead: true });
        }
        
        // Only log if there were notifications to mark
        if (unreadNotifications.length > 0) {
          console.log(`Marked ${unreadNotifications.length} notifications as read for user ${userId}`);
        }
      } catch (storageError) {
        console.warn("Storage operation failed:", storageError);
      }
      
      // Update user state to mark notifications as cleared
      const currentState = userNotificationStates.get(userId) || {
        notificationsCleared: false,
        matchRequestsCleared: false,
        clearedAt: new Date()
      };
      
      userNotificationStates.set(userId, {
        ...currentState,
        notificationsCleared: true,
        clearedAt: new Date()
      });
      
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error marking notifications as read" 
      });
    }
  });

  app.post("/api/notifications/:id/read", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      const notificationId = parseInt(req.params.id, 10);
      
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      // For now, just return success
      // In a real app, you would update the specific notification as read in database
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error marking notification as read" 
      });
    }
  });

  app.delete("/api/notifications/:id", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      const notificationId = parseInt(req.params.id, 10);
      
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      console.log(`Attempting to delete notification ${notificationId} for user ${userId}`);
      
      // Verify the notification belongs to the user before deleting
      const notifications = await storage.getNotifications({
        id: notificationId,
        userId: userId
      });
      
      if (notifications.length === 0) {
        console.log(`Notification ${notificationId} not found for user ${userId}`);
        return res.status(404).json({ message: "Notification not found" });
      }
      
      console.log(`Found notification ${notificationId}, proceeding with deletion`);
      
      // Delete the notification from the database
      const deleted = await storage.deleteNotification(notificationId);
      
      if (!deleted) {
        console.error(`Failed to delete notification ${notificationId} - deleteNotification returned false`);
        return res.status(500).json({ message: "Failed to delete notification from database" });
      }
      
      console.log(`Successfully deleted notification ${notificationId} for user ${userId}`);
      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ 
        message: "Failed to delete notification. Please try again later."
      });
    }
  });

  app.delete("/api/notifications/clear-all", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      console.log(`Attempting to clear all notifications for user ${userId}`);
      
      let deletedCount = 0;
      let hasErrors = false;
      
      // Try to delete all notifications for the user from the database
      const userNotifications = await storage.getNotifications({ userId: userId });
      console.log(`Found ${userNotifications.length} notifications to delete for user ${userId}`);
      
      if (userNotifications.length === 0) {
        console.log(`No notifications found for user ${userId}`);
        return res.json({ 
          message: "No notifications to clear",
          deletedCount: 0
        });
      }
      
      // Delete each notification
      for (const notification of userNotifications) {
        try {
          console.log(`Deleting notification ${notification.id}`);
          const deleted = await storage.deleteNotification(notification.id);
          if (deleted) {
            deletedCount++;
            console.log(`Successfully deleted notification ${notification.id}`);
          } else {
            console.error(`Failed to delete notification ${notification.id} - deleteNotification returned false`);
            hasErrors = true;
          }
        } catch (deleteError) {
          console.error(`Error deleting notification ${notification.id}:`, deleteError);
          hasErrors = true;
        }
      }
      
      console.log(`Deletion complete: ${deletedCount}/${userNotifications.length} notifications deleted`);
      
      // Update user state to mark notifications as cleared
      const currentState = userNotificationStates.get(userId) || {
        notificationsCleared: false,
        matchRequestsCleared: false,
        clearedAt: new Date()
      };
      
      userNotificationStates.set(userId, {
        ...currentState,
        notificationsCleared: true,
        clearedAt: new Date()
      });
      
      if (hasErrors && deletedCount === 0) {
        return res.status(500).json({ 
          message: "Failed to delete any notifications. Please try again later.",
          deletedCount: 0
        });
      }
      
      const message = hasErrors 
        ? `Partially cleared notifications: ${deletedCount} of ${userNotifications.length} deleted`
        : "All notifications cleared successfully";
      
      res.json({ 
        message,
        deletedCount: deletedCount,
        totalFound: userNotifications.length
      });
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      res.status(500).json({ 
        message: "Failed to clear all notifications. Please try again later."
      });
    }
  });



  // Match requests count endpoint
  app.get("/api/matches/pending/count", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      const userState = userNotificationStates.get(userId);
      
      // If match requests were cleared, return 0, otherwise return a mock count
      let count = 0;
      if (!userState || !userState.matchRequestsCleared) {
        // Generate a consistent mock count based on user ID to avoid random changes
        count = ((userId + 1) % 3); // Will give 0-2 based on user ID
      }
      
      res.json({ count });
    } catch (error) {
      console.error("Error fetching match requests count:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching match requests count" 
      });
    }
  });

  // Get pending match requests
  app.get("/api/matches/pending", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      
      // For now, return empty array since match requests are cleared
      // In a real app, you would fetch pending match requests from database
      res.json([]);
    } catch (error) {
      console.error("Error fetching pending match requests:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching pending match requests" 
      });
    }
  });

  // Accept/reject match request endpoints
  app.post("/api/matches/:id/accept", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      const matchId = parseInt(req.params.id, 10);
      
      if (isNaN(matchId)) {
        return res.status(400).json({ message: "Invalid match ID" });
      }
      
      // Update user state to mark match requests as cleared (since this one is handled)
      const currentState = userNotificationStates.get(userId) || {
        notificationsCleared: false,
        matchRequestsCleared: false,
        clearedAt: new Date()
      };
      
      userNotificationStates.set(userId, {
        ...currentState,
        matchRequestsCleared: true,
        clearedAt: new Date()
      });
      
      res.json({ message: "Match request accepted successfully" });
    } catch (error) {
      console.error("Error accepting match request:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error accepting match request" 
      });
    }
  });

  app.post("/api/matches/:id/reject", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      const matchId = parseInt(req.params.id, 10);
      
      if (isNaN(matchId)) {
        return res.status(400).json({ message: "Invalid match ID" });
      }
      
      // Update user state to mark match requests as cleared (since this one is handled)
      const currentState = userNotificationStates.get(userId) || {
        notificationsCleared: false,
        matchRequestsCleared: false,
        clearedAt: new Date()
      };
      
      userNotificationStates.set(userId, {
        ...currentState,
        matchRequestsCleared: true,
        clearedAt: new Date()
      });
      
      res.json({ message: "Match request rejected successfully" });
    } catch (error) {
      console.error("Error rejecting match request:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error rejecting match request" 
      });
    }
  });

  // Chat and messaging endpoints
  
  // Get accepted matches for chat
  app.get("/api/matches/accepted", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      console.log(`Fetching accepted matches for user ${userId}`);
      
      try {
        // Get accepted matches from database
        const matches = await storage.getMatches({ 
          $or: [
            { fromUserId: userId, status: 'accepted' },
            { toUserId: userId, status: 'accepted' }
          ]
        });
        
        // Transform matches to include other user info
        const transformedMatches = await Promise.all(matches.map(async (match) => {
          const otherUserId = match.fromUserId === userId ? match.toUserId : match.fromUserId;
          const otherUser = await storage.getUser(otherUserId);
          
          return {
            id: match.id,
            fromUserId: match.fromUserId,
            toUserId: match.toUserId,
            status: match.status,
            otherUser: otherUser ? {
              id: otherUser.id,
              username: otherUser.username,
              fullName: otherUser.fullName,
              imageUrl: otherUser.imageUrl || null,
              skillsToTeach: otherUser.skillsToTeach || [],
              skillsToLearn: otherUser.skillsToLearn || []
            } : null
          };
        }));
        
        // Filter out matches where otherUser is null
        const validMatches = transformedMatches.filter(match => match.otherUser !== null);
        
        console.log(`Found ${validMatches.length} accepted matches for user ${userId}`);
        res.json(validMatches);
      } catch (storageError) {
        console.warn("Storage operation failed for accepted matches:", storageError);
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching accepted matches:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching accepted matches" 
      });
    }
  });

  // Get accepted matches count
  app.get("/api/matches/accepted/count", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      
      try {
        const matches = await storage.getMatches({ 
          $or: [
            { fromUserId: userId, status: 'accepted' },
            { toUserId: userId, status: 'accepted' }
          ]
        });
        
        res.json({ count: matches.length });
      } catch (storageError) {
        console.warn("Storage operation failed for accepted matches count:", storageError);
        res.json({ count: 0 });
      }
    } catch (error) {
      console.error("Error fetching accepted matches count:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching accepted matches count" 
      });
    }
  });

  // Get messages for a specific match
  app.get("/api/matches/:id/messages", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      const matchId = parseInt(req.params.id, 10);
      
      if (isNaN(matchId)) {
        return res.status(400).json({ message: "Invalid match ID" });
      }
      
      console.log(`Fetching messages for match ${matchId}, user ${userId}`);
      
      try {
        // Verify user is part of this match
        const match = await storage.getMatch(matchId);
        if (!match || (match.fromUserId !== userId && match.toUserId !== userId)) {
          return res.status(403).json({ message: "Access denied to this match" });
        }
        
        // Get messages for this match
        const messages = await storage.getMessages({ matchId: matchId });
        
        console.log(`Found ${messages.length} messages for match ${matchId}`);
        res.json(messages);
      } catch (storageError) {
        console.warn("Storage operation failed for messages:", storageError);
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching messages" 
      });
    }
  });

  // Send a message to a match
  app.post("/api/matches/:id/messages", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      const matchId = parseInt(req.params.id, 10);
      const { message } = req.body;
      
      if (isNaN(matchId)) {
        return res.status(400).json({ message: "Invalid match ID" });
      }
      
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      console.log(`Sending message to match ${matchId} from user ${userId}`);
      
      try {
        // Verify user is part of this match
        const match = await storage.getMatch(matchId);
        if (!match || (match.fromUserId !== userId && match.toUserId !== userId)) {
          return res.status(403).json({ message: "Access denied to this match" });
        }
        
        // Create the message
        const chatMessage = {
          matchId: matchId,
          senderId: userId,
          message: message.trim(),
          isRead: false,
          createdAt: new Date()
        };
        
        const savedMessage = await storage.saveMessage(chatMessage);
        
        console.log(`Message sent successfully: ${savedMessage.id}`);
        res.json(savedMessage);
      } catch (storageError) {
        console.error("Storage operation failed for sending message:", storageError);
        res.status(500).json({ message: "Failed to send message" });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error sending message" 
      });
    }
  });

  // Get unread messages count
  app.get("/api/messages/unread/count", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      
      try {
        // Get all matches for this user
        const userMatches = await storage.getMatches({ 
          $or: [
            { fromUserId: userId, status: 'accepted' },
            { toUserId: userId, status: 'accepted' }
          ]
        });
        
        let unreadCount = 0;
        
        // Count unread messages in all user's matches
        for (const match of userMatches) {
          const unreadMessages = await storage.getMessages({ 
            matchId: match.id, 
            isRead: false,
            senderId: { $ne: userId } // Messages not sent by this user
          });
          unreadCount += unreadMessages.length;
        }
        
        res.json({ count: unreadCount });
      } catch (storageError) {
        console.warn("Storage operation failed for unread messages count:", storageError);
        res.json({ count: 0 });
      }
    } catch (error) {
      console.error("Error fetching unread messages count:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching unread messages count" 
      });
    }
  });

  // Mark all messages as read
  app.post("/api/messages/mark-all-read", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      
      try {
        // Get all matches for this user
        const userMatches = await storage.getMatches({ 
          $or: [
            { fromUserId: userId, status: 'accepted' },
            { toUserId: userId, status: 'accepted' }
          ]
        });
        
        let markedCount = 0;
        
        // Mark all unread messages as read in all user's matches
        for (const match of userMatches) {
          const unreadMessages = await storage.getMessages({ 
            matchId: match.id, 
            isRead: false,
            senderId: { $ne: userId } // Messages not sent by this user
          });
          
          for (const message of unreadMessages) {
            await storage.updateMessage(message.id, { isRead: true });
            markedCount++;
          }
        }
        
        console.log(`Marked ${markedCount} messages as read for user ${userId}`);
        res.json({ message: "All messages marked as read", markedCount });
      } catch (storageError) {
        console.warn("Storage operation failed for marking messages as read:", storageError);
        res.json({ message: "Messages marked as read", markedCount: 0 });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error marking messages as read" 
      });
    }
  });

  // Review and Rating API Routes
  
  // Create a review for a user
  app.post("/api/users/:userId/reviews", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const reviewerId = (req.user as User).id;
      const revieweeId = parseInt(req.params.userId);
      const { rating, comment, matchId } = req.body;
      
      // Validate input
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      
      if (reviewerId === revieweeId) {
        return res.status(400).json({ message: "You cannot review yourself" });
      }
      
      // Check if the users have an accepted match
      const match = await storage.getMatch(matchId);
      if (!match || match.status !== 'accepted') {
        return res.status(400).json({ message: "You can only review users you have an accepted match with" });
      }
      
      // Verify the reviewer is part of this match
      if (match.fromUserId !== reviewerId && match.toUserId !== reviewerId) {
        return res.status(400).json({ message: "You are not part of this match" });
      }
      
      // Verify the reviewee is part of this match
      if (match.fromUserId !== revieweeId && match.toUserId !== revieweeId) {
        return res.status(400).json({ message: "Invalid match for this user" });
      }
      
      // Check if review already exists for this match
      const existingReviews = await storage.getReviews({ 
        reviewerId, 
        revieweeId, 
        matchId 
      });
      
      if (existingReviews.length > 0) {
        return res.status(400).json({ message: "You have already reviewed this user for this match" });
      }
      
      // Create the review
      const review = {
        reviewerId,
        revieweeId,
        matchId,
        rating,
        comment: comment || '',
        createdAt: new Date()
      };
      
      await storage.saveReview(review);
      
      res.status(201).json({ message: "Review submitted successfully", review });
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error creating review" 
      });
    }
  });
  
  // Get reviews for a user
  app.get("/api/users/:userId/reviews", async (req: express.Request, res: express.Response) => {
    try {
      const revieweeId = parseInt(req.params.userId);
      
      // Get all reviews for this user
      const reviews = await storage.getReviews({ revieweeId });
      
      // Populate reviewer information
      const populatedReviews = await Promise.all(
        reviews.map(async (review) => {
          const reviewer = await storage.getUser(review.reviewerId);
          return {
            ...review,
            reviewer: reviewer ? {
              id: reviewer.id,
              username: reviewer.username,
              fullName: reviewer.fullName,
              imageUrl: reviewer.imageUrl
            } : null
          };
        })
      );
      
      res.json(populatedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching reviews" 
      });
    }
  });
  
  // Get user rating summary
  app.get("/api/users/:userId/rating", async (req: express.Request, res: express.Response) => {
    try {
      const revieweeId = parseInt(req.params.userId);
      
      // Get all reviews for this user
      const reviews = await storage.getReviews({ revieweeId });
      
      if (reviews.length === 0) {
        return res.json({ averageRating: 0, totalReviews: 0 });
      }
      
      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = Math.round((totalRating / reviews.length) * 10) / 10; // Round to 1 decimal place
      
      res.json({ 
        averageRating, 
        totalReviews: reviews.length 
      });
    } catch (error) {
      console.error("Error fetching user rating:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching user rating" 
      });
    }
  });

  // Test endpoint for review storage (development only)
  app.get("/api/test/reviews", async (req: express.Request, res: express.Response) => {
    try {
      console.log("Test endpoint called - checking reviews in database");
      
      // Fetch all reviews to see what's in the database
      const allReviews = await storage.getReviews({});
      console.log("All reviews in database:", allReviews);
      
      // Try to save a test review
      const testReview = {
        reviewerId: 1,
        revieweeId: 2,
        matchId: 1,
        rating: 5,
        comment: "Test review from API",
        createdAt: new Date()
      };
      
      console.log("Attempting to save test review:", testReview);
      await storage.saveReview(testReview);
      console.log("Test review saved successfully");
      
      // Fetch reviews again to verify
      const updatedReviews = await storage.getReviews({});
      console.log("Reviews after saving:", updatedReviews);
      
      res.json({ 
        message: "Test completed", 
        reviewsBefore: allReviews.length,
        reviewsAfter: updatedReviews.length,
        testReview: testReview,
        allReviews: updatedReviews
      });
    } catch (error) {
      console.error("Error in test review endpoint:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error in test review endpoint",
        error: error instanceof Error ? error.stack : undefined
      });
    }
  });

  // Add a global error handler to ensure all errors return JSON responses
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global error handler caught:", err);
    
    // Check if headers have already been sent
    if (res.headersSent) {
      return next(err);
    }
    
    // Set status code (default to 500 if not set)
    const statusCode = err.status || err.statusCode || 500;
    
    // Send JSON error response
    res.status(statusCode).json({
      message: err.message || "An unexpected error occurred",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
