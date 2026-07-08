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

// Image compression helper using Canvas
const compressImage = (file, maxWidth = 1000, maxHeight = 1000, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Export as JPEG with quality compression
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
            img.src = event.target.result;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
};

// Firebase Storage file upload helper
const uploadFileToFirebaseStorage = async (file, folder = 'products') => {
    if (window.isFirebaseEnabled && typeof firebase !== 'undefined' && window.firebaseStorage) {
        try {
            const fileName = `${Date.now()}_${file.name}`;
            const fileRef = window.firebaseStorage.ref().child(`${folder}/${fileName}`);
            const snapshot = await fileRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            return downloadURL;
        } catch (error) {
            console.warn("Firebase Storage upload failed:", error);
            throw error;
        }
    }
    throw new Error("Firebase Storage is not enabled or loaded.");
};

const createPlaceholderPreview = () => {
    const previewsContainer = document.getElementById('imagesPreviews');
    
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.margin = '5px';
    wrapper.style.width = '70px';
    wrapper.style.height = '70px';
    wrapper.style.borderRadius = '5px';
    wrapper.style.border = '1px dashed #999';
    wrapper.style.background = '#f5f6fa';
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'center';
    wrapper.style.alignItems = 'center';
    
    const spinner = document.createElement('i');
    spinner.className = 'fas fa-spinner fa-spin';
    spinner.style.color = 'var(--primary-color)';
    spinner.style.fontSize = '1.5rem';
    
    wrapper.appendChild(spinner);
    previewsContainer.appendChild(wrapper);
    return wrapper;
};

const fillPlaceholderPreview = (wrapper, src) => {
    wrapper.innerHTML = '';
    wrapper.style.border = '1px solid #ddd';
    wrapper.style.background = 'none';
    wrapper.style.width = '70px';
    wrapper.style.height = '70px';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    
    const img = document.createElement('img');
    img.src = src;
    img.style.width = '70px';
    img.style.height = '70px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '5px';
    
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
    removeBtn.onclick = () => wrapper.remove();
    
    wrapper.appendChild(img);
    wrapper.appendChild(removeBtn);
};

const addImagePreview = (src) => {
    const previewsContainer = document.getElementById('imagesPreviews');
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.margin = '5px';
    fillPlaceholderPreview(wrapper, src);
    previewsContainer.appendChild(wrapper);
};

window.previewImages = async (input) => {
    if (input.files && input.files.length > 0) {
        const filesArray = Array.from(input.files);
        input.value = ''; // Clear value so same files trigger change
        
        for (const file of filesArray) {
            const wrapper = createPlaceholderPreview();
            try {
                // Try uploading to Firebase Storage first (gives permanent URL, no size limit)
                const downloadURL = await uploadFileToFirebaseStorage(file, 'products');
                fillPlaceholderPreview(wrapper, downloadURL);
            } catch (err) {
                console.log("Storage upload failed, falling back to local compression...", err);
                try {
                    // Fallback: compress heavily so it fits in localStorage (max 5MB total)
                    // Use 800px max & quality 0.5 → each image ~40-70KB
                    const compressedBase64 = await compressImage(file, 800, 800, 0.5);
                    fillPlaceholderPreview(wrapper, compressedBase64);
                } catch (compressErr) {
                    console.error("Compression also failed:", compressErr);
                    wrapper.remove();
                    alert("فشل رفع أو ضغط الصورة: " + file.name);
                }
            }
        }
    }
};

const createVideoPlaceholder = () => {
    const videoPreview = document.getElementById('videoPreview');
    videoPreview.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.margin = '5px';
    wrapper.style.width = '200px';
    wrapper.style.height = '120px';
    wrapper.style.borderRadius = '5px';
    wrapper.style.border = '1px dashed #999';
    wrapper.style.background = '#f5f6fa';
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'center';
    wrapper.style.alignItems = 'center';
    
    const spinner = document.createElement('i');
    spinner.className = 'fas fa-spinner fa-spin';
    spinner.style.color = 'var(--primary-color)';
    spinner.style.fontSize = '2rem';
    
    wrapper.appendChild(spinner);
    videoPreview.appendChild(wrapper);
    return wrapper;
};

const fillVideoPreview = (wrapper, src) => {
    wrapper.innerHTML = '';
    wrapper.style.border = '1px solid #ddd';
    wrapper.style.background = 'none';
    wrapper.style.width = 'auto';
    wrapper.style.height = 'auto';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    
    let youtubeId = '';
    if (src.includes('youtube.com') || src.includes('youtu.be')) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = src.match(regExp);
        if (match && match[2].length === 11) {
            youtubeId = match[2];
        }
    }
    
    if (youtubeId) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${youtubeId}`;
        iframe.style.width = '200px';
        iframe.style.height = '120px';
        iframe.style.borderRadius = '5px';
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        wrapper.appendChild(iframe);
    } else {
        const vid = document.createElement('video');
        vid.src = src;
        vid.style.width = '200px';
        vid.style.borderRadius = '5px';
        vid.controls = true;
        wrapper.appendChild(vid);
    }
    
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
        wrapper.remove();
        document.getElementById('prodVideoData').value = '';
        document.getElementById('prodVideoUpload').value = '';
        const urlInput = document.getElementById('prodVideoUrl');
        if (urlInput) urlInput.value = '';
    };
    
    wrapper.appendChild(removeBtn);
};

window.previewVideo = async (input) => {
    const videoPreview = document.getElementById('videoPreview');
    const hiddenInput = document.getElementById('prodVideoData');
    videoPreview.innerHTML = '';
    hiddenInput.value = '';

    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Restrict size to 10MB
        const maxLimit = 10 * 1024 * 1024;
        if (file.size > maxLimit) {
            alert('حجم الفيديو كبير جداً! الحد الأقصى المسموح به هو 10 ميجابايت.');
            input.value = '';
            return;
        }

        const wrapper = createVideoPlaceholder();
        try {
            const downloadURL = await uploadFileToFirebaseStorage(file, 'videos');
            fillVideoPreview(wrapper, downloadURL);
            hiddenInput.value = downloadURL;
        } catch (err) {
            console.error("Video storage upload failed:", err);
            wrapper.remove();
            alert('عذراً، فشل رفع الفيديو إلى السحابة. قد يكون بسبب قيود الأمان أو عدم تفعيل التخزين السحابي في Firebase. يرجى إدخال رابط فيديو خارجي (مثل يوتيوب) في الأسفل.');
            input.value = '';
        }
    }
};

window.updateVideoFromUrl = (url) => {
    const hiddenInput = document.getElementById('prodVideoData');
    hiddenInput.value = url.trim();
    
    const videoPreview = document.getElementById('videoPreview');
    videoPreview.innerHTML = '';
    
    if (url.trim() !== '') {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.margin = '5px';
        fillVideoPreview(wrapper, url.trim());
        videoPreview.appendChild(wrapper);
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
    const urlInput = document.getElementById('prodVideoUrl');
    if (urlInput) urlInput.value = '';
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
    
    const urlInput = document.getElementById('prodVideoUrl');
    if (urlInput) {
        urlInput.value = product.video || '';
    }
    
    if (product.video) {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.margin = '5px';
        fillVideoPreview(wrapper, product.video);
        videoPreview.appendChild(wrapper);
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

    try {
        DB.saveProduct(product);
        hideProductForm();
        loadProducts();
        loadDashboard();
        alert('✅ تم حفظ المنتج بنجاح!');
    } catch (e) {
        if (e.name === 'QuotaExceededError' || (e.code && e.code === 22)) {
            alert('⚠️ عذراً، الذاكرة المحلية للمتصفح ممتلئة!\n\nالحل: قلل عدد الصور في هذا المنتج، أو استخدم روابط صور خارجية (URL) بدلاً من رفع الصور مباشرة من الجهاز.');
        } else {
            alert('حدث خطأ أثناء الحفظ: ' + e.message);
        }
        console.error("Error saving product:", e);
    }
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