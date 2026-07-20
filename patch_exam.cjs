const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamDetail.tsx', 'utf-8');

code = code.replace(
  "onClick={() => isAdmin ? navigate('/admin/tests/' + test.id + '/questions') : navigate('/test-instructions/' + test.id)} // Or wherever it should go",
  "onClick={() => navigate('/test-instructions/' + test.id)}"
);

code = code.replace(
  "{isAdmin ? 'Manage Questions' : 'Start Test'}",
  "'Start Test'"
);

fs.writeFileSync('src/pages/ExamDetail.tsx', code);
