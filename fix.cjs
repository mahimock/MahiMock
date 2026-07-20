const fs = require('fs');
let code = fs.readFileSync('src/components/HomeTestSeriesCards.tsx', 'utf8');

const lastSectionalTestsIdx = code.lastIndexOf('{/* Sectional Tests Section */}');
const remainingCode = code.substring(lastSectionalTestsIdx);

const startIdx = remainingCode.indexOf('</button>');
const afterButton = remainingCode.substring(startIdx);

const newRemaining = `{/* Sectional Tests Section */}
        <div>
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                Sectional Focus
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic">Sectional Tests</h2>
            </div>
            <button 
              onClick={() => navigate('/section-series')}
              className="text-gray-900 dark:text-white/40 hover:text-gray-900 dark:hover:text-white text-sm font-bold flex items-center gap-2 transition-all group"
            >
              View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-3 sm:gap-8">
            {sectionSeries.length > 0 ? (
              sectionSeries.map(item => renderSeriesCard(item, 'section'))
            ) : (
              // Fallback/Placeholder cards
              [1, 2, 3].map(i => (
                <div key={i} className="w-full aspect-square sm:aspect-auto sm:w-[220px] sm:h-auto bg-white dark:bg-[#111420] p-3 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-gray-200 dark:border-white/5 opacity-50 flex flex-col items-center sm:items-start justify-center sm:justify-start">
                   <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-white/5 mb-2 sm:mb-6" />
                   <div className="h-2 w-12 bg-gray-100 dark:bg-white/5 rounded mb-2" />
                   <div className="h-1.5 w-8 bg-gray-100 dark:bg-white/5 rounded hidden sm:block" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}`;

code = code.substring(0, lastSectionalTestsIdx) + newRemaining;
fs.writeFileSync('src/components/HomeTestSeriesCards.tsx', code);
