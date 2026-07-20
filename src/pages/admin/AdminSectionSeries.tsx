import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Edit2, Trash2, X, Loader2, BookOpen, ChevronRight, Zap, Image as ImageIcon, UploadCloud, FileQuestion, Clock, FileText, ListPlus, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadImageToCloudinary } from '../../lib/cloudinary';

interface SectionSeries {
  id: string;
  name: string;
  iconName: string;
  logoUrl?: string;
  themeColor: string;
  isActive: boolean;
  order: number;
}

interface Test {
  id: string;
  title: string;
  sectionSeriesId: string;
  questionsCount: number;
  marks: number;
  durationMinutes: number;
  status: 'Draft' | 'Published';
  createdAt: number;
  displayOrder: number;
}

const DraggableAny = Draggable as any;

export default function AdminSectionSeries() {
  const [view, setView] = useState<'sections' | 'tests'>('sections');
  const [selectedSection, setSelectedSection] = useState<SectionSeries | null>(null);
  const [series, setSeries] = useState<SectionSeries[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState<Omit<SectionSeries, 'id'>>({
    name: '',
    iconName: 'Zap',
    logoUrl: '',
    themeColor: 'orange',
    isActive: true,
    order: 0
  });

  const [testFormData, setTestFormData] = useState({
    title: '',
    durationMinutes: 60,
    questionsCount: 0,
    marks: 0,
    status: 'Draft' as const,
    sectionSeriesId: '',
    displayOrder: 0
  });

  const themeColors = [
    { value: 'orange', label: 'Orange' },
    { value: 'blue', label: 'Blue' },
    { value: 'purple', label: 'Purple' },
    { value: 'green', label: 'Green' },
    { value: 'red', label: 'Red' },
    { value: 'amber', label: 'Amber' },
    { value: 'pink', label: 'Pink' },
    { value: 'indigo', label: 'Indigo' },
    { value: 'teal', label: 'Teal' },
    { value: 'cyan', label: 'Cyan' }
  ];

  useEffect(() => {
    const q = query(collection(db, 'sectionSeries'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SectionSeries));
      setSeries(fetched);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error('Failed to load section series');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (view === 'tests' && selectedSection) {
      setLoading(true);
      const q = query(
        collection(db, 'tests'),
        where('sectionSeriesId', '==', selectedSection.id),
        orderBy('order', 'asc')
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        let fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Test));
        
        // Migration: If displayOrder is missing, assign it
        const missingOrder = fetched.some(t => t.displayOrder === undefined);
        if (missingOrder) {
          const batch = writeBatch(db);
          fetched = fetched.map((t, index) => {
            if (t.displayOrder === undefined) {
              const val = (t as any).order !== undefined ? (t as any).order : index;
              batch.update(doc(db, 'tests', t.id), { displayOrder: val });
              return { ...t, displayOrder: val };
            }
            return t;
          });
          await batch.commit();
        }

        // Always sort tests by displayOrder in ascending order. 
        // If two tests have the same displayOrder, sort by createdAt.
        fetched.sort((a, b) => {
          if (a.displayOrder !== b.displayOrder) {
            return a.displayOrder - b.displayOrder;
          }
          return (a.createdAt || 0) - (b.createdAt || 0);
        });

        setTests(fetched);
        setLoading(false);
      }, (err) => {
        console.error(err);
        // Fallback for missing index: sort client-side
        if (err.code === 'failed-precondition') {
          const qFallback = query(collection(db, 'tests'), where('sectionSeriesId', '==', selectedSection.id));
          getDocs(qFallback).then(snap => {
            const f = snap.docs.map(d => ({ id: d.id, ...d.data() } as Test));
            f.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            setTests(f);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
      return () => unsubscribe();
    }
  }, [view, selectedSection]);

  const reindexTests = async (sectionId: string) => {
    const q = query(
      collection(db, 'tests'),
      where('sectionSeriesId', '==', sectionId),
      orderBy('displayOrder', 'asc')
    );
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((doc, index) => {
      batch.update(doc.ref, { displayOrder: index });
    });
    await batch.commit();
  };

  const reindexSeries = async () => {
    const q = query(collection(db, 'sectionSeries'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((doc, index) => {
      batch.update(doc.ref, { order: index });
    });
    await batch.commit();
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const items = view === 'sections' ? [...series] : [...tests];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately
    if (view === 'sections') setSeries(items as SectionSeries[]);
    else setTests(items as Test[]);

    // Update Firestore
    try {
      const batch = writeBatch(db);
      items.forEach((item, index) => {
        const collectionName = view === 'sections' ? 'sectionSeries' : 'tests';
        const docRef = doc(db, collectionName, item.id);
        const updateData = view === 'tests' ? { displayOrder: index } : { order: index };
        batch.update(docRef, updateData);
      });
      await batch.commit();
      toast.success('Order updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update order');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'sectionSeries', editingId), formData);
        toast.success('Section Series updated successfully');
      } else {
        await addDoc(collection(db, 'sectionSeries'), formData);
        toast.success('Section Series added successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Operation failed');
    }
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
      setFormData(prev => ({ ...prev, logoUrl: url }));
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast.error(error.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteDoc(doc(db, 'sectionSeries', id));
        await reindexSeries();
        toast.success('Deleted successfully');
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const openModal = (item?: SectionSeries) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        iconName: item.iconName || 'Zap',
        logoUrl: item.logoUrl || '',
        themeColor: item.themeColor || 'orange',
        isActive: item.isActive,
        order: item.order || 0
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        iconName: 'Zap',
        logoUrl: '',
        themeColor: 'orange',
        isActive: true,
        order: series.length
      });
    }
    setIsModalOpen(true);
  };

  const openTestModal = (test?: Test) => {
    if (test) {
      setEditingTestId(test.id);
      setTestFormData({
        title: test.title,
        durationMinutes: test.durationMinutes,
        questionsCount: test.questionsCount,
        marks: test.marks,
        status: test.status,
        sectionSeriesId: test.sectionSeriesId,
        displayOrder: test.displayOrder
      });
    } else {
      // Calculate next display order
      const maxOrder = tests.length > 0 
        ? Math.max(...tests.map(t => t.displayOrder || 0))
        : -1;

      setEditingTestId(null);
      setTestFormData({
        title: '',
        durationMinutes: 60,
        questionsCount: 0,
        marks: 0,
        status: 'Draft',
        sectionSeriesId: selectedSection?.id || '',
        displayOrder: maxOrder + 1
      });
    }
    setIsTestModalOpen(true);
  };

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTestId) {
        await updateDoc(doc(db, 'tests', editingTestId), {
          ...testFormData,
          updatedAt: Date.now()
        });
        toast.success('Test metadata updated');
      } else {
        const testRef = await addDoc(collection(db, 'tests'), {
          ...testFormData,
          createdAt: Date.now()
        });
        toast.success('Test created. Now add questions.');
        navigate(`/admin/tests/${testRef.id}/questions`);
      }
      setIsTestModalOpen(false);
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleTestDelete = async (id: string) => {
    if (window.confirm('Are you sure? This will delete the test and all its questions.')) {
      try {
        const testRef = doc(db, 'tests', id);
        const qSnap = await getDocs(collection(testRef, 'Questions'));
        const batch = writeBatch(db);
        qSnap.forEach(d => batch.delete(d.ref));
        await batch.commit();
        await deleteDoc(testRef);
        if (selectedSection) {
          await reindexTests(selectedSection.id);
        }
        toast.success('Test deleted');
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  if (loading && view === 'sections') {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <span className="cursor-pointer hover:text-[#5B5FFB]" onClick={() => { setView('sections'); setSelectedSection(null); }}>Section Series</span>
            {view === 'tests' && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 dark:text-white font-medium">{selectedSection?.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {view === 'sections' ? 'Section Test Series' : `${selectedSection?.name} - Tests`}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {view === 'sections' ? 'Manage sectional practice tests for homepage.' : `Manage tests for ${selectedSection?.name}.`}
          </p>
        </div>
        <div className="flex gap-3">
          {view === 'sections' ? (
            <button onClick={() => openModal()} className="bg-[#5B5FFB] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#4A4DE0] transition-colors shadow-sm font-semibold">
              <Plus className="w-5 h-5" /> Add Section
            </button>
          ) : (
            <button onClick={() => openTestModal()} className="bg-[#5B5FFB] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#4A4DE0] transition-colors shadow-sm font-semibold">
              <Plus className="w-5 h-5" /> Add Test
            </button>
          )}
        </div>
      </div>

      {view === 'sections' ? (
        <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-[#2A2A3D] border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-center font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">#</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Section Name</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Appearance</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <Droppable droppableId="sections">
                  {(provided) => (
                    <tbody {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-gray-100 dark:divide-gray-800">
                      {series.map((item, index) => {
                        const IconComponent = (Icons as any)[item.iconName] || BookOpen;
                        return (
                          <DraggableAny draggableId={item.id} index={index} key={item.id}>
                            {(provided) => (
                              <tr ref={provided.innerRef} {...provided.draggableProps} className="hover:bg-gray-50 dark:hover:bg-[#2A2A3D]/50 transition-colors">
                                <td className="px-6 py-4 text-center">
                                  <div {...provided.dragHandleProps} className="flex flex-col items-center gap-1 text-gray-400">
                                    <GripVertical className="w-4 h-4" />
                                    <span className="text-xs font-black">#{index + 1}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl bg-${item.themeColor}-100 dark:bg-${item.themeColor}-500/20 text-${item.themeColor}-600 dark:text-${item.themeColor}-400 flex items-center justify-center shrink-0`}>
                                      {item.logoUrl ? <img loading="lazy" src={item.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" /> : <IconComponent className="w-5 h-5" />}
                                    </div>
                                    <div>
                                      <div className="font-bold text-gray-900 dark:text-white text-base">{item.name}</div>
                                      <button onClick={() => { setSelectedSection(item); setView('tests'); }} className="text-[#5B5FFB] hover:underline font-semibold text-xs mt-1">Manage Tests</button>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1.5 font-medium"><div className={`w-3 h-3 rounded-full bg-${item.themeColor}-500`} /> {item.themeColor}</span>
                                  <div className="text-[10px] mt-1 uppercase font-bold tracking-wider">{item.iconName}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                                    item.isActive ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                                  }`}>
                                    {item.isActive ? 'Published' : 'Draft'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => openModal(item)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm">
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors shadow-sm">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </DraggableAny>
                        );
                      })}
                      {provided.placeholder}
                    </tbody>
                  )}
                </Droppable>
              </table>
            </div>
          </DragDropContext>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-[#2A2A3D] border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-center font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">#</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Test Title</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <Droppable droppableId="tests">
                  {(provided) => (
                    <tbody {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-gray-100 dark:divide-gray-800">
                      {tests.map((test, index) => (
                        <DraggableAny draggableId={test.id} index={index} key={test.id}>
                          {(provided) => (
                            <tr ref={provided.innerRef} {...provided.draggableProps} className="hover:bg-gray-50 dark:hover:bg-[#2A2A3D]/50 transition-colors">
                              <td className="px-6 py-4 text-center">
                                <div {...provided.dragHandleProps} className="flex flex-col items-center gap-1 text-gray-400">
                                  <GripVertical className="w-4 h-4" />
                                  <span className="text-xs font-black">#{index + 1}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-bold text-gray-900 dark:text-white text-base">{test.title}</div>
                                <div className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wider">Order: {test.displayOrder}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-2">
                                  <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-white/5 rounded text-[10px] font-bold text-gray-600 dark:text-gray-400">
                                    <FileQuestion className="w-3 h-3" /> {test.questionsCount} Qs
                                  </span>
                                  <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-white/5 rounded text-[10px] font-bold text-gray-600 dark:text-gray-400">
                                    <Clock className="w-3 h-3" /> {test.durationMinutes} Min
                                  </span>
                                  <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-white/5 rounded text-[10px] font-bold text-gray-600 dark:text-gray-400">
                                    ★ {test.marks || (test.questionsCount * 1)} Marks
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                                  test.status === 'Published' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                                }`}>
                                  {test.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => navigate(`/admin/tests/${test.id}/questions`)} className="px-3 py-2 bg-[#5B5FFB] text-white rounded-xl hover:bg-[#4A4DE0] transition-colors text-xs font-bold flex items-center gap-2 shadow-sm">
                                    <ListPlus className="w-3 h-3" /> Questions
                                  </button>
                                  <button onClick={() => openTestModal(test)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleTestDelete(test.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors shadow-sm">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </DraggableAny>
                      ))}
                      {provided.placeholder}
                      {tests.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            No tests found for this section.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  )}
                </Droppable>
              </table>
            </div>
          </DragDropContext>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E1E2D] rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                {editingId ? 'Edit Section' : 'New Section'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Section Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold"
                  placeholder="e.g. Reasoning"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Section Logo</label>
                <div className="flex items-center gap-4">
                   <div className="w-20 h-20 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
                      {formData.logoUrl ? (
                         <img loading="lazy" src={formData.logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                         <ImageIcon className="w-8 h-8 text-gray-300" />
                      )}
                   </div>
                   <div className="flex-1">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold cursor-pointer hover:bg-gray-50 transition-colors">
                         {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                         {isUploading ? 'Uploading...' : 'Upload Logo'}
                         <input type="file" accept=".png,.jpg,.jpeg,.svg" className="hidden" onChange={handleLogoUpload} disabled={isUploading} />
                      </label>
                      <p className="text-[10px] text-gray-500 mt-2">Recommended: PNG, JPG, JPEG or SVG (200x200px)</p>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Icon (Lucide)</label>
                  <input
                    required
                    type="text"
                    value={formData.iconName}
                    onChange={e => setFormData({ ...formData, iconName: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold"
                    placeholder="e.g. Zap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Theme</label>
                  <select
                    value={formData.themeColor}
                    onChange={e => setFormData({ ...formData, themeColor: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold"
                  >
                    {themeColors.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold"
                  />
                </div>
                <div className="flex items-center pt-6">
                   <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                       <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="hidden"
                    />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Published</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-[#5B5FFB] text-white rounded-2xl font-bold hover:bg-[#4A4DE0] transition-all shadow-lg shadow-blue-500/20"
                >
                  {editingId ? 'Save Changes' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTestModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E1E2D] rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                {editingTestId ? 'Edit Test Meta' : 'New Test'}
              </h3>
              <button onClick={() => setIsTestModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleTestSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Test Title *</label>
                <input
                  required
                  type="text"
                  value={testFormData.title}
                  onChange={e => setTestFormData({ ...testFormData, title: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold"
                  placeholder="e.g. Reasoning Speed Test - 01"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Duration (Min)</label>
                  <input
                    type="number"
                    value={testFormData.durationMinutes}
                    onChange={e => setTestFormData({ ...testFormData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={testFormData.displayOrder}
                    onChange={e => setTestFormData({ ...testFormData, displayOrder: Math.floor(Math.abs(Number(e.target.value))) })}
                    className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold"
                    placeholder="1, 2, 3..."
                  />
                  <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-wider">Lower numbers appear first.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Status</label>
                  <select
                    value={testFormData.status}
                    onChange={e => setTestFormData({ ...testFormData, status: e.target.value as any })}
                    className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-[#5B5FFB] text-white rounded-2xl font-bold hover:bg-[#4A4DE0] transition-all shadow-lg shadow-blue-500/20"
                >
                  {editingTestId ? 'Update Meta' : 'Next: Add Questions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
