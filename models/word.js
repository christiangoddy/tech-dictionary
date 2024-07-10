const pool = require('../config/database');

class Word {
    static async findAll() {
        try {
            const result = await pool.query('SELECT * FROM words');
            return result.rows;
        } catch (error) {
            console.error('Error in findAll:', error.message);
            throw error;
        }
    }
    
    static async create({ term, wordClass, meaning, pronunciation, history, example }) {
        const result = await pool.query(
            'INSERT INTO words (term, class, meaning, pronunciation, history, example) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [term, wordClass, meaning, pronunciation, history, example]
        );
        return result.rows[0];
    }

    static async update(id, updates) {
        const setString = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
        const values = [id, ...Object.values(updates)];
        const result = await pool.query(
            `UPDATE words SET ${setString}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            values
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM words WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}

module.exports = Word;
