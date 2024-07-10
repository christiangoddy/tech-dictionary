const pool = require('../config/database'); // Adjust path as per your project structure

class UserRequest {
    static async create({ word, description, requested_by }) {
        try {
            const requested_at = new Date(); // Automatically set to current timestamp
            const query = `
                INSERT INTO user_request (word, description, requested_by, requested_at, createdat, updatedat, status, approved)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *`;
            const values = [word, description, requested_by, new Date(), new Date(), new Date(), 'pending', false]; // 'approved' initially set to false
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error('Error creating user request: ' + error.message);
        }
    }

    static async getAll() {
        try {
            const query = 'SELECT * FROM user_request';
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error('Error fetching user requests: ' + error.message);
        }
    }

    static async approveRequest(requestId, approvedBy) {
        try {
            const approvedAt = new Date(); // Timestamp when the request is approved
            const query = `
                UPDATE user_request
                SET approved = true, approved_by = $1, approved_at = $2
                WHERE id = $3
                RETURNING *`;
            const values = [approvedBy, approvedAt, requestId];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error('Error approving user request: ' + error.message);
        }
    }

    static async deleteRequest(requestId) {
        try {
            const query = `
                DELETE FROM user_request
                WHERE id = $1`;
            const values = [requestId];
            await pool.query(query, values);
            return true; // Deleted successfully
        } catch (error) {
            throw new Error('Error deleting user request: ' + error.message);
        }
    }
}

module.exports = UserRequest;
