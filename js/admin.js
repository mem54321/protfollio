

const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-YE', { style: 'currency', currency: 'YER' }).format(price);
};

const initAdmin = () => {
    // Navigation Logic
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            e.target.closest('a').classList.add('active');

            const targetId = e.target.closest('a').getAttribute('data-target');
            document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            if (targetId === 'dashboard') loadDashboard();
            if (targetId === 'products') loadProducts();
            if (targetId === 'orders') loadOrders();
        });
    });

    // Populate Category Select
    const catSelect = document.getElementById('prodCategory');
    if (catSelect) {
        let html = '';
        DB.getCategories().forEach(c => {
            html += `<optgroup label="${c.name}">`;
            html += `<option value="${c.id}">${c.name} (عام)</option>`;
            if (c.subcategories) {
                c.subcategories.forEach(sub => {
                    html += `<option value="${sub.id}">${sub.name}</option>`;
                });
            }
            html += `</optgroup>`;
        });
        catSelect.innerHTML = html;
    }

    loadDashboard();
    loadProducts();
    loadOrders();
};

const loadDashboard = () => {
    const products = DB.getProducts();
    const orders = DB.getOrders();

    document.getElementById('statTotalProducts').innerText = products.length;
    document.getElementById('statTotalOrders').innerText = orders.length;
};

const loadProducts = () => {
    const products = DB.getProducts();
    const tbody = document.getElementById('adminProductsList');
    const categories = DB.getCategories();

    const getCategoryName = (categoryId) => {
        for (const cat of categories) {
            if (cat.id === categoryId) return cat.name;
            if (cat.subcategories) {
                const sub = cat.subcategories.find(s => s.id === categoryId);
                if (sub) return sub.name;
            }
        }
        return 'غير محدد';
    };

    tbody.innerHTML = products.map(p => {
        const catName = getCategoryName(p.category);
        return `
            <tr>
                <td><img src="${p.images[0]}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
                <td>${p.name}</td>
                <td>${catName}</td>
                <td>${formatPrice(p.price)}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editProduct('${p.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn del-btn" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `;
    }).join('');
};

window.showProductForm = () => {
    document.getElementById('productFormContainer').style.display = 'block';
    document.getElementById('formTitle').innerText = 'إضافة منتج جديد';
    document.getElementById('prodId').value = '';
    document.getElementById('prodName').value = '';
    document.getElementById('prodPrice').value = '';
    document.getElementById('prodDiscount').value = '0';
    document.getElementById('prodImages').value = '';
    document.getElementById('prodDesc').value = '';
    document.getElementById('prodFeatured').checked = true;
};

window.hideProductForm = () => {
    document.getElementById('productFormContainer').style.display = 'none';
};

window.editProduct = (id) => {
    const product = DB.getProduct(id);
    if (!product) return;

    document.getElementById('productFormContainer').style.display = 'block';
    document.getElementById('formTitle').innerText = 'تعديل المنتج';

    document.getElementById('prodId').value = product.id;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodCategory').value = product.category;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodDiscount').value = product.discount || 0;
    document.getElementById('prodImages').value = product.images.join('\n');
    document.getElementById('prodDesc').value = product.description;
    document.getElementById('prodFeatured').checked = product.featured || false;
};

window.saveProduct = () => {
    const id = document.getElementById('prodId').value;
    const name = document.getElementById('prodName').value.trim();
    const category = document.getElementById('prodCategory').value;
    const price = parseFloat(document.getElementById('prodPrice').value);
    const discount = parseFloat(document.getElementById('prodDiscount').value) || 0;
    const imagesText = document.getElementById('prodImages').value.trim();
    const images = imagesText.split('\n').map(img => img.trim()).filter(img => img !== '');
    const description = document.getElementById('prodDesc').value.trim();
    const featured = document.getElementById('prodFeatured').checked;

    if (!name || !price || images.length === 0 || !description) {
        alert('الرجاء تعبئة جميع الحقول المطلوبة (الاسم، السعر، صورة واحدة على الأقل، والوصف).');
        return;
    }

    const product = {
        name,
        category,
        price,
        discount,
        description,
        images: images,
        featured,
        rating: 5 // Default rating
    };

    if (id) {
        product.id = id;
    }

    DB.saveProduct(product);
    hideProductForm();
    loadProducts();
    loadDashboard();
    alert('تم حفظ المنتج بنجاح!');
};

window.deleteProduct = (id) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج؟')) {
        DB.deleteProduct(id);
        loadProducts();
        loadDashboard();
    }
};

const loadOrders = () => {
    const orders = DB.getOrders();
    const tbody = document.getElementById('adminOrdersList');

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:#999;">لا توجد طلبات حتى الآن</td></tr>`;
        return;
    }

    tbody.innerHTML = [...orders].reverse().map(order => {
        const date = new Date(order.date).toLocaleDateString('ar-YE');
        const itemsCount = order.items ? order.items.reduce((sum, i) => sum + i.quantity, 0) : 0;
        const paymentBadge = order.paymentMethod === 'واتساب'
            ? `<span style="background:#25D366; color:white; padding:2px 8px; border-radius:4px; font-size:0.8rem;"><i class="fab fa-whatsapp"></i> واتساب</span>`
            : `<span style="background:#3498db; color:white; padding:2px 8px; border-radius:4px; font-size:0.8rem;"><i class="fas fa-store"></i> الموقع</span>`;

        return `
            <tr>
                <td style="font-weight:bold; color:var(--primary-color);">${order.id}</td>
                <td>
                    <div style="font-weight:bold;">${order.customerName}</div>
                    <div style="font-size:0.85rem; color:#777;">${order.customerPhone}</div>
                    <div style="font-size:0.8rem; color:#999;">${order.customerAddress || ''}</div>
                </td>
                <td>${date}</td>
                <td>
                    <div style="font-weight:bold; color:var(--primary-color);">${formatPrice(order.total)}</div>
                    <div style="font-size:0.8rem; color:#777;">${itemsCount} قطعة</div>
                </td>
                <td>${paymentBadge}</td>
                <td>
                    <select class="status-badge ${getStatusClass(order.status)}" onchange="updateOrderStatus('${order.id}', this.value)" style="border:none; outline:none; cursor:pointer; border-radius:4px; padding:4px 8px;">
                        <option value="New" ${order.status === 'New' ? 'selected' : ''}>جديد</option>
                        <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>قيد التنفيذ</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>تم التوصيل</option>
                        <option value="Canceled" ${order.status === 'Canceled' ? 'selected' : ''}>ملغي</option>
                    </select>
                </td>
                <td>
                    <button class="action-btn edit-btn" onclick="viewOrderDetails('${order.id}')"><i class="fas fa-eye"></i></button>
                </td>
            </tr>
        `;
    }).join('');
};

const getStatusClass = (status) => {
    switch (status) {
        case 'New': return 'status-new';
        case 'Processing': return 'status-processing';
        case 'Delivered': return 'status-delivered';
        case 'Canceled': return 'status-canceled';
        default: return '';
    }
};

window.updateOrderStatus = (orderId, newStatus) => {
    DB.updateOrderStatus(orderId, newStatus);
    loadOrders(); // Refresh to update badge colors
};

window.viewOrderDetails = (orderId) => {
    const orders = DB.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    let details = `طلب رقم: ${order.id}\n`;
    details += `العميل: ${order.customerName}\n`;
    details += `الهاتف: ${order.customerPhone}\n`;
    details += `العنوان: ${order.customerAddress}\n\n`;
    details += `المنتجات:\n`;
    order.items.forEach(item => {
        details += `- ${item.name} (x${item.quantity})\n`;
    });
    details += `\nالإجمالي: ${formatPrice(order.total)}`;

    alert(details);
};

document.addEventListener('DOMContentLoaded', initAdmin);
