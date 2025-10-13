'use server';

// =============================================================================
// Server Actions - Retirement Plan Operations
// =============================================================================

import { revalidatePath } from 'next/cache';
import {
  savePlan as dbSavePlan,
  getUserPlans,
  getPlanById,
  deletePlan as dbDeletePlan,
  getDefaultPlan,
} from '@/lib/db/queries';
import type { InsertRetirementPlan } from '@/lib/db/schema';
import { plannerSchema } from '@/lib/schemas/plannerSchema';

/**
 * Server Action Response Type
 */
type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Save a retirement plan (create or update)
 *
 * Server Action for creating a new plan or updating an existing one.
 * Validates input, saves to database, and revalidates the planner page.
 *
 * @param formData - FormData from form submission
 * @returns ActionResponse with saved plan or error
 *
 * @example
 * ```tsx
 * <form action={savePlan}>
 *   <input name="planName" />
 *   <input name="currentAge" type="number" />
 *   ...
 * </form>
 * ```
 */
export async function savePlan(formData: FormData): Promise<ActionResponse> {
  try {
    // Extract data from FormData
    const planId = formData.get('id') as string | null;
    const userId = formData.get('userId') as string;
    const planName = formData.get('planName') as string;
    const description = formData.get('description') as string | null;

    // Extract planner fields
    const currentAge = parseInt(formData.get('currentAge') as string, 10);
    const retirementAge = parseInt(formData.get('retirementAge') as string, 10);
    const startingBalance = parseFloat(formData.get('startingBalance') as string);
    const monthlyContribution = parseFloat(formData.get('monthlyContribution') as string);
    const annualReturn = parseFloat(formData.get('annualReturn') as string);
    const inflation = parseFloat(formData.get('inflation') as string);
    const drawdownRate = parseFloat(formData.get('drawdownRate') as string);
    const targetMonthlyToday = formData.get('targetMonthlyToday')
      ? parseFloat(formData.get('targetMonthlyToday') as string)
      : null;
    const fundName = formData.get('fundName') as string | null;
    const fundCode = formData.get('fundCode') as string | null;
    const isDefault = formData.get('isDefault') === 'true';

    // Validate planner data using Zod schema
    const validationResult = plannerSchema.safeParse({
      currentAge,
      retirementAge,
      startingBalance,
      monthlyContribution,
      annualReturn,
      inflation,
      drawdownRate,
      targetMonthlyToday,
      fundName,
      fundCode,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return {
        success: false,
        error: `Validation error: ${firstError.message}`,
      };
    }

    // Prepare plan data for database
    const planData: InsertRetirementPlan = {
      ...(planId && { id: planId }),
      userId,
      planName,
      description,
      currentAge,
      retirementAge,
      startingBalance: startingBalance.toString(),
      monthlyContribution: monthlyContribution.toString(),
      annualReturn: annualReturn.toString(),
      inflation: inflation.toString(),
      drawdownRate: drawdownRate.toString(),
      targetMonthlyToday: targetMonthlyToday ? targetMonthlyToday.toString() : null,
      fundName,
      fundCode,
      isDefault,
    };

    // Save to database
    const savedPlan = await dbSavePlan(planData);

    // Revalidate planner page to reflect changes
    revalidatePath('/planner');

    return {
      success: true,
      data: savedPlan,
    };
  } catch (error) {
    console.error('[savePlan] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save plan',
    };
  }
}

/**
 * Load all retirement plans for a user
 *
 * @param userId - User ID
 * @returns ActionResponse with array of plans
 */
export async function loadPlans(userId: string): Promise<ActionResponse> {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    const plans = await getUserPlans(userId);

    return {
      success: true,
      data: plans,
    };
  } catch (error) {
    console.error('[loadPlans] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load plans',
    };
  }
}

/**
 * Load a single plan by ID
 *
 * @param planId - Plan ID
 * @returns ActionResponse with plan data
 */
export async function loadPlan(planId: string): Promise<ActionResponse> {
  try {
    if (!planId) {
      return {
        success: false,
        error: 'Plan ID is required',
      };
    }

    const plan = await getPlanById(planId);

    if (!plan) {
      return {
        success: false,
        error: 'Plan not found',
      };
    }

    return {
      success: true,
      data: plan,
    };
  } catch (error) {
    console.error('[loadPlan] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load plan',
    };
  }
}

/**
 * Delete a retirement plan
 *
 * @param planId - Plan ID to delete
 * @returns ActionResponse
 */
export async function deletePlan(planId: string): Promise<ActionResponse> {
  try {
    if (!planId) {
      return {
        success: false,
        error: 'Plan ID is required',
      };
    }

    await dbDeletePlan(planId);

    // Revalidate planner page
    revalidatePath('/planner');

    return {
      success: true,
    };
  } catch (error) {
    console.error('[deletePlan] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete plan',
    };
  }
}

/**
 * Load default plan for a user
 *
 * @param userId - User ID
 * @returns ActionResponse with default plan or null
 */
export async function loadDefaultPlan(userId: string): Promise<ActionResponse> {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    const plan = await getDefaultPlan(userId);

    return {
      success: true,
      data: plan,
    };
  } catch (error) {
    console.error('[loadDefaultPlan] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load default plan',
    };
  }
}

/**
 * Helper function to convert database plan to form data
 *
 * Transforms database types (decimal strings) to numbers for form
 *
 * @param plan - Database plan record
 * @returns Form-compatible data
 */
export function planToFormData(plan: {
  currentAge: number;
  retirementAge: number;
  startingBalance: string;
  monthlyContribution: string;
  annualReturn: string;
  inflation: string;
  drawdownRate: string;
  targetMonthlyToday: string | null;
  fundName: string | null;
  fundCode: string | null;
}) {
  return {
    currentAge: plan.currentAge,
    retirementAge: plan.retirementAge,
    startingBalance: parseFloat(plan.startingBalance),
    monthlyContribution: parseFloat(plan.monthlyContribution),
    annualReturn: parseFloat(plan.annualReturn),
    inflation: parseFloat(plan.inflation),
    drawdownRate: parseFloat(plan.drawdownRate),
    targetMonthlyToday: plan.targetMonthlyToday
      ? parseFloat(plan.targetMonthlyToday)
      : undefined,
    fundName: plan.fundName || undefined,
    fundCode: plan.fundCode || undefined,
  };
}
