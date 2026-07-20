import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const targetMemo = `  const chartData = useMemo(() => {
    return results.filter(r => r.status !== 'pending').slice().reverse().map(r => ({
      name: format(r.submittedAt, 'MMM d'),
      score: r.score,
      accuracy: r.accuracy
    }));
  }, [results]);`;

const newMemo = `  const chartData = useMemo(() => {
    return results.filter(r => r.status !== 'pending').slice().reverse().map(r => ({
      name: format(r.submittedAt, 'MMM d'),
      score: r.score,
      accuracy: r.accuracy
    }));
  }, [results]);

  const subjectData = useMemo(() => {
    const publishedResults = results.filter(r => r.status !== 'pending');
    if (publishedResults.length === 0) return [];
    
    const subjects: Record<string, { total: number, correct: number, score: number, color: string }> = {};
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];
    let colorIdx = 0;

    publishedResults.forEach(r => {
      if (r.subjectAnalysis) {
        Object.entries(r.subjectAnalysis).forEach(([sub, data]: [string, any]) => {
          if (!subjects[sub]) {
            subjects[sub] = { total: 0, correct: 0, score: 0, color: colors[colorIdx % colors.length] };
            colorIdx++;
          }
          subjects[sub].total += data.total;
          subjects[sub].correct += data.correct;
          subjects[sub].score += data.score;
        });
      }
    });

    return Object.entries(subjects).map(([name, data]) => ({
      name,
      score: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      color: data.color
    }));
  }, [results]);`;

content = content.replace(targetMemo, newMemo);

const targetSubjectUI = `             <div className="space-y-6">
                {[
                  { name: 'Mathematics', score: 85, color: 'bg-blue-500' },
                  { name: 'Reasoning', score: 92, color: 'bg-purple-500' },
                  { name: 'English', score: 78, color: 'bg-emerald-500' },
                  { name: 'General Awareness', score: 65, color: 'bg-orange-500' },
                ].map((subject) => (
                  <div key={subject.name}>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-gray-700">{subject.name}</span>
                      <span className="text-gray-400">{subject.score}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: \`\${subject.score}%\` }}
                        className={\`h-full \${subject.color}\`}
                      ></motion.div>
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="mt-8 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <p className="text-xs font-bold text-purple-700 mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Improvement Tip
                </p>
                <p className="text-[10px] text-purple-600 leading-relaxed font-medium">
                  Your Reasoning scores are improving rapidly! Focus more on General Awareness this week to balance your performance.
                </p>
             </div>`;

const newSubjectUI = `             {subjectData.length === 0 ? (
               <div className="text-center py-8">
                 <p className="text-sm text-gray-500 font-medium">No performance data available. Attempt a mock test to view analytics.</p>
               </div>
             ) : (
               <>
                 <div className="space-y-6">
                    {subjectData.map((subject) => (
                      <div key={subject.name}>
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span className="text-gray-700">{subject.name}</span>
                          <span className="text-gray-400">{subject.score}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: \`\${subject.score}%\` }}
                            className={\`h-full \${subject.color}\`}
                          ></motion.div>
                        </div>
                      </div>
                    ))}
                 </div>
                 
                 {subjectData.length > 0 && (
                   <div className="mt-8 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                      <p className="text-xs font-bold text-purple-700 mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Improvement Tip
                      </p>
                      <p className="text-[10px] text-purple-600 leading-relaxed font-medium">
                        {subjectData.sort((a, b) => a.score - b.score)[0]?.name ? \`Focus more on \${subjectData[0].name} to balance your performance.\` : 'Keep practicing to improve your scores!'}
                      </p>
                   </div>
                 )}
               </>
             )}`;

content = content.replace(targetSubjectUI, newSubjectUI);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
