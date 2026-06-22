'use client';

import { createContext, type FC, type PropsWithChildren, useCallback, useContext } from 'react';

import { useRouter } from 'next/navigation';

import { EProfileStatus, ERole } from '@/enums';

interface IRoleContext {
  role: ERole | null;
  status: EProfileStatus | null;
  isLoaded: boolean;
  isError: boolean;
  refetch: () => void;
}

const RoleContext = createContext<IRoleContext>({
  role: null,
  status: null,
  isLoaded: false,
  isError: false,
  refetch: () => {},
});

export const useRoleContext = () => useContext(RoleContext);

interface IRoleProvider extends PropsWithChildren {
  role: ERole | null;
  status: EProfileStatus | null;
  isError?: boolean;
}
export const RoleProvider: FC<IRoleProvider> = ({ role, status, isError = false, children }) => {
  const router = useRouter();
  const refetch = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <RoleContext.Provider value={{ role, status, isLoaded: true, isError, refetch }}>
      {children}
    </RoleContext.Provider>
  );
};
