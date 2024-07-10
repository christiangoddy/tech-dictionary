const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const {
  DB_USER,
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
} = process.env;

if (typeof DB_PASSWORD!== 'string') {
  throw new Error('Database password must be a string');
}

console.log('DB_USER:', DB_USER); // Debugging
console.log('DB_HOST:', DB_HOST); // Debugging
console.log('DB_NAME:', DB_NAME); // Debugging
console.log('DB_PASSWORD:', DB_PASSWORD? '******' : 'undefined'); // Debugging
console.log('DB_PORT:', DB_PORT); // Debugging

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
});


// Function to test the database connection
const testConnection = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Connected to the database successfully.');
  } catch (error) {
    console.error('Failed to connect to the database:', error.message);
  }
};

// Call the testConnection function
testConnection();

module.exports = pool;