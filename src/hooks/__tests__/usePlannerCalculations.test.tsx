import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePlannerCalculations } from '../usePlannerCalculations';
import type { UsePlannerCalculationsProps } from '../usePlannerCalculations';
import '@testing-library/jest-dom';

// =============================================================================
// Test Suite: usePlannerCalculations Hook
// =============================================================================

// Mock the useDebouncedValue hook
vi.mock('../useDebouncedValue', () => ({
  useDebouncedValue: vi.fn((value) => value), // Return value immediately for testing
}));

describe('usePlannerCalculations', () => {
  // Default test props
  const defaultProps: UsePlannerCalculationsProps = {
    userProfile: {
      current_age: 35,
      retirement_age: 65,
      life_expectancy: 90,
      gross_annual_income: 600000,
      current_retirement_savings: 500000,
    },
    aiRecommendations: {
      monthlyContribution: 10000,
      investmentReturn: 9.0,
      inflationRate: 6.0,
    },
    currentAdjustments: {
      monthlyContribution: 12000,
      investmentReturn: 8.5,
      inflationRate: 6.0,
    },
  };

  // Mock Worker
  let mockWorker: {
    postMessage: ReturnType<typeof vi.fn>;
    terminate: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.useFakeTimers();

    // Create mock worker
    mockWorker = {
      postMessage: vi.fn(),
      terminate: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    // Mock Worker constructor
    global.Worker = vi.fn().mockImplementation(() => mockWorker) as unknown as typeof Worker;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // ---------------------------------------------------------------------------
  // 1. Initialization Tests
  // ---------------------------------------------------------------------------

  describe('Initialization', () => {
    it('should create worker on mount', () => {
      renderHook(() => usePlannerCalculations(defaultProps));

      expect(global.Worker).toHaveBeenCalledWith(
        expect.any(URL),
        { type: 'module' }
      );
    });

    it('should start with isCalculating = false', () => {
      const { result } = renderHook(() => usePlannerCalculations(defaultProps));

      expect(result.current.isCalculating).toBe(false);
    });

    it('should start with null impactSummary', () => {
      const { result } = renderHook(() => usePlannerCalculations(defaultProps));

      expect(result.current.impactSummary).toBeNull();
    });

    it('should start with null projections', () => {
      const { result } = renderHook(() => usePlannerCalculations(defaultProps));

      expect(result.current.projections).toBeNull();
    });

    it('should start with null error', () => {
      const { result } = renderHook(() => usePlannerCalculations(defaultProps));

      expect(result.current.error).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Worker Communication Tests
  // ---------------------------------------------------------------------------

  describe('Worker Communication', () => {
    it('should post message to worker when adjustments change', async () => {
      renderHook(() => usePlannerCalculations(defaultProps));

      await waitFor(() => {
        expect(mockWorker.postMessage).toHaveBeenCalledWith({
          type: 'CALCULATE',
          payload: expect.objectContaining({
            userProfile: defaultProps.userProfile,
            adjustments: {
              monthly_ra_contribution: defaultProps.currentAdjustments.monthlyContribution,
              investment_return: defaultProps.currentAdjustments.investmentReturn,
              inflation_rate: defaultProps.currentAdjustments.inflationRate,
            },
            aiRecommendations: {
              monthly_ra_contribution: defaultProps.aiRecommendations.monthlyContribution,
              investment_return: defaultProps.aiRecommendations.investmentReturn,
              inflation_rate: defaultProps.aiRecommendations.inflationRate,
            },
          }),
        });
      });
    });

    it('should add event listeners to worker', async () => {
      renderHook(() => usePlannerCalculations(defaultProps));

      await waitFor(() => {
        expect(mockWorker.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
        expect(mockWorker.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
      });
    });

    it('should handle SUCCESS message from worker', async () => {
      const { result } = renderHook(() => usePlannerCalculations(defaultProps));

      // Get the message handler
      const messageHandler = mockWorker.addEventListener.mock.calls.find(
        (call) => call[0] === 'message'
      )?.[1];

      // Simulate worker success message
      const successMessage = {
        data: {
          type: 'SUCCESS' as const,
          payload: {
            impactSummary: {
              retirementNestEggDelta: 500000,
              monthlyDrawdownDelta: 2500,
            },
            projections: {
              retirementNestEgg: 5000000,
              monthlyDrawdown: 25000,
              drawdownSchedule: [
                {
                  age: 65,
                  year: 0,
                  beginningBalance: 5000000,
                  withdrawal: 300000,
                  taxPaid: 60000,
                  netIncome: 240000,
                  endingBalance: 4700000,
                },
              ],
            },
          },
          calculationTime: 150,
        },
      };

      messageHandler(successMessage as MessageEvent);

      await waitFor(() => {
        expect(result.current.isCalculating).toBe(false);
        expect(result.current.impactSummary).toEqual(successMessage.data.payload.impactSummary);
        expect(result.current.projections).toEqual(successMessage.data.payload.projections);
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle ERROR message from worker', async () => {
      const { result } = renderHook(() => usePlannerCalculations(defaultProps));

      const messageHandler = mockWorker.addEventListener.mock.calls.find(
        (call) => call[0] === 'message'
      )?.[1];

      const errorMessage = {
        data: {
          type: 'ERROR' as const,
          payload: 'Calculation failed',
        },
      };

      messageHandler(errorMessage as MessageEvent);

      await waitFor(() => {
        expect(result.current.isCalculating).toBe(false);
        expect(result.current.error).toEqual(new Error('Calculation failed'));
      });
    });

    it('should set isCalculating to true when sending message', async () => {
      const { result } = renderHook(() => usePlannerCalculations(defaultProps));

      await waitFor(() => {
        expect(result.current.isCalculating).toBe(true);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Cleanup Tests
  // ---------------------------------------------------------------------------

  describe('Cleanup', () => {
    it('should terminate worker on unmount', () => {
      const { unmount } = renderHook(() => usePlannerCalculations(defaultProps));

      unmount();

      expect(mockWorker.terminate).toHaveBeenCalled();
    });

    it('should remove event listeners when adjustments change', async () => {
      const { rerender } = renderHook(
        (props: UsePlannerCalculationsProps) => usePlannerCalculations(props),
        {
          initialProps: defaultProps,
        }
      );

      // Wait for initial listeners to be added
      await waitFor(() => {
        expect(mockWorker.addEventListener).toHaveBeenCalled();
      });

      const initialCallCount = mockWorker.removeEventListener.mock.calls.length;

      // Change adjustments to trigger cleanup
      rerender({
        ...defaultProps,
        currentAdjustments: {
          monthlyContribution: 15000,
          investmentReturn: 8.5,
          inflationRate: 6.0,
        },
      });

      await waitFor(() => {
        expect(mockWorker.removeEventListener.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Error Handling Tests
  // ---------------------------------------------------------------------------

  describe('Error Handling', () => {
    it('should handle worker creation failure', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      global.Worker = vi.fn().mockImplementation(() => {
        throw new Error('Worker not supported');
      }) as unknown as typeof Worker;

      const { result } = renderHook(() => usePlannerCalculations(defaultProps));

      expect(result.current.error).toEqual(
        new Error('Failed to initialize calculation worker. Your browser may not support Web Workers.')
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle worker error events', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => usePlannerCalculations(defaultProps));

      const errorHandler = mockWorker.addEventListener.mock.calls.find(
        (call) => call[0] === 'error'
      )?.[1];

      const errorEvent = {
        message: 'Worker crashed',
      } as ErrorEvent;

      errorHandler(errorEvent);

      await waitFor(() => {
        expect(result.current.isCalculating).toBe(false);
        expect(result.current.error).toEqual(new Error('Worker error: Worker crashed'));
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
    });

    it('should handle missing user profile fields', async () => {
      const invalidProps: UsePlannerCalculationsProps = {
        ...defaultProps,
        userProfile: {
          current_age: 0,
          retirement_age: 0,
          life_expectancy: 0,
          gross_annual_income: 600000,
          current_retirement_savings: 500000,
        },
      };

      const { result } = renderHook(() => usePlannerCalculations(invalidProps));

      await waitFor(() => {
        expect(result.current.error).toEqual(
          new Error('Invalid user profile: missing required fields')
        );
      });
    });

    it('should clear error when new calculation starts', async () => {
      const { result, rerender } = renderHook(
        (props: UsePlannerCalculationsProps) => usePlannerCalculations(props),
        {
          initialProps: defaultProps,
        }
      );

      // Trigger error
      const messageHandler = mockWorker.addEventListener.mock.calls.find(
        (call) => call[0] === 'message'
      )?.[1];

      messageHandler({
        data: { type: 'ERROR' as const, payload: 'Test error' },
      } as MessageEvent);

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      // Change adjustments to trigger new calculation
      rerender({
        ...defaultProps,
        currentAdjustments: {
          monthlyContribution: 15000,
          investmentReturn: 8.5,
          inflationRate: 6.0,
        },
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 5. State Update Tests
  // ---------------------------------------------------------------------------

  describe('State Updates', () => {
    it('should update projections on successful calculation', async () => {
      const { result } = renderHook(() => usePlannerCalculations(defaultProps));

      const messageHandler = mockWorker.addEventListener.mock.calls.find(
        (call) => call[0] === 'message'
      )?.[1];

      const projectionData = {
        retirementNestEgg: 5000000,
        monthlyDrawdown: 25000,
        drawdownSchedule: [],
      };

      messageHandler({
        data: {
          type: 'SUCCESS' as const,
          payload: {
            impactSummary: { retirementNestEggDelta: 0, monthlyDrawdownDelta: 0 },
            projections: projectionData,
          },
        },
      } as MessageEvent);

      await waitFor(() => {
        expect(result.current.projections).toEqual(projectionData);
      });
    });

    it('should update impactSummary on successful calculation', async () => {
      const { result } = renderHook(() => usePlannerCalculations(defaultProps));

      const messageHandler = mockWorker.addEventListener.mock.calls.find(
        (call) => call[0] === 'message'
      )?.[1];

      const impactData = {
        retirementNestEggDelta: 500000,
        monthlyDrawdownDelta: 2500,
      };

      messageHandler({
        data: {
          type: 'SUCCESS' as const,
          payload: {
            impactSummary: impactData,
            projections: { retirementNestEgg: 0, monthlyDrawdown: 0, drawdownSchedule: [] },
          },
        },
      } as MessageEvent);

      await waitFor(() => {
        expect(result.current.impactSummary).toEqual(impactData);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Memoization Tests
  // ---------------------------------------------------------------------------

  describe('Memoization', () => {
    it('should return stable reference when values do not change', async () => {
      const { result, rerender } = renderHook(() => usePlannerCalculations(defaultProps));

      const firstResult = result.current;

      // Rerender without changing props
      rerender();

      const secondResult = result.current;

      // Should be same reference if values haven't changed
      expect(firstResult).toBe(secondResult);
    });

    it('should return new reference when values change', async () => {
      const { result } = renderHook(() => usePlannerCalculations(defaultProps));

      const firstResult = result.current;

      // Trigger state change
      const messageHandler = mockWorker.addEventListener.mock.calls.find(
        (call) => call[0] === 'message'
      )?.[1];

      messageHandler({
        data: {
          type: 'SUCCESS' as const,
          payload: {
            impactSummary: { retirementNestEggDelta: 500000, monthlyDrawdownDelta: 2500 },
            projections: { retirementNestEgg: 5000000, monthlyDrawdown: 25000, drawdownSchedule: [] },
          },
        },
      } as MessageEvent);

      await waitFor(() => {
        expect(result.current).not.toBe(firstResult);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Edge Cases
  // ---------------------------------------------------------------------------

  describe('Edge Cases', () => {
    it('should handle zero income', async () => {
      const zeroIncomeProps: UsePlannerCalculationsProps = {
        ...defaultProps,
        userProfile: {
          ...defaultProps.userProfile,
          gross_annual_income: 0,
        },
      };

      const { result } = renderHook(() => usePlannerCalculations(zeroIncomeProps));

      await waitFor(() => {
        expect(mockWorker.postMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: expect.objectContaining({
              userProfile: expect.objectContaining({
                gross_annual_income: 0,
              }),
            }),
          })
        );
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle zero savings', async () => {
      const zeroSavingsProps: UsePlannerCalculationsProps = {
        ...defaultProps,
        userProfile: {
          ...defaultProps.userProfile,
          current_retirement_savings: 0,
        },
      };

      const { result } = renderHook(() => usePlannerCalculations(zeroSavingsProps));

      await waitFor(() => {
        expect(mockWorker.postMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: expect.objectContaining({
              userProfile: expect.objectContaining({
                current_retirement_savings: 0,
              }),
            }),
          })
        );
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle undefined optional fields', async () => {
      const minimalProps: UsePlannerCalculationsProps = {
        ...defaultProps,
        userProfile: {
          current_age: 35,
          retirement_age: 65,
          life_expectancy: 90,
          gross_annual_income: 0,
          current_retirement_savings: 0,
        },
      };

      const { result } = renderHook(() => usePlannerCalculations(minimalProps));

      await waitFor(() => {
        expect(mockWorker.postMessage).toHaveBeenCalled();
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle worker not returning immediately', async () => {
      const { result } = renderHook(() => usePlannerCalculations(defaultProps));

      // Should be calculating while waiting
      await waitFor(() => {
        expect(result.current.isCalculating).toBe(true);
      });

      // Simulate delayed worker response
      const messageHandler = mockWorker.addEventListener.mock.calls.find(
        (call) => call[0] === 'message'
      )?.[1];

      setTimeout(() => {
        messageHandler({
          data: {
            type: 'SUCCESS' as const,
            payload: {
              impactSummary: { retirementNestEggDelta: 0, monthlyDrawdownDelta: 0 },
              projections: { retirementNestEgg: 0, monthlyDrawdown: 0, drawdownSchedule: [] },
            },
          },
        } as MessageEvent);
      }, 1000);

      vi.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(result.current.isCalculating).toBe(false);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Performance Logging Tests
  // ---------------------------------------------------------------------------

  describe('Performance Logging', () => {
    it('should log calculation time when provided', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { result } = renderHook(() => usePlannerCalculations(defaultProps));

      const messageHandler = mockWorker.addEventListener.mock.calls.find(
        (call) => call[0] === 'message'
      )?.[1];

      messageHandler({
        data: {
          type: 'SUCCESS' as const,
          payload: {
            impactSummary: { retirementNestEggDelta: 0, monthlyDrawdownDelta: 0 },
            projections: { retirementNestEgg: 0, monthlyDrawdown: 0, drawdownSchedule: [] },
          },
          calculationTime: 250,
        },
      } as MessageEvent);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          '[usePlannerCalculations] Calculation completed in 250ms'
        );
      });
    });

    it('should not log when calculationTime is undefined', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      renderHook(() => usePlannerCalculations(defaultProps));

      const messageHandler = mockWorker.addEventListener.mock.calls.find(
        (call) => call[0] === 'message'
      )?.[1];

      messageHandler({
        data: {
          type: 'SUCCESS' as const,
          payload: {
            impactSummary: { retirementNestEggDelta: 0, monthlyDrawdownDelta: 0 },
            projections: { retirementNestEgg: 0, monthlyDrawdown: 0, drawdownSchedule: [] },
          },
        },
      } as MessageEvent);

      await waitFor(() => {
        expect(consoleLogSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Calculation completed in')
        );
      });
    });
  });
});
