import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  date,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// 1. USERS TABLE
// ============================================================================
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }),
    authProvider: varchar('auth_provider', { length: 50 }),
    authProviderId: varchar('auth_provider_id', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    isActive: boolean('is_active').default(true).notNull(),
  },
  (table) => [
    index('idx_users_email').on(table.email),
    index('idx_users_auth_provider').on(table.authProvider, table.authProviderId),
  ]
);

// ============================================================================
// 2. RETIREMENT PLANS TABLE
// ============================================================================
export const retirementPlans = pgTable(
  'retirement_plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    planName: varchar('plan_name', { length: 255 }).notNull(),
    description: text('description'),

    // Input Parameters
    currentAge: integer('current_age').notNull(),
    retirementAge: integer('retirement_age').notNull(),
    startingBalance: decimal('starting_balance', { precision: 15, scale: 2 }).notNull(),
    monthlyContribution: decimal('monthly_contribution', { precision: 15, scale: 2 }).notNull(),
    annualReturn: decimal('annual_return', { precision: 5, scale: 2 }).notNull(),
    inflation: decimal('inflation', { precision: 5, scale: 2 }).notNull(),
    drawdownRate: decimal('drawdown_rate', { precision: 5, scale: 2 }).notNull(),
    targetMonthlyToday: decimal('target_monthly_today', { precision: 15, scale: 2 }),
    fundName: varchar('fund_name', { length: 255 }),
    fundCode: varchar('fund_code', { length: 50 }),

    // Metadata
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_retirement_plans_user_id').on(table.userId),
    index('idx_retirement_plans_created_at').on(table.createdAt),
    index('idx_retirement_plans_user_default').on(table.userId, table.isDefault),
  ]
);

// ============================================================================
// 3. SCENARIOS TABLE
// ============================================================================
export const scenarios = pgTable(
  'scenarios',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: uuid('plan_id')
      .notNull()
      .references(() => retirementPlans.id, { onDelete: 'cascade' }),
    scenarioName: varchar('scenario_name', { length: 255 }).notNull(),
    scenarioType: varchar('scenario_type', { length: 50 }),

    // Input Parameters
    currentAge: integer('current_age').notNull(),
    retirementAge: integer('retirement_age').notNull(),
    startingBalance: decimal('starting_balance', { precision: 15, scale: 2 }).notNull(),
    monthlyContribution: decimal('monthly_contribution', { precision: 15, scale: 2 }).notNull(),
    annualReturn: decimal('annual_return', { precision: 5, scale: 2 }).notNull(),
    inflation: decimal('inflation', { precision: 5, scale: 2 }).notNull(),
    drawdownRate: decimal('drawdown_rate', { precision: 5, scale: 2 }).notNull(),
    targetMonthlyToday: decimal('target_monthly_today', { precision: 15, scale: 2 }),
    fundName: varchar('fund_name', { length: 255 }),
    fundCode: varchar('fund_code', { length: 50 }),

    // Calculated Results (cached for comparison)
    projectedValueAtRetirement: decimal('projected_value_at_retirement', { precision: 15, scale: 2 }),
    totalContributed: decimal('total_contributed', { precision: 15, scale: 2 }),
    totalWithdrawn: decimal('total_withdrawn', { precision: 15, scale: 2 }),
    totalTaxPaid: decimal('total_tax_paid', { precision: 15, scale: 2 }),
    netAfterTaxIncome: decimal('net_after_tax_income', { precision: 15, scale: 2 }),
    fundDepletionAge: integer('fund_depletion_age'),
    wealthRetentionRatio: decimal('wealth_retention_ratio', { precision: 5, scale: 4 }),
    effectiveTaxRate: decimal('effective_tax_rate', { precision: 5, scale: 2 }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_scenarios_plan_id').on(table.planId),
    index('idx_scenarios_type').on(table.scenarioType),
  ]
);

// ============================================================================
// 4. PROJECTION HISTORY TABLE
// ============================================================================
export const projectionHistory = pgTable(
  'projection_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: uuid('plan_id')
      .notNull()
      .references(() => retirementPlans.id, { onDelete: 'cascade' }),
    scenarioId: uuid('scenario_id').references(() => scenarios.id, { onDelete: 'cascade' }),

    year: integer('year').notNull(),
    age: integer('age').notNull(),
    beginningBalance: decimal('beginning_balance', { precision: 15, scale: 2 }).notNull(),
    contributions: decimal('contributions', { precision: 15, scale: 2 }).notNull(),
    investmentReturn: decimal('investment_return', { precision: 15, scale: 2 }).notNull(),
    withdrawals: decimal('withdrawals', { precision: 15, scale: 2 }).notNull(),
    taxPaid: decimal('tax_paid', { precision: 15, scale: 2 }).notNull(),
    endingBalance: decimal('ending_balance', { precision: 15, scale: 2 }).notNull(),
    inflationAdjustedBalance: decimal('inflation_adjusted_balance', { precision: 15, scale: 2 }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_projection_plan_id').on(table.planId),
    index('idx_projection_scenario_id').on(table.scenarioId),
    index('idx_projection_year').on(table.year),
    unique('unique_plan_year').on(table.planId, table.scenarioId, table.year),
  ]
);

// ============================================================================
// 5. DISCOVERY FUNDS CACHE TABLE
// ============================================================================
export const discoveryFundsCache = pgTable(
  'discovery_funds_cache',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fundName: varchar('fund_name', { length: 255 }).notNull(),
    fundCode: varchar('fund_code', { length: 50 }).unique().notNull(),
    fundType: varchar('fund_type', { length: 50 }),

    cagr1y: decimal('cagr_1y', { precision: 5, scale: 2 }),
    cagr3y: decimal('cagr_3y', { precision: 5, scale: 2 }),
    cagr5y: decimal('cagr_5y', { precision: 5, scale: 2 }),
    cagr10y: decimal('cagr_10y', { precision: 5, scale: 2 }),
    volatility: decimal('volatility', { precision: 5, scale: 2 }),
    sharpeRatio: decimal('sharpe_ratio', { precision: 5, scale: 3 }),

    inceptionDate: date('inception_date'),
    scrapedAt: timestamp('scraped_at', { withTimezone: true }).defaultNow().notNull(),
    lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_discovery_funds_code').on(table.fundCode),
    index('idx_discovery_funds_type').on(table.fundType),
    index('idx_discovery_funds_updated').on(table.lastUpdated),
  ]
);

// ============================================================================
// 6. SARS TAX TABLES CACHE TABLE
// ============================================================================
export const sarsTaxTablesCache = pgTable(
  'sars_tax_tables_cache',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    taxYear: varchar('tax_year', { length: 10 }).unique().notNull(),

    incomeTaxBrackets: jsonb('income_tax_brackets').notNull(),

    primaryRebate: decimal('primary_rebate', { precision: 10, scale: 2 }).notNull(),
    secondaryRebate: decimal('secondary_rebate', { precision: 10, scale: 2 }).notNull(),
    tertiaryRebate: decimal('tertiary_rebate', { precision: 10, scale: 2 }).notNull(),

    raLumpSumBrackets: jsonb('ra_lump_sum_brackets').notNull(),

    cgtInclusionRate: decimal('cgt_inclusion_rate', { precision: 5, scale: 4 }).notNull(),
    cgtAnnualExclusion: decimal('cgt_annual_exclusion', { precision: 10, scale: 2 }).notNull(),

    dividendWhtRate: decimal('dividend_wht_rate', { precision: 5, scale: 4 }).notNull(),

    interestExemptUnder65: decimal('interest_exempt_under65', { precision: 10, scale: 2 }).notNull(),
    interestExemptOver65: decimal('interest_exempt_over65', { precision: 10, scale: 2 }).notNull(),

    scrapedAt: timestamp('scraped_at', { withTimezone: true }).defaultNow().notNull(),
    lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow().notNull(),
    source: varchar('source', { length: 50 }),
  },
  (table) => [index('idx_sars_tax_year').on(table.taxYear)]
);

// ============================================================================
// 7. CPI DATA CACHE TABLE
// ============================================================================
export const cpiDataCache = pgTable(
  'cpi_data_cache',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    year: integer('year').notNull(),
    month: integer('month').notNull(),
    cpiValue: decimal('cpi_value', { precision: 6, scale: 2 }).notNull(),
    annualRate: decimal('annual_rate', { precision: 5, scale: 2 }).notNull(),
    monthlyRate: decimal('monthly_rate', { precision: 5, scale: 2 }),
    category: varchar('category', { length: 100 }).default('All items').notNull(),

    scrapedAt: timestamp('scraped_at', { withTimezone: true }).defaultNow().notNull(),
    lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow().notNull(),
    source: varchar('source', { length: 50 }),
  },
  (table) => [
    index('idx_cpi_year_month').on(table.year, table.month),
    index('idx_cpi_updated').on(table.lastUpdated),
    unique('unique_year_month').on(table.year, table.month, table.category),
  ]
);

// ============================================================================
// 8. AI ADVISOR CONVERSATION SESSIONS TABLE
// ============================================================================
export const aiAdvisorSessions = pgTable(
  'ai_advisor_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Session metadata
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
    lastActivity: timestamp('last_activity', { withTimezone: true }).defaultNow().notNull(),
    currentPhase: varchar('current_phase', { length: 50 }).notNull().default('personal_profile'),
    isActive: boolean('is_active').default(true).notNull(),

    // User profile data (JSONB for flexibility)
    userProfile: jsonb('user_profile').notNull().default('{}'),

    // Advisor state
    totalQuestionsAsked: integer('total_questions_asked').default(0).notNull(),
    questionsAnswered: integer('questions_answered').default(0).notNull(),
    phasesCompleted: jsonb('phases_completed').default('[]'),
    confidenceScore: integer('confidence_score').default(0).notNull(),
    needsClarification: jsonb('needs_clarification').default('[]'),
    readyForProjection: boolean('ready_for_projection').default(false).notNull(),

    // Metadata
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_ai_sessions_user_id').on(table.userId),
    index('idx_ai_sessions_active').on(table.userId, table.isActive),
    index('idx_ai_sessions_last_activity').on(table.lastActivity),
  ]
);

// ============================================================================
// 9. AI ADVISOR MESSAGES TABLE
// ============================================================================
export const aiAdvisorMessages = pgTable(
  'ai_advisor_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => aiAdvisorSessions.id, { onDelete: 'cascade' }),

    // Message content
    role: varchar('role', { length: 20 }).notNull(), // 'user' | 'assistant' | 'system'
    content: text('content').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),

    // Discovery phase at time of message
    phase: varchar('phase', { length: 50 }),

    // Data extracted from this message
    extractedData: jsonb('extracted_data'),

    // Function calls made
    functionCalls: jsonb('function_calls'),

    // Metadata
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_ai_messages_session_id').on(table.sessionId),
    index('idx_ai_messages_timestamp').on(table.sessionId, table.timestamp),
    index('idx_ai_messages_role').on(table.role),
  ]
);

// ============================================================================
// 10. AI ADVISOR RECOMMENDATIONS TABLE
// ============================================================================
export const aiAdvisorRecommendations = pgTable(
  'ai_advisor_recommendations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => aiAdvisorSessions.id, { onDelete: 'cascade' }),

    // Recommendation details
    category: varchar('category', { length: 50 }).notNull(),
    priority: varchar('priority', { length: 20 }).notNull(), // 'critical' | 'high' | 'medium' | 'low'
    title: varchar('title', { length: 255 }).notNull(),
    summary: text('summary').notNull(),
    detailedExplanation: text('detailed_explanation').notNull(),
    actionSteps: jsonb('action_steps').notNull(), // Array of strings
    estimatedImpact: jsonb('estimated_impact'), // Object with impact metrics
    regulatoryReference: varchar('regulatory_reference', { length: 255 }),

    // Override tracking
    overridden: boolean('overridden').default(false).notNull(),
    overrideReason: text('override_reason'),
    overrideBy: varchar('override_by', { length: 255 }), // Financial advisor name/ID
    overrideAt: timestamp('override_at', { withTimezone: true }),

    // Metadata
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_ai_recommendations_session_id').on(table.sessionId),
    index('idx_ai_recommendations_priority').on(table.priority),
    index('idx_ai_recommendations_category').on(table.category),
    index('idx_ai_recommendations_overridden').on(table.overridden),
  ]
);

// ============================================================================
// 11. AI ADVISOR PLAN OVERRIDES TABLE
// ============================================================================
export const aiAdvisorPlanOverrides = pgTable(
  'ai_advisor_plan_overrides',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => aiAdvisorSessions.id, { onDelete: 'cascade' }),

    // Override details
    overriddenBy: varchar('overridden_by', { length: 255 }).notNull(), // Financial advisor name/ID
    field: varchar('field', { length: 100 }).notNull(), // UserProfile field name
    aiRecommendedValue: jsonb('ai_recommended_value').notNull(),
    advisorOverrideValue: jsonb('advisor_override_value').notNull(),
    reason: text('reason').notNull(),

    // Client approval
    clientApproved: boolean('client_approved').default(false).notNull(),
    clientApprovedAt: timestamp('client_approved_at', { withTimezone: true }),

    // Metadata
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_ai_overrides_session_id').on(table.sessionId),
    index('idx_ai_overrides_field').on(table.field),
    index('idx_ai_overrides_approved').on(table.clientApproved),
  ]
);

// ============================================================================
// RELATIONS (for Drizzle Relational Queries)
// ============================================================================
export const usersRelations = relations(users, ({ many }) => ({
  retirementPlans: many(retirementPlans),
  aiAdvisorSessions: many(aiAdvisorSessions),
}));

export const retirementPlansRelations = relations(retirementPlans, ({ one, many }) => ({
  user: one(users, {
    fields: [retirementPlans.userId],
    references: [users.id],
  }),
  scenarios: many(scenarios),
  projectionHistory: many(projectionHistory),
}));

export const scenariosRelations = relations(scenarios, ({ one, many }) => ({
  plan: one(retirementPlans, {
    fields: [scenarios.planId],
    references: [retirementPlans.id],
  }),
  projectionHistory: many(projectionHistory),
}));

export const projectionHistoryRelations = relations(projectionHistory, ({ one }) => ({
  plan: one(retirementPlans, {
    fields: [projectionHistory.planId],
    references: [retirementPlans.id],
  }),
  scenario: one(scenarios, {
    fields: [projectionHistory.scenarioId],
    references: [scenarios.id],
  }),
}));

export const aiAdvisorSessionsRelations = relations(aiAdvisorSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [aiAdvisorSessions.userId],
    references: [users.id],
  }),
  messages: many(aiAdvisorMessages),
  recommendations: many(aiAdvisorRecommendations),
  planOverrides: many(aiAdvisorPlanOverrides),
}));

export const aiAdvisorMessagesRelations = relations(aiAdvisorMessages, ({ one }) => ({
  session: one(aiAdvisorSessions, {
    fields: [aiAdvisorMessages.sessionId],
    references: [aiAdvisorSessions.id],
  }),
}));

export const aiAdvisorRecommendationsRelations = relations(aiAdvisorRecommendations, ({ one }) => ({
  session: one(aiAdvisorSessions, {
    fields: [aiAdvisorRecommendations.sessionId],
    references: [aiAdvisorSessions.id],
  }),
}));

export const aiAdvisorPlanOverridesRelations = relations(aiAdvisorPlanOverrides, ({ one }) => ({
  session: one(aiAdvisorSessions, {
    fields: [aiAdvisorPlanOverrides.sessionId],
    references: [aiAdvisorSessions.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS (for TypeScript type inference)
// ============================================================================
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type RetirementPlan = typeof retirementPlans.$inferSelect;
export type InsertRetirementPlan = typeof retirementPlans.$inferInsert;

export type Scenario = typeof scenarios.$inferSelect;
export type InsertScenario = typeof scenarios.$inferInsert;

export type ProjectionHistory = typeof projectionHistory.$inferSelect;
export type InsertProjectionHistory = typeof projectionHistory.$inferInsert;

export type DiscoveryFundCache = typeof discoveryFundsCache.$inferSelect;
export type InsertDiscoveryFundCache = typeof discoveryFundsCache.$inferInsert;

export type SarsTaxTableCache = typeof sarsTaxTablesCache.$inferSelect;
export type InsertSarsTaxTableCache = typeof sarsTaxTablesCache.$inferInsert;

export type CpiDataCache = typeof cpiDataCache.$inferSelect;
export type InsertCpiDataCache = typeof cpiDataCache.$inferInsert;

export type AIAdvisorSession = typeof aiAdvisorSessions.$inferSelect;
export type InsertAIAdvisorSession = typeof aiAdvisorSessions.$inferInsert;

export type AIAdvisorMessage = typeof aiAdvisorMessages.$inferSelect;
export type InsertAIAdvisorMessage = typeof aiAdvisorMessages.$inferInsert;

export type AIAdvisorRecommendation = typeof aiAdvisorRecommendations.$inferSelect;
export type InsertAIAdvisorRecommendation = typeof aiAdvisorRecommendations.$inferInsert;

export type AIAdvisorPlanOverride = typeof aiAdvisorPlanOverrides.$inferSelect;
export type InsertAIAdvisorPlanOverride = typeof aiAdvisorPlanOverrides.$inferInsert;
