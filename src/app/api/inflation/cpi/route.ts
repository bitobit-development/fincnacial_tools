/**
 * CPI (Consumer Price Index) API Endpoint
 *
 * GET /api/inflation/cpi
 * Query params: ?months=12 (optional)
 *
 * Returns cached CPI data or triggers scraper if stale
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCPIResponse, CPI_CONFIG } from '@/lib/scrapers/statsSaCpi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/inflation/cpi
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthsParam = searchParams.get('months');
    const months = monthsParam ? parseInt(monthsParam, 10) : 12;

    // Validate months parameter
    if (isNaN(months) || months < 1 || months > 120) {
      return NextResponse.json({
        success: false,
        error: 'Invalid months parameter',
        message: 'Months must be between 1 and 120',
      }, { status: 400 });
    }

    console.log(`[CPI API] Fetching CPI data for last ${months} months`);

    // Get CPI response (handles caching internally)
    const cpiResponse = await getCPIResponse(months);

    return NextResponse.json({
      success: true,
      data: {
        latest: cpiResponse.latest,
        rolling_average_12m: parseFloat(cpiResponse.rolling_average_12m.toFixed(4)),
        historical: cpiResponse.historical,
      },
      cached: true,
      source: cpiResponse.source,
    }, { status: 200 });

  } catch (error) {
    console.error('[CPI API] Error:', error);

    // Return fallback default inflation if all fails
    return NextResponse.json({
      success: true,
      data: {
        latest: {
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          cpi_value: 142,
          annual_rate: CPI_CONFIG.DEFAULT_INFLATION_RATE,
          monthly_rate: 0.005,
          category: 'All items',
          last_updated: new Date().toISOString(),
        },
        rolling_average_12m: CPI_CONFIG.DEFAULT_INFLATION_RATE,
        historical: [],
      },
      cached: false,
      source: 'fallback',
      warning: 'Using default 6% inflation - scraper and cache failed',
    }, { status: 200 });
  }
}
