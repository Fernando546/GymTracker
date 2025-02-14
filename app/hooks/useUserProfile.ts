import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import supabase from '../config/supabase';

export type UserProfile = {
  email: string;
  username: string;
  createdAt: Date;
  profile: {
    name: string;
    bio: string;
    followers: number;
    following: number;
    imageUrl?: string;
    achievements: number;
  }
};

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.uid)
        .single();

      if (data) {
        setProfile(data as UserProfile);
      } else {
        setError('Profile not found');
      }
    } catch (e) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return { profile, loading, error, refetch: fetchProfile };
} 