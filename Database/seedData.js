import { connectDB } from './connection.js';
import { createUser } from './queries/userQueries.js';

// Sample user data to insert
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com', 
    password: 'password123'
  },
  {
    name: 'Bob Wilson',
    email: 'bob@example.com',
    password: 'password123'
  }
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Insert sample users
    console.log('👥 Creating sample users...');
    
    for (const userData of sampleUsers) {
      const result = await createUser(userData);
      
      if (result.success) {
        console.log(`✅ Created user: ${userData.name} (${userData.email})`);
      } else {
        console.log(`❌ Failed to create user ${userData.name}: ${result.message}`);
      }
    }
    
    console.log('🎉 Database seeding completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding
seedDatabase();