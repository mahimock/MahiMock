const fs = require('fs');
let code = fs.readFileSync('src/components/NotificationCenter.tsx', 'utf8');

if (!code.includes('deleteAllNotifications')) {
  // Add delete functionality
  code = code.replace("import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit, writeBatch } from 'firebase/firestore';", "import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit, writeBatch, deleteDoc } from 'firebase/firestore';");
  
  code = code.replace("const markAsRead = async (id: string) => {", `const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'notifications', id));
    } catch(err) {}
  };
  
  const deleteAllNotifications = async () => {
    if (!currentUser || notifications.length === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach(n => {
        batch.delete(doc(db, 'users', currentUser.uid, 'notifications', n.id));
      });
      await batch.commit();
    } catch(err) {}
  };
  
  const markAsRead = async (id: string) => {`);

  code = code.replace("{unreadCount > 0 && (\\s*<span.*?</span>\\s*)}", `$&
               <div className="flex gap-2">
                 {unreadCount > 0 && <button onClick={(e) => { e.stopPropagation(); markAllAsRead(); }} className="text-[10px] text-[#5B5FFB] hover:underline">Mark all read</button>}
                 {notifications.length > 0 && <button onClick={(e) => { e.stopPropagation(); deleteAllNotifications(); }} className="text-[10px] text-red-500 hover:underline">Clear all</button>}
               </div>`);
               
  code = code.replace("className={`p-4 hover:bg-gray-50 dark:hover:bg-white/5 dark:bg-white/5 transition-colors group cursor-pointer ${!n.read ? 'bg-blue-50/30 dark:bg-blue-500/10' : ''}`}", "className={`relative p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer ${!n.read ? 'bg-blue-50/30 dark:bg-blue-500/10' : ''}`}");

  code = code.replace("{n.link && (", `<button onClick={(e) => deleteNotification(e, n.id)} className="absolute top-2 right-2 p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"><X className="w-4 h-4" /></button>\n                          {n.link && (`);
  
  fs.writeFileSync('src/components/NotificationCenter.tsx', code);
}
