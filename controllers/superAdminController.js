//superAdminController.js
const nodemailer = require('nodemailer');
const AdminNotificationService = require('../services/adminNotificationService');
require('dotenv').config();
const crypto = require('crypto');
const pool = require('../config/database');
const config = require('../config');
const Invitation = require('../models/invitation');
const { Pool } = require('pg');
const SuperAdmin = require('../models/superAdmin');
const Admin = require('../models/admin');
const Word = require('../models/word');
const Request = require('../models/UserRequest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Log in to the SuperAdmin dashboard
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login successful:', email, password); // Debugging
    const result = await pool.query('SELECT * FROM superadmins WHERE email = $1', [email]);
    const superAdmin = result.rows[0];
    if (!superAdmin) {
      console.log('Invalid credentials: No such superAdmin'); // Debugging
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, superAdmin.password);
    if (!isMatch) {
      console.log('Invalid credentials: Password does not match'); // Debugging
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: superAdmin.id, email: superAdmin.email }, process.env.JWT_SECRET, {
      expiresIn: '2h',
    });
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error); // Detailed error logging
    res.status(500).json({ message: 'Server error' });
  }
};

//view superAdmin dashboard
exports.getDashboard = async (req, res) => {
  try {
      const adminCountResult = await pool.query('SELECT COUNT(*) FROM admins');
      const wordCountResult = await pool.query('SELECT COUNT(*) FROM words');
      const requestCountResult = await pool.query('SELECT COUNT(*) FROM user_request');

      const adminCount = parseInt(adminCountResult.rows[0].count, 10);
      const wordCount = parseInt(wordCountResult.rows[0].count, 10);
      const requestCount = parseInt(requestCountResult.rows[0].count, 10);

      const dashboardData = {
          adminCount,
          wordCount,
          requestCount
      };

      res.status(200).json(dashboardData);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

// Get all admins
exports.getAdmins = async (req, res) => {
  try {
      const client = await pool.connect();

      // Query to get all admins
      const queryText = 'SELECT * FROM admins';

      const result = await client.query(queryText);
      const admins = result.rows;

      // Release the client back to the pool
      client.release();

      res.json(admins);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

// Delete an admin by ID
exports.deleteAdmin = async (req, res) => {
  const adminId = req.params.id;

  try {
      // Delete admin from the database
      const result = await pool.query('DELETE FROM admins WHERE id = $1 RETURNING *', [adminId]);

      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Admin not found' });
      }

      res.status(200).json({ message: 'Admin deleted successfully', admin: result.rows[0] });
  } catch (error) {
      console.error('Error deleting admin:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};
// Invite a new admin
// Generate a random token
const generateToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// Send invitation email
const sendInvitationEmail = async (recipientEmail, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.emailUser,
      pass: config.emailPass
    }
  });

  const inviteLink = `http://yourdomain.com/register-admin?token=${token}`;
  const mailOptions = {
    from: config.emailUser,
    to: recipientEmail,
    subject: 'Admin Invitation',
    html: `<h2>You have been invited to become an admin in our tech dictionary app.</h2>
           <p>Click <a href="${inviteLink}">here</a> to register.</p>`
  };

  await transporter.sendMail(mailOptions);
};

// Send invitation to become admin
exports.sendInvitation = async (req, res) => {
  const { email } = req.body;
  console.log('Email:', email)
  if (!email) {
    return res.status(400).send('Email is required');
  }
  const token = generateToken();
  const expires = new Date(Date.now() + 3600000); // 1 hour from now

  try {
    await Invitation.createInvitation(email, token, expires);
    console.log('Invitation created successfully');
  } catch (error) {
    console.error('Error creating invitation:', error);
    return res.status(500).send('Error creating invitation');
  }

  try {
    await sendInvitationEmail(email, token);
    res.status(200).send('Invitation sent successfully');
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).send('Error sending invitation');
  }
};

exports.registerAdmin = async (req, res) => {
  const { token, name, password } = req.body;

  try {
    const invitationResult = await pool.query('SELECT * FROM invitations WHERE token = $1', [token]);
    if (invitationResult.rows.length === 0) {
      return res.status(400).send('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const email = invitationResult.rows[0].email;

    const query = 'INSERT INTO admins (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [name, email, hashedPassword, 'admin'];
    await pool.query(query, values);

    await pool.query('DELETE FROM invitations WHERE id = $1', [invitationResult.rows[0].id]);
    res.status(200).send('Admin registered successfully');
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).send('Error registering admin');
  }
};
// View and manage analytics
exports.getAnalytics = async (req, res) => {
  try {
    const wordAnalyticsQuery = {
      text: `SELECT class, COUNT(*) as count
             FROM words
             GROUP BY class
             ORDER BY count DESC`,
    };

    const requestAnalyticsQuery = {
      text: `SELECT status, COUNT(*) as count
             FROM requests
             GROUP BY status`,
    };

    const wordAnalyticsResult = await pool.query(wordAnalyticsQuery);
    const requestAnalyticsResult = await pool.query(requestAnalyticsQuery);

    const analyticsData = {
      wordAnalytics: wordAnalyticsResult.rows,
      requestAnalytics: requestAnalyticsResult.rows,
    };

    res.status(200).json(analyticsData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Endpoint or function to handle approval of word request
exports.approveWordRequest = async (req, res) => {
  const { requestId } = req.params;
  const { approved, word, description } = req.body;

  try {
      if (approved) {
          // Check if the word already exists in the words table
          const wordExistsQuery = 'SELECT * FROM words WHERE term = $1';
          const existingWord = await pool.query(wordExistsQuery, [word]);

          if (existingWord.rows.length > 0) {
              // Word already exists, update its details
              const updateWordQuery = `
                  UPDATE words
                  SET
                      status = 'Active',  -- Adjust other fields as needed
                      added_at = CURRENT_TIMESTAMP
                  WHERE term = $1
                  RETURNING *`;
              await pool.query(updateWordQuery, [word]);
          } else {
              // Word does not exist, insert it into the words table
              const insertWordQuery = `
                  INSERT INTO words (term, class, meaning, pronunciation, history, example, status, lookUpTimes, added_at)
                  VALUES ($1, '', '', '', '', '', 'Active', 0, CURRENT_TIMESTAMP) RETURNING *`;
              await pool.query(insertWordQuery, [word]);
          }

          // Update user_request table with approval details
          const updateQuery = `
              UPDATE user_request
              SET
                  approved = $1,
                  word = $2,
                  description = $3,
                  approved_by = $4,
                  approved_at = CURRENT_TIMESTAMP,
                  status = 'Resolved'
              WHERE id = $5
              RETURNING *`;
          const result = await pool.query(updateQuery, [true, word, description, 'superadmin', requestId]);

          res.status(201).json({ message: 'Word request approved and saved', savedRequest: result.rows[0] });
      } else {
          // Delete request from user_request table if rejected
          await pool.query('DELETE FROM user_request WHERE id = $1', [requestId]);

          res.status(200).json({ message: 'Word request rejected' });
      }
  } catch (error) {
      console.error('Error approving word request:', error);
      if (error.code === '23505' && error.constraint === 'words_term_key') {
          // Handle duplicate key error (word already exists)
          res.status(400).json({ error: 'Word already exists in the dictionary' });
      } else {
          // Handle other errors
          res.status(500).json({ error: 'Internal server error' });
      }
  }
};

exports.updateWord = async (req, res) => {
  const { id } = req.params;
  const { term, wordClass, meaning, pronunciation, history, example } = req.body;
  try {
      const result = await pool.query(
          'UPDATE words SET term = $1, class = $2, meaning = $3, pronunciation = $4, history = $5, example = $6 WHERE id = $7 RETURNING *',
          [term, wordClass, meaning, pronunciation, history, example, id]
      );
      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Word not found' });
      }
      res.status(200).json(result.rows[0]);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};
// getwordbyid
exports.getWordById = async (req, res) => {
  const { id } = req.params;
  try {
      const result = await pool.query('SELECT DISTINCT ON (term) term,class,meaning,pronunciation,history,example,status FROM words WHERE id = $1', [id]);
      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Word not found' });
      }
      res.status(200).json(result.rows[0]);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};
 //add words
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
              term, class, meaning, pronunciation, history, example, status, lookuptimes, search_count, addedat, updated_at
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
// // View all words
// exports.getAllWords = async (req, res) => {
//   try {
//       const result = await pool.query('SELECT DISTINCT ON (term) term,class,meaning,pronunciation,history,example,status FROM words');
//       res.status(200).json(result.rows);
//   } catch (error) {
//       console.error('Error retreiving words:', error.message);res.status(500).json({error: 'Failed to retrieve words'});
//   }
// };
// View and manage all user requests
exports.getRequests = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM requests');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.deleteWord = async (req, res) => {
  const { id } = req.params;
  try {
      const result = await pool.query('DELETE FROM words WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Word not found' });
      }
      res.status(200).json({ message: 'Word deleted' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};


// View their own account information
exports.getAccountInfo = async (req, res) => {
  try {
      const result = await pool.query('SELECT * FROM superadmins');
   res.json(result.rows);
  } catch {
    res.status(404).json({ error: 'Admin not found' });
  }
};