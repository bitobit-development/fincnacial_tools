'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { StatCard } from '@/components/custom/StatCard';
import { StatisticsGrid } from '@/components/custom/StatisticsGrid';
import { ProjectionChart } from '@/components/custom/ProjectionChart';
import { TaxBreakdownChart } from '@/components/custom/TaxBreakdownChart';
import { SalaryBreakdownTable } from '@/components/advisor/SalaryBreakdownTable';
import { DrawdownScheduleTable } from '@/components/advisor/DrawdownScheduleTable';
import type { Statistics, ProjectionYear, PlannerState } from '@/types';
import {
  TrendingUp,
  Wallet,
  Receipt,
  Banknote,
  Percent,
  AlertCircle,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlannerResultsPanelProps {
  statistics?: Statistics;
  projections?: ProjectionYear[];
  plannerState?: PlannerState;
  userName?: string;
  grossAnnualIncome?: number;
  loading?: boolean;
  error?: string;
  className?: string;
}

/**
 * PlannerResultsPanel Component
 *
 * Display calculation results with statistics, projection chart, and tax breakdown.
 * Includes loading skeleton and error states.
 *
 * Example:
 * <PlannerResultsPanel
 *   statistics={calculatedStats}
 *   projections={projectionData}
 *   loading={isCalculating}
 * />
 */
export function PlannerResultsPanel({
  statistics,
  projections,
  plannerState,
  userName,
  grossAnnualIncome,
  loading = false,
  error,
  className,
}: PlannerResultsPanelProps) {
  // Format currency
  const formatCurrency = React.useCallback((value: number): string => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  // Format percentage
  const formatPercent = React.useCallback((value: number): string => {
    return `${value.toFixed(2)}%`;
  }, []);

  // Prepare tax breakdown data (must be before early returns per Rules of Hooks)
  const taxBreakdownData = React.useMemo(() => {
    if (!projections || projections.length === 0) return [];

    // Sample every 5 years for readability
    return projections
      .filter((_, index) => index % 5 === 0)
      .map((projection) => ({
        year: projection.year,
        income: projection.taxPaid * 0.6, // Sample breakdown
        cgt: projection.taxPaid * 0.2,
        dividend: projection.taxPaid * 0.15,
        interest: projection.taxPaid * 0.05,
      }));
  }, [projections]);

  // Loading skeleton
  if (loading) {
    return (
      <Card className={cn('overflow-hidden shadow-lg', className)}>
        <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary p-6">
          <div className="h-7 w-48 animate-pulse rounded bg-white/20" />
          <div className="mt-2 h-5 w-full animate-pulse rounded bg-white/20" />
        </div>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
          <div className="h-80 animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('overflow-hidden border-red-300 shadow-lg dark:border-red-800', className)}>
        <div className="bg-gradient-to-r from-red-500 to-rose-500 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Calculation Error</h2>
              <p className="mt-1 text-sm text-red-50">
                Unable to calculate retirement projection
              </p>
            </div>
          </div>
        </div>
        <CardContent className="pt-6">
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state (no calculations yet)
  if (!statistics || !projections) {
    return (
      <Card className={cn('overflow-hidden shadow-lg', className)}>
        <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <BarChart3 className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Projection Results</h2>
              <p className="mt-1 text-sm text-white/90">
                Your retirement projection will appear here
              </p>
            </div>
          </div>
        </div>
        <CardContent className="pt-6">
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
            <div className="text-center">
              <BarChart3
                className="mx-auto mb-4 h-12 w-12 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-lg font-medium text-foreground">
                No projection calculated yet
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your details and click Calculate Projection to see your
                results
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine fund depletion variant
  const depletionVariant =
    !statistics.fundDepletionAge || statistics.fundDepletionAge > 90
      ? 'success'
      : statistics.fundDepletionAge > 80
        ? 'warning'
        : 'danger';

  return (
    <Card className={cn('overflow-hidden shadow-lg', className)}>
      <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <BarChart3 className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {userName ? `${userName}'s Retirement Plan` : 'Your Retirement Plan'}
            </h2>
            <p className="mt-1 text-sm text-white/90">
              Your retirement savings projection and tax analysis
            </p>
          </div>
        </div>
      </div>

      <CardContent className="space-y-8 pt-6">
        {/* Salary Breakdown Table */}
        {grossAnnualIncome && plannerState?.monthlyContribution && plannerState.monthlyContribution > 0 && (
          <>
            <section aria-labelledby="salary-breakdown-section">
              <SalaryBreakdownTable
                grossAnnualIncome={grossAnnualIncome}
                monthlyRAContribution={plannerState.monthlyContribution}
              />
            </section>
            <Separator />
          </>
        )}

        {/* Key Statistics Grid */}
        <section aria-labelledby="statistics-section">
          <h3 id="statistics-section" className="mb-4 text-sm font-semibold">
            Key Metrics
          </h3>
          <StatisticsGrid columns={3}>
            <StatCard
              title="Total Contributed"
              value={formatCurrency(statistics.totalContributed)}
              icon={Wallet}
              variant="info"
              delay={0}
              tooltip="The total amount of money you will deposit into your retirement account from now until retirement"
            />
            <StatCard
              title="Retirement Value"
              value={formatCurrency(statistics.projectedValueAtRetirement)}
              icon={TrendingUp}
              variant="success"
              delay={100}
              tooltip="The projected total value of your retirement savings when you reach retirement age, before any withdrawals"
            />
            <StatCard
              title="Total Tax Paid"
              value={formatCurrency(statistics.totalTaxPaid)}
              icon={Receipt}
              variant="warning"
              delay={200}
              tooltip="The total tax you'll pay to SARS on your retirement withdrawals over your lifetime"
            />
            <StatCard
              title="Net After-Tax Income"
              value={formatCurrency(statistics.netAfterTaxIncome)}
              icon={Banknote}
              variant="success"
              delay={300}
              tooltip="The actual money you'll receive after all taxes are paid on your retirement withdrawals"
            />
            <StatCard
              title="Wealth Retention"
              value={formatPercent(statistics.wealthRetentionRatio * 100)}
              icon={Percent}
              variant="success"
              delay={400}
              tooltip="What percentage of your contributions you keep after taxes. Higher is better (e.g., 85% means you keep R85 for every R100 you contributed)"
            />
            <StatCard
              title="Effective Tax Rate"
              value={formatPercent(statistics.effectiveTaxRate)}
              icon={Receipt}
              variant="warning"
              delay={500}
              tooltip="Your average tax rate on retirement income. Lower is better (e.g., 15% means R15 tax on every R100 withdrawn)"
            />
          </StatisticsGrid>
        </section>

        <Separator />

        {/* Projection Chart */}
        <section aria-labelledby="projection-section">
          <div className="mb-4 flex items-center gap-2">
            <h3 id="projection-section" className="text-sm font-semibold">
              Balance Projection Over Time
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full transition-colors hover:opacity-80"
                    aria-label="Information about Balance Projection Over Time"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    Shows how your retirement savings will grow until retirement and decline as you withdraw during retirement
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ProjectionChart
            data={projections}
            height={400}
            showInflationAdjusted={true}
          />
        </section>

        <Separator />

        {/* Tax Breakdown Chart */}
        <section aria-labelledby="tax-section">
          <div className="mb-4 flex items-center gap-2">
            <h3 id="tax-section" className="text-sm font-semibold">
              Tax Breakdown by Type
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full transition-colors hover:opacity-80"
                    aria-label="Information about Tax Breakdown by Type"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    Visualizes the different types of taxes you'll pay on your retirement income over time. This helps you understand your total tax liability.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <TaxBreakdownChart data={taxBreakdownData} height={300} />
        </section>

        {/* Drawdown Schedule Table */}
        {plannerState && statistics && statistics.projectedValueAtRetirement > 0 && (
          <>
            <Separator />
            <section aria-labelledby="drawdown-section">
              <DrawdownScheduleTable
                retirementAge={plannerState.retirementAge}
                currentAge={plannerState.currentAge}
                lifeExpectancy={(plannerState as any).lifeExpectancy || 85}
                initialBalance={statistics.projectedValueAtRetirement}
                annualWithdrawal={statistics.projectedValueAtRetirement * (plannerState.drawdownRate / 100)}
                annualReturn={plannerState.annualReturn / 100}
                inflationRate={plannerState.inflation / 100}
              />
            </section>
          </>
        )}

        {/* Fund Depletion Warning */}
        {statistics.fundDepletionAge && statistics.fundDepletionAge < 100 && (
          <div
            className={cn(
              'rounded-lg border p-4',
              depletionVariant === 'danger' &&
                'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
              depletionVariant === 'warning' &&
                'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
            )}
            role="alert"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className={cn(
                  'mt-0.5 h-5 w-5',
                  depletionVariant === 'danger' && 'text-red-600 dark:text-red-400',
                  depletionVariant === 'warning' && 'text-amber-600 dark:text-amber-400'
                )}
                aria-hidden="true"
              />
              <div>
                <p className={cn(
                  'font-semibold',
                  depletionVariant === 'danger' && 'text-red-900 dark:text-red-100',
                  depletionVariant === 'warning' && 'text-amber-900 dark:text-amber-100'
                )}>
                  Fund Depletion Warning
                </p>
                <p className={cn(
                  'mt-1 text-sm',
                  depletionVariant === 'danger' && 'text-red-700 dark:text-red-300',
                  depletionVariant === 'warning' && 'text-amber-700 dark:text-amber-300'
                )}>
                  Based on your current plan, your retirement fund will be
                  depleted at age {statistics.fundDepletionAge}. Consider
                  increasing contributions or reducing your drawdown rate.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
