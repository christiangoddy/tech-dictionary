const Word = require('../models/word'); // Assuming you have a Word model
const UserRequest = require('../models/UserRequest'); // Assuming you have a Request model
const logSearch = require('../utils/logSearch');
const pool = require('../config/database');
const AdminNotificationService = require('../services/adminNotificationService'); // Adjust the path as needed

// Function to search for words and update search count
exports.searchWords = async (req, res) => {
    const { query } = req.query; // Assuming the query parameter is named 'query'
    const ipaddress = req.headers['x-forwarded-for'] || req.ip;

    
    
    try {
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        // Log the search
            await logSearch(query, ipaddress);

        // Query to search for words and select specific columns
        const searchResults = await pool.query(`
            SELECT DISTINCT ON (term) term, class, meaning, pronunciation, history, example, status
            FROM words
            WHERE LOWER(term) LIKE LOWER($1)
            ORDER BY term, added_at DESC
        `, [`%${query}%`]);

        if (searchResults.rows.length === 0) {
            // If not found, search in the user_request table
            const userRequestQuery = 'SELECT word, description FROM user_request WHERE LOWER(word) LIKE LOWER($1)';
            const userRequestResult = await pool.query(userRequestQuery, [`%${query}%`]);

            if (userRequestResult.rows.length > 0) {
                // Word found in the user_request table
                return res.status(200).json(userRequestResult.rows);
            }

            // No words found in both tables
            return res.status(404).json({ error: 'No words found matching the query' });
        }


        // Update search count for each matching word
        for (const word of searchResults.rows) {
            await pool.query('UPDATE words SET search_count = COALESCE(search_count, 0) + 1 WHERE term = $1', [word.term]);
        }

        res.status(200).json(searchResults.rows);
    } catch (error) {
        console.error('Error searching for words:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getRequestStatus = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM user_requests');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Function to get recently added words
exports.getRecentlyAddedWords = async (req, res) => {
    try {
        const recentlyAdded = await pool.query('SELECT * FROM words ORDER BY added_at DESC LIMIT 3');
        res.status(200).json(recentlyAdded.rows);
    } catch (error) {
        console.error('Error getting recently added words:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Function to get details of a specific word
exports.getWordDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT DISTINCT ON (term) term, class, meaning, pronunciation, history,example, status FROM words WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Word not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error getting word details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
// Request Change to Word
exports.requestChangeToWord = async (req, res) => {
    try {
        const { word, sectionToUpdate } = req.body;

        // Validate request
        if (!word || !sectionToUpdate) {
            return res.status(400).json({ error: 'Word and sectionToUpdate are required' });
        }

        // Insert user request into database
        const result = await UserRequest.create({
            word,
            description: `Update ${sectionToUpdate} for ${word}`,
            requested_by: 'Anonymous' // or any default value for requested_by
        });

        // Notify admins about the change request
        await AdminNotificationService.notifyChangeRequest(result);

        res.status(201).json(result);
    } catch (error) {
        console.error('Error submitting change request:', error);
        res.status(500).json({ error: 'Failed to submit change request' });
    }
};

// Request New Word
exports.requestNewWord = async (req, res) => {
    const { word, description, requested_by } = req.body;

    try {
        const requested_at = new Date(); // Current timestamp

        // Insert query with additional columns
        const query = `
            INSERT INTO user_request (word, description, requested_by, createdat, updatedat, status, approved)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`;
        
        const values = [word, description, requested_by, new Date(), new Date(), 'Pending', false];

        // Execute the query
        const result = await pool.query(query, values);

        // Notify admins/super admins about the new word request
        await AdminNotificationService.notifyNewWordRequest(word, description);

        // Respond with success message and inserted request
        res.status(201).json({ message: 'User request created successfully', request: result.rows[0] });
    } catch (error) {
        console.error('Error creating user request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Function to select and return a random word from the words table
exports.getWordOfTheDay = async (req, res) => {
    try {
        const result = await pool.query(`SELECT term, class, meaning, pronunciation, history, example, status FROM words ORDER BY RANDOM() LIMIT 1`);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Word of the day not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error getting word of the day:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Function to update the word of the day in memory
exports.updateWordOfTheDay = async () => {
    try {
        const result = await pool.query('SELECT * FROM words ORDER BY RANDOM() LIMIT 1');
        if (result.rows.length === 0) {
            console.error('No words found in the words table');
            return;
        }
        wordOfTheDay = result.rows[0]; // Store the word of the day in memory
        console.log('Word of the day updated:', wordOfTheDay);
    } catch (error) {
        console.error('Error updating word of the day:', error);
    }
};

// Function to get the top 3 most searched words
exports.getTopLookups = async (req, res) => {
    try {
        const result = await pool.query( 'SELECT term, class, meaning, pronunciation, history, example, status  FROM words ORDER BY search_count DESC LIMIT 3');
        const topLookups = result.rows;
        res.status(200).json(topLookups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

