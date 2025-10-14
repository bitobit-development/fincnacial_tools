import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebouncedValue } from '../useDebouncedValue';
import '@testing-library/jest-dom';

// =============================================================================
// Test Suite: useDebouncedValue Hook
// =============================================================================

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // ---------------------------------------------------------------------------
  // 1. Basic Functionality Tests
  // ---------------------------------------------------------------------------

  describe('Basic Functionality', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebouncedValue('initial', 300));

      expect(result.current).toBe('initial');
    });

    it('should debounce value changes by default delay (300ms)', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        {
          initialProps: { value: 'initial' },
        }
      );

      // Initial value
      expect(result.current).toBe('initial');

      // Update value
      rerender({ value: 'updated' });

      // Value should not change immediately
      expect(result.current).toBe('initial');

      // Advance time by 299ms (just before delay)
      vi.advanceTimersByTime(299);
      expect(result.current).toBe('initial');

      // Advance time by 1ms more (total 300ms)
      vi.advanceTimersByTime(1);
      await waitFor(() => {
        expect(result.current).toBe('updated');
      });
    });

    it('should support custom delay values', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 500),
        {
          initialProps: { value: 'initial' },
        }
      );

      rerender({ value: 'updated' });

      // Should not update before 500ms
      vi.advanceTimersByTime(499);
      expect(result.current).toBe('initial');

      // Should update after 500ms
      vi.advanceTimersByTime(1);
      await waitFor(() => {
        expect(result.current).toBe('updated');
      });
    });

    it('should handle zero delay', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 0),
        {
          initialProps: { value: 'initial' },
        }
      );

      rerender({ value: 'updated' });

      // Should update immediately (next tick)
      vi.advanceTimersByTime(0);
      await waitFor(() => {
        expect(result.current).toBe('updated');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Multiple Rapid Changes Tests
  // ---------------------------------------------------------------------------

  describe('Multiple Rapid Changes', () => {
    it('should only update to final value after multiple rapid changes', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        {
          initialProps: { value: 'initial' },
        }
      );

      // Make multiple rapid changes
      rerender({ value: 'change1' });
      vi.advanceTimersByTime(100);

      rerender({ value: 'change2' });
      vi.advanceTimersByTime(100);

      rerender({ value: 'change3' });
      vi.advanceTimersByTime(100);

      // Should still have initial value (debounce not expired)
      expect(result.current).toBe('initial');

      // Wait for full debounce delay from last change
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        expect(result.current).toBe('change3');
      });
    });

    it('should reset timer on each value change', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        {
          initialProps: { value: 'initial' },
        }
      );

      // First change
      rerender({ value: 'change1' });
      vi.advanceTimersByTime(250);

      // Second change (resets timer)
      rerender({ value: 'change2' });
      vi.advanceTimersByTime(250);

      // Should still have initial value
      expect(result.current).toBe('initial');

      // Complete the debounce
      vi.advanceTimersByTime(50);
      await waitFor(() => {
        expect(result.current).toBe('change2');
      });
    });

    it('should handle 10 rapid changes (stress test)', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        {
          initialProps: { value: 0 },
        }
      );

      // Simulate 10 rapid slider adjustments
      for (let i = 1; i <= 10; i++) {
        rerender({ value: i });
        vi.advanceTimersByTime(50); // Each change 50ms apart
      }

      // Should still have initial value
      expect(result.current).toBe(0);

      // Wait for debounce to complete
      vi.advanceTimersByTime(250);
      await waitFor(() => {
        expect(result.current).toBe(10);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Type Handling Tests
  // ---------------------------------------------------------------------------

  describe('Type Handling', () => {
    it('should work with string values', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        {
          initialProps: { value: 'hello' },
        }
      );

      rerender({ value: 'world' });
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(result.current).toBe('world');
      });
    });

    it('should work with number values', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        {
          initialProps: { value: 100 },
        }
      );

      rerender({ value: 200 });
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(result.current).toBe(200);
      });
    });

    it('should work with object values', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        {
          initialProps: { value: { count: 1 } },
        }
      );

      const newValue = { count: 2 };
      rerender({ value: newValue });
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(result.current).toEqual(newValue);
      });
    });

    it('should work with array values', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        {
          initialProps: { value: [1, 2, 3] },
        }
      );

      const newValue = [4, 5, 6];
      rerender({ value: newValue });
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(result.current).toEqual(newValue);
      });
    });

    it('should work with null values', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        {
          initialProps: { value: 'initial' as string | null },
        }
      );

      rerender({ value: null });
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(result.current).toBeNull();
      });
    });

    it('should work with undefined values', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        {
          initialProps: { value: 'initial' as string | undefined },
        }
      );

      rerender({ value: undefined });
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });

    it('should work with boolean values', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        {
          initialProps: { value: false },
        }
      );

      rerender({ value: true });
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Cleanup Tests
  // ---------------------------------------------------------------------------

  describe('Cleanup', () => {
    it('should cleanup timeout on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const { rerender, unmount } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        {
          initialProps: { value: 'initial' },
        }
      );

      rerender({ value: 'updated' });
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should cleanup previous timeout on value change', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const { rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        {
          initialProps: { value: 'initial' },
        }
      );

      rerender({ value: 'change1' });
      const callCountAfterFirst = clearTimeoutSpy.mock.calls.length;

      rerender({ value: 'change2' });
      const callCountAfterSecond = clearTimeoutSpy.mock.calls.length;

      expect(callCountAfterSecond).toBeGreaterThan(callCountAfterFirst);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Edge Cases
  // ---------------------------------------------------------------------------

  describe('Edge Cases', () => {
    it('should handle same value updates', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        {
          initialProps: { value: 'same' },
        }
      );

      // Update with same value
      rerender({ value: 'same' });
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(result.current).toBe('same');
      });
    });

    it('should handle very large delay values', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 10000),
        {
          initialProps: { value: 'initial' },
        }
      );

      rerender({ value: 'updated' });

      // Should not update before 10000ms
      vi.advanceTimersByTime(9999);
      expect(result.current).toBe('initial');

      // Should update after 10000ms
      vi.advanceTimersByTime(1);
      await waitFor(() => {
        expect(result.current).toBe('updated');
      });
    });

    it('should handle delay change during debouncing', async () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebouncedValue(value, delay),
        {
          initialProps: { value: 'initial', delay: 300 },
        }
      );

      // Change value with 300ms delay
      rerender({ value: 'updated', delay: 300 });
      vi.advanceTimersByTime(150);

      // Change delay to 500ms (should reset timer)
      rerender({ value: 'updated', delay: 500 });

      // Original 300ms should not trigger
      vi.advanceTimersByTime(150);
      expect(result.current).toBe('initial');

      // New 500ms should trigger
      vi.advanceTimersByTime(350);
      await waitFor(() => {
        expect(result.current).toBe('updated');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Performance Tests
  // ---------------------------------------------------------------------------

  describe('Performance', () => {
    it('should not cause excessive re-renders', () => {
      let renderCount = 0;

      const { rerender } = renderHook(
        ({ value }) => {
          renderCount++;
          return useDebouncedValue(value, 300);
        },
        {
          initialProps: { value: 'initial' },
        }
      );

      const initialRenderCount = renderCount;

      // Change value multiple times
      rerender({ value: 'change1' });
      rerender({ value: 'change2' });
      rerender({ value: 'change3' });

      // Should have rendered for initial + 3 changes
      expect(renderCount).toBe(initialRenderCount + 3);
    });

    it('should handle high-frequency updates efficiently', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 100),
        {
          initialProps: { value: 0 },
        }
      );

      // Simulate 100 rapid updates (10 per ms)
      for (let i = 1; i <= 100; i++) {
        rerender({ value: i });
        vi.advanceTimersByTime(1);
      }

      // Wait for debounce
      vi.advanceTimersByTime(100);

      await waitFor(() => {
        expect(result.current).toBe(100);
      });
    });
  });
});
