const fs = require('fs');
let code = fs.readFileSync('src/pages/AboutUs.tsx', 'utf8');

code = code.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';"
);

code = code.replace(
  "import { Target, Eye, User, Mail, Globe, CheckCircle2, Facebook, Instagram, Youtube, Rocket, Laptop, Heart } from 'lucide-react';",
  "import { Target, Eye, User, Mail, Globe, CheckCircle2, Facebook, Instagram, Youtube, Rocket, Laptop, Heart, Camera, Loader2 } from 'lucide-react';\nimport { useAuth } from '../contexts/AuthContext';\nimport { db, storage } from '../firebase';\nimport { doc, getDoc, setDoc } from 'firebase/firestore';\nimport { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';\nimport toast from 'react-hot-toast';"
);

const newComponentLogic = `export default function AboutUs() {
  const [imgError, setImgError] = useState(false);
  const { isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [founderPhoto, setFounderPhoto] = useState<string>('/founder.jpg');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const docRef = doc(db, 'appSettings', 'founder');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().photoUrl) {
          setFounderPhoto(docSnap.data().photoUrl);
          setImgError(false);
        }
      } catch (error) {
        console.error("Error fetching founder photo:", error);
      }
    };
    fetchPhoto();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, \`images/founder_\${Date.now()}_\${file.name}\`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {},
        (error) => {
          console.error("Upload error:", error);
          toast.error('Failed to upload image');
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await setDoc(doc(db, 'appSettings', 'founder'), { photoUrl: downloadURL }, { merge: true });
          setFounderPhoto(downloadURL);
          setImgError(false);
          toast.success('Founder photo updated successfully');
          setUploading(false);
        }
      );
    } catch (error) {
      console.error("Error initiating upload:", error);
      toast.error('Failed to upload image');
      setUploading(false);
    }
  };`;

code = code.replace(
  "export default function AboutUs() {\n  const [imgError, setImgError] = useState(false);",
  newComponentLogic
);

const newAvatarSection = `{/* Founder Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md flex-shrink-0 flex items-center justify-center group relative">
                {!imgError ? (
                  <img 
                    src={founderPhoto} 
                    alt="Mohammad Faizal" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <User className="w-20 h-20 text-white/80" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              {/* Admin Upload Button */}
              {isAdmin && (
                <div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handlePhotoUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-full text-white text-sm font-medium transition-colors"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    {uploading ? 'Uploading...' : 'Upload Founder Photo'}
                  </button>
                </div>
              )}
            </div>`;

code = code.replace(
  /<div className="w-40 h-40 md:w-48 md:h-48.*?<\/div>/s,
  newAvatarSection
);

fs.writeFileSync('src/pages/AboutUs.tsx', code);
