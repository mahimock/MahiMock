import fs from 'fs';

let content = fs.readFileSync('src/pages/PerformanceHistory.tsx', 'utf8');

const importRegex = /import { (.*?) } from 'lucide-react';/;
const importMatch = content.match(importRegex);
if (importMatch) {
  content = content.replace(importRegex, "import { " + importMatch[1] + ", TrendingUp, BrainCircuit, BookOpen, AlertTriangle } from 'lucide-react';\nimport { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';\nimport { format } from 'date-fns';");
}

const targetReturn = `  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Performance History</h1>
            <p className="text-sm text-gray-500">View your past test attempts and progress</p>
          </div>
        </div>
        {attempts.length === 0 ? (`;

const newReturn = `  // Analytics calculations
  const publishedAttempts = attempts.filter(a => a.status !== 'pending');
  const totalTests = publishedAttempts.length;
  const avgScore = totalTests > 0 ? (publishedAttempts.reduce((acc, curr) => acc + curr.score, 0) / totalTests).toFixed(1) : '0';
  const avgAccuracy = totalTests > 0 ? (publishedAttempts.reduce((acc, curr) => acc + curr.accuracy, 0) / totalTests).toFixed(1) : '0';
  // Rank can be derived from the best rank across attempts
  const bestRank = totalTests > 0 ? Math.min(...publishedAttempts.map(a => a.rank)) : '-';

  const chartData = [...publishedAttempts].reverse().map(a => ({
    name: format(new Date(a.submittedAt), 'MMM d'),
    score: a.score,
    accuracy: a.accuracy
  }));

  const subjectData = React.useMemo(() => {
    const subjects: Record<string, { total: number, correct: number, score: number }> = {};
    publishedAttempts.forEach((r: any) => {
      if (r.subjectAnalysis) {
        Object.entries(r.subjectAnalysis).forEach(([sub, data]: [string, any]) => {
          if (!subjects[sub]) {
            subjects[sub] = { total: 0, correct: 0, score: 0 };
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
    }));
  }, [publishedAttempts]);

  const sortedSubjects = [...subjectData].sort((a, b) => b.score - a.score);
  const strongSubjects = sortedSubjects.slice(0, 2);
  const weakSubjects = sortedSubjects.slice().reverse().slice(0, 2);

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
            <p className="text-sm text-gray-500">View your past test attempts and analytics</p>
          </div>
        </div>

        {attempts.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-gray-900">{totalTests}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Tests</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                  <Target className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-gray-900">{avgAccuracy}%</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Accuracy</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-gray-900">{avgScore}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Avg Score</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mb-4">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-gray-900">#{bestRank}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Best Rank</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#5B5FFB]" /> Recent Performance Graph
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5B5FFB" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#5B5FFB" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94A3B8' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94A3B8' }} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 700 }} />
                      <Area type="monotone" dataKey="score" stroke="#5B5FFB" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                      <Area type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={3} fill="transparent" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
                 <div>
                   <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <BookOpen className="w-5 h-5 text-emerald-600" /> Strong Subjects
                   </h3>
                   {strongSubjects.length > 0 ? (
                     <div className="space-y-3">
                       {strongSubjects.map(sub => (
                         <div key={sub.name} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                           <span className="font-bold text-emerald-900 text-sm">{sub.name}</span>
                           <span className="font-black text-emerald-600">{sub.score}%</span>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-sm text-gray-500 font-medium">Not enough data.</p>
                   )}
                 </div>
                 
                 <div>
                   <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <AlertTriangle className="w-5 h-5 text-red-600" /> Weak Subjects
                   </h3>
                   {weakSubjects.length > 0 ? (
                     <div className="space-y-3">
                       {weakSubjects.map(sub => (
                         <div key={sub.name} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                           <span className="font-bold text-red-900 text-sm">{sub.name}</span>
                           <span className="font-black text-red-600">{sub.score}%</span>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-sm text-gray-500 font-medium">Not enough data.</p>
                   )}
                 </div>
              </div>
            </div>
          </>
        )}

        <h3 className="text-xl font-bold text-gray-900 mb-6">Attempt History</h3>
        {attempts.length === 0 ? (`;

content = content.replace(targetReturn, newReturn);
fs.writeFileSync('src/pages/PerformanceHistory.tsx', content);
