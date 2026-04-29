import { useRef, useCallback } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TAnyFunction = (...args: any[]) => any;

export const useHandler = <T extends TAnyFunction>(f: T): T => {
  const ref = useRef<T>(f);
  // eslint-disable-next-line react-hooks/refs
  ref.current = f;
  return useCallback((...args: Parameters<T>) => ref.current(...args), []) as T;
};
