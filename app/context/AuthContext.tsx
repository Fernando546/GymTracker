import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { router } from 'expo-router';

type AuthContextType = {
  user: any;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

type UserProfile = {
  email: string;
  username: string;
  createdAt: Date;
  profile: {
    name: string;
    bio: string;
    followers: number;
    following: number;
    achievements: number;
    imageUrl: string;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    return auth.onAuthStateChanged(setUser);
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, username: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      username: username,
      createdAt: new Date(),
      profile: {
        name: '',
        bio: '',
        followers: 0,
        following: 0,
        achievements: 0,
        imageUrl: ''
      }
    });
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 