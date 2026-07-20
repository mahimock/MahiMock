import re

with open("src/pages/admin/AdminQuestionManager.tsx", "r") as f:
    content = f.read()

# Replace block manually line by line
lines = content.split('\n')
out = []
skip = False
for line in lines:
    if "const fileRef = ref(storage" in line:
        skip = True
        continue
    if skip and "await uploadBytes" in line:
        continue
    if skip and "imageUrl = await getDownloadURL" in line:
        out.append("        imageUrl = await uploadImageToCloudinary(imageFile);")
        skip = False
        continue
    out.append(line)

with open("src/pages/admin/AdminQuestionManager.tsx", "w") as f:
    f.write('\n'.join(out))
