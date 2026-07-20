import re

with open("src/pages/MyProfile.tsx", "r") as f:
    content = f.read()

# 1. Remove firebase/storage import
content = re.sub(r"import \{ ref, uploadBytes, getDownloadURL \} from 'firebase/storage';\n", "", content)

# 2. Add cloudinary import
content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { uploadImageToCloudinary } from '../lib/cloudinary';")

# 3. Replace upload logic
old_logic = """    try {
      const storageRef = ref(storage, `users/${currentUser.uid}/profile_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { photoURL: downloadURL }, { merge: true });
      
      await refreshProfile();
      toast.success('Profile photo updated successfully');
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }"""

new_logic = """    try {
      const downloadURL = await uploadImageToCloudinary(file);
      
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { photoURL: downloadURL }, { merge: true });
      
      await refreshProfile();
      toast.success('Profile photo updated successfully');
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }"""

content = content.replace(old_logic, new_logic)

# Replace storage import from firebase
content = content.replace("import { db, storage } from '../firebase';", "import { db } from '../firebase';")

with open("src/pages/MyProfile.tsx", "w") as f:
    f.write(content)
