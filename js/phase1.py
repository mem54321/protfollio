import os
import re
import glob

project_dir = r"c:\Users\maram\new project"
html_files = glob.glob(os.path.join(project_dir, "*.html"))

loader_html = """
    <!-- Global Loader -->
    <div id="globalLoader" class="global-loader">
        <div class="loader-spinner"></div>
    </div>
"""

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add loader right after <body>
    if '<div id="globalLoader"' not in content:
        content = re.sub(r'<body[^>]*>', lambda m: m.group(0) + loader_html, content, count=1)

    # Add loading="lazy" to imgs
    def lazy_loader(match):
        img_tag = match.group(0)
        if 'loading=' not in img_tag and 'logo' not in img_tag.lower() and 'hero' not in img_tag.lower():
            if img_tag.endswith('/>'):
                return img_tag[:-2] + ' loading="lazy" />'
            else:
                return img_tag[:-1] + ' loading="lazy">'
        return img_tag

    content = re.sub(r'<img[^>]+>', lazy_loader, content)

    # SEO Tags
    if '<title>' not in content:
        content = re.sub(r'</head>', '    <title>رونق همدان للأثاث</title>\n</head>', content)
    
    if 'meta name="description"' not in content.lower():
        meta_desc = '    <meta name="description" content="متجر رونق همدان لبيع الأثاث الفاخر في اليمن.">\n'
        content = re.sub(r'</title>', '</title>\n' + meta_desc, content, flags=re.IGNORECASE)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Append Loader CSS
css_path = os.path.join(project_dir, "css", "style.css")
with open(css_path, 'a', encoding='utf-8') as f:
    f.write('''
/* Global Loader */
.global-loader {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: var(--white); z-index: 9999;
    display: flex; justify-content: center; align-items: center;
    transition: opacity 0.5s ease, visibility 0.5s;
}
.loader-spinner {
    width: 50px; height: 50px; border: 5px solid var(--gray-color);
    border-top-color: var(--primary-color); border-radius: 50%;
    animation: spin 1s linear infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
body.loaded .global-loader { opacity: 0; visibility: hidden; }
''')

# Append Loader JS
js_path = os.path.join(project_dir, "js", "main.js")
with open(js_path, 'a', encoding='utf-8') as f:
    f.write('''
// Loader Logic
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
''')

print("Phase 1 updates applied successfully.")
