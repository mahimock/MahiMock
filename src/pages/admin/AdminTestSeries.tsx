import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Edit2, Trash2, X, Loader2, Layers, Search, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface TestSeries {
  id: string;
  title: string;
  description: string;
  price: number;
  discountedPrice: number;
  validityMonths: number;
  status: 'Published' | 'Draft';
  imageUrl?: string;
  createdAt?: string;
}

export default function AdminTestSeries() {
  const [series, setSeries] = useState<TestSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Omit<TestSeries, 'id'>>({
    title: '',
    description: '',
    price: 0,
    discountedPrice: 0,
    validityMonths: 12,
    status: 'Published',
    imageUrl: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'testSeries'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setSeries(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestSeries)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openModal = (item?: TestSeries) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        title: item.title,
        description: item.description,
        price: item.price,
        discountedPrice: item.discountedPrice,
        validityMonths: item.validityMonths,
        status: item.status,
        imageUrl: item.imageUrl || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        price: 0,
        discountedPrice: 0,
        validityMonths: 12,
        status: 'Published',
        imageUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'testSeries', editingId), { ...formData, updatedAt: new Date().toISOString() });
        toast.success('Test series updated');
      } else {
        await addDoc(collection(db, 'testSeries'), { ...formData, createdAt: new Date().toISOString() });
        toast.success('Test series created');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Failed to save test series');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this test series?')) {
      try {
        await deleteDoc(doc(db, 'testSeries', id));
        toast.success('Deleted successfully');
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  const filteredSeries = series.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1E1E2D] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#5B5FFB]" />
            Test Series
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Bundle mock tests into premium series for students.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-6 py-2.5 bg-[#5B5FFB] text-white rounded-xl font-bold hover:bg-[#4A4DE0] shadow-md transition-all">
          <Plus className="w-5 h-5" /> Create Series
        </button>
      </div>

      <div className="bg-white dark:bg-[#1E1E2D] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search test series..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#151521] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] outline-none text-gray-900 dark:text-white transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSeries.map(item => (
          <div key={item.id} className="bg-white dark:bg-[#1E1E2D] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:border-[#5B5FFB] dark:hover:border-[#5B5FFB] transition-colors shadow-sm group">
            {item.imageUrl ? (
              <div className="h-40 w-full overflow-hidden relative">
                <img loading="lazy" src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'Published' ? 'bg-green-500 text-gray-900 dark:text-white' : 'bg-gray-500 text-gray-900 dark:text-white'}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-40 w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
                <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'Published' ? 'bg-green-500 text-gray-900 dark:text-white' : 'bg-gray-500 text-gray-900 dark:text-white'}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            )}
            
            <div className="p-5">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">{item.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
              
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pricing</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#5B5FFB]">₹{item.discountedPrice}</span>
                    <span className="text-sm text-gray-400 line-through">₹{item.price}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Validity</p>
                  <p className="font-bold text-gray-900 dark:text-white">{item.validityMonths} Months</p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => openModal(item)} className="flex-1 flex justify-center items-center gap-2 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-sm">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => handleDelete(item.id)} className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredSeries.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1E1E2D] rounded-2xl border border-gray-100 dark:border-gray-800 border-dashed">
            No test series found. Click "Create Series" to add one.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#1E1E2D] rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Test Series' : 'Create Test Series'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Series Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none bg-white dark:bg-[#151521] text-gray-900 dark:text-white" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none bg-white dark:bg-[#151521] text-gray-900 dark:text-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Original Price (₹)</label>
                  <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none bg-white dark:bg-[#151521] text-gray-900 dark:text-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discounted Price (₹)</label>
                  <input required type="number" min="0" value={formData.discountedPrice} onChange={e => setFormData({...formData, discountedPrice: Number(e.target.value)})} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none bg-white dark:bg-[#151521] text-gray-900 dark:text-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Validity (Months)</label>
                  <input required type="number" min="1" value={formData.validityMonths} onChange={e => setFormData({...formData, validityMonths: Number(e.target.value)})} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none bg-white dark:bg-[#151521] text-gray-900 dark:text-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none bg-white dark:bg-[#151521] text-gray-900 dark:text-white">
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banner Image URL</label>
                  <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none bg-white dark:bg-[#151521] text-gray-900 dark:text-white" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#5B5FFB] text-white font-bold rounded-xl hover:bg-[#4A4DE0] disabled:opacity-70 flex items-center gap-2 transition-colors shadow-md">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Update Series' : 'Create Series'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
