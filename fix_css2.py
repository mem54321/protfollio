import os

css_path = r"c:\Users\maram\new project\css\style.css"

with open(css_path, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

# truncate to line 533 (index 533)
good_lines = lines[:533]

loader_css = """
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
"""

with open(css_path, 'w', encoding='utf-8') as f:
    f.writelines(good_lines)
    f.write(loader_css)

print("Truncated and fixed CSS.")
