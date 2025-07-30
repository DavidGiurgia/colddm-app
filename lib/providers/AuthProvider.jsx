// src/components/auth/AuthProvider.jsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2 } from 'lucide-react';

/**
 * AuthProvider component to manage user authentication and redirection.
 *
 * If a user is logged in, it redirects them to the /dashboard route.
 * If a user is not logged in, it redirects them to the /login route (unless they are already on an auth-related page).
 *
 * @param {Object} { children } - React children to render once authentication status is determined.
 */
export default function AuthProvider({ children }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true); // State to manage loading until auth status is checked

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      const publicPaths = [
        '/', // Landing page
        '/login',
        '/register',
        '/auth/callback', // Supabase OAuth callback
        '/pricing', // If you have a public pricing page
        '/about', // Example public page
        // Add any other public paths here
      ];

      // Check if the current path is a public path
      const isPublicPath = publicPaths.includes(pathname);

      if (session) {
        // User is logged in
        if (isPublicPath && pathname !== '/') { // If on a public auth page (login/register), redirect to dashboard
          router.push('/dashboard');
        } else {
          setLoading(false); // Already on a dashboard/protected page, or landing page, no redirect needed
        }
      } else {
        // User is NOT logged in
        if (!isPublicPath) {
          router.push('/login'); // Redirect to login if trying to access a protected page
        } else {
          setLoading(false); // Already on a public page, no redirect needed
        }
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // This listener is crucial for real-time updates after login/logout
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkAuth(); // Re-check auth status on sign in/out
      }
    });

    // Initial check on component mount
    checkAuth();

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, router, pathname]); // Depend on supabase, router, and pathname

  // Show a loading spinner while checking authentication status
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground dark:bg-slate-900 dark:text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" /> Checking authentication...
      </div>
    );
  }

  // Render children once authentication status is determined and no redirect is needed
  return <>{children}</>;
}
