import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Edit2, Trash2, X, Loader2, File as FileIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminStudyMaterials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    icon: 'Book',
    color: 'text-blue-500',
    bg: 'bg-blue-50'
  });
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubCats = onSnapshot(collection(db, 'examCategories'), (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(c => c.id !== '_init'));
    });
    
    const unsubMats = onSnapshot(collection(db, 'studyMaterials'), (snap) => {
      setMaterials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(c => c.id !== '_init'));
      setLoading(false);
    });

    return () => { unsubCats(); unsubMats(); };
  }, []);

  const openModal = (material: any = null) => {
    if (material) {
      setEditingId(material.id);
      setFormData({
        name: material.name || material.title || '',
        description: material.description || '',
        categoryId: material.categoryId || '',
        icon: material.icon || 'Book',
        color: material.color || 'text-blue-500',
        bg: material.bg || 'bg-blue-50'
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        icon: 'Book',
        color: 'text-blue-500',
        bg: 'bg-blue-50'
      });
    }
    setPdfFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let pdfUrl = editingId ? materials.find(m => m.id === editingId)?.pdfUrl : null;
      
      if (pdfFile) {
        // Warning: Firestore has a 1MB document limit.
        if (pdfFile.size > 800 * 1024) {
           throw new Error("File is too large. Please upload a file smaller than 800KB.");
        }
        try {
          pdfUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(pdfFile);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });
        } catch (error: any) {
          throw new Error("Failed to process file.");
        }
      }

      const savePayload = {
        ...formData,
        ...(pdfUrl && { pdfUrl })
      };

      if (editingId) {
        await updateDoc(doc(db, 'studyMaterials', editingId), savePayload);
        toast.success('Material updated successfully');
      } else {
        await addDoc(collection(db, 'studyMaterials'), savePayload);
        toast.success('Material created successfully');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save material');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await deleteDoc(doc(db, 'studyMaterials', id));
        toast.success('Material deleted successfully');
      } catch (error) {
        toast.error('Failed to delete material');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Materials</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage notes, papers, and syllabus documents.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-[#5B5FFB] hover:bg-[#4A4DE0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Material
        </button>
      </div>

      <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-[#151521] text-gray-600 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">File</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {materials.map((mat) => (
                <tr key={mat.id} className="hover:bg-gray-50 dark:bg-[#151521]/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${mat.bg || 'bg-blue-50'} ${mat.color || 'text-blue-500'}`}>
                        <FileIcon className="w-4 h-4" />
                      </div>
                      {mat.name || mat.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {categories.find(c => c.id === mat.categoryId)?.name || 'General'}
                  </td>
                  <td className="px-6 py-4">
                    {mat.pdfUrl ? (
                      <a href={mat.pdfUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs font-medium">View PDF</a>
                    ) : (
                      <span className="text-gray-400 text-xs">No file</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openModal(mat)} className="p-2 text-gray-400 hover:text-[#5B5FFB] hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(mat.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No study materials found.</td>
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Material' : 'Add Material'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none bg-white dark:bg-[#1E1E2D]">
                  <option value="">Select Category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name || c.category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon Name (Lucide)</label>
                  <input type="text" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none" placeholder="e.g. Book" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color Class</label>
                  <input type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none" placeholder="e.g. text-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload PDF File</label>
                <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#151521] text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#1E1E2D]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:bg-[#151521] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="bg-[#5B5FFB] hover:bg-[#4A4DE0] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors disabled:opacity-70">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
