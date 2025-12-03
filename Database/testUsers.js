import { connectDB } from './connection.js';
import { getAllUsers } from './queries/userQueries.js';

// Test script to verify users in database
const testUsers = async () => {
  try {
    console.log('🧪 Testing User Database Operations...\n');
    
    // Connect to database
    await connectDB();
    
    // Get all users
    const result = await getAllUsers();
    
    if (result.success) {
      console.log('✅ Users retrieved successfully!');
      console.log(`📊 Total users: ${result.count}\n`);
      
      result.users.forEach((user, index) => {
        console.log(`👤 User ${index + 1}:`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
        console.log(`   Updated: ${new Date(user.updatedAt).toLocaleString()}`);
        console.log('');
      });
    } else {
      console.log('❌ Failed to retrieve users:', result.message);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the test
testUsers();