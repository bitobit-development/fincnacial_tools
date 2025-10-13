'use client';

import * as React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { cn } from '@/lib/utils';

interface TaxBreakdownData {
  year: number;
  income: number;
  cgt: number;
  dividend: number;
  interest: number;
}

interface TaxBreakdownChartProps {
  data: TaxBreakdownData[];
  height?: number;
  className?: string;
}

/**
 * TaxBreakdownChart Component
 *
 * Recharts stacked BarChart showing tax types over time.
 * Color-coded stacks with responsive tooltip.
 *
 * Example:
 * <TaxBreakdownChart
 *   data={taxData}
 *   height={300}
 * />
 */
export function TaxBreakdownChart({
  data,
  height = 300,
  className,
}: TaxBreakdownChartProps) {
  // Format currency for South African Rand
  const formatCurrency = React.useCallback((value: number): string => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  // Format currency for axis (shorter format)
  const formatAxisCurrency = React.useCallback((value: number): string => {
    if (value >= 1_000_000) {
      return `R${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `R${(value / 1_000).toFixed(0)}K`;
    }
    return formatCurrency(value);
  }, [formatCurrency]);

  // Custom tooltip component
  const CustomTooltip = React.useCallback(
    ({ active, payload, label }: any) => {
      if (!active || !payload || !payload.length) {
        return null;
      }

      const year = label;
      const taxTypes = [
        { name: 'Income Tax', value: payload[0]?.value ?? 0, color: 'hsl(var(--chart-1))' },
        { name: 'Capital Gains Tax', value: payload[1]?.value ?? 0, color: 'hsl(var(--chart-2))' },
        { name: 'Dividend Tax', value: payload[2]?.value ?? 0, color: 'hsl(var(--chart-3))' },
        { name: 'Interest Tax', value: payload[3]?.value ?? 0, color: 'hsl(var(--chart-4))' },
      ];

      const totalTax = taxTypes.reduce((sum, tax) => sum + (tax.value as number), 0);

      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="mb-2 font-semibold">Year: {year}</p>
          <div className="space-y-1">
            {taxTypes.map((tax) => (
              <div
                key={tax.name}
                className="flex items-center justify-between gap-4"
              >
                <span className="flex items-center gap-2 text-sm">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: tax.color }}
                    aria-hidden="true"
                  />
                  {tax.name}:
                </span>
                <span className="font-medium">
                  {formatCurrency(tax.value as number)}
                </span>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between gap-4 border-t pt-2">
              <span className="text-sm font-semibold">Total Tax:</span>
              <span className="font-bold">{formatCurrency(totalTax)}</span>
            </div>
          </div>
        </div>
      );
    },
    [formatCurrency]
  );

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border bg-muted/50',
          className
        )}
        style={{ height }}
      >
        <p className="text-muted-foreground">
          No tax breakdown data available. Tax information will appear after
          calculating your retirement projection.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-muted"
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="year"
            label={{
              value: 'Year',
              position: 'insideBottom',
              offset: -5,
              className: 'fill-muted-foreground',
            }}
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            tickFormatter={formatAxisCurrency}
            label={{
              value: 'Tax Paid',
              angle: -90,
              position: 'insideLeft',
              className: 'fill-muted-foreground',
            }}
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
          <Bar
            dataKey="income"
            stackId="tax"
            name="Income Tax"
            fill="hsl(var(--chart-1))"
          />
          <Bar
            dataKey="cgt"
            stackId="tax"
            name="Capital Gains Tax"
            fill="hsl(var(--chart-2))"
          />
          <Bar
            dataKey="dividend"
            stackId="tax"
            name="Dividend Tax"
            fill="hsl(var(--chart-3))"
          />
          <Bar
            dataKey="interest"
            stackId="tax"
            name="Interest Tax"
            fill="hsl(var(--chart-4))"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
