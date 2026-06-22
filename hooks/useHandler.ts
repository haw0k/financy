import { useCallback, useRef } from 'react';

// biome-ignore lint/suspicious/noExplicitAny: generic handler type requires any
type TAnyFunction = (...args: any[]) => any;

export const useHandler = <T extends TAnyFunction>(f: T): T => {
  const ref = useRef<T>(f);
  // eslint-disable-next-line react-hooks/refs
  ref.current = f;
  return useCallback((...args: Parameters<T>) => ref.current(...args), []) as T;
};
