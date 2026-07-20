import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Edit2, Trash2, X, Loader2, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { uploadImageToCloudinary } from '../../lib/cloudinary';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    gradient: '',
    displayOrder: 0,
    status: 'Active'
  });
  
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const q = collection(db, 'examCategories');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(data.filter(c => c.id !== '_init').sort((a:any, b:any) => (a.displayOrder || 0) - (b.displayOrder || 0)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openModal = (category: any = null) => {
    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name || category.category || '',
        slug: category.slug || '',
        description: category.description || '',
        gradient: category.gradient || category.gradientColor || '',
        displayOrder: category.displayOrder || 0,
        status: category.status || (category.active !== false ? 'Active' : 'Inactive')
      });
      setLogoUrl(category.logoUrl || category.logo || '');
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        gradient: '',
        displayOrder: categories.length,
        status: 'Active'
      });
      setLogoUrl('');
    }
    setIsModalOpen(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PNG, JPG, JPEG and SVG are allowed');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setLogoUrl(url);
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast.error(error.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || isUploading) return;
    setSaving(true);
    
    try {
      const savePayload = {
        ...formData,
        logoUrl,
        logo: logoUrl,
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, 'examCategories', editingId), savePayload);
        toast.success('Category updated successfully');
      } else {
        await addDoc(collection(db, 'examCategories'), {
          ...savePayload,
          createdAt: new Date().toISOString()
        });
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteDoc(doc(db, 'examCategories', id));
        toast.success('Category deleted successfully');
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all exam categories shown on the homepage.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-[#5B5FFB] hover:bg-[#4A4DE0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-[#151521] text-gray-600 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">Logo</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 dark:bg-[#151521]/50 transition-colors">
                  <td className="px-6 py-4">
                    {cat.logoUrl || cat.logo ? (
                      <img loading="lazy" src={cat.logoUrl || cat.logo} alt="Logo" className="w-10 h-10 object-contain rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1E1E2D]" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{cat.name || cat.category}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{cat.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cat.status === 'Active' || cat.active !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {cat.status || (cat.active !== false ? 'Active' : 'Inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openModal(cat)} className="p-2 text-gray-400 hover:text-[#5B5FFB] hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-xl w-full max-w-xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#1E1E2D] rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
                  <input type="text" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gradient Color Classes (Tailwind)</label>
                <input type="text" placeholder="e.g. bg-gradient-to-br from-red-500 to-red-600" value={formData.gradient} onChange={e => setFormData({...formData, gradient: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Order</label>
                  <input type="number" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none bg-white dark:bg-[#1E1E2D]">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category Logo / Icon</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#151521] flex items-center justify-center overflow-hidden shrink-0">
                    {logoUrl ? (
                      <img loading="lazy" src={logoUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#151521] hover:bg-gray-200 dark:hover:bg-[#252535] text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                      {isUploading ? 'Uploading...' : 'Upload Logo'}
                      <input 
                        type="file" 
                        accept=".png,.jpg,.jpeg,.svg" 
                        onChange={handleLogoUpload}
                        className="hidden" 
                        disabled={isUploading}
                      />
                    </label>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wider">PNG, JPG or SVG (Max 1MB)</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#1E1E2D]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:bg-[#151521] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving || isUploading} className="bg-[#5B5FFB] hover:bg-[#4A4DE0] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors disabled:opacity-70">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
