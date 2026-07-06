
// Global variables & Utilities
window.showToast = (message, type = 'success') => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    // Trigger reflow to start animation
    void toast.offsetWidth;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400); // Wait for transition
    }, 3000);
};

window.toggleMenu = () => {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
};

window.formatPrice = (price) => {
    return new Intl.NumberFormat('ar-YE', { style: 'currency', currency: 'YER' }).format(price);
};

window.updateCartCount = () => {
    const countElement = document.getElementById('cartCount');
    if (countElement) {
        const cart = DB.getCart() || [];
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        countElement.innerText = count;
    }
};

window.initInstantSearch = () => {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    if(!searchInput || !searchResults) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if(query.length === 0) {
            searchResults.style.display = 'none';
            return;
        }

        const products = DB.getProducts();
        const results = products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
        ).slice(0, 5); // Limit to 5 results

        if(results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">لا توجد نتائج مطابقة</div>';
        } else {
            searchResults.innerHTML = results.map(p => `
                <a href="product.html?id=${p.id}" class="search-result-item">
                    <img src="${p.images[0]}" alt="${p.name}">
                    <div class="search-result-info">
                        <h4>${p.name}</h4>
                        <span>${p.price.toLocaleString()} ر.ي</span>
                    </div>
                </a>
            `).join('');
        }
        searchResults.style.display = 'flex';
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if(!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
};

window.flyToCart = (startElement) => {
    const cartIcon = document.querySelector('.fa-shopping-cart').closest('a');
    if (!startElement || !cartIcon) return;

    const startRect = startElement.getBoundingClientRect();
    const endRect = cartIcon.getBoundingClientRect();

    const flyImg = startElement.cloneNode(true);
    flyImg.style.position = 'fixed';
    flyImg.style.top = startRect.top + 'px';
    flyImg.style.left = startRect.left + 'px';
    flyImg.style.width = startRect.width + 'px';
    flyImg.style.height = startRect.height + 'px';
    flyImg.style.zIndex = '10000';
    flyImg.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    flyImg.style.borderRadius = '50%';
    flyImg.style.objectFit = 'cover';
    flyImg.style.opacity = '0.9';

    document.body.appendChild(flyImg);

    // Trigger reflow
    void flyImg.offsetWidth;

    flyImg.style.top = (endRect.top - 10) + 'px';
    flyImg.style.left = (endRect.left + 10) + 'px';
    flyImg.style.width = '20px';
    flyImg.style.height = '20px';
    flyImg.style.opacity = '0.2';
    flyImg.style.transform = 'scale(0.2)';

    setTimeout(() => {
        cartIcon.style.transform = 'scale(1.3) rotate(-10deg)';
        cartIcon.style.transition = 'transform 0.2s';
        setTimeout(() => {
            cartIcon.style.transform = 'scale(1) rotate(0)';
        }, 200);
        flyImg.remove();
    }, 800);
};

window.addToCart = (productId, btnElement) => {
    DB.addToCart(productId, 1);
    updateCartCount();
    showToast('تم إضافة المنتج إلى السلة بنجاح!');
    
    if(btnElement) {
        const productCard = btnElement.closest('.product-card');
        if(productCard) {
            const img = productCard.querySelector('img');
            if(img) flyToCart(img);
        }
    }
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
            <div class="product-image-container" style="position:relative;">
                <a href="product.html?id=${product.id}">
                    <img src="${product.images[0]}" alt="${product.name}" class="product-img" loading="lazy" style="width:100%; height:280px; object-fit:cover;">
                </a>
                <button class="btn-quick-view" onclick="quickView('${product.id}', event)"><i class="far fa-eye"></i> نظرة سريعة</button>
            </div>
            <div class="product-info" style="padding:15px; text-align:right;">
                <a href="product.html?id=${product.id}" style="text-decoration:none; color:inherit;"><h3 class="product-title" style="font-size:1rem; margin-bottom:5px; height: 45px; overflow: hidden;">${product.name}</h3></a>
                <div style="color: #f1c40f; font-size: 0.9rem; margin-bottom: 5px;"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i> <span style="color:#999">(24)</span></div>
                <div style="font-size: 0.8rem; color: #27ae60; margin-bottom: 10px;"><i class="fas fa-check-circle"></i> متوفر في المخزون</div>
                <div class="product-price" style="margin-bottom:15px; display:flex; align-items:center; gap:8px;">
                    <span style="color:var(--primary-color); font-weight:bold; font-size:1.2rem;">${finalPrice.toLocaleString()} ر.ي</span>
                    ${product.discount > 0 ? `<span style="text-decoration:line-through; color:#999; font-size:0.9rem;">${product.price.toLocaleString()}</span>` : ''}
                </div>
                <div class="product-actions" style="display:flex; gap:10px;">
                    <button class="btn-cart" onclick="addToCart('${product.id}', this)" style="flex:1; background:#333; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer; font-weight:bold;">
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



window.quickView = (productId, event) => {
    event.preventDefault();
    event.stopPropagation();
    const product = DB.getProduct(productId);
    if (!product) return;

    let qvModal = document.getElementById('quickViewModal');
    if (!qvModal) {
        qvModal = document.createElement('div');
        qvModal.id = 'quickViewModal';
        qvModal.className = 'qv-modal-overlay';
        qvModal.onclick = (e) => { if(e.target === qvModal) closeQuickView(); };
        document.body.appendChild(qvModal);
    }

    const finalPrice = product.discount > 0 ? product.price - (product.price * (product.discount / 100)) : product.price;

    qvModal.innerHTML = `
        <div class="qv-modal-content">
            <button class="qv-close" onclick="closeQuickView()"><i class="fas fa-times"></i></button>
            <div class="qv-image">
                <img src="${product.images[0]}" alt="${product.name}">
            </div>
            <div class="qv-details">
                <h2 class="qv-title">${product.name}</h2>
                <div class="qv-price">${finalPrice.toLocaleString()} ر.ي ${product.discount > 0 ? `<span style="text-decoration:line-through; color:#999; font-size:0.9rem;">${product.price.toLocaleString()}</span>` : ''}</div>
                <p class="qv-desc">${product.description.substring(0, 150)}...</p>
                
                <!-- Color Swatches (Interactive) -->
                <div style="margin-bottom: 20px;">
                    <strong style="display:block; margin-bottom:10px;">اختر اللون:</strong>
                    <div style="display:flex; gap:10px;">
                        <div style="width:30px; height:30px; border-radius:50%; background:#8C6239; cursor:pointer; border:2px solid #333;" onclick="this.style.border='2px solid #8B0000'"></div>
                        <div style="width:30px; height:30px; border-radius:50%; background:#ccc; cursor:pointer; border:2px solid transparent;" onclick="this.style.border='2px solid #8B0000'"></div>
                        <div style="width:30px; height:30px; border-radius:50%; background:#333; cursor:pointer; border:2px solid transparent;" onclick="this.style.border='2px solid #8B0000'"></div>
                    </div>
                </div>

                <div style="display:flex; gap:15px; margin-top:auto;">
                    <button onclick="addToCart('${product.id}', this); closeQuickView()" style="flex:1; background:var(--primary-color); color:white; border:none; padding:15px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem;"><i class="fas fa-cart-plus"></i> أضف للسلة</button>
                    <a href="product.html?id=${product.id}" style="flex:1; background:var(--dark-gray); color:white; text-align:center; padding:15px; border-radius:8px; font-weight:bold; font-size:1.1rem; text-decoration:none;">التفاصيل الكاملة</a>
                </div>
            </div>
        </div>
    `;
    
    qvModal.style.display = 'flex';
};

window.closeQuickView = () => {
    const qvModal = document.getElementById('quickViewModal');
    if (qvModal) qvModal.style.display = 'none';
};

const initHomePage = () => {
    const categoryGrid = document.getElementById('categoryGrid');
    if (categoryGrid) {
        const categories = DB.getCategories();
        categoryGrid.innerHTML = categories.map(cat => `
            <a href="shop.html?category=${cat.id}" class="category-card">
                <img src="${cat.image}" alt="${cat.name}" loading="lazy">
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

// Scroll Animations Observer
window.initScrollAnimations = () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof DB !== 'undefined') DB.init();
    updateCartCount();
    if(window.initInstantSearch) window.initInstantSearch();

    // ====== Auto Guest Login ======
    // إذا لم يكن هناك مستخدم مسجل، قم بإنشاء جلسة زائر تلقائية
    const storedUser = localStorage.getItem('rawnaq_logged_user');
    if (!storedUser) {
        const guestUser = {
            id: 'guest_' + Date.now(),
            name: 'زائر',
            email: '',
            isGuest: true
        };
        localStorage.setItem('rawnaq_logged_user', JSON.stringify(guestUser));
    }
    // ==============================
    
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

    // Initialize Scroll Animations
    if(window.initScrollAnimations) window.initScrollAnimations();
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
