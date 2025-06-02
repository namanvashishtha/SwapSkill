// Test script to verify user creation works correctly
import { MongoStorage } from './server/storage.js';

async function testUserCreation() {
  console.log('Testing user creation...');
  
  const storage = new MongoStorage();
  
  try {
    // Initialize storage
    await storage.initialize();
    
    // Create a test user
    const testUser = {
      username: 'testuser_' + Date.now(),
      password: 'hashedpassword123',
      fullName: 'Test User',
      email: 'test@example.com',
      location: 'Test City',
      skillsToTeach: ['Testing'],
      skillsToLearn: ['Development']
    };
    
    console.log('Creating test user:', testUser.username);
    const createdUser = await storage.createUser(testUser);
    
    console.log('Created user with ID:', createdUser.id);
    console.log('User details:', {
      id: createdUser.id,
      username: createdUser.username,
      fullName: createdUser.fullName,
      email: createdUser.email,
      location: createdUser.location,
      bio: createdUser.bio,
      imageUrl: createdUser.imageUrl
    });
    
    // Verify we can retrieve the user
    const retrievedUser = await storage.getUser(createdUser.id);
    if (retrievedUser) {
      console.log('Successfully retrieved user:', retrievedUser.username);
      
      // Check if the data matches
      if (retrievedUser.username === testUser.username && 
          retrievedUser.fullName === testUser.fullName) {
        console.log('✅ User creation and retrieval test PASSED');
      } else {
        console.log('❌ User data mismatch detected');
        console.log('Expected:', testUser.username, testUser.fullName);
        console.log('Got:', retrievedUser.username, retrievedUser.fullName);
      }
    } else {
      console.log('❌ Failed to retrieve created user');
    }
    
    // Show all users in memory
    const allUsers = Array.from(storage.memStorage.users.values());
    console.log('\nAll users in memory storage:');
    allUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Name: ${user.fullName}`);
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUserCreation().catch(console.error);