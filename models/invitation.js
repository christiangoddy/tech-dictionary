const  pool  = require('../config/database');


const createInvitation = async (email, token, expires) => {
    const query = 'INSERT INTO invitations (email, token, expires) VALUES ($1, $2, $3) RETURNING *';
    const values = [email, token, expires];
  
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating invitation:', error.message);
      throw error;
    }
  };
  

const findInvitationByToken = async (token) => {
    const query = 'SELECT * FROM invitations WHERE token = $1 AND expires > NOW()';
    const values = [token];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteInvitation = async (id) => {
    const query = 'DELETE FROM invitations WHERE id = $1';
    const values = [id];
    await pool.query(query, values);
};

module.exports = {
    createInvitation,
    findInvitationByToken,
    deleteInvitation
};