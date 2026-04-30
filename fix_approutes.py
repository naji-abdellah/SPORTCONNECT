# fix_approutes.py
import re

base = r"C:\Users\DELL\CAREER\GLD\S4\APPLICATION NATIVE CLOUD\sportconnect-docker"

# ─── 1. App.js ────────────────────────────────────────────────────────
app_path = base + r"\frontend\src\App.js"
with open(app_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "import Performance from './pages/Performance';",
    "import Performance from './pages/Performance';\nimport Connections from './pages/Connections';"
)

content = content.replace(
    "<Route path=\"/performance\" element={<PrivateRoute><Performance /></PrivateRoute>} />",
    "<Route path=\"/performance\" element={<PrivateRoute><Performance /></PrivateRoute>} />\n        <Route path=\"/connections\" element={<PrivateRoute><Connections /></PrivateRoute>} />"
)

with open(app_path, "w", encoding="utf-8") as f:
    f.write(content)

print("App.js updated!")

# ─── 2. Navbar ────────────────────────────────────────────────────────
navbar_path = base + r"\frontend\src\components\Navbar.js"
with open(navbar_path, "r", encoding="utf-8") as f:
    nav = f.read()

# Add connections link after partners
nav = nav.replace(
    "/partners",
    "/partners"
)

# Find the partners nav link and add connections after it
if "/connections" not in nav:
    nav = re.sub(
        r"(.*?/partners.*?\n)",
        lambda m: m.group(0) + m.group(0).replace("/partners", "/connections").replace("Partners", "Connections"),
        nav,
        count=1
    )

with open(navbar_path, "w", encoding="utf-8") as f:
    f.write(nav)

print("Navbar updated!")