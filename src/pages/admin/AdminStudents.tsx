import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Users, Search, Loader2, Download, Filter, MoreVertical } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // We assume a 'users' collection exists based on Firebase Auth and standard structures
    const q = query(collection(db, 'users'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    
    return () => unsub();
  }, []);

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(students.map(s => ({
      ID: s.id,
      Name: s.displayName || s.name || 'N/A',
      Email: s.email,
      Role: s.role || 'user',
      'Created At': s.createdAt || s.created_at || 'N/A'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students_export.xlsx");
  };

  const filtered = students.filter(s => {
    const name = (s.displayName || s.name || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1E1E2D] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#5B5FFB]" />
            Students Directory
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage registered users, view progress, and export data.</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-6 py-2.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl font-bold hover:bg-green-100 dark:hover:bg-green-500/20 transition-all">
          <Download className="w-5 h-5" /> Export Data
        </button>
      </div>

      <div className="bg-white dark:bg-[#1E1E2D] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#151521] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] outline-none text-gray-900 dark:text-white transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <Filter className="w-5 h-5" /> Filter by Plan
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>
      ) : (
        <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#151521] text-left">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-[#F8FAFC] dark:bg-[#151521]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                          {(s.displayName || s.name || s.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{s.displayName || s.name || 'Anonymous User'}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        s.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {s.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-[#5B5FFB] transition-colors rounded-lg">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
