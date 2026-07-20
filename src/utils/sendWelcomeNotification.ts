import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from 'firebase/auth';

export const sendWelcomeBackNotification = async (user: User) => {
  try {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    const name = docSnap.exists() ? (docSnap.data().name || 'User') : 'User';
    
    await addDoc(collection(db, `users/${user.uid}/notifications`), {
      title: '👋 Welcome Back!',
      message: `Welcome back ${name}. Glad to see you again. Continue your preparation and achieve your goals.`,
      type: 'info',
      category: 'general',
      read: false,
      createdAt: Date.now()
    });
  } catch (error) {
    console.error('Error sending welcome back notification:', error);
  }
};

export const sendWelcomeNotification = async (user: User, customName?: string) => {
  try {
    const name = customName || user.displayName || 'User';
    
    await addDoc(collection(db, `users/${user.uid}/notifications`), {
      title: '🎉 Welcome to MahiMock!',
      message: `Hi ${name}, welcome to MahiMock! Your account has been created successfully. Start exploring mock tests, study materials, and track your preparation journey.`,
      type: 'success',
      category: 'general',
      read: false,
      createdAt: Date.now()
    });
  } catch (error) {
    console.error('Error sending welcome notification:', error);
  }
};
