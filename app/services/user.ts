import supabase from '../config/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export type UserProfile = {
  id: string;
  username: string;
  profile: {
    bio?: string;
    image_url?: string;
  };
};

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const { data } = await supabase
    .from('users')
    .select('profile')
    .eq('id', userId)
    .single();
  return data?.profile;
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<{
    username?: string;
    name?: string;
    bio?: string;
    image_url?: string;
  }>
) => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId);

  if (error) throw error;
};

export async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled && result.assets?.[0]?.uri) {
    return result.assets[0].uri;
  }
  return null;
}

export const uploadProfileImage = async (userId: string, uri: string) => {
  try {
    // Convert URI to base64
    const base64Data = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const fileExt = uri.split('.').pop() || 'jpg';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const contentType = `image/${fileExt === 'png' ? 'png' : 'jpeg'}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, decode(base64Data), {
        contentType,
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ image_url: publicUrl })
      .eq('user_id', userId);

    if (updateError) throw updateError;
    
    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }
};

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