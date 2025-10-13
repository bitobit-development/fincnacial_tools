// =============================================================================
// Zod Validation Schema - AI Retirement Planner Form
// =============================================================================

import { z } from 'zod';

/**
 * Planner Form Validation Schema
 *
 * Validates all inputs for the retirement planner form with:
 * - Age constraints (18-80 for current, 40-100 for retirement)
 * - Financial input validation (non-negative balances, percentage ranges)
 * - Cross-field validation (retirement age > current age)
 * - Optional fund selection
 */
export const plannerSchema = z
  .object({
    // Age Inputs
    currentAge: z
      .number({ message: 'Current age must be a number' })
      .min(18, { message: 'Current age must be at least 18' })
      .max(80, { message: 'Current age must be 80 or less' })
      .int({ message: 'Current age must be a whole number' }),

    retirementAge: z
      .number({ message: 'Retirement age must be a number' })
      .min(40, { message: 'Retirement age must be at least 40' })
      .max(100, { message: 'Retirement age must be 100 or less' })
      .int({ message: 'Retirement age must be a whole number' }),

    // Financial Inputs
    startingBalance: z
      .number({ message: 'Starting balance must be a number' })
      .min(0, { message: 'Starting balance cannot be negative' })
      .finite({ message: 'Starting balance must be a finite number' }),

    monthlyContribution: z
      .number({ message: 'Monthly contribution must be a number' })
      .min(0, { message: 'Monthly contribution cannot be negative' })
      .finite({ message: 'Monthly contribution must be a finite number' }),

    annualReturn: z
      .number({ message: 'Annual return must be a number' })
      .min(-10, { message: 'Annual return cannot be less than -10%' })
      .max(30, { message: 'Annual return cannot exceed 30%' })
      .finite({ message: 'Annual return must be a finite number' }),

    inflation: z
      .number({ message: 'Inflation rate must be a number' })
      .min(0, { message: 'Inflation rate cannot be negative' })
      .max(20, { message: 'Inflation rate cannot exceed 20%' })
      .finite({ message: 'Inflation rate must be a finite number' }),

    drawdownRate: z
      .number({ message: 'Drawdown rate must be a number' })
      .min(0, { message: 'Drawdown rate cannot be negative' })
      .max(20, { message: 'Drawdown rate cannot exceed 20%' })
      .finite({ message: 'Drawdown rate must be a finite number' }),
  })
  .refine((data) => data.retirementAge > data.currentAge, {
    message: 'Retirement age must be greater than current age',
    path: ['retirementAge'],
  })
  .refine(
    (data) => {
      // If both currentAge and retirementAge are valid, ensure at least 5 years until retirement
      const yearsUntilRetirement = data.retirementAge - data.currentAge;
      return yearsUntilRetirement >= 5;
    },
    {
      message: 'Must have at least 5 years until retirement',
      path: ['retirementAge'],
    }
  );

/**
 * TypeScript type inferred from the Zod schema
 */
export type PlannerFormData = z.infer<typeof plannerSchema>;

/**
 * Partial schema for progressive validation
 * Allows validation of individual fields without requiring all fields
 */
export const plannerSchemaPartial = plannerSchema.partial();

/**
 * Default form values
 */
export const defaultPlannerValues: PlannerFormData = {
  currentAge: 35,
  retirementAge: 65,
  startingBalance: 100000,
  monthlyContribution: 5000,
  annualReturn: 10.5,
  inflation: 6.0,
  drawdownRate: 5.0,
};

/**
 * Helper function to safely parse form data
 * Returns parsed data or validation errors
 */
export const parsePlannerFormData = (data: unknown) => {
  return plannerSchema.safeParse(data);
};

/**
 * Helper function to validate a single field
 */
export const validatePlannerField = <K extends keyof PlannerFormData>(
  field: K,
  value: PlannerFormData[K]
) => {
  const fieldSchema = plannerSchema.shape[field];
  return fieldSchema.safeParse(value);
};
