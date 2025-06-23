// import passport from "passport";
// import { Strategy as LocalStrategy } from "passport-local";
// import { Express } from "express";
// import session from "express-session";
// import { scrypt, randomBytes, timingSafeEqual } from "crypto";
// import { promisify } from "util";
// import { storage } from "./storage.js";
// import { User as SelectUser } from "../shared/schema.js";
// import { z } from "zod";
// import MongoStore from "connect-mongo";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { updateUserBioAndImage } from "./db/mongodb.js";

// declare global {
//   namespace Express {
//     interface User extends SelectUser {}
//   }
// }

// const scryptAsync = promisify(scrypt);

// async function hashPassword(password: string) {
//   const salt = randomBytes(16).toString("hex");
//   const buf = (await scryptAsync(password, salt, 64)) as Buffer;
//   return `${buf.toString("hex")}.${salt}`;
// }

// async function comparePasswords(supplied: string, stored: string) {
//   const [hashed, salt] = stored.split(".");
//   const hashedBuf = Buffer.from(hashed, "hex");
//   const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
//   return timingSafeEqual(hashedBuf, suppliedBuf);
// }

// export function setupAuth(app: Express) {
//   // Production-ready session configuration with enhanced error handling
//   const sessionSettings: session.SessionOptions = {
//     secret: process.env.SESSION_SECRET || "swapskill-secret-key-fallback-" + Date.now(),
//     resave: false, // Don't save session if unmodified
//     saveUninitialized: false, // Don't create session until something is stored
//     store: storage.sessionStore,
//     genid: function(req) {
//       // Generate a unique session ID with timestamp and random string
//       const uniqueId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
//       return uniqueId;
//     },
//     cookie: {
//       maxAge: 1000 * 60 * 60 * 24, // 1 day
//       secure: process.env.NODE_ENV === 'production' && process.env.FORCE_HTTPS !== 'false',
//       httpOnly: true,
//       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production
//       path: '/' // Ensure cookie is available for all paths
//     },
//     name: 'skillswap.sid', // Custom name to avoid conflicts
//     rolling: false, // Don't reset cookie on each request to reduce database writes
//   };

//   // Trust proxy for production deployment (Render, Heroku, etc.)
//   if (process.env.NODE_ENV === 'production') {
//     app.set("trust proxy", 1);
//   }
  
//   // Add session middleware with error handling
//   app.use((req, res, next) => {
//     session(sessionSettings)(req, res, (err) => {
//       if (err) {
//         console.error('Session middleware error:', err);
//         // Continue without session if there's an error
//         next();
//       } else {
//         next();
//       }
//     });
//   });

//   app.use(passport.initialize());
//   app.use(passport.session());

//   passport.use(
//     new LocalStrategy(async (username, password, done) => {
//       try {
//         console.log(`Passport LocalStrategy: Attempting authentication for user: ${username}`);
        
//         const user = await storage.getUserByUsername(username);
//         if (!user) {
//           console.log(`Passport LocalStrategy: User not found: ${username}`);
//           return done(null, false, { message: "Incorrect username" });
//         }
        
//         console.log(`Passport LocalStrategy: User found: ${username}, checking password`);
//         const isMatch = await comparePasswords(password, user.password);
//         if (!isMatch) {
//           console.log(`Passport LocalStrategy: Password mismatch for user: ${username}`);
//           return done(null, false, { message: "Incorrect password" });
//         }
        
//         console.log(`Passport LocalStrategy: Authentication successful for user: ${username}`);
//         return done(null, user);
//       } catch (error) {
//         console.error(`Passport LocalStrategy: Error during authentication for user: ${username}`, error);
//         return done(error);
//       }
//     }),
//   );

//   passport.serializeUser((user: SelectUser, done) => {
//     // Ensure we're using a non-null, unique identifier
//     if (!user || !user.id) {
//       return done(new Error('Invalid user or missing ID'));
//     }
//     done(null, user.id);
//   });

//   passport.deserializeUser(async (id: number, done) => {
//     try {
//       // Only fetch user if not already cached in session to reduce database calls
//       const user = await storage.getUser(id);
//       if (!user) {
//         return done(new Error('User not found'));
//       }
//       // Ensure all required fields have default values
//       const completeUser = {
//         ...user,
//         skillsToTeach: user.skillsToTeach || [],
//         skillsToLearn: user.skillsToLearn || [],
//         bio: user.bio || '',
//         imageUrl: user.imageUrl || null
//       };
//       done(null, completeUser);
//     } catch (error) {
//       console.error("Error deserializing user:", error);
//       done(error);
//     }
//   });

//   // Login validation schema
//   const loginSchema = z.object({
//     username: z.string().min(1, "Username is required"),
//     password: z.string().min(1, "Password is required"),
//   });

//   // Registration validation schema
//   const registrationSchema = z.object({
//     username: z.string().min(3, "Username must be at least 3 characters"),
//     password: z.string().min(6, "Password must be at least 6 characters"),
//     fullName: z.string().min(1, "Full name is required"),
//     email: z.string().email("Invalid email address"),
//     location: z.string().min(1, "Location is required"),
//   });

//   app.post("/api/register", async (req, res, next) => {
//     try {
//       // Validate registration data
//       const validatedData = registrationSchema.parse(req.body);

//       // Check for existing user
//       const existingUser = await storage.getUserByUsername(validatedData.username);
//       if (existingUser) {
//         return res.status(409).json({ message: "Username already exists" });
//       }

//       // Create new user
//       const user = await storage.createUser({
//         ...validatedData,
//         password: await hashPassword(validatedData.password),
//         skillsToTeach: req.body.skillsToTeach || [],
//         skillsToLearn: req.body.skillsToLearn || [],
//       });

//       // Automatically log in the user after registration
//       req.login(user, (err) => {
//         if (err) {
//           return next(err);
//         }
//         res.status(201).json({
//           id: user.id,
//           username: user.username,
//           fullName: user.fullName,
//           email: user.email,
//           location: user.location,
//         });
//       });
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         return res.status(400).json({ errors: error.errors });
//       }
//       next(error);
//     }
//   });

//   app.post("/api/login", async (req, res, next) => {
//     try {
//       // Validate login request
//       const validatedData = loginSchema.parse(req.body);
//       console.log(`Login attempt for user: ${validatedData.username}`);
      
//       // Use a Promise wrapper for better error handling
//       const authenticateUser = () => {
//         return new Promise<SelectUser>((resolve, reject) => {
//           passport.authenticate("local", (err: Error, user: SelectUser, info: any) => {
//             if (err) {
//               console.error("Authentication error:", err);
//               return reject(err);
//             }
            
//             if (!user) {
//               console.log("Authentication failed:", info?.message || "Invalid credentials");
//               return reject(new Error(info?.message || "Authentication failed"));
//             }
            
//             resolve(user);
//           })(req, res, next);
//         });
//       };

//       try {
//         const user = await authenticateUser();
        
//         // Login the user with Promise wrapper
//         const loginUser = () => {
//           return new Promise<void>((resolve, reject) => {
//             req.login(user, (err) => {
//               if (err) {
//                 console.error("Login error:", err);
//                 return reject(err);
//               }
//               resolve();
//             });
//           });
//         };

//         await loginUser();
//         console.log(`User ${user.username} logged in successfully`);

//         // Try to save session with timeout and fallback
//         try {
//           if (req.session && req.session.save) {
//             await new Promise<void>((resolve, reject) => {
//               const timeout = setTimeout(() => {
//                 reject(new Error('Session save timeout'));
//               }, 5000);

//               req.session.save((err) => {
//                 clearTimeout(timeout);
//                 if (err) {
//                   console.error("Session save error:", err);
//                   reject(err);
//                 } else {
//                   resolve();
//                 }
//               });
//             });
//           }
//         } catch (sessionError) {
//           console.warn("Session save failed, continuing anyway:", sessionError);
//           // Continue even if session save fails - the login may still work
//         }
            
//         // Sanitize user object before sending
//         const sanitizedUser = {
//           id: user.id,
//           username: user.username,
//           fullName: user.fullName,
//           email: user.email,
//           location: user.location,
//         };
        
//         console.log("Login successful for user:", user.username, "Session ID:", req.sessionID);
//         return res.status(200).json(sanitizedUser);

//       } catch (authError) {
//         console.error("Authentication failed:", authError);
//         return res.status(401).json({ 
//           message: authError.message || "Authentication failed" 
//         });
//       }
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         return res.status(400).json({ errors: error.errors });
//       }
//       console.error("Login route error:", error);
//       next(error);
//     }
//   });

//   app.post("/api/logout", (req, res, next) => {
//     req.logout((err) => {
//       if (err) {
//         return next(err);
//       }
//       // Destroy the session completely
//       req.session.destroy((err) => {
//         if (err) {
//           return next(err);
//         }
//         res.clearCookie('skillswap.sid'); // Clear the session cookie
//         res.sendStatus(200);
//       });
//     });
//   });

//   app.get("/api/user", (req, res) => {
//     if (!req.isAuthenticated()) {
//       return res.status(401).json({ message: "Not authenticated" });
//     }
    
//     // Include all necessary user data including skills, bio and imageUrl
//     const sanitizedUser = {
//       id: req.user?.id,
//       username: req.user?.username,
//       fullName: req.user?.fullName,
//       email: req.user?.email,
//       location: req.user?.location,
//       skillsToTeach: req.user?.skillsToTeach || [],
//       skillsToLearn: req.user?.skillsToLearn || [],
//       bio: req.user?.bio || '',
//       imageUrl: req.user?.imageUrl || null,
//     };
    
//     res.json(sanitizedUser);
//   });
  
//   // Add profile update endpoint
  
//   const uploadDir = path.join(process.cwd(), "uploads");
//   // Ensure upload directory exists
//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//   }
  
//   const storage_config = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, uploadDir);
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       const ext = path.extname(file.originalname);
//       cb(null, file.fieldname + "-" + uniqueSuffix + ext);
//     },
//   });
  
//   const upload = multer({ 
//     storage: storage_config,
//     limits: {
//       fileSize: 5 * 1024 * 1024, // 5MB limit
//     },
//     fileFilter: function (req, file, cb) {
//       // Accept only images
//       if (file.mimetype.startsWith("image/")) {
//         cb(null, true);
//       } else {
//         cb(new Error("Only image files are allowed"));
//       }
//     },
//   });
  
//   app.post("/api/user/profile", upload.single("image"), async (req, res) => {
//     try {
//       if (!req.isAuthenticated()) {
//         return res.status(401).json({ message: "Not authenticated" });
//       }
      
//       const userId = req.user?.id;
//       const bio = req.body.bio || '';
      
//       // Get image URL if uploaded
//       let imageUrl = req.user?.imageUrl || null;
//       if (req.file) {
//         // Update to the new image URL (relative to the server)
//         imageUrl = `/uploads/${req.file.filename}`;
//       }
      
//       // Update user profile
//       const success = await updateUserBioAndImage(userId, bio, imageUrl);
      
//       if (!success) {
//         return res.status(500).json({ message: "Failed to update profile" });
//       }
      
//       // Get updated user to return
//       const updatedUser = await storage.getUser(userId);
//       if (!updatedUser) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       // Return updated user information
//       const sanitizedUser = {
//         id: updatedUser.id,
//         username: updatedUser.username,
//         fullName: updatedUser.fullName,
//         email: updatedUser.email,
//         location: updatedUser.location,
//         skillsToTeach: updatedUser.skillsToTeach || [],
//         skillsToLearn: updatedUser.skillsToLearn || [],
//         bio: updatedUser.bio || '',
//         imageUrl: updatedUser.imageUrl || null,
//       };
      
//       res.json(sanitizedUser);
//     } catch (error) {
//       console.error("Error updating user profile:", error);
//       res.status(500).json({ 
//         message: error instanceof Error ? error.message : "Error updating profile" 
//       });
//     }
//   });
// }
