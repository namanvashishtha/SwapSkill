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
      
      const notifications = await storage.getNotifications({ userId });
      
      res.json(notifications);
    } catch (error) {
      console.error("Error checking notifications:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error checking notifications" 
      });
    }
  });

  // Create HTTP server
  const server = createServer(app);
  return server;
}
