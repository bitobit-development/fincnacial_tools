/**
 * Zod Validation Schemas for AI Financial Advisor
 *
 * Runtime validation for all user inputs, API responses, and data structures.
 * Ensures type safety and data integrity throughout the advisor system.
 */

import { z } from 'zod';

// ============================================================================
// Discovery Phase Schema
// ============================================================================

export const DiscoveryPhaseSchema = z.enum([
  'personal_profile',
  'income_analysis',
  'expenses_lifestyle',
  'existing_savings',
  'investment_philosophy',
  'tax_optimization',
  'retirement_income_strategy',
  'risk_management',
  'estate_planning',
  'special_circumstances',
  'completed',
]);

// ============================================================================
// User Profile Schema
// ============================================================================

export const UserProfileSchema = z.object({
  // Phase 1: Personal Profile
  name: z.string().min(2).max(100).optional(),
  current_age: z.number().int().min(18).max(100).optional(),
  retirement_age: z.number().int().min(45).max(100).optional(),
  marital_status: z.enum(['single', 'married', 'partnered', 'divorced', 'widowed']).optional(),
  dependents: z.number().int().min(0).max(20).optional(),
  dependent_ages: z.array(z.number().int().min(0).max(50)).optional(),
  life_expectancy: z.number().int().min(60).max(120).default(90),
  health_status: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  province: z.enum(['GP', 'WC', 'KZN', 'EC', 'FS', 'MP', 'LP', 'NW', 'NC']).optional(),

  // Phase 2: Income Analysis
  gross_annual_income: z.number().min(0).max(100_000_000).optional(),
  net_monthly_income: z.number().min(0).max(10_000_000).optional(),
  employer_pension_contribution: z.number().min(0).max(100).optional(),
  employer_contribution_rand: z.number().min(0).max(1_000_000).optional(),
  bonuses_commissions_annual: z.number().min(0).max(50_000_000).optional(),
  other_income_sources: z.array(z.string()).optional(),
  other_income_annual: z.number().min(0).max(50_000_000).optional(),

  // Phase 3: Expenses & Lifestyle
  monthly_expenses: z.number().min(0).max(10_000_000).optional(),
  monthly_debt_payments: z.number().min(0).max(5_000_000).optional(),
  debt_types: z.array(z.string()).optional(),
  total_outstanding_debt: z.number().min(0).max(100_000_000).optional(),
  desired_retirement_income_monthly: z.number().min(0).max(10_000_000).optional(),
  desired_retirement_lifestyle: z.enum(['basic', 'comfortable', 'luxurious']).optional(),
  major_expenses_before_retirement: z
    .array(
      z.object({
        description: z.string(),
        amount: z.number().min(0),
        year: z.number().int().min(2025).max(2100),
      })
    )
    .optional(),
  retirement_location: z.enum(['same_city', 'smaller_city', 'coast', 'rural', 'abroad']).optional(),

  // Phase 4: Existing Savings
  current_ra_balance: z.number().min(0).max(100_000_000).optional(),
  current_pension_balance: z.number().min(0).max(100_000_000).optional(),
  current_tfsa_balance: z.number().min(0).max(1_000_000).optional(),
  current_unit_trusts_balance: z.number().min(0).max(100_000_000).optional(),
  current_offshore_investments: z.number().min(0).max(100_000_000).optional(),
  current_cash_savings: z.number().min(0).max(50_000_000).optional(),
  current_property_equity: z.number().min(0).max(100_000_000).optional(),
  monthly_ra_contribution: z.number().min(0).max(500_000).optional(),
  monthly_tfsa_contribution: z.number().min(0).max(50_000).optional(),
  monthly_unit_trust_contribution: z.number().min(0).max(500_000).optional(),

  // Phase 5: Investment Philosophy
  risk_tolerance: z.enum(['conservative', 'moderate', 'balanced', 'aggressive', 'very_aggressive']).optional(),
  investment_strategy_preference: z.enum(['passive_index', 'active_managed', 'hybrid', 'unsure']).optional(),
  esg_preference: z.boolean().optional(),
  offshore_exposure_preference: z.number().min(0).max(40).optional(),
  current_portfolio_fees: z.number().min(0).max(5).optional(),

  // Phase 6: Tax Optimization
  current_ra_contributions_annual: z.number().min(0).max(500_000).optional(),
  using_full_ra_deduction: z.boolean().optional(),
  current_tfsa_contributions_annual: z.number().min(0).max(50_000).optional(),
  income_splitting_opportunities: z.boolean().optional(),
  tax_free_lump_sum_used: z.number().min(0).max(500_000).optional(),

  // Phase 7: Retirement Income Strategy
  preferred_retirement_product: z.enum(['living_annuity', 'life_annuity', 'combination', 'unsure']).optional(),
  desired_drawdown_rate: z.number().min(2.5).max(17.5).optional(),
  inheritance_priority: z.enum(['high', 'medium', 'low']).optional(),

  // Phase 8: Risk Management
  life_cover_amount: z.number().min(0).max(100_000_000).optional(),
  disability_cover: z.boolean().optional(),
  critical_illness_cover: z.boolean().optional(),
  funeral_cover: z.boolean().optional(),
  beneficiaries_updated: z.boolean().optional(),
  dread_disease_cover: z.boolean().optional(),

  // Phase 9: Estate Planning
  has_valid_will: z.boolean().optional(),
  estate_plan_updated: z.boolean().optional(),
  estate_liquidity_covered: z.boolean().optional(),

  // Phase 10: Special Circumstances
  emigration_plans: z.boolean().optional(),
  emigration_country: z.string().optional(),
  own_business: z.boolean().optional(),
  business_succession_plan: z.boolean().optional(),
  expected_inheritance: z.number().min(0).max(500_000_000).optional(),
  expected_inheritance_year: z.number().int().min(2025).max(2100).optional(),

  // Metadata
  profile_completeness: z.number().min(0).max(100).default(0),
  last_updated: z.date().optional(),
  current_discovery_phase: DiscoveryPhaseSchema.optional(),
});

// ============================================================================
// Conversation Schemas
// ============================================================================

export const FunctionCallSchema = z.object({
  name: z.string(),
  arguments: z.record(z.any()),
  result: z.any().optional(),
  timestamp: z.date(),
});

export const ConversationMessageSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(50000),
  timestamp: z.date(),
  phase: DiscoveryPhaseSchema.optional(),
  extracted_data: UserProfileSchema.partial().optional(),
  function_calls: z.array(FunctionCallSchema).optional(),
});

export const AdvisorStateSchema = z.object({
  total_questions_asked: z.number().int().min(0).max(100),
  questions_answered: z.number().int().min(0).max(100),
  current_phase: DiscoveryPhaseSchema,
  phases_completed: z.array(DiscoveryPhaseSchema),
  confidence_score: z.number().min(0).max(100),
  needs_clarification: z.array(z.string()),
  ready_for_projection: z.boolean(),
});

export const PlanOverrideSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.date(),
  overridden_by: z.string(),
  field: z.string(),
  ai_recommended_value: z.any(),
  advisor_override_value: z.any(),
  reason: z.string().min(10).max(1000),
  client_approved: z.boolean(),
  client_approved_at: z.date().optional(),
});

export const ConversationSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  started_at: z.date(),
  last_activity: z.date(),
  current_phase: DiscoveryPhaseSchema,
  messages: z.array(ConversationMessageSchema),
  user_profile: UserProfileSchema,
  advisor_state: AdvisorStateSchema,
  plan_overrides: z.array(PlanOverrideSchema),
});

// ============================================================================
// Recommendation Schemas
// ============================================================================

export const AdvisorRecommendationSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.date(),
  category: z.enum([
    'contribution_increase',
    'tax_optimization',
    'investment_strategy',
    'drawdown_strategy',
    'risk_management',
    'estate_planning',
    'debt_management',
    'retirement_timing',
  ]),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  title: z.string().min(5).max(200),
  summary: z.string().min(10).max(500),
  detailed_explanation: z.string().min(50).max(5000),
  action_steps: z.array(z.string().min(10).max(500)),
  estimated_impact: z.object({
    additional_retirement_income_monthly: z.number().optional(),
    tax_savings_annual: z.number().optional(),
    additional_wealth_at_retirement: z.number().optional(),
    risk_reduction: z.string().optional(),
  }),
  regulatory_reference: z.string().optional(),
  overridden: z.boolean().default(false),
  override_reason: z.string().optional(),
  override_by: z.string().optional(),
  override_at: z.date().optional(),
});

// ============================================================================
// Projection Schemas
// ============================================================================

export const MonthlyProjectionSchema = z.object({
  year: z.number().int().min(2025).max(2100),
  month: z.number().int().min(1).max(12),
  age: z.number().int().min(18).max(120),

  // Income
  gross_income: z.number().min(0),
  net_income_after_tax: z.number().min(0),
  pension_income: z.number().min(0).optional(),
  other_income: z.number().min(0).optional(),

  // Contributions
  ra_contribution: z.number().min(0),
  tfsa_contribution: z.number().min(0),
  unit_trust_contribution: z.number().min(0),
  employer_contribution: z.number().min(0),

  // Tax Breakdown
  income_tax: z.number().min(0),
  capital_gains_tax: z.number().min(0),
  dividend_tax: z.number().min(0),
  interest_tax: z.number().min(0),
  total_tax: z.number().min(0),
  effective_tax_rate: z.number().min(0).max(100),

  // Investment Growth
  investment_return: z.number(),
  inflation_adjusted_return: z.number(),

  // Balances
  ra_balance: z.number().min(0),
  pension_balance: z.number().min(0),
  tfsa_balance: z.number().min(0),
  unit_trust_balance: z.number().min(0),
  total_balance: z.number().min(0),
  inflation_adjusted_balance: z.number().min(0),

  // Retirement Phase
  drawdown_amount: z.number().min(0).optional(),
  drawdown_rate: z.number().min(0).max(100).optional(),
  years_remaining: z.number().min(0).optional(),
  runway_years: z.number().min(0).optional(),
});

export const AnnualSummarySchema = z.object({
  year: z.number().int().min(2025).max(2100),
  age: z.number().int().min(18).max(120),

  // Contributions
  total_contributed: z.number().min(0),
  employer_contributed: z.number().min(0),

  // Tax
  total_tax_paid: z.number().min(0),
  tax_saved_via_ra: z.number().min(0),
  effective_tax_rate: z.number().min(0).max(100),

  // Growth
  investment_return: z.number(),
  inflation_rate: z.number().min(0).max(50),
  real_return: z.number(),

  // Balances
  ending_balance: z.number().min(0),
  inflation_adjusted_balance: z.number().min(0),

  // Retirement metrics
  monthly_income: z.number().min(0).optional(),
  replacement_ratio: z.number().min(0).max(200).optional(),
  drawdown_rate: z.number().min(0).max(100).optional(),
  years_remaining: z.number().min(0).optional(),
});

// ============================================================================
// GPT-5 Function Calling Schemas
// ============================================================================

export const CalculateRetirementProjectionParamsSchema = z.object({
  user_profile: UserProfileSchema,
  include_monthly_breakdown: z.boolean().default(false),
});

export const OptimizeTaxParamsSchema = z.object({
  gross_income: z.number().min(0),
  current_ra_contribution: z.number().min(0),
  age: z.number().int().min(18).max(100),
  marital_status: z.string(),
  other_deductions: z.number().min(0).default(0),
});

export const OptimizeTaxResultSchema = z.object({
  current_tax: z.number().min(0),
  optimized_tax: z.number().min(0),
  tax_savings: z.number().min(0),
  recommended_ra_contribution: z.number().min(0),
  reasoning: z.string().min(20).max(2000),
  regulatory_limits: z.object({
    max_ra_contribution: z.number().min(0),
    limit_type: z.enum(['R350000_cap', '27.5%_income_cap']),
  }),
});

export const CalculateDrawdownStrategyParamsSchema = z.object({
  retirement_balance: z.number().min(0),
  desired_monthly_income: z.number().min(0),
  years_to_plan: z.number().int().min(1).max(60),
  inflation_rate: z.number().min(0).max(50),
  expected_return: z.number().min(-20).max(50),
});

export const CalculateDrawdownStrategyResultSchema = z.object({
  recommended_initial_drawdown_rate: z.number().min(2.5).max(17.5),
  sustainable: z.boolean(),
  years_money_lasts: z.number().min(0),
  end_balance: z.number().min(0),
  inflation_adjusted_income_at_90: z.number().min(0),
  warnings: z.array(z.string()),
  alternative_strategies: z
    .array(
      z.object({
        drawdown_rate: z.number().min(2.5).max(17.5),
        years_lasts: z.number().min(0),
        description: z.string(),
      })
    )
    .optional(),
});

export const GenerateRecommendationsParamsSchema = z.object({
  user_profile: UserProfileSchema,
  current_projection: z.array(AnnualSummarySchema),
});

export const GenerateRecommendationsResultSchema = z.object({
  recommendations: z.array(AdvisorRecommendationSchema),
  overall_health_score: z.number().min(0).max(100),
  critical_gaps: z.array(z.string()),
  strengths: z.array(z.string()),
});

// ============================================================================
// API Response Schemas
// ============================================================================

export const ChatCompletionResponseSchema = z.object({
  message: ConversationMessageSchema,
  updated_profile: UserProfileSchema.partial(),
  next_question: z.string().optional(),
  phase_completed: z.boolean().default(false),
  new_phase: DiscoveryPhaseSchema.optional(),
  recommendations: z.array(AdvisorRecommendationSchema).optional(),
  requires_human_advisor: z.boolean().default(false),
});

export const ProjectionResponseSchema = z.object({
  monthly_projections: z.array(MonthlyProjectionSchema),
  annual_summaries: z.array(AnnualSummarySchema),
  recommendations: z.array(AdvisorRecommendationSchema),
  key_metrics: z.object({
    total_contributions: z.number().min(0),
    total_tax_paid: z.number().min(0),
    total_tax_saved: z.number().min(0),
    ending_balance: z.number().min(0),
    inflation_adjusted_balance: z.number().min(0),
    replacement_ratio: z.number().min(0).max(200),
    wealth_retention_ratio: z.number().min(0).max(100),
    years_money_lasts: z.number().min(0),
  }),
  warnings: z.array(z.string()),
  confidence_score: z.number().min(0).max(100),
});

export const AdvisorErrorSchema = z.object({
  code: z.enum(['INSUFFICIENT_DATA', 'API_ERROR', 'VALIDATION_ERROR', 'RATE_LIMIT', 'UNKNOWN']),
  message: z.string().min(1).max(1000),
  missing_fields: z.array(z.string()).optional(),
  retry_after: z.number().int().min(0).optional(),
});

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type ConversationMessage = z.infer<typeof ConversationMessageSchema>;
export type ConversationSession = z.infer<typeof ConversationSessionSchema>;
export type AdvisorRecommendation = z.infer<typeof AdvisorRecommendationSchema>;
export type MonthlyProjection = z.infer<typeof MonthlyProjectionSchema>;
export type AnnualSummary = z.infer<typeof AnnualSummarySchema>;
export type ChatCompletionResponse = z.infer<typeof ChatCompletionResponseSchema>;
export type ProjectionResponse = z.infer<typeof ProjectionResponseSchema>;
export type AdvisorError = z.infer<typeof AdvisorErrorSchema>;
