const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMockTests.tsx', 'utf-8');

// Ensure inputs, selects, textareas have dark:bg-[#2A2A3D] dark:text-white dark:placeholder-[#B0B0B0]
code = code.replace(/<input([^>]*)className="([^"]*)"/g, (match, before, classes) => {
  if (before.includes('type="file"')) return match;
  let cleanClasses = classes;
  if (!cleanClasses.includes("dark:bg-[#2A2A3D]")) cleanClasses += " dark:bg-[#2A2A3D]";
  if (!cleanClasses.includes("dark:text-white")) cleanClasses += " dark:text-white";
  if (!cleanClasses.includes("dark:placeholder-[#B0B0B0]")) cleanClasses += " dark:placeholder-[#B0B0B0]";
  return `<input${before}className="${cleanClasses}"`;
});

code = code.replace(/<select([^>]*)className="([^"]*)"/g, (match, before, classes) => {
  let cleanClasses = classes;
  if (!cleanClasses.includes("dark:bg-[#2A2A3D]")) cleanClasses += " dark:bg-[#2A2A3D]";
  if (!cleanClasses.includes("dark:text-white")) cleanClasses += " dark:text-white";
  return `<select${before}className="${cleanClasses}"`;
});

code = code.replace(/<textarea([^>]*)className="([^"]*)"/g, (match, before, classes) => {
  let cleanClasses = classes;
  if (!cleanClasses.includes("dark:bg-[#2A2A3D]")) cleanClasses += " dark:bg-[#2A2A3D]";
  if (!cleanClasses.includes("dark:text-white")) cleanClasses += " dark:text-white";
  if (!cleanClasses.includes("dark:placeholder-[#B0B0B0]")) cleanClasses += " dark:placeholder-[#B0B0B0]";
  return `<textarea${before}className="${cleanClasses}"`;
});

fs.writeFileSync('src/pages/admin/AdminMockTests.tsx', code);
