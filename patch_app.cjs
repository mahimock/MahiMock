const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const importsToAdd = `
import AdminTestSeries from './pages/admin/AdminTestSeries';
import AdminQuestionBank from './pages/admin/AdminQuestionBank';
import AdminStudents from './pages/admin/AdminStudents';
import AdminResults from './pages/admin/AdminResults';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminSettings from './pages/admin/AdminSettings';
`;

code = code.replace("import AdminUpdates from './pages/admin/AdminUpdates';", "import AdminUpdates from './pages/admin/AdminUpdates';" + importsToAdd);

const routesToAdd = `
              <Route path="test-series" element={<AdminTestSeries />} />
              <Route path="question-bank" element={<AdminQuestionBank />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="results" element={<AdminResults />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="settings" element={<AdminSettings />} />
`;

code = code.replace("<Route path=\"updates\" element={<AdminUpdates />} />", "<Route path=\"updates\" element={<AdminUpdates />} />" + routesToAdd);

fs.writeFileSync('src/App.tsx', code);
