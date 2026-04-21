// contacts.js - исправленная форма с валидацией
const form = document.getElementById("contactForm");
const messageDiv = document.getElementById("formMessage");

if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const name = document.getElementById("contactName").value.trim();
        const email = document.getElementById("contactEmail").value.trim();
        const message = document.getElementById("contactMessage").value.trim();
        
        // Валидация
        if (!name || !email || !message) {
            messageDiv.innerHTML = "Пожалуйста, заполните все поля";
            messageDiv.className = "form-message error";
            return;
        }
        
        // Простая валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            messageDiv.innerHTML = "Пожалуйста, введите корректный email";
            messageDiv.className = "form-message error";
            return;
        }
        
        // Имитация отправки на сервер
        messageDiv.innerHTML = "Отправка...";
        messageDiv.className = "form-message";
        
        setTimeout(() => {
            messageDiv.innerHTML = "Спасибо! Мы свяжемся с вами в ближайшее время.";
            messageDiv.className = "form-message success";
            form.reset();
            
            // Очистить сообщение через 5 секунд
            setTimeout(() => {
                messageDiv.innerHTML = "";
                messageDiv.className = "form-message";
            }, 5000);
        }, 1000);
    });
}