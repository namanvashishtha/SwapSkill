import express, { type Express } from "express";
import { createServer, type Server } from "http";
// import setupAuth from "./auth.js";
import { setupSimpleAuth } from "./auth-simple-new.js";
import { storage } from "./storage.js";
import { setupStatusRoutes } from "./routes/status.js";
import { setupAdminRoutes } from "./routes/admin.js";
import { 
  updateUserBioAndImage, 
  UserModel, 
  SkillModel, 
  AvailableSkillModel,
  MatchModel, 
  NotificationModel, 
  ChatMessageModel, 
  ReviewModel, 
  SessionModel,
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

export async function registerRoutes(app: Express): Promise<void> {
  // Setup authentication routes
  setupSimpleAuth(app);
  
  // Setup status routes
  setupStatusRoutes(app);
  
  // Setup admin routes
  setupAdminRoutes(app);

  // Add health check endpoint for production debugging
  app.get("/api/health", async (req, res) => {
    try {
      const healthCheck = {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        memory: process.memoryUsage(),
        mongodb: "unknown",
        session: "unknown",
        users: "unknown"
      };

      // Test MongoDB connection
      try {
        await UserModel.findOne().lean();
        healthCheck.mongodb = "connected";
        
        // Test if we can find the dan user
        const danUser = await UserModel.findOne({ username: "dan" }).lean();
        if (danUser) {
          healthCheck.users = "dan user exists";
        } else {
          healthCheck.users = "dan user not found";
        }
      } catch (dbError) {
        healthCheck.mongodb = "error: " + (dbError instanceof Error ? dbError.message : String(dbError));
      }

      // Test session store
      try {
        if (storage.sessionStore) {
          healthCheck.session = "configured";
        } else {
          healthCheck.session = "not configured";
        }
      } catch (sessionError) {
        healthCheck.session = "error: " + (sessionError instanceof Error ? sessionError.message : String(sessionError));
      }

      res.json(healthCheck);
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

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
      
      const notifications = await storage.getNotifications({ userId });
      
      res.json(notifications);
    } catch (error) {
      console.error("Error checking notifications:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error checking notifications" 
      });
    }
  });

  // ======================== MATCHES API ========================
  
  // Get all matches for current user
  app.get("/api/matches", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      console.log(`Fetching matches for user ${userId}`);
      
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

  // Get pending match requests for current user
  app.get("/api/matches/pending", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      console.log(`Fetching pending matches for user ${userId}`);
      
      // Get matches where current user is the recipient and status is pending
      const pendingMatches = await storage.getMatches({ 
        toUserId: userId,
        status: 'pending'
      });
      
      // Populate fromUser data for each match
      const matchesWithUsers = await Promise.all(
        pendingMatches.map(async (match) => {
          try {
            const fromUser = await storage.getUser(match.fromUserId);
            return {
              ...match,
              fromUser: fromUser ? mongoUserToAppUser(fromUser) : null
            };
          } catch (error) {
            console.error(`Error fetching user ${match.fromUserId}:`, error);
            return { ...match, fromUser: null };
          }
        })
      );
      
      res.json(matchesWithUsers);
    } catch (error) {
      console.error("Error fetching pending matches:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching pending matches" 
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
      console.log(`Fetching accepted matches for user ${userId}`);
      
      const acceptedMatches = await storage.getMatches({ 
        $or: [
          { fromUserId: userId, status: 'accepted' },
          { toUserId: userId, status: 'accepted' }
        ]
      });
      
      // Populate otherUser data for each match
      const matchesWithUsers = await Promise.all(
        acceptedMatches.map(async (match) => {
          try {
            const otherUserId = match.fromUserId === userId ? match.toUserId : match.fromUserId;
            const otherUser = await storage.getUser(otherUserId);
            return {
              ...match,
              otherUser: otherUser ? mongoUserToAppUser(otherUser) : null
            };
          } catch (error) {
            console.error(`Error fetching other user:`, error);
            return { ...match, otherUser: null };
          }
        })
      );
      
      res.json(matchesWithUsers);
    } catch (error) {
      console.error("Error fetching accepted matches:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching accepted matches" 
      });
    }
  });

  // Create a new match request
  app.post("/api/matches", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const { toUserId } = req.body;
      const fromUserId = (req.user as User).id;
      
      if (!toUserId) {
        return res.status(400).json({ message: "Target user ID is required" });
      }
      
      if (fromUserId === toUserId) {
        return res.status(400).json({ message: "Cannot match with yourself" });
      }
      
      // Check if match request already exists
      const existingMatch = await storage.getMatches({
        $or: [
          { fromUserId: fromUserId, toUserId: toUserId },
          { fromUserId: toUserId, toUserId: fromUserId }
        ]
      });
      
      if (existingMatch.length > 0) {
        return res.status(409).json({ message: "Match request already exists" });
      }
      
      // Create new match request
      const newMatch = {
        id: await storage.getNextId(),
        fromUserId: fromUserId,
        toUserId: toUserId,
        status: 'pending' as const,
        createdAt: new Date()
      };
      
      const savedMatch = await storage.saveMatch(newMatch);
      
      // Create notification for the recipient
      const notification = {
        id: await storage.getNextId(),
        userId: toUserId,
        type: 'match_request' as const,
        title: 'New Match Request',
        message: 'Someone wants to match with you!',
        isRead: false,
        relatedUserId: fromUserId,
        relatedMatchId: savedMatch.id,
        createdAt: new Date()
      };
      
      await storage.saveNotification(notification);
      
      res.json(savedMatch);
    } catch (error) {
      console.error("Error creating match request:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error creating match request" 
      });
    }
  });

  // Respond to a match request (accept/reject)
  app.put("/api/matches/:id", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const matchId = parseInt(req.params.id);
      const { status } = req.body;
      const userId = (req.user as User).id;
      
      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'accepted' or 'rejected'" });
      }
      
      const match = await storage.getMatch(matchId);
      if (!match) {
        return res.status(404).json({ message: "Match request not found" });
      }
      
      // Only the recipient can respond to the match request
      if (match.toUserId !== userId) {
        return res.status(403).json({ message: "You can only respond to match requests sent to you" });
      }
      
      if (match.status !== 'pending') {
        return res.status(400).json({ message: "This match request has already been responded to" });
      }
      
      // Update match status
      const updatedMatch = await storage.updateMatch(matchId, { status });
      
      // Create notification for the requester
      const notification = {
        id: await storage.getNextId(),
        userId: match.fromUserId,
        type: 'match_accepted' as const,
        title: status === 'accepted' ? 'Match Request Accepted!' : 'Match Request Declined',
        message: status === 'accepted' ? 'Your match request was accepted!' : 'Your match request was declined.',
        isRead: false,
        relatedUserId: userId,
        relatedMatchId: matchId,
        createdAt: new Date()
      };
      
      await storage.saveNotification(notification);
      
      res.json(updatedMatch);
    } catch (error) {
      console.error("Error responding to match request:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error responding to match request" 
      });
    }
  });

  // ======================== NOTIFICATIONS API ========================
  
  // Get notifications for current user
  app.get("/api/notifications", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      console.log(`Fetching notifications for user ${userId}`);
      
      const notifications = await storage.getNotifications({ userId });
      
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
  app.put("/api/notifications/:id", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const notificationId = parseInt(req.params.id);
      const userId = (req.user as User).id;
      const { isRead } = req.body;
      
      // First check if the notification belongs to the current user
      const notification = await storage.getNotifications({ id: notificationId, userId });
      if (notification.length === 0) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      const updatedNotification = await storage.updateNotification(notificationId, { isRead });
      res.json(updatedNotification);
    } catch (error) {
      console.error("Error updating notification:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error updating notification" 
      });
    }
  });

  // Delete notification
  app.delete("/api/notifications/:id", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const notificationId = parseInt(req.params.id);
      const userId = (req.user as User).id;
      
      // First check if the notification belongs to the current user
      const notification = await storage.getNotifications({ id: notificationId, userId });
      if (notification.length === 0) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      await storage.deleteNotification(notificationId);
      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error deleting notification" 
      });
    }
  });

  // Clear all notifications for current user
  app.delete("/api/notifications", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      console.log(`Clearing all notifications for user ${userId}`);
      
      // Get all notifications for the user and delete them
      const notifications = await storage.getNotifications({ userId });
      
      let deletedCount = 0;
      for (const notification of notifications) {
        await storage.deleteNotification(notification.id);
        deletedCount++;
      }
      
      res.json({ message: `Cleared ${deletedCount} notifications` });
    } catch (error) {
      console.error("Error clearing notifications:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error clearing notifications" 
      });
    }
  });

  // ======================== CHAT/MESSAGES API ========================
  
  // Get messages for a specific match
  app.get("/api/matches/:matchId/messages", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const matchId = parseInt(req.params.matchId);
      const userId = (req.user as User).id;
      
      // Verify the user is part of this match
      const match = await storage.getMatch(matchId);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      if (match.fromUserId !== userId && match.toUserId !== userId) {
        return res.status(403).json({ message: "You can only view messages for your own matches" });
      }
      
      const messages = await storage.getMessages({ matchId });
      
      // Sort by creation date (oldest first for chat display)
      messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching messages" 
      });
    }
  });

  // Send a message in a match
  app.post("/api/matches/:matchId/messages", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const matchId = parseInt(req.params.matchId);
      const userId = (req.user as User).id;
      const { message } = req.body;
      
      if (!message || message.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      // Verify the user is part of this match and it's accepted
      const match = await storage.getMatch(matchId);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      if (match.fromUserId !== userId && match.toUserId !== userId) {
        return res.status(403).json({ message: "You can only send messages in your own matches" });
      }
      
      if (match.status !== 'accepted') {
        return res.status(400).json({ message: "You can only send messages in accepted matches" });
      }
      
      // Create new message
      const newMessage = {
        id: await storage.getNextId(),
        matchId: matchId,
        senderId: userId,
        message: message.trim(),
        createdAt: new Date()
      };
      
      const savedMessage = await storage.saveMessage(newMessage);
      
      // Create notification for the other user
      const otherUserId = match.fromUserId === userId ? match.toUserId : match.fromUserId;
      const notification = {
        id: await storage.getNextId(),
        userId: otherUserId,
        type: 'message' as const,
        title: 'New Message',
        message: 'You have a new message!',
        isRead: false,
        relatedUserId: userId,
        relatedMatchId: matchId,
        createdAt: new Date()
      };
      
      await storage.saveNotification(notification);
      
      res.json(savedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error sending message" 
      });
    }
  });

  // ======================== SESSIONS API ========================
  
  // Get weekly session statistics with skills breakdown
  app.get("/api/sessions/weekly-stats", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const userId = (req.user as User).id;
      console.log(`Fetching weekly session stats for user ${userId}`);
      
      // Get user to access their skills
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Combine all user skills
      const allUserSkills = [
        ...(user.skillsToTeach || []),
        ...(user.skillsToLearn || [])
      ];
      
      // Generate weekly data with skills breakdown
      const skillsData = allUserSkills.slice(0, 8).map((skill, index) => ({
        name: skill.length > 12 ? skill.substring(0, 12) + '...' : skill,
        fullName: skill,
        sessions: Math.floor(Math.random() * 15) + 1, // Random data for demo
        skillType: (user.skillsToTeach || []).includes(skill) ? 'teaching' : 'learning',
        weekStart: new Date(Date.now() + index * 7 * 24 * 60 * 60 * 1000).toISOString(),
        weekEnd: new Date(Date.now() + (index * 7 + 6) * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      // If user has no skills, show default skills data
      if (skillsData.length === 0) {
        const defaultSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'CSS', 'HTML', 'Design', 'Marketing'];
        const defaultData = defaultSkills.map((skill, index) => ({
          name: skill,
          fullName: skill,
          sessions: Math.floor(Math.random() * 10) + 1,
          skillType: index % 2 === 0 ? 'teaching' : 'learning',
          weekStart: new Date(Date.now() + index * 7 * 24 * 60 * 60 * 1000).toISOString(),
          weekEnd: new Date(Date.now() + (index * 7 + 6) * 24 * 60 * 60 * 1000).toISOString()
        }));
        return res.json(defaultData);
      }
      
      res.json(skillsData);
    } catch (error) {
      console.error("Error fetching weekly session stats:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching session stats" 
      });
    }
  });

  // Get sessions for a specific match
  app.get("/api/matches/:matchId/sessions", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const matchId = parseInt(req.params.matchId);
      const currentUserId = (req.user as User).id;
      
      console.log(`Fetching sessions for match ${matchId}, user ${currentUserId}`);
      
      // Get sessions for this match
      const sessions = await storage.getSessions({ matchId });
      
      // Populate session data with other user information
      const sessionsWithUsers = await Promise.all(
        sessions.map(async (session) => {
          try {
            const otherUserId = session.proposerId === currentUserId ? session.participantId : session.proposerId;
            const otherUser = await storage.getUser(otherUserId);
            
            return {
              ...session,
              otherUser: otherUser ? mongoUserToAppUser(otherUser) : null,
              isProposer: session.proposerId === currentUserId
            };
          } catch (error) {
            console.error(`Error fetching user for session ${session.id}:`, error);
            return {
              ...session,
              otherUser: null,
              isProposer: session.proposerId === currentUserId
            };
          }
        })
      );
      
      res.json(sessionsWithUsers);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching sessions" 
      });
    }
  });

  // Respond to a session proposal
  app.post("/api/sessions/:sessionId/respond", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const sessionId = parseInt(req.params.sessionId);
      const { response, reminderMinutes } = req.body;
      const currentUserId = (req.user as User).id;
      
      if (!['accepted', 'rejected'].includes(response)) {
        return res.status(400).json({ message: "Invalid response. Must be 'accepted' or 'rejected'" });
      }
      
      console.log(`User ${currentUserId} responding to session ${sessionId} with: ${response}`);
      
      // Get the session
      const sessions = await storage.getSessions({ id: sessionId });
      const session = sessions[0];
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Verify user is the participant (not the proposer)
      if (session.participantId !== currentUserId) {
        return res.status(403).json({ message: "You can only respond to sessions proposed to you" });
      }
      
      // Update session status
      const updatedSession = {
        ...session,
        status: response,
        respondedAt: new Date()
      };
      
      // Add reminder settings if accepted
      if (response === 'accepted' && reminderMinutes) {
        updatedSession.reminderSettings = {
          ...session.reminderSettings,
          participantReminder: reminderMinutes
        };
      }
      
      await storage.updateSession(sessionId, updatedSession);
      
      res.json({ message: `Session ${response} successfully` });
    } catch (error) {
      console.error("Error responding to session:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error responding to session" 
      });
    }
  });

  // Update session reminder
  app.patch("/api/sessions/:sessionId/reminder", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const sessionId = parseInt(req.params.sessionId);
      const { reminderMinutes } = req.body;
      const currentUserId = (req.user as User).id;
      
      console.log(`User ${currentUserId} updating reminder for session ${sessionId} to ${reminderMinutes} minutes`);
      
      // Get the session
      const sessions = await storage.getSessions({ id: sessionId });
      const session = sessions[0];
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Verify user is involved in this session
      if (session.proposerId !== currentUserId && session.participantId !== currentUserId) {
        return res.status(403).json({ message: "You can only update reminders for your own sessions" });
      }
      
      // Update reminder settings
      const reminderField = session.proposerId === currentUserId ? 'proposerReminder' : 'participantReminder';
      const updatedSession = {
        ...session,
        reminderSettings: {
          ...session.reminderSettings,
          [reminderField]: reminderMinutes
        }
      };
      
      await storage.updateSession(sessionId, updatedSession);
      
      res.json({ message: "Reminder updated successfully" });
    } catch (error) {
      console.error("Error updating session reminder:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error updating reminder" 
      });
    }
  });

  // ======================== AVAILABLE SKILLS API ========================
  
  // Get all available skills
  app.get("/api/available-skills", async (req: express.Request, res: express.Response) => {
    try {
      console.log("Fetching all available skills");
      
      // Get all available skills from MongoDB
      const availableSkills = await AvailableSkillModel.find({ isActive: true }).lean();
      
      // Convert to expected format
      const skillsResponse = availableSkills.map(skill => ({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        description: skill.description,
        isActive: skill.isActive
      }));
      
      res.json(skillsResponse);
    } catch (error) {
      console.error("Error fetching available skills:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching available skills" 
      });
    }
  });

  // ======================== USERS API ========================
  
  // Get all users (for matching)
  app.get("/api/users", async (req: express.Request, res: express.Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      console.log("Fetching all users for matching");
      
      // Get all users from MongoDB
      const mongoUsers = await UserModel.find({}).lean();
      
      // Convert to app format
      const appUsers = mongoUsers.map(mongoUser => mongoUserToAppUser(mongoUser));
      
      res.json(appUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error fetching users" 
      });
    }
  });

  // Routes registered successfully
  console.log('✅ All routes registered successfully');
}
