const pool = require('../config/database');

const logSearch = async (term, ipaddress) => {
    try {
        console.log(`Logging search for term: ${term} from IP: ${ipaddress}`); // Debug log
        const query = `
            INSERT INTO lookups (term, createdat, ipaddress)
            VALUES ($1, CURRENT_TIMESTAMP, $2)
            RETURNING *`;
        const values = [term, ipaddress];
        const result = await pool.query(query, values);
        console.log('Search logged:', result.rows[0]); // Debug log
    } catch (error) {
        console.error('Error logging search:', error);
        throw error; // Throw the error to handle it in the calling function
    }
};

module.exports = logSearch;
