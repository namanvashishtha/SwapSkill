import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage.js";
import { User as SelectUser } from "../shared/schema.js";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function comparePasswords(supplied: string, stored: string) {
  try {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

export function setupSimpleAuth(app: Express) {
  console.log("Setting up simple authentication...");

  // Minimal session configuration - no MongoDB store to avoid issues
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "swapskill-fallback-secret-" + Date.now(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: false, // Set to false to avoid HTTPS issues in production
      httpOnly: true,
      sameSite: 'lax'
    },
    name: 'skillswap.sid'
  };

  // Set trust proxy for production
  if (process.env.NODE_ENV === 'production') {
    app.set("trust proxy", 1);
  }
  
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Simple auth: Attempting authentication for user: ${username}`);
        
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`Simple auth: User not found: ${username}`);
          return done(null, false, { message: "User not found" });
        }
        
        console.log(`Simple auth: User found: ${username}, checking password`);
        const isMatch = await comparePasswords(password, user.password);
        if (!isMatch) {
          console.log(`Simple auth: Password mismatch for user: ${username}`);
          return done(null, false, { message: "Invalid password" });
        }
        
        console.log(`Simple auth: Authentication successful for user: ${username}`);
        // Convert null values to undefined to match TypeScript User type expectations
        const sanitizedUser = {
          ...user,
          skillsToTeach: user.skillsToTeach ?? undefined,
          skillsToLearn: user.skillsToLearn ?? undefined,
          fullName: user.fullName ?? undefined,
          email: user.email ?? undefined,
          location: user.location ?? undefined,
          bio: user.bio ?? undefined,
          imageUrl: user.imageUrl ?? undefined
        };
        return done(null, sanitizedUser);
      } catch (error) {
        console.error(`Simple auth: Error during authentication for user: ${username}`, error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user: Express.User, done) => {
    console.log(`Serializing user: ${user.username} (ID: ${user.id})`);
    if (!user || !user.id) {
      return done(new Error('Invalid user or missing ID'));
    }
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log(`Deserializing user ID: ${id}`);
      const user = await storage.getUser(id);
      if (!user) {
        console.log(`User not found during deserialization: ${id}`);
        return done(null, false);
      }
      console.log(`User deserialized: ${user.username}`);
      // Convert null values to undefined to match TypeScript User type expectations
      const sanitizedUser = {
        ...user,
        skillsToTeach: user.skillsToTeach ?? undefined,
        skillsToLearn: user.skillsToLearn ?? undefined,
        fullName: user.fullName ?? undefined,
        email: user.email ?? undefined,
        location: user.location ?? undefined,
        bio: user.bio ?? undefined,
        imageUrl: user.imageUrl ?? undefined
      };
      done(null, sanitizedUser);
    } catch (error) {
      console.error("Error deserializing user:", error);
      done(error);
    }
  });

  // Simple login endpoint with extensive error handling
  app.post("/api/login", async (req, res, next) => {
    try {
      const { username, password } = req.body;
      
      console.log(`Login attempt: ${username}`);
      
      if (!username || !password) {
        console.log("Missing username or password");
        return res.status(400).json({ message: "Username and password required" });
      }

      // Use passport authenticate with promise wrapper
      passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
        console.log(`Passport authenticate callback - err: ${!!err}, user: ${!!user}, info: ${JSON.stringify(info)}`);
        
        if (err) {
          console.error("Authentication error:", err);
          return res.status(500).json({ 
            message: "Authentication error", 
            error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message 
          });
        }
        
        if (!user) {
          console.log("Authentication failed:", info?.message || "Invalid credentials");
          return res.status(401).json({ 
            message: info?.message || "Invalid credentials" 
          });
        }
        
        // Sanitize user object before login
        const sanitizedUserForLogin = {
          ...user,
          skillsToTeach: user.skillsToTeach ?? undefined,
          skillsToLearn: user.skillsToLearn ?? undefined,
          fullName: user.fullName ?? undefined,
          email: user.email ?? undefined,
          location: user.location ?? undefined,
          bio: user.bio ?? undefined,
          imageUrl: user.imageUrl ?? undefined
        };
        
        // Login the user
        req.login(sanitizedUserForLogin, (loginErr) => {
          if (loginErr) {
            console.error("Login error:", loginErr);
            return res.status(500).json({ 
              message: "Login error", 
              error: process.env.NODE_ENV === 'production' ? 'Server error' : loginErr.message 
            });
          }
          
          console.log(`User ${user.username} logged in successfully`);
          
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
      console.error("Login route error:", error);
      res.status(500).json({ 
        message: "Server error", 
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : (error instanceof Error ? error.message : String(error))
      });
    }
  });

  // Simple logout endpoint
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout error" });
      }
      res.clearCookie('skillswap.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  // Simple user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const sanitizedUser = {
      id: req.user?.id,
      username: req.user?.username,
      fullName: req.user?.fullName,
      email: req.user?.email,
      location: req.user?.location,
      skillsToTeach: req.user?.skillsToTeach || [],
      skillsToLearn: req.user?.skillsToLearn || [],
      bio: req.user?.bio || '',
      imageUrl: req.user?.imageUrl || null
    };
    
    res.json(sanitizedUser);
  });

  console.log('Simple authentication setup completed');
}