
const initWishlist = () => {
    if (typeof DB === 'undefined') return;
    const wishlistIds = DB.getWishlist();
    const grid = document.getElementById('wishlistGrid');

    if (!grid) return;

    if (wishlistIds.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 50px;"><i class="far fa-heart" style="font-size: 4rem; color: #ccc; margin-bottom: 20px;"></i><h2>قائمة المفضلة فارغة</h2></div>';
        return;
    }

    const allProducts = DB.getProducts();
    const favoriteProducts = allProducts.filter(p => wishlistIds.includes(p.id));

    if (window.generateProductCard) {
        grid.innerHTML = favoriteProducts.map(p => window.generateProductCard(p)).join('');
    } else {
        grid.innerHTML = favoriteProducts.map(p => `
            <div class="product-card">
                <img src="${p.images[0]}" alt="${p.name}" style="width:100%; height:200px; object-fit:cover;">
                <div style="padding:15px;">
                    <h3>${p.name}</h3>
                    <p>${p.price.toLocaleString()} ر.ي</p>
                    <a href="product.html?id=${p.id}" class="btn-primary" style="display:block; text-align:center; margin-top:10px; text-decoration:none;">عرض المنتج</a>
                </div>
            </div>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', initWishlist);
