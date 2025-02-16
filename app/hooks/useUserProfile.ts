import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import supabase from '../config/supabase';
import { useQuery } from '@tanstack/react-query';

export type UserProfile = {
  user_id: string;
  username?: string;
  name?: string;
  bio?: string;
  image_url?: string;
};

export function useUserProfile() {
  const { user } = useAuth();
  
  const { data, error, refetch, isLoading } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as UserProfile;
    }
  });

  return { 
    profile: data, 
    error, 
    refetch,
    loading: isLoading 
  };
} 