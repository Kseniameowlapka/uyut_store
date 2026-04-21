// collections.js - использует данные из data.js
const container = document.getElementById("collectionProducts");

function renderCollectionProducts() {
    if (!container) return;
    
    const zenProducts = window.getZenWoodProducts();
    container.innerHTML = '';
    
    zenProducts.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        
        let categoryText = "";
        if (product.category === "chair") categoryText = "Стул";
        else if (product.category === "table") categoryText = "Стол";
        else if (product.category === "sofa") categoryText = "Диван";
        
        card.innerHTML = `
            <img src="${product.image}" class="product-img" alt="${product.name}" loading="lazy">
            <div class="product-category">${categoryText}</div>
            <div class="product-title">${product.name}</div>
            <div class="product-price">${product.price}</div>
        `;
        container.appendChild(card);
    });
}

window.renderCollectionProducts = renderCollectionProducts;

renderCollectionProducts();