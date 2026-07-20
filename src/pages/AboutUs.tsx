import React, { useState, useEffect, useRef } from 'react';
import { Target, Eye, User, Mail, Globe, CheckCircle2, Facebook, Instagram, Youtube, Rocket, Laptop, Heart, Camera, Loader2, MessageCircle, Send } from 'lucide-react';
import { useBranding } from '../contexts/BrandingContext';
import MahiMockLogo from '../components/MahiMockLogo';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { uploadImageToCloudinary } from '../lib/cloudinary';

export default function AboutUs() {
  const { branding } = useBranding();
  const about = branding.aboutContent;

  const [imgError, setImgError] = useState(false);
  const { isAdmin: authIsAdmin } = useAuth();
  const isAdmin = authIsAdmin;
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

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PNG, JPG, JPEG and SVG are allowed');
      return;
    }

    setUploading(true);
    try {
      const downloadURL = await uploadImageToCloudinary(file);
      await setDoc(doc(db, 'appSettings', 'founder'), { photoUrl: downloadURL }, { merge: true });
      setFounderPhoto(downloadURL);
      setImgError(false);
      toast.success('Founder photo updated successfully');
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error(error.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <SEO 
        title="About Us | MahiMock - Empowering Govt Exam Aspirants" 
        description="Learn more about MahiMock, our mission to provide quality education, and the team behind India's premium govt exam preparation platform."
        path="/about"
      />
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#12121A] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200 pb-24">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Hero Section: Founder Profile */}
        <div className="bg-gradient-to-br from-[#5B5FFB] via-[#6B46C1] to-purple-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden text-gray-900 dark:text-white border border-gray-200 dark:border-white/10">
          {/* Glassmorphism decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gray-200 dark:bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/30 rounded-full -ml-48 -mb-48 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            {/* Founder Avatar */}
            {/* Founder Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-gray-300 dark:border-white/20 shadow-2xl overflow-hidden bg-gray-100 dark:bg-white/5 backdrop-blur-md flex-shrink-0 flex items-center justify-center group relative">
                {!imgError ? (
                  <img 
                    src={founderPhoto} 
                    alt="Mohammad Faizal" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <User className="w-20 h-20 text-gray-900 dark:text-white/80" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-gray-900 dark:text-white animate-spin" />
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
                    accept=".png,.jpg,.jpeg,.svg" 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-full text-gray-900 dark:text-white text-sm font-medium transition-colors"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    {uploading ? 'Uploading...' : 'Upload Founder Photo'}
                  </button>
                </div>
              )}
            </div>
            
            {/* Founder Info */}
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Mohammad Faizal</h1>
              <p className="text-xl md:text-2xl text-gray-900 dark:text-white/90 font-medium">Founder & Lead Developer of MahiMock</p>
              <div className="w-20 h-1 bg-white/30 rounded-full mx-auto my-6"></div>
              <p className="text-lg md:text-xl text-gray-900 dark:text-white/80 leading-relaxed font-light">
                Passionate about building India's next-generation government exam preparation platform. MahiMock was created to provide high-quality mock tests, previous year papers, study materials, and performance analytics in one modern platform.
              </p>
            </div>

            {/* Modern Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-8">
              <div className="bg-gray-200 dark:bg-white/10 backdrop-blur-lg border border-gray-300 dark:border-white/20 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/20 transition-all shadow-lg">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Rocket className="w-6 h-6 text-gray-900 dark:text-white" />
                </div>
                <div className="text-left">
                  <p className="text-gray-900 dark:text-white/60 text-xs font-semibold uppercase tracking-wider">Platform</p>
                  <p className="text-gray-900 dark:text-white font-bold text-lg">MahiMock</p>
                </div>
              </div>
              <div className="bg-gray-200 dark:bg-white/10 backdrop-blur-lg border border-gray-300 dark:border-white/20 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/20 transition-all shadow-lg">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Laptop className="w-6 h-6 text-gray-900 dark:text-white" />
                </div>
                <div className="text-left">
                  <p className="text-gray-900 dark:text-white/60 text-xs font-semibold uppercase tracking-wider">Role</p>
                  <p className="text-gray-900 dark:text-white font-bold text-lg">Founder & Lead Dev</p>
                </div>
              </div>
              <div className="bg-gray-200 dark:bg-white/10 backdrop-blur-lg border border-gray-300 dark:border-white/20 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/20 transition-all shadow-lg">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-gray-900 dark:text-white" />
                </div>
                <div className="text-left">
                  <p className="text-gray-900 dark:text-white/60 text-xs font-semibold uppercase tracking-wider">Mission</p>
                  <p className="text-gray-900 dark:text-white font-bold text-sm sm:text-base leading-tight">Quality Education for Every Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About MahiMock */}
        <div className="text-center space-y-6 pt-4">
          <div className="flex justify-center mb-6">
             <MahiMockLogo size="lg" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B5FFB]/10 border border-[#5B5FFB]/20 text-[#5B5FFB] text-[10px] font-bold uppercase tracking-widest">
            App Version 1.0.0
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            India's Premium Government Exam Preparation Platform
          </h2>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-[#1E1E2D] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500"></div>
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {about?.mission || "To make quality government exam preparation affordable and accessible for every student, empowering them to achieve their career goals regardless of their geographical location or financial background."}
            </p>
          </div>

          <div className="bg-white dark:bg-[#1E1E2D] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500"></div>
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Eye className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {about?.vision || "To become one of India's most trusted government exam preparation platforms, known for its excellence in content, innovative learning methodologies, and outstanding student success rates."}
            </p>
          </div>
        </div>

        {/* Founder Information */}
        {about?.founderName && (
          <div className="bg-white dark:bg-[#1E1E2D] p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-[#151521] shadow-xl overflow-hidden shrink-0 z-10 bg-gray-100 dark:bg-[#151521]">
              {about.founderPhotoUrl ? (
                <img loading="lazy" src={about.founderPhotoUrl} alt={about.founderName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-400">
                  {about.founderName.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left z-10 flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-3">
                Founder & CEO
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">{about.founderName}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg italic">
                "{about.founderBio || "An educator with a vision to democratize competitive exam preparation in India."}"
              </p>
            </div>
          </div>
        )}

        {/* Why Choose MahiMock */}
        
        {about?.features && about.features.length > 0 && (
          <div className="bg-white dark:bg-[#1E1E2D] rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 dark:border-white/5 mt-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose {branding.websiteName}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {about.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent">
                  <div className="w-10 h-10 rounded-full bg-[#5B5FFB]/10 flex flex-shrink-0 items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-[#5B5FFB]" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-md">{feature}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact & Socials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-[#1E1E2D] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Us</h2>
            <div className="space-y-4">
              {about?.email && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Email Support</p>
                    <a href={`mailto:${about.email}`} className="text-gray-900 dark:text-white font-semibold hover:text-[#5B5FFB] transition-colors">{about.email}</a>
                  </div>
                </div>
              )}
              {about?.website && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Website</p>
                    <a href={about.website} target="_blank" rel="noopener noreferrer" className="text-gray-900 dark:text-white font-semibold hover:text-[#5B5FFB] transition-colors">{about.website.replace('https://', '')}</a>
                  </div>
                </div>
              )}
              {about?.whatsapp && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">WhatsApp</p>
                    <a href={`https://wa.me/${about.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-900 dark:text-white font-semibold hover:text-[#5B5FFB] transition-colors">{about.whatsapp}</a>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white dark:bg-[#1E1E2D] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Follow Us</h2>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {about?.facebook && (
                <a href={about.facebook} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 flex items-center justify-center text-[#1877F2] transition-all hover:scale-110 shadow-sm">
                  <Facebook className="w-6 h-6" />
                </a>
              )}
              {about?.instagram && (
                <a href={about.instagram} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-[#E4405F]/10 hover:bg-[#E4405F]/20 flex items-center justify-center text-[#E4405F] transition-all hover:scale-110 shadow-sm">
                  <Instagram className="w-6 h-6" />
                </a>
              )}
              {about?.youtube && (
                <a href={about.youtube} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-[#FF0000]/10 hover:bg-[#FF0000]/20 flex items-center justify-center text-[#FF0000] transition-all hover:scale-110 shadow-sm">
                  <Youtube className="w-6 h-6" />
                </a>
              )}
              {about?.telegram && (
                <a href={about.telegram} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-[#0088cc]/10 hover:bg-[#0088cc]/20 flex items-center justify-center text-[#0088cc] transition-all hover:scale-110 shadow-sm">
                  <Send className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="text-center pt-8 pb-4">
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm flex items-center justify-center gap-1.5 flex-wrap">
            Designed & Developed with <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> by <span className="font-bold text-[#5B5FFB]">Mohammad Faizal</span>
          </p>
        </div>
      </div>
    </div>
  </>
);
}
