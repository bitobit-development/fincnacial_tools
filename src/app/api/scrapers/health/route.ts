/**
 * Scraper Health Check API Endpoint
 *
 * GET /api/scrapers/health
 *
 * Returns health status of all scrapers:
 * - Discovery Funds
 * - SARS Tax Tables
 * - Stats SA CPI
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCachedDiscoveryFunds, getCachedSARSTaxTables, getCachedCPI } from '@/lib/db/queries';
import { DISCOVERY_CONFIG } from '@/lib/scrapers/discoveryFunds';
import { SARS_CONFIG } from '@/lib/scrapers/sarsTaxTables';
import { CPI_CONFIG } from '@/lib/scrapers/statsSaCpi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type HealthStatus = 'healthy' | 'degraded' | 'down';

interface ScraperHealth {
  status: HealthStatus;
  last_scrape: string | null;
  cache_age_hours: number | null;
  error_count: number;
  data_points: number;
}

/**
 * Calculate cache age in hours
 */
function getCacheAgeHours(lastUpdated: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - lastUpdated.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * Determine health status based on cache age and data availability
 */
function determineStatus(
  hasData: boolean,
  cacheAgeHours: number | null,
  maxAgeHours: number
): HealthStatus {
  if (!hasData) return 'down';
  if (cacheAgeHours === null) return 'down';
  if (cacheAgeHours > maxAgeHours * 2) return 'down';
  if (cacheAgeHours > maxAgeHours) return 'degraded';
  return 'healthy';
}

/**
 * GET /api/scrapers/health
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[Health API] Checking scraper health...');

    // Check Discovery Funds
    const discoveryFunds = await getCachedDiscoveryFunds();
    const discoveryHealth: ScraperHealth = {
      status: 'down',
      last_scrape: null,
      cache_age_hours: null,
      error_count: 0,
      data_points: discoveryFunds?.length || 0,
    };

    if (discoveryFunds && discoveryFunds.length > 0) {
      const cacheAge = getCacheAgeHours(discoveryFunds[0].lastUpdated);
      discoveryHealth.last_scrape = discoveryFunds[0].scrapedAt.toISOString();
      discoveryHealth.cache_age_hours = parseFloat(cacheAge.toFixed(2));
      discoveryHealth.status = determineStatus(
        true,
        cacheAge,
        DISCOVERY_CONFIG.CACHE_TTL_HOURS
      );
    }

    // Check SARS Tax Tables
    const sarsTables = await getCachedSARSTaxTables('2025/26');
    const sarsHealth: ScraperHealth = {
      status: 'down',
      last_scrape: null,
      cache_age_hours: null,
      error_count: 0,
      data_points: sarsTables ? 1 : 0,
    };

    if (sarsTables) {
      const cacheAge = getCacheAgeHours(sarsTables.lastUpdated);
      sarsHealth.last_scrape = sarsTables.scrapedAt.toISOString();
      sarsHealth.cache_age_hours = parseFloat(cacheAge.toFixed(2));
      sarsHealth.status = determineStatus(
        true,
        cacheAge,
        SARS_CONFIG.CACHE_TTL_YEARS * 365 * 24 // Convert years to hours
      );
    }

    // Check CPI Data
    const cpiData = await getCachedCPI(12);
    const cpiHealth: ScraperHealth = {
      status: 'down',
      last_scrape: null,
      cache_age_hours: null,
      error_count: 0,
      data_points: cpiData?.length || 0,
    };

    if (cpiData && cpiData.length > 0) {
      const cacheAge = getCacheAgeHours(cpiData[0].lastUpdated);
      cpiHealth.last_scrape = cpiData[0].scrapedAt.toISOString();
      cpiHealth.cache_age_hours = parseFloat(cacheAge.toFixed(2));
      cpiHealth.status = determineStatus(
        true,
        cacheAge,
        CPI_CONFIG.CACHE_TTL_DAYS * 24 // Convert days to hours
      );
    }

    // Determine overall health
    const statuses = [discoveryHealth.status, sarsHealth.status, cpiHealth.status];
    const overallHealth: HealthStatus =
      statuses.includes('down') ? 'down' :
      statuses.includes('degraded') ? 'degraded' :
      'healthy';

    return NextResponse.json({
      overall_health: overallHealth,
      timestamp: new Date().toISOString(),
      scrapers: {
        discovery_funds: discoveryHealth,
        sars_tax_tables: sarsHealth,
        stats_sa_cpi: cpiHealth,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('[Health API] Error:', error);

    return NextResponse.json({
      overall_health: 'down',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
