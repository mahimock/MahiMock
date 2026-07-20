import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export async function seedInitialContent() {
  const categories = [
    { name: 'SSC Exams', slug: 'ssc', description: 'CGL, CHSL, MTS, GD Constable' },
    { name: 'Railway Exams', slug: 'railway', description: 'NTPC, Group D, ALP, RPF' },
    { name: 'Banking Exams', slug: 'banking', description: 'IBPS PO, Clerk, SBI, RBI' },
    { name: 'Bihar Exams', slug: 'bihar', description: 'BPSC, BSSC, Bihar Police' },
    { name: 'UPSC', slug: 'upsc', description: 'CSE, CAPF, CDS, NDA' },
    { name: 'Defence Exams', slug: 'defence', description: 'Airforce, Navy, Army' },
    { name: 'Police Exams', slug: 'police', description: 'State SI, Constable' },
    { name: 'Teaching Exams', slug: 'teaching', description: 'CTET, STET, KVS, DSSSB' },
    { name: 'State PSC', slug: 'state-psc', description: 'UPPSC, MPPSC, RAS, JPSC' }
  ];

  for (const cat of categories) {
    const q = query(collection(db, 'examCategories'), where('slug', '==', cat.slug));
    const snap = await getDocs(q);
    if (snap.empty) {
      await setDoc(doc(collection(db, 'examCategories')), {
        ...cat,
        isActive: true,
        displayOrder: categories.indexOf(cat)
      });
      console.log(`Seeded category: ${cat.name}`);
    }
  }

  // Seed a sample exam for SSC
  const sscQ = query(collection(db, 'examCategories'), where('slug', '==', 'ssc'));
  const sscSnap = await getDocs(sscQ);
  if (!sscSnap.empty) {
    const sscId = sscSnap.docs[0].id;
    const examsQ = query(collection(db, 'exams'), where('slug', '==', 'ssc-cgl'));
    const examSnap = await getDocs(examsQ);
    if (examSnap.empty) {
      await setDoc(doc(collection(db, 'exams')), {
        categoryId: sscId,
        examName: 'SSC CGL 2024',
        shortName: 'CGL',
        slug: 'ssc-cgl',
        description: 'Combined Graduate Level Examination',
        isActive: true,
        logo: 'https://img.icons8.com/color/96/000000/google-logo.png' // Placeholder
      });
      console.log('Seeded SSC CGL exam');
    }
  }
}
