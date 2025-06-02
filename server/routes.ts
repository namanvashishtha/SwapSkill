import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth.js";
import { storage } from "./storage.js";
import { setupStatusRoutes } from "./routes/status.js";
import { setupAdminRoutes } from "./routes/admin.js";
import { updateUserBioAndImage, UserModel, mongoUserToAppUser } from "./db/mongodb.js";
import multer from "multer";
import path from "path";
import * as fs from "fs";
import { User } from "../shared/schema.js";

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Setup status routes
  setupStatusRoutes(app);
  
  // Setup admin routes
  setupAdminRoutes(app);

  // Setup skills API
  app.get("/api/skills", async (req: express.Request, res: express.Response) => {
    const skills = [
      { id: 1, name: "Coding", icon: "code", category: "Technology" },
      { id: 2, name: "Music", icon: "music_note", category: "Arts" },
      { id: 3, name: "Cooking", icon: "restaurant", category: "Lifestyle" },
      { id: 4, name: "Photography", icon: "camera_alt", category: "Arts" },
      { id: 5, name: "Design", icon: "palette", category: "Arts" },
      { id: 6, name: "Language", icon: "translate", category: "Education" },
      { id: 7, name: "Crafts", icon: "build", category: "Hobbies" },
      { id: 8, name: "Finance", icon: "account_balance", category: "Business" },
      { id: 9, name: "Art", icon: "brush", category: "Arts" },
      { id: 10, name: "Mentoring", icon: "people", category: "Professional" },
    ];
    
    res.json(skills);
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
      
      const notifications = await storage.getNotifications({
        userId: userId,
        isRead: false
      });
      const unreadCount = notifications.length;
      
      res.json({ count: unreadCount });
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
      
      // For now, return 0 since we don't have read/unread tracking for messages yet
      // This can be enhanced later to track message read status
      res.json({ count: 0 });
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
      await storage.saveMessage(newMessage);
      
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error sending message" 
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
