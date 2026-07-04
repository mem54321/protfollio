
let cartItemsDetails = [];
let cartTotal = 0;

const initCart = () => {
    const cart = DB.getCart() || [];
    const productsList = document.getElementById('cartItemsList');
    const summaryDiv = document.getElementById('cartSummary');
    const form = document.getElementById('customerForm');

    if (cart.length === 0) {
        productsList.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <i class="fas fa-shopping-cart" style="font-size: 4rem; color: #ccc; margin-bottom: 20px;"></i>
                <h2>سلة المشتريات فارغة</h2>
                <a href="shop.html" class="btn-primary" style="display: inline-block; margin-top: 20px; text-decoration: none;">اذهب للتسوق الآن</a>
            </div>
        `;
        summaryDiv.innerHTML = '<p>لا توجد منتجات لحساب الإجمالي.</p>';
        form.style.display = 'none';
        return;
    }

    cartItemsDetails = [];
    cartTotal = 0;

    let itemsHtml = '';
    cart.forEach(item => {
        const product = DB.getProduct(item.productId);
        if (product) {
            const finalPrice = product.discount > 0 ? product.price * (1 - (product.discount / 100)) : product.price;
            const itemSubtotal = finalPrice * item.quantity;
            cartTotal += itemSubtotal;
            cartItemsDetails.push({ ...product, quantity: item.quantity, subtotal: itemSubtotal });

            itemsHtml += `
                <div class="cart-item">
                    <img src="${product.images[0]}" alt="${product.name}">
                    <div class="cart-item-info">
                        <h3 class="cart-item-title">${product.name}</h3>
                        <p class="cart-item-price">${finalPrice.toLocaleString()} ر.ي</p>
                        <div class="qty-controls" style="margin-top: 10px;">
                            <button class="qty-btn" onclick="updateQty('${product.id}', ${item.quantity - 1})">-</button>
                            <span style="font-size: 1.1rem; min-width: 30px; text-align: center;">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQty('${product.id}', ${item.quantity + 1})">+</button>
                            <button class="btn-remove" onclick="removeItem('${product.id}')" style="margin-right: 20px;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div style="font-weight: bold; font-size: 1.1rem;">
                        ${itemSubtotal.toLocaleString()} ر.ي
                    </div>
                </div>
            `;
        }
    });

    productsList.innerHTML = itemsHtml;
    summaryDiv.innerHTML = `
        <div class="summary-row">
            <span>إجمالي المنتجات:</span>
            <span>${cartTotal.toLocaleString()} ر.ي</span>
        </div>
        <div class="summary-row">
            <span>التوصيل والتركيب:</span>
            <span style="color: #27ae60;">مجاني</span>
        </div>
        <div class="summary-row summary-total">
            <span>الإجمالي الكلي:</span>
            <span>${cartTotal.toLocaleString()} ر.ي</span>
        </div>
    `;
    form.style.display = 'block';
};

window.updateQty = (id, newQty) => {
    if (newQty < 1) return;
    DB.updateCartQuantity(id, newQty);
    initCart();
};

window.removeItem = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج من السلة؟')) {
        DB.removeFromCart(id);
        initCart();
        if (window.updateCartCount) window.updateCartCount();
    }
};

window.sendOrderWhatsApp = () => {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();

    if (!name || !phone || !address) {
        alert('الرجاء تعبئة جميع بيانات التواصل (الاسم، الهاتف، العنوان).');
        return;
    }

    let message = `🛍️ *طلب جديد من رونق همدان*\n\n`;
    message += `👤 *بيانات العميل:*\n`;
    message += `• الاسم: ${name}\n`;
    message += `• الهاتف: ${phone}\n`;
    message += `• العنوان: ${address}\n\n`;
    message += `📦 *المنتجات المطلوبة:*\n`;

    cartItemsDetails.forEach(item => {
        // Build robust URL that works on Netlify without .html and locally
        let productLink = '';
        try {
            productLink = new URL(`product.html?id=${item.id}`, window.location.href).href;
        } catch(e) {
            // Fallback if URL fails
            productLink = `https://ronaqhamdan.netlify.app/product.html?id=${item.id}`;
        }
        
        message += `\n━━━━━━━━━━━━━━━\n`;
        message += `🪑 *${item.name}*\n`;
        message += `• الكمية: ${item.quantity} قطعة\n`;
        message += `• السعر: ${item.subtotal.toLocaleString()} ر.ي\n`;
        message += `• 🔗 رابط المنتج:\n${productLink}\n`;
    });

    message += `\n━━━━━━━━━━━━━━━\n`;
    message += `💰 *الإجمالي الكلي: ${cartTotal.toLocaleString()} ر.ي*\n\n`;
    message += `⏰ يرجى التواصل معنا لتأكيد الطلب وتحديد موعد التوصيل`;

    const whatsappNumber = "967771219034";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    
    // Save order to site as well with "WhatsApp" payment method
    saveOrderToDatabase(name, phone, address, 'واتساب');
};

window.sendOrderToSite = () => {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();

    if (!name || !phone || !address) {
        alert('الرجاء تعبئة جميع بيانات التواصل (الاسم، الهاتف، العنوان).');
        return;
    }

    saveOrderToDatabase(name, phone, address, 'الدفع عند الاستلام');

    // Show success message
    document.querySelector('.cart-container').innerHTML = `
        <div style="width:100%; text-align:center; padding: 80px 20px;">
            <div style="font-size: 5rem; color: #27ae60; margin-bottom: 20px;">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2 style="color: #27ae60; font-size: 2rem; margin-bottom: 15px;">تم استلام طلبك بنجاح!</h2>
            <p style="color: #666; font-size: 1.1rem; margin-bottom: 10px;">شكراً لك <strong>${name}</strong> على ثقتك بمتجر رونق همدان</p>
            <p style="color: #666; font-size: 1rem; margin-bottom: 30px;">سيتواصل معك فريقنا على الرقم <strong>${phone}</strong> في أقرب وقت لتأكيد طلبك وتحديد موعد التوصيل.</p>
            <a href="shop.html" class="btn-primary" style="display:inline-block; padding: 15px 40px; font-size: 1.1rem;">متابعة التسوق</a>
        </div>
    `;
};

const saveOrderToDatabase = (name, phone, address, paymentMethod) => {
    const orderData = {
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        paymentMethod: paymentMethod,
        items: cartItemsDetails.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal
        })),
        total: cartTotal
    };
    DB.saveOrder(orderData);
    DB.clearCart();
    if (window.updateCartCount) window.updateCartCount();
};

document.addEventListener('DOMContentLoaded', initCart);
