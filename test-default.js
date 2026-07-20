import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./src/firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, '(default)');

async function test() {
  try {
    const colRef = collection(db, 'exam_categories');
    await getDocs(colRef);
    console.log("Success with default!");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

test();
