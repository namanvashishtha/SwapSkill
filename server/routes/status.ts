import { Express } from 'express';
import mongoose from 'mongoose';

export function setupStatusRoutes(app: Express) {
  // MongoDB connection status endpoint
  app.get('/api/status/mongodb', (req, res) => {
    const status = {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    };
    
    res.json(status);
  });
}