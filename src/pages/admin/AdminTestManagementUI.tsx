import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Edit2, Trash2, X, Loader2, FileQuestion, ListPlus, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminTestManagementUI() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    type: 'Full Mock',
    durationMinutes: 60,
    questionsCount: 100,
    marks: 100,
    negativeMarking: '0.25',
    showResultImmediately: true,
    language: 'Hindi',
    status: 'Draft'
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'mockTests'), (snap) => {
      setTests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openModal = (test?: any) => {
    if (test) {
      setEditingId(test.id);
      setFormData({
        title: test.title || '',
        type: test.type || 'Full Mock',
        durationMinutes: test.durationMinutes || 60,
        questionsCount: test.questionsCount || 100,
        marks: test.marks || 100,
        negativeMarking: test.negativeMarking || '0.25',
        showResultImmediately: test.showResultImmediately ?? true,
        language: test.language || 'Hindi',
        status: test.status || 'Draft'
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        type: 'Full Mock',
        durationMinutes: 60,
        questionsCount: 100,
        marks: 100,
        negativeMarking: '0.25',
        showResultImmediately: true,
        language: 'Hindi',
        status: 'Draft'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      if (editingId) {
        await updateDoc(doc(db, 'mockTests', editingId), payload);
        toast.success('Test updated successfully');
      } else {
        await addDoc(collection(db, 'mockTests'), {
          ...payload,
          createdAt: new Date().toISOString()
        });
        toast.success('Test created successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Failed to save test');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await deleteDoc(doc(db, 'mockTests', id));
        toast.success('Test deleted successfully');
      } catch (err) {
        toast.error('Failed to delete test');
      }
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Management</h1>
          <p className="text-gray-500 mt-1">Manage mock tests, subjects, and chapter tests</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-6 py-3 bg-[#5B5FFB] text-white rounded-xl font-bold hover:bg-[#4A4DE0] shadow-md transition-all">
          <Plus className="w-5 h-5" /> Add Test
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map(test => (
          <div key={test.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">{test.type || 'Full Mock'}</span>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${test.status === 'Published' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                  {test.status}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{test.title}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1.5"><FileQuestion className="w-4 h-4" /> {test.questionsCount} Qs</span>
                <span className="flex items-center gap-1.5">⏱ {test.durationMinutes} Mins</span>
                <span className="flex items-center gap-1.5">★ {test.marks || (test.questionsCount * 1)} Marks</span>
                <span className="flex items-center gap-1.5">🌍 {test.language}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-50">
              <button onClick={() => navigate(`/admin/tests/${test.id}/questions`)} className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 bg-[#5B5FFB] text-white rounded-lg text-sm font-bold hover:bg-[#4A4DE0] transition-colors">
                <ListPlus className="w-4 h-4" /> Manage Questions
              </button>
              <div className="flex gap-2">
                <button onClick={() => openModal(test)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Edit Test">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(test.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Delete Test">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {tests.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
            No tests available. Click "Add Test" to create one.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Test' : 'Add Test'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Name *</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] outline-none bg-white">
                    <option value="Full Mock">Full Mock</option>
                    <option value="Subject">Subject</option>
                    <option value="Chapter">Chapter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Minutes)</label>
                  <input type="number" required value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions</label>
                  <input type="number" required value={formData.questionsCount} onChange={e => setFormData({...formData, questionsCount: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                  <input type="number" required value={formData.marks} onChange={e => setFormData({...formData, marks: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Negative Marking</label>
                  <input type="text" value={formData.negativeMarking} onChange={e => setFormData({...formData, negativeMarking: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] outline-none" placeholder="e.g. 0.25 or 1/3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] outline-none bg-white">
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Bilingual">Bilingual (Hindi + English)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Show Result Immediately</label>
                  <select value={formData.showResultImmediately ? 'true' : 'false'} onChange={e => setFormData({...formData, showResultImmediately: e.target.value === 'true'})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] outline-none bg-white">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] outline-none bg-white">
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="bg-[#5B5FFB] hover:bg-[#4A4DE0] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-70">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
