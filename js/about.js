// about.js - исправленная анимация числовых счётчиков
const numbers = document.querySelectorAll(".number h3");

function animateNumber(element) {
    const target = parseInt(element.dataset.target);
    let current = 0;
    const increment = target / 50; // Плавное увеличение за 50 кадров
    let frame = 0;
    
    function updateNumber() {
        frame++;
        current += increment;
        
        if (frame < 50 && current < target) {
            element.innerText = Math.floor(current);
            requestAnimationFrame(updateNumber);
        } else {
            element.innerText = target;
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Запускаем анимацию когда элементы попадают в видимую область
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateNumber(entry.target);
            observer.unobserve(entry.target); // Анимируем только один раз
        }
    });
}, { threshold: 0.3 });

numbers.forEach(num => observer.observe(num));