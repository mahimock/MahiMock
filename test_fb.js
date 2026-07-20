import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const code = fs.readFileSync('src/firebase.ts', 'utf8');
const configMatch = code.match(/const firebaseConfig = ({[\s\S]*?});/);
if (configMatch) {
  const config = eval("(" + configMatch[1] + ")");
  const app = initializeApp(config);
  const db = getFirestore(app);
  getDocs(collection(db, 'results')).then(snap => {
    console.log("Total results:", snap.size);
    process.exit(0);
  });
}
