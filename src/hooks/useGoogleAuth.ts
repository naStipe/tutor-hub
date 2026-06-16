import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../supabase/config';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const redirectTo = Platform.OS === 'web'
    ? (typeof window !== 'undefined' ? window.location.origin : '')
    : AuthSession.makeRedirectUri({ scheme: 'tutorhub' });

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: Platform.OS !== 'web',
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error('No auth URL returned');

    if (Platform.OS === 'web') {
      // On web, just redirect the browser directly
      window.location.href = data.url;
    } else {
      // On mobile, use the in-app browser
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === 'success' && result.url) {
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
        if (sessionError) throw sessionError;
      }
    }
  }

  return { signInWithGoogle };
}