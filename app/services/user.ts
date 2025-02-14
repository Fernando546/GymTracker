import supabase from '../config/supabase';
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
  const { data, error } = await supabase
    .from('users')
    .select('profile')
    .eq('id', userId)
    .single();
  return data?.profile;
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
  // Supabase does not support updating a single document directly.
  // You would need to use a SQL query to update the profile.
  // This is a placeholder and should be replaced with the actual implementation.
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
    
    // Supabase does not support updating a single document directly.
    // You would need to use a SQL query to update the profile image.
    // This is a placeholder and should be replaced with the actual implementation.
    
    return imageUrl;
  } catch (error) {
    console.error('Error updating profile image:', error);
    throw error;
  }
}

export const followUser = async (targetUid: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('followers')
    .insert({
      follower_id: user.id,
      following_id: targetUid
    });

  if (error) {
    console.error('Follow error:', error);
    throw new Error(error.message);
  }

  // Update followers count
  await supabase.rpc('increment_followers', {
    user_id: targetUid
  });
};

export const unfollowUser = async (targetUid: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', targetUid);

  if (error) {
    console.error('Unfollow error:', error);
    throw new Error(error.message);
  }

  // Update followers count
  await supabase.rpc('decrement_followers', {
    user_id: targetUid
  });
}; 