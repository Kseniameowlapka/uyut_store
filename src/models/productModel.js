const pool = require('../config/db');

const getAllProducts = async () => {
    const [rows] = await pool.query('SELECT * FROM products');
    return rows;
};

const getProductById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
};

const createProduct = async (product) => {
    const { name, price, category, description, image_url, collection_id } = product;
    const [result] = await pool.query(
        'INSERT INTO products (name, price, category, description, image_url, collection_id) VALUES (?, ?, ?, ?, ?, ?)',
        [name, price, category, description, image_url, collection_id]
    );
    return result.insertId;
};

const updateProduct = async (id, product) => {
    const { name, price, category, description, image_url, collection_id } = product;
    const [result] = await pool.query(
        'UPDATE products SET name = ?, price = ?, category = ?, description = ?, image_url = ?, collection_id = ? WHERE id = ?',
        [name, price, category, description, image_url, collection_id, id]
    );
    return result.affectedRows;
};

const deleteProduct = async (id) => {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows;
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };