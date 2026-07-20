const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamDetail.tsx', 'utf-8');

const target = `  const renderTestList = (testList: Test[], title: string, onBack: () => void) => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">`;

const replacement = `  const renderTestList = (testList: Test[], title: string, onBack: () => void) => (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between gap-4 mb-6 sticky top-[60px] lg:top-20 z-40 bg-[#F8FAFC] py-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent">`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/ExamDetail.tsx', code);
  console.log("Successfully patched sticky header!");
} else {
  console.log("Target not found.");
}
