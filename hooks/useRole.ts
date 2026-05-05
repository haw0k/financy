'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ERole, EProfileStatus } from '@/enums';

export function useRole() {
  const [role, setRole] = useState<ERole | null>(null);
  const [status, setStatus] = useState<EProfileStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRole(null);
        setStatus(null);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setRole(profile.role as ERole);
      setStatus(profile.status as EProfileStatus);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user role');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (isCancelled) return;

        if (!user) {
          setRole(null);
          setStatus(null);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, status')
          .eq('id', user.id)
          .single();

        if (isCancelled) return;

        if (profileError) throw profileError;

        setRole(profile.role as ERole);
        setStatus(profile.status as EProfileStatus);
      } catch (err: unknown) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch user role');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, []);

  return { role, status, isLoading, error, refetch: fetch };
}
