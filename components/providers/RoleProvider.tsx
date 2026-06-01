'use client';

import { createContext, useContext, useCallback, type FC, type PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';
import { ERole, EProfileStatus } from '@/enums';

interface IRoleContext {
  role: ERole | null;
  status: EProfileStatus | null;
  isLoaded: boolean;
  refetch: () => void;
}

const RoleContext = createContext<IRoleContext>({
  role: null,
  status: null,
  isLoaded: false,
  refetch: () => {},
});

export const useRoleContext = () => useContext(RoleContext);

interface IRoleProvider extends PropsWithChildren {
  role: ERole | null;
  status: EProfileStatus | null;
}
export const RoleProvider: FC<IRoleProvider> = ({ role, status, children }) => {
  const router = useRouter();
  const refetch = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <RoleContext.Provider value={{ role, status, isLoaded: true, refetch }}>
      {children}
    </RoleContext.Provider>
  );
};