import re

with open("src/pages/admin/AdminQuestionManager.tsx", "r") as f:
    content = f.read()

# 1. Remove firebase/storage import
content = re.sub(r"import \{ ref, uploadBytes, getDownloadURL \} from 'firebase/storage';\n", "", content)

# 2. Add cloudinary import
if "uploadImageToCloudinary" not in content:
    content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { uploadImageToCloudinary } from '../../lib/cloudinary';")

# 3. Replace upload logic
old_logic = """      let imageUrl = formData.image;
      if (imageFile) {
        const fileRef = ref(storage, `questions/${Date.now()}_${imageFile.name}`);
        await uploadBytes(fileRef, imageFile);
        imageUrl = await getDownloadURL(fileRef);
      }"""

new_logic = """      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }"""

# Fix literal dollar signs because it's in a template literal in TS, so python needs to escape it or I can just use regex.
content = re.sub(r"      let imageUrl = formData\.image;\n      if \(imageFile\) \{\n        const fileRef = ref\(storage, `questions/\$\{Date\.now\(\)\}_\$\{imageFile\.name\}`\);\n        await uploadBytes\(fileRef, imageFile\);\n        imageUrl = await getDownloadURL\(fileRef\);\n      \}", new_logic, content)

# Replace storage import from firebase
content = content.replace("import { db, storage } from '../../firebase';", "import { db } from '../../firebase';")

with open("src/pages/admin/AdminQuestionManager.tsx", "w") as f:
    f.write(content)
