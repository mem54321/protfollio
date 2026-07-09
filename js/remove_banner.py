import os
import glob
import re

project_dir = r"c:\Users\maram\new project"
html_files = glob.glob(os.path.join(project_dir, "*.html"))

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find the banner block which has <!-- Banner / Offers (Animated text) --> and the div
    # We will remove from <!-- Banner to </div> after </marquee>
    # or just remove the whole div if it contains marquee
    new_content = re.sub(r'<!-- Banner / Offers.*?</div>', '', content, flags=re.DOTALL | re.IGNORECASE)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Removed banner from {os.path.basename(filepath)}")

print("Done removing red banners.")
