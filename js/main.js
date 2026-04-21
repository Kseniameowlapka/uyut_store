document.addEventListener("DOMContentLoaded", () => {
    const elements = document.querySelectorAll("h1, p, .btn, .chair");
    elements.forEach((el, i) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        setTimeout(() => {
            el.style.transition = "all 0.8s cubic-bezier(0.2, 0.9, 0.4, 1.1)";
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
        }, i * 150);
    });
});