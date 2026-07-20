import re

with open("src/pages/admin/AdminQuestionManager.tsx", "r") as f:
    content = f.read()

# Try a simpler replacement since the regex might have been strict
old_block = r"const fileRef = ref\(storage, `questions/\$\{Date\.now\(\)\}_\$\{imageFile\.name\}`\);\n\s*await uploadBytes\(fileRef, imageFile\);\n\s*imageUrl = await getDownloadURL\(fileRef\);"
new_block = r"imageUrl = await uploadImageToCloudinary(imageFile);"

content = re.sub(old_block, new_block, content)

with open("src/pages/admin/AdminQuestionManager.tsx", "w") as f:
    f.write(content)
