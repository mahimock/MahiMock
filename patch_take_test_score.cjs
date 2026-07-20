const fs = require('fs');
let code = fs.readFileSync('src/pages/TakeTest.tsx', 'utf-8');

const computeLogic = `
      let score = 0;
      let totalMarks = 0;
      let correct = 0;
      let incorrect = 0;
      
      questions.forEach(q => {
        totalMarks += (Number(q.marks) || 0);
        const ans = answers[q.id];
        if (ans) {
          if (ans === q.correctAnswer) {
            score += (Number(q.marks) || 0);
            correct++;
          } else {
            score -= (Number(q.negativeMarks) || 0);
            incorrect++;
          }
        }
      });
      
      const attempted = correct + incorrect;
      const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;

      // Save result to DB
      await addDoc(collection(db, 'results'), {
        userId: currentUser.uid,
        testId: testId,
        answers: answers,
        submittedAt: Date.now(),
        timeTaken: test?.durationMinutes ? (test.durationMinutes * 60) - timeLeft : 0,
        score: Math.max(0, score),
        totalMarks,
        correct,
        incorrect,
        accuracy
      });
`;

code = code.replace(
  /      \/\/ Save result to DB[\s\S]*?\}\);/,
  computeLogic
);

fs.writeFileSync('src/pages/TakeTest.tsx', code);
