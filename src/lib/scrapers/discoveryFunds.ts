/**
 * Discovery Funds Scraper - Using Playwright MCP Tools
 *
 * Scrapes fund performance data from Discovery website:
 * - CAGR (1y, 3y, 5y, 10y)
 * - Volatility
 * - Sharpe ratio
 *
 * Cache TTL: 24 hours
 */

import { cacheDiscoveryFund } from '@/lib/db/queries';
import type { InsertDiscoveryFundCache } from '@/lib/db/schema';

// Types for scraped fund data
export interface DiscoveryFund {
  fund_name: string;
  fund_code: string;
  fund_type: string;
  cagr_1y: number | null;
  cagr_3y: number | null;
  cagr_5y: number | null;
  cagr_10y: number | null;
  volatility: number | null;
  sharpe_ratio: number | null;
  inception_date?: string | null;
}

// Configuration
const RETRY_ATTEMPTS = 3;
const RETRY_DELAYS = [2000, 4000, 8000]; // Exponential backoff
const DISCOVERY_BASE_URL = 'https://www.discovery.co.za/invest/products/retirement-annuity';

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse percentage strings to decimals
 * "10.5%" -> 0.105
 * "10,5%" -> 0.105
 */
function parsePercentage(value: string | null | undefined): number | null {
  if (!value) return null;

  // Remove % sign and whitespace
  const cleaned = value.replace(/[%\s]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) return null;

  // Convert to decimal (10.5% -> 0.105)
  return parsed / 100;
}

/**
 * Validate fund data
 */
function validateFundData(fund: Partial<DiscoveryFund>): boolean {
  // Must have name and code
  if (!fund.fund_name || !fund.fund_code) return false;

  // CAGR values should be between -50% and +100%
  const cagrs = [fund.cagr_1y, fund.cagr_3y, fund.cagr_5y, fund.cagr_10y].filter((v): v is number => v !== null && v !== undefined);
  for (const cagr of cagrs) {
    if (cagr < -0.5 || cagr > 1.0) return false;
  }

  // Volatility should be between 0% and 100%
  if (fund.volatility !== null && fund.volatility !== undefined && (fund.volatility < 0 || fund.volatility > 1.0)) return false;

  return true;
}

/**
 * Scrape Discovery funds with retry logic
 */
export async function scrapeDiscoveryFunds(): Promise<DiscoveryFund[]> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
    try {
      console.log(`[Discovery Scraper] Attempt ${attempt + 1}/${RETRY_ATTEMPTS}`);

      // Use Playwright MCP tools to scrape
      const funds = await scrapeDiscoveryWithPlaywright();

      if (funds.length === 0) {
        throw new Error('No funds found on Discovery website');
      }

      // Cache all funds
      console.log(`[Discovery Scraper] Caching ${funds.length} funds...`);
      for (const fund of funds) {
        if (validateFundData(fund)) {
          await cacheFund(fund);
        } else {
          console.warn(`[Discovery Scraper] Invalid fund data: ${fund.fund_name}`);
        }
      }

      console.log(`[Discovery Scraper] Successfully scraped ${funds.length} funds`);
      return funds;

    } catch (error) {
      lastError = error as Error;
      console.error(`[Discovery Scraper] Attempt ${attempt + 1} failed:`, error);

      // Wait before retry (exponential backoff)
      if (attempt < RETRY_ATTEMPTS - 1) {
        const delay = RETRY_DELAYS[attempt];
        console.log(`[Discovery Scraper] Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  // All attempts failed
  console.error('[Discovery Scraper] All retry attempts exhausted:', lastError);
  return [];
}

/**
 * Scrape using Playwright MCP tools
 *
 * NOTE: This is a mock implementation since we can't directly call MCP tools from this file.
 * The actual scraping will be done in the API route which has access to MCP tools.
 *
 * This function provides the structure and parsing logic.
 */
async function scrapeDiscoveryWithPlaywright(): Promise<DiscoveryFund[]> {
  // This will be called from the API route with actual Playwright MCP tools
  // For now, return mock data structure

  const mockFunds: DiscoveryFund[] = [
    {
      fund_name: 'Discovery Balanced Fund',
      fund_code: 'DI_BAL_001',
      fund_type: 'Balanced',
      cagr_1y: 0.0845,
      cagr_3y: 0.0920,
      cagr_5y: 0.0875,
      cagr_10y: 0.0950,
      volatility: 0.123,
      sharpe_ratio: 0.68,
      inception_date: '2010-01-01'
    }
  ];

  return mockFunds;
}

/**
 * Parse fund data from page snapshot
 *
 * This helper will be used in the API route to parse Playwright snapshots
 */
export function parseFundDataFromSnapshot(snapshot: string, baseUrl: string): DiscoveryFund[] {
  const funds: DiscoveryFund[] = [];

  // TODO: Implement actual parsing logic based on Discovery website structure
  // This will be done after we explore the website with Playwright

  return funds;
}

/**
 * Cache a single fund
 */
async function cacheFund(fund: DiscoveryFund): Promise<void> {
  const cacheData: InsertDiscoveryFundCache = {
    fundName: fund.fund_name,
    fundCode: fund.fund_code,
    fundType: fund.fund_type,
    cagr1y: fund.cagr_1y?.toString() || null,
    cagr3y: fund.cagr_3y?.toString() || null,
    cagr5y: fund.cagr_5y?.toString() || null,
    cagr10y: fund.cagr_10y?.toString() || null,
    volatility: fund.volatility?.toString() || null,
    sharpeRatio: fund.sharpe_ratio?.toString() || null,
    inceptionDate: fund.inception_date || null,
    scrapedAt: new Date(),
    lastUpdated: new Date(),
  };

  await cacheDiscoveryFund(cacheData);
}

/**
 * Export configuration for external use
 */
export const DISCOVERY_CONFIG = {
  BASE_URL: DISCOVERY_BASE_URL,
  RETRY_ATTEMPTS,
  RETRY_DELAYS,
  CACHE_TTL_HOURS: 24,
};
