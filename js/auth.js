// auth.js - система авторизации

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

class Auth {
    static isLoggedIn() {
        return localStorage.getItem('adminLoggedIn') === 'true';
    }
    
    static login(username, password) {
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            localStorage.setItem('adminLoggedIn', 'true');
            return true;
        }
        return false;
    }
    
    static logout() {
        localStorage.removeItem('adminLoggedIn');
        // Обновляем страницу, чтобы скрыть админ-элементы
        window.location.reload();
    }
    
    static checkAndShowAdminUI() {
        const isAdmin = this.isLoggedIn();
        
        // Показываем/скрываем кнопку добавления
        const addBtn = document.getElementById('addProductBtn');
        if (addBtn) {
            addBtn.style.display = isAdmin ? 'flex' : 'none';
        }
        
        // Показываем/скрываем админ-панель в хедере
        const adminPanel = document.getElementById('adminHeaderPanel');
        if (adminPanel) {
            adminPanel.style.display = isAdmin ? 'flex' : 'none';
        }
        
        return isAdmin;
    }
}