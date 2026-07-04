
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
        <img src="${img}" loading="lazy" class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)" alt="صورة ${index + 1}">
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
                
                <div class="add-to-cart-group" style="display:flex; flex-wrap:wrap; gap: 10px;">
                    <input type="number" id="buyQty" class="quantity-input" value="1" min="1" style="width: 80px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                    <button class="btn-add-cart-large" onclick="addToCart('${product.id}', this)" style="flex:1; background:var(--dark-gray); color:white; border:none; padding:15px; border-radius:5px; cursor:pointer; font-weight:bold; font-size:1.1rem; transition: background 0.3s;">
                        <i class="fas fa-shopping-cart"></i> أضف للسلة
                    </button>
                    <button class="btn-buy-now" onclick="buyNow('${product.id}', this)" style="flex:1; background:var(--primary-color); color:white; border:none; padding:15px; border-radius:5px; cursor:pointer; font-weight:bold; font-size:1.1rem; transition: background 0.3s;">
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
                
                <!-- Information Tabs -->
                <div class="product-tabs" style="margin-top:40px;">
                    <div class="tab-headers" style="display:flex; border-bottom:2px solid #eee; margin-bottom:20px;">
                        <button class="tab-btn active" onclick="switchTab('desc', this)" style="padding:10px 15px; border:none; background:none; font-size:1.1rem; font-weight:bold; cursor:pointer; color:var(--primary-color); border-bottom:2px solid var(--primary-color); margin-bottom:-2px;">الوصف</button>
                        <button class="tab-btn" onclick="switchTab('specs', this)" style="padding:10px 15px; border:none; background:none; font-size:1.1rem; font-weight:bold; cursor:pointer; color:#888;">المواصفات والخامة</button>
                        <button class="tab-btn" onclick="switchTab('care', this)" style="padding:10px 15px; border:none; background:none; font-size:1.1rem; font-weight:bold; cursor:pointer; color:#888;">العناية</button>
                        <button class="tab-btn" onclick="switchTab('warranty', this)" style="padding:10px 15px; border:none; background:none; font-size:1.1rem; font-weight:bold; cursor:pointer; color:#888;">الضمان</button>
                    </div>
                    <div id="tab-desc" class="tab-content" style="display:block; animation: qvFadeIn 0.3s;">
                        <p style="line-height:1.8; color:#555;">${product.description.replace(/\n/g, '<br>')}</p>
                    </div>
                    <div id="tab-specs" class="tab-content" style="display:none; animation: qvFadeIn 0.3s;">
                        <ul style="line-height:1.8; color:#555; padding-right:20px;">
                            <li><strong>الخشب:</strong> خشب سويدي صلب مقاوم للرطوبة والانحناء.</li>
                            <li><strong>الإسفنج:</strong> كثافة عالية (الراجحي) لضمان عدم الهبوط.</li>
                            <li><strong>القماش:</strong> مخمل / كتان تركي فاخر ناعم الملمس.</li>
                        </ul>
                    </div>
                    <div id="tab-care" class="tab-content" style="display:none; animation: qvFadeIn 0.3s;">
                        <ul style="line-height:1.8; color:#555; padding-right:20px;">
                            <li>ينصح بالتنظيف الجاف أو باستخدام رغوة التنظيف المخصصة للمفروشات.</li>
                            <li>تجنب تعريض القماش لأشعة الشمس المباشرة لفترات طويلة.</li>
                        </ul>
                    </div>
                    <div id="tab-warranty" class="tab-content" style="display:none; animation: qvFadeIn 0.3s;">
                        <ul style="line-height:1.8; color:#555; padding-right:20px;">
                            <li><strong>الضمان:</strong> ضمان شامل لمدة 5-10 سنوات حسب نوع القطعة.</li>
                            <li><strong>التوصيل:</strong> توصيل مجاني وسريع لكافة مناطق العاصمة.</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>

        <!-- Complete Your Decor -->
        <section class="products" style="background-color: var(--white); padding: 40px 5%; margin-top: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 class="section-title" style="margin:0;">أكمل ديكورك بلمسة فاخرة ✨</h2>
                <button class="btn-secondary" style="font-size:0.9rem;">عرض الكل</button>
            </div>
            <div class="product-grid">
                ${allProducts.filter(p => p.id !== product.id).sort(() => 0.5 - Math.random()).slice(0, 4).map(generateProductCard).join('')}
            </div>
        </section>

        ${relatedHtml}
    `;
};

window.switchTab = (tabId, btn) => {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.style.color = '#888';
        el.style.borderBottom = 'none';
    });
    
    document.getElementById('tab-' + tabId).style.display = 'block';
    btn.style.color = 'var(--primary-color)';
    btn.style.borderBottom = '2px solid var(--primary-color)';
};

window.zoomImage = (e, container) => {
    const img = container.querySelector('img');
    const x = e.clientX - e.target.offsetLeft;
    const y = e.clientY - e.target.offsetTop;
    img.style.transformOrigin = `${x}px ${y}px`;
};

window.buyNow = (id, btnElement) => {
    addToCart(id, btnElement);
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 800); // Wait for animation
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
        showToast('تم نسخ رابط المنتج بنجاح!');
    }
};


window.changeMainImage = (src, thumb) => {
    document.getElementById('mainProductImage').src = src;
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
};

window.addToCart = (id, btnElement) => {
    const qty = parseInt(document.getElementById('buyQty').value);
    DB.addToCart(id, qty);
    showToast('تمت إضافة المنتج إلى السلة بنجاح!');
    
    if(btnElement) {
        const img = document.getElementById('mainProductImage');
        if(img && window.flyToCart) {
            window.flyToCart(img);
        }
    }

    // Update global cart count
    if (window.updateCartCount) window.updateCartCount();
};

document.addEventListener('DOMContentLoaded', initProductPage);
