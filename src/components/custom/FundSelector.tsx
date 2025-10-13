'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DiscoveryFund } from '@/types';
import { TrendingUp, Activity, Target } from 'lucide-react';

interface FundSelectorProps {
  funds: DiscoveryFund[];
  value: string;
  onChange: (fundCode: string) => void;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  label?: string;
  id?: string;
}

/**
 * FundSelector Component
 *
 * Enhanced select dropdown with fund metadata (CAGR, volatility, Sharpe ratio).
 * Groups funds by type and displays performance metrics.
 *
 * Example:
 * <FundSelector
 *   funds={discoveryFunds}
 *   value={selectedFundCode}
 *   onChange={setSelectedFundCode}
 *   loading={loadingFunds}
 * />
 */
export function FundSelector({
  funds,
  value,
  onChange,
  loading = false,
  error,
  disabled = false,
  label = 'Select Fund',
  id,
}: FundSelectorProps) {
  const inputId = id || React.useId();

  // Group funds by type
  const groupedFunds = React.useMemo(() => {
    const groups: Record<string, DiscoveryFund[]> = {};

    funds.forEach((fund) => {
      if (!groups[fund.fundType]) {
        groups[fund.fundType] = [];
      }
      groups[fund.fundType].push(fund);
    });

    return groups;
  }, [funds]);

  // Get selected fund details
  const selectedFund = React.useMemo(() => {
    return funds.find((fund) => fund.fundCode === value);
  }, [funds, value]);

  // Format percentage
  const formatPercent = (val: number | null): string => {
    if (val === null) return 'N/A';
    return `${val.toFixed(2)}%`;
  };

  // Format ratio
  const formatRatio = (val: number | null): string => {
    if (val === null) return 'N/A';
    return val.toFixed(2);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-2">
        <Label htmlFor={inputId}>{label}</Label>
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <p className="text-sm text-muted-foreground">Loading funds...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-2">
        <Label htmlFor={inputId} className="text-destructive">
          {label}
        </Label>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (funds.length === 0) {
    return (
      <div className="space-y-2">
        <Label htmlFor={inputId}>{label}</Label>
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            No funds available. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label htmlFor={inputId}>{label}</Label>

      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={inputId} aria-label={label}>
          <SelectValue placeholder="Select a fund" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(groupedFunds).map(([fundType, typeFunds]) => (
            <SelectGroup key={fundType}>
              <SelectLabel className="flex items-center gap-2">
                <Badge variant="outline">{fundType}</Badge>
              </SelectLabel>
              {typeFunds.map((fund) => (
                <SelectItem
                  key={fund.fundCode}
                  value={fund.fundCode}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col gap-1 py-1">
                    <span className="font-medium">{fund.fundName}</span>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" aria-hidden="true" />
                        5Y: {formatPercent(fund.cagr5y)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" aria-hidden="true" />
                        Vol: {formatPercent(fund.volatility)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" aria-hidden="true" />
                        Sharpe: {formatRatio(fund.sharpeRatio)}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      {/* Selected fund details */}
      {selectedFund && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{selectedFund.fundName}</h4>
              <Badge variant="outline">{selectedFund.fundType}</Badge>
            </div>

            {/* Performance metrics grid */}
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-muted-foreground">1Y CAGR</p>
                <p className="font-semibold">
                  {formatPercent(selectedFund.cagr1y)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">3Y CAGR</p>
                <p className="font-semibold">
                  {formatPercent(selectedFund.cagr3y)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">5Y CAGR</p>
                <p className="font-semibold">
                  {formatPercent(selectedFund.cagr5y)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Volatility</p>
                <p className="font-semibold">
                  {formatPercent(selectedFund.volatility)}
                </p>
              </div>
            </div>

            {/* Cached indicator */}
            {selectedFund.isCached && (
              <p className="text-xs text-muted-foreground">
                Cached data • Last updated:{' '}
                {new Date(selectedFund.lastUpdated).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
