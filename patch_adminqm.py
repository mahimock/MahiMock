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
        const fileRef = ref(storage, `questions/${testId}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(fileRef, imageFile);
        imageUrl = await getDownloadURL(fileRef);
      }"""

new_logic = """      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }"""

content = content.replace(old_logic, new_logic)

# Replace storage import from firebase
content = content.replace("import { db, storage } from '../../firebase';", "import { db } from '../../firebase';")

with open("src/pages/admin/AdminQuestionManager.tsx", "w") as f:
    f.write(content)
