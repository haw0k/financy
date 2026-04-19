import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

function getSnapshot() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

function subscribe() {
  return () => {};
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, () => false);
}
