// Load environment variables from .env file
import 'dotenv/config';

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { setupAuth } from "./auth.js";
import { storage } from "./storage.js";
import { registerRoutes } from "./routes.js";
import { networkInterfaces } from "os";
import { setupVite, serveStatic, log } from "./vite.js";

const app = express();
const PORT = process.env.PORT || 3001;

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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Middleware for logging and error handling
function errorHandler(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
  // Log the error
  console.error('Unhandled Error:', err);

  // Check for specific error types
  if (err.name === 'MongoError' && err.code === 11000) {
    // Duplicate key error
    return res.status(409).json({ 
      message: 'A duplicate key error occurred', 
      error: err.message 
    });
  }

  if (err.name === 'ValidationError') {
    // Mongoose validation error
    return res.status(400).json({ 
      message: 'Validation Error', 
      errors: err.errors 
    });
  }

  // Generic server error
  res.status(500).json({ 
    message: 'An unexpected error occurred', 
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
  });
}

async function startServer() {
  try {
    // Initialize storage (database connection)
    await storage.initialize();
    log('Storage initialized successfully');

    // CORS configuration
    const corsOptions = {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    };

    // Middleware
    app.use(cors(corsOptions));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Authentication setup
    setupAuth(app);

    // Serve static files from the uploads directory
    const uploadsPath = path.join(process.cwd(), 'uploads');
    console.log('Serving uploads from:', uploadsPath);
    app.use('/uploads', express.static(uploadsPath));
    
    // Routes setup
    const server = await registerRoutes(app);

    // Global error handling middleware (must be last)
    app.use(errorHandler);

    // Periodic session cleanup (optional)
    setInterval(async () => {
      try {
        await storage.clearExpiredSessions();
      } catch (error) {
        console.error('Error during periodic session cleanup:', error);
      }
    }, 24 * 60 * 60 * 1000); // Run daily

    // Vite setup for development
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start the server
    server.listen(PORT, () => {
      const address = server.address();
      if (address && typeof address === "object") {
        log(`serving on http://localhost:${address.port}`);
        log(`Network access: http://${getLocalIPAddress()}:${address.port}`);
      } else {
        log(`serving on unknown port`);
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
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Run the server
startServer();
