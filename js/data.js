// data.js - Единый источник данных для всего сайта

// Базовые товары
const defaultProducts = [
    {
        id: 1,
        name: "Стул Hikari",
        price: "12 900 ₽",
        category: "chair",
        image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=1170&auto=format&fit=crop",
        collection: "zenwood"
    },
    {
        id: 2,
        name: "Стол Mori",
        price: "34 500 ₽",
        category: "table",
        image: "https://images.unsplash.com/photo-1676088933950-bae87cf34fee?q=80&w=765&auto=format&fit=crop",
        collection: "zenwood"
    },
    {
        id: 3,
        name: "Диван Zen",
        price: "72 000 ₽",
        category: "sofa",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1170&auto=format&fit=crop",
        collection: "zenwood"
    },
    {
        id: 4,
        name: "Стул Zen Ash",
        price: "10 500 ₽",
        category: "chair",
        image: "https://plus.unsplash.com/premium_photo-1705169612261-2cf0407141c3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        collection: "zenwood"
    },
    {
        id: 5,
        name: "Стол Kyoto",
        price: "39 000 ₽",
        category: "table",
        image: "https://images.unsplash.com/photo-1749476101600-90b2eb7efa89?q=80&w=687&auto=format&fit=crop",
        collection: "zenwood"
    },
    {
        id: 6,
        name: "Диван Minimal",
        price: "89 000 ₽",
        category: "sofa",
        image: "https://images.unsplash.com/photo-1698936061086-2bf99c7b9fc5?q=80&w=1074&auto=format&fit=crop",
        collection: "zenwood"
    },
    {
        id: 7,
        name: "Стул Ash Minimal",
        price: "11 200 ₽",
        category: "chair",
        image: "https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=1170&auto=format&fit=crop",
        collection: "zenwood"
    }
];

// Загрузка товаров из localStorage или использование стандартных
function loadProducts() {
    const saved = localStorage.getItem('uyut_products');
    if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
            return parsed;
        }
    }
    return [...defaultProducts];
}

// Сохранение товаров в localStorage
function saveProducts(products) {
    localStorage.setItem('uyut_products', JSON.stringify(products));
}

// Глобальный массив товаров
let productsData = loadProducts();

// Функция для получения товаров коллекции Zen Wood
function getZenWoodProducts() {
    const zenWoodIds = [4, 5, 6, 7];
    return productsData.filter(p => zenWoodIds.includes(p.id));
}

// Функция добавления товара
function addProduct(product) {
    const newId = Math.max(...productsData.map(p => p.id), 0) + 1;
    const newProduct = {
        id: newId,
        name: product.name,
        price: product.price,
        category: product.category,
        image: product.image || 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=1170&auto=format&fit=crop',
        collection: 'zenwood'
    };
    
    productsData.push(newProduct);
    saveProducts(productsData);
    
    // Обновляем отображение если есть функция рендера
    if (typeof window.renderProducts === 'function') {
        window.renderProducts();
    }
    if (typeof window.renderCollectionProducts === 'function') {
        window.renderCollectionProducts();
    }
    
    return newProduct;
}

// Функция удаления товара (в data.js)
function deleteProduct(productId) {
    console.log('Удаление товара с ID:', productId);
    console.log('Текущие товары:', productsData.map(p => p.id));
    
    const index = productsData.findIndex(p => p.id === productId);
    if (index !== -1) {
        productsData.splice(index, 1);
        saveProducts(productsData);
        
        console.log('Товар удален. Осталось:', productsData.length);
        
        // Обновляем отображение если есть функция рендера
        if (typeof window.renderProducts === 'function') {
            window.renderProducts();
        }
        if (typeof window.renderCollectionProducts === 'function') {
            window.renderCollectionProducts();
        }
        return true;
    }
    console.log('Товар с ID', productId, 'не найден');
    return false;
}



// Экспортируем в глобальную область
window.productsData = productsData;
window.getZenWoodProducts = getZenWoodProducts;
window.addProduct = addProduct;
window.deleteProduct = deleteProduct;
window.saveProducts = saveProducts;