require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const pool = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================

app.use(cors());
app.use(express.json());
app.use(helmet());

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Слишком много запросов, попробуйте позже' }
});
app.use('/api/', globalLimiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Слишком много попыток входа, попробуйте через 15 минут' }
});

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Нет токена' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Неверный токен' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Требуются права администратора' });
    }
    next();
};

// ==================== ТЕСТОВЫЕ МАРШРУТЫ ====================

app.get('/', (req, res) => {
    res.json({ message: 'Backend работает!' });
});

app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 AS test');
        res.json(rows);
    } catch (error) {
        console.error('Ошибка test-db:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ==================== АВТОРИЗАЦИЯ ====================

app.post('/api/auth/register', [
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен быть минимум 6 символов'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Роль может быть user или admin')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { email, password, role } = req.body;
        
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Пользователь уже существует' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.query(
            'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
            [email, hashedPassword, role || 'user']
        );
        
        res.status(201).json({ message: 'Пользователь создан', userId: result.insertId });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/auth/login', authLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { email, password } = req.body;
        
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Неверные учётные данные' });
        }
        
        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Неверные учётные данные' });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Ошибка логина:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ==================== ТОВАРЫ ====================

app.get('/api/products', async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products ORDER BY id DESC');
        res.json(products);
    } catch (error) {
        console.error('Ошибка GET /api/products:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (products.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        res.json(products[0]);
    } catch (error) {
        console.error('Ошибка GET /api/products/:id:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/products', authMiddleware, isAdmin, [
    body('name').notEmpty().withMessage('Название обязательно'),
    body('price').isNumeric().withMessage('Цена должна быть числом'),
    body('category').optional().isString()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { name, price, category, description, image_url, collection_id } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO products (name, price, category, description, image_url, collection_id) VALUES (?, ?, ?, ?, ?, ?)',
            [name, price, category || null, description || null, image_url || null, collection_id || null]
        );
        
        res.status(201).json({ message: 'Товар создан', id: result.insertId });
    } catch (error) {
        console.error('Ошибка POST /api/products:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ========== ИСПРАВЛЕННЫЙ PUT (не обнуляет поля) ==========
app.put('/api/products/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { name, price, category, description, image_url, collection_id } = req.body;
        
        // Получаем текущий товар
        const [current] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (current.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        
        // Обновляем только те поля, которые переданы
        const updatedName = name !== undefined ? name : current[0].name;
        const updatedPrice = price !== undefined ? price : current[0].price;
        const updatedCategory = category !== undefined ? category : current[0].category;
        const updatedDescription = description !== undefined ? description : current[0].description;
        const updatedImageUrl = image_url !== undefined ? image_url : current[0].image_url;
        const updatedCollectionId = collection_id !== undefined ? collection_id : current[0].collection_id;
        
        const [result] = await pool.query(
            'UPDATE products SET name = ?, price = ?, category = ?, description = ?, image_url = ?, collection_id = ? WHERE id = ?',
            [updatedName, updatedPrice, updatedCategory, updatedDescription, updatedImageUrl, updatedCollectionId, req.params.id]
        );
        
        res.json({ message: 'Товар обновлён' });
    } catch (error) {
        console.error('Ошибка PUT /api/products/:id:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/products/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        res.json({ message: 'Товар удалён' });
    } catch (error) {
        console.error('Ошибка DELETE /api/products/:id:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ==================== ПОИСК ТОВАРОВ ====================

app.get('/api/products/search/:query', async (req, res) => {
    try {
        const searchTerm = `%${req.params.query}%`;
        const [products] = await pool.query(
            'SELECT * FROM products WHERE name LIKE ? ORDER BY id DESC',
            [searchTerm]
        );
        res.json(products);
    } catch (error) {
        console.error('Ошибка поиска:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/products/search', async (req, res) => {
    try {
        const { q, category } = req.query;
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];
        if (q) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            const searchTerm = `%${q}%`;
            params.push(searchTerm, searchTerm);
        }
        if (category && category !== 'all') {
            query += ' AND category = ?';
            params.push(category);
        }
        query += ' ORDER BY id DESC';
        const [products] = await pool.query(query, params);
        res.json(products);
    } catch (error) {
        console.error('Ошибка расширенного поиска:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ==================== КОЛЛЕКЦИИ ====================

app.get('/api/collections', async (req, res) => {
    try {
        const [collections] = await pool.query('SELECT * FROM collections ORDER BY id DESC');
        res.json(collections);
    } catch (error) {
        console.error('Ошибка GET /api/collections:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/collections/:id', async (req, res) => {
    try {
        const [collections] = await pool.query('SELECT * FROM collections WHERE id = ?', [req.params.id]);
        if (collections.length === 0) {
            return res.status(404).json({ error: 'Коллекция не найдена' });
        }
        res.json(collections[0]);
    } catch (error) {
        console.error('Ошибка GET /api/collections/:id:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/collections/:id/products', async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products WHERE collection_id = ? ORDER BY id DESC', [req.params.id]);
        res.json(products);
    } catch (error) {
        console.error('Ошибка GET /api/collections/:id/products:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/collections', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { name, slug, description, cover_image } = req.body;
        if (!name || !slug) {
            return res.status(400).json({ error: 'Поля name и slug обязательны' });
        }
        const [result] = await pool.query(
            'INSERT INTO collections (name, slug, description, cover_image) VALUES (?, ?, ?, ?)',
            [name, slug, description || null, cover_image || null]
        );
        res.status(201).json({ message: 'Коллекция создана', id: result.insertId });
    } catch (error) {
        console.error('Ошибка POST /api/collections:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.put('/api/collections/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { name, slug, description, cover_image } = req.body;
        if (!name || !slug) {
            return res.status(400).json({ error: 'Поля name и slug обязательны' });
        }
        const [result] = await pool.query(
            'UPDATE collections SET name = ?, slug = ?, description = ?, cover_image = ? WHERE id = ?',
            [name, slug, description || null, cover_image || null, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Коллекция не найдена' });
        }
        res.json({ message: 'Коллекция обновлена' });
    } catch (error) {
        console.error('Ошибка PUT /api/collections/:id:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/collections/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        await pool.query('UPDATE products SET collection_id = NULL WHERE collection_id = ?', [req.params.id]);
        const [result] = await pool.query('DELETE FROM collections WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Коллекция не найдена' });
        }
        res.json({ message: 'Коллекция удалена' });
    } catch (error) {
        console.error('Ошибка DELETE /api/collections/:id:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ==================== СООБЩЕНИЯ ====================

app.post('/api/contacts', async (req, res) => {
    try {
        const { name, email, text } = req.body;
        if (!name || !email || !text) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }
        const [result] = await pool.query('INSERT INTO messages (name, email, text) VALUES (?, ?, ?)', [name, email, text]);
        res.status(201).json({ message: 'Сообщение отправлено', id: result.insertId });
    } catch (error) {
        console.error('Ошибка POST /api/contacts:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/messages', authMiddleware, isAdmin, async (req, res) => {
    try {
        const [messages] = await pool.query('SELECT * FROM messages ORDER BY id DESC');
        res.json(messages);
    } catch (error) {
        console.error('Ошибка GET /api/messages:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/messages/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const [messages] = await pool.query('SELECT * FROM messages WHERE id = ?', [req.params.id]);
        if (messages.length === 0) {
            return res.status(404).json({ error: 'Сообщение не найдено' });
        }
        res.json(messages[0]);
    } catch (error) {
        console.error('Ошибка GET /api/messages/:id:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/messages/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM messages WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Сообщение не найдено' });
        }
        res.json({ message: 'Сообщение удалено' });
    } catch (error) {
        console.error('Ошибка DELETE /api/messages/:id:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ==================== ЗАПУСК СЕРВЕРА ====================

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});