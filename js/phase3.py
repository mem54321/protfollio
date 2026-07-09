import os
import re

project_dir = r"c:\Users\maram\new project"

# 1. Update style.css for product card hover effects and image zoom
css_path = os.path.join(project_dir, "css", "style.css")
with open(css_path, 'a', encoding='utf-8') as f:
    f.write('''
/* Phase 3 CSS Enhancements */
.product-card {
    box-shadow: 0 10px 20px rgba(0,0,0,0.08);
}
.product-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.15);
}
.product-img {
    transition: transform 0.5s ease;
}
.product-card:hover .product-img {
    transform: scale(1.08);
}
.product-image-container {
    overflow: hidden;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}

/* Product Gallery Zoom */
.main-image-container {
    overflow: hidden;
    position: relative;
    border-radius: 10px;
}
.main-image {
    transition: transform 0.3s ease;
    cursor: zoom-in;
}
.main-image:hover {
    transform: scale(1.5);
}

.btn-buy-now {
    background-color: #27ae60;
    color: white;
    border: none;
    height: 50px;
    padding: 0 40px;
    font-size: 1.2rem;
    border-radius: 5px;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}
.btn-buy-now:hover { background-color: #219653; transform: translateY(-2px); }

.btn-share {
    background-color: #f1f2f6;
    color: #333;
    border: none;
    height: 50px;
    padding: 0 20px;
    font-size: 1.2rem;
    border-radius: 5px;
    cursor: pointer;
    transition: var(--transition);
}
.btn-share:hover { background-color: #dfe4ea; transform: translateY(-2px); }
''')

# 2. Update main.js `generateProductCard` to add better badges and image wrapper
main_js_path = os.path.join(project_dir, "js", "main.js")
with open(main_js_path, 'r', encoding='utf-8') as f:
    main_js_content = f.read()

new_card_function = '''window.generateProductCard = (product) => {
    const wishlist = DB.getWishlist();
    const isFav = wishlist.includes(product.id);
    const finalPrice = product.discount > 0
        ? product.price - (product.price * (product.discount / 100))
        : product.price;

    let badges = '';
    if (product.discount > 0) badges += `<div style="background:#e74c3c; color:white; padding:4px 10px; border-radius:5px; margin-bottom:5px; font-size:0.8rem; font-weight:bold;">خصم ${product.discount}%</div>`;
    else badges += `<div style="background:#2ecc71; color:white; padding:4px 10px; border-radius:5px; margin-bottom:5px; font-size:0.8rem; font-weight:bold;">جديد</div>`;

    return `
        <div class="product-card">
            <div style="position:absolute; top:10px; right:10px; z-index:2; display:flex; flex-direction:column;">
                ${badges}
            </div>
            <div class="product-image-container">
                <a href="product.html?id=${product.id}">
                    <img src="${product.images[0]}" alt="${product.name}" class="product-img" style="width:100%; height:200px; object-fit:cover;">
                </a>
            </div>
            <div class="product-info" style="padding:15px;">
                <a href="product.html?id=${product.id}" style="text-decoration:none; color:inherit;"><h3 class="product-title" style="font-size:1rem; margin-bottom:5px; height: 45px; overflow: hidden;">${product.name}</h3></a>
                <div style="color: #f1c40f; font-size: 0.9rem; margin-bottom: 5px;"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i> <span style="color:#999">(24)</span></div>
                <div style="font-size: 0.8rem; color: #27ae60; margin-bottom: 10px;"><i class="fas fa-check-circle"></i> متوفر في المخزون</div>
                <div class="product-price" style="margin-bottom:15px; display:flex; align-items:center; gap:8px;">
                    <span style="color:var(--primary-color); font-weight:bold; font-size:1.2rem;">${finalPrice.toLocaleString()} ر.ي</span>
                    ${product.discount > 0 ? `<span style="text-decoration:line-through; color:#999; font-size:0.9rem;">${product.price.toLocaleString()}</span>` : ''}
                </div>
                <div class="product-actions" style="display:flex; gap:10px;">
                    <button class="btn-cart" onclick="addToCart('${product.id}')" style="flex:1; background:#333; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer; font-weight:bold;">
                        <i class="fas fa-cart-plus"></i> أضف للسلة
                    </button>
                    <button class="btn-fav ${isFav ? 'active' : ''}" onclick="toggleFavorite('${product.id}', this)" style="background:#f5f6fa; border:none; padding:10px; border-radius:5px; cursor:pointer; color:${isFav ? '#e74c3c' : '#333'}">
                        <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
};'''

main_js_content = re.sub(r'window\.generateProductCard = \(product\) => \{.*?\n\};', new_card_function, main_js_content, flags=re.DOTALL)
with open(main_js_path, 'w', encoding='utf-8') as f:
    f.write(main_js_content)


# 3. Update product.js
product_js_path = os.path.join(project_dir, "js", "product.js")
with open(product_js_path, 'r', encoding='utf-8') as f:
    product_js_content = f.read()

new_render_func = '''const renderProductDetail = (product) => {
    const wrapper = document.getElementById('productDetailWrapper');
    const finalPrice = product.discount > 0 ? product.price * (1 - (product.discount / 100)) : product.price;
    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));

    const imagesHtml = product.images.map((img, index) => `
        <img src="${img}" class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)" alt="صورة ${index + 1}">
    `).join('');

    // Fetch related products (same category)
    const allProducts = DB.getProducts();
    const relatedProducts = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    let relatedHtml = '';
    if(relatedProducts.length > 0) {
        relatedHtml = `
            <section class="products" style="background-color: #f9f9f9; padding: 40px 5%; margin-top: 50px;">
                <h2 class="section-title" style="margin-top:0;">منتجات مشابهة</h2>
                <div class="product-grid">
                    ${relatedProducts.map(generateProductCard).join('')}
                </div>
            </section>
        `;
    }

    wrapper.innerHTML = `
        <div class="product-detail-container">
            <div class="product-gallery">
                <div class="main-image-container" onmousemove="zoomImage(event, this)">
                    <img src="${product.images[0]}" id="mainProductImage" class="main-image" alt="${product.name}">
                </div>
                <div class="thumbnail-list" style="margin-top:15px; overflow-x:auto;">
                    ${imagesHtml}
                </div>
            </div>
            <div class="product-info-detail">
                <h1 class="product-title-detail">${product.name}</h1>
                <div class="product-rating-detail">${stars} <span style="color:#999; font-size:1rem;">(24 تقييم)</span> <span style="margin: 0 10px; color:#ddd;">|</span> <span style="color:#27ae60; font-size:1rem;"><i class="fas fa-box"></i> متوفر في المخزون (15 قطعة)</span></div>
                <div class="product-price-detail">
                    <span style="color: var(--primary-color);">${finalPrice.toLocaleString()} ر.ي</span>
                    ${product.discount > 0 ? `
                        <span class="product-old-price-detail">${product.price.toLocaleString()} ر.ي</span>
                        <span style="background: #e74c3c; color: white; padding: 4px 10px; border-radius: 5px; font-size: 1rem;">خصم ${product.discount}%</span>
                    ` : ''}
                </div>
                <div class="product-desc-detail">
                    ${product.description.replace(/\n/g, '<br>')}
                </div>
                
                <div class="add-to-cart-group" style="display:flex; flex-wrap:wrap;">
                    <input type="number" id="buyQty" class="quantity-input" value="1" min="1">
                    <button class="btn-add-cart-large" onclick="addToCart('${product.id}')">
                        <i class="fas fa-shopping-cart"></i> أضف للسلة
                    </button>
                    <button class="btn-buy-now" onclick="buyNow('${product.id}')">
                        <i class="fas fa-bolt"></i> شراء سريع
                    </button>
                    <button class="btn-share" onclick="shareProduct('${product.id}')" title="مشاركة">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p><strong>القسم:</strong> ${product.category}</p>
                    <p style="margin-top: 10px; color: #27ae60;"><i class="fas fa-truck"></i> توصيل وتركيب مجاني داخل صنعاء</p>
                    <p style="margin-top: 10px; color: #2980b9;"><i class="fas fa-shield-alt"></i> ضمان 10 سنوات</p>
                </div>
            </div>
        </div>
        ${relatedHtml}
    `;
};

window.zoomImage = (e, container) => {
    const img = container.querySelector('img');
    const x = e.clientX - e.target.offsetLeft;
    const y = e.clientY - e.target.offsetTop;
    img.style.transformOrigin = `${x}px ${y}px`;
};

window.buyNow = (id) => {
    addToCart(id);
    window.location.href = 'cart.html';
};

window.shareProduct = (id) => {
    const url = window.location.href;
    if (navigator.share) {
        navigator.share({
            title: 'رونق همدان للأثاث',
            url: url
        });
    } else {
        navigator.clipboard.writeText(url);
        alert('تم نسخ رابط المنتج بنجاح!');
    }
};
'''
product_js_content = re.sub(r'const renderProductDetail = \(product\) => \{.*?\n\};', new_render_func, product_js_content, flags=re.DOTALL)

with open(product_js_path, 'w', encoding='utf-8') as f:
    f.write(product_js_content)

print("Phase 3 executed.")
