const productModel = require('../models/productModel');

const getAllProducts = async (req, res) => {
    try {
        const products = await productModel.getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await productModel.getProductById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Товар не найден' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const productId = await productModel.createProduct(req.body);
        res.status(201).json({ message: 'Товар создан', id: productId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const updated = await productModel.updateProduct(req.params.id, req.body);
        if (!updated) return res.status(404).json({ error: 'Товар не найден' });
        res.json({ message: 'Товар обновлён' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const deleted = await productModel.deleteProduct(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Товар не найден' });
        res.json({ message: 'Товар удалён' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };