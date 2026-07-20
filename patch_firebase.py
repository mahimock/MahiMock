import re

with open("src/firebase.ts", "r") as f:
    content = f.read()

# Remove firebase/storage import
content = re.sub(r"import \{ getStorage \} from \"firebase/storage\";\n", "", content)

# Remove export const storage
content = re.sub(r"export const storage = getStorage\(app\);\n", "", content)

with open("src/firebase.ts", "w") as f:
    f.write(content)
