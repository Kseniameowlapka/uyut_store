// catalog.js - каталог с поддержкой админ-функций

const container = document.getElementById("products");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("searchInput");

let currentCategory = "all";
let currentSearch = "";

// Рендер товаров
function renderProducts() {
    if (!container) return;
    
    let filtered = [...window.productsData];
    
    // Фильтрация по категории
    if (currentCategory !== "all") {
        filtered = filtered.filter(p => p.category === currentCategory);
    }
    
    // Фильтрация по поиску
    if (currentSearch.trim() !== "") {
        const searchTerm = currentSearch.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));
    }
    
    container.innerHTML = "";
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="no-products">Ничего не найдено</div>';
        return;
    }
    
    const isAdmin = Auth && Auth.isLoggedIn();
    
    filtered.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.setAttribute("data-product-id", product.id);
        
        let categoryText = "";
        if (product.category === "chair") categoryText = "Стул";
        else if (product.category === "table") categoryText = "Стол";
        else if (product.category === "sofa") categoryText = "Диван";
        
        card.innerHTML = `
            <img src="${product.image}" class="product-img" alt="${product.name}" loading="lazy">
            <div class="product-category">${categoryText}</div>
            <div class="product-title">${product.name}</div>
            <div class="product-price">${product.price}</div>
            ${isAdmin ? `<button class="delete-product-btn" data-id="${product.id}" title="Удалить"><i class="fas fa-trash"></i></button>` : ''}
        `;
        container.appendChild(card);
    });
    
    // Добавляем обработчики для кнопок удаления (если админ)
    if (isAdmin) {
        document.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                if (confirm('Удалить этот товар?')) {
                    window.deleteProduct(id);
                }
            });
        });
    }
}

// ========== НОВЫЙ КОД: обработка фильтров ==========
function initFilters() {
    if (!filterButtons.length) return;
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Обновляем активный класс
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Обновляем текущую категорию
            currentCategory = btn.dataset.category;
            
            // Перерисовываем товары
            renderProducts();
        });
    });
}

// ========== НОВЫЙ КОД: обработка поиска ==========
function initSearch() {
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        renderProducts();
    });
}
// ========== КОНЕЦ НОВОГО КОДА ==========

// Экспортируем функцию для обновления из админки
window.renderProducts = renderProducts;

// Инициализация админ-функций
function initAdminFeatures() {
    const isAdmin = Auth.isLoggedIn();
    
    // Кнопка добавления товара
    const addBtn = document.getElementById('addProductBtn');
    const modal = document.getElementById('addProductModal');
    const closeModal = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const saveBtn = document.getElementById('saveProductBtn');
    
    if (addBtn && modal) {
        addBtn.onclick = () => {
            modal.classList.add('active');
        };
        
        const closeModalFunc = () => modal.classList.remove('active');
        if (closeModal) closeModal.onclick = closeModalFunc;
        if (cancelBtn) cancelBtn.onclick = closeModalFunc;
        
        modal.onclick = (e) => {
            if (e.target === modal) closeModalFunc();
        };
        
        if (saveBtn) {
            saveBtn.onclick = () => {
                const name = document.getElementById('productName').value.trim();
                const price = document.getElementById('productPrice').value.trim();
                const category = document.getElementById('productCategory').value;
                let image = document.getElementById('productImage').value.trim();
                
                if (!name || !price) {
                    alert('Заполните название и цену');
                    return;
                }
                
                if (!image) {
                    image = 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=1170&auto=format&fit=crop';
                }
                
                window.addProduct({ name, price, category, image });
                
                document.getElementById('productName').value = '';
                document.getElementById('productPrice').value = '';
                document.getElementById('productCategory').value = 'chair';
                document.getElementById('productImage').value = '';
                
                modal.classList.remove('active');
            };
        }
    }
    
    // Выход из админки
    const logoutBtn = document.getElementById('logoutBtnHeader');
    if (logoutBtn) {
        logoutBtn.onclick = () => Auth.logout();
    }
}

// Инициализация модального окна входа
function initLoginModal() {
    const showBtn = document.getElementById('showAdminLoginBtn');
    const modal = document.getElementById('adminLoginModal');
    const closeBtn = document.getElementById('closeLoginModalBtn');
    const cancelBtn = document.getElementById('cancelLoginBtn');
    const submitBtn = document.getElementById('submitLoginBtn');
    const loginError = document.getElementById('loginError');
    
    if (!showBtn || !modal) return;
    
    showBtn.onclick = (e) => {
        e.preventDefault();
        modal.classList.add('active');
    };
    
    const closeModal = () => {
        modal.classList.remove('active');
        if (loginError) loginError.textContent = '';
        const usernameInput = document.getElementById('loginUsername');
        const passwordInput = document.getElementById('loginPassword');
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
    };
    
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
    
    const handleLogin = () => {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        if (Auth.login(username, password)) {
            closeModal();
            Auth.checkAndShowAdminUI();
            initAdminFeatures();
            renderProducts();
        } else {
            if (loginError) loginError.textContent = 'Неверный логин или пароль';
        }
    };
    
    if (submitBtn) submitBtn.onclick = handleLogin;
    
    const passwordInput = document.getElementById('loginPassword');
    if (passwordInput) {
        passwordInput.onkeypress = (e) => {
            if (e.key === 'Enter') handleLogin();
        };
    }
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    Auth.checkAndShowAdminUI();
    initLoginModal();
    initAdminFeatures();
    initFilters();      // <-- ДОБАВЛЕНО
    initSearch();       // <-- ДОБАВЛЕНО
    renderProducts();
});

// Добавляем стили для кнопки удаления
const style = document.createElement('style');
style.textContent = `
    .product-card {
        position: relative;
    }
    .delete-product-btn {
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(198, 40, 40, 0.9);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        z-index: 10;
    }
    .product-card:hover .delete-product-btn {
        opacity: 1;
    }
    .delete-product-btn:hover {
        background: #c62828;
        transform: scale(1.05);
    }
`;
document.head.appendChild(style);