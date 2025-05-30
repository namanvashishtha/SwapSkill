// This file is kept for compatibility with existing code
// but is not used since we're using MongoDB instead of PostgreSQL

import { defineConfig } from "drizzle-kit";

// MongoDB connection is handled in server/db/mongodb.ts
// This configuration is not used for MongoDB

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  // MongoDB doesn't use Drizzle, so this configuration is just a placeholder
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "mongodb://placeholder",
  },
});
