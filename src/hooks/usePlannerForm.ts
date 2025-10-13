'use client';

// =============================================================================
// React Hook Form - Planner Form Hook
// =============================================================================

import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  plannerSchema,
  type PlannerFormData,
  defaultPlannerValues,
} from '@/lib/schemas/plannerSchema';

/**
 * Custom hook for managing the retirement planner form state
 *
 * Features:
 * - Zod validation with zodResolver
 * - Type-safe form data
 * - onChange validation mode for real-time feedback
 * - Default values for new plans
 * - Supports partial initial values for loading existing plans
 *
 * @param defaultValues - Optional partial form data to initialize the form
 * @returns React Hook Form instance configured for planner data
 *
 * @example
 * ```tsx
 * const form = usePlannerForm();
 *
 * // With existing plan data
 * const form = usePlannerForm({
 *   currentAge: 40,
 *   retirementAge: 67,
 *   startingBalance: 250000,
 * });
 * ```
 */
export const usePlannerForm = (
  defaultValues?: Partial<PlannerFormData>
): UseFormReturn<PlannerFormData> => {
  const form = useForm<PlannerFormData>({
    resolver: zodResolver(plannerSchema),
    defaultValues: {
      ...defaultPlannerValues,
      ...defaultValues,
    },
    mode: 'onChange', // Validate on every change for real-time feedback
    reValidateMode: 'onChange',
  });

  return form;
};

/**
 * Hook return type for external use
 */
export type UsePlannerFormReturn = ReturnType<typeof usePlannerForm>;
