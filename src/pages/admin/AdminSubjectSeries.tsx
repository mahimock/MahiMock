import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Edit2, Trash2, X, Loader2, BookOpen, ChevronRight, LayoutGrid, FileQuestion, PlusCircle, Settings, Image as ImageIcon, UploadCloud, PlayCircle, Clock, FileText, ListPlus, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadImageToCloudinary } from '../../lib/cloudinary';

interface SubjectSeries {
  id: string;
  name: string;
  description?: string;
  iconName: string;
  logoUrl?: string;
  themeColor: string;
  isActive: boolean;
  order: number;
}

interface SubjectTopic {
  id: string;
  subjectSeriesId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  order: number;
}

interface Test {
  id: string;
  title: string;
  description?: string;
  logoUrl?: string;
  subjectSeriesId: string;
  subjectTopicId?: string;
  questionsCount: number;
  marks: number;
  negativeMarks: number;
  durationMinutes: number;
  status: 'Draft' | 'Published';
  createdAt: number;
  displayOrder: number;
}

const DraggableAny = Draggable as any;

export default function AdminSubjectSeries() {
  const [view, setView] = useState<'subjects' | 'topics' | 'tests'>('subjects');
  const [selectedSubject, setSelectedSubject] = useState<SubjectSeries | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<SubjectTopic | null>(null);
  const [series, setSeries] = useState<SubjectSeries[]>([]);
  const [topics, setTopics] = useState<SubjectTopic[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState<Omit<SubjectSeries, 'id'>>({
    name: '',
    description: '',
    iconName: 'BookOpen',
    logoUrl: '',
    themeColor: 'blue',
    isActive: true,
    order: 0
  });

  const [topicFormData, setTopicFormData] = useState<Omit<SubjectTopic, 'id'>>({
    subjectSeriesId: '',
    name: '',
    description: '',
    logoUrl: '',
    isActive: true,
    order: 0
  });

  const [testFormData, setTestFormData] = useState({
    title: '',
    description: '',
    logoUrl: '',
    durationMinutes: 60,
    questionsCount: 0,
    marks: 100,
    negativeMarks: 0.25,
    status: 'Draft' as const,
    subjectSeriesId: '',
    subjectTopicId: '',
    displayOrder: 0
  });

  const themeColors = [
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'purple', label: 'Purple' },
    { value: 'red', label: 'Red' },
    { value: 'orange', label: 'Orange' },
    { value: 'amber', label: 'Amber' },
    { value: 'pink', label: 'Pink' },
    { value: 'indigo', label: 'Indigo' },
    { value: 'teal', label: 'Teal' },
    { value: 'cyan', label: 'Cyan' }
  ];

  useEffect(() => {
    const q = query(collection(db, 'subjectSeries'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubjectSeries));
      setSeries(fetched);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error('Failed to load subject series');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (view === 'topics' && selectedSubject) {
      setLoading(true);
      const q = query(
        collection(db, 'subjectTopics'), 
        where('subjectSeriesId', '==', selectedSubject.id)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubjectTopic));
        fetched.sort((a, b) => (a.order || 0) - (b.order || 0));
        setTopics(fetched);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [view, selectedSubject]);

  useEffect(() => {
    if (view === 'tests' && selectedSubject) {
      setLoading(true);
      let q;
      if (selectedTopic) {
        q = query(
          collection(db, 'tests'),
          where('subjectSeriesId', '==', selectedSubject.id),
          where('subjectTopicId', '==', selectedTopic.id),
          orderBy('order', 'asc')
        );
      } else {
        q = query(
          collection(db, 'tests'),
          where('subjectSeriesId', '==', selectedSubject.id),
          where('subjectTopicId', '==', ''),
          orderBy('order', 'asc')
        );
      }

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        let fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Test));
        
        // Migration: If displayOrder is missing, assign it from order or index
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
          const qFallback = selectedTopic ? 
            query(collection(db, 'tests'), where('subjectSeriesId', '==', selectedSubject.id), where('subjectTopicId', '==', selectedTopic.id)) :
            query(collection(db, 'tests'), where('subjectSeriesId', '==', selectedSubject.id), where('subjectTopicId', '==', ''));
          
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
  }, [view, selectedSubject, selectedTopic]);

  const reindexTests = async (subjectId: string, topicId: string = '') => {
    const q = query(
      collection(db, 'tests'),
      where('subjectSeriesId', '==', subjectId),
      where('subjectTopicId', '==', topicId),
      orderBy('displayOrder', 'asc')
    );
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((doc, index) => {
      batch.update(doc.ref, { displayOrder: index });
    });
    await batch.commit();
  };

  const reindexTopics = async (subjectId: string) => {
    const q = query(
      collection(db, 'subjectTopics'),
      where('subjectSeriesId', '==', subjectId),
      orderBy('order', 'asc')
    );
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((doc, index) => {
      batch.update(doc.ref, { order: index });
    });
    await batch.commit();
  };

  const reindexSeries = async () => {
    const q = query(collection(db, 'subjectSeries'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((doc, index) => {
      batch.update(doc.ref, { order: index });
    });
    await batch.commit();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'subjectSeries', editingId), formData);
        toast.success('Subject Series updated successfully');
      } else {
        await addDoc(collection(db, 'subjectSeries'), formData);
        toast.success('Subject Series added successfully');
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
    if (window.confirm('Are you sure you want to delete this Subject Series? This will not delete its tests.')) {
      try {
        await deleteDoc(doc(db, 'subjectSeries', id));
        await reindexSeries();
        toast.success('Deleted successfully');
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const openModal = (item?: SubjectSeries) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        description: item.description || '',
        iconName: item.iconName || 'BookOpen',
        logoUrl: item.logoUrl || '',
        themeColor: item.themeColor || 'blue',
        isActive: item.isActive,
        order: item.order || 0
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        iconName: 'BookOpen',
        logoUrl: '',
        themeColor: 'blue',
        isActive: true,
        order: series.length
      });
    }
    setIsModalOpen(true);
  };

  const openTopicModal = (item?: SubjectTopic) => {
    if (item) {
      setEditingTopicId(item.id);
      setTopicFormData({
        subjectSeriesId: item.subjectSeriesId,
        name: item.name,
        description: item.description || '',
        logoUrl: item.logoUrl || '',
        isActive: item.isActive,
        order: item.order || 0
      });
    } else {
      setEditingTopicId(null);
      setTopicFormData({
        subjectSeriesId: selectedSubject?.id || '',
        name: '',
        description: '',
        logoUrl: '',
        isActive: true,
        order: topics.length
      });
    }
    setIsTopicModalOpen(true);
  };

  const handleTopicLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setTopicFormData(prev => ({ ...prev, logoUrl: url }));
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      console.error('Topic logo upload error:', error);
      toast.error(error.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTopicId) {
        await updateDoc(doc(db, 'subjectTopics', editingTopicId), topicFormData);
        toast.success('Topic updated successfully');
      } else {
        await addDoc(collection(db, 'subjectTopics'), topicFormData);
        toast.success('Topic added successfully');
      }
      setIsTopicModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Operation failed');
    }
  };

  const handleTopicDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this Topic?')) {
      try {
        await deleteDoc(doc(db, 'subjectTopics', id));
        if (selectedSubject) {
          await reindexTopics(selectedSubject.id);
        }
        toast.success('Deleted successfully');
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const openTestModal = (test?: Test) => {
    if (test) {
      setEditingTestId(test.id);
      setTestFormData({
        title: test.title,
        description: test.description || '',
        logoUrl: test.logoUrl || '',
        durationMinutes: test.durationMinutes,
        questionsCount: test.questionsCount,
        marks: test.marks,
        negativeMarks: test.negativeMarks || 0,
        status: test.status,
        subjectSeriesId: test.subjectSeriesId,
        subjectTopicId: test.subjectTopicId || '',
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
        description: '',
        logoUrl: '',
        durationMinutes: 60,
        questionsCount: 0,
        marks: 100,
        negativeMarks: 0.25,
        status: 'Draft',
        subjectSeriesId: selectedSubject?.id || '',
        subjectTopicId: selectedTopic?.id || '',
        displayOrder: maxOrder + 1
      });
    }
    setIsTestModalOpen(true);
  };

  const handleTestLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setTestFormData(prev => ({ ...prev, logoUrl: url }));
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      console.error('Test logo upload error:', error);
      toast.error(error.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
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
        
        // Re-index remaining tests
        if (selectedSubject) {
          await reindexTests(selectedSubject.id, selectedTopic?.id || '');
        }
        
        toast.success('Test deleted');
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const items = view === 'subjects' ? [...series] : view === 'topics' ? [...topics] : [...tests];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for smooth UI
    if (view === 'subjects') setSeries(items as SubjectSeries[]);
    else if (view === 'topics') setTopics(items as SubjectTopic[]);
    else setTests(items as Test[]);

    // Update Firestore
    try {
      const batch = writeBatch(db);
      items.forEach((item, index) => {
        const collectionName = view === 'subjects' ? 'subjectSeries' : view === 'topics' ? 'subjectTopics' : 'tests';
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

  if (loading && view === 'subjects') {
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
            <span className="cursor-pointer hover:text-[#5B5FFB]" onClick={() => { setView('subjects'); setSelectedTopic(null); }}>Subject Series</span>
            {(view === 'topics' || view === 'tests') && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className={`cursor-pointer hover:text-[#5B5FFB] ${!selectedTopic && view === 'topics' ? 'text-gray-900 dark:text-white font-medium' : ''}`} onClick={() => { setView('topics'); setSelectedTopic(null); }}>{selectedSubject?.name}</span>
              </>
            )}
            {view === 'tests' && selectedTopic && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 dark:text-white font-medium">{selectedTopic.name}</span>
              </>
            )}
            {view === 'tests' && !selectedTopic && (
               <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 dark:text-white font-medium">Full Mock Tests</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {view === 'subjects' ? 'Subject Test Series' : 
             view === 'topics' ? `${selectedSubject?.name} - Topics` :
             selectedTopic ? `${selectedTopic.name} - Tests` : `${selectedSubject?.name} - Full Mock Tests`}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {view === 'subjects' ? 'Manage global subject series for homepage.' : 
             view === 'topics' ? `Manage topics for ${selectedSubject?.name}.` : 
             `Manage practice tests for ${selectedTopic ? selectedTopic.name : selectedSubject?.name}.`}
          </p>
        </div>
        <div className="flex gap-3">
           {view === 'subjects' && (
            <button onClick={() => openModal()} className="bg-[#5B5FFB] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#4A4DE0] transition-colors shadow-sm font-semibold">
              <Plus className="w-5 h-5" /> Add Subject
            </button>
           )}
           {view === 'topics' && (
            <button onClick={() => openTopicModal()} className="bg-[#5B5FFB] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#4A4DE0] transition-colors shadow-sm font-semibold">
              <Plus className="w-5 h-5" /> Add Topic
            </button>
           )}
           {view === 'tests' && (
            <button onClick={() => openTestModal()} className="bg-[#5B5FFB] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#4A4DE0] transition-colors shadow-sm font-semibold">
              <Plus className="w-5 h-5" /> {selectedTopic ? 'Add Topic Test' : 'Add Subject Mock'}
            </button>
           )}
        </div>
      </div>

      {view === 'subjects' ? (
        <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-[#2A2A3D] border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-center font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">#</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject Name</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Appearance</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <Droppable droppableId="subjects">
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
                                      <div className="flex gap-3 mt-1">
                                        <button onClick={() => { setSelectedSubject(item); setView('topics'); }} className="text-[#5B5FFB] hover:underline font-semibold text-xs">Manage Topics</button>
                                        <div className="w-1 h-1 rounded-full bg-gray-300 mt-2" />
                                        <button onClick={() => { setSelectedSubject(item); setSelectedTopic(null); setView('tests'); }} className="text-orange-500 hover:underline font-semibold text-xs">Full Mock Tests</button>
                                      </div>
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
      ) : view === 'topics' ? (
        <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-[#2A2A3D] border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-center font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">#</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Topic Name</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <Droppable droppableId="topics">
                  {(provided) => (
                    <tbody {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-gray-100 dark:divide-gray-800">
                      {topics.map((topic, index) => (
                        <DraggableAny draggableId={topic.id} index={index} key={topic.id}>
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
                                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                    {topic.logoUrl ? (
                                      <img loading="lazy" src={topic.logoUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <BookOpen className="w-5 h-5 text-gray-400" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900 dark:text-white text-base">{topic.name}</div>
                                    <button onClick={() => { setSelectedTopic(topic); setView('tests'); }} className="text-[#5B5FFB] hover:underline font-semibold text-xs mt-1 flex items-center gap-1">
                                      <Settings className="w-3 h-3" /> Manage Practice Tests
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                                  topic.isActive ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                                }`}>
                                  {topic.isActive ? 'Published' : 'Draft'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => openTopicModal(topic)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleTopicDelete(topic.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors shadow-sm">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </DraggableAny>
                      ))}
                      {provided.placeholder}
                      {topics.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            No topics found for this subject.
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
                            No tests found for this {selectedTopic ? 'topic' : 'subject'}.
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
                {editingId ? 'Edit Subject' : 'New Subject'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Subject Name *</label>
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
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold h-24 resize-none"
                  placeholder="Subject description..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Subject Logo</label>
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
                    placeholder="e.g. Brain"
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
                  {editingId ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTopicModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E1E2D] rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                {editingTopicId ? 'Edit Topic' : 'New Topic'}
              </h3>
              <button onClick={() => setIsTopicModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleTopicSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Topic Name *</label>
                <input
                  required
                  type="text"
                  value={topicFormData.name}
                  onChange={e => setTopicFormData({ ...topicFormData, name: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold"
                  placeholder="e.g. Fundamental Rights"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Topic Logo</label>
                <div className="flex items-center gap-4">
                   <div className="w-20 h-20 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
                      {topicFormData.logoUrl ? (
                         <img loading="lazy" src={topicFormData.logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                         <ImageIcon className="w-8 h-8 text-gray-300" />
                      )}
                   </div>
                   <div className="flex-1">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold cursor-pointer hover:bg-gray-50 transition-colors">
                         {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                         {isUploading ? 'Uploading...' : 'Upload Topic Logo'}
                         <input type="file" accept=".png,.jpg,.jpeg,.svg" className="hidden" onChange={handleTopicLogoUpload} disabled={isUploading} />
                      </label>
                   </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Description</label>
                <textarea
                  value={topicFormData.description}
                  onChange={e => setTopicFormData({ ...topicFormData, description: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold h-24 resize-none"
                  placeholder="Topic description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Order</label>
                  <input
                    type="number"
                    value={topicFormData.order}
                    onChange={e => setTopicFormData({ ...topicFormData, order: Number(e.target.value) })}
                    className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold"
                  />
                </div>
                <div className="flex items-center pt-6">
                   <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${topicFormData.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                       <div className={`w-4 h-4 bg-white rounded-full transition-transform ${topicFormData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                    <input
                      type="checkbox"
                      checked={topicFormData.isActive}
                      onChange={e => setTopicFormData({ ...topicFormData, isActive: e.target.checked })}
                      className="hidden"
                    />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Active</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-[#5B5FFB] text-white rounded-2xl font-bold hover:bg-[#4A4DE0] transition-all shadow-lg shadow-blue-500/20"
                >
                  {editingTopicId ? 'Save Changes' : 'Create Topic'}
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

            <form onSubmit={handleTestSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto hide-scrollbar">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Test Title *</label>
                <input
                  required
                  type="text"
                  value={testFormData.title}
                  onChange={e => setTestFormData({ ...testFormData, title: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold"
                  placeholder="e.g. Fundamental Rights - Test 1"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Test Logo / Icon</label>
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
                      {testFormData.logoUrl ? (
                         <img loading="lazy" src={testFormData.logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                         <ImageIcon className="w-6 h-6 text-gray-300" />
                      )}
                   </div>
                   <div className="flex-1">
                      <label className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-50 transition-colors">
                         {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                         {isUploading ? 'Uploading...' : 'Upload Logo'}
                         <input type="file" accept=".png,.jpg,.jpeg,.svg" className="hidden" onChange={handleTestLogoUpload} disabled={isUploading} />
                      </label>
                   </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Test Description</label>
                <textarea
                  value={testFormData.description}
                  onChange={e => setTestFormData({ ...testFormData, description: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold h-24 resize-none"
                  placeholder="Brief description of the test..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Questions Count</label>
                  <input
                    type="number"
                    value={testFormData.questionsCount}
                    onChange={e => setTestFormData({ ...testFormData, questionsCount: Number(e.target.value) })}
                    className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Duration (Min)</label>
                  <input
                    type="number"
                    value={testFormData.durationMinutes}
                    onChange={e => setTestFormData({ ...testFormData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold"
                  />
                </div>
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

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Total Marks</label>
                  <input
                    type="number"
                    value={testFormData.marks}
                    onChange={e => setTestFormData({ ...testFormData, marks: Number(e.target.value) })}
                    className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Negative Marks</label>
                  <input
                    type="number"
                    step="0.01"
                    value={testFormData.negativeMarks}
                    onChange={e => setTestFormData({ ...testFormData, negativeMarks: Number(e.target.value) })}
                    className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Status</label>
                <select
                  value={testFormData.status}
                  onChange={e => setTestFormData({ ...testFormData, status: e.target.value as any })}
                  className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-[#2A2A3D] text-gray-900 dark:text-white focus:border-[#5B5FFB] outline-none transition-all font-semibold cursor-pointer"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="submit" disabled={isUploading}
                  className="flex-1 py-4 bg-[#5B5FFB] text-white rounded-2xl font-bold hover:bg-[#4A4DE0] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
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
