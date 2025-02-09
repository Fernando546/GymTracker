import { db, storage } from '../config/firebase';
import { doc, getDoc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { uploadToCloudinary } from './imageUpload';

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

export async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
    base64: true,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
  return null;
}

export async function uploadProfileImage(userId: string, uri: string) {
  try {
    // Upload to Cloudinary first
    const imageUrl = await uploadToCloudinary(uri);
    
    // Then update the profile with the Cloudinary URL
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'profile.imageUrl': imageUrl
    });
    
    return imageUrl;
  } catch (error) {
    console.error('Error updating profile image:', error);
    throw error;
  }
}

export const followUser = async (currentUserId: string, targetUserId: string) => {
  const followerDocRef = doc(db, 'users', targetUserId, 'followers', currentUserId);
  const followingDocRef = doc(db, 'users', currentUserId, 'following', targetUserId);

  // Check if follow relationship already exists.
  const followerDocSnap = await getDoc(followerDocRef);
  if (followerDocSnap.exists()) {
    return; // Already following—do nothing.
  }

  // Create follow relationship.
  await setDoc(followerDocRef, {
    uid: currentUserId,
    timestamp: Date.now()
  });
  await setDoc(followingDocRef, {
    uid: targetUserId,
    timestamp: Date.now()
  });
};

export const unfollowUser = async (currentUserId: string, targetUserId: string) => {
  const followerDocRef = doc(db, 'users', targetUserId, 'followers', currentUserId);
  const followingDocRef = doc(db, 'users', currentUserId, 'following', targetUserId);
  await deleteDoc(followerDocRef);
  await deleteDoc(followingDocRef);
}; 