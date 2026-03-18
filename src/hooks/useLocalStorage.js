import { useState, useEffect } from 'react';

/**
 * Hook for syncing a value with localStorage.
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value if not found
 * @returns {[any, function]}
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore
    }
  }, [key, value]);

  return [value, setValue];
}
