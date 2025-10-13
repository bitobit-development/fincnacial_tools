/**
 * Discovery Funds API Endpoint
 *
 * GET /api/funds/discovery
 * Query params: ?type=balanced|equity|bond (optional)
 *
 * Returns cached fund data or triggers scraper if stale
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCachedDiscoveryFunds } from '@/lib/db/queries';
import { scrapeDiscoveryFunds, DISCOVERY_CONFIG } from '@/lib/scrapers/discoveryFunds';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Calculate cache age in hours
 */
function getCacheAgeHours(lastUpdated: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - lastUpdated.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * GET /api/funds/discovery
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fundType = searchParams.get('type') || undefined;

    console.log(`[Discovery API] Fetching funds${fundType ? ` (type: ${fundType})` : ''}`);

    // Check cache first
    const cachedFunds = await getCachedDiscoveryFunds(fundType);

    // If cache is valid (< 24 hours), return cached data
    if (cachedFunds && cachedFunds.length > 0) {
      const cacheAge = getCacheAgeHours(cachedFunds[0].lastUpdated);

      if (cacheAge < DISCOVERY_CONFIG.CACHE_TTL_HOURS) {
        console.log(`[Discovery API] Returning ${cachedFunds.length} cached funds (age: ${cacheAge.toFixed(1)}h)`);

        return NextResponse.json({
          success: true,
          data: cachedFunds.map(fund => ({
            fund_name: fund.fundName,
            fund_code: fund.fundCode,
            fund_type: fund.fundType,
            cagr_1y: fund.cagr1y ? parseFloat(fund.cagr1y) : null,
            cagr_3y: fund.cagr3y ? parseFloat(fund.cagr3y) : null,
            cagr_5y: fund.cagr5y ? parseFloat(fund.cagr5y) : null,
            cagr_10y: fund.cagr10y ? parseFloat(fund.cagr10y) : null,
            volatility: fund.volatility ? parseFloat(fund.volatility) : null,
            sharpe_ratio: fund.sharpeRatio ? parseFloat(fund.sharpeRatio) : null,
            last_updated: fund.lastUpdated.toISOString(),
          })),
          cached: true,
          cache_age_hours: parseFloat(cacheAge.toFixed(2)),
        }, { status: 200 });
      }
    }

    // Cache is stale or empty, trigger scraper
    console.log('[Discovery API] Cache stale or empty, triggering scraper...');

    try {
      const freshFunds = await scrapeDiscoveryFunds();

      if (freshFunds.length > 0) {
        return NextResponse.json({
          success: true,
          data: freshFunds,
          cached: false,
          cache_age_hours: 0,
        }, { status: 200 });
      }

      // Scraping failed but we have stale cache - return it anyway
      if (cachedFunds && cachedFunds.length > 0) {
        console.warn('[Discovery API] Scraping failed, returning stale cache');

        return NextResponse.json({
          success: true,
          data: cachedFunds.map(fund => ({
            fund_name: fund.fundName,
            fund_code: fund.fundCode,
            fund_type: fund.fundType,
            cagr_1y: fund.cagr1y ? parseFloat(fund.cagr1y) : null,
            cagr_3y: fund.cagr3y ? parseFloat(fund.cagr3y) : null,
            cagr_5y: fund.cagr5y ? parseFloat(fund.cagr5y) : null,
            cagr_10y: fund.cagr10y ? parseFloat(fund.cagr10y) : null,
            volatility: fund.volatility ? parseFloat(fund.volatility) : null,
            sharpe_ratio: fund.sharpeRatio ? parseFloat(fund.sharpeRatio) : null,
            last_updated: fund.lastUpdated.toISOString(),
          })),
          cached: true,
          cache_age_hours: getCacheAgeHours(cachedFunds[0].lastUpdated),
          warning: 'Using stale cache - scraper failed',
        }, { status: 200 });
      }

      // No cache and scraping failed
      throw new Error('No cached data available and scraping failed');

    } catch (scrapeError) {
      console.error('[Discovery API] Scraping error:', scrapeError);

      // Return stale cache if available
      if (cachedFunds && cachedFunds.length > 0) {
        return NextResponse.json({
          success: true,
          data: cachedFunds.map(fund => ({
            fund_name: fund.fundName,
            fund_code: fund.fundCode,
            fund_type: fund.fundType,
            cagr_1y: fund.cagr1y ? parseFloat(fund.cagr1y) : null,
            cagr_3y: fund.cagr3y ? parseFloat(fund.cagr3y) : null,
            cagr_5y: fund.cagr5y ? parseFloat(fund.cagr5y) : null,
            cagr_10y: fund.cagr10y ? parseFloat(fund.cagr10y) : null,
            volatility: fund.volatility ? parseFloat(fund.volatility) : null,
            sharpe_ratio: fund.sharpeRatio ? parseFloat(fund.sharpeRatio) : null,
            last_updated: fund.lastUpdated.toISOString(),
          })),
          cached: true,
          cache_age_hours: getCacheAgeHours(cachedFunds[0].lastUpdated),
          warning: 'Using stale cache - scraper failed',
        }, { status: 200 });
      }

      throw scrapeError;
    }

  } catch (error) {
    console.error('[Discovery API] Error:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Discovery funds',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
