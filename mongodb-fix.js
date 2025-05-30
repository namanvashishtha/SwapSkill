// MongoDB shell script to fix user documents
// Run this in MongoDB Atlas shell or mongosh

// Update all users to ensure they have bio and imageUrl fields
db.users.updateMany(
  {}, // Match all documents
  {
    $set: {
      bio: "", // Default empty string for bio
      imageUrl: null // Default null for imageUrl
    }
  },
  { upsert: false }
);

// Find all users to verify the update
db.users.find({}).forEach(user => {
  print(`User ${user.id} (${user.username}): bio=${user.bio}, imageUrl=${user.imageUrl}`);
});