import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Layout, 
  Eye, 
  Save, 
  Plus, 
  Image as ImageIcon, 
  FileText, 
  Globe, 
  Target, 
  ChevronRight, 
  Loader2,
  Settings,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export default function AdminHomeManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>({
    heroTitle: 'Prepare Smarter, Achieve Faster.',
    heroSubtitle: 'Access premium mock tests, study materials, and expert guidance for all government exams.',
    sections: [
      { id: 'materials', title: 'Study Materials', enabled: true, order: 1 },
      { id: 'updates', title: 'Latest Updates', enabled: true, order: 2 },
      { id: 'featured', title: 'Featured Mock Tests', enabled: true, order: 3 },
      { id: 'currentAffairs', title: 'Current Affairs', enabled: true, order: 4 },
    ]
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'system', 'homeConfig'));
        if (docSnap.exists()) {
          setConfig(docSnap.data());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'system', 'homeConfig'), config);
      toast.success('Home page configuration updated!');
    } catch (err) {
      toast.error('Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (id: string) => {
    setConfig({
      ...config,
      sections: config.sections.map((s: any) => 
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...config.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setConfig({ ...config, sections: newSections });
  };

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;

  return (
    <div className="p-6 sm:p-8 bg-[#F8FAFC] min-h-screen">
      <header className="mb-8 flex items-center justify-between">
         <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-gray-900 dark:text-white shadow-lg shadow-emerald-600/20">
                 <Home className="w-6 h-6" />
               </div>
               <h1 className="text-2xl font-bold text-gray-900">Home Page Manager</h1>
            </div>
            <p className="text-gray-500">Configure content visibility and layout of the main landing page.</p>
         </div>
         <button 
           onClick={handleSave}
           disabled={saving}
           className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-gray-900 dark:text-white font-black rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
         >
           {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
           Save Changes
         </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Panel */}
        <div className="lg:col-span-7 space-y-8">
           {/* Hero Section */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
               <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                 <ImageIcon className="w-5 h-5 text-[#5B5FFB]" /> Hero Section
              </h3>
              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Main Title</label>
                    <input 
                      type="text" 
                      value={config.heroTitle}
                      onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#5B5FFB] outline-none transition-all font-bold text-gray-700"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sub-headline</label>
                    <textarea 
                      value={config.heroSubtitle}
                      onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                      rows={3}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#5B5FFB] outline-none transition-all font-medium text-gray-700 resize-none"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Hero Image URL</label>
                    <div className="flex gap-4 items-start">
                       <div className="flex-1">
                          <input 
                            type="text" 
                            value={config.heroImageUrl || ''}
                            onChange={(e) => setConfig({ ...config, heroImageUrl: e.target.value })}
                            placeholder="Enter image URL or upload one"
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#5B5FFB] outline-none transition-all font-medium text-gray-700"
                          />
                          <p className="text-[10px] text-gray-500 mt-2 font-medium">To upload an image, click the upload button to the right. Use a transparent PNG for best results.</p>
                       </div>
                       <div className="shrink-0 relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setConfig({ ...config, heroImageUrl: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <div className="w-14 h-14 bg-[#5B5FFB]/10 text-[#5B5FFB] rounded-2xl flex items-center justify-center hover:bg-[#5B5FFB]/20 transition-colors">
                            <Plus className="w-6 h-6" />
                          </div>
                       </div>
                    </div>
                    {config.heroImageUrl && (
                       <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <img loading="lazy" src={config.heroImageUrl} alt="Hero Preview" className="max-h-32 object-contain rounded-xl" />
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Section Manager */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                 <Layout className="w-5 h-5 text-[#5B5FFB]" /> Section Order & Visibility
              </h3>
              <div className="space-y-4">
                 {config.sections.map((section: any, index: number) => (
                   <div key={section.id} className="flex items-center justify-between p-5 bg-[#F8FAFC] rounded-3xl border border-gray-50 group">
                      <div className="flex items-center gap-4">
                         <div className="flex flex-col gap-1">
                            <button onClick={() => moveSection(index, 'up')} className="p-1 text-gray-300 hover:text-[#5B5FFB] transition-colors"><ArrowUp className="w-4 h-4" /></button>
                            <button onClick={() => moveSection(index, 'down')} className="p-1 text-gray-300 hover:text-[#5B5FFB] transition-colors"><ArrowDown className="w-4 h-4" /></button>
                         </div>
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${section.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                            {index + 1}
                         </div>
                         <div>
                            <h5 className="font-black text-gray-900">{section.title}</h5>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Section ID: {section.id}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div 
                           onClick={() => toggleSection(section.id)}
                           className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${section.enabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
                         >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${section.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                         </div>
                         <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors"><Settings className="w-4 h-4" /></button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Live Preview / Helper */}
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-[#111827] rounded-[2.5rem] p-8 text-gray-900 dark:text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 dark:bg-white/5 rounded-full -mr-16 -mt-16"></div>
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                 <Eye className="w-6 h-6 text-[#5B5FFB]" /> Live Preview Mockup
              </h3>
              
              <div className="space-y-4 opacity-80">
                 {/* Hero Preview */}
                 <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                    <h4 className="text-sm font-black mb-1 line-clamp-1">{config.heroTitle}</h4>
                    <p className="text-[10px] text-gray-500 line-clamp-2">{config.heroSubtitle}</p>
                 </div>

                 {/* Sections Preview */}
                 {config.sections.filter((s: any) => s.enabled).map((s: any) => (
                    <div key={s.id} className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{s.title}</span>
                       <ChevronRight className="w-3 h-3 text-gray-600" />
                    </div>
                 ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/5">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Editor Tip</p>
                 <p className="text-xs text-gray-400 leading-relaxed font-medium">Content managers like 'Study Materials' and 'Current Affairs' will automatically pull the latest items from their respective databases if enabled here.</p>
              </div>
           </div>

           <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                 <Globe className="w-5 h-5" />
              </div>
              <div>
                 <h4 className="font-bold text-emerald-900 text-sm mb-1">Global Reach</h4>
                 <p className="text-xs text-emerald-700 leading-relaxed font-medium">Changes made here are applied instantly to all users across the platform without needing a server restart.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
