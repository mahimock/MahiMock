import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Search, BookOpen, Loader2, UploadCloud } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { uploadImageToCloudinary } from '../../lib/cloudinary';
import toast from 'react-hot-toast';

interface Exam {
  id: string;
  category: string;
  examName: string;
  slug: string;
  isActive: boolean;
}

interface Subject {
  id: string;
  examId: string;
  name: string;
  shortName?: string;
  logo?: string;
  isActive?: boolean;
  displayOrder: number;
}

export default function SubjectManagement() {
  const { examSlug } = useParams<{ examSlug: string }>();
  const { isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', shortName: '', displayOrder: 0, isActive: true });
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    if (!examSlug || !isAdmin) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    let unsubSubjects: () => void;

    const fetchExamAndSubjects = async () => {
      try {
        const q = query(collection(db, 'exams'), where('slug', '==', examSlug));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setLoading(false);
          return;
        }
        
        const examData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Exam;
        setExam(examData);
        
        const subjectsQ = query(collection(db, 'subjects'), where('examId', '==', examData.id));
        unsubSubjects = onSnapshot(subjectsQ, (snap) => {
          const list: Subject[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as Subject));
          setSubjects(list.sort((a, b) => a.displayOrder - b.displayOrder));
          setLoading(false);
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchExamAndSubjects();

    return () => {
      if (unsubSubjects) unsubSubjects();
    };
  }, [examSlug, isAdmin]);

  const handleOpenModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({ 
        name: subject.name, 
        shortName: subject.shortName || '', 
        displayOrder: subject.displayOrder || 0,
        isActive: subject.isActive !== false
      });
      setLogoUrl(subject.logo || '');
    } else {
      setEditingSubject(null);
      setFormData({ name: '', shortName: '', displayOrder: subjects.length, isActive: true });
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
    if (!exam || saving || isUploading) return;
    setSaving(true);
    try {
      const data = { ...formData, examId: exam.id, logo: logoUrl };
      
      if (editingSubject) {
        await updateDoc(doc(db, 'subjects', editingSubject.id), data);
        toast.success('Subject updated');
      } else {
        await addDoc(collection(db, 'subjects'), data);
        toast.success('Subject added');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Failed to save subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await deleteDoc(doc(db, 'subjects', id));
      toast.success('Subject deleted');
    } catch (err) {
      toast.error('Failed to delete subject');
    }
  };

  if (!isAdmin) {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#5B5FFB] animate-spin" />
      </div>
    );
  }

  if (!exam) {
    return <div className="p-8 text-center text-gray-500">Exam not found</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subject Management</h1>
          <p className="text-gray-500 mt-1">Manage subjects for {exam.examName}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="flex items-center gap-2 bg-[#5B5FFB] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#4A4DE0] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>
      
      {subjects.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No subjects found</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">Start by adding the first subject for this exam.</p>
          <button onClick={() => handleOpenModal()} className="text-[#5B5FFB] font-semibold hover:underline">Add First Subject</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <div key={subject.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-[#5B5FFB] hover:shadow-md transition-all group relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 text-gray-500">
                    {subject.logo ? (
                      <img loading="lazy" src={subject.logo} alt={subject.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <BookOpen className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-[#5B5FFB] transition-colors">{subject.name}</h3>
                    {(subject.shortName || subject.isActive === false) && (
                      <div className="flex items-center gap-2 mt-1">
                        {subject.shortName && <span className="text-xs font-semibold text-gray-500 uppercase">{subject.shortName}</span>}
                        {subject.isActive === false && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 uppercase">Inactive</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(subject)} className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(subject.id)} className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{editingSubject ? 'Edit Subject' : 'Add Subject'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Name</label>
                <input type="text" value={formData.shortName} onChange={e => setFormData({...formData, shortName: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none" placeholder="e.g. Maths" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Icon / Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                    {logoUrl ? (
                      <img loading="lazy" src={logoUrl} alt="Preview" className="w-full h-full object-contain p-1" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG allowed</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input type="number" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: parseInt(e.target.value)||0})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={formData.isActive ? 'active' : 'inactive'} onChange={e => setFormData({...formData, isActive: e.target.value === 'active'})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none bg-white">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 font-semibold">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-[#5B5FFB] text-white font-semibold flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
