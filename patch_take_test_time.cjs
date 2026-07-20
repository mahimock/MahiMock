const fs = require('fs');
let code = fs.readFileSync('src/pages/TakeTest.tsx', 'utf-8');

code = code.replace(
  "        submittedAt: Date.now(),\n        // We will compute score on the server or on the result page\n      });",
  "        submittedAt: Date.now(),\n        timeTaken: test?.durationMinutes ? (test.durationMinutes * 60) - timeLeft : 0,\n      });"
);

fs.writeFileSync('src/pages/TakeTest.tsx', code);
