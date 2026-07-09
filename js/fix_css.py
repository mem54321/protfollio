import os
import re

css_path = r"c:\Users\maram\new project\css\style.css"

with open(css_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# The weird characters look like they have spaces between them, e.g., " . a n n o u n c e m e n t"
# We'll just find the start of the bad block and remove it.
# The bad block starts at "/* Infinite Scroll Animation */" but with spaces.
# Let's just find "/*" followed by spaces or just look for ". a n n o u n c e m e n t"
# Actually, let's just split the file where the bad encoding starts.
# It started around line 534: " / *   I n f i n i t e   S c r o l l"

# Find the index of the first occurrence of " / * " or ". a n n"
idx = content.find(" / *   I n f i n i t e")
if idx == -1:
    idx = content.find(" . a n n o u n c e m e n t - b a r")

if idx != -1:
    # Keep everything before the bad block
    good_content = content[:idx]
    
    # Add back the global loader cleanly
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
    good_content += loader_css
    
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(good_content)
    print("Fixed CSS file.")
else:
    print("Could not find the bad block.")

