const pool = require('../config/database');

class Notification {
    static async create({ message }) {
        try {
            const query = `
                INSERT INTO notifications (message)
                VALUES ($1)
                RETURNING *`;
            const values = [message];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error('Error creating notification: ' + error.message);
        }
    }

    static async getAll() {
        try {
            const query = 'SELECT * FROM notifications ORDER BY created_at DESC';
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error('Error fetching notifications: ' + error.message);
        }
    }

    static async markAsRead(id) {
        try {
            const query = `
                UPDATE notifications
                SET is_read = TRUE
                WHERE id = $1
                RETURNING *`;
            const values = [id];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error('Error marking notification as read: ' + error.message);
        }
    }
}

module.exports = Notification;
