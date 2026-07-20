const fs = require('fs');
let code = fs.readFileSync('src/pages/TakeTest.tsx', 'utf-8');

code = code.replace(
  "const { currentUser } = useAuth();",
  "const { currentUser, isAdmin } = useAuth();"
);

code = code.replace(
  "import { Loader2",
  "import AdminTestManagementUI from './admin/AdminTestManagementUI';\nimport { Loader2"
);

const oldEmptyState = `  if (!test || questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">No questions available for this test.</div>;
  }`;

const newEmptyState = `  if (!test || questions.length === 0) {
    if (isAdmin) {
      return (
        <div className="min-h-screen bg-[#F8FAFC]">
          <AdminTestManagementUI />
        </div>
      );
    }
    return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">No questions available for this test.</div>;
  }`;

code = code.replace(oldEmptyState, newEmptyState);

fs.writeFileSync('src/pages/TakeTest.tsx', code);
