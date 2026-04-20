const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const register = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Body отсутствует' });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email и пароль обязательны' });
        }

        const existingUser = await userModel.findUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await userModel.createUser(email, hashedPassword, 'user');

        res.status(201).json({
            message: 'Пользователь создан',
            userId
        });
    } catch (error) {
        console.error('Ошибка register:', error);
        res.status(500).json({
            error: error.message || 'Ошибка сервера'
        });
    }
};

const login = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Body отсутствует' });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email и пароль обязательны' });
        }

        const user = await userModel.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({ error: 'Неверные учётные данные' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Неверные учётные данные' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Ошибка login:', error);
        res.status(500).json({
            error: error.message || 'Ошибка сервера'
        });
    }
};

module.exports = { register, login };