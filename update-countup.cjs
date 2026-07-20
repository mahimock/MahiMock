const fs = require('fs');
const path = 'src/pages/Home.tsx';
let content = fs.readFileSync(path, 'utf8');

const countUpComponent = `
function CountUp({ value, suffix = "", className = "" }: { value: number, suffix?: string, className?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(ease * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <span className={className}>{count}{suffix}</span>;
}

export default function Home() {`;

content = content.replace('export default function Home() {', countUpComponent);

content = content.replace(
  '<span className="text-2xl sm:text-3xl font-bold text-white mb-1">{totalAttempts}</span>',
  '<CountUp value={totalAttempts} className="text-2xl sm:text-3xl font-bold text-white mb-1" />'
);
content = content.replace(
  '<span className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-1">{overallAccuracy}%</span>',
  '<CountUp value={overallAccuracy} suffix="%" className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-1" />'
);
content = content.replace(
  '<span className="text-2xl sm:text-3xl font-bold text-[#6C4DFF] mb-1">{overallScore.toFixed(0)}</span>',
  '<CountUp value={Math.round(overallScore)} className="text-2xl sm:text-3xl font-bold text-[#6C4DFF] mb-1" />'
);

fs.writeFileSync(path, content, 'utf8');
