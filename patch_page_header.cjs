const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMockTests.tsx', 'utf-8');

const target = `      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900  dark:text-white">`;

const replacement = `      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-[60px] lg:top-20 z-40 bg-[#F8FAFC] dark:bg-[#151521] py-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent dark:sm:bg-transparent">
        <div>
          <h1 className="text-2xl font-bold text-gray-900  dark:text-white">`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  console.log("Patched page header!");
} else {
  // Regex
  const regex = /<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">\s*<div>\s*<h1 className="text-2xl font-bold text-gray-900  dark:text-white">/;
  if (regex.test(code)) {
    code = code.replace(regex, replacement);
    console.log("Patched page header via regex!");
  } else {
    console.log("Could not find page header!");
  }
}

fs.writeFileSync('src/pages/admin/AdminMockTests.tsx', code);
