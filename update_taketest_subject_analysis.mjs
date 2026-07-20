import fs from 'fs';

let content = fs.readFileSync('src/pages/TakeTest.tsx', 'utf8');

const targetStr = `      let incorrect = 0;
      
      questions.forEach(q => {`;

const newStr = `      let incorrect = 0;
      
      const subjectAnalysis: Record<string, { total: number, correct: number, incorrect: number, skipped: number, score: number }> = {};
      
      questions.forEach(q => {
        const sub = q.subject || 'General';
        if (!subjectAnalysis[sub]) {
          subjectAnalysis[sub] = { total: 0, correct: 0, incorrect: 0, skipped: 0, score: 0 };
        }
        subjectAnalysis[sub].total++;
`;

content = content.replace(targetStr, newStr);

const targetStr2 = `        if (ans) {
          if (ans === q.correctAnswer) {
            score += qMarks;
            correct++;
          } else {
            score -= qNegMarks;
            incorrect++;
          }
        }
      });`;

const newStr2 = `        if (ans) {
          if (ans === q.correctAnswer) {
            score += qMarks;
            correct++;
            subjectAnalysis[sub].correct++;
            subjectAnalysis[sub].score += qMarks;
          } else {
            score -= qNegMarks;
            incorrect++;
            subjectAnalysis[sub].incorrect++;
            subjectAnalysis[sub].score -= qNegMarks;
          }
        } else {
          subjectAnalysis[sub].skipped++;
        }
      });`;

content = content.replace(targetStr2, newStr2);

const targetStr3 = `        testTitle: test?.title || 'Unknown Test',
        answers: answers,
        submittedAt: Date.now(),
        timeTaken,
        score: parseFloat(score.toFixed(2)),`;

const newStr3 = `        testTitle: test?.title || 'Unknown Test',
        answers: answers,
        submittedAt: Date.now(),
        timeTaken,
        score: parseFloat(score.toFixed(2)),
        subjectAnalysis,`;

content = content.replace(targetStr3, newStr3);

fs.writeFileSync('src/pages/TakeTest.tsx', content);
