'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDebouncedValue } from './useDebouncedValue';

// ============================================================================
// Type Definitions
// ============================================================================

export interface DrawdownScheduleRow {
  age: number;
  year: number;
  beginningBalance: number;
  withdrawal: number;
  taxPaid: number;
  netIncome: number;
  endingBalance: number;
}

export interface UsePlannerCalculationsProps {
  aiRecommendations: {
    monthlyContribution: number;
    investmentReturn: number;
    inflationRate: number;
  };
  currentAdjustments: {
    monthlyContribution: number;
    investmentReturn: number;
    inflationRate: number;
  };
  userProfile: {
    current_age: number;
    retirement_age: number;
    life_expectancy: number;
    gross_annual_income: number;
    current_retirement_savings: number;
  };
}

export interface UsePlannerCalculationsReturn {
  impactSummary: {
    retirementNestEggDelta: number;
    monthlyDrawdownDelta: number;
  } | null;
  isCalculating: boolean;
  projections: {
    retirementNestEgg: number;
    monthlyDrawdown: number;
    drawdownSchedule: DrawdownScheduleRow[];
  } | null;
  error: Error | null;
}

// ============================================================================
// Worker Message Types
// ============================================================================

interface WorkerInput {
  userProfile: {
    current_age: number;
    retirement_age: number;
    life_expectancy: number;
    gross_annual_income: number;
    current_retirement_savings: number;
  };
  adjustments: {
    monthly_ra_contribution: number;
    investment_return: number;
    inflation_rate: number;
  };
  aiRecommendations: {
    monthly_ra_contribution: number;
    investment_return: number;
    inflation_rate: number;
  };
}

interface WorkerSuccessMessage {
  type: 'SUCCESS';
  payload: {
    impactSummary: {
      retirementNestEggDelta: number;
      monthlyDrawdownDelta: number;
    };
    projections: {
      retirementNestEgg: number;
      monthlyDrawdown: number;
      drawdownSchedule: DrawdownScheduleRow[];
    };
  };
  calculationTime?: number;
}

interface WorkerErrorMessage {
  type: 'ERROR';
  payload: string;
}

type WorkerMessage = WorkerSuccessMessage | WorkerErrorMessage;

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Custom hook for real-time retirement projection calculations using Web Worker
 *
 * Features:
 * - Performs calculations in background thread (non-blocking)
 * - Automatic debouncing (300ms) to prevent excessive calculations
 * - Real-time impact summary showing delta from AI recommendations
 * - Generates complete drawdown schedule
 * - Error handling and loading states
 * - Proper cleanup on unmount
 *
 * Performance:
 * - Calculations typically complete in <500ms
 * - UI remains responsive (60fps) during calculations
 * - Memory-efficient worker cleanup
 *
 * @param props - User profile, AI recommendations, and current adjustments
 * @returns Calculation results, loading state, and error state
 *
 * @example
 * ```tsx
 * const { impactSummary, projections, isCalculating, error } = usePlannerCalculations({
 *   userProfile: {
 *     current_age: 35,
 *     retirement_age: 65,
 *     life_expectancy: 90,
 *     gross_annual_income: 600000,
 *     current_retirement_savings: 500000,
 *   },
 *   aiRecommendations: {
 *     monthlyContribution: 10000,
 *     investmentReturn: 9.0,
 *     inflationRate: 6.0,
 *   },
 *   currentAdjustments: {
 *     monthlyContribution: 12000,
 *     investmentReturn: 8.5,
 *     inflationRate: 6.0,
 *   },
 * });
 * ```
 */
export const usePlannerCalculations = (
  props: UsePlannerCalculationsProps
): UsePlannerCalculationsReturn => {
  const { aiRecommendations, currentAdjustments, userProfile } = props;

  // State
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [impactSummary, setImpactSummary] = useState<{
    retirementNestEggDelta: number;
    monthlyDrawdownDelta: number;
  } | null>(null);
  const [projections, setProjections] = useState<{
    retirementNestEgg: number;
    monthlyDrawdown: number;
    drawdownSchedule: DrawdownScheduleRow[];
  } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Debounce adjustments to prevent excessive calculations
  const debouncedAdjustments = useDebouncedValue(currentAdjustments, 300);

  // Create worker on mount, terminate on unmount
  useEffect(() => {
    try {
      const w = new Worker(
        new URL('../workers/plannerCalculations.worker.ts', import.meta.url),
        { type: 'module' }
      );
      setWorker(w);

      return () => {
        w.terminate();
      };
    } catch (err) {
      console.error('[usePlannerCalculations] Failed to create worker:', err);
      setError(
        new Error(
          'Failed to initialize calculation worker. Your browser may not support Web Workers.'
        )
      );
    }
  }, []);

  // Trigger calculation when adjustments change
  useEffect(() => {
    if (!worker) return;

    // Validate user profile
    if (
      !userProfile.current_age ||
      !userProfile.retirement_age ||
      !userProfile.life_expectancy
    ) {
      setError(new Error('Invalid user profile: missing required fields'));
      return;
    }

    setIsCalculating(true);
    setError(null);

    const workerInput: WorkerInput = {
      userProfile: {
        current_age: userProfile.current_age,
        retirement_age: userProfile.retirement_age,
        life_expectancy: userProfile.life_expectancy,
        gross_annual_income: userProfile.gross_annual_income || 0,
        current_retirement_savings: userProfile.current_retirement_savings || 0,
      },
      adjustments: {
        monthly_ra_contribution: debouncedAdjustments.monthlyContribution,
        investment_return: debouncedAdjustments.investmentReturn,
        inflation_rate: debouncedAdjustments.inflationRate,
      },
      aiRecommendations: {
        monthly_ra_contribution: aiRecommendations.monthlyContribution,
        investment_return: aiRecommendations.investmentReturn,
        inflation_rate: aiRecommendations.inflationRate,
      },
    };

    // Send calculation request to worker
    worker.postMessage({
      type: 'CALCULATE',
      payload: workerInput,
    });

    // Handle worker messages
    const handleMessage = (e: MessageEvent<WorkerMessage>) => {
      const message = e.data;

      if (message.type === 'SUCCESS') {
        setProjections(message.payload.projections);
        setImpactSummary(message.payload.impactSummary);
        setIsCalculating(false);

        // Log performance
        if (message.calculationTime !== undefined) {
          console.log(
            `[usePlannerCalculations] Calculation completed in ${message.calculationTime}ms`
          );
        }
      } else if (message.type === 'ERROR') {
        setError(new Error(message.payload));
        setIsCalculating(false);
      }
    };

    const handleError = (err: ErrorEvent) => {
      console.error('[usePlannerCalculations] Worker error:', err);
      setError(new Error(`Worker error: ${err.message}`));
      setIsCalculating(false);
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    return () => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
    };
  }, [debouncedAdjustments, worker, aiRecommendations, userProfile]);

  // Memoize return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      impactSummary,
      isCalculating,
      projections,
      error,
    }),
    [impactSummary, isCalculating, projections, error]
  );
};
