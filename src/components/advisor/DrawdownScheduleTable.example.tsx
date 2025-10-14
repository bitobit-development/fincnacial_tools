/**
 * Example usage of DrawdownScheduleTable component
 *
 * This file demonstrates how to integrate the DrawdownScheduleTable
 * into your application with different scenarios.
 */

import { DrawdownScheduleTable } from "./DrawdownScheduleTable"

// =============================================================================
// Example 1: Basic Usage - Standard Retirement Plan
// =============================================================================

export const BasicExample = () => {
  return (
    <DrawdownScheduleTable
      retirementAge={65}
      currentAge={40}
      lifeExpectancy={85}
      initialBalance={2000000}
      annualWithdrawal={120000}
      annualReturn={0.07}
      inflationRate={0.06}
    />
  )
}

// =============================================================================
// Example 2: Conservative Plan - Lower Withdrawal, Higher Return
// =============================================================================

export const ConservativeExample = () => {
  return (
    <DrawdownScheduleTable
      retirementAge={65}
      currentAge={45}
      lifeExpectancy={90}
      initialBalance={3000000}
      annualWithdrawal={100000}
      annualReturn={0.08}
      inflationRate={0.05}
    />
  )
}

// =============================================================================
// Example 3: Aggressive Plan - Higher Withdrawal, Risk of Depletion
// =============================================================================

export const AggressiveExample = () => {
  return (
    <DrawdownScheduleTable
      retirementAge={60}
      currentAge={35}
      lifeExpectancy={85}
      initialBalance={1500000}
      annualWithdrawal={150000}
      annualReturn={0.06}
      inflationRate={0.07}
    />
  )
}

// =============================================================================
// Example 4: Dynamic Props from Form State
// =============================================================================

interface PlannerFormData {
  retirementAge: number
  currentAge: number
  lifeExpectancy?: number
  currentSavings: number
  desiredMonthlyIncome: number
  expectedReturn: number
  expectedInflation: number
}

export const DynamicExample = ({ formData }: { formData: PlannerFormData }) => {
  // Convert monthly income to annual withdrawal
  const annualWithdrawal = formData.desiredMonthlyIncome * 12

  return (
    <DrawdownScheduleTable
      retirementAge={formData.retirementAge}
      currentAge={formData.currentAge}
      lifeExpectancy={formData.lifeExpectancy}
      initialBalance={formData.currentSavings}
      annualWithdrawal={annualWithdrawal}
      annualReturn={formData.expectedReturn / 100}
      inflationRate={formData.expectedInflation / 100}
      className="mt-8"
    />
  )
}

// =============================================================================
// Example 5: Multiple Scenarios Side-by-Side Comparison
// =============================================================================

export const ComparisonExample = () => {
  const baseProps = {
    retirementAge: 65,
    currentAge: 40,
    lifeExpectancy: 85,
    initialBalance: 2000000,
    annualReturn: 0.07,
    inflationRate: 0.06,
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
        <h2 className="text-lg font-semibold mb-4">Scenario A: R100k/year</h2>
        <DrawdownScheduleTable
          {...baseProps}
          annualWithdrawal={100000}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Scenario B: R150k/year</h2>
        <DrawdownScheduleTable
          {...baseProps}
          annualWithdrawal={150000}
        />
      </div>
    </div>
  )
}

// =============================================================================
// Example 6: Integration with AI Advisor Response
// =============================================================================

interface AdvisorRecommendation {
  recommendedWithdrawal: number
  projectedBalance: number
  assumedReturn: number
  assumedInflation: number
}

export const AdvisorIntegrationExample = ({
  recommendation,
  userProfile,
}: {
  recommendation: AdvisorRecommendation
  userProfile: { age: number; retirementAge: number; lifeExpectancy?: number }
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">AI Recommendation</h3>
        <p className="text-sm text-muted-foreground">
          Based on your profile, we recommend an annual withdrawal of{" "}
          <span className="font-semibold">
            R {recommendation.recommendedWithdrawal.toLocaleString()}
          </span>
          {" "}with these assumptions:
        </p>
        <ul className="mt-2 text-sm space-y-1">
          <li>Annual Return: {(recommendation.assumedReturn * 100).toFixed(1)}%</li>
          <li>Inflation: {(recommendation.assumedInflation * 100).toFixed(1)}%</li>
        </ul>
      </div>

      <DrawdownScheduleTable
        retirementAge={userProfile.retirementAge}
        currentAge={userProfile.age}
        lifeExpectancy={userProfile.lifeExpectancy}
        initialBalance={recommendation.projectedBalance}
        annualWithdrawal={recommendation.recommendedWithdrawal}
        annualReturn={recommendation.assumedReturn}
        inflationRate={recommendation.assumedInflation}
      />
    </div>
  )
}
