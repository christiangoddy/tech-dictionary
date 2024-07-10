// authmiddleware
const jwt = require('jsonwebtoken');
const pool = require('../config/database'); // Assuming you manage your database connection here
const { JWT_SECRET } = process.env;

// Middleware to verify token
const verifyToken = async (req, res, next) => {
    // Get the token from the request headers
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({ error: 'Token is missing' });
    }

    const token = authorization.split(' ')[1];

    try {
          // Check if the token is invalidated
        const result = await pool.query('SELECT * FROM invalidated_tokens WHERE token = $1', [token]);
        if (result.rows.length > 0) {
            return res.status(401).json({ error: 'Token has been invalidated' });
        }


        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach decoded user information to the request object
        next(); // Proceed to the next middleware
    } catch (error) {
        console.error('Token verification error:', error); // Log the error for debugging
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// // Middleware to check if the user is an admin
// const isAdmin = (req, res, next) => {
//     if (!req.user || req.user.role !== 'admin') {
//         return res.status(403).json({ error: 'Require Admin Role' });
//     }
//     next();
// };

// // Middleware to check if the user is a superadmin
// const isSuperAdmin = (req, res, next) => {
//     if (!req.user || req.user.role !== 'superadmin') {
//         return res.status(403).json({ error: 'Require SuperAdmin Role' });
//     }
//     next();
// };
// Check if user is Admin or SuperAdmin
const isAdminOrSuperadmin = async (req, res, next) => {
    const userId = req.user.id;
    const result = await pool.query('SELECT role FROM superadmins WHERE id = $1', [userId]);
    const user = result.rows[0];
    if (user.role === 'admin' || user.role === 'superadmin') {
        next();
    } else {
        res.status(403).send('Unauthorized');
    }
};

module.exports = { verifyToken, isAdminOrSuperadmin };