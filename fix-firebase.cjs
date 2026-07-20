const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

if (!code.includes('initializeFirestore')) {
  code = code.replace('import { getFirestore } from "firebase/firestore";', 'import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";');
  code = code.replace('export const db = getFirestore(app);', 'export const db = initializeFirestore(app, { localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()}) });');
  fs.writeFileSync('src/firebase.ts', code);
}
