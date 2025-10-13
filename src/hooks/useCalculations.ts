'use client';

// =============================================================================
// Calculations Hook - Real-time Projection Engine Integration
// =============================================================================

import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { generateFullProjection } from '@/lib/calculations/projections';
import { generateStatistics } from '@/lib/calculations/statistics';
import type { PlannerFormData } from '@/lib/schemas/plannerSchema';
import type { ProjectionYear, Statistics } from '@/types';

/**
 * Calculations result type
 */
export type CalculationsResult = {
  projections: ProjectionYear[];
  statistics: Statistics;
};

/**
 * Hook configuration
 */
type UseCalculationsOptions = {
  debounceMs?: number; // Debounce delay (default: 250ms)
  enabled?: boolean; // Enable/disable calculations (default: true)
};

/**
 * Custom hook for running retirement calculations with debouncing
 *
 * Features:
 * - Automatic debouncing (250ms default) for smooth slider interactions
 * - Real-time projection updates
 * - Loading state management
 * - Error handling with graceful fallbacks
 * - Memoized results to prevent unnecessary recalculations
 * - Conditional execution (can be disabled)
 *
 * @param formData - Current form data from react-hook-form
 * @param options - Configuration options
 * @returns { results, loading, error }
 *
 * @example
 * ```tsx
 * const formData = watch(); // react-hook-form
 * const { results, loading, error } = useCalculations(formData);
 *
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * return <Chart data={results.projections} />;
 * ```
 */
export const useCalculations = (
  formData: PlannerFormData,
  options: UseCalculationsOptions = {}
): {
  results: CalculationsResult | null;
  loading: boolean;
  error: Error | null;
} => {
  const { debounceMs = 250, enabled = true } = options;

  // Debounce form data changes
  const [debouncedData] = useDebounce(formData, debounceMs);

  // State
  const [results, setResults] = useState<CalculationsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Run calculations when debounced data changes
  useEffect(() => {
    if (!enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (
        !debouncedData.currentAge ||
        !debouncedData.retirementAge ||
        debouncedData.startingBalance === undefined ||
        debouncedData.monthlyContribution === undefined ||
        !debouncedData.annualReturn ||
        !debouncedData.inflation ||
        !debouncedData.drawdownRate
      ) {
        throw new Error('Missing required calculation parameters');
      }

      // Transform form data to PlannerState
      const plannerState = {
        currentAge: debouncedData.currentAge,
        retirementAge: debouncedData.retirementAge,
        startingBalance: debouncedData.startingBalance,
        monthlyContribution: debouncedData.monthlyContribution,
        annualReturn: debouncedData.annualReturn,
        inflation: debouncedData.inflation,
        drawdownRate: debouncedData.drawdownRate,
      };

      // Generate projections (year-by-year breakdown)
      const projections = generateFullProjection(plannerState);

      // Generate aggregate statistics (generates projections internally)
      const statistics = generateStatistics(plannerState);

      // Update state
      setResults({ projections, statistics });
      setLoading(false);
    } catch (err) {
      console.error('[useCalculations] Calculation error:', err);
      setError(
        err instanceof Error ? err : new Error('Failed to run calculations')
      );
      setLoading(false);
    }
  }, [debouncedData, enabled]);

  return { results, loading, error };
};

/**
 * Hook for calculating a specific metric without full projection
 *
 * Useful for showing individual metrics in real-time without computing
 * the entire projection (more performant for simple displays)
 *
 * @param formData - Current form data
 * @param metric - Metric to calculate
 * @returns Calculated value
 *
 * @example
 * ```tsx
 * const retirementBalance = useCalculateMetric(formData, 'retirementBalance');
 * ```
 */
export const useCalculateMetric = (
  formData: PlannerFormData,
  metric: 'retirementBalance' | 'totalContributions' | 'yearsUntilRetirement'
) => {
  const [debouncedData] = useDebounce(formData, 250);

  return useMemo(() => {
    try {
      switch (metric) {
        case 'yearsUntilRetirement':
          return debouncedData.retirementAge - debouncedData.currentAge;

        case 'totalContributions': {
          const yearsUntilRetirement =
            debouncedData.retirementAge - debouncedData.currentAge;
          const monthlyContribution = debouncedData.monthlyContribution || 0;
          const annualContribution = monthlyContribution * 12;
          return (
            debouncedData.startingBalance +
            annualContribution * yearsUntilRetirement
          );
        }

        case 'retirementBalance': {
          // Quick approximation using FV formula
          const yearsUntilRetirement =
            debouncedData.retirementAge - debouncedData.currentAge;
          const r = (debouncedData.annualReturn || 0) / 100;
          const pmt = (debouncedData.monthlyContribution || 0) * 12;
          const pv = debouncedData.startingBalance || 0;

          // FV = PV * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
          const fv =
            pv * Math.pow(1 + r, yearsUntilRetirement) +
            pmt * ((Math.pow(1 + r, yearsUntilRetirement) - 1) / r);

          return Math.round(fv);
        }

        default:
          return 0;
      }
    } catch {
      return 0;
    }
  }, [debouncedData, metric]);
};

/**
 * Hook to compare multiple scenarios
 *
 * @param baseFormData - Base scenario
 * @param comparisonScenarios - Array of scenarios to compare
 * @returns { scenarios, loading, error }
 *
 * @example
 * ```tsx
 * const { scenarios, loading } = useScenarioComparison(baseData, [
 *   { ...baseData, annualReturn: 8 },
 *   { ...baseData, annualReturn: 12 },
 * ]);
 * ```
 */
export const useScenarioComparison = (
  baseFormData: PlannerFormData,
  comparisonScenarios: PlannerFormData[]
) => {
  const [debouncedBase] = useDebounce(baseFormData, 500);
  const [debouncedComparisons] = useDebounce(comparisonScenarios, 500);

  const [scenarios, setScenarios] = useState<CalculationsResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Calculate base scenario
      const baseProjections = generateFullProjection({
        currentAge: debouncedBase.currentAge,
        retirementAge: debouncedBase.retirementAge,
        startingBalance: debouncedBase.startingBalance,
        monthlyContribution: debouncedBase.monthlyContribution,
        annualReturn: debouncedBase.annualReturn,
        inflation: debouncedBase.inflation,
        drawdownRate: debouncedBase.drawdownRate,
      });

      const baseStatistics = generateStatistics({
        currentAge: debouncedBase.currentAge,
        retirementAge: debouncedBase.retirementAge,
        startingBalance: debouncedBase.startingBalance,
        monthlyContribution: debouncedBase.monthlyContribution,
        annualReturn: debouncedBase.annualReturn,
        inflation: debouncedBase.inflation,
        drawdownRate: debouncedBase.drawdownRate,
      });

      // Calculate comparison scenarios
      const comparisons = debouncedComparisons.map((scenario) => {
        const projections = generateFullProjection({
          currentAge: scenario.currentAge,
          retirementAge: scenario.retirementAge,
          startingBalance: scenario.startingBalance,
          monthlyContribution: scenario.monthlyContribution,
          annualReturn: scenario.annualReturn,
          inflation: scenario.inflation,
          drawdownRate: scenario.drawdownRate,
        });

        const statistics = generateStatistics({
          currentAge: scenario.currentAge,
          retirementAge: scenario.retirementAge,
          startingBalance: scenario.startingBalance,
          monthlyContribution: scenario.monthlyContribution,
          annualReturn: scenario.annualReturn,
          inflation: scenario.inflation,
          drawdownRate: scenario.drawdownRate,
        });

        return { projections, statistics };
      });

      setScenarios([
        { projections: baseProjections, statistics: baseStatistics },
        ...comparisons,
      ]);
      setLoading(false);
    } catch (err) {
      console.error('[useScenarioComparison] Error:', err);
      setError(
        err instanceof Error ? err : new Error('Failed to compare scenarios')
      );
      setLoading(false);
    }
  }, [debouncedBase, debouncedComparisons]);

  return { scenarios, loading, error };
};

/**
 * Hook type exports
 */
export type UseCalculationsReturn = ReturnType<typeof useCalculations>;
export type UseCalculateMetricReturn = ReturnType<typeof useCalculateMetric>;
export type UseScenarioComparisonReturn = ReturnType<typeof useScenarioComparison>;
