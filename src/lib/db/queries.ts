import { eq, desc, and, sql, gte } from 'drizzle-orm';
import { db } from './connection';
import {
  users,
  retirementPlans,
  scenarios,
  projectionHistory,
  discoveryFundsCache,
  sarsTaxTablesCache,
  cpiDataCache,
  type InsertRetirementPlan,
  type InsertScenario,
  type InsertProjectionHistory,
  type InsertDiscoveryFundCache,
  type InsertSarsTaxTableCache,
  type InsertCpiDataCache,
} from './schema';

// ============================================================================
// USER QUERIES
// ============================================================================

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

/**
 * Create a new user
 */
export async function createUser(data: {
  email: string;
  name?: string;
  authProvider?: string;
  authProviderId?: string;
}) {
  const result = await db.insert(users).values(data).returning();
  return result[0];
}

// ============================================================================
// RETIREMENT PLAN QUERIES
// ============================================================================

/**
 * Get all retirement plans for a user
 */
export async function getUserPlans(userId: string) {
  return db
    .select()
    .from(retirementPlans)
    .where(eq(retirementPlans.userId, userId))
    .orderBy(desc(retirementPlans.createdAt));
}

/**
 * Get a single plan by ID
 */
export async function getPlanById(planId: string) {
  const result = await db.select().from(retirementPlans).where(eq(retirementPlans.id, planId)).limit(1);
  return result[0] || null;
}

/**
 * Get plan with scenarios
 */
export async function getPlanWithScenarios(planId: string) {
  const plan = await db.query.retirementPlans.findFirst({
    where: eq(retirementPlans.id, planId),
    with: {
      scenarios: true,
    },
  });
  return plan || null;
}

/**
 * Save a retirement plan (insert or update)
 */
export async function savePlan(planData: InsertRetirementPlan) {
  if ('id' in planData && planData.id) {
    // Update existing plan
    const result = await db
      .update(retirementPlans)
      .set({ ...planData, updatedAt: new Date() })
      .where(eq(retirementPlans.id, planData.id as string))
      .returning();
    return result[0];
  } else {
    // Insert new plan
    const result = await db.insert(retirementPlans).values(planData).returning();
    return result[0];
  }
}

/**
 * Delete a retirement plan
 */
export async function deletePlan(planId: string) {
  await db.delete(retirementPlans).where(eq(retirementPlans.id, planId));
}

/**
 * Get default plan for user
 */
export async function getDefaultPlan(userId: string) {
  const result = await db
    .select()
    .from(retirementPlans)
    .where(and(eq(retirementPlans.userId, userId), eq(retirementPlans.isDefault, true)))
    .limit(1);
  return result[0] || null;
}

// ============================================================================
// SCENARIO QUERIES
// ============================================================================

/**
 * Get all scenarios for a plan
 */
export async function getScenarios(planId: string) {
  return db
    .select()
    .from(scenarios)
    .where(eq(scenarios.planId, planId))
    .orderBy(desc(scenarios.createdAt));
}

/**
 * Save a scenario (insert or update)
 */
export async function saveScenario(scenarioData: InsertScenario) {
  if ('id' in scenarioData && scenarioData.id) {
    // Update existing scenario
    const result = await db
      .update(scenarios)
      .set({ ...scenarioData, updatedAt: new Date() })
      .where(eq(scenarios.id, scenarioData.id as string))
      .returning();
    return result[0];
  } else {
    // Insert new scenario
    const result = await db.insert(scenarios).values(scenarioData).returning();
    return result[0];
  }
}

/**
 * Delete a scenario
 */
export async function deleteScenario(scenarioId: string) {
  await db.delete(scenarios).where(eq(scenarios.id, scenarioId));
}

// ============================================================================
// PROJECTION HISTORY QUERIES
// ============================================================================

/**
 * Get projection history for a plan
 */
export async function getProjectionHistory(planId: string, scenarioId?: string) {
  const conditions = scenarioId
    ? and(eq(projectionHistory.planId, planId), eq(projectionHistory.scenarioId, scenarioId))
    : eq(projectionHistory.planId, planId);

  return db.select().from(projectionHistory).where(conditions).orderBy(projectionHistory.year);
}

/**
 * Save projection history (batch insert)
 */
export async function saveProjectionHistory(projections: InsertProjectionHistory[]) {
  if (projections.length === 0) return [];
  return db.insert(projectionHistory).values(projections).returning();
}

/**
 * Delete projection history for a plan
 */
export async function deleteProjectionHistory(planId: string, scenarioId?: string) {
  const conditions = scenarioId
    ? and(eq(projectionHistory.planId, planId), eq(projectionHistory.scenarioId, scenarioId))
    : eq(projectionHistory.planId, planId);

  await db.delete(projectionHistory).where(conditions);
}

/**
 * Clean up old projection history (older than 90 days)
 */
export async function cleanupOldProjections() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const result = await db
    .delete(projectionHistory)
    .where(sql`${projectionHistory.createdAt} < ${ninetyDaysAgo}`)
    .returning();

  return result.length;
}

// ============================================================================
// DISCOVERY FUNDS CACHE QUERIES
// ============================================================================

/**
 * Get cached Discovery funds with TTL check (24 hours)
 */
export async function getCachedDiscoveryFunds(fundType?: string) {
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  const conditions = fundType
    ? and(
        eq(discoveryFundsCache.fundType, fundType),
        gte(discoveryFundsCache.lastUpdated, twentyFourHoursAgo)
      )
    : gte(discoveryFundsCache.lastUpdated, twentyFourHoursAgo);

  return db
    .select()
    .from(discoveryFundsCache)
    .where(conditions)
    .orderBy(desc(discoveryFundsCache.cagr5y));
}

/**
 * Get fund by code
 */
export async function getFundByCode(fundCode: string) {
  const result = await db
    .select()
    .from(discoveryFundsCache)
    .where(eq(discoveryFundsCache.fundCode, fundCode))
    .limit(1);
  return result[0] || null;
}

/**
 * Cache Discovery fund data (upsert)
 */
export async function cacheDiscoveryFund(fundData: InsertDiscoveryFundCache) {
  const existing = await getFundByCode(fundData.fundCode);

  if (existing) {
    // Update existing
    const result = await db
      .update(discoveryFundsCache)
      .set({ ...fundData, lastUpdated: new Date() })
      .where(eq(discoveryFundsCache.fundCode, fundData.fundCode))
      .returning();
    return result[0];
  } else {
    // Insert new
    const result = await db.insert(discoveryFundsCache).values(fundData).returning();
    return result[0];
  }
}

/**
 * Clean up stale Discovery fund data (older than 30 days)
 */
export async function cleanupStaleDiscoveryFunds() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await db
    .delete(discoveryFundsCache)
    .where(sql`${discoveryFundsCache.lastUpdated} < ${thirtyDaysAgo}`)
    .returning();

  return result.length;
}

// ============================================================================
// SARS TAX TABLES CACHE QUERIES
// ============================================================================

/**
 * Get cached SARS tax tables for a specific year
 */
export async function getCachedSARSTaxTables(taxYear: string) {
  const result = await db
    .select()
    .from(sarsTaxTablesCache)
    .where(eq(sarsTaxTablesCache.taxYear, taxYear))
    .limit(1);
  return result[0] || null;
}

/**
 * Cache SARS tax table data (upsert)
 */
export async function cacheSARSTaxTable(taxData: InsertSarsTaxTableCache) {
  const existing = await getCachedSARSTaxTables(taxData.taxYear);

  if (existing) {
    // Update existing
    const result = await db
      .update(sarsTaxTablesCache)
      .set({ ...taxData, lastUpdated: new Date() })
      .where(eq(sarsTaxTablesCache.taxYear, taxData.taxYear))
      .returning();
    return result[0];
  } else {
    // Insert new
    const result = await db.insert(sarsTaxTablesCache).values(taxData).returning();
    return result[0];
  }
}

/**
 * Clean up old tax tables (keep last 5 years)
 */
export async function cleanupOldTaxTables() {
  const currentYear = new Date().getFullYear();
  const fiveYearsAgo = `${currentYear - 5}/${String(currentYear - 4).slice(-2)}`;

  const result = await db
    .delete(sarsTaxTablesCache)
    .where(sql`${sarsTaxTablesCache.taxYear} < ${fiveYearsAgo}`)
    .returning();

  return result.length;
}

// ============================================================================
// CPI DATA CACHE QUERIES
// ============================================================================

/**
 * Get cached CPI data (last N months)
 */
export async function getCachedCPI(months: number = 12) {
  return db
    .select()
    .from(cpiDataCache)
    .where(eq(cpiDataCache.category, 'All items'))
    .orderBy(desc(cpiDataCache.year), desc(cpiDataCache.month))
    .limit(months);
}

/**
 * Get CPI for specific year and month
 */
export async function getCPIForMonth(year: number, month: number) {
  const result = await db
    .select()
    .from(cpiDataCache)
    .where(
      and(
        eq(cpiDataCache.year, year),
        eq(cpiDataCache.month, month),
        eq(cpiDataCache.category, 'All items')
      )
    )
    .limit(1);
  return result[0] || null;
}

/**
 * Cache CPI data (upsert)
 */
export async function cacheCPI(cpiData: InsertCpiDataCache) {
  const existing = await getCPIForMonth(cpiData.year, cpiData.month);

  if (existing) {
    // Update existing
    const result = await db
      .update(cpiDataCache)
      .set({ ...cpiData, lastUpdated: new Date() })
      .where(
        and(
          eq(cpiDataCache.year, cpiData.year),
          eq(cpiDataCache.month, cpiData.month),
          eq(cpiDataCache.category, cpiData.category || 'All items')
        )
      )
      .returning();
    return result[0];
  } else {
    // Insert new
    const result = await db.insert(cpiDataCache).values(cpiData).returning();
    return result[0];
  }
}

/**
 * Calculate rolling average inflation (last 12 months)
 */
export async function getAverageInflation(months: number = 12) {
  const recentCPI = await getCachedCPI(months);

  if (recentCPI.length === 0) return null;

  const sum = recentCPI.reduce((acc, entry) => {
    return acc + parseFloat(entry.annualRate || '0');
  }, 0);

  return sum / recentCPI.length;
}

/**
 * Clean up old CPI data (keep last 10 years)
 */
export async function cleanupOldCPIData() {
  const currentYear = new Date().getFullYear();
  const tenYearsAgo = currentYear - 10;

  const result = await db
    .delete(cpiDataCache)
    .where(sql`${cpiDataCache.year} < ${tenYearsAgo}`)
    .returning();

  return result.length;
}
