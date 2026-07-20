const fs = require('fs');

const files = [
  'src/components/HomeTestSeriesCards.tsx',
  'src/components/MockTestsCarousel.tsx',
  'src/components/ExamsCarousel.tsx',
  'src/components/HeroCarousel.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes('export default function')) {
    const match = code.match(/export default function (\w+)/);
    if (match) {
      const name = match[1];
      code = code.replace(`export default function ${name}`, `function ${name}`);
      code += `\nexport default React.memo(${name});\n`;
      fs.writeFileSync(file, code);
    }
  }
}
