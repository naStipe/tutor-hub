import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../supabase/config';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const redirectTo = AuthSession.makeRedirectUri({ scheme: 'tutorhub' });

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error('No auth URL returned');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type === 'success' && result.url) {
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
      if (sessionError) throw sessionError;
    }
  }

  return { signInWithGoogle };
}