const fs = require('fs');
let code = fs.readFileSync('src/components/NotificationCenter.tsx', 'utf8');

code = code.replace('{unreadCount > 0 && (\n                 <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold">\n                   {unreadCount} New\n                 </span>\n               )}',
`               <div className="flex gap-3 items-center">
                 {unreadCount > 0 && <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold">{unreadCount} New</span>}
                 {unreadCount > 0 && <button onClick={(e) => { e.stopPropagation(); markAllAsRead(); }} className="text-[10px] text-[#5B5FFB] hover:underline font-bold">Mark all read</button>}
                 {notifications.length > 0 && <button onClick={(e) => { e.stopPropagation(); deleteAllNotifications(); }} className="text-[10px] text-red-500 hover:underline font-bold">Clear all</button>}
               </div>`);

fs.writeFileSync('src/components/NotificationCenter.tsx', code);
