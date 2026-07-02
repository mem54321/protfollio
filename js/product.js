
const initProductPage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'shop.html';
        return;
    }

    const product = DB.getProduct(productId);

    if (!product) {
        document.getElementById('productDetailWrapper').innerHTML = '<div style="padding: 100px; text-align: center;"><h2>المنتج غير موجود</h2><a href="shop.html">العودة للمتجر</a></div>';
        return;
    }

    renderProductDetail(product);
};

const renderProductDetail = (product) => {
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
                    ${product.description.replace(/
/g, '<br>')}
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


window.changeMainImage = (src, thumb) => {
    document.getElementById('mainProductImage').src = src;
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
};

window.addToCart = (id) => {
    const qty = parseInt(document.getElementById('buyQty').value);
    DB.addToCart(id, qty);
    alert('تمت إضافة المنتج إلى السلة بنجاح!');
    // Update global cart count
    if (window.updateCartCount) window.updateCartCount();
};

document.addEventListener('DOMContentLoaded', initProductPage);
