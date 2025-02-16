import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import supabase from '../config/supabase';
import { useQuery } from '@tanstack/react-query';

export type UserProfile = {
  id: string;
  email: string;
  username: string;
  created_at: string;
  profile: {
    bio?: string;
    image_url?: string;
  } | null;
};

export function useUserProfile() {
  const { user } = useAuth();
  
  const { data, error, refetch } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          profile:profiles!user_id(*)
        `)
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as UserProfile;
    }
  });

  return { 
    profile: data,
    error,
    refetch,
    loading: !data && !error
  };
} 