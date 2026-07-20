import re

with open("src/pages/Category.tsx", "r") as f:
    content = f.read()

old_admin = r"const isAdmin = currentUser && \(\s*userProfile\?\.role === 'admin' \|\|\s*currentUser\.email === 'admin@mahimock\.com' \|\|\s*currentUser\.email === 'fmd330629@gmail\.com'\s*\);"
new_admin = "const isAdmin = Boolean(currentUser && userProfile?.role === 'admin');"

content = re.sub(old_admin, new_admin, content)

with open("src/pages/Category.tsx", "w") as f:
    f.write(content)
