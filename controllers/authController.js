 //authController
 const Admin = require('../models/admin');
const SuperAdmin = require('../controllers/superAdminController');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const authRoutes = require('../routes/authRoutes');

// Login for admin and super admin
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user is a super admin
        let query = 'SELECT * FROM superadmins WHERE email = $1';
        let result = await pool.query(query, [email]);

        if (result.rowCount === 1) {
            // User found in superAdmin table, check password
            const superAdmin = result.rows[0];
            const isMatch = await bcrypt.compare(password, superAdmin.password);

            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate token for superAdmin
            const payload = {
                id: superAdmin.id,
                email: superAdmin.email,
                role: 'superAdmin'
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            return res.json({ token });
        }

        // Check if the user is an admin
        query = 'SELECT * FROM admins WHERE email = $1';
        result = await pool.query(query, [email]);

        if (result.rowCount === 1) {
            // User found in admin table, check password
            const admin = result.rows[0];
            const isMatch = await bcrypt.compare(password, admin.password);

            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate token for admin
            const payload = {
                id: admin.id,
                email: admin.email,
                role: 'admin'
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            return res.json({ token });
        }

        // If neither admin nor superAdmin found
        res.status(401).json({ error: 'Invalid credentials' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.logout = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Get token from authorization header
        
        // Insert the token into invalidated_tokens table
        const insertQuery = 'INSERT INTO invalidated_tokens (token, invalidated_at) VALUES ($1, NOW())';
        await pool.query(insertQuery, [token]);

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Failed to logout' });
    }
};

