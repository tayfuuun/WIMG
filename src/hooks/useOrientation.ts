import { useState, useEffect } from 'react';

export type OrientationMode = 'auto' | 'portrait' | 'landscape';

export function useOrientation() {
  const [deviceIsPortrait, setDeviceIsPortrait] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(orientation: portrait)').matches || window.innerHeight > window.innerWidth;
    }
    return false;
  });

  const [forcedMode, setForcedMode] = useState<OrientationMode>('auto');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia('(orientation: portrait)');
    const updateOrientation = () => {
      setDeviceIsPortrait(mql.matches || window.innerHeight > window.innerWidth);
    };

    if (mql.addEventListener) {
      mql.addEventListener('change', updateOrientation);
    } else {
      mql.addListener(updateOrientation);
    }

    window.addEventListener('resize', updateOrientation);

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', updateOrientation);
      } else {
        mql.removeListener(updateOrientation);
      }
      window.removeEventListener('resize', updateOrientation);
    };
  }, []);

  const isPortrait = forcedMode === 'auto' ? deviceIsPortrait : forcedMode === 'portrait';

  return {
    isPortrait,
    deviceIsPortrait,
    forcedMode,
    setForcedMode,
  };
}
