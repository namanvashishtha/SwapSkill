import express from 'express';
import { UserModel } from '../db/mongodb.js';

export function setupAdminRoutes(app: express.Express) {
  // Route to fix all users in the database
  app.get('/api/admin/fix-all-users', async (req: express.Request, res: express.Response) => {
    try {
      console.log('Starting database fix operation...');
      
      // Find all users
      const users = await UserModel.find({});
      console.log(`Found ${users.length} users in the database`);
      
      // Track results
      const results = {
        total: users.length,
        updated: 0,
        errors: 0,
        details: [] as any[]
      };
      
      // Update each user
      for (const user of users) {
        try {
          // Check if the user has the bio and imageUrl fields
          const needsUpdate = !user.bio && user.bio !== '' || user.imageUrl === undefined;
          
          if (needsUpdate) {
            // Update the user
            const updateResult = await UserModel.updateOne(
              { _id: user._id },
              { 
                $set: { 
                  bio: user.bio || '',
                  imageUrl: user.imageUrl || null
                } 
              }
            );
            
            results.updated++;
            results.details.push({
              id: user.id,
              username: user.username,
              updated: true,
              fields: {
                bioAdded: !user.bio && user.bio !== '',
                imageUrlAdded: user.imageUrl === undefined
              }
            });
          } else {
            results.details.push({
              id: user.id,
              username: user.username,
              updated: false,
              reason: 'No update needed'
            });
          }
        } catch (userError) {
          console.error(`Error updating user ${user.id}:`, userError);
          results.errors++;
          results.details.push({
            id: user.id,
            username: user.username,
            error: userError instanceof Error ? userError.message : String(userError)
          });
        }
      }
      
      // Return the results
      res.json({
        success: true,
        results
      });
    } catch (error) {
      console.error('Error fixing users:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Route to check a specific user
  app.get('/api/admin/check-user/:id', async (req: express.Request, res: express.Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      
      // Find the user
      const user = await UserModel.findOne({ id: userId });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: `User with ID ${userId} not found`
        });
      }
      
      // Return the user details
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          fields: {
            bio: {
              exists: user.bio !== undefined,
              value: user.bio
            },
            imageUrl: {
              exists: user.imageUrl !== undefined,
              value: user.imageUrl
            }
          },
          allFields: Object.keys(user.toObject())
        }
      });
    } catch (error) {
      console.error('Error checking user:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Route to fix a specific user
  app.post('/api/admin/fix-user/:id', async (req: express.Request, res: express.Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const { bio, imageUrl } = req.body;
      
      // Find the user
      const user = await UserModel.findOne({ id: userId });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: `User with ID ${userId} not found`
        });
      }
      
      // Update the user
      const updateResult = await UserModel.updateOne(
        { id: userId },
        { 
          $set: { 
            bio: bio !== undefined ? bio : (user.bio || ''),
            imageUrl: imageUrl !== undefined ? imageUrl : (user.imageUrl || null)
          } 
        }
      );
      
      // Verify the update
      const updatedUser = await UserModel.findOne({ id: userId });
      
      // Return the results
      res.json({
        success: true,
        updateResult,
        user: {
          id: updatedUser?.id,
          username: updatedUser?.username,
          bio: updatedUser?.bio,
          imageUrl: updatedUser?.imageUrl,
          allFields: updatedUser ? Object.keys(updatedUser.toObject()) : []
        }
      });
    } catch (error) {
      console.error('Error fixing user:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
}