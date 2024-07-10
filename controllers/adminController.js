const Admin = require('../models/admin');
const Word = require('../models/word');
const UserRequest = require('../models/UserRequest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/database');
// Log in to their own admin dashboard
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Fetch admin details from the database
        const query = 'SELECT * FROM admins WHERE email = $1';
        const { rows } = await pool.query(query, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials: No such Admin' });
        }

        const admin = rows[0];

        // Compare provided password with the hashed password in the database
        const validPassword = await bcrypt.compare(password, admin.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '2h' });

        res.status(200).json({ token, message: 'Login successful' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
// View their own admin dashboard
exports.getDashboard = async (req, res) => {
    try {
        const adminId = req.user.id;
        
        // Fetch admin details
        const adminResult = await pool.query('SELECT * FROM admins WHERE id = $1', [adminId]);
        const admin = adminResult.rows[0];

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        // Fetch word count
        const wordCountResult = await pool.query('SELECT COUNT(*) FROM words');
        const wordCount = wordCountResult.rows[0].count;

        // Fetch request count
        const requestCountResult = await pool.query('SELECT COUNT(*) FROM user_request');
        const requestCount = requestCountResult.rows[0].count;

        // Fetch recent requests
        const recentRequestsResult = await pool.query('SELECT * FROM user_request ORDER BY requested_at DESC LIMIT 5');
        const recentRequests = recentRequestsResult.rows;

        // Construct the dashboard data
        const dashboardData = {
            adminName: admin.name,
            wordCount: parseInt(wordCount, 10),
            requestCount: parseInt(requestCount, 10),
            recentRequests
        };

        res.json(dashboardData);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: error.message });
    }
};

// View and manage words in their own dashboard
exports.getWords = async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT ON (term) term,class,meaning,pronunciation,history,example,status FROM words');
      res.status(200).json(result.rows);
  } catch (error) {
      console.error('Error retreiving words:', error.message);res.status(500).json({error: 'Failed to retrieve words'});
  }
};

exports.addWord = async (req, res) => {
    const {
        term,
        class: wordClass,
        meaning,
        pronunciation,
        history,
        example,
        status = 'pending', // Default status can be 'pending'
        lookupTimes = 0,
        searchCount = 0
    } = req.body;
  
    const addedAt = req.body.addedAt || new Date();
    const updatedAt = new Date();
  
    try {
        const query = `
            INSERT INTO words (
                term, class, meaning, pronunciation, history, example, status, lookuptimes, search_count, added_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
            ) RETURNING *;
        `;
        const values = [term, wordClass, meaning, pronunciation, history, example, status, lookupTimes, searchCount, addedAt, updatedAt];
  
        const result = await pool.query(query, values);
        res.status(201).json({ message: 'Word added successfully', word: result.rows[0] });
    } catch (error) {
        console.error('Error adding or updating word:', error);
        res.status(500).json({ error: 'Failed to add or update word' });
    }
  };
exports.editWord = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const word = await Word.update(id, updates);
        if (word) {
            res.json(word);
        } else {
            res.status(404).json({ error: 'Word not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteWord = async (req, res) => {
    const { id } = req.params;
    try {
        const word = await Word.delete(id);
        if (word) {
            res.json({ message: 'Word deleted' });
        } else {
            res.status(404).json({ error: 'Word not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// View and manage user requests in their own dashboard
exports.getUserRequests = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM user_request');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching user requests:', error);
        res.status(500).json({ error: 'Error fetching user requests' });
    }
};
exports.updateRequestStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        // Check if the request status exists first
        const checkQuery = 'SELECT * FROM user_request WHERE id = $1;';
        const checkResult = await pool.query(checkQuery, [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Request status not found' });
        }

        // Update the request status
        const updateQuery = `
            UPDATE user_request
            SET status = $1, updatedat = NOW() 
            WHERE id = $2 
            RETURNING *;
        `;
        const updateResult = await pool.query(updateQuery, [status, id]);

        if (updateResult.rows.length > 0) {
            res.json(updateResult.rows[0]); // Return the updated request status
        } else {
            res.status(404).json({ error: 'Request status not found' });
        }
    } catch (error) {
        console.error('Error updating request status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// View their own account information
exports.getAccountInfo = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM admins');
     res.json(result.rows);
    } catch {
      res.status(404).json({ error: 'Admin not found' });
    }
  };
  