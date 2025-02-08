import { db, storage } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface UserProfile {
  name: string;
  bio: string;
  imageUrl: string | null;
  followers: number;
  following: number;
  achievements: number;
}

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.data()?.profile;
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, { profile: profile });
};

export const uploadProfileImage = async (userId: string, uri: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, `profiles/${userId}`);
  await uploadBytes(storageRef, blob);
  const url = await getDownloadURL(storageRef);
  await updateUserProfile(userId, { imageUrl: url });
  return url;
}; 