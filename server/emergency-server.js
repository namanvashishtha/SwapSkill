// EMERGENCY PRODUCTION SERVER - MINIMAL WORKING VERSION
// This is a CommonJS version that should work immediately in production

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const { promisify } = require('util');

const app = express();
const PORT = process.env.PORT || 3000;
const scryptAsync = promisify(crypto.scrypt);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://user:System123@cluster0.bwfouog.mongodb.net/SkillSwap?retryWrites=true&w=majority';
let db = null;
let isConnected = false;

// Password comparison
async function comparePasswords(supplied, stored) {
  try {
    const [hashed, salt] = stored.split('.');
    const hashedBuf = Buffer.from(hashed, 'hex');
    const suppliedBuf = await scryptAsync(supplied, salt, 64);
    return crypto.timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
}

// Connect to MongoDB
async function connectDB() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });
    
    await client.connect();
    db = client.db();
    isConnected = true;
    console.log('✅ MongoDB connected');
    
    // Create test users if they don't exist
    const usersCollection = db.collection('users');
    
    const testUsers = [
      {
        username: 'dan',
        password: 'dan123',
        fullName: 'Dan Test User',
        email: 'dan@example.com',
        location: 'Test Location',
        skillsToTeach: ['Testing', 'Debugging'],
        skillsToLearn: ['Development', 'DevOps'],
      },
      {
        username: 'priya_sharma',
        password: 'password123',
        fullName: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        location: 'Mumbai, India',
        skillsToTeach: ['Yoga', 'Meditation'],
        skillsToLearn: ['Python', 'Web Development'],
      },
      {
        username: 'raj_patel',
        password: 'password123',
        fullName: 'Raj Patel',
        email: 'raj.patel@example.com',
        location: 'Bangalore, India',
        skillsToTeach: ['Guitar', 'Music Theory'],
        skillsToLearn: ['Digital Marketing', 'SEO'],
      }
    ];
    
    for (const testUser of testUsers) {
      const existingUser = await usersCollection.findOne({ username: testUser.username });
      
      if (!existingUser) {
        console.log(`👤 Creating test user "${testUser.username}"...`);
        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await scryptAsync(testUser.password, salt, 64);
        const passwordHash = `${hashedPassword.toString('hex')}.${salt}`;
        
        await usersCollection.insertOne({
          id: Date.now() + Math.random(), // Ensure unique IDs
          username: testUser.username,
          password: passwordHash,
          fullName: testUser.fullName,
          email: testUser.email,
          location: testUser.location,
          skillsToTeach: testUser.skillsToTeach,
          skillsToLearn: testUser.skillsToLearn,
          bio: '',
          imageUrl: null,
          createdAt: new Date()
        });
        
        console.log(`✅ Test user "${testUser.username}" created`);
      } else {
        console.log(`✅ Test user "${testUser.username}" exists`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    isConnected = false;
    return false;
  }
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS - allow all for emergency
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Session - minimal config
app.use(session({
  secret: process.env.SESSION_SECRET || 'emergency-secret-' + Date.now(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: false,
    httpOnly: true,
    sameSite: 'lax'
  },
  name: 'skillswap.sid'
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    console.log(`🔍 Auth attempt: ${username}`);
    
    if (!isConnected) {
      console.log('❌ Database not connected');
      return done(new Error('Database not connected'));
    }
    
    const user = await db.collection('users').findOne({ username });
    if (!user) {
      console.log(`❌ User not found: ${username}`);
      return done(null, false, { message: 'User not found' });
    }
    
    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      console.log(`❌ Invalid password: ${username}`);
      return done(null, false, { message: 'Invalid password' });
    }
    
    console.log(`✅ Auth success: ${username}`);
    return done(null, user);
  } catch (error) {
    console.error(`💥 Auth error for ${username}:`, error);
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    if (!isConnected) {
      return done(new Error('Database not connected'));
    }
    const user = await db.collection('users').findOne({ id });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Routes
app.get('/api/health', async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      mongodb: isConnected ? 'connected' : 'disconnected',
      users: 'unknown',
      availableTestUsers: []
    };
    
    if (isConnected) {
      try {
        const userCount = await db.collection('users').countDocuments();
        const testUsers = await db.collection('users').find(
          { username: { $in: ['dan', 'priya_sharma', 'raj_patel'] } }
        ).toArray();
        
        health.users = `${userCount} total users`;
        health.availableTestUsers = testUsers.map(u => ({
          username: u.username,
          fullName: u.fullName
        }));
      } catch (dbError) {
        health.users = 'error checking users';
      }
    }
    
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

app.post('/api/login', (req, res, next) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  
  console.log(`🔐 Login attempt: ${username}`);
  
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('💥 Auth error:', err);
      return res.status(500).json({
        message: 'Authentication error',
        error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
      });
    }
    
    if (!user) {
      console.log('❌ Login failed:', info?.message);
      return res.status(401).json({
        message: info?.message || 'Invalid credentials'
      });
    }
    
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('💥 Login error:', loginErr);
        return res.status(500).json({
          message: 'Login failed',
          error: process.env.NODE_ENV === 'production' ? 'Server error' : loginErr.message
        });
      }
      
      console.log(`✅ Login success: ${user.username}`);
      res.json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        location: user.location
      });
    });
  })(req, res, next);
});

app.post('/api/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('skillswap.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  res.json({
    id: req.user.id,
    username: req.user.username,
    fullName: req.user.fullName,
    email: req.user.email,
    location: req.user.location,
    skillsToTeach: req.user.skillsToTeach || [],
    skillsToLearn: req.user.skillsToLearn || [],
    bio: req.user.bio || '',
    imageUrl: req.user.imageUrl || null
  });
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password, fullName, email, location, skillsToTeach, skillsToLearn } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }
    
    console.log(`📝 Signup attempt: ${username}`);
    
    if (!isConnected) {
      return res.status(500).json({ message: 'Database not connected' });
    }
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser) {
      console.log(`❌ User already exists: ${username}`);
      return res.status(409).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await scryptAsync(password, salt, 64);
    const passwordHash = `${hashedPassword.toString('hex')}.${salt}`;
    
    // Create new user
    const newUser = {
      id: Date.now() + Math.random(), // Simple ID generation
      username,
      password: passwordHash,
      fullName: fullName || '',
      email: email || '',
      location: location || '',
      skillsToTeach: Array.isArray(skillsToTeach) ? skillsToTeach : [],
      skillsToLearn: Array.isArray(skillsToLearn) ? skillsToLearn : [],
      bio: '',
      imageUrl: null,
      createdAt: new Date()
    };
    
    await db.collection('users').insertOne(newUser);
    console.log(`✅ User created successfully: ${username}`);
    
    // Auto-login the new user
    req.login(newUser, (err) => {
      if (err) {
        console.error('💥 Auto-login failed:', err);
        // Return success but require manual login
        return res.status(201).json({ 
          message: 'User created successfully. Please login.',
          userId: newUser.id 
        });
      }
      
      console.log(`✅ Auto-login successful: ${username}`);
      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        location: newUser.location
      });
    });
    
  } catch (error) {
    console.error('💥 Signup error:', error);
    res.status(500).json({
      message: 'Signup failed',
      error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  res.status(500).json({
    message: 'Server error occurred',
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// Start server
async function startServer() {
  console.log('🚨 EMERGENCY SERVER STARTING...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', PORT);
  
  // Connect to database first
  const dbConnected = await connectDB();
  if (!dbConnected) {
    console.error('❌ Cannot start server without database');
    process.exit(1);
  }
  
  // Start HTTP server
  app.listen(PORT, () => {
    console.log(`🚀 Emergency server running on port ${PORT}`);
    console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Login: http://localhost:${PORT}/api/login`);
    console.log(`✅ Ready to handle requests!`);
  });
}

// Handle shutdown
process.on('SIGTERM', () => {
  console.log('👋 Shutting down emergency server...');
  process.exit(0);
});

// Start the emergency server
startServer().catch(error => {
  console.error('💥 Failed to start emergency server:', error);
  process.exit(1);
});