/**
 * Stats SA CPI Scraper - Using Brightdata MCP Tools
 *
 * Scrapes Consumer Price Index data from Statistics South Africa:
 * - Monthly CPI values
 * - Annual inflation rates
 * - Rolling 12-month average
 *
 * Cache TTL: 30 days
 */

import { cacheCPI, getCachedCPI } from '@/lib/db/queries';
import type { InsertCpiDataCache } from '@/lib/db/schema';

// Types for CPI data
export interface CPIData {
  year: number;
  month: number;
  cpi_value: number;
  annual_rate: number;
  monthly_rate: number | null;
  category: string;
  last_updated: string;
}

export interface CPIResponse {
  latest: CPIData;
  rolling_average_12m: number;
  historical: CPIData[];
  source: 'stats_sa' | 'sarb' | 'fallback';
}

// Configuration
const STATS_SA_URL = 'http://www.statssa.gov.za/?page_id=1854&PPN=P0141';
const SARB_FALLBACK_URL = 'https://www.resbank.co.za/en/home/what-we-do/statistics';
const DEFAULT_INFLATION_RATE = 0.06; // 6% - SA long-term average

/**
 * Calculate rolling average inflation
 */
export function calculateRollingAverage(data: CPIData[]): number {
  if (data.length === 0) return DEFAULT_INFLATION_RATE;

  const last12Months = data.slice(0, Math.min(12, data.length));
  const sum = last12Months.reduce((acc, d) => acc + d.annual_rate, 0);

  return sum / last12Months.length;
}

/**
 * Validate CPI data
 */
function validateCPIData(data: CPIData[]): boolean {
  if (data.length === 0) {
    console.warn('[CPI Scraper] Invalid: No data points');
    return false;
  }

  // Check each data point
  for (const entry of data) {
    // CPI value should be between 100 and 200
    if (entry.cpi_value < 100 || entry.cpi_value > 200) {
      console.warn(`[CPI Scraper] Invalid CPI value: ${entry.cpi_value}`);
      return false;
    }

    // Annual rate should be between -2% and 20%
    if (entry.annual_rate < -0.02 || entry.annual_rate > 0.20) {
      console.warn(`[CPI Scraper] Invalid annual rate: ${entry.annual_rate}`);
      return false;
    }

    // Latest data should be recent (< 60 days old)
    const dataDate = new Date(entry.year, entry.month - 1);
    const daysDiff = Math.floor((Date.now() - dataDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 60) {
      console.warn(`[CPI Scraper] Data is ${daysDiff} days old (latest: ${entry.year}-${entry.month})`);
    }
  }

  return true;
}

/**
 * Scrape Stats SA CPI data with multi-level fallback
 */
export async function scrapeStatsSaCPI(months: number = 12): Promise<CPIData[]> {
  console.log(`[CPI Scraper] Scraping last ${months} months of CPI data`);

  // Level 1: Try Stats SA
  try {
    console.log('[CPI Scraper] Level 1: Trying Stats SA...');
    const data = await scrapeStatsSA(months);

    if (validateCPIData(data)) {
      console.log(`[CPI Scraper] Successfully scraped ${data.length} months from Stats SA`);

      // Cache all data points
      for (const entry of data) {
        await cacheCPIData(entry, 'stats_sa');
      }

      return data;
    }
  } catch (error) {
    console.error('[CPI Scraper] Stats SA failed:', error);
  }

  // Level 2: Try SARB
  try {
    console.log('[CPI Scraper] Level 2: Trying SARB fallback...');
    const data = await scrapeSARB(months);

    if (validateCPIData(data)) {
      console.log(`[CPI Scraper] Successfully scraped ${data.length} months from SARB`);

      // Cache all data points
      for (const entry of data) {
        await cacheCPIData(entry, 'sarb');
      }

      return data;
    }
  } catch (error) {
    console.error('[CPI Scraper] SARB failed:', error);
  }

  // Level 3: Return default fallback
  console.log('[CPI Scraper] Level 3: Using default 6% inflation fallback');
  return generateFallbackCPIData(months);
}

/**
 * Scrape Stats SA using Brightdata MCP tool
 *
 * NOTE: This will be implemented in the API route with actual Brightdata MCP tools
 */
async function scrapeStatsSA(months: number): Promise<CPIData[]> {
  // Placeholder - actual implementation in API route
  throw new Error('Stats SA scraping not implemented yet');
}

/**
 * Scrape SARB using Brightdata MCP tool
 *
 * NOTE: This will be implemented in the API route with actual Brightdata MCP tools
 */
async function scrapeSARB(months: number): Promise<CPIData[]> {
  // Placeholder - actual implementation in API route
  throw new Error('SARB scraping not implemented yet');
}

/**
 * Generate fallback CPI data with 6% inflation
 */
function generateFallbackCPIData(months: number): CPIData[] {
  const data: CPIData[] = [];
  const currentDate = new Date();

  // Generate last N months with 6% inflation
  for (let i = 0; i < months; i++) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);

    // Base CPI value around 142 (realistic for 2025)
    // Slightly vary it month-to-month
    const baseCPI = 142;
    const variation = (Math.random() - 0.5) * 2; // +/- 1 point
    const cpiValue = baseCPI + variation;

    data.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      cpi_value: parseFloat(cpiValue.toFixed(2)),
      annual_rate: DEFAULT_INFLATION_RATE, // 6%
      monthly_rate: 0.005, // ~0.5% monthly
      category: 'All items',
      last_updated: new Date().toISOString(),
    });
  }

  return data;
}

/**
 * Parse Stats SA markdown tables
 *
 * This helper will be used in the API route to parse Brightdata markdown output
 */
export function parseStatsSAMarkdown(markdown: string): CPIData[] {
  console.log('[CPI Scraper] Parsing Stats SA markdown...');

  const data: CPIData[] = [];

  // TODO: Implement actual parsing logic for markdown tables
  // Look for patterns like:
  // | Year | Month | CPI | Annual % |
  // |------|-------|-----|----------|
  // | 2025 | 09    | 142.3 | 5.8 |

  return data;
}

/**
 * Parse SARB markdown tables
 */
export function parseSARBMarkdown(markdown: string): CPIData[] {
  console.log('[CPI Scraper] Parsing SARB markdown...');

  const data: CPIData[] = [];

  // TODO: Implement actual parsing logic for SARB format

  return data;
}

/**
 * Calculate inflation from CPI values
 */
export function calculateInflation(currentCPI: number, previousCPI: number): number {
  return ((currentCPI - previousCPI) / previousCPI) * 100;
}

/**
 * Cache CPI data
 */
async function cacheCPIData(data: CPIData, source: string): Promise<void> {
  const cacheData: InsertCpiDataCache = {
    year: data.year,
    month: data.month,
    cpiValue: data.cpi_value.toString(),
    annualRate: data.annual_rate.toString(),
    monthlyRate: data.monthly_rate?.toString() || null,
    category: data.category || 'All items',
    scrapedAt: new Date(),
    lastUpdated: new Date(),
    source,
  };

  await cacheCPI(cacheData);
}

/**
 * Get CPI response with rolling average
 */
export async function getCPIResponse(months: number = 12): Promise<CPIResponse> {
  // Try to get from cache first
  const cachedData = await getCachedCPI(months);

  let data: CPIData[];
  let source: 'stats_sa' | 'sarb' | 'fallback';

  if (cachedData && cachedData.length > 0) {
    // Convert cached data to CPIData format
    data = cachedData.map(entry => ({
      year: entry.year,
      month: entry.month,
      cpi_value: parseFloat(entry.cpiValue),
      annual_rate: parseFloat(entry.annualRate),
      monthly_rate: entry.monthlyRate ? parseFloat(entry.monthlyRate) : null,
      category: entry.category,
      last_updated: entry.lastUpdated.toISOString(),
    }));

    source = (cachedData[0].source as any) || 'fallback';
  } else {
    // No cache, scrape fresh data
    data = await scrapeStatsSaCPI(months);
    source = 'fallback';
  }

  const rollingAverage = calculateRollingAverage(data);

  return {
    latest: data[0],
    rolling_average_12m: rollingAverage,
    historical: data,
    source,
  };
}

/**
 * Export configuration
 */
export const CPI_CONFIG = {
  STATS_SA_URL,
  SARB_FALLBACK_URL,
  DEFAULT_INFLATION_RATE,
  CACHE_TTL_DAYS: 30,
};
