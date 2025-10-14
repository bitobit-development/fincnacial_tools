'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook to debounce a value
 *
 * Delays updating the returned value until the input value has stopped
 * changing for the specified delay period. Useful for expensive operations
 * like calculations or API calls triggered by user input.
 *
 * @template T - Type of the value to debounce
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds before updating (default: 300ms)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebouncedValue(searchTerm, 500);
 *
 * useEffect(() => {
 *   // This will only run 500ms after the user stops typing
 *   searchAPI(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 * ```
 */
export const useDebouncedValue = <T,>(value: T, delay = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout to update the debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
