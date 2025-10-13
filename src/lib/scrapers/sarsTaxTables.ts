/**
 * SARS Tax Tables Scraper - Using Brightdata MCP Tools
 *
 * Scrapes tax tables from SARS website:
 * - Income tax brackets
 * - Tax rebates
 * - RA lump-sum brackets
 * - CGT, dividend WHT, interest exemptions
 *
 * Cache TTL: 1 year
 */

import { cacheSARSTaxTable } from '@/lib/db/queries';
import type { InsertSarsTaxTableCache } from '@/lib/db/schema';

// Types for SARS tax data
export interface TaxBracket {
  bracket_min: number;
  bracket_max: number | null;
  rate: number;
  base_tax: number;
}

export interface TaxRebates {
  primary: number;
  secondary: number;
  tertiary: number;
}

export interface CGTData {
  inclusion_rate: number;
  annual_exclusion: number;
}

export interface DividendWHT {
  rate: number;
}

export interface InterestExemption {
  under_65: number;
  over_65: number;
}

export interface SARSTaxData {
  tax_year: string;
  income_tax_brackets: TaxBracket[];
  tax_rebates: TaxRebates;
  ra_lump_sum_brackets: TaxBracket[];
  cgt: CGTData;
  dividend_wht: DividendWHT;
  interest_exemption: InterestExemption;
  scraped_at: string;
  source: 'sars_website' | 'fallback_hardcoded';
}

// Configuration
const SARS_TAX_URL = 'https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/';

/**
 * Hardcoded fallback data for 2025/26 tax year
 */
const FALLBACK_2025_26: SARSTaxData = {
  tax_year: '2025/26',
  income_tax_brackets: [
    { bracket_min: 0, bracket_max: 237100, rate: 0.18, base_tax: 0 },
    { bracket_min: 237101, bracket_max: 370500, rate: 0.26, base_tax: 42678 },
    { bracket_min: 370501, bracket_max: 512800, rate: 0.31, base_tax: 77362 },
    { bracket_min: 512801, bracket_max: 673000, rate: 0.36, base_tax: 121475 },
    { bracket_min: 673001, bracket_max: 857900, rate: 0.39, base_tax: 179147 },
    { bracket_min: 857901, bracket_max: 1817000, rate: 0.41, base_tax: 251258 },
    { bracket_min: 1817001, bracket_max: null, rate: 0.45, base_tax: 644489 },
  ],
  tax_rebates: {
    primary: 17235,
    secondary: 9444,
    tertiary: 3145,
  },
  ra_lump_sum_brackets: [
    { bracket_min: 0, bracket_max: 550000, rate: 0.00, base_tax: 0 },
    { bracket_min: 550001, bracket_max: 770000, rate: 0.18, base_tax: 0 },
    { bracket_min: 770001, bracket_max: 1155000, rate: 0.27, base_tax: 39600 },
    { bracket_min: 1155001, bracket_max: null, rate: 0.36, base_tax: 143550 },
  ],
  cgt: {
    inclusion_rate: 0.40,
    annual_exclusion: 40000,
  },
  dividend_wht: {
    rate: 0.20,
  },
  interest_exemption: {
    under_65: 23800,
    over_65: 34500,
  },
  scraped_at: new Date().toISOString(),
  source: 'fallback_hardcoded',
};

/**
 * Validate SARS tax data
 */
function validateSARSData(data: Partial<SARSTaxData>): boolean {
  // Must have 7 income tax brackets
  if (!data.income_tax_brackets || data.income_tax_brackets.length !== 7) {
    console.warn('[SARS Scraper] Invalid: Expected 7 income tax brackets');
    return false;
  }

  // Top rate should be 45%
  const topBracket = data.income_tax_brackets[data.income_tax_brackets.length - 1];
  if (topBracket.rate !== 0.45) {
    console.warn('[SARS Scraper] Invalid: Top tax rate should be 45%');
    return false;
  }

  // First RA bracket should be tax-free up to R550k
  if (!data.ra_lump_sum_brackets || data.ra_lump_sum_brackets.length === 0) {
    console.warn('[SARS Scraper] Invalid: Missing RA lump sum brackets');
    return false;
  }

  const firstRABracket = data.ra_lump_sum_brackets[0];
  if (firstRABracket.rate !== 0 || firstRABracket.bracket_max !== 550000) {
    console.warn('[SARS Scraper] Invalid: First RA bracket should be 0% up to R550,000');
    return false;
  }

  return true;
}

/**
 * Scrape SARS tax tables with fallback
 */
export async function scrapeSARSTaxTables(taxYear: string = '2025/26'): Promise<SARSTaxData> {
  console.log(`[SARS Scraper] Scraping tax tables for ${taxYear}`);

  try {
    // NOTE: This is a placeholder. Actual scraping will be done in the API route
    // using Brightdata MCP tools.
    const scrapedData = await scrapeWithBrightdata(taxYear);

    if (validateSARSData(scrapedData)) {
      console.log('[SARS Scraper] Successfully scraped and validated SARS data');

      // Cache the data
      await cacheTaxData(scrapedData);

      return scrapedData;
    } else {
      throw new Error('Scraped data failed validation');
    }

  } catch (error) {
    console.error('[SARS Scraper] Failed to scrape:', error);
    console.log('[SARS Scraper] Falling back to hardcoded 2025/26 data');

    // Return fallback data
    const fallbackData = { ...FALLBACK_2025_26, tax_year: taxYear };

    // Cache fallback data
    await cacheTaxData(fallbackData);

    return fallbackData;
  }
}

/**
 * Scrape using Brightdata MCP tool
 *
 * NOTE: This will be implemented in the API route with actual Brightdata MCP tools
 */
async function scrapeWithBrightdata(taxYear: string): Promise<SARSTaxData> {
  // Placeholder - actual implementation in API route
  throw new Error('Brightdata scraping not implemented - use fallback');
}

/**
 * Parse SARS markdown tables
 *
 * This helper will be used in the API route to parse Brightdata markdown output
 */
export function parseSARSMarkdown(markdown: string, taxYear: string): SARSTaxData {
  console.log('[SARS Scraper] Parsing markdown...');

  // TODO: Implement actual parsing logic for markdown tables
  // For now, return fallback
  return { ...FALLBACK_2025_26, tax_year: taxYear };
}

/**
 * Cache SARS tax data
 */
async function cacheTaxData(data: SARSTaxData): Promise<void> {
  const cacheData: InsertSarsTaxTableCache = {
    taxYear: data.tax_year,
    incomeTaxBrackets: data.income_tax_brackets as any,
    primaryRebate: data.tax_rebates.primary.toString(),
    secondaryRebate: data.tax_rebates.secondary.toString(),
    tertiaryRebate: data.tax_rebates.tertiary.toString(),
    raLumpSumBrackets: data.ra_lump_sum_brackets as any,
    cgtInclusionRate: data.cgt.inclusion_rate.toString(),
    cgtAnnualExclusion: data.cgt.annual_exclusion.toString(),
    dividendWhtRate: data.dividend_wht.rate.toString(),
    interestExemptUnder65: data.interest_exemption.under_65.toString(),
    interestExemptOver65: data.interest_exemption.over_65.toString(),
    scrapedAt: new Date(),
    lastUpdated: new Date(),
    source: data.source,
  };

  await cacheSARSTaxTable(cacheData);
}

/**
 * Export configuration and fallback data
 */
export const SARS_CONFIG = {
  BASE_URL: SARS_TAX_URL,
  CACHE_TTL_YEARS: 1,
  FALLBACK_DATA: FALLBACK_2025_26,
};
