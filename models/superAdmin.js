const pool = require('../config/database');
const bcrypt = require('bcrypt');

class SuperAdmin {
    static async create({ name, email, password }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO superadmins (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, hashedPassword, 'SuperAdmin']
        );
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await pool.query('SELECT * FROM superadmins WHERE email = $1 AND role = $2', [email, 'SuperAdmin']);
        return result.rows[0];
    }

    static async authenticate(email, password) {
        const superAdmin = await this.findByEmail(email);
        if (superAdmin && await bcrypt.compare(password, superAdmin.password)) {
            return superAdmin;
        }
        return null;
    }

    // Other static methods for fetching SuperAdmins, updating, deleting, etc.
}

module.exports = SuperAdmin;
