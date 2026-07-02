
// Global variables & Utilities
window.toggleMenu = () => {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
};

window.formatPrice = (price) => {
    return new Intl.NumberFormat('ar-YE', { style: 'currency', currency: 'YER' }).format(price);
};

window.updateCartCount = () => {
    if (typeof DB === 'undefined') return;
    const cart = DB.getCart() || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.innerText = count;
    }
};

window.addToCart = (productId) => {
    DB.addToCart(productId, 1);
    updateCartCount();
    alert('تم إضافة المنتج إلى السلة بنجاح!');
};

window.toggleFavorite = (productId, btnElement) => {
    const isFav = DB.toggleWishlist(productId);
    if (isFav) {
        btnElement.classList.add('active');
        btnElement.innerHTML = '<i class="fas fa-heart"></i>';
    } else {
        btnElement.classList.remove('active');
        btnElement.innerHTML = '<i class="far fa-heart"></i>';
    }
};

const renderStarRating = (rating) => {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHtml += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 === rating) {
            starsHtml += '<i class="fas fa-star-half-alt"></i>';
        } else {
            starsHtml += '<i class="far fa-star"></i>';
        }
    }
    return starsHtml;
};

window.generateProductCard = (product) => {
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
};

const initHomePage = () => {
    const categoryGrid = document.getElementById('categoryGrid');
    if (categoryGrid) {
        const categories = DB.getCategories();
        categoryGrid.innerHTML = categories.map(cat => `
            <a href="shop.html?category=${cat.id}" class="category-card">
                <img src="${cat.image}" alt="${cat.name}">
                <div class="category-overlay">${cat.name}</div>
            </a>
        `).join('');
    }

    const featuredGrid = document.getElementById('featuredProducts');
    if (featuredGrid) {
        const featured = DB.getFeaturedProducts();
        featuredGrid.innerHTML = featured.slice(0, 4).map(generateProductCard).join('');
    }

    const saleGrid = document.getElementById('saleProducts');
    if (saleGrid) {
        const allProducts = DB.getProducts();
        const saleProducts = allProducts.filter(p => p.discount > 0).slice(0, 4);
        saleGrid.innerHTML = saleProducts.map(generateProductCard).join('');
        // Hide sale section if no sale products
        if (saleProducts.length === 0) saleGrid.parentElement.style.display = 'none';
    }

    const newGrid = document.getElementById('newProducts');
    if (newGrid) {
        const allProducts = DB.getProducts();
        const newProducts = allProducts.slice(0, 4); // newest first (array is reversed in DB)
        newGrid.innerHTML = newProducts.map(generateProductCard).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof DB !== 'undefined') DB.init();
    updateCartCount();
    
    const homepageCheck = document.getElementById('categoryGrid');
    if (homepageCheck) initHomePage();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim() !== '') {
                window.location.href = `shop.html?search=${encodeURIComponent(searchInput.value.trim())}`;
            }
        });
    }
});

// Loader Logic
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Back to Top functionality
window.addEventListener('scroll', () => {
    const btn = document.getElementById('backToTop');
    if (btn) {
        if (window.scrollY > 300) btn.classList.add('show');
        else btn.classList.remove('show');
    }
});

// Countdown Timer Logic
const startCountdown = () => {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;
    let time = 24 * 3600; // 24 hours
    setInterval(() => {
        time--;
        const h = Math.floor(time / 3600).toString().padStart(2, '0');
        const m = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
        const s = (time % 60).toString().padStart(2, '0');
        timerElement.innerText = `${h}:${m}:${s}`;
    }, 1000);
};
document.addEventListener('DOMContentLoaded', startCountdown);
