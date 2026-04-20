const pool = require('../config/db');

const findUserByEmail = async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

const createUser = async (email, passwordHash, role = 'user') => {
    const [result] = await pool.query(
        'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
        [email, passwordHash, role]
    );
    return result.insertId;
};

module.exports = { findUserByEmail, createUser };