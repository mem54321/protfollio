import os
import re
import glob

project_dir = r"c:\Users\maram\new project"
html_files = glob.glob(os.path.join(project_dir, "*.html"))

floating_buttons_html = """
    <!-- Floating Buttons -->
    <a href="https://wa.me/967771219034" target="_blank" class="float-whatsapp">
        <i class="fab fa-whatsapp"></i>
    </a>
    <button id="backToTop" class="float-top" onclick="window.scrollTo({top:0, behavior:'smooth'})">
        <i class="fas fa-arrow-up"></i>
    </button>
"""

# 1. Inject floating buttons to all HTML files
for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if '<a href="https://wa.me/967771219034" target="_blank" class="float-whatsapp">' not in content:
        content = re.sub(r'</body>', floating_buttons_html + '\n</body>', content, flags=re.IGNORECASE)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

# 2. Modify index.html specifically
index_path = os.path.join(project_dir, "index.html")
with open(index_path, 'r', encoding='utf-8') as f:
    index_content = f.read()

featured_section_pattern = r'<!-- Featured Products Section -->.*?</section>'
new_sections = """
    <!-- Offers & Sale Section (With Countdown) -->
    <section class="products" style="background: #fff8f8;">
        <h2 class="section-title">🔥 عروض خاصة 🔥</h2>
        <div id="countdown" style="text-align: center; margin-bottom: 20px; font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">
            ينتهي العرض خلال: <span id="timer">23:59:59</span>
        </div>
        <div class="product-grid" id="saleProducts">
            <!-- Products will be injected here via JS -->
        </div>
    </section>

    <!-- Featured Products Section -->
    <section class="products">
        <h2 class="section-title">المنتجات المميزة</h2>
        <div class="product-grid" id="featuredProducts">
            <!-- Products will be injected here via JS -->
        </div>
    </section>

    <!-- New Arrivals Section -->
    <section class="products" style="background-color: var(--white);">
        <h2 class="section-title">وصل حديثاً</h2>
        <div class="product-grid" id="newProducts">
            <!-- Products will be injected here via JS -->
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <a href="shop.html" class="btn-secondary">عرض كل المنتجات</a>
        </div>
    </section>
"""

if '<!-- Offers & Sale Section (With Countdown) -->' not in index_content:
    index_content = re.sub(featured_section_pattern, new_sections, index_content, flags=re.DOTALL)
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(index_content)

# 3. Append CSS for floating buttons and responsive fixes
css_path = os.path.join(project_dir, "css", "style.css")
with open(css_path, 'a', encoding='utf-8') as f:
    f.write('''
/* Floating Buttons */
.float-whatsapp {
    position: fixed; bottom: 20px; left: 20px;
    background-color: #25d366; color: #fff;
    width: 60px; height: 60px; border-radius: 50%;
    display: flex; justify-content: center; align-items: center;
    font-size: 35px; box-shadow: 0px 4px 10px rgba(0,0,0,0.3);
    z-index: 1000; transition: transform 0.3s;
}
.float-whatsapp:hover { transform: scale(1.1); color: #fff; }

.float-top {
    position: fixed; bottom: 20px; right: 20px;
    background-color: var(--primary-color); color: #fff;
    width: 50px; height: 50px; border-radius: 50%;
    display: flex; justify-content: center; align-items: center;
    font-size: 20px; border: none; cursor: pointer;
    box-shadow: 0px 4px 10px rgba(0,0,0,0.3);
    z-index: 1000; transition: all 0.3s; opacity: 0; visibility: hidden;
}
.float-top.show { opacity: 1; visibility: visible; }
.float-top:hover { background-color: var(--secondary-color); transform: translateY(-3px); }

/* Responsive Improvements */
@media (max-width: 768px) {
    .product-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .product-title { font-size: 0.9rem; }
    .product-price { font-size: 1rem; flex-direction: column; align-items: flex-start; gap: 0; }
    .product-actions { flex-direction: column; }
    .btn-cart { width: 100%; justify-content: center; }
    .hero h1 { font-size: 1.8rem; }
    .hero p { font-size: 1rem; }
    .section-title { font-size: 1.8rem; margin: 30px 0 20px; }
    .navbar { padding: 10px 5%; }
}
@media (max-width: 480px) {
    .product-grid { grid-template-columns: 1fr; }
}
''')

# 4. Append JS for Back to Top and Countdown and Homepage Sections
js_path = os.path.join(project_dir, "js", "main.js")
with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

new_js = '''
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
'''

if '// Back to Top functionality' not in js_content:
    with open(js_path, 'a', encoding='utf-8') as f:
        f.write(new_js)

print("Phase 2 core scripts injected.")
