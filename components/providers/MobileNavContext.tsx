'use client';

import { useState, createContext, useContext, type FC, type ReactNode } from 'react';

interface IMobileNavContext {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const MobileNavContext = createContext<IMobileNavContext>({
  isOpen: false,
  setIsOpen: () => {},
});

export const useMobileNav = () => useContext(MobileNavContext);

export const DashboardShell: FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MobileNavContext.Provider value={{ isOpen, setIsOpen }}>{children}</MobileNavContext.Provider>
  );
};
