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
        const imgSrc = (p.images && p.images.length > 0) ? p.images[0] : 'img/placeholder.jpg';
        return `
            <tr>
                <td><img src="${imgSrc}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
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

const addImagePreview = (src) => {
    const previewsContainer = document.getElementById('imagesPreviews');
    
    const imgWrapper = document.createElement('div');
    imgWrapper.style.position = 'relative';
    imgWrapper.style.display = 'inline-block';
    imgWrapper.style.margin = '5px';
    
    const img = document.createElement('img');
    img.src = src;
    img.style.width = '70px';
    img.style.height = '70px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '5px';
    img.style.border = '1px solid #ddd';
    
    const removeBtn = document.createElement('span');
    removeBtn.innerHTML = '&times;';
    removeBtn.style.position = 'absolute';
    removeBtn.style.top = '-5px';
    removeBtn.style.right = '-5px';
    removeBtn.style.background = '#e74c3c';
    removeBtn.style.color = 'white';
    removeBtn.style.borderRadius = '50%';
    removeBtn.style.width = '18px';
    removeBtn.style.height = '18px';
    removeBtn.style.display = 'flex';
    removeBtn.style.justifyContent = 'center';
    removeBtn.style.alignItems = 'center';
    removeBtn.style.cursor = 'pointer';
    removeBtn.style.fontSize = '12px';
    removeBtn.style.fontWeight = 'bold';
    removeBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    removeBtn.onclick = () => imgWrapper.remove();
    
    imgWrapper.appendChild(img);
    imgWrapper.appendChild(removeBtn);
    previewsContainer.appendChild(imgWrapper);
};

window.previewImages = (input) => {
    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach(file => {
            try {
                const reader = new FileReader();
                reader.onload = (e) => {
                    addImagePreview(e.target.result);
                };
                reader.readAsDataURL(file);
            } catch (err) {
                console.error("Error reading file:", err);
            }
        });
        // Clear input value so selecting the same file again triggers change event
        input.value = '';
    }
};

const addVideoPreview = (src) => {
    const videoPreview = document.getElementById('videoPreview');
    videoPreview.innerHTML = '';

    const vidWrapper = document.createElement('div');
    vidWrapper.style.position = 'relative';
    vidWrapper.style.display = 'inline-block';
    vidWrapper.style.margin = '5px';

    const vid = document.createElement('video');
    vid.src = src;
    vid.style.width = '200px';
    vid.style.borderRadius = '5px';
    vid.style.border = '1px solid #ddd';
    vid.controls = true;

    const removeBtn = document.createElement('span');
    removeBtn.innerHTML = '&times;';
    removeBtn.style.position = 'absolute';
    removeBtn.style.top = '-5px';
    removeBtn.style.right = '-5px';
    removeBtn.style.background = '#e74c3c';
    removeBtn.style.color = 'white';
    removeBtn.style.borderRadius = '50%';
    removeBtn.style.width = '18px';
    removeBtn.style.height = '18px';
    removeBtn.style.display = 'flex';
    removeBtn.style.justifyContent = 'center';
    removeBtn.style.alignItems = 'center';
    removeBtn.style.cursor = 'pointer';
    removeBtn.style.fontSize = '12px';
    removeBtn.style.fontWeight = 'bold';
    removeBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    removeBtn.onclick = () => {
        vidWrapper.remove();
        document.getElementById('prodVideoData').value = '';
        document.getElementById('prodVideoUpload').value = '';
    };

    vidWrapper.appendChild(vid);
    vidWrapper.appendChild(removeBtn);
    videoPreview.appendChild(vidWrapper);
};

window.previewVideo = (input) => {
    const videoPreview = document.getElementById('videoPreview');
    const hiddenInput = document.getElementById('prodVideoData');
    videoPreview.innerHTML = '';
    hiddenInput.value = '';

    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        if (file.size > 1.5 * 1024 * 1024) {
            alert('حجم الفيديو كبير جداً! الحد الأقصى المسموح به هو 1.5 ميجابايت.');
            input.value = '';
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                addVideoPreview(e.target.result);
                hiddenInput.value = e.target.result;
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error("Error reading video file:", err);
        }
    }
};

window.showProductForm = () => {
    document.getElementById('productFormContainer').style.display = 'block';
    document.getElementById('formTitle').innerText = 'إضافة منتج جديد';
    document.getElementById('prodId').value = '';
    document.getElementById('prodName').value = '';
    document.getElementById('prodPrice').value = '';
    document.getElementById('prodDiscount').value = '0';
    document.getElementById('prodImages').value = '';
    document.getElementById('prodImagesUpload').value = '';
    document.getElementById('imagesPreviews').innerHTML = '';
    document.getElementById('prodVideoUpload').value = '';
    document.getElementById('videoPreview').innerHTML = '';
    document.getElementById('prodVideoData').value = '';
    document.getElementById('prodDesc').value = '';
    
    document.getElementById('prodFeatured').checked = true;
    document.getElementById('prodOnSale').checked = false;
    document.getElementById('prodIsNew').checked = false;
    document.getElementById('prodShowNewBadge').checked = false;
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
    
    // Clear upload inputs & previews
    document.getElementById('prodImagesUpload').value = '';
    const previewsContainer = document.getElementById('imagesPreviews');
    previewsContainer.innerHTML = '';
    
    document.getElementById('prodImages').value = product.images ? product.images.join('\n') : '';
    if (product.images) {
        product.images.forEach(imgSrc => {
            addImagePreview(imgSrc);
        });
    }

    document.getElementById('prodDesc').value = product.description;
    
    // Checkboxes
    document.getElementById('prodFeatured').checked = product.featured || false;
    document.getElementById('prodOnSale').checked = product.onSale || false;
    document.getElementById('prodIsNew').checked = product.isNew || false;
    document.getElementById('prodShowNewBadge').checked = product.showNewBadge || false;
    
    // Video
    document.getElementById('prodVideoUpload').value = '';
    const videoPreview = document.getElementById('videoPreview');
    videoPreview.innerHTML = '';
    document.getElementById('prodVideoData').value = product.video || '';
    if (product.video) {
        addVideoPreview(product.video);
    }
};

window.saveProduct = () => {
    const id = document.getElementById('prodId').value;
    const name = document.getElementById('prodName').value.trim();
    const category = document.getElementById('prodCategory').value;
    const price = parseFloat(document.getElementById('prodPrice').value);
    const discount = parseFloat(document.getElementById('prodDiscount').value) || 0;
    const description = document.getElementById('prodDesc').value.trim();
    
    const featured = document.getElementById('prodFeatured').checked;
    const onSale = document.getElementById('prodOnSale').checked;
    const isNew = document.getElementById('prodIsNew').checked;
    const showNewBadge = document.getElementById('prodShowNewBadge').checked;
    const video = document.getElementById('prodVideoData').value;

    // Collect images from DOM previews (both uploaded base64 and pre-existing)
    const previewImgs = document.querySelectorAll('#imagesPreviews img');
    let images = Array.from(previewImgs).map(img => img.src);

    // Append manual URL inputs if present
    const imagesText = document.getElementById('prodImages').value.trim();
    if (imagesText) {
        const manualImages = imagesText.split('\n').map(img => img.trim()).filter(img => img !== '');
        images = [...images, ...manualImages];
    }

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
        onSale,
        isNew,
        showNewBadge,
        video,
        rating: 5
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
                    <button class="action-btn edit-btn" onclick="viewOrderDetails('${order.id}')" title="عرض التفاصيل"><i class="fas fa-eye"></i></button>
                    <button class="action-btn del-btn" onclick="deleteOrder('${order.id}')" title="حذف الطلب"><i class="fas fa-trash-alt"></i></button>
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
    loadOrders();
};

window.viewOrderDetails = (orderId) => {
    const orders = DB.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('modalOrderTitle').innerText = `تفاصيل الطلب #${order.id}`;

    let html = `
        <div class="order-info-grid">
            <div><strong><i class="fas fa-user"></i> العميل:</strong> ${order.customerName}</div>
            <div><strong><i class="fas fa-phone"></i> الهاتف:</strong> <a href="tel:${order.customerPhone}" style="color:var(--primary-color); text-decoration:none;" dir="ltr">${order.customerPhone}</a></div>
            <div><strong><i class="fas fa-map-marker-alt"></i> المحافظة:</strong> <span style="background:#fff3cd; color:#856404; padding:2px 10px; border-radius:10px; font-weight:bold;">${order.customerGovernorate || 'غير محددة'}</span></div>
            <div style="grid-column: 1 / -1;"><strong><i class="fas fa-map-marker-alt"></i> العنوان التفصيلي:</strong> ${order.customerAddress || 'غير محدد'}</div>
            <div><strong><i class="fas fa-credit-card"></i> الدفع:</strong> ${order.paymentMethod}</div>
            <div><strong><i class="fas fa-calendar-alt"></i> التاريخ:</strong> ${new Date(order.date).toLocaleDateString('ar-YE')}</div>
        </div>
        <h4 style="margin-bottom: 15px; color: var(--dark-gray); border-bottom: 2px solid #eee; padding-bottom: 5px;">المنتجات المطلوبة</h4>
        <div style="margin-bottom: 20px;">
    `;

    order.items.forEach(item => {
        const productUrl = `product.html?id=${item.productId || item.id}`;
        html += `
            <div class="order-item-row">
                <a href="${productUrl}" target="_blank" class="order-item-link">
                    <i class="fas fa-link"></i> ${item.name}
                </a>
                <span style="font-size: 0.95rem; font-weight: bold;">الكمية: ${item.quantity}</span>
            </div>
        `;
    });

    html += `
        </div>
        <div style="background: var(--dark-gray); color: white; padding: 15px 20px; border-radius: 8px; font-size: 1.2rem; display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
            <strong>الإجمالي الكلي:</strong>
            <span style="color: var(--secondary-color); font-weight: bold; font-size: 1.4rem;">${formatPrice(order.total)}</span>
        </div>
    `;

    document.getElementById('modalOrderBody').innerHTML = html;
    document.getElementById('orderModal').style.display = 'flex';
};

window.closeOrderModal = () => {
    document.getElementById('orderModal').style.display = 'none';
};

window.deleteOrder = (orderId) => {
    if (confirm(`هل أنت متأكد من حذف الطلب #${orderId} نهائياً؟ لا يمكن التراجع عن هذه العملية.`)) {
        DB.deleteOrder(orderId);
        loadOrders();
        loadDashboard();
        const modal = document.getElementById('orderModal');
        if (modal) modal.style.display = 'none';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
    document.addEventListener('db-ready', () => {
        loadDashboard();
        loadProducts();
        loadOrders();
    });
});