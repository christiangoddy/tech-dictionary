const pool = require('../config/database');
const bcrypt = require('bcrypt');

class Admin {
    static async create({ name, email, password }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO admins (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, hashedPassword, 'Admin']
        );
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await pool.query('SELECT * FROM admins WHERE email = $1 AND role = $2', [email, 'Admin']);
        return result.rows[0];
    }

    static async authenticate(email, password) {
        const admin = await this.findByEmail(email);
        if (admin && await bcrypt.compare(password, admin.password)) {
            return admin;
        }
        return null;
    }

    // Other static methods for fetching Admins, updating, deleting, etc.
}

module.exports = Admin;
