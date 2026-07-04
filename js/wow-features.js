// ============================================================
// wow-features.js — Phase 5: AI Assistant + Surprise Me + Dark Mode
// ============================================================

// =====================
// DARK MODE
// =====================
window.initDarkMode = () => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) document.body.classList.add('dark-mode');

    // Create toggle button
    const toggle = document.createElement('button');
    toggle.id = 'darkModeToggle';
    toggle.title = 'الوضع الليلي';
    toggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    toggle.style.cssText = `
        background: none; border: none; font-size: 1.3rem; cursor: pointer;
        color: var(--dark-gray); transition: all 0.3s; padding: 5px;
    `;
    toggle.onclick = () => {
        const dark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', dark);
        toggle.innerHTML = dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    };

    const navIcons = document.querySelector('.nav-icons');
    if (navIcons) navIcons.insertBefore(toggle, navIcons.firstChild);
};

// =====================
// AI ASSISTANT CHAT
// =====================
const aiKnowledge = {
    bedrooms: { category: 'bedrooms', label: 'غرفة نوم', emoji: '🛏️', tip: 'للحصول على راحة مثالية، اختاري خشب الماليزي KTS للمتانة.' },
    sofas: { category: 'sofas', label: 'كنب', emoji: '🛋️', tip: 'الكنب الزاوية المودرن مثالي لغرف المعيشة الواسعة.' },
    curtains: { category: 'curtains', label: 'ستائر', emoji: '🪟', tip: 'الستائر المخملية تعطي لمسة فخامة لا مثيل لها.' },
    tables: { category: 'tables', label: 'طاولة', emoji: '🍽️', tip: 'طاولات الرخام على الستيل هي الأكثر شيوعاً في الديكور الفاخر.' },
    blankets: { category: 'blankets', label: 'لحاف', emoji: '🛌', tip: 'اللحافات المضغوطة خيار ممتاز للتوفير في المساحة.' },
    wardrobes: { category: 'wardrobes', label: 'دولاب', emoji: '🚪', tip: 'الدواليب التركية توفر تصاميم راقية وعصرية.' },
    kids: { category: 'kids-bedrooms', label: 'غرفة أطفال', emoji: '🧸', tip: 'غرف الأطفال المزودة بأسرة علوية توفر المساحة وتضيف متعة للأطفال.' },
};

const aiResponses = {
    'مرحبا': '👋 أهلاً وسهلاً! أنا مساعدك الشخصي في رونق همدان. كيف يمكنني مساعدتك اليوم?\n\nيمكنني:\n• اقتراح أثاث مناسب لميزانيتك\n• مساعدتك في اختيار غرفتك المثالية\n• الإجابة على أسئلتك عن منتجاتنا',
    'هلا': '👋 هلا وغلا! كيف أقدر أساعدك في اختيار أثاثك المثالي؟',
    'السعر': '💰 لدينا تشكيلة واسعة تناسب جميع الميزانيات:\n• الستائر: تبدأ من 120,000 ر.ي\n• الكنب: تبدأ من 850,000 ر.ي\n• غرف النوم: تبدأ من 400,000 ر.ي\n• الطاولات: تبدأ من 450,000 ر.ي\n\nما هي ميزانيتك التقريبية؟',
    'شحن': '🚚 نوفر توصيل وتركيب مجاني داخل صنعاء! للمناطق الأخرى، تواصل معنا على واتساب.',
    'ضمان': '🛡️ نقدم ضمانة 10 سنوات كاملة على جميع منتجاتنا، مع ضمان فك وتركيب لأكثر من 20 مرة!',
    'كنب': '🛋️ لدينا أجمل تشكيلة كنب! من الكنب الزاوية المودرن إلى الأنتريهات الكلاسيكية.\n\nهل تفضل:\n• كنب مودرن عصري\n• كنب كلاسيكي أنيق\n• أنتريه كاملة',
    'غرفة نوم': '🛏️ تشكيلتنا من غرف النوم رائعة! لدينا:\n• غرف ماليزي KTS فاخرة (7 قطع)\n• غرف سويدي عصرية\n• غرف ملكية بتفاصيل ذهبية\n• غرف أطفال مميزة\n\nأي نوع يناسبك؟',
    'ستار': '🪟 ستائرنا المخملية والويفي والكلاسيكية ستحول غرفتك! ابدأي التسوق الآن.',
    'طاولة': '🍽️ طاولاتنا من أجود الخامات:\n• رخام على الستيل\n• زجاج مقسى\n• خشب أصلي\n\nكلها بتصاميم عصرية فاخرة.',
    'توصيل': '🚚 التوصيل والتركيب مجاني داخل صنعاء 💚',
    'واتساب': '📱 تواصل معنا مباشرة: wa.me/967771219034',
};

const getAIResponse = (msg) => {
    const lower = msg.toLowerCase();
    for (const key of Object.keys(aiResponses)) {
        if (lower.includes(key)) return aiResponses[key];
    }
    // Category detection
    for (const key of Object.keys(aiKnowledge)) {
        if (lower.includes(key) || lower.includes(aiKnowledge[key].label)) {
            const item = aiKnowledge[key];
            const products = DB.getProducts().filter(p => p.category === item.category || p.category.startsWith(item.category));
            if (products.length > 0) {
                return `${item.emoji} وجدت ${products.length} منتج في قسم ${item.label}!\n\n💡 نصيحة: ${item.tip}\n\nانقر هنا لعرض المنتجات: <a href="shop.html?category=${item.category}" style="color:var(--primary-color); font-weight:bold;">تصفح ${item.label}</a>`;
            }
        }
    }
    // Budget detection
    const budgetMatch = msg.match(/(\d[\d,]*)\s*(ريال|ر\.ي|الف|ألف)?/);
    if (budgetMatch) {
        const budget = parseInt(budgetMatch[1].replace(/,/g, '')) * (msg.includes('الف') || msg.includes('ألف') ? 1000 : 1);
        const products = DB.getProducts().filter(p => {
            const price = p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;
            return price <= budget;
        });
        if (products.length > 0) {
            return `✨ وجدت ${products.length} منتج ضمن ميزانيتك!\n\nإليك بعض الخيارات المميزة:\n${products.slice(0, 3).map(p => `• <a href="product.html?id=${p.id}" style="color:var(--primary-color);">${p.name}</a> - ${(p.discount > 0 ? p.price*(1-p.discount/100) : p.price).toLocaleString()} ر.ي`).join('\n')}`;
        }
        return `😊 ميزانيتك ${budget.toLocaleString()} ر.ي — سأبحث عن الأنسب لك! تواصل معنا على <a href="https://wa.me/967771219034" target="_blank" style="color:#25D366;">واتساب</a> للمساعدة الشخصية.`;
    }
    return '🤔 شكراً لسؤالك! يمكنني مساعدتك في:\n\n• اختيار غرفة النوم المناسبة\n• مقارنة الأسعار والجودة\n• معرفة تفاصيل الشحن والضمان\n• اقتراح أثاث بحسب ميزانيتك\n\nما الذي تبحث عنه تحديداً؟';
};

window.initAIAssistant = () => {
    // Create chat button
    const btn = document.createElement('button');
    btn.id = 'aiChatBtn';
    btn.innerHTML = '<i class="fas fa-robot"></i>';
    btn.title = 'مساعد رونق الذكي';
    btn.style.cssText = `
        position: fixed; bottom: 185px; left: 25px;
        width: 55px; height: 55px; border-radius: 50%; border: none;
        background: linear-gradient(135deg, #8B0000, #8C6239);
        color: white; font-size: 1.5rem; cursor: pointer; z-index: 999;
        box-shadow: 0 5px 20px rgba(139,0,0,0.4);
        transition: all 0.3s;
        animation: aiPulse 2.5s ease-in-out infinite;
    `;
    btn.onclick = toggleAIChat;

    // Pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes aiPulse {
            0%, 100% { box-shadow: 0 5px 20px rgba(139,0,0,0.4); }
            50% { box-shadow: 0 5px 30px rgba(139,0,0,0.7), 0 0 0 8px rgba(139,0,0,0.1); }
        }
        #aiChatWindow {
            position: fixed; bottom: 250px; left: 25px;
            width: 340px; max-height: 480px;
            background: white; border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.25);
            display: none; flex-direction: column; z-index: 1000;
            overflow: hidden;
            animation: qvFadeIn 0.3s ease;
            font-family: 'Tajawal', sans-serif;
        }
        #aiChatWindow.open { display: flex; }
        .ai-header {
            background: linear-gradient(135deg, #8B0000, #8C6239);
            color: white; padding: 15px 20px;
            display: flex; align-items: center; gap: 12px;
        }
        .ai-header-avatar {
            width: 40px; height: 40px; background: rgba(255,255,255,0.2);
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            font-size: 1.3rem;
        }
        .ai-header-info h4 { margin: 0; font-size: 1rem; }
        .ai-header-info p { margin: 0; font-size: 0.75rem; opacity: 0.8; }
        .ai-header-close { margin-right: auto; background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; }
        .ai-messages {
            flex: 1; padding: 15px; overflow-y: auto;
            display: flex; flex-direction: column; gap: 12px;
            min-height: 250px; max-height: 320px;
            background: #f8f9fa;
        }
        .ai-bubble {
            max-width: 85%; padding: 10px 14px; border-radius: 18px;
            line-height: 1.6; font-size: 0.9rem; white-space: pre-line;
            word-break: break-word;
        }
        .ai-bubble.bot {
            background: white; color: #333;
            border-radius: 5px 18px 18px 18px;
            align-self: flex-start;
            box-shadow: 0 2px 10px rgba(0,0,0,0.07);
        }
        .ai-bubble.user {
            background: linear-gradient(135deg, #8B0000, #8C6239);
            color: white; border-radius: 18px 5px 18px 18px;
            align-self: flex-end;
        }
        .ai-quick-btns {
            padding: 8px 15px; display: flex; gap: 8px; flex-wrap: wrap;
            border-top: 1px solid #eee; background: white;
        }
        .ai-quick-btn {
            background: #f5f5f5; border: 1px solid #ddd; border-radius: 20px;
            padding: 5px 12px; font-size: 0.8rem; cursor: pointer;
            transition: all 0.2s; font-family: 'Tajawal', sans-serif;
        }
        .ai-quick-btn:hover { background: var(--primary-color, #8B0000); color: white; border-color: transparent; }
        .ai-input-area {
            padding: 12px 15px; background: white;
            display: flex; gap: 10px; border-top: 1px solid #eee;
        }
        .ai-input-area input {
            flex: 1; border: 1px solid #ddd; border-radius: 25px;
            padding: 8px 15px; outline: none; font-family: 'Tajawal', sans-serif;
            font-size: 0.9rem;
        }
        .ai-input-area button {
            background: linear-gradient(135deg, #8B0000, #8C6239);
            color: white; border: none; border-radius: 50%;
            width: 38px; height: 38px; cursor: pointer; font-size: 1rem;
            transition: all 0.2s; flex-shrink: 0;
        }
        .ai-input-area button:hover { transform: scale(1.1); }
        .ai-typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px; }
        .ai-typing span { width: 8px; height: 8px; background: #aaa; border-radius: 50%; animation: typingDot 1.4s infinite; }
        .ai-typing span:nth-child(2) { animation-delay: 0.2s; }
        .ai-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingDot { 0%, 100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-4px); opacity: 1; } }
        body.dark-mode #aiChatWindow { background: #1e1e1e; }
        body.dark-mode .ai-messages { background: #121212; }
        body.dark-mode .ai-bubble.bot { background: #2a2a2a; color: #e0e0e0; }
        body.dark-mode .ai-quick-btns, body.dark-mode .ai-input-area { background: #1e1e1e; border-color: #333; }
        body.dark-mode .ai-quick-btn { background: #2a2a2a; border-color: #444; color: #e0e0e0; }
        body.dark-mode .ai-input-area input { background: #2a2a2a; border-color: #444; color: white; }
    `;
    document.head.appendChild(style);

    // Create chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'aiChatWindow';
    chatWindow.innerHTML = `
        <div class="ai-header">
            <div class="ai-header-avatar"><i class="fas fa-robot"></i></div>
            <div class="ai-header-info">
                <h4>مساعد رونق الذكي ✨</h4>
                <p>🟢 متصل الآن · مساعدك للأثاث الفاخر</p>
            </div>
            <button class="ai-header-close" onclick="toggleAIChat()"><i class="fas fa-times"></i></button>
        </div>
        <div class="ai-messages" id="aiMessages">
            <div class="ai-bubble bot">👋 مرحباً بك في رونق همدان!\n\nأنا مساعدك الذكي، يمكنني:\n• اقتراح أثاث بحسب ميزانيتك\n• الإجابة على أسئلتك عن المنتجات\n• مساعدتك في تصميم غرفتك المثالية\n\nكيف يمكنني مساعدتك؟</div>
        </div>
        <div class="ai-quick-btns">
            <button class="ai-quick-btn" onclick="sendAIMessage('ما هي أسعاركم؟')">💰 الأسعار</button>
            <button class="ai-quick-btn" onclick="sendAIMessage('غرفة نوم فاخرة')">🛏️ غرف النوم</button>
            <button class="ai-quick-btn" onclick="sendAIMessage('كنب مريح')">🛋️ الكنب</button>
            <button class="ai-quick-btn" onclick="sendAIMessage('الشحن والتوصيل')">🚚 التوصيل</button>
            <button class="ai-quick-btn" onclick="sendAIMessage('ضمان المنتجات')">🛡️ الضمان</button>
        </div>
        <div class="ai-input-area">
            <input type="text" id="aiInput" placeholder="اكتب سؤالك هنا..." onkeypress="if(event.key==='Enter') sendAIMessage()">
            <button onclick="sendAIMessage()"><i class="fas fa-paper-plane"></i></button>
        </div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(chatWindow);
};

window.toggleAIChat = () => {
    const win = document.getElementById('aiChatWindow');
    win.classList.toggle('open');
    if (win.classList.contains('open')) {
        document.getElementById('aiInput')?.focus();
    }
};

window.sendAIMessage = (preset = null) => {
    const input = document.getElementById('aiInput');
    const messages = document.getElementById('aiMessages');
    const text = preset || input?.value.trim();
    if (!text) return;

    // Add user bubble
    messages.innerHTML += `<div class="ai-bubble user">${text}</div>`;
    if (input) input.value = '';

    // Show typing indicator
    const typingId = 'typing_' + Date.now();
    messages.innerHTML += `<div class="ai-bubble bot ai-typing" id="${typingId}"><span></span><span></span><span></span></div>`;
    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {
        const typing = document.getElementById(typingId);
        if (typing) typing.remove();

        const response = getAIResponse(text);
        messages.innerHTML += `<div class="ai-bubble bot">${response}</div>`;
        messages.scrollTop = messages.scrollHeight;
    }, 900);
};

// =====================
// SURPRISE ME — Build a Complete Room
// =====================
const roomTemplates = {
    modern: {
        label: 'غرفة عصرية مودرن',
        emoji: '🏠',
        categories: ['bedrooms', 'sofas', 'tables', 'curtains'],
        description: 'تصميم معاصر يجمع بين البساطة والأناقة.'
    },
    classic: {
        label: 'غرفة كلاسيكية فاخرة',
        emoji: '👑',
        categories: ['bedrooms', 'curtains', 'blankets'],
        description: 'روعة الكلاسيك بلمسة فخامة لا تُقاوم.'
    },
    family: {
        label: 'غرفة عائلية متكاملة',
        emoji: '👨‍👩‍👧',
        categories: ['sofas', 'tables', 'curtains', 'kids-bedrooms'],
        description: 'مساحة دافئة تجمع العائلة بكل راحة وأناقة.'
    },
    minimal: {
        label: 'غرفة مينيمال أنيقة',
        emoji: '✨',
        categories: ['bedrooms', 'wardrobes', 'tables'],
        description: 'أقل هو أكثر — بساطة راقية تمنح راحة البال.'
    }
};

window.initSurpriseMe = () => {
    const btn = document.createElement('button');
    btn.id = 'surpriseMeBtn';
    btn.innerHTML = '🎲 فاجئني!';
    btn.style.cssText = `
        position: fixed; bottom: 250px; right: 25px;
        background: linear-gradient(135deg, #8C6239, #8B0000);
        color: white; border: none; border-radius: 30px;
        padding: 12px 22px; font-size: 1rem; font-weight: bold;
        cursor: pointer; z-index: 999;
        box-shadow: 0 8px 25px rgba(140,98,57,0.4);
        font-family: 'Tajawal', sans-serif;
        transition: all 0.3s;
        writing-mode: vertical-rl;
        text-orientation: mixed;
    `;
    btn.onmouseenter = () => btn.style.transform = 'scale(1.08) translateY(-3px)';
    btn.onmouseleave = () => btn.style.transform = 'scale(1) translateY(0)';
    btn.onclick = openSurpriseModal;
    document.body.appendChild(btn);

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'surpriseModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.7); z-index: 12000;
        display: none; justify-content: center; align-items: center;
        backdrop-filter: blur(8px);
    `;
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; width: 90%; max-width: 750px;
                    max-height: 90vh; overflow-y: auto; padding: 40px;
                    animation: qvFadeIn 0.4s ease; font-family: 'Tajawal', sans-serif;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="font-size: 2rem; color: #333;">🎲 فاجئني! اختر طابع غرفتك</h2>
                <p style="color: #888;">سنقترح لك تشكيلة متكاملة من أجود منتجاتنا</p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; margin-bottom: 30px;">
                ${Object.entries(roomTemplates).map(([key, t]) => `
                    <button onclick="generateRoom('${key}')" style="
                        background: linear-gradient(135deg, #f8f8f8, #efefef);
                        border: 2px solid #eee; border-radius: 15px; padding: 20px 15px;
                        cursor: pointer; font-family: 'Tajawal', sans-serif;
                        transition: all 0.3s; text-align: center;
                    " onmouseenter="this.style.borderColor='#8B0000'; this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 25px rgba(139,0,0,0.15)'"
                       onmouseleave="this.style.borderColor='#eee'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <div style="font-size: 2.5rem; margin-bottom: 8px;">${t.emoji}</div>
                        <div style="font-weight: bold; color: #333; font-size: 0.95rem;">${t.label}</div>
                    </button>
                `).join('')}
            </div>
            <div id="surpriseResult" style="display: none;"></div>
            <div style="text-align: center; margin-top: 10px;">
                <button onclick="document.getElementById('surpriseModal').style.display='none'"
                    style="background: none; border: 1px solid #ddd; border-radius: 25px;
                           padding: 10px 25px; cursor: pointer; font-family: 'Tajawal', sans-serif; color: #888;">
                    إغلاق
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.openSurpriseModal = () => {
    document.getElementById('surpriseModal').style.display = 'flex';
    document.getElementById('surpriseResult').style.display = 'none';
};

window.generateRoom = (templateKey) => {
    const template = roomTemplates[templateKey];
    const allProducts = DB.getProducts();
    let totalPrice = 0;
    let html = `
        <div style="border-top: 2px solid #f0f0f0; padding-top: 25px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <span style="font-size: 2rem;">${template.emoji}</span>
                <h3 style="color: #333; margin: 10px 0 5px;">${template.label}</h3>
                <p style="color: #888; font-size: 0.9rem;">${template.description}</p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
    `;

    const selected = [];
    template.categories.forEach(cat => {
        const catProducts = allProducts.filter(p => p.category === cat || p.category.startsWith(cat));
        if (catProducts.length > 0) {
            const picked = catProducts[Math.floor(Math.random() * catProducts.length)];
            selected.push(picked);
            const price = picked.discount > 0 ? picked.price * (1 - picked.discount / 100) : picked.price;
            totalPrice += price;
            html += `
                <a href="product.html?id=${picked.id}" style="text-decoration:none; color:inherit;">
                    <div style="border-radius: 12px; overflow: hidden; border: 1px solid #f0f0f0;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.07); transition: transform 0.3s;"
                         onmouseenter="this.style.transform='translateY(-5px)'"
                         onmouseleave="this.style.transform='translateY(0)'">
                        <img src="${picked.images[0]}" style="width:100%; height:130px; object-fit:cover;" alt="${picked.name}">
                        <div style="padding: 10px;">
                            <p style="font-size: 0.85rem; font-weight: bold; color: #333; margin:0 0 5px; height:35px; overflow:hidden;">${picked.name}</p>
                            <p style="color: #8B0000; font-weight: bold; font-size: 0.9rem; margin:0;">${price.toLocaleString()} ر.ي</p>
                        </div>
                    </div>
                </a>
            `;
        }
    });

    html += `</div>
        <div style="background: linear-gradient(135deg, #f8f8f8, #efefef); border-radius: 15px; padding: 20px; text-align: center;">
            <p style="font-size: 1rem; color: #666; margin-bottom: 5px;">إجمالي تكلفة الغرفة المقترحة</p>
            <p style="font-size: 2rem; font-weight: bold; color: #8B0000; margin: 0;">${totalPrice.toLocaleString()} ر.ي</p>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: center;">
            <button onclick="addRoomToCart(${JSON.stringify(selected.map(p => p.id))})"
                style="background: #8B0000; color: white; border: none; padding: 12px 30px;
                       border-radius: 25px; font-size: 1rem; font-weight: bold; cursor: pointer;
                       font-family: 'Tajawal', sans-serif; transition: all 0.3s;"
                onmouseenter="this.style.background='#660000'"
                onmouseleave="this.style.background='#8B0000'">
                🛒 أضف الكل للسلة
            </button>
            <button onclick="generateRoom('${templateKey}')"
                style="background: #8C6239; color: white; border: none; padding: 12px 25px;
                       border-radius: 25px; font-size: 1rem; cursor: pointer;
                       font-family: 'Tajawal', sans-serif; transition: all 0.3s;"
                onmouseenter="this.style.background='#6b4a2b'"
                onmouseleave="this.style.background='#8C6239'">
                🔄 فاجئني مجدداً
            </button>
        </div>
    </div>`;

    const result = document.getElementById('surpriseResult');
    result.innerHTML = html;
    result.style.display = 'block';
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.addRoomToCart = (productIds) => {
    productIds.forEach(id => DB.addToCart(id, 1));
    if (window.updateCartCount) window.updateCartCount();
    if (window.showToast) showToast(`✅ تمت إضافة ${productIds.length} منتجات للسلة!`, 'success');
    setTimeout(() => { document.getElementById('surpriseModal').style.display = 'none'; }, 1000);
};

// =====================
// INIT ALL
// =====================
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    initAIAssistant();
    initSurpriseMe();
});
