import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { Capacitor } from '@capacitor/core';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile, Theme } from '../types';
import { logAuditEvent } from '../utils/auditLogs';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (user: User) => {
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        
        // Handle suspended users
        if (data.status === 'suspended') {
          await firebaseSignOut(auth);
          setUserProfile(null);
          setCurrentUser(null);
          throw new Error('Your account has been suspended. Please contact support.');
        }

        setUserProfile(data);
      } else {
        // Create basic profile if logging in via Google for the first time
        const newProfile: Partial<UserProfile> = {
          name: user.displayName || 'User',
          email: user.email || '',
          photoURL: user.photoURL || '',
          role: 'student',
          status: 'active',
          createdAt: Date.now(),
        };
        await setDoc(docRef, newProfile);
        setUserProfile(newProfile as UserProfile);
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchUserProfile(currentUser);
    }
  };

  const isAdmin = Boolean(userProfile?.role === 'admin');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          await fetchUserProfile(user);
          // Update last login and log event
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { lastLogin: Date.now() });
          await logAuditEvent(user.uid, 'login');
        } catch (err) {
          // fetchUserProfile might throw if suspended
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    if (Capacitor.isNativePlatform()) {
      await signInWithRedirect(auth, provider);
    } else {
      await signInWithPopup(auth, provider);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = React.useMemo(() => ({
    currentUser,
    userProfile,
    loading,
    isAdmin,
    signInWithGoogle,
    signOut,
    refreshProfile
  }), [currentUser, userProfile, loading, isAdmin]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
