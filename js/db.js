// db.js - LocalStorage based Database with Hybrid Firebase Firestore synchronization
const defaultProducts = [
    {
        id: "p_room_malaysian_1",
        name: "غرفة نوم ماليزي (أبو تاج KTS) 7 قطع",
        price: 400000,
        discount: 7.5,
        category: "bedrooms-large",
        description: "المواصفات والمميزات:\n- الجودة: خشب ماليزي (أبو تاج KTS) مع دهان \"تكلير\" حراري ضد الخدش بلمعة السيادة.\n- الملحقات: مفصلات هيدروليك وإضاءة هادئة بـ 3 ألوان.\n- الضمان: ضمانة 10 سنوات + ضمانة فك وتركيب لأكثر من 20 مرة (مسجلة بالفاتورة).\n\nتتكون الغرفة من 7 قطع فخمة:\n1. دولاب (6 أبواب): عرض 240سم × ارتفاع 220سم (تقسيم داخلي واسع).\n2. سرير كينج: مقاس 180×190سم، منجد بأفخم الأقمشة التركية.\n3. تسريحة ملكية: مزودة بصندوق طولي بباب زجاجي أنيق.\n4. كرسي تسريحة.\n5. كمدينو يمين: أدراج واسعة مع درج خاص للإكسسوارات.\n6. كمدينو شمال: بتصميم متناسق وإضاءة مودرن.\n7. أريكة (بوف): بمفصلات مخفية وتحتوي على خزنة سرية.\n\n* التوصيل والتركيب مجاناً.",
        images: [
            "img/a.jpg",
            "img/b.jpg",
            "img/c.jpg",
            "img/d.jpg",
            "img/e.jpg",
            "img/f.jpg",
            "img/g.jpg"
        ],
        rating: 5,
        featured: true
    },
    {
        id: "p1",
        name: "غرفة نوم ملكية فاخرة",
        price: 1500000,
        discount: 10,
        category: "bedrooms",
        description: "غرفة نوم مصممة على الطراز الملكي، تشمل سرير مزدوج، دولاب كبير، وتسريحة فاخرة بتفاصيل ذهبية.",
        images: ["https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=600&q=80"],
        rating: 5,
        featured: true
    },
    {
        id: "p2",
        name: "طقم كنب زاوية مودرن",
        price: 850000,
        discount: 0,
        category: "sofas",
        description: "طقم كنب مريح وعصري، يناسب غرف المعيشة الحديثة، متوفر بألوان متعددة.",
        images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80"],
        rating: 4.5,
        featured: true
    },
    {
        id: "p3",
        name: "طاولة طعام زجاجية",
        price: 450000,
        discount: 15,
        category: "tables",
        description: "طاولة طعام راقية بسطح زجاجي مقاوم للخدش وقاعدة خشبية صلبة، مع 6 كراسي.",
        images: ["https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=600&q=80"],
        rating: 4,
        featured: true
    },
    {
        id: "p4",
        name: "ستائر مخملية كلاسيكية",
        price: 120000,
        discount: 0,
        category: "curtains",
        description: "ستائر فاخرة من المخمل الثقيل لحجب الضوء، تضيف لمسة من الرقي للمجلس.",
        images: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80"],
        rating: 5,
        featured: false
    }
];

const defaultCategories = [
    {
        id: "bedrooms",
        name: "غرف النوم",
        image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=600&q=80",
        subcategories: [
            { id: "bedrooms-modern", name: "غرف نوم مودرن" },
            { id: "bedrooms-swedish", name: "غرف نوم سويدي" },
            { id: "bedrooms-royal", name: "غرف ملكيه" },
            { id: "bedrooms-large", name: "غرف نوم كبيره متعدده القطع" }
        ]
    },
    {
        id: "wardrobes",
        name: "الدواليب",
        image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=600&q=80",
        subcategories: [
            { id: "wardrobes-swedish", name: "دواليب خشب سويدي" },
            { id: "wardrobes-malaysian", name: "دواليب ماليزي" },
            { id: "wardrobes-turkish", name: "دواليب خارجيه تشكيلات تركيه" }
        ]
    },
    {
        id: "blankets",
        name: "لحافات",
        image: "https://images.unsplash.com/photo-1585128792020-803d29415281?auto=format&fit=crop&w=600&q=80",
        subcategories: [
            { id: "blankets-bridal", name: "لحافات عرائسي" },
            { id: "blankets-cotton", name: "لحافات قطن منفوخه نفرين" },
            { id: "blankets-winter", name: "لحافات فرو شتوي ثقيل" },
            { id: "blankets-single", name: "لحافات ابو نفر" },
            { id: "blankets-compressed", name: "لحافات مضغوطه" }
        ]
    },
    {
        id: "kids-bedrooms",
        name: "غرف نوم اطفال",
        image: "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=600&q=80",
        subcategories: [
            { id: "kids-cradles", name: "هناديل" },
            { id: "kids-single", name: "غرف نوم ابو نفر" },
            { id: "kids-multi", name: "غرف نوم سريرين - ثلاثه" },
            { id: "kids-blankets-puffed", name: "لحافات اطفال منفوخ" },
            { id: "kids-blankets-compressed", name: "لحافات مضغوطه" },
            { id: "kids-accessories", name: "اكسسوارات غرف اطفال" }
        ]
    },
    {
        id: "curtains",
        name: "الستائر",
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
        subcategories: [
            { id: "curtains-wavy", name: "ستائر ويفي" },
            { id: "curtains-split", name: "ستائر قسمين تقليديه" },
            { id: "curtains-velvet", name: "ستائر مخمل" }
        ]
    },
    {
        id: "sofas",
        name: "الكنب",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
        subcategories: [
            { id: "sofas-regular", name: "كنب" },
            { id: "sofas-anterooms", name: "انتريهات" }
        ]
    },
    {
        id: "tables",
        name: "الطاولات",
        image: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=600&q=80",
        subcategories: [
            { id: "tables-marble", name: "طاولات رخام على ستيل" },
            { id: "tables-glass", name: "طاولات زجاجيه على ستيل" },
            { id: "tables-wood", name: "طاولات خشب" }
        ]
    }
];

window.DB = {
    init: () => {
        // Initialize products if not exist
        if (!localStorage.getItem('products')) {
            localStorage.setItem('products', JSON.stringify(defaultProducts));
        }
        // Initialize categories if not exist
        if (!localStorage.getItem('categories')) {
            localStorage.setItem('categories', JSON.stringify(defaultCategories));
        }
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]));
        }
        if (!localStorage.getItem('wishlist')) {
            localStorage.setItem('wishlist', JSON.stringify([]));
        }
        if (!localStorage.getItem('orders')) {
            localStorage.setItem('orders', JSON.stringify([]));
        }

        // Asynchronous Firebase initialization and sync
        if (window.isFirebaseEnabled && typeof firebase !== 'undefined' && window.firebaseConfig && window.firebaseConfig.apiKey !== 'YOUR_API_KEY') {
            try {
                if (!firebase.apps.length) {
                    firebase.initializeApp(window.firebaseConfig);
                }
                window.firestoreDb = firebase.firestore();
                if (firebase.storage) {
                    window.firebaseStorage = firebase.storage();
                }
                
                // Fetch products from firestore and update local cache
                window.firestoreDb.collection('products').get().then(snapshot => {
                    if (!snapshot.empty) {
                        const products = [];
                        snapshot.forEach(doc => {
                            const data = doc.data();
                            if (!data.id) data.id = doc.id;
                            products.push(data);
                        });
                        localStorage.setItem('products', JSON.stringify(products));
                    } else {
                        // Upload default products if Firestore is empty
                        const batch = window.firestoreDb.batch();
                        defaultProducts.forEach(p => {
                            const ref = window.firestoreDb.collection('products').doc(p.id);
                            batch.set(ref, p);
                        });
                        batch.commit();
                    }
                    
                    // Fetch orders
                    return window.firestoreDb.collection('orders').get();
                }).then(orderSnapshot => {
                    const orders = [];
                    orderSnapshot.forEach(doc => {
                        const data = doc.data();
                        if (!data.id) data.id = doc.id;
                        orders.push(data);
                    });
                    localStorage.setItem('orders', JSON.stringify(orders));
                    
                    // Dispatch sync ready event
                    document.dispatchEvent(new CustomEvent('db-ready'));
                }).catch(err => {
                    console.error("Firebase sync error:", err);
                });
            } catch (e) {
                console.error("Firebase initialization failed:", e);
            }
        }
    },

    getProducts: () => {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        return [...products].reverse(); // Show newest first
    },

    getProduct: (id) => {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        return products.find(p => p.id === id);
    },

    getCategories: () => JSON.parse(localStorage.getItem('categories')) || [],

    getFeaturedProducts: () => {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        return products.filter(p => p.featured).reverse();
    },

    saveProduct: (product) => {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        if (!product.id) {
            product.id = 'p' + Date.now();
        }
        
        const index = products.findIndex(p => p.id === product.id);
        if (index > -1) products[index] = product;
        else products.push(product);
        
        localStorage.setItem('products', JSON.stringify(products));

        // Sync write to Firestore
        if (window.isFirebaseEnabled && window.firestoreDb) {
            window.firestoreDb.collection('products').doc(product.id).set(product)
                .catch(err => console.error("Error saving product to Firestore:", err));
        }
    },

    deleteProduct: (id) => {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(products));

        // Sync delete from Firestore
        if (window.isFirebaseEnabled && window.firestoreDb) {
            window.firestoreDb.collection('products').doc(id).delete()
                .catch(err => console.error("Error deleting product from Firestore:", err));
        }
    },

    getCart: () => JSON.parse(localStorage.getItem('cart')),

    addToCart: (productId, quantity = 1) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const index = cart.findIndex(item => item.productId === productId);
        if (index > -1) {
            cart[index].quantity += quantity;
        } else {
            cart.push({ productId, quantity });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
    },

    removeFromCart: (productId) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.productId !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
    },

    updateCartQuantity: (productId, quantity) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const index = cart.findIndex(item => item.productId === productId);
        if (index > -1) {
            cart[index].quantity = quantity;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
    },

    clearCart: () => localStorage.setItem('cart', JSON.stringify([])),

    getWishlist: () => JSON.parse(localStorage.getItem('wishlist')) || [],

    toggleWishlist: (productId) => {
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const index = wishlist.indexOf(productId);
        if (index > -1) {
            wishlist.splice(index, 1);
        } else {
            wishlist.push(productId);
        }
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        return wishlist.includes(productId);
    },

    saveOrder: (orderData) => {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const newOrder = {
            id: 'ORD-' + Math.floor(Math.random() * 1000000),
            date: new Date().toISOString(),
            status: 'New', // New, Processing, Delivered, Canceled
            ...orderData
        };
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Sync write to Firestore
        if (window.isFirebaseEnabled && window.firestoreDb) {
            window.firestoreDb.collection('orders').doc(newOrder.id).set(newOrder)
                .catch(err => console.error("Error saving order to Firestore:", err));
        }
        return newOrder.id;
    },

    getOrders: () => JSON.parse(localStorage.getItem('orders')) || [],

    updateOrderStatus: (orderId, status) => {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            localStorage.setItem('orders', JSON.stringify(orders));

            // Sync write to Firestore
            if (window.isFirebaseEnabled && window.firestoreDb) {
                window.firestoreDb.collection('orders').doc(orderId).update({ status: status })
                    .catch(err => console.error("Error updating order status:", err));
            }
        }
    },

    deleteOrder: (orderId) => {
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders = orders.filter(o => o.id !== orderId);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Sync delete from Firestore
        if (window.isFirebaseEnabled && window.firestoreDb) {
            window.firestoreDb.collection('orders').doc(orderId).delete()
                .catch(err => console.error("Error deleting order from Firestore:", err));
        }
    }
};

DB.init();
