// Load environment variables from .env file
import 'dotenv/config';

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { setupSimpleAuth } from "./auth-simple-new.js";
import { storage } from "./storage.js";
import { networkInterfaces } from "os";
import { createServer } from "http";

const app = express();
const PORT = process.env.PORT || 3000;

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

// Middleware for logging and error handling
function errorHandler(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
  console.error('Unhandled Error:', err);

  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(409).json({ 
      message: 'A duplicate key error occurred', 
      error: err.message 
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation Error', 
      errors: err.errors 
    });
  }

  res.status(500).json({ 
    message: 'An unexpected error occurred', 
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
  });
}

async function startSimpleServer() {
  try {
    console.log('=== SIMPLE SERVER STARTUP ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('PORT:', PORT);
    console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
    console.log('SESSION_SECRET set:', !!process.env.SESSION_SECRET);
    
    // Initialize storage first
    console.log('Initializing storage...');
    await storage.initialize();
    console.log('Storage initialized successfully');

    // Basic middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // CORS configuration - simplified for production
    const corsOptions = {
      origin: true, // Allow all origins for now
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    };

    app.use(cors(corsOptions));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Health check endpoint
    app.get("/api/health", async (req, res) => {
      try {
        const healthCheck = {
          status: "ok",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || "development",
          mongodb: "unknown",
          testUser: "unknown"
        };

        // Test MongoDB connection
        try {
          const testUser = await storage.getUserByUsername("dan");
          if (testUser) {
            healthCheck.mongodb = "connected";
            healthCheck.testUser = "dan user exists";
          } else {
            healthCheck.mongodb = "connected";
            healthCheck.testUser = "dan user not found";
          }
        } catch (dbError) {
          healthCheck.mongodb = "error: " + (dbError instanceof Error ? dbError.message : String(dbError));
        }

        res.json(healthCheck);
      } catch (error) {
        res.status(500).json({
          status: "error",
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Authentication setup
    setupSimpleAuth(app);

    // Serve static files from the uploads directory
    const uploadsPath = path.join(process.cwd(), 'uploads');
    console.log('Serving uploads from:', uploadsPath);
    app.use('/uploads', express.static(uploadsPath));
    
    // Global error handling middleware
    app.use(errorHandler);

    // Create server
    const server = createServer(app);

    // Start the server
    server.listen(PORT, () => {
      const address = server.address();
      if (address && typeof address === "object") {
        console.log(`Simple server running on http://localhost:${address.port}`);
        console.log(`Network access: http://${getLocalIPAddress()}:${address.port}`);
      } else {
        console.log(`Simple server running on unknown port`);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start simple server:', error);
    process.exit(1);
  }
}

// Run the simple server
startSimpleServer();