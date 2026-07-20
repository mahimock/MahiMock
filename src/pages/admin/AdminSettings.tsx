import React, { useState } from 'react';
import { Settings, Save, Upload, Globe, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBranding } from '../../contexts/BrandingContext';
import { uploadImageToCloudinary } from '../../lib/cloudinary';

export default function AdminSettings() {
  const { branding, updateBranding } = useBranding();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    websiteName: branding.websiteName,
    logoUrl: branding.logoUrl,
    faviconUrl: branding.faviconUrl,
    aboutContent: branding.aboutContent || {
      mission: "",
      vision: "",
      features: [],
      founderName: "",
      founderBio: "",
      website: "",
      email: "",
      whatsapp: "",
      facebook: "",
      instagram: "",
      youtube: "",
      telegram: ""
    }
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon' | 'founder') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const url = await uploadImageToCloudinary(file);
      setFormData(prev => ({
        ...prev,
        [type === 'logo' ? 'logoUrl' : type === 'favicon' ? 'faviconUrl' : 'founderPhotoUrl']: url
      }));
      
      if (type === 'founder') {
        setFormData(prev => ({ ...prev, aboutContent: { ...prev.aboutContent, founderPhotoUrl: url } }));
      }

      toast.success(`${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateBranding(formData);
      toast.success('Branding settings updated successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div className="bg-white dark:bg-[#1E1E2D] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <Globe className="w-8 h-8 text-[#5B5FFB]" />
              Website Branding
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Customize your platform's appearance and identity.</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-[#5B5FFB] text-white font-bold px-8 py-3 rounded-2xl hover:bg-[#4A4DE0] transition-all flex items-center gap-2 shadow-lg shadow-[#5B5FFB]/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <Save className="w-5 h-5" /> 
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* General Settings */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Website Name</label>
              <input 
                type="text" 
                value={formData.websiteName}
                onChange={(e) => setFormData(prev => ({ ...prev, websiteName: e.target.value }))}
                placeholder="e.g. MahiMock"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none bg-gray-50 dark:bg-[#151521] text-gray-900 dark:text-white focus:ring-4 focus:ring-[#5B5FFB]/10 focus:border-[#5B5FFB] transition-all font-medium" 
              />
            </div>

            <div className="p-6 bg-blue-50/50 dark:bg-[#5B5FFB]/5 rounded-3xl border border-blue-100 dark:border-[#5B5FFB]/10">
              <h3 className="text-sm font-bold text-[#5B5FFB] mb-2">Pro Tip</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Changes to the branding will be reflected instantly across the entire platform, including the mobile app header, browser tab, and admin panel.
              </p>
            </div>
          </div>

          {/* Asset Uploads */}
          <div className="space-y-8">
            {/* App Logo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 text-center">App Logo (34x34px recommended)</label>
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-3xl bg-gray-50 dark:bg-[#151521] border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden relative group">
                  {formData.logoUrl ? (
                    <>
                      <img loading="lazy" src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-900 dark:text-white" />
                      </div>
                    </>
                  ) : (
                    <Upload className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <label className="cursor-pointer bg-white dark:bg-[#151521] border border-gray-200 dark:border-gray-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-white dark:bg-[#1E1E2D] transition-all shadow-sm">
                  Upload Logo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'logo')} disabled={loading} />
                </label>
              </div>
            </div>

            {/* Favicon */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 text-center">Favicon (Browser Tab Icon)</label>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#151521] border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden relative group">
                  {formData.faviconUrl ? (
                    <img loading="lazy" src={formData.faviconUrl} alt="Favicon Preview" className="w-full h-full object-contain p-2" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <label className="cursor-pointer bg-white dark:bg-[#151521] border border-gray-200 dark:border-gray-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-white dark:bg-[#1E1E2D] transition-all shadow-sm">
                  Upload Favicon
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'favicon')} disabled={loading} />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Other Settings (Existing) */}
            {/* About Page Settings */}
      <div className="bg-white dark:bg-[#1E1E2D] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">About Page Content</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mission</label>
            <textarea 
              value={formData.aboutContent.mission}
              onChange={(e) => setFormData(prev => ({ ...prev, aboutContent: { ...prev.aboutContent, mission: e.target.value } }))}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none bg-gray-50 dark:bg-[#151521] text-gray-900 dark:text-white focus:ring-4 focus:ring-[#5B5FFB]/10 focus:border-[#5B5FFB] transition-all font-medium min-h-[100px] resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Vision</label>
            <textarea 
              value={formData.aboutContent.vision}
              onChange={(e) => setFormData(prev => ({ ...prev, aboutContent: { ...prev.aboutContent, vision: e.target.value } }))}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none bg-gray-50 dark:bg-[#151521] text-gray-900 dark:text-white focus:ring-4 focus:ring-[#5B5FFB]/10 focus:border-[#5B5FFB] transition-all font-medium min-h-[100px] resize-y"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Founder Name</label>
              <input 
                type="text"
                value={formData.aboutContent.founderName}
                onChange={(e) => setFormData(prev => ({ ...prev, aboutContent: { ...prev.aboutContent, founderName: e.target.value } }))}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none bg-gray-50 dark:bg-[#151521] text-gray-900 dark:text-white focus:ring-4 focus:ring-[#5B5FFB]/10 focus:border-[#5B5FFB] transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Founder Photo</label>
              <div className="flex items-center gap-4">
                 {formData.aboutContent.founderPhotoUrl && (
                   <img loading="lazy" src={formData.aboutContent.founderPhotoUrl} alt="Founder" className="w-12 h-12 rounded-full object-cover" />
                 )}
                 <label className="cursor-pointer bg-white dark:bg-[#151521] border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-[#1E1E2D] transition-all shadow-sm">
                  Upload Photo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'founder')} disabled={loading} />
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Founder Bio</label>
              <textarea 
                value={formData.aboutContent.founderBio}
                onChange={(e) => setFormData(prev => ({ ...prev, aboutContent: { ...prev.aboutContent, founderBio: e.target.value } }))}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none bg-gray-50 dark:bg-[#151521] text-gray-900 dark:text-white focus:ring-4 focus:ring-[#5B5FFB]/10 focus:border-[#5B5FFB] transition-all font-medium"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Features (one per line)</label>
            <textarea 
              value={formData.aboutContent.features.join('\n')}
              onChange={(e) => setFormData(prev => ({ ...prev, aboutContent: { ...prev.aboutContent, features: e.target.value.split('\n').filter(Boolean) } }))}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none bg-gray-50 dark:bg-[#151521] text-gray-900 dark:text-white focus:ring-4 focus:ring-[#5B5FFB]/10 focus:border-[#5B5FFB] transition-all font-medium min-h-[120px] resize-y"
              placeholder="Enter features, one per line..."
            />
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Social & Contact Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['website', 'email', 'whatsapp', 'facebook', 'instagram', 'youtube', 'telegram'].map(field => (
                <div key={field}>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 capitalize">{field}</label>
                  <input 
                    type="text"
                    value={formData.aboutContent[field as keyof typeof formData.aboutContent] as string}
                    onChange={(e) => setFormData(prev => ({ ...prev, aboutContent: { ...prev.aboutContent, [field]: e.target.value } }))}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none bg-gray-50 dark:bg-[#151521] text-gray-900 dark:text-white focus:ring-4 focus:ring-[#5B5FFB]/10 focus:border-[#5B5FFB] transition-all font-medium"
                  />
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>

      <div className="bg-white dark:bg-[#1E1E2D] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 opacity-60">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
          <Settings className="w-6 h-6 text-gray-400" />
          Advanced Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-[#151521] rounded-2xl border border-gray-100 dark:border-gray-700">
            <div>
              <p className="font-bold text-gray-900 dark:text-white">Maintenance Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Temporarily disable access for students.</p>
            </div>
            <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
