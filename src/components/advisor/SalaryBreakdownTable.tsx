'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Info, TrendingDown } from 'lucide-react';

interface SalaryBreakdownTableProps {
  grossAnnualIncome: number;
  monthlyRAContribution: number;
  className?: string;
}

/**
 * Calculate South African SARS income tax
 * Based on 2024/2025 tax tables
 */
const calculateSARSTax = (annualIncome: number): number => {
  // 2024/2025 SARS Tax Brackets
  if (annualIncome <= 237100) {
    return annualIncome * 0.18;
  } else if (annualIncome <= 370500) {
    return 42678 + (annualIncome - 237100) * 0.26;
  } else if (annualIncome <= 512800) {
    return 77362 + (annualIncome - 370500) * 0.31;
  } else if (annualIncome <= 673000) {
    return 121475 + (annualIncome - 512800) * 0.36;
  } else if (annualIncome <= 857900) {
    return 179147 + (annualIncome - 673000) * 0.39;
  } else if (annualIncome <= 1817000) {
    return 251258 + (annualIncome - 857900) * 0.41;
  } else {
    return 644489 + (annualIncome - 1817000) * 0.45;
  }
};

/**
 * Format currency in South African Rand
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * SalaryBreakdownTable Component
 *
 * Displays a comprehensive monthly salary breakdown showing:
 * - Gross monthly salary
 * - RA contributions
 * - Tax impact and savings
 * - Net monthly salary
 *
 * Designed for South African SARS tax system with WCAG 2.1 AA compliance.
 */
export function SalaryBreakdownTable({
  grossAnnualIncome,
  monthlyRAContribution,
  className,
}: SalaryBreakdownTableProps) {
  // Calculate monthly gross salary
  const grossMonthlySalary = grossAnnualIncome / 12;

  // Calculate annual RA contribution
  const annualRAContribution = monthlyRAContribution * 12;

  // Calculate tax without RA contribution
  const taxWithoutRA = calculateSARSTax(grossAnnualIncome);
  const monthlyTaxWithoutRA = taxWithoutRA / 12;

  // Calculate tax with RA contribution (RA contributions reduce taxable income)
  const taxableIncomeWithRA = grossAnnualIncome - annualRAContribution;
  const taxWithRA = calculateSARSTax(Math.max(0, taxableIncomeWithRA));
  const monthlyTaxWithRA = taxWithRA / 12;

  // Calculate tax savings
  const annualTaxSavings = taxWithoutRA - taxWithRA;
  const monthlyTaxSavings = annualTaxSavings / 12;

  // Calculate net salary after RA and tax
  const netMonthlySalary = grossMonthlySalary - monthlyRAContribution - monthlyTaxWithRA;

  // Calculate effective RA cost (after tax benefit)
  const effectiveRAContribution = monthlyRAContribution - monthlyTaxSavings;

  // Calculate percentage savings
  const savingsPercentage = monthlyRAContribution > 0
    ? (monthlyTaxSavings / monthlyRAContribution) * 100
    : 0;

  return (
    <TooltipProvider>
      <Card className={cn('w-full', className)}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl sm:text-2xl">Monthly Salary Breakdown</CardTitle>
          <CardDescription className="text-sm">
            Understanding your take-home pay with RA contributions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Mobile-optimized table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold text-foreground w-[50%] sm:w-auto">
                    Item
                  </TableHead>
                  <TableHead className="font-semibold text-foreground text-right">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Gross Monthly Salary */}
                <TableRow>
                  <TableCell className="font-medium py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base">Gross Monthly Salary</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label="Learn more about gross monthly salary"
                            className="inline-flex items-center justify-center rounded-full p-1 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          >
                            <Info className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" aria-hidden="true" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[250px]">
                          <p className="text-xs">
                            Your total monthly income before any deductions or contributions.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm sm:text-base py-3 sm:py-4">
                    {formatCurrency(grossMonthlySalary)}
                  </TableCell>
                </TableRow>

                {/* RA Contribution */}
                <TableRow>
                  <TableCell className="font-medium py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base">RA Contribution</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label="Learn more about RA contributions"
                            className="inline-flex items-center justify-center rounded-full p-1 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          >
                            <Info className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" aria-hidden="true" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[250px]">
                          <p className="text-xs">
                            Your monthly retirement annuity contribution, which reduces your taxable income.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm sm:text-base text-destructive py-3 sm:py-4">
                    -{formatCurrency(monthlyRAContribution)}
                  </TableCell>
                </TableRow>

                {/* Tax Savings - Highlighted Row */}
                <TableRow className="bg-accent/10 hover:bg-accent/20">
                  <TableCell className="font-medium py-3 sm:py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base">Tax Savings</span>
                      <Badge
                        variant="secondary"
                        className="text-xs gap-1 px-2 py-0"
                        aria-label={`You save ${savingsPercentage.toFixed(0)} percent on taxes`}
                      >
                        <TrendingDown className="h-3 w-3" aria-hidden="true" />
                        <span>{savingsPercentage.toFixed(0)}% saved</span>
                      </Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label="Learn more about tax savings"
                            className="inline-flex items-center justify-center rounded-full p-1 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          >
                            <Info className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" aria-hidden="true" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[300px]">
                          <p className="text-xs mb-2 font-semibold">How RA contributions reduce your tax:</p>
                          <ul className="text-xs space-y-1 list-disc list-inside">
                            <li>RA contributions reduce your taxable income</li>
                            <li>Lower taxable income means lower tax bill</li>
                            <li>You save {formatCurrency(monthlyTaxSavings)} in tax each month</li>
                            <li>Effective RA cost: {formatCurrency(effectiveRAContribution)}/month</li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-sm sm:text-base text-accent py-3 sm:py-4">
                    +{formatCurrency(monthlyTaxSavings)}
                  </TableCell>
                </TableRow>

                {/* Income Tax */}
                <TableRow>
                  <TableCell className="font-medium py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base">Income Tax (SARS)</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label="Learn more about income tax"
                            className="inline-flex items-center justify-center rounded-full p-1 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          >
                            <Info className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" aria-hidden="true" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[250px]">
                          <p className="text-xs">
                            Your monthly income tax based on current SARS tax tables, calculated on your
                            reduced taxable income (after RA contribution).
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm sm:text-base text-destructive py-3 sm:py-4">
                    -{formatCurrency(monthlyTaxWithRA)}
                  </TableCell>
                </TableRow>

                {/* Net Monthly Salary - Final Row */}
                <TableRow className="bg-primary/5 hover:bg-primary/10 border-t-2 border-primary/20">
                  <TableCell className="font-bold py-4 sm:py-5">
                    <span className="text-base sm:text-lg">Net Monthly Salary</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-base sm:text-lg text-primary py-4 sm:py-5">
                    {formatCurrency(netMonthlySalary)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Summary Card - Mobile Friendly */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-xs sm:text-sm text-muted-foreground">
                <p className="font-medium mb-1">Effective RA Cost After Tax Benefit:</p>
                <p className="text-[10px] sm:text-xs">
                  You contribute {formatCurrency(monthlyRAContribution)}/month, but save{' '}
                  {formatCurrency(monthlyTaxSavings)} in tax
                </p>
              </div>
              <div
                className="text-base sm:text-xl font-bold text-primary"
                aria-label={`Effective retirement annuity cost is ${formatCurrency(effectiveRAContribution)} per month`}
              >
                {formatCurrency(effectiveRAContribution)}/month
              </div>
            </div>
          </div>

          {/* Additional Context for Screen Readers */}
          <div className="sr-only" role="status" aria-live="polite">
            Summary: From a gross monthly salary of {formatCurrency(grossMonthlySalary)},
            you contribute {formatCurrency(monthlyRAContribution)} to your retirement annuity.
            This saves you {formatCurrency(monthlyTaxSavings)} in monthly tax,
            making your effective RA cost only {formatCurrency(effectiveRAContribution)}.
            After deducting {formatCurrency(monthlyTaxWithRA)} in income tax,
            your net monthly take-home pay is {formatCurrency(netMonthlySalary)}.
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
