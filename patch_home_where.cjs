const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');
code = code.replace("import { collection, onSnapshot, query, limit } from 'firebase/firestore';", "import { collection, onSnapshot, query, limit, where } from 'firebase/firestore';");
fs.writeFileSync('src/pages/Home.tsx', code);
