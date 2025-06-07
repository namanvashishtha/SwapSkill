import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage.js";
import { User as SelectUser } from "../shared/schema.js";
import { z } from "zod";
import MongoStore from "connect-mongo";
import multer from "multer";
import path from "path";
import fs from "fs";
import { updateUserBioAndImage } from "./db/mongodb.js";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Improved session configuration with better error handling and typing
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "swapskill-secret-key",
    resave: true, // Ensure session is saved on every request
    saveUninitialized: true, // Create session even if not modified
    store: storage.sessionStore,
    genid: function(req) {
      // Generate a unique session ID with timestamp and random string
      const uniqueId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      console.log(`Generated new session ID: ${uniqueId}`);
      return uniqueId;
    },
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: false, // Set to false for development
      httpOnly: true,
      sameSite: 'lax', // Allow redirects
      path: '/' // Ensure cookie is available for all paths
    },
    name: 'skillswap.sid', // Custom name to avoid conflicts
    rolling: true, // Reset cookie expiration on each request
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        const isMatch = await comparePasswords(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user: SelectUser, done) => {
    // Ensure we're using a non-null, unique identifier
    if (!user || !user.id) {
      return done(new Error('Invalid user or missing ID'));
    }
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      // Get complete user data from storage
      const user = await storage.getUser(id);
      if (!user) {
        return done(new Error('User not found'));
      }
      // Ensure all required fields have default values
      const completeUser = {
        ...user,
        skillsToTeach: user.skillsToTeach || [],
        skillsToLearn: user.skillsToLearn || [],
        bio: user.bio || '',
        imageUrl: user.imageUrl || null
      };
      done(null, completeUser);
    } catch (error) {
      console.error("Error deserializing user:", error);
      done(error);
    }
  });

  // Login validation schema
  const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
  });

  // Registration validation schema
  const registrationSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    location: z.string().min(1, "Location is required"),
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate registration data
      const validatedData = registrationSchema.parse(req.body);

      // Check for existing user
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      // Create new user
      const user = await storage.createUser({
        ...validatedData,
        password: await hashPassword(validatedData.password),
        skillsToTeach: req.body.skillsToTeach || [],
        skillsToLearn: req.body.skillsToLearn || [],
      });

      // Automatically log in the user after registration
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        res.status(201).json({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          location: user.location,
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      // Validate login request
      loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: Error, user: SelectUser, info: any) => {
        if (err) {
          console.error("Authentication error:", err);
          return next(err);
        }
        
        if (!user) {
          // More informative error message
          return res.status(401).json({ 
            message: info?.message || "Authentication failed" 
          });
        }
        
        req.login(user, (err) => {
          if (err) {
            console.error("Login error:", err);
            return next(err);
          }
          
          // Explicitly save the session before responding
          req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
              return next(err);
            }
            
            // Sanitize user object before sending
            const sanitizedUser = {
              id: user.id,
              username: user.username,
              fullName: user.fullName,
              email: user.email,
              location: user.location,
            };
            
            console.log("Login successful for user:", user.username, "Session ID:", req.sessionID);
            return res.status(200).json(sanitizedUser);
          });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Login route error:", error);
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      // Destroy the session completely
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Include all necessary user data including skills, bio and imageUrl
    const sanitizedUser = {
      id: req.user?.id,
      username: req.user?.username,
      fullName: req.user?.fullName,
      email: req.user?.email,
      location: req.user?.location,
      skillsToTeach: req.user?.skillsToTeach || [],
      skillsToLearn: req.user?.skillsToLearn || [],
      bio: req.user?.bio || '',
      imageUrl: req.user?.imageUrl || null,
    };
    
    res.json(sanitizedUser);
  });
  
  // Add profile update endpoint
  
  const uploadDir = path.join(process.cwd(), "uploads");
  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const storage_config = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  });
  
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
  
  app.post("/api/user/profile", upload.single("image"), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user?.id;
      const bio = req.body.bio || '';
      
      // Get image URL if uploaded
      let imageUrl = req.user?.imageUrl || null;
      if (req.file) {
        // Update to the new image URL (relative to the server)
        imageUrl = `/uploads/${req.file.filename}`;
      }
      
      // Update user profile
      const success = await updateUserBioAndImage(userId, bio, imageUrl);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to update profile" });
      }
      
      // Get updated user to return
      const updatedUser = await storage.getUser(userId);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return updated user information
      const sanitizedUser = {
        id: updatedUser.id,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        location: updatedUser.location,
        skillsToTeach: updatedUser.skillsToTeach || [],
        skillsToLearn: updatedUser.skillsToLearn || [],
        bio: updatedUser.bio || '',
        imageUrl: updatedUser.imageUrl || null,
      };
      
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error updating profile" 
      });
    }
  });
}
