const fs = require('fs');

const path = 'src/pages/Home.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldMockTest = `
      {/* Latest Mock Tests */}
      <section className="px-4 pt-10 sm:pt-12 max-w-7xl mx-auto pb-4">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight">Latest Mock Tests</h2>
          </div>
          <button onClick={() => navigate('/test-series')} className="text-[12px] sm:text-[13px] text-[#6C4DFF] font-bold hover:text-indigo-400 transition-colors whitespace-nowrap ml-2 shrink-0">View All &gt;</button>
        </div>
        
        {mockTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockTests.slice(0, 6).map((item) => (
              <div 
                key={item.id}
                onClick={() => navigate(\`/test-instructions/\${item.id}\`)}
                className="h-[110px] bg-[#12121A] border border-white/5 rounded-[18px] p-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.04] hover:border-white/10 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.1)] group relative overflow-hidden"
              >
                <div className="w-[60px] h-[60px] rounded-[16px] bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-7 h-7 text-indigo-400" />
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-[15px] font-bold text-white mb-1.5 truncate group-hover:text-[#6C4DFF] transition-colors">{item.title}</h3>
                  <div className="flex items-center gap-3 text-[12px] text-white/50 font-medium">
                    <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-white/40" /> {item.totalQuestions || 0} Qs</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-white/40" /> {item.duration || 0}m</span>
                    <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-white/40" /> {item.difficulty || 'Medium'}</span>
                  </div>
                </div>
                
                <button className="px-5 py-2.5 bg-[#6C4DFF] hover:bg-indigo-500 text-white text-[13px] font-bold rounded-full transition-colors shrink-0 shadow-lg shadow-indigo-500/20 active:scale-95">
                  Start Test
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#12121A] border border-white/10 rounded-[20px] p-8 text-center text-white/40 text-[13px] font-medium backdrop-blur-md">
            No Mock Tests Published
          </div>
        )}
      </section>
`;

const newMockTest = `
      {/* Latest Mock Tests */}
      <section className="px-4 pt-10 sm:pt-12 max-w-7xl mx-auto pb-4">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight">Latest Mock Tests</h2>
          </div>
          <button onClick={() => navigate('/test-series')} className="text-[12px] sm:text-[13px] text-[#6C4DFF] font-bold hover:text-indigo-400 transition-colors whitespace-nowrap ml-2 shrink-0">View All &gt;</button>
        </div>
        
        {mockTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {mockTests.slice(0, 6).map((item) => (
              <div 
                key={item.id}
                onClick={() => navigate(\`/test-instructions/\${item.id}\`)}
                className="min-h-[92px] h-auto bg-[#12121A] border border-white/5 rounded-[18px] p-3 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer hover:bg-white/[0.04] hover:border-white/10 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.1)] group relative overflow-hidden"
              >
                <div className="w-[56px] h-[56px] rounded-[16px] bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6 text-indigo-400" />
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-[14px] sm:text-[15px] font-bold text-white mb-1.5 line-clamp-2 leading-tight group-hover:text-[#6C4DFF] transition-colors">{item.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-[12px] text-white/50 font-medium">
                    {item.totalQuestions ? <span className="flex items-center gap-1.5 whitespace-nowrap"><FileText className="w-3.5 h-3.5 text-white/40" /> {item.totalQuestions} Qs</span> : null}
                    {item.duration ? <span className="flex items-center gap-1.5 whitespace-nowrap"><Clock className="w-3.5 h-3.5 text-white/40" /> {item.duration}m</span> : null}
                    {item.difficulty ? <span className="flex items-center gap-1.5 whitespace-nowrap"><Activity className="w-3.5 h-3.5 text-white/40" /> {item.difficulty}</span> : null}
                    {item.attemptsCount ? <span className="flex items-center gap-1.5 whitespace-nowrap"><User className="w-3.5 h-3.5 text-white/40" /> {item.attemptsCount}</span> : null}
                  </div>
                </div>
                
                <button className="px-4 py-2 sm:px-5 sm:py-2.5 bg-[#6C4DFF] hover:bg-indigo-500 text-white text-[12px] sm:text-[13px] font-bold rounded-full transition-colors shrink-0 shadow-lg shadow-indigo-500/20 active:scale-95">
                  Start
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#12121A] border border-white/10 rounded-[20px] p-8 text-center text-white/40 text-[13px] font-medium backdrop-blur-md">
            No Mock Tests Published
          </div>
        )}
      </section>
`;

content = content.replace(oldMockTest.trim(), newMockTest.trim());
fs.writeFileSync(path, content, 'utf8');
