import re

with open("src/pages/ExamDetail.tsx", "r") as f:
    content = f.read()

# Wrap "Add Subject" button
old_add_subject = """        <button 
          onClick={() => handleOpenSubjectModal()} 
          className="absolute top-0 right-0 z-10 flex items-center gap-2 bg-[#5B5FFB] text-white px-5 py-2.5 rounded-full shadow-lg hover:bg-[#4A4DE0] hover:scale-105 transition-all text-sm font-semibold"
        >
          <Plus className="w-5 h-5" /> Add Subject
        </button>"""
new_add_subject = """        {isAdmin && (
          <button 
            onClick={() => handleOpenSubjectModal()} 
            className="absolute top-0 right-0 z-10 flex items-center gap-2 bg-[#5B5FFB] text-white px-5 py-2.5 rounded-full shadow-lg hover:bg-[#4A4DE0] hover:scale-105 transition-all text-sm font-semibold"
          >
            <Plus className="w-5 h-5" /> Add Subject
          </button>
        )}"""
content = content.replace(old_add_subject, new_add_subject)

# Wrap Edit/Delete subject buttons
old_edit_subject = """              <div className="absolute top-2 right-2 flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); handleOpenSubjectModal(subject); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteSubject(subject.id); }} className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>"""
new_edit_subject = """              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); handleOpenSubjectModal(subject); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteSubject(subject.id); }} className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}"""
content = content.replace(old_edit_subject, new_edit_subject)

with open("src/pages/ExamDetail.tsx", "w") as f:
    f.write(content)
