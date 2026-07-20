import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Edit2, Trash2, X, Loader2, Sparkles, Image as ImageIcon, Link as LinkIcon, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminQuickActions() {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'Daily Quiz',
    date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    thumbnail: '',
    externalLink: '',
    published: true
  });
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'quickActions'), (snap) => {
      setActions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openModal = (action: any = null) => {
    if (action) {
      setEditingId(action.id);
      setFormData({
        title: action.title || '',
        description: action.description || '',
        content: action.content || '',
        category: action.category || 'Daily Quiz',
        date: action.date || new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        thumbnail: action.thumbnail || '',
        externalLink: action.externalLink || '',
        published: action.published !== false
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        content: '',
        category: 'Daily Quiz',
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        thumbnail: '',
        externalLink: '',
        published: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const savePayload = { ...formData, createdAt: editingId ? undefined : new Date().toISOString() };
      
      if (editingId) {
        await updateDoc(doc(db, 'quickActions', editingId), savePayload);
        toast.success('Quick Action updated successfully');
      } else {
        await addDoc(collection(db, 'quickActions'), savePayload);
        toast.success('Quick Action created successfully');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save action');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, 'quickActions', id));
        toast.success('Deleted successfully');
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'quickActions', id), { published: !currentStatus });
      toast.success(`Item ${!currentStatus ? 'published' : 'unpublished'}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;
  }

  const categories = ['Daily Quiz', 'Current Affairs', 'Vacancies', 'Admit Card', 'Answer Key'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#5B5FFB]" /> Quick Actions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage Daily Quiz, Current Affairs, Vacancies, and more.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#5B5FFB] hover:bg-[#4A4DCE] text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Action
        </button>
      </div>

      <div className="bg-white dark:bg-[#1E1E2D] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-[#151521] text-gray-600 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {actions.map((action) => (
                <tr key={action.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {action.thumbnail ? (
                        <img loading="lazy" src={action.thumbnail} alt={action.title} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{action.title}</div>
                        <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{action.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      {action.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {action.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => togglePublish(action.id, action.published)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        action.published 
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {action.published ? 'Published' : 'Unpublished'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openModal(action)}
                        className="p-2 text-gray-400 hover:text-[#5B5FFB] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(action.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {actions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No quick actions found. Click "Add New Action" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#1E1E2D] z-10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingId ? 'Edit Quick Action' : 'Add New Quick Action'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="actionForm" onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none bg-transparent" 
                      placeholder="e.g. October Current Affairs"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})} 
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none bg-white dark:bg-[#151521]"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.date} 
                      onChange={e => setFormData({...formData, date: e.target.value})} 
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none bg-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                      <LinkIcon className="w-4 h-4" /> External Link (Optional)
                    </label>
                    <input 
                      type="url" 
                      value={formData.externalLink} 
                      onChange={e => setFormData({...formData, externalLink: e.target.value})} 
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none bg-transparent" 
                      placeholder="https://"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" /> Thumbnail Image URL (Optional)
                  </label>
                  <input 
                    type="url" 
                    value={formData.thumbnail} 
                    onChange={e => setFormData({...formData, thumbnail: e.target.value})} 
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none bg-transparent" 
                    placeholder="https://"
                  />
                  {formData.thumbnail && (
                    <div className="mt-2">
                      <img loading="lazy" src={formData.thumbnail} alt="Preview" className="h-20 w-auto rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Description</label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none resize-none bg-transparent" 
                    rows={2}
                    placeholder="Brief summary..."
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Content</label>
                  <textarea 
                    value={formData.content} 
                    onChange={e => setFormData({...formData, content: e.target.value})} 
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none min-h-[150px] bg-transparent" 
                    placeholder="Detailed content goes here..."
                  ></textarea>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="checkbox" 
                    id="published" 
                    checked={formData.published} 
                    onChange={e => setFormData({...formData, published: e.target.checked})} 
                    className="w-4 h-4 text-[#5B5FFB] rounded focus:ring-[#5B5FFB]" 
                  />
                  <label htmlFor="published" className="text-sm text-gray-700 dark:text-gray-300">
                    Publish immediately
                  </label>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-[#151521] sticky bottom-0">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="actionForm"
                disabled={saving}
                className="flex items-center gap-2 bg-[#5B5FFB] hover:bg-[#4A4DCE] text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Save Quick Action'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
