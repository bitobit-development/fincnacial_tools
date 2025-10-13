'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface StatisticsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

/**
 * StatisticsGrid Component
 *
 * Responsive grid layout wrapper for StatCard components.
 * Responsive: 1 col (mobile), 2 col (tablet), 3-4 col (desktop).
 * Includes improved spacing and gap management.
 *
 * Example:
 * <StatisticsGrid columns={3}>
 *   <StatCard title="Total Contributed" value="R 2,400,000" />
 *   <StatCard title="Projected Value" value="R 5,200,000" />
 *   <StatCard title="Total Tax Paid" value="R 780,000" />
 * </StatisticsGrid>
 */
export function StatisticsGrid({
  children,
  columns = 3,
  className,
}: StatisticsGridProps) {
  // Map columns to grid classes
  const gridColsClass = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'xl:grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2',
        gridColsClass[columns],
        className
      )}
    >
      {children}
    </div>
  );
}
