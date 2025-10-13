'use client';

// =============================================================================
// Discovery Funds Hook - Data Fetching with SWR
// =============================================================================

import useSWR from 'swr';
import type { DiscoveryFund } from '@/types';

/**
 * Discovery Funds API Response
 */
type DiscoveryFundAPIResponse = {
  fund_name: string;
  fund_code: string;
  fund_type: 'Equity' | 'Balanced' | 'Bond' | 'Money Market' | 'Specialist';
  cagr_1y: number | null;
  cagr_3y: number | null;
  cagr_5y: number | null;
  cagr_10y: number | null;
  volatility: number | null;
  sharpe_ratio: number | null;
  last_updated: string;
};

type FundsAPIResponse = {
  success: boolean;
  data: DiscoveryFundAPIResponse[];
  cached: boolean;
  cache_age_hours: number;
  warning?: string;
};

/**
 * Fetcher function for SWR
 */
const fetcher = async (url: string): Promise<FundsAPIResponse> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
};

/**
 * Transform API response to DiscoveryFund type
 */
const transformToDiscoveryFund = (apiData: DiscoveryFundAPIResponse): DiscoveryFund => ({
  id: apiData.fund_code, // Use fund_code as unique ID
  fundName: apiData.fund_name,
  fundCode: apiData.fund_code,
  fundType: apiData.fund_type,
  cagr1y: apiData.cagr_1y,
  cagr3y: apiData.cagr_3y,
  cagr5y: apiData.cagr_5y,
  cagr10y: apiData.cagr_10y,
  volatility: apiData.volatility,
  sharpeRatio: apiData.sharpe_ratio,
  inceptionDate: null,
  lastUpdated: new Date(apiData.last_updated),
  isCached: true,
});

/**
 * Custom hook to fetch Discovery funds with SWR
 *
 * Features:
 * - Automatic caching and revalidation
 * - Deduping requests (multiple components can call this without extra requests)
 * - Loading and error states
 * - 1-hour deduping interval (no refetch within 1 hour)
 * - No revalidation on focus (data is stale after 24h anyway)
 *
 * @param fundType - Optional filter by fund type (e.g., 'Equity', 'Balanced')
 * @returns { funds, loading, error, isStale, mutate }
 *
 * @example
 * ```tsx
 * const { funds, loading, error } = useFunds();
 * const { funds: equityFunds } = useFunds('Equity');
 * ```
 */
export const useFunds = (fundType?: string) => {
  const url = fundType ? `/api/funds/discovery?type=${fundType}` : '/api/funds/discovery';

  const { data, error, isLoading, mutate } = useSWR<FundsAPIResponse>(url, fetcher, {
    revalidateOnFocus: false, // Don't refetch when window regains focus
    revalidateOnReconnect: false, // Don't refetch on reconnect
    dedupingInterval: 3600000, // 1 hour (in milliseconds)
    shouldRetryOnError: true,
    errorRetryCount: 3,
    errorRetryInterval: 5000, // 5 seconds between retries
  });

  // Transform API data to DiscoveryFund[]
  const funds: DiscoveryFund[] = data?.data
    ? data.data.map(transformToDiscoveryFund)
    : [];

  return {
    funds,
    loading: isLoading,
    error: error ? new Error(error.message || 'Failed to fetch funds') : null,
    isStale: data?.cached && data.cache_age_hours > 24,
    cacheAge: data?.cache_age_hours || 0,
    mutate, // Expose mutate for manual revalidation
  };
};

/**
 * Hook to get a single fund by code
 *
 * @param fundCode - Fund code (e.g., 'DI_EQ_001')
 * @returns { fund, loading, error }
 *
 * @example
 * ```tsx
 * const { fund, loading, error } = useFund('DI_EQ_001');
 * ```
 */
export const useFund = (fundCode: string) => {
  const { funds, loading, error } = useFunds();

  const fund = funds.find((f) => f.fundCode === fundCode) || null;

  return {
    fund,
    loading,
    error,
  };
};

/**
 * Hook to get funds grouped by type
 *
 * @returns { fundsByType, loading, error }
 *
 * @example
 * ```tsx
 * const { fundsByType, loading } = useFundsGroupedByType();
 * // fundsByType = { Equity: [...], Balanced: [...], ... }
 * ```
 */
export const useFundsGroupedByType = () => {
  const { funds, loading, error } = useFunds();

  const fundsByType = funds.reduce(
    (acc, fund) => {
      const type = fund.fundType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(fund);
      return acc;
    },
    {} as Record<string, DiscoveryFund[]>
  );

  return {
    fundsByType,
    loading,
    error,
  };
};

/**
 * Hook type exports
 */
export type UseFundsReturn = ReturnType<typeof useFunds>;
export type UseFundReturn = ReturnType<typeof useFund>;
export type UseFundsGroupedByTypeReturn = ReturnType<typeof useFundsGroupedByType>;
