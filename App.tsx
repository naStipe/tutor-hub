import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './src/navigation/AppNavigator';
import { supabase } from './src/supabase/config';

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    // Handle OAuth redirect on web
    if (typeof window !== 'undefined') {
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Session established, auth state will update automatically
        }
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppNavigator />
    </QueryClientProvider>
  );
}