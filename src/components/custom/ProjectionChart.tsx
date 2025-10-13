'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import type { ProjectionYear } from '@/types';
import { cn } from '@/lib/utils';

interface ProjectionChartProps {
  data: ProjectionYear[];
  height?: number;
  showInflationAdjusted?: boolean;
  className?: string;
}

/**
 * ProjectionChart Component
 *
 * Recharts LineChart with two lines: nominal balance + inflation-adjusted balance.
 * Handles 60+ data points smoothly with responsive container.
 *
 * Example:
 * <ProjectionChart
 *   data={projectionData}
 *   height={400}
 *   showInflationAdjusted={true}
 * />
 */
export function ProjectionChart({
  data,
  height = 400,
  showInflationAdjusted = true,
  className,
}: ProjectionChartProps) {
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

      const age = label;
      const nominalBalance = payload[0]?.value ?? 0;
      const inflationAdjustedBalance = payload[1]?.value ?? 0;

      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="mb-2 font-semibold">Age: {age}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: 'hsl(var(--chart-1))' }}
                  aria-hidden="true"
                />
                Nominal Balance:
              </span>
              <span className="font-semibold">
                {formatCurrency(nominalBalance as number)}
              </span>
            </div>
            {showInflationAdjusted && (
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-sm">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: 'hsl(var(--chart-2))' }}
                    aria-hidden="true"
                  />
                  Real Balance:
                </span>
                <span className="font-semibold">
                  {formatCurrency(inflationAdjustedBalance as number)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    },
    [showInflationAdjusted, formatCurrency]
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
          No projection data available. Please enter your details to generate a
          projection.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-muted"
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="age"
            label={{
              value: 'Age',
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
              value: 'Balance',
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
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="endingBalance"
            name="Nominal Balance"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          {showInflationAdjusted && (
            <Line
              type="monotone"
              dataKey="inflationAdjustedBalance"
              name="Real Balance (Today's Rand)"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
