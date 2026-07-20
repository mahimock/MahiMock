import fs from 'fs';

let content = fs.readFileSync('src/pages/admin/AdminSettings.tsx', 'utf8');

content = content.replace(/websiteName: branding.websiteName,\n    logoUrl: branding.logoUrl,\n    faviconUrl: branding.faviconUrl\n  \}\);/, `websiteName: branding.websiteName,
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
  });`);

content = content.replace(/handleLogoUpload = async \(e: React.ChangeEvent<HTMLInputElement>, type: 'logo' \| 'favicon'\)/, `handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon' | 'founder')`);

content = content.replace(/\[type === 'logo' \? 'logoUrl' : 'faviconUrl'\]: url\n      \}\)\);/, `[type === 'logo' ? 'logoUrl' : type === 'favicon' ? 'faviconUrl' : 'founderPhotoUrl']: url
      }));
      
      if (type === 'founder') {
        setFormData(prev => ({ ...prev, aboutContent: { ...prev.aboutContent, founderPhotoUrl: url } }));
      }
`);

content = content.replace(/<div className="bg-white dark:bg-\[\#1E1E2D\] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 opacity-60">/, `      {/* About Page Settings */}
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
                   <img src={formData.aboutContent.founderPhotoUrl} alt="Founder" className="w-12 h-12 rounded-full object-cover" />
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

      <div className="bg-white dark:bg-[#1E1E2D] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 opacity-60">`);

fs.writeFileSync('src/pages/admin/AdminSettings.tsx', content);
