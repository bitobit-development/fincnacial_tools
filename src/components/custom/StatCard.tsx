'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, LucideIcon, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  change?: {
    value: number;
    label: string;
  };
  formatValue?: (value: number) => string;
  delay?: number;
  className?: string;
  tooltip?: string;
}

/**
 * StatCard Component
 *
 * Display metric with icon, title, value, and optional change indicator.
 * Supports multiple variants with color-coding and smooth animations.
 *
 * Example:
 * <StatCard
 *   title="Total Contributed"
 *   value="R 2,400,000"
 *   icon={Wallet}
 *   variant="info"
 *   delay={0}
 * />
 *
 * <StatCard
 *   title="Retirement Value"
 *   value="R 5,200,000"
 *   icon={TrendingUp}
 *   variant="success"
 *   delay={100}
 * />
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  variant = 'default',
  change,
  formatValue,
  delay = 0,
  className,
  tooltip,
}: StatCardProps) {
  // Format value if formatter provided
  const displayValue = React.useMemo(() => {
    if (typeof value === 'number' && formatValue) {
      return formatValue(value);
    }
    return value;
  }, [value, formatValue]);

  // Variant styles with refined color palette
  const variantStyles = {
    default: {
      card: 'border-orange-200/60 dark:border-orange-800/40 bg-gradient-to-br from-orange-50/50 to-amber-50/30 dark:from-orange-950/20 dark:to-amber-950/10',
      icon: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      value: 'text-orange-900 dark:text-orange-100',
      title: 'text-orange-700 dark:text-orange-300',
      hover: 'from-orange-600 to-amber-600',
    },
    success: {
      card: 'border-emerald-200/60 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10',
      icon: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      value: 'text-emerald-900 dark:text-emerald-100',
      title: 'text-emerald-700 dark:text-emerald-300',
      hover: 'from-emerald-600 to-teal-600',
    },
    info: {
      card: 'border-blue-200/60 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 dark:from-blue-950/20 dark:to-cyan-950/10',
      icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      value: 'text-blue-900 dark:text-blue-100',
      title: 'text-blue-700 dark:text-blue-300',
      hover: 'from-blue-600 to-cyan-600',
    },
    warning: {
      card: 'border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-br from-amber-50/50 to-yellow-50/30 dark:from-amber-950/20 dark:to-yellow-950/10',
      icon: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      value: 'text-amber-900 dark:text-amber-100',
      title: 'text-amber-700 dark:text-amber-300',
      hover: 'from-amber-600 to-yellow-600',
    },
    danger: {
      card: 'border-red-200/60 dark:border-red-800/40 bg-gradient-to-br from-red-50/50 to-rose-50/30 dark:from-red-950/20 dark:to-rose-950/10',
      icon: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      value: 'text-red-900 dark:text-red-100',
      title: 'text-red-700 dark:text-red-300',
      hover: 'from-red-600 to-rose-600',
    },
  };

  const styles = variantStyles[variant];

  // Change indicator
  const isPositiveChange = change && change.value > 0;
  const isNegativeChange = change && change.value < 0;

  return (
    <Card
      className={cn(
        'group relative overflow-hidden',
        'transition-all duration-300 ease-out',
        'hover:shadow-xl hover:-translate-y-1',
        'animate-in fade-in-0 slide-in-from-bottom-4 duration-700',
        styles.card,
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Background gradient overlay for hover effect */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500',
          styles.hover
        )}
      />

      <CardContent className="relative p-6">
        {/* Header with title and icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 flex items-center gap-1.5">
            <p
              className={cn(
                'text-xs font-semibold uppercase tracking-wider',
                styles.title
              )}
            >
              {title}
            </p>
            {/* Tooltip icon */}
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'inline-flex items-center justify-center rounded-full',
                        'transition-colors hover:opacity-80',
                        styles.title
                      )}
                      aria-label={`Information about ${title}`}
                    >
                      <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Icon container */}
          {Icon && (
            <div className="ml-3 flex-shrink-0">
              <div
                className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center',
                  'transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6',
                  styles.icon
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          )}
        </div>

        {/* Value - separate line with better spacing */}
        <div className="space-y-1">
          <div
            className={cn(
              'text-2xl sm:text-3xl font-bold tracking-tight',
              'animate-count-up',
              styles.value
            )}
          >
            {displayValue}
          </div>

          {/* Change indicator if exists */}
          {change && (
            <div className="flex items-center gap-1 text-xs font-medium pt-1">
              {isPositiveChange && (
                <ArrowUp
                  className="h-3 w-3 text-green-600 dark:text-green-400"
                  aria-hidden="true"
                />
              )}
              {isNegativeChange && (
                <ArrowDown
                  className="h-3 w-3 text-red-600 dark:text-red-400"
                  aria-hidden="true"
                />
              )}
              <span
                className={cn(
                  'font-semibold',
                  isPositiveChange && 'text-green-600 dark:text-green-400',
                  isNegativeChange && 'text-red-600 dark:text-red-400'
                )}
              >
                {Math.abs(change.value)}
              </span>
              <span className="text-muted-foreground">{change.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
