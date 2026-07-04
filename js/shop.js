
let allProducts = [];
let filteredProducts = [];

const initShop = () => {
    if (typeof DB === 'undefined') {
        console.error("DB is not defined");
        return;
    }
    allProducts = DB.getProducts();
    filteredProducts = [...allProducts];

    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');

    // Render Sidebar Categories
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        const categories = DB.getCategories();
        let html = `<li><a href="#" data-category="all" class="${!categoryParam ? 'active' : ''}">الكل</a></li>`;
        categories.forEach(cat => {
            const isCatActive = categoryParam === cat.id;
            html += `<li><a href="#" data-category="${cat.id}" class="${isCatActive ? 'active' : ''}" style="font-weight: bold;">${cat.name}</a></li>`;
        });
        categoryFilter.innerHTML = html;

        // Add Click Listeners
        categoryFilter.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                categoryFilter.querySelectorAll('a').forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
                filterByCategory(e.target.getAttribute('data-category'));
            });
        });
    }

    if (searchParam) {
        filteredProducts = allProducts.filter(p => p.name.includes(searchParam) || p.description.includes(searchParam));
    } else if (categoryParam && categoryParam !== 'all') {
        filteredProducts = allProducts.filter(p => p.category === categoryParam);
    }

    renderProducts();

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortProducts(e.target.value);
        });
    }
};

let currentCategory = 'all';

const filterByCategory = (category) => {
    currentCategory = category;
    applyFilters();
};

window.applyFilters = () => {
    const minPrice = parseInt(document.getElementById('minPrice')?.value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPrice')?.value) || Infinity;
    const isSale = document.getElementById('filterSale')?.checked;

    let baseProducts = currentCategory === 'all' ? [...allProducts] : allProducts.filter(p => p.category === currentCategory);

    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
        baseProducts = baseProducts.filter(p => p.name.includes(searchParam) || p.description.includes(searchParam));
    }

    filteredProducts = baseProducts.filter(p => {
        const price = getFinalPrice(p);
        if (price < minPrice || price > maxPrice) return false;
        if (isSale && p.discount <= 0) return false;
        return true;
    });

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortProducts(sortSelect.value); // sortProducts already calls renderProducts()
    } else {
        renderProducts();
    }
};

const sortProducts = (sortType) => {
    if (sortType === 'price-low') {
        filteredProducts.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
    } else if (sortType === 'price-high') {
        filteredProducts.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
    }
    renderProducts();
};

const getFinalPrice = (product) => {
    return product.discount > 0 ? product.price * (1 - (product.discount / 100)) : product.price;
};

const renderProducts = () => {
    const grid = document.getElementById('shopProductsGrid');
    const resultsCount = document.getElementById('resultsCount');

    if (grid) {
        if (filteredProducts.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 50px;">لا يوجد منتجات.</p>';
        } else {
            grid.innerHTML = filteredProducts.map(p => {
                if (window.generateProductCard) {
                    return window.generateProductCard(p);
                }
                const finalPrice = getFinalPrice(p);
                return `
                <div class="product-card">
                    <a href="product.html?id=${p.id}" style="text-decoration: none; color: inherit;">
                        <div class="product-image">
                            <img src="${p.images[0]}" alt="${p.name}">
                            ${p.discount > 0 ? `<span class="discount-tag">-${p.discount}%</span>` : ''}
                        </div>
                        <div class="product-info" style="padding: 20px;">
                            <h3 class="product-title" style="margin-bottom: 10px;">${p.name}</h3>
                            <div class="product-price" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                <span style="color: #c0392b; font-weight: bold; font-size: 1.1rem;">${finalPrice.toLocaleString()} ر.ي</span>
                                ${p.discount > 0 ? `<span style="text-decoration: line-through; color: #999; font-size: 0.85rem;">${p.price.toLocaleString()} ر.ي</span>` : ''}
                                ${p.discount > 0 ? `<span style="color: white; background: #c0392b; padding: 2px 5px; border-radius: 3px; font-size: 0.75rem;">-${p.discount}%</span>` : ''}
                            </div>
                        </div>
                    </a>
                </div>
                `;
            }).join('');
        }
    }

    if (resultsCount) {
        resultsCount.innerText = `يعرض ${filteredProducts.length} منتجات`;
    }
};

document.addEventListener('DOMContentLoaded', initShop);
