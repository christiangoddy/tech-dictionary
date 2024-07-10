const pool = require('./config/database'); // Adjust the path as necessary
const bcrypt = require('bcrypt');

const superAdmin = {
  name: 'SuperAdmin',
  email: 'conclase@gmail.com', // Replace with the actual superAdmin email
  password: 'conclaseng', // Replace with the actual superAdmin password
};

async function seedSuperAdmin() {
  try {
    const hashedPassword = await bcrypt.hash(superAdmin.password, 10);

    const result = await pool.query(
      'INSERT INTO superadmins (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [superAdmin.name, superAdmin.email, hashedPassword]
    );

    console.log('SuperAdmin seeded:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding superAdmin:', error);
    process.exit(1);
  }
}

seedSuperAdmin();
