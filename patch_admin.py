import re

with open("src/pages/admin/AdminMockTests.tsx", "r") as f:
    content = f.read()

# 1. Update Imports
content = content.replace("import { FolderOpen } from 'lucide-react';", "import { FolderOpen, BookOpen, Layers } from 'lucide-react';")

# 2. Update view state
content = content.replace(
    "const [view, setView] = useState<'categories' | 'exams' | 'testTypes' | 'tests'>('categories');",
    "const [view, setView] = useState<'categories' | 'exams' | 'testTypes' | 'subjects' | 'chapters' | 'tests'>('categories');\n  const [selectedSubject, setSelectedSubject] = useState<any>(null);\n  const [selectedChapter, setSelectedChapter] = useState<any>(null);\n  const [subjects, setSubjects] = useState<any[]>([]);\n  const [chapters, setChapters] = useState<any[]>([]);\n  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);\n  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);\n  const [subjectFormData, setSubjectFormData] = useState({ name: '', displayOrder: 0 });\n  const [chapterFormData, setChapterFormData] = useState({ name: '', displayOrder: 0 });"
)

# 3. Add fetching hooks
fetch_hooks = """
  // Fetch Subjects
  useEffect(() => {
    if (view === 'subjects' && selectedExam) {
      setLoading(true);
      const q = query(collection(db, 'subjects'), where('examId', '==', selectedExam.id));
      const unsub = onSnapshot(q, snap => {
        setSubjects(snap.docs.map(d => ({id: d.id, ...d.data()})));
        setLoading(false);
      });
      return () => unsub();
    }
  }, [view, selectedExam]);

  // Fetch Chapters
  useEffect(() => {
    if (view === 'chapters' && selectedSubject) {
      setLoading(true);
      const q = query(collection(db, 'chapters'), where('subjectId', '==', selectedSubject.id));
      const unsub = onSnapshot(q, snap => {
        setChapters(snap.docs.map(d => ({id: d.id, ...d.data()})));
        setLoading(false);
      });
      return () => unsub();
    }
  }, [view, selectedSubject]);
"""
content = content.replace("// Fetch Tests\n  useEffect(() => {", fetch_hooks + "\n  // Fetch Tests\n  useEffect(() => {")

# 4. Modify test fetching
old_test_fetch = """      const q = query(collection(db, 'tests'), where('examId', '==', selectedExam.id), where('type', '==', selectedTestType));"""
new_test_fetch = """      let q;
      if (selectedTestType === 'Topic Tests' && selectedChapter) {
        q = query(collection(db, 'tests'), where('chapterId', '==', selectedChapter.id), where('type', '==', selectedTestType));
      } else {
        q = query(collection(db, 'tests'), where('examId', '==', selectedExam.id), where('type', '==', selectedTestType));
      }"""
content = content.replace(old_test_fetch, new_test_fetch)
content = content.replace("}, [view, selectedCategory, selectedExam, selectedTestType]);", "}, [view, selectedCategory, selectedExam, selectedTestType, selectedChapter]);")

# 5. Modify Topic Tests click
old_topic_click = "onClick={() => { setSelectedTestType(type); setView('tests'); }}"
new_topic_click = "onClick={() => { setSelectedTestType(type); if(type === 'Topic Tests') setView('subjects'); else setView('tests'); }}"
content = content.replace(old_topic_click, new_topic_click)

# 6. Breadcrumbs
old_bc = """        {selectedTestType && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => setView('tests')} className={`hover:text-[#5B5FFB] font-medium transition-colors ${view === 'tests' ? 'text-[#5B5FFB] font-bold' : ''}`}>
              {selectedTestType}
            </button>
          </>
        )}"""
new_bc = """        {selectedTestType && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => { if(selectedTestType === 'Topic Tests') setView('subjects'); else setView('tests'); }} className={`hover:text-[#5B5FFB] font-medium transition-colors ${(view === 'tests' && selectedTestType !== 'Topic Tests') || view === 'subjects' ? 'text-[#5B5FFB] font-bold' : ''}`}>
              {selectedTestType}
            </button>
          </>
        )}
        {selectedTestType === 'Topic Tests' && selectedSubject && (view === 'chapters' || view === 'tests') && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => setView('chapters')} className={`hover:text-[#5B5FFB] font-medium transition-colors ${view === 'chapters' ? 'text-[#5B5FFB] font-bold' : ''}`}>
              {selectedSubject.name}
            </button>
          </>
        )}
        {selectedTestType === 'Topic Tests' && selectedChapter && view === 'tests' && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => setView('tests')} className={`hover:text-[#5B5FFB] font-medium transition-colors ${view === 'tests' ? 'text-[#5B5FFB] font-bold' : ''}`}>
              {selectedChapter.name}
            </button>
          </>
        )}"""
content = content.replace(old_bc, new_bc)

# 7. Add Add Subject / Add Chapter buttons
old_btn = """        {selectedTestType && ("""
new_btn = """        {view === 'subjects' && (
          <div className="flex gap-2">
            <button onClick={() => setIsSubjectModalOpen(true)} className="flex bg-[#5B5FFB] hover:bg-[#4A4DE0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold items-center gap-2 shadow-sm">
              <Plus className="w-5 h-5" /> Add Subject
            </button>
          </div>
        )}
        {view === 'chapters' && (
          <div className="flex gap-2">
            <button onClick={() => setIsChapterModalOpen(true)} className="flex bg-[#5B5FFB] hover:bg-[#4A4DE0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold items-center gap-2 shadow-sm">
              <Plus className="w-5 h-5" /> Add Chapter
            </button>
          </div>
        )}
        {view === 'tests' && selectedTestType && ("""
content = content.replace(old_btn, new_btn)

# 8. Titles
old_title = """            {view === 'testTypes' && 'Select Test Type'}
            {view === 'tests' && selectedTestType}
            {view === 'questions' && 'Manage Questions'}"""
new_title = """            {view === 'testTypes' && 'Select Test Type'}
            {view === 'subjects' && 'Select Subject'}
            {view === 'chapters' && 'Select Chapter'}
            {view === 'tests' && selectedTestType}
            {view === 'questions' && 'Manage Questions'}"""
content = content.replace(old_title, new_title)

# 9. Add Subjects and Chapters Views JSX
views_jsx = """
      {/* Subjects View */}
      {view === 'subjects' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <div 
              key={subject.id} 
              onClick={() => { setSelectedSubject(subject); setView('chapters'); }}
              className="bg-white dark:bg-[#1E1E2D] p-6 rounded-2xl border border-gray-100 dark:border-[#3A3A4D] hover:border-[#5B5FFB] hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{subject.name}</h3>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#5B5FFB] transition-colors" />
            </div>
          ))}
          {subjects.length === 0 && !loading && (
            <div className="col-span-full p-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1E1E2D] rounded-2xl border border-gray-100 dark:border-[#3A3A4D]">
              No subjects found. Click "Add Subject" to create one.
            </div>
          )}
        </div>
      )}

      {/* Chapters View */}
      {view === 'chapters' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map(chapter => (
            <div 
              key={chapter.id} 
              onClick={() => { setSelectedChapter(chapter); setView('tests'); }}
              className="bg-white dark:bg-[#1E1E2D] p-6 rounded-2xl border border-gray-100 dark:border-[#3A3A4D] hover:border-[#5B5FFB] hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{chapter.name}</h3>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#5B5FFB] transition-colors" />
            </div>
          ))}
          {chapters.length === 0 && !loading && (
            <div className="col-span-full p-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1E1E2D] rounded-2xl border border-gray-100 dark:border-[#3A3A4D]">
              No chapters found. Click "Add Chapter" to create one.
            </div>
          )}
        </div>
      )}
"""
content = content.replace("{/* Tests View */}", views_jsx + "\n      {/* Tests View */}")

# 10. Modals
modals_jsx = """
      {/* Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-[#3A3A4D] flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Subject</h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2A3D] rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Subject Name *</label>
                <input required type="text" value={subjectFormData.name} onChange={e => setSubjectFormData({...subjectFormData, name: e.target.value})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" placeholder="e.g. Mathematics" />
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsSubjectModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#2A2A3D] text-gray-700 dark:text-white font-semibold">Cancel</button>
                <button 
                  onClick={async () => {
                    if(!subjectFormData.name) return toast.error("Name required");
                    setSaving(true);
                    try {
                      await addDoc(collection(db, 'subjects'), { ...subjectFormData, examId: selectedExam.id, isActive: true });
                      toast.success("Subject Added");
                      setIsSubjectModalOpen(false);
                      setSubjectFormData({name: '', displayOrder: 0});
                    } catch(e) { toast.error("Error"); }
                    setSaving(false);
                  }} 
                  disabled={saving} className="px-4 py-2 rounded-xl bg-[#5B5FFB] text-white font-semibold flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Subject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Modal */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-[#3A3A4D] flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Chapter</h3>
              <button onClick={() => setIsChapterModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2A3D] rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Chapter Name *</label>
                <input required type="text" value={chapterFormData.name} onChange={e => setChapterFormData({...chapterFormData, name: e.target.value})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" placeholder="e.g. Algebra" />
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsChapterModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#2A2A3D] text-gray-700 dark:text-white font-semibold">Cancel</button>
                <button 
                  onClick={async () => {
                    if(!chapterFormData.name) return toast.error("Name required");
                    setSaving(true);
                    try {
                      await addDoc(collection(db, 'chapters'), { ...chapterFormData, examId: selectedExam.id, subjectId: selectedSubject.id });
                      toast.success("Chapter Added");
                      setIsChapterModalOpen(false);
                      setChapterFormData({name: '', displayOrder: 0});
                    } catch(e) { toast.error("Error"); }
                    setSaving(false);
                  }} 
                  disabled={saving} className="px-4 py-2 rounded-xl bg-[#5B5FFB] text-white font-semibold flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Chapter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
"""
content = content.replace("{/* Add Test & Question Builder Modal */}", modals_jsx + "\n      {/* Add Test & Question Builder Modal */}")

# 11. Test Save linking
content = content.replace("categoryId: selectedCategory.id,", "categoryId: selectedCategory.id,\n        subjectId: selectedSubject ? selectedSubject.id : null,\n        chapterId: selectedChapter ? selectedChapter.id : null,")

with open("src/pages/admin/AdminMockTests.tsx", "w") as f:
    f.write(content)
