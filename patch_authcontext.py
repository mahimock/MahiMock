import re

with open("src/contexts/AuthContext.tsx", "r") as f:
    content = f.read()

# Replace hardcoded isAdmin
old_admin = "const isAdmin = Boolean(currentUser && (currentUser.email === 'admin@vidyexa.com' || currentUser.email === 'fmd330629@gmail.com'));"
new_admin = "const isAdmin = Boolean(userProfile?.role === 'admin');"

content = content.replace(old_admin, new_admin)

with open("src/contexts/AuthContext.tsx", "w") as f:
    f.write(content)
