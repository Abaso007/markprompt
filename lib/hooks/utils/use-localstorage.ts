import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

// TODO: support non-primitive types. Currently, non-primitive types
// such as array result in infinite render loops.
export const useLocalStorage = <T>(
  key: string | null,
  initialValue: T,
): [T | undefined, (value: T) => void] => {
  const isServer = typeof window === 'undefined';
  const useEffectFn = !isServer ? useLayoutEffect : useEffect;

  const [storedOrDefaultValue, setStoredOrDefaultValue] = useState<
    T | undefined
  >(undefined);

  useEffectFn(() => {
    if (!key) {
      return;
    }

    if (typeof window === 'undefined') {
      return setStoredOrDefaultValue(undefined);
    }

    try {
      const item = localStorage.getItem(key);
      setStoredOrDefaultValue(item ? JSON.parse(item) : initialValue);
    } catch (e) {
      console.error('Error getting value from localStorage', e);
      return setStoredOrDefaultValue(undefined);
    }
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedOrDefaultValue) : value;
        setStoredOrDefaultValue(valueToStore);
        if (typeof window !== 'undefined' && key) {
          localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (e) {
        console.error('Error writing value to localStorage', e);
      }
    },
    [key, storedOrDefaultValue],
  );

  return [!key ? undefined : storedOrDefaultValue, setValue];
};
