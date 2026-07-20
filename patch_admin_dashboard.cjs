const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf-8');

// Replace class names to support dark mode
code = code.replace(
  "className=\"text-2xl font-bold text-gray-900\"",
  "className=\"text-2xl font-bold text-gray-900 dark:text-white\""
);

code = code.replace(
  "className=\"text-sm text-gray-500 mt-1\"",
  "className=\"text-sm text-gray-500 dark:text-gray-400 mt-1\""
);

// Stat cards replacement
const statCardsBlock = `
          <div key={index} className="bg-white dark:bg-[#1E1E2D] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className={\`w-14 h-14 rounded-2xl flex items-center justify-center \${stat.color.replace('bg-', 'bg-').replace('text-', 'text-')}\`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
            </div>
          </div>
`;

code = code.replace(
  /<div key=\{index\} className="bg-white[\s\S]*?<\/div>\n        }\)\)/,
  statCardsBlock + "\n        }))"
);

// Stat Card Colors
code = code.replace(
  "color: 'bg-blue-50 text-blue-600'",
  "color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'"
);
code = code.replace(
  "color: 'bg-purple-50 text-purple-600'",
  "color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'"
);
code = code.replace(
  "color: 'bg-green-50 text-green-600'",
  "color: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'"
);
code = code.replace(
  "color: 'bg-orange-50 text-orange-600'",
  "color: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'"
);
code = code.replace(
  "color: 'bg-pink-50 text-pink-600'",
  "color: 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400'"
);

// Quick actions container
code = code.replace(
  "className=\"bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-8\"",
  "className=\"bg-white dark:bg-[#1E1E2D] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mt-8\""
);

code = code.replace(
  "className=\"text-lg font-bold text-gray-900 mb-4\"",
  "className=\"text-lg font-bold text-gray-900 dark:text-white mb-4\""
);

code = code.replace(
  "className=\"text-sm text-gray-500 mb-6\"",
  "className=\"text-sm text-gray-500 dark:text-gray-400 mb-6\""
);

// Quick actions cards
const quickActionCardFind = "className=\"p-4 bg-gray-50 rounded-xl border border-gray-100\"";
const quickActionCardReplace = "className=\"p-4 bg-gray-50 dark:bg-[#151521] rounded-xl border border-gray-100 dark:border-gray-800 transition-colors hover:border-[#5B5FFB] dark:hover:border-[#5B5FFB]\"";

code = code.split(quickActionCardFind).join(quickActionCardReplace);

code = code.split("className=\"font-semibold text-gray-900 mb-1\"").join("className=\"font-semibold text-gray-900 dark:text-white mb-1\"");
code = code.split("className=\"text-xs text-gray-500\"").join("className=\"text-xs text-gray-500 dark:text-gray-400\"");

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
