import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase/config';
import { Profile } from '../types';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) setProfile(data);
  }

  useEffect(() => {
    console.log('useAuth: getting session...');
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      console.log('useAuth: getSession resolved', { session: !!session, error });
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          console.log('useAuth: fetching profile for', session.user.id);
          await fetchProfile(session.user.id);
          console.log('useAuth: profile fetched');
        } catch (e) {
          console.error('Profile fetch error:', e);
        }
      }
      console.log('useAuth: setting loading false');
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: onAuthStateChange', event, { session: !!session });
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          try {
            await fetchProfile(session.user.id);
          } catch (e) {
            console.error('Profile fetch error:', e);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, profile, loading };
}