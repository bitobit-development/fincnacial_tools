/**
 * SARS Tax Tables API Endpoint
 *
 * GET /api/tax/sars-tables
 * Query params: ?taxYear=2025/26 (optional)
 *
 * Returns cached tax tables or triggers scraper if stale
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCachedSARSTaxTables } from '@/lib/db/queries';
import { scrapeSARSTaxTables, SARS_CONFIG } from '@/lib/scrapers/sarsTaxTables';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Calculate cache age in days
 */
function getCacheAgeDays(lastUpdated: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - lastUpdated.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
}

/**
 * GET /api/tax/sars-tables
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taxYear = searchParams.get('taxYear') || '2025/26';

    console.log(`[SARS API] Fetching tax tables for ${taxYear}`);

    // Check cache first
    const cachedTables = await getCachedSARSTaxTables(taxYear);

    // If cache is valid (< 1 year), return cached data
    if (cachedTables) {
      const cacheAgeDays = getCacheAgeDays(cachedTables.lastUpdated);
      const cacheAgeYears = cacheAgeDays / 365;

      if (cacheAgeYears < SARS_CONFIG.CACHE_TTL_YEARS) {
        console.log(`[SARS API] Returning cached tax tables (age: ${cacheAgeDays.toFixed(0)} days)`);

        return NextResponse.json({
          success: true,
          data: {
            tax_year: cachedTables.taxYear,
            income_tax_brackets: cachedTables.incomeTaxBrackets,
            tax_rebates: {
              primary: parseFloat(cachedTables.primaryRebate),
              secondary: parseFloat(cachedTables.secondaryRebate),
              tertiary: parseFloat(cachedTables.tertiaryRebate),
            },
            ra_lump_sum_brackets: cachedTables.raLumpSumBrackets,
            cgt: {
              inclusion_rate: parseFloat(cachedTables.cgtInclusionRate),
              annual_exclusion: parseFloat(cachedTables.cgtAnnualExclusion),
            },
            dividend_wht: {
              rate: parseFloat(cachedTables.dividendWhtRate),
            },
            interest_exemption: {
              under_65: parseFloat(cachedTables.interestExemptUnder65),
              over_65: parseFloat(cachedTables.interestExemptOver65),
            },
          },
          cached: true,
          source: cachedTables.source || 'sars_website',
        }, { status: 200 });
      }
    }

    // Cache is stale or empty, trigger scraper (which has fallback)
    console.log('[SARS API] Cache stale or empty, triggering scraper...');

    try {
      const freshData = await scrapeSARSTaxTables(taxYear);

      return NextResponse.json({
        success: true,
        data: {
          tax_year: freshData.tax_year,
          income_tax_brackets: freshData.income_tax_brackets,
          tax_rebates: freshData.tax_rebates,
          ra_lump_sum_brackets: freshData.ra_lump_sum_brackets,
          cgt: freshData.cgt,
          dividend_wht: freshData.dividend_wht,
          interest_exemption: freshData.interest_exemption,
        },
        cached: false,
        source: freshData.source,
      }, { status: 200 });

    } catch (scrapeError) {
      console.error('[SARS API] Scraping error:', scrapeError);

      // Return stale cache if available
      if (cachedTables) {
        return NextResponse.json({
          success: true,
          data: {
            tax_year: cachedTables.taxYear,
            income_tax_brackets: cachedTables.incomeTaxBrackets,
            tax_rebates: {
              primary: parseFloat(cachedTables.primaryRebate),
              secondary: parseFloat(cachedTables.secondaryRebate),
              tertiary: parseFloat(cachedTables.tertiaryRebate),
            },
            ra_lump_sum_brackets: cachedTables.raLumpSumBrackets,
            cgt: {
              inclusion_rate: parseFloat(cachedTables.cgtInclusionRate),
              annual_exclusion: parseFloat(cachedTables.cgtAnnualExclusion),
            },
            dividend_wht: {
              rate: parseFloat(cachedTables.dividendWhtRate),
            },
            interest_exemption: {
              under_65: parseFloat(cachedTables.interestExemptUnder65),
              over_65: parseFloat(cachedTables.interestExemptOver65),
            },
          },
          cached: true,
          source: cachedTables.source || 'sars_website',
          warning: 'Using stale cache - scraper failed',
        }, { status: 200 });
      }

      throw scrapeError;
    }

  } catch (error) {
    console.error('[SARS API] Error:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch SARS tax tables',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
