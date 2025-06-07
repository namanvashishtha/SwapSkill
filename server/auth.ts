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
  // Improved session configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "swapskill-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
      httpOnly: true,
      sameSite: 'strict'
    }
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
      const user = await storage.getUser(id);
      if (!user) {
        return done(new Error('User not found'));
      }
      done(null, user);
    } catch (error) {
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
          
          return res.status(200).json(sanitizedUser);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
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
    
    // Sanitize user object
    const sanitizedUser = {
      id: req.user?.id,
      username: req.user?.username,
      fullName: req.user?.fullName,
      email: req.user?.email,
      location: req.user?.location,
    };
    
    res.json(sanitizedUser);
  });
}
