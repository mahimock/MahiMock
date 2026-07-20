const fs = require('fs');
let code = fs.readFileSync('src/pages/MyProfile.tsx', 'utf8');

const removePhotoFunction = `  const handleRemovePhoto = async () => {
    if (!currentUser) return;
    setUploading(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { photoURL: null }, { merge: true });
      await refreshProfile();
      toast.success('Profile photo removed');
    } catch (error) {
      console.error("Error removing photo:", error);
      toast.error('Failed to remove photo');
    } finally {
      setUploading(false);
    }
  };`;

code = code.replace(
  "const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {",
  removePhotoFunction + "\n\n  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {"
);

const removePhotoButton = `
              {userProfile?.photoURL && !uploading && (
                <button 
                  onClick={handleRemovePhoto}
                  className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-black/50 hover:bg-red-50 dark:hover:bg-red-500/20 text-red-500 rounded-full backdrop-blur-md transition-colors"
                  title="Remove Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
`;

code = code.replace(
  /<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-\[\#5B5FFB\]\/10 to-purple-500\/10 rounded-full -mr-16 -mt-16 blur-2xl"><\/div>/,
  '<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#5B5FFB]/10 to-purple-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>' + removePhotoButton
);

fs.writeFileSync('src/pages/MyProfile.tsx', code);
