// Load environment variables from .env file
import 'dotenv/config';

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { storage } from "./storage.js";
import { networkInterfaces } from "os";
import { createServer } from "http";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { registerRoutes } from "./routes.js";

const app = express();
const PORT = process.env.PORT || 3000;
const scryptAsync = promisify(scrypt);

// Declare types for passport
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      fullName?: string | null;
      email?: string | null;
      location?: string | null;
      skillsToTeach?: string[] | null;
      skillsToLearn?: string[] | null;
      bio?: string;
      imageUrl?: string | null;
      password: string;
    }
  }
}

// Password comparison function
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

// Function to get local IP address
function getLocalIPAddress(): string {
  const interfaces = networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    if (iface) {
      for (const details of iface) {
        if (details.family === 'IPv4' && !details.internal) {
          return details.address;
        }
      }
    }
  }
  return 'localhost';
}

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
    return originalSend.call(this, data);
  };
  
  next();
});

// Error handling middleware
function errorHandler(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
  console.error('Server Error:', err);
  
  // Always return a simple error response
  res.status(500).json({ 
    message: 'Server error occurred',
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString()
  });
}

async function startServer() {
  console.log('🚀 Starting SkillSwap Server...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', PORT);
  console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
  
  try {
    // Step 1: Initialize storage with retries
    console.log('📦 Initializing storage...');
    let storageInitialized = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await storage.initialize();
        storageInitialized = true;
        console.log('✅ Storage initialized successfully');
        break;
      } catch (error) {
        console.error(`❌ Storage initialization failed (attempt ${attempt}/3):`, error);
        if (attempt === 3) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }

    // Step 2: Setup CORS (allow all for production debugging)
    console.log('🌐 Setting up CORS...');
    app.use(cors({
      origin: true, // Allow all origins for now
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    }));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Step 3: Setup session (minimal configuration)
    console.log('🔐 Setting up sessions...');
    const sessionConfig = {
      secret: process.env.SESSION_SECRET || 'fallback-secret-' + Date.now(),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: false, // Allow HTTP for debugging
        httpOnly: true,
        sameSite: 'lax' as const
      },
      name: 'skillswap.sid'
    };

    if (process.env.NODE_ENV === 'production') {
      app.set('trust proxy', 1);
    }

    app.use(session(sessionConfig));
    app.use(passport.initialize());
    app.use(passport.session());

    // Step 4: Setup passport authentication
    console.log('🛡️ Setting up authentication...');
    passport.use(new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`🔍 Authenticating user: ${username}`);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`❌ User not found: ${username}`);
          return done(null, false, { message: "User not found" });
        }
        
        const isMatch = await comparePasswords(password, user.password);
        if (!isMatch) {
          console.log(`❌ Invalid password for: ${username}`);
          return done(null, false, { message: "Invalid password" });
        }
        
        console.log(`✅ Authentication successful: ${username}`);
        return done(null, user);
      } catch (error) {
        console.error(`💥 Auth error for ${username}:`, error);
        return done(error);
      }
    }));

    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id: number, done) => {
      try {
        const user = await storage.getUser(id);
        done(null, user || false);
      } catch (error) {
        done(error);
      }
    });

    // Step 5: Set up static files and routes
    console.log('🛣️ Setting up static files and routes...');

    // Serve static files from dist/public folder (frontend build)
    const staticPath = path.join(process.cwd(), 'dist', 'public');
    console.log('📁 Static files path:', staticPath);
    
    // Serve static files
    app.use(express.static(staticPath));
    
    // Register all API routes from routes.ts
    console.log('� Registering API routes...');
    await registerRoutes(app);

    // Catch-all handler: send back React's index.html file for client-side routing
    app.get('*', (req, res) => {
      // Don't intercept API routes
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API endpoint not found' });
      }
      
      const indexPath = path.join(staticPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error sending index.html:', err);
          res.status(500).json({ 
            message: 'Frontend not available. Please build the application first.',
            hint: 'Run: npm run build'
          });
        }
      });
    });

    // Error handling middleware
    app.use(errorHandler);

    // Step 6: Start server
    console.log('🚀 Starting HTTP server...');
    const server = createServer(app);
    
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/login`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  }
}

// Run the server
startServer();
