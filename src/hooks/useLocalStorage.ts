'use client';

// =============================================================================
// Local Storage Hook - Persist Form State
// =============================================================================

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for persisting state to localStorage
 *
 * Features:
 * - Automatic serialization/deserialization
 * - SSR-safe (won't break during server-side rendering)
 * - Type-safe with generics
 * - Error handling for quota exceeded and parsing errors
 * - Synchronization across tabs (via storage event)
 *
 * @param key - localStorage key
 * @param initialValue - Default value if key doesn't exist
 * @returns [storedValue, setValue, removeValue]
 *
 * @example
 * ```tsx
 * const [formData, setFormData, clearFormData] = useLocalStorage<PlannerFormData>(
 *   'planner-form-draft',
 *   defaultPlannerValues
 * );
 * ```
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Return initialValue during SSR (window is undefined)
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function (same API as useState)
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        // Handle quota exceeded error
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          console.error('localStorage quota exceeded');
        } else {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
      }
    },
    [key, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes in other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        // Key was removed in another tab
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook for auto-saving form data to localStorage with debounce
 *
 * @param key - localStorage key
 * @param data - Data to save
 * @param debounceMs - Debounce delay in milliseconds (default: 500)
 *
 * @example
 * ```tsx
 * const formData = watch(); // react-hook-form
 * useAutoSaveLocalStorage('planner-form-draft', formData, 500);
 * ```
 */
export const useAutoSaveLocalStorage = <T>(key: string, data: T, debounceMs: number = 500) => {
  const [, setValue] = useLocalStorage<T>(key, data);

  useEffect(() => {
    const timer = setTimeout(() => {
      setValue(data);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [data, debounceMs, setValue]);
};
