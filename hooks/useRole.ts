'use client';

import { useState, useEffect, useCallback } from 'react';
import { ERole, EProfileStatus } from '@/enums';
import { useRoleContext } from '@/components/providers';
import { getRoleAction } from '@/app/actions/auth';

export function useRole() {
  const { role: ctxRole, status: ctxStatus, isLoaded: isCtxLoaded, refetch: ctxRefetch } =
    useRoleContext();

  const [role, setRole] = useState<ERole | null>(ctxRole);
  const [status, setStatus] = useState<EProfileStatus | null>(ctxStatus);
  const [isLoading, setIsLoading] = useState(!isCtxLoaded);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (isCtxLoaded) {
      // Triggers a server round-trip via router.refresh(); local state updates
      // asynchronously when the new RoleProvider props hydrate.
      ctxRefetch();
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await getRoleAction();
    if (result.isSuccess) {
      setRole(result.data.role);
      setStatus(result.data.status);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }, [isCtxLoaded, ctxRefetch]);

  useEffect(() => {
    if (isCtxLoaded) return;

    let isCancelled = false;

    (async () => {
      const result = await getRoleAction();

      if (isCancelled) return;

      if (result.isSuccess) {
        setRole(result.data.role);
        setStatus(result.data.status);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    })();

    return () => {
      isCancelled = true;
    };
  }, [isCtxLoaded]);

  return { role, status, isLoading, error, refetch: fetch };
}
