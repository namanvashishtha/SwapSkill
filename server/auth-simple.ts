// import passport from "passport";
// import { Strategy as LocalStrategy } from "passport-local";
// import { Express } from "express";
// import session from "express-session";
// import { scrypt, randomBytes, timingSafeEqual } from "crypto";
// import { promisify } from "util";
// import { storage } from "./storage.js";
// import { User as SelectUser } from "../shared/schema.js";
// import { z } from "zod";

// declare global {
//   namespace Express {
//     interface Request {
//       user?: SelectUser;
//     }
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

// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// // Authentication middleware
// function authenticateToken(req: any, res: any, next: any) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ message: 'Access token required' });
//   }

//   jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
//     if (err) {
//       return res.status(403).json({ message: 'Invalid or expired token' });
//     }

//     try {
//       const user = await storage.getUser(decoded.userId);
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }
//       req.user = user;
//       next();
//     } catch (error) {
//       console.error('Error fetching user:', error);
//       return res.status(500).json({ message: 'Internal server error' });
//     }
//   });
// }

// export function setupAuthSimple(app: Express) {
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

//       // Generate JWT token
//       const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

//       res.status(201).json({
//         token,
//         user: {
//           id: user.id,
//           username: user.username,
//           fullName: user.fullName,
//           email: user.email,
//           location: user.location,
//         }
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
//       const { username, password } = loginSchema.parse(req.body);
      
//       const user = await storage.getUserByUsername(username);
//       if (!user) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }
      
//       const isMatch = await comparePasswords(password, user.password);
//       if (!isMatch) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }
      
//       // Generate JWT token
//       const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
//       res.status(200).json({
//         token,
//         user: {
//           id: user.id,
//           username: user.username,
//           fullName: user.fullName,
//           email: user.email,
//           location: user.location,
//         }
//       });
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         return res.status(400).json({ errors: error.errors });
//       }
//       console.error("Login route error:", error);
//       next(error);
//     }
//   });

//   app.post("/api/logout", (req, res) => {
//     // With JWT, logout is handled client-side by removing the token
//     res.status(200).json({ message: "Logged out successfully" });
//   });

//   app.get("/api/user", authenticateToken, (req, res) => {
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
  
//   // File upload setup
//   const uploadDir = path.join(process.cwd(), "uploads");
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
//       if (file.mimetype.startsWith("image/")) {
//         cb(null, true);
//       } else {
//         cb(new Error("Only image files are allowed"));
//       }
//     },
//   });
  
//   app.post("/api/user/profile", authenticateToken, upload.single("image"), async (req, res) => {
//     try {
//       const userId = req.user?.id;
//       const bio = req.body.bio || '';
      
//       let imageUrl = req.user?.imageUrl || null;
//       if (req.file) {
//         imageUrl = `/uploads/${req.file.filename}`;
//       }
      
//       const success = await updateUserBioAndImage(userId, bio, imageUrl);
      
//       if (!success) {
//         return res.status(500).json({ message: "Failed to update profile" });
//       }
      
//       const updatedUser = await storage.getUser(userId);
//       if (!updatedUser) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
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

//   // Export the authentication middleware so it can be used in routes
//   return { authenticateToken };
// }