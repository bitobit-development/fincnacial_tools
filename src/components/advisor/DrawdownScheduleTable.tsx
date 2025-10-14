"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { calculateIncomeTax } from "@/lib/calculations/tax"
import { cn } from "@/lib/utils"

// =============================================================================
// Types
// =============================================================================

interface DrawdownScheduleTableProps {
  retirementAge: number
  currentAge: number
  lifeExpectancy?: number
  initialBalance: number
  annualWithdrawal: number
  annualReturn: number
  inflationRate: number
  className?: string
}

interface DrawdownRow {
  year: number
  age: number
  beginningBalance: number
  withdrawalAmount: number
  taxPaid: number
  netIncome: number
  investmentReturn: number
  endingBalance: number
}

interface DrawdownSummary {
  totalWithdrawals: number
  totalTaxPaid: number
  totalNetIncome: number
  totalInvestmentReturn: number
  finalBalance: number
  yearsUntilDepletion: number | null
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format currency with R prefix and thousands separators
 */
const formatCurrency = (amount: number): string => {
  const absAmount = Math.abs(amount)
  const formatted = new Intl.NumberFormat("en-ZA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount)

  return amount < 0 ? `-R ${formatted}` : `R ${formatted}`
}

/**
 * Calculate drawdown schedule for all retirement years
 */
const calculateDrawdownSchedule = (
  retirementAge: number,
  lifeExpectancy: number,
  initialBalance: number,
  annualWithdrawal: number,
  annualReturn: number,
  inflationRate: number
): DrawdownRow[] => {
  const schedule: DrawdownRow[] = []
  let currentBalance = initialBalance
  let currentWithdrawal = annualWithdrawal
  let year = 1
  let age = retirementAge

  while (age <= lifeExpectancy && currentBalance > 0) {
    const beginningBalance = currentBalance

    // Adjust withdrawal for inflation (compound)
    if (year > 1) {
      currentWithdrawal = currentWithdrawal * (1 + inflationRate)
    }

    // Cap withdrawal at remaining balance
    const actualWithdrawal = Math.min(currentWithdrawal, beginningBalance)

    // Calculate tax on withdrawal (treated as income)
    const taxPaid = calculateIncomeTax(actualWithdrawal, age)

    // Net income after tax
    const netIncome = actualWithdrawal - taxPaid

    // Calculate investment return on remaining balance after withdrawal
    const balanceAfterWithdrawal = beginningBalance - actualWithdrawal
    const investmentReturn = balanceAfterWithdrawal * annualReturn

    // Ending balance
    const endingBalance = Math.max(0, balanceAfterWithdrawal + investmentReturn)

    schedule.push({
      year,
      age,
      beginningBalance,
      withdrawalAmount: actualWithdrawal,
      taxPaid,
      netIncome,
      investmentReturn,
      endingBalance,
    })

    // Move to next year
    currentBalance = endingBalance
    year++
    age++

    // Safety check: prevent infinite loops
    if (year > 100) break
  }

  return schedule
}

/**
 * Calculate summary statistics
 */
const calculateSummary = (schedule: DrawdownRow[]): DrawdownSummary => {
  const totalWithdrawals = schedule.reduce(
    (sum, row) => sum + row.withdrawalAmount,
    0
  )
  const totalTaxPaid = schedule.reduce((sum, row) => sum + row.taxPaid, 0)
  const totalNetIncome = schedule.reduce((sum, row) => sum + row.netIncome, 0)
  const totalInvestmentReturn = schedule.reduce(
    (sum, row) => sum + row.investmentReturn,
    0
  )
  const finalBalance = schedule[schedule.length - 1]?.endingBalance ?? 0

  // Find year when balance reaches zero
  const depletionIndex = schedule.findIndex((row) => row.endingBalance === 0)
  const yearsUntilDepletion = depletionIndex >= 0 ? depletionIndex + 1 : null

  return {
    totalWithdrawals,
    totalTaxPaid,
    totalNetIncome,
    totalInvestmentReturn,
    finalBalance,
    yearsUntilDepletion,
  }
}

// =============================================================================
// Component
// =============================================================================

export const DrawdownScheduleTable = ({
  retirementAge,
  currentAge,
  lifeExpectancy = 85,
  initialBalance,
  annualWithdrawal,
  annualReturn,
  inflationRate,
  className,
}: DrawdownScheduleTableProps) => {
  // Memoize calculations
  const schedule = React.useMemo(
    () =>
      calculateDrawdownSchedule(
        retirementAge,
        lifeExpectancy,
        initialBalance,
        annualWithdrawal,
        annualReturn,
        inflationRate
      ),
    [
      retirementAge,
      lifeExpectancy,
      initialBalance,
      annualWithdrawal,
      annualReturn,
      inflationRate,
    ]
  )

  const summary = React.useMemo(
    () => calculateSummary(schedule),
    [schedule]
  )

  // Edge case: no schedule calculated
  if (schedule.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Retirement Drawdown Schedule</CardTitle>
          <CardDescription>
            Unable to calculate drawdown schedule. Please check your inputs.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Warning: funds depleted before life expectancy
  const fundsDepletedEarly =
    summary.yearsUntilDepletion !== null &&
    summary.yearsUntilDepletion < schedule.length

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Retirement Drawdown Schedule</CardTitle>
        <CardDescription>
          Year-by-year projection from age {retirementAge} to {lifeExpectancy}
          {fundsDepletedEarly && (
            <span className="ml-2 text-destructive font-medium" role="alert">
              Warning: Funds depleted at year {summary.yearsUntilDepletion} (age{" "}
              {retirementAge + (summary.yearsUntilDepletion ?? 0) - 1})
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {/* Scrollable table container */}
        <div
          className="relative w-full overflow-auto max-h-[600px] border-y"
          role="region"
          aria-label="Retirement drawdown schedule table"
          tabIndex={0}
        >
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="w-16 text-center">Year</TableHead>
                <TableHead className="w-16 text-center">Age</TableHead>
                <TableHead className="text-right">
                  Beginning Balance
                </TableHead>
                <TableHead className="text-right">Withdrawal</TableHead>
                <TableHead className="text-right">Tax Paid</TableHead>
                <TableHead className="text-right">Net Income</TableHead>
                <TableHead className="text-right">
                  Investment Return
                </TableHead>
                <TableHead className="text-right">Ending Balance</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {schedule.map((row) => {
                const isDepletedYear = row.endingBalance === 0
                const isLowBalance =
                  row.endingBalance > 0 &&
                  row.endingBalance < annualWithdrawal * 2

                return (
                  <TableRow
                    key={row.year}
                    className={cn(
                      isDepletedYear && "bg-destructive/10",
                      isLowBalance && "bg-warning/10"
                    )}
                  >
                    <TableCell className="text-center font-medium">
                      {row.year}
                    </TableCell>
                    <TableCell className="text-center">{row.age}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(row.beginningBalance)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(row.withdrawalAmount)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-destructive">
                      {formatCurrency(row.taxPaid)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-medium">
                      {formatCurrency(row.netIncome)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-green-600 dark:text-green-400">
                      {formatCurrency(row.investmentReturn)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono text-sm font-semibold",
                        isDepletedYear && "text-destructive",
                        isLowBalance && "text-warning"
                      )}
                    >
                      {formatCurrency(row.endingBalance)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>

            <TableFooter className="sticky bottom-0 z-10 bg-muted">
              <TableRow>
                <TableCell colSpan={3} className="font-semibold">
                  Totals
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold">
                  {formatCurrency(summary.totalWithdrawals)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold text-destructive">
                  {formatCurrency(summary.totalTaxPaid)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold">
                  {formatCurrency(summary.totalNetIncome)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(summary.totalInvestmentReturn)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold">
                  {formatCurrency(summary.finalBalance)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {/* Summary statistics */}
        <div className="p-6 space-y-2 bg-muted/30">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Summary Statistics
          </h3>
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col">
              <dt className="text-sm text-muted-foreground">
                Total Years
              </dt>
              <dd className="text-lg font-semibold">
                {schedule.length} years
              </dd>
            </div>

            <div className="flex flex-col">
              <dt className="text-sm text-muted-foreground">
                Total Withdrawals
              </dt>
              <dd className="text-lg font-semibold font-mono">
                {formatCurrency(summary.totalWithdrawals)}
              </dd>
            </div>

            <div className="flex flex-col">
              <dt className="text-sm text-muted-foreground">
                Total Tax Paid
              </dt>
              <dd className="text-lg font-semibold font-mono text-destructive">
                {formatCurrency(summary.totalTaxPaid)}
              </dd>
            </div>

            <div className="flex flex-col">
              <dt className="text-sm text-muted-foreground">
                Total Net Income
              </dt>
              <dd className="text-lg font-semibold font-mono">
                {formatCurrency(summary.totalNetIncome)}
              </dd>
            </div>

            <div className="flex flex-col">
              <dt className="text-sm text-muted-foreground">
                Total Investment Returns
              </dt>
              <dd className="text-lg font-semibold font-mono text-green-600 dark:text-green-400">
                {formatCurrency(summary.totalInvestmentReturn)}
              </dd>
            </div>

            <div className="flex flex-col">
              <dt className="text-sm text-muted-foreground">
                Final Balance at Age {lifeExpectancy}
              </dt>
              <dd
                className={cn(
                  "text-lg font-semibold font-mono",
                  summary.finalBalance === 0 && "text-destructive"
                )}
              >
                {formatCurrency(summary.finalBalance)}
              </dd>
            </div>

            <div className="flex flex-col">
              <dt className="text-sm text-muted-foreground">
                Effective Tax Rate
              </dt>
              <dd className="text-lg font-semibold">
                {summary.totalWithdrawals > 0
                  ? `${((summary.totalTaxPaid / summary.totalWithdrawals) * 100).toFixed(1)}%`
                  : "0%"}
              </dd>
            </div>

            {summary.yearsUntilDepletion !== null && (
              <div className="flex flex-col">
                <dt className="text-sm text-muted-foreground">
                  Funds Depleted
                </dt>
                <dd className="text-lg font-semibold text-destructive">
                  Year {summary.yearsUntilDepletion} (Age{" "}
                  {retirementAge + summary.yearsUntilDepletion - 1})
                </dd>
              </div>
            )}
          </dl>
        </div>
      </CardContent>
    </Card>
  )
}

DrawdownScheduleTable.displayName = "DrawdownScheduleTable"
