const bcrypt = require('bcryptjs');
const { db } = require('./models/database');

const seedDatabase = async () => {
  try {
    // Create a test user
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    db.run(
      'INSERT OR IGNORE INTO users (username, email, password, full_name, bio) VALUES (?, ?, ?, ?, ?)',
      ['testuser', 'test@example.com', hashedPassword, 'Test User', 'This is a test user for development'],
      function(err) {
        if (err) {
          console.error('Error creating test user:', err);
        } else {
          console.log('Test user created successfully');
          console.log('Login credentials:');
          console.log('Username: testuser');
          console.log('Password: 123456');
        }
      }
    );

    // Create another test user
    const hashedPassword2 = await bcrypt.hash('password', 10);
    
    db.run(
      'INSERT OR IGNORE INTO users (username, email, password, full_name, bio) VALUES (?, ?, ?, ?, ?)',
      ['admin', 'admin@diyari.com', hashedPassword2, 'Admin User', 'Administrator account'],
      function(err) {
        if (err) {
          console.error('Error creating admin user:', err);
        } else {
          console.log('Admin user created successfully');
          console.log('Login credentials:');
          console.log('Username: admin');
          console.log('Password: password');
        }
      }
    );

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Run seeding
seedDatabase();
