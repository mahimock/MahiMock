import re

with open("src/components/AdminRoute.tsx", "r") as f:
    content = f.read()

# Replace hardcoded isAdmin
old_admin = r"const isAdmin = currentUser && \(\s*userProfile\?\.role === 'admin' \|\|\s*currentUser\.email === 'admin@mahimock\.com' \|\|\s*currentUser\.email === 'fmd330629@gmail\.com'\s*\);"
new_admin = "const isAdmin = currentUser && userProfile?.role === 'admin';"

content = re.sub(old_admin, new_admin, content)

with open("src/components/AdminRoute.tsx", "w") as f:
    f.write(content)
