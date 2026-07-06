// ============================================================
// wow-features.js — Phase 5: AI Assistant + Surprise Me + Accessibility
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
    bedrooms: { category: 'bedrooms', label: 'غرفة نوم', emoji: '🛏️', tip: 'للحصول على راحة مثالية، اختاري خشب الماليزي KTS للمتانة والتحمل.' },
    sofas: { category: 'sofas', label: 'كنب', emoji: '🛋️', tip: 'الكنب الزاوية المودرن مثالي لغرف المعيشة المفتوحة والواسعة.' },
    curtains: { category: 'curtains', label: 'ستائر', emoji: '🪟', tip: 'الستائر المخملية تعطي لمسة عزل للضوء وفخامة إضافية.' },
    tables: { category: 'tables', label: 'طاولة', emoji: '🍽️', tip: 'طاولات الرخام على الستيل هي الأكثر طلباً في الديكورات الراقية.' },
    blankets: { category: 'blankets', label: 'لحاف', emoji: '🛌', tip: 'اللحافات الفرو الشتوي توفر الدفء الأمثل بجودة ممتازة.' },
    wardrobes: { category: 'wardrobes', label: 'دولاب', emoji: '🚪', tip: 'الدواليب بتصميم تركي أو سويدي توفر مساحات تقسيم رائعة.' },
    kids: { category: 'kids-bedrooms', label: 'غرفة أطفال', emoji: '🧸', tip: 'غرف الأطفال بسريرين توفر المساحة وتأتي بتصاميم مبهجة.' },
};

window.initAIAssistant = () => {
    // Create chat button
    const btn = document.createElement('button');
    btn.id = 'aiChatBtn';
    btn.innerHTML = '<i class="fas fa-robot"></i>';
    btn.title = 'مساعد رونق الذكي';
    btn.onclick = toggleAIChat;

    // Pulse animation and general styles for chat window
    const style = document.createElement('style');
    style.textContent = `
        @keyframes aiPulse {
            0%, 100% { box-shadow: 0 4px 15px rgba(139,0,0,0.4); }
            50% { box-shadow: 0 4px 25px rgba(139,0,0,0.7), 0 0 0 8px rgba(139,0,0,0.1); }
        }
        #aiChatWindow {
            position: fixed; bottom: 220px; left: 25px;
            width: 340px; max-height: 480px;
            background: white; border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.25);
            display: none; flex-direction: column; z-index: 10001;
            overflow: hidden;
            animation: qvFadeIn 0.3s ease;
            font-family: 'Tajawal', sans-serif;
            direction: rtl;
            text-align: right;
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
        .ai-header-info h4 { margin: 0; font-size: 1.1rem; font-weight: bold; }
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
            color: #444;
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
            display: flex; align-items: center; justify-content: center;
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
            <div class="ai-bubble bot">👋 مرحباً بك في رونق همدان!\n\nأنا مساعدك الذكي، كيف يمكنني مساعدتك اليوم؟\n\nيمكنك اختصار الوقت بطلب الردود الجاهزة بالأسفل:</div>
        </div>
        <div class="ai-quick-btns">
            <button class="ai-quick-btn" onclick="sendAIMessage('ما هي أسعاركم؟')">💰 الأسعار</button>
            <button class="ai-quick-btn" onclick="sendAIMessage('تفصيل الأثاث')">🛠️ تفصيل أثاث</button>
            <button class="ai-quick-btn" onclick="sendAIMessage('العروض الحالية')">🏷️ عروض وتخفيضات</button>
            <button class="ai-quick-btn" onclick="sendAIMessage('الشحن والتوصيل للمحافظات')">🚚 التوصيل</button>
            <button class="ai-quick-btn" onclick="sendAIMessage('ضمان المنتجات')">🛡️ الضمان والخدمة</button>
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
    if (!win) return;
    win.classList.toggle('open');
    if (win.classList.contains('open')) {
        document.getElementById('aiInput')?.focus();
    }
};

window.sendAIMessage = (preset = null) => {
    const input = document.getElementById('aiInput');
    const messages = document.getElementById('aiMessages');
    const text = preset || input?.value.trim();
    if (!text || !messages) return;

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
    }, 500); // Super fast interactive response
};

// =====================
// AI CHATBOT LOGIC
// =====================
const getAIResponse = (msg) => {
    const lower = msg.toLowerCase();
    
    if (lower.includes('مرحبا') || lower.includes('هلا') || lower.includes('السلام')) {
        return '👋 أهلاً وسهلاً بك في متجر رونق همدان للأثاث! أنا مساعدك الذكي التفاعلي.\nسعيد بخدمتك، يمكنك سؤالي عن الأسعار، تفصيل الأثاث، الضمان، أو الشحن والتوصيل للمحافظات!';
    }
    if (lower.includes('سعر') || lower.includes('أسعار') || lower.includes('اسعار')) {
        return '💰 نقدم أفضل الأسعار مقابل الجودة الفاخرة في اليمن:\n• غرف النوم الكبيرة: تبدأ من 400,000 ر.ي\n• أطقم الكنب والمجالس: تبدأ من 850,000 ر.ي\n• طاولات الطعام الفاخرة: تبدأ من 450,000 ر.ي\n• الستائر الفخمة: تبدأ من 120,000 ر.ي\n\nتتوفر عروض تخفيضات رائعة حالياً! ما هو المنتج الذي تود معرفة تفاصيل سعره؟';
    }
    if (lower.includes('تفصيل') || lower.includes('فصل') || lower.includes('تصميم') || lower.includes('مجالس') || lower.includes('مجلس')) {
        return '🛠️ تفصيل حسب الطلب:\nنحن متخصصون في تصميم وتفصيل المجالس العربية والتركية، الكنب، وغرف النوم بمقاسات وألوان مخصصة تناسب رغبتك بالكامل!\nنستخدم أفضل الأخشاب مثل خشب السويد الصلب وخشب ام دي اف الماليزي مع دهان مقاوم للخدش، وأفخم الأقمشة التركية المخملية.\n\nتواصل معنا عبر واتساب لمشاركة المقاسات والموديل المطلوب: wa.me/967771219034';
    }
    if (lower.includes('شحن') || lower.includes('توصيل') || lower.includes('محافظات') || lower.includes('صنعاء') || lower.includes('مكان')) {
        return '🚚 الشحن والتوصيل:\n• التوصيل والتركيب مجاني تماماً داخل العاصمة صنعاء!\n• نوفر شحناً سريعاً وآمناً لجميع محافظات اليمن (عدن، تعز، إب، حضرموت، الحديدة، مأرب، ذمار، إلخ) مع ضمان سلامة القطع عند الاستلام والدفع في نفس الوقت.';
    }
    if (lower.includes('ضمان') || lower.includes('كفالة') || lower.includes('الضمان')) {
        return '🛡️ الضمان الذهبي:\nجميع غرف النوم والأثاث الخشبي لدينا يأتي بضمانة فاتورة رسمية لمدة 10 سنوات ضد العيوب المصنعية، وضمانة فك وتركيب لأكثر من 20 مرة لثقتنا العالية في جودة خاماتنا!';
    }
    if (lower.includes('عرض') || lower.includes('العروض') || lower.includes('تخفيض')) {
        return '🏷️ العروض الحالية:\nلدينا تخفيضات مميزة تصل إلى 30% على منتجات مختارة من الكنب وغرف النوم! يمكنك تصفح قسم العروض الخاصة في الصفحة الرئيسية أو صفحة المتجر لمعرفة المنتجات المشمولة بالخصم.';
    }
    if (lower.includes('واتساب') || lower.includes('تواصل') || lower.includes('رقم')) {
        return '📱 يمكنك التواصل الفوري والتحدث معنا مباشرة مع موظفي المبيعات عبر الواتساب على الرقم: <a href="https://wa.me/967771219034" target="_blank" style="color:#25D366; font-weight:bold;"><i class="fab fa-whatsapp"></i> 771219034</a>';
    }

    // Category detection dynamic suggestion
    for (const key of Object.keys(aiKnowledge)) {
        if (lower.includes(key) || lower.includes(aiKnowledge[key].label)) {
            const item = aiKnowledge[key];
            const products = DB.getProducts().filter(p => p.category === item.category || p.category.startsWith(item.category));
            if (products.length > 0) {
                return `${item.emoji} لقد وجدت ${products.length} خياراً مميزاً في قسم ${item.label} لدينا!\n\n💡 نصيحة الخبراء: ${item.tip}\n\n👉 يمكنك تصفحها فوراً من هنا: <a href="shop.html?category=${item.category}" style="color:var(--primary-color); font-weight:bold; text-decoration:underline;">عرض قسم ${item.label}</a>`;
            }
        }
    }

    return '🤔 شكراً لاستفسارك! سأقوم بتوجيه سؤالك لفريق الدعم لخدمتك بشكل أفضل. \n\nيمكنك الاتصال بنا مباشرة أو مراسلتنا على واتساب 📱 <a href="https://wa.me/967771219034" target="_blank" style="color:#25D366; font-weight:bold;">771219034</a> للحصول على إجابة تفصيلية وفورية!';
};

// =====================
// VIRTUAL ROOM (💡 فكرة الغرفة الافتراضية)
// =====================
let selectedRoomItems = {}; // Holds selected product per category/id

window.initSurpriseMe = () => {
    // Surprise me float button
    const btn = document.createElement('button');
    btn.id = 'surpriseMeBtn';
    btn.innerHTML = '🎲';
    btn.title = 'صمم غرفتك الافتراضية (فاجئني)';
    btn.onclick = openSurpriseModal;
    document.body.appendChild(btn);

    // Create virtual room modal container
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
        <div style="background: white; border-radius: 20px; width: 95%; max-width: 900px;
                    max-height: 90vh; overflow-y: auto; padding: 30px;
                    animation: qvFadeIn 0.4s ease; font-family: 'Tajawal', sans-serif; direction:rtl; position:relative;">
            <button onclick="document.getElementById('surpriseModal').style.display='none'"
                style="position:absolute; top:20px; left:20px; background:none; border:none; font-size:1.5rem; cursor:pointer; color:#999; transition:color 0.2s;"
                onmouseenter="this.style.color='#8B0000'" onmouseleave="this.style.color='#999'">
                <i class="fas fa-times"></i>
            </button>
            <div id="surpriseResult"></div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.openSurpriseModal = () => {
    document.getElementById('surpriseModal').style.display = 'flex';
    renderVirtualRoom();
};

window.renderVirtualRoom = () => {
    const result = document.getElementById('surpriseResult');
    if (!result) return;

    const products = DB.getProducts();
    const categories = DB.getCategories();

    // Check total price
    let totalPrice = 0;
    const selectedList = Object.values(selectedRoomItems);
    selectedList.forEach(p => {
        const price = p.discount > 0 ? p.price * (1 - p.discount/100) : p.price;
        totalPrice += price;
    });

    // Generate room canvas HTML
    let roomItemsHtml = '';
    if (selectedList.length === 0) {
        roomItemsHtml = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 70px 20px; border: 2px dashed #d5c8b3; border-radius: 15px; background: rgba(140, 98, 57, 0.03); color: #8C6239;">
                <span style="font-size: 3.5rem; display:block; margin-bottom:15px; animation: aiPulse 2s infinite;">🛋️</span>
                <h4 style="margin-bottom:10px; font-size:1.3rem; font-weight:bold;">رتب غرفتك الآن وتسوق ✨</h4>
                <p style="color:#777; font-size:0.95rem; margin:0;">اختر قطع الأثاث التي تناسب ذوقك من القائمة اليسرى لتشكل غرفتك الافتراضية هنا وتضيفها بالكامل إلى سلتك بضغطة زر!</p>
            </div>
        `;
    } else {
        roomItemsHtml = selectedList.map(p => {
            const price = p.discount > 0 ? p.price * (1 - p.discount/100) : p.price;
            return `
                <div style="background: white; border: 1px solid #eee; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); position:relative; animation: qvFadeIn 0.3s ease;">
                    <img src="${p.images[0]}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px;" alt="${p.name}">
                    <div style="font-size: 0.85rem; font-weight: bold; color: #333; height: 35px; overflow: hidden; line-height: 1.3;">${p.name}</div>
                    <div style="font-weight: bold; color: var(--primary-color); font-size: 0.95rem;">${price.toLocaleString()} ر.ي</div>
                    <div style="display: flex; gap: 5px; margin-top: auto; border-top: 1px solid #f5f5f5; padding-top: 8px;">
                        <button onclick="removeRoomItem('${p.category}')" style="flex:1; background:#ffebeb; color:#e74c3c; border:none; padding:6px; border-radius:6px; font-size:0.75rem; cursor:pointer; font-weight:bold; display:flex; align-items:center; justify-content:center; gap:3px;" title="حذف القطعة"><i class="fas fa-trash-alt"></i> حذف</button>
                        <button onclick="scrollToCategorySelector('${p.category}')" style="flex:1; background:#f0f5ff; color:#3498db; border:none; padding:6px; border-radius:6px; font-size:0.75rem; cursor:pointer; font-weight:bold; display:flex; align-items:center; justify-content:center; gap:3px;" title="تغيير القطعة"><i class="fas fa-exchange-alt"></i> تغيير</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Generate selectors list
    let catalogHtml = '';
    categories.forEach(cat => {
        // Get products belonging to category
        const catProducts = products.filter(p => p.category === cat.id || p.category.startsWith(cat.id + '-'));
        if (catProducts.length > 0) {
            catalogHtml += `
                <div id="selector-cat-${cat.id}" style="margin-bottom:15px; border:1px solid #eee; border-radius:10px; overflow:hidden; background:white;">
                    <div style="background:#fcfaf7; padding:10px 15px; font-weight:bold; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; font-size:0.95rem; color:var(--secondary-color);">
                        <span>📂 ${cat.name}</span>
                        <span style="font-size:0.8rem; background:#eae2d5; padding:2px 8px; border-radius:10px; color:#555;">${catProducts.length}</span>
                    </div>
                    <div style="max-height: 180px; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:8px;">
                        ${catProducts.map(p => {
                            const isSelected = selectedRoomItems[cat.id]?.id === p.id;
                            const price = p.discount > 0 ? p.price * (1 - p.discount/100) : p.price;
                            return `
                                <div style="display:flex; align-items:center; gap:10px; border-bottom:1px solid #f9f9f9; padding-bottom:8px; justify-content:space-between;">
                                    <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
                                        <img src="${p.images[0]}" style="width:40px; height:40px; object-fit:cover; border-radius:5px; flex-shrink:0;">
                                        <div style="min-width:0;">
                                            <div style="font-size:0.8rem; font-weight:bold; color:#333; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.name}</div>
                                            <div style="font-size:0.75rem; color:var(--primary-color); font-weight:bold;">${price.toLocaleString()} ر.ي</div>
                                        </div>
                                    </div>
                                    <button onclick="addRoomItem('${cat.id}', '${p.id}')" style="background:${isSelected ? '#2ecc71' : 'var(--primary-color)'}; color:white; border:none; padding:5px 10px; border-radius:6px; font-size:0.75rem; cursor:pointer; font-weight:bold; flex-shrink:0; display:flex; align-items:center; gap:3px;">
                                        ${isSelected ? '<i class="fas fa-check"></i> مضاف' : '➕ أضف'}
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
    });

    result.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="font-size: 1.8rem; color: var(--dark-gray); display:flex; align-items:center; justify-content:center; gap:10px;">
                <i class="fas fa-magic" style="color:var(--secondary-color)"></i> الغرفة الافتراضية الذكية
            </h2>
            <p style="color: #777; font-size: 0.9rem;">قم بتأثيث وتصميم غرفتك المتكاملة بالكامل وشاهد الأسعار مباشرة!</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; margin-bottom: 20px;">
            <!-- Right Column: Room Canvas -->
            <div style="background: linear-gradient(135deg, #fdfbf8, #f4eee3); border: 2px solid #e2d7c5; border-radius: 15px; padding: 20px; display: flex; flex-direction: column; min-height:400px; box-shadow: inset 0 0 15px rgba(0,0,0,0.02);">
                <div style="border-bottom: 1px solid #e2d7c5; padding-bottom: 10px; margin-bottom: 15px; font-weight: bold; color: var(--secondary-color); font-size: 1rem; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-home"></i> لوحة الغرفة الافتراضية
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; flex-grow: 1; align-content: start;" id="virtualRoomCanvas">
                    ${roomItemsHtml}
                </div>
            </div>

            <!-- Left Column: Catalog Selectors -->
            <div style="max-height: 400px; overflow-y:auto; padding-left:5px;" id="virtualCatalogList">
                ${catalogHtml}
            </div>
        </div>

        <!-- Footer actions and totals -->
        <div style="background: #f8f9fa; border-radius: 12px; padding: 15px 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; border:1px solid #eee;">
            <div>
                <span style="font-size: 0.85rem; color: #666; display:block;">إجمالي سعر الغرفة:</span>
                <span style="font-size: 1.8rem; font-weight: bold; color: var(--primary-color);">${totalPrice.toLocaleString()} ر.ي</span>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap:wrap;">
                <button onclick="addVirtualRoomToCart()" ${selectedList.length === 0 ? 'disabled style="opacity:0.5; cursor:not-allowed; background:#999;"' : ''}
                    style="background: #27ae60; color: white; border: none; padding: 10px 20px;
                           border-radius: 25px; font-size: 0.95rem; font-weight: bold; cursor: pointer;
                           font-family: 'Tajawal', sans-serif; transition: all 0.3s; display:flex; align-items:center; gap:6px;">
                    <i class="fas fa-cart-plus"></i> إضافة الغرفة كاملة للسلة
                </button>
                <button onclick="randomizeVirtualRoom()"
                    style="background: var(--secondary-color); color: white; border: none; padding: 10px 18px;
                           border-radius: 25px; font-size: 0.95rem; font-weight: bold; cursor: pointer;
                           font-family: 'Tajawal', sans-serif; transition: all 0.3s; display:flex; align-items:center; gap:5px;">
                    🎲 تأثيث تلقائي
                </button>
                <button onclick="clearVirtualRoom()"
                    style="background: #e74c3c; color: white; border: none; padding: 10px 18px;
                           border-radius: 25px; font-size: 0.95rem; font-weight: bold; cursor: pointer;
                           font-family: 'Tajawal', sans-serif; transition: all 0.3s;">
                    ❌ تفريغ الغرفة
                </button>
            </div>
        </div>
    `;
};

window.addRoomItem = (categoryId, productId) => {
    const product = DB.getProduct(productId);
    if (product) {
        selectedRoomItems[categoryId] = product;
        renderVirtualRoom();
        if (window.showToast) showToast(`تمت إضافة ${product.name} إلى غرفتك!`, 'success');
    }
};

window.removeRoomItem = (categoryId) => {
    const p = selectedRoomItems[categoryId];
    if (p) {
        delete selectedRoomItems[categoryId];
        renderVirtualRoom();
        if (window.showToast) showToast(`تم إزالة ${p.name} من الغرفة!`, 'success');
    }
};

window.scrollToCategorySelector = (categoryId) => {
    const el = document.getElementById(`selector-cat-${categoryId}`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.border = '2px solid var(--primary-color)';
        setTimeout(() => {
            el.style.border = '1px solid #eee';
        }, 1500);
    }
};

window.randomizeVirtualRoom = () => {
    const products = DB.getProducts();
    const categories = DB.getCategories();
    selectedRoomItems = {};

    categories.forEach(cat => {
        const catProducts = products.filter(p => p.category === cat.id || p.category.startsWith(cat.id + '-'));
        if (catProducts.length > 0) {
            const picked = catProducts[Math.floor(Math.random() * catProducts.length)];
            selectedRoomItems[cat.id] = picked;
        }
    });

    renderVirtualRoom();
    if (window.showToast) showToast('تم تأثيث الغرفة تلقائياً بمنتجات مميزة! 🎲', 'success');
};

window.clearVirtualRoom = () => {
    selectedRoomItems = {};
    renderVirtualRoom();
    if (window.showToast) showToast('تم تفريغ الغرفة الافتراضية بالكامل.', 'success');
};

window.addVirtualRoomToCart = () => {
    const list = Object.values(selectedRoomItems);
    if (list.length === 0) return;

    list.forEach(p => DB.addToCart(p.id, 1));
    
    if (window.updateCartCount) window.updateCartCount();
    if (window.showToast) showToast(`✅ تمت إضافة ${list.length} قطع (غرفة كاملة) إلى السلة!`, 'success');

    // Close modal after brief delay
    setTimeout(() => {
        document.getElementById('surpriseModal').style.display = 'none';
    }, 800);
};

// =====================
// ACCESSIBILITY FEATURES
// =====================
window.initAccessibility = () => {
    // Accessibility toggle button
    const btn = document.createElement('button');
    btn.id = 'accessibilityBtn';
    btn.innerHTML = '<i class="fas fa-universal-access"></i>';
    btn.title = 'خيارات سهولة الوصول للموقع';
    btn.onclick = toggleAccessibilityMenu;
    document.body.appendChild(btn);

    // Accessibility Menu Panel
    const menu = document.createElement('div');
    menu.id = 'accessibilityMenu';
    menu.style.cssText = `
        position: fixed; bottom: 250px; left: -320px;
        width: 290px; background: white; border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        z-index: 10002; padding: 20px; transition: left 0.4s ease;
        font-family: 'Tajawal', sans-serif; border: 1px solid #eee;
        direction: rtl; text-align: right;
    `;
    
    menu.innerHTML = `
        <h3 style="margin-top:0; border-bottom: 2px solid #3498db; padding-bottom:10px; color:#333; font-size:1.05rem; display:flex; justify-content:space-between; align-items:center;">
            <span><i class="fas fa-universal-access"></i> خيارات سهولة الوصول</span>
            <button onclick="toggleAccessibilityMenu()" style="background:none; border:none; font-size:1.1rem; cursor:pointer; color:#999;"><i class="fas fa-times"></i></button>
        </h3>
        <div style="display:flex; flex-direction:column; gap:12px; margin-top:15px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.85rem; color:#555; font-weight:bold;">حجم الخط</span>
                <div style="display:flex; gap:5px;">
                    <button onclick="adjustFontSize(-2)" style="padding:4px 8px; border:1px solid #ccc; background:#f9f9f9; border-radius:5px; cursor:pointer; font-weight:bold;">A-</button>
                    <button onclick="adjustFontSize(0)" style="padding:4px 8px; border:1px solid #ccc; background:#f9f9f9; border-radius:5px; cursor:pointer; font-size:0.8rem;">افتراضي</button>
                    <button onclick="adjustFontSize(2)" style="padding:4px 8px; border:1px solid #ccc; background:#f9f9f9; border-radius:5px; cursor:pointer; font-weight:bold;">A+</button>
                </div>
            </div>
            
            <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; border-top: 1px solid #eee; padding-top: 10px; margin: 0;">
                <span style="font-size:0.85rem; color:#555; font-weight:bold;">تباين عالي (أصفر وأسود)</span>
                <input type="checkbox" id="accContrast" onchange="toggleAccClass('accessibility-contrast', this.checked)">
            </label>
            
            <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; border-top: 1px solid #eee; padding-top: 10px; margin: 0;">
                <span style="font-size:0.85rem; color:#555; font-weight:bold;">خط ميسر للقراءة</span>
                <input type="checkbox" id="accDyslexia" onchange="toggleAccClass('accessibility-dyslexia', this.checked)">
            </label>
            
            <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; border-top: 1px solid #eee; padding-top: 10px; margin: 0;">
                <span style="font-size:0.85rem; color:#555; font-weight:bold;">تمييز وإبراز الروابط</span>
                <input type="checkbox" id="accHighlight" onchange="toggleAccClass('accessibility-highlight-links', this.checked)">
            </label>
            
            <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; border-top: 1px solid #eee; padding-top: 10px; margin: 0;">
                <span style="font-size:0.85rem; color:#555; font-weight:bold;">إيقاف الحركة والأنيميشن</span>
                <input type="checkbox" id="accAnimations" onchange="toggleAccClass('accessibility-stop-animations', this.checked)">
            </label>
            
            <button onclick="resetAccessibility()" style="width:100%; background:#e74c3c; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer; font-weight:bold; margin-top:10px; font-family:'Tajawal',sans-serif;">إعادة تعيين الإعدادات</button>
        </div>
    `;
    
    // Style adjustments for dark mode
    const accStyle = document.createElement('style');
    accStyle.textContent = `
        body.dark-mode #accessibilityMenu { background: #1e1e1e; border-color: #333; }
        body.dark-mode #accessibilityMenu h3 { color: #fff; border-color: #444; }
        body.dark-mode #accessibilityMenu span { color: #ddd; }
        body.dark-mode #accessibilityMenu button { background: #2a2a2a; border-color: #444; color: #fff; }
    `;
    document.head.appendChild(accStyle);
    document.body.appendChild(menu);

    // Load saved settings
    loadAccessibilitySettings();
};

window.toggleAccessibilityMenu = () => {
    const menu = document.getElementById('accessibilityMenu');
    if (!menu) return;
    if (menu.style.left === '25px') {
        menu.style.left = '-320px';
    } else {
        menu.style.left = '25px';
    }
};

let currentFontOffset = 0;
window.adjustFontSize = (offset) => {
    if (offset === 0) {
        currentFontOffset = 0;
    } else {
        currentFontOffset += offset;
        // Limit font offsets
        if (currentFontOffset > 6) currentFontOffset = 6;
        if (currentFontOffset < -4) currentFontOffset = -4;
    }
    
    document.documentElement.style.fontSize = currentFontOffset === 0 ? '' : `calc(100% + ${currentFontOffset}px)`;
    localStorage.setItem('acc_font_offset', currentFontOffset);
};

window.toggleAccClass = (className, enable) => {
    if (enable) {
        document.body.classList.add(className);
    } else {
        document.body.classList.remove(className);
    }
    localStorage.setItem('acc_' + className, enable);
};

window.resetAccessibility = () => {
    // Uncheck all
    document.getElementById('accContrast').checked = false;
    document.getElementById('accDyslexia').checked = false;
    document.getElementById('accHighlight').checked = false;
    document.getElementById('accAnimations').checked = false;

    // Remove all classes
    document.body.classList.remove('accessibility-contrast');
    document.body.classList.remove('accessibility-dyslexia');
    document.body.classList.remove('accessibility-highlight-links');
    document.body.classList.remove('accessibility-stop-animations');

    // Reset font size
    document.documentElement.style.fontSize = '';
    currentFontOffset = 0;

    // Clear localStorage
    localStorage.removeItem('acc_font_offset');
    localStorage.removeItem('acc_accessibility-contrast');
    localStorage.removeItem('acc_accessibility-dyslexia');
    localStorage.removeItem('acc_accessibility-highlight-links');
    localStorage.removeItem('acc_accessibility-stop-animations');

    if (window.showToast) showToast('تمت إعادة تعيين إعدادات سهولة الوصول.', 'success');
};

const loadAccessibilitySettings = () => {
    const savedOffset = parseInt(localStorage.getItem('acc_font_offset')) || 0;
    if (savedOffset !== 0) adjustFontSize(savedOffset);

    const contrast = localStorage.getItem('acc_accessibility-contrast') === 'true';
    if (contrast) {
        const chk = document.getElementById('accContrast');
        if (chk) chk.checked = true;
        toggleAccClass('accessibility-contrast', true);
    }
    
    const dyslexia = localStorage.getItem('acc_accessibility-dyslexia') === 'true';
    if (dyslexia) {
        const chk = document.getElementById('accDyslexia');
        if (chk) chk.checked = true;
        toggleAccClass('accessibility-dyslexia', true);
    }

    const highlight = localStorage.getItem('acc_accessibility-highlight-links') === 'true';
    if (highlight) {
        const chk = document.getElementById('accHighlight');
        if (chk) chk.checked = true;
        toggleAccClass('accessibility-highlight-links', true);
    }

    const animations = localStorage.getItem('acc_accessibility-stop-animations') === 'true';
    if (animations) {
        const chk = document.getElementById('accAnimations');
        if (chk) chk.checked = true;
        toggleAccClass('accessibility-stop-animations', true);
    }
};

// =====================
// INIT ALL
// =====================
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    initAIAssistant();
    initSurpriseMe();
    initAccessibility();
});
