import re

with open("src/pages/AboutUs.tsx", "r") as f:
    content = f.read()

# 1. Remove firebase/storage import
content = re.sub(r"import \{ ref, uploadBytes, getDownloadURL \} from 'firebase/storage';\n", "", content)

# 2. Add cloudinary import
if "uploadImageToCloudinary" not in content:
    content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { uploadImageToCloudinary } from '../lib/cloudinary';")

# 3. Replace upload logic
old_logic = """    try {
      const storageRef = ref(storage, `images/founder_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await setDoc(doc(db, 'appSettings', 'founder'), { photoUrl: downloadURL }, { merge: true });
      setFounderPhoto(downloadURL);
      setImgError(false);
      toast.success('Founder photo updated successfully');
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {"""

new_logic = """    try {
      const downloadURL = await uploadImageToCloudinary(file);
      await setDoc(doc(db, 'appSettings', 'founder'), { photoUrl: downloadURL }, { merge: true });
      setFounderPhoto(downloadURL);
      setImgError(false);
      toast.success('Founder photo updated successfully');
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {"""

content = content.replace(old_logic, new_logic)

# Replace storage import from firebase
content = content.replace("import { db, storage } from '../firebase';", "import { db } from '../firebase';")

with open("src/pages/AboutUs.tsx", "w") as f:
    f.write(content)
