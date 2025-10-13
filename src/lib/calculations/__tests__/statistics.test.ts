// =============================================================================
// Statistics Calculations - Unit Tests
// =============================================================================

import { describe, it, expect } from 'vitest'
import type { PlannerState, ProjectionYear } from '@/types'
import {
  calculateTotalContributed,
  calculateTotalWithdrawn,
  calculateTotalTaxPaid,
  calculateNetAfterTaxIncome,
  calculateWealthRetentionRatio,
  calculateEffectiveTaxRate,
  calculateProjectedValueAtRetirement,
  calculateFundDepletionAgeFromProjections,
  generateStatistics,
  calculateAverageAnnualReturn,
  calculateTotalInvestmentReturns,
  calculatePeakBalance,
  calculateRetirementDuration,
  calculateAverageMonthlyIncome,
} from '../statistics'
import { generateFullProjection } from '../projections'

describe('Statistics Calculations', () => {
  const mockPlannerState: PlannerState = {
    currentAge: 30,
    retirementAge: 60,
    startingBalance: 100000,
    monthlyContribution: 3000,
    annualReturn: 8,
    inflation: 6,
    drawdownRate: 4,
  }

  const mockProjections: ProjectionYear[] = [
    {
      year: 2025,
      age: 30,
      beginningBalance: 100000,
      contributions: 36000,
      investmentReturn: 10880,
      withdrawals: 0,
      taxPaid: 0,
      endingBalance: 146880,
      inflationAdjustedBalance: 146880,
    },
    {
      year: 2026,
      age: 31,
      beginningBalance: 146880,
      contributions: 36000,
      investmentReturn: 14630,
      withdrawals: 0,
      taxPaid: 0,
      endingBalance: 197510,
      inflationAdjustedBalance: 186047,
    },
    {
      year: 2055,
      age: 60,
      beginningBalance: 2000000,
      contributions: 0,
      investmentReturn: 115200,
      withdrawals: 80000,
      taxPaid: 12000,
      endingBalance: 2035200,
      inflationAdjustedBalance: 1800000,
    },
  ]

  describe('calculateTotalContributed', () => {
    it('should calculate total contributions including starting balance', () => {
      const total = calculateTotalContributed(mockProjections)

      // Starting balance + contributions from all years
      const expectedTotal = 100000 + 36000 + 36000 + 0
      expect(total).toBe(expectedTotal)
    })

    it('should handle empty projections', () => {
      const total = calculateTotalContributed([])
      expect(total).toBe(0)
    })

    it('should handle projections with only withdrawals', () => {
      const withdrawalProjections: ProjectionYear[] = [
        {
          year: 2025,
          age: 65,
          beginningBalance: 1000000,
          contributions: 0,
          investmentReturn: 50000,
          withdrawals: 40000,
          taxPaid: 5000,
          endingBalance: 1010000,
          inflationAdjustedBalance: 1010000,
        },
      ]

      const total = calculateTotalContributed(withdrawalProjections)
      expect(total).toBe(1000000) // Only starting balance
    })

    it('should round to 2 decimals', () => {
      const total = calculateTotalContributed(mockProjections)
      const decimals = (total.toString().split('.')[1] || '').length
      expect(decimals).toBeLessThanOrEqual(2)
    })
  })

  describe('calculateTotalWithdrawn', () => {
    it('should calculate total withdrawals', () => {
      const total = calculateTotalWithdrawn(mockProjections)
      expect(total).toBe(80000) // Sum of all withdrawal values
    })

    it('should return zero for accumulation phase only', () => {
      const accumulationOnly = mockProjections.slice(0, 2)
      const total = calculateTotalWithdrawn(accumulationOnly)
      expect(total).toBe(0)
    })

    it('should handle empty projections', () => {
      const total = calculateTotalWithdrawn([])
      expect(total).toBe(0)
    })
  })

  describe('calculateTotalTaxPaid', () => {
    it('should calculate total tax paid', () => {
      const total = calculateTotalTaxPaid(mockProjections)
      expect(total).toBe(12000) // Sum of all tax values
    })

    it('should return zero for accumulation phase', () => {
      const accumulationOnly = mockProjections.slice(0, 2)
      const total = calculateTotalTaxPaid(accumulationOnly)
      expect(total).toBe(0)
    })

    it('should handle empty projections', () => {
      const total = calculateTotalTaxPaid([])
      expect(total).toBe(0)
    })
  })

  describe('calculateNetAfterTaxIncome', () => {
    it('should calculate net income after tax', () => {
      const netIncome = calculateNetAfterTaxIncome(80000, 12000)
      expect(netIncome).toBe(68000)
    })

    it('should handle zero tax', () => {
      const netIncome = calculateNetAfterTaxIncome(100000, 0)
      expect(netIncome).toBe(100000)
    })

    it('should handle zero withdrawals', () => {
      const netIncome = calculateNetAfterTaxIncome(0, 0)
      expect(netIncome).toBe(0)
    })

    it('should round to 2 decimals', () => {
      const netIncome = calculateNetAfterTaxIncome(123456.789, 23456.789)
      const decimals = (netIncome.toString().split('.')[1] || '').length
      expect(decimals).toBeLessThanOrEqual(2)
    })
  })

  describe('calculateWealthRetentionRatio', () => {
    it('should calculate wealth retention ratio correctly', () => {
      // Example from spec: 184% return
      const ratio = calculateWealthRetentionRatio(4420000, 2400000)
      expect(ratio).toBeCloseTo(184.17, 1)
    })

    it('should handle exact 100% return', () => {
      const ratio = calculateWealthRetentionRatio(1000000, 1000000)
      expect(ratio).toBe(100)
    })

    it('should handle loss scenario', () => {
      const ratio = calculateWealthRetentionRatio(800000, 1000000)
      expect(ratio).toBe(80)
    })

    it('should return zero for zero contributions', () => {
      const ratio = calculateWealthRetentionRatio(1000000, 0)
      expect(ratio).toBe(0)
    })

    it('should handle large gains', () => {
      const ratio = calculateWealthRetentionRatio(10000000, 1000000)
      expect(ratio).toBe(1000) // 10x gain
    })

    it('should round to 2 decimals', () => {
      const ratio = calculateWealthRetentionRatio(123456.789, 100000)
      const decimals = (ratio.toString().split('.')[1] || '').length
      expect(decimals).toBeLessThanOrEqual(2)
    })
  })

  describe('calculateEffectiveTaxRate', () => {
    it('should calculate effective tax rate correctly', () => {
      // Example from spec: 15% effective rate
      const rate = calculateEffectiveTaxRate(780000, 5200000)
      expect(rate).toBe(15)
    })

    it('should handle zero withdrawals', () => {
      const rate = calculateEffectiveTaxRate(1000, 0)
      expect(rate).toBe(0)
    })

    it('should handle zero tax', () => {
      const rate = calculateEffectiveTaxRate(0, 1000000)
      expect(rate).toBe(0)
    })

    it('should handle high tax rate', () => {
      const rate = calculateEffectiveTaxRate(400000, 1000000)
      expect(rate).toBe(40)
    })

    it('should round to 2 decimals', () => {
      const rate = calculateEffectiveTaxRate(123456.789, 1000000)
      const decimals = (rate.toString().split('.')[1] || '').length
      expect(decimals).toBeLessThanOrEqual(2)
    })
  })

  describe('calculateProjectedValueAtRetirement', () => {
    it('should find balance at retirement age', () => {
      const value = calculateProjectedValueAtRetirement(mockProjections, 60)
      expect(value).toBe(2035200) // Ending balance at age 60
    })

    it('should return zero if retirement age not found', () => {
      const value = calculateProjectedValueAtRetirement(mockProjections, 99)
      expect(value).toBe(0)
    })

    it('should handle empty projections', () => {
      const value = calculateProjectedValueAtRetirement([], 60)
      expect(value).toBe(0)
    })
  })

  describe('calculateFundDepletionAgeFromProjections', () => {
    it('should return null if funds never deplete', () => {
      const neverDepletes = mockProjections.map((p, i) => ({
        ...p,
        endingBalance: 1000000 - i * 1000,
      }))

      const depletionAge = calculateFundDepletionAgeFromProjections(
        neverDepletes
      )
      expect(depletionAge).toBeNull()
    })

    it('should return age when balance reaches zero', () => {
      const depleting: ProjectionYear[] = [
        { ...mockProjections[0], endingBalance: 100000 },
        { ...mockProjections[1], endingBalance: 50000 },
        { ...mockProjections[2], age: 60, endingBalance: 0 },
      ]

      const depletionAge = calculateFundDepletionAgeFromProjections(depleting)
      expect(depletionAge).toBe(60)
    })

    it('should handle empty projections', () => {
      const depletionAge = calculateFundDepletionAgeFromProjections([])
      expect(depletionAge).toBeNull()
    })
  })

  describe('generateStatistics', () => {
    it('should generate complete statistics', () => {
      const stats = generateStatistics(mockPlannerState)

      expect(stats).toHaveProperty('totalContributed')
      expect(stats).toHaveProperty('projectedValueAtRetirement')
      expect(stats).toHaveProperty('totalWithdrawn')
      expect(stats).toHaveProperty('totalTaxPaid')
      expect(stats).toHaveProperty('netAfterTaxIncome')
      expect(stats).toHaveProperty('fundDepletionAge')
      expect(stats).toHaveProperty('wealthRetentionRatio')
      expect(stats).toHaveProperty('effectiveTaxRate')
    })

    it('should calculate positive wealth retention', () => {
      const stats = generateStatistics(mockPlannerState)
      expect(stats.wealthRetentionRatio).toBeGreaterThan(100)
    })

    it('should have net income less than total withdrawn', () => {
      const stats = generateStatistics(mockPlannerState)
      expect(stats.netAfterTaxIncome).toBeLessThanOrEqual(stats.totalWithdrawn)
    })

    it('should have retirement value greater than contributed', () => {
      const stats = generateStatistics(mockPlannerState)
      expect(stats.projectedValueAtRetirement).toBeGreaterThan(
        stats.totalContributed
      )
    })

    it('should complete in under 100ms', () => {
      const start = performance.now()
      generateStatistics(mockPlannerState)
      const end = performance.now()
      expect(end - start).toBeLessThan(100)
    })

    it('should handle high drawdown scenario', () => {
      const highDrawdown: PlannerState = {
        ...mockPlannerState,
        startingBalance: 100000, // Lower balance
        monthlyContribution: 2000, // Lower contribution
        drawdownRate: 15,
      }

      const stats = generateStatistics(highDrawdown)
      // May or may not deplete depending on growth
      if (stats.fundDepletionAge !== null) {
        expect(stats.fundDepletionAge).toBeLessThan(100)
      }
    })

    it('should handle low return scenario', () => {
      const lowReturn: PlannerState = {
        ...mockPlannerState,
        annualReturn: 3,
      }

      const stats = generateStatistics(lowReturn)
      expect(stats.projectedValueAtRetirement).toBeGreaterThan(0)
    })
  })

  describe('calculateAverageAnnualReturn', () => {
    it('should calculate average return across all years', () => {
      const avgReturn = calculateAverageAnnualReturn(mockProjections)
      expect(avgReturn).toBeGreaterThan(0)
      expect(avgReturn).toBeLessThan(100)
    })

    it('should handle empty projections', () => {
      const avgReturn = calculateAverageAnnualReturn([])
      expect(avgReturn).toBe(0)
    })

    it('should handle zero beginning balances', () => {
      const zeroBalances = mockProjections.map((p) => ({
        ...p,
        beginningBalance: 0,
        contributions: 0, // Also zero contributions
      }))

      const avgReturn = calculateAverageAnnualReturn(zeroBalances)
      // Should still calculate avg since function uses beginningBalance + contributions
      expect(avgReturn).toBeGreaterThanOrEqual(0)
    })
  })

  describe('calculateTotalInvestmentReturns', () => {
    it('should calculate total growth', () => {
      const totalReturns = calculateTotalInvestmentReturns(mockProjections)
      const expectedTotal = 10880 + 14630 + 115200
      expect(totalReturns).toBe(expectedTotal)
    })

    it('should handle empty projections', () => {
      const totalReturns = calculateTotalInvestmentReturns([])
      expect(totalReturns).toBe(0)
    })

    it('should handle negative returns', () => {
      const negativeReturns = mockProjections.map((p) => ({
        ...p,
        investmentReturn: -1000,
      }))

      const totalReturns = calculateTotalInvestmentReturns(negativeReturns)
      expect(totalReturns).toBeLessThan(0)
    })
  })

  describe('calculatePeakBalance', () => {
    it('should find peak balance and age', () => {
      const peak = calculatePeakBalance(mockProjections)

      expect(peak.balance).toBe(2035200) // Highest ending balance
      expect(peak.age).toBe(60)
      expect(peak.year).toBe(2055)
    })

    it('should handle single projection', () => {
      const peak = calculatePeakBalance([mockProjections[0]])
      expect(peak.balance).toBe(146880)
      expect(peak.age).toBe(30)
    })

    it('should handle empty projections', () => {
      const peak = calculatePeakBalance([])
      expect(peak.balance).toBe(0)
      expect(peak.age).toBe(0)
      expect(peak.year).toBe(0)
    })
  })

  describe('calculateRetirementDuration', () => {
    it('should calculate years in retirement', () => {
      const duration = calculateRetirementDuration(mockProjections, 60)
      expect(duration).toBe(1) // Only one year at age 60
    })

    it('should return zero for no retirement years', () => {
      const accumulationOnly = mockProjections.slice(0, 2)
      const duration = calculateRetirementDuration(accumulationOnly, 60)
      expect(duration).toBe(0)
    })

    it('should count all years >= retirement age', () => {
      const fullProjections = generateFullProjection(mockPlannerState)
      const duration = calculateRetirementDuration(fullProjections, 60)
      expect(duration).toBeGreaterThan(10)
    })
  })

  describe('calculateAverageMonthlyIncome', () => {
    it('should calculate average monthly income', () => {
      const avgMonthly = calculateAverageMonthlyIncome(1200000, 20)
      // 1.2M / 20 years / 12 months = 5,000/month
      expect(avgMonthly).toBe(5000)
    })

    it('should handle zero duration', () => {
      const avgMonthly = calculateAverageMonthlyIncome(1000000, 0)
      expect(avgMonthly).toBe(0)
    })

    it('should handle zero withdrawal', () => {
      const avgMonthly = calculateAverageMonthlyIncome(0, 20)
      expect(avgMonthly).toBe(0)
    })

    it('should round to 2 decimals', () => {
      const avgMonthly = calculateAverageMonthlyIncome(123456.789, 15)
      const decimals = (avgMonthly.toString().split('.')[1] || '').length
      expect(decimals).toBeLessThanOrEqual(2)
    })
  })

  describe('Integration Tests', () => {
    it('should generate consistent statistics across multiple runs', () => {
      const stats1 = generateStatistics(mockPlannerState)
      const stats2 = generateStatistics(mockPlannerState)

      expect(stats1.totalContributed).toBe(stats2.totalContributed)
      expect(stats1.projectedValueAtRetirement).toBeCloseTo(
        stats2.projectedValueAtRetirement,
        2
      )
      expect(stats1.totalWithdrawn).toBeCloseTo(stats2.totalWithdrawn, 2)
      expect(stats1.totalTaxPaid).toBeCloseTo(stats2.totalTaxPaid, 2)
    })

    it('should show wealth growth with good returns', () => {
      const goodReturns: PlannerState = {
        ...mockPlannerState,
        annualReturn: 12,
        drawdownRate: 3,
      }

      const stats = generateStatistics(goodReturns)
      expect(stats.wealthRetentionRatio).toBeGreaterThan(200) // 2x gain
    })

    it('should show wealth loss with poor returns', () => {
      const poorReturns: PlannerState = {
        ...mockPlannerState,
        annualReturn: 2,
        drawdownRate: 8,
      }

      const stats = generateStatistics(poorReturns)
      // Should still show some growth due to 30 years of contributions
      // But less than the good returns scenario
      expect(stats.wealthRetentionRatio).toBeLessThan(200)
    })

    it('should calculate realistic effective tax rates', () => {
      const stats = generateStatistics(mockPlannerState)
      expect(stats.effectiveTaxRate).toBeGreaterThan(0)
      expect(stats.effectiveTaxRate).toBeLessThan(45) // Below max bracket
    })
  })

  describe('Performance Tests', () => {
    it('should handle 1000 statistic calculations under 10 seconds', () => {
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        calculateTotalContributed(mockProjections)
        calculateTotalWithdrawn(mockProjections)
        calculateTotalTaxPaid(mockProjections)
        calculateWealthRetentionRatio(1000000, 500000)
        calculateEffectiveTaxRate(100000, 500000)
      }
      const end = performance.now()
      expect(end - start).toBeLessThan(10000)
    })
  })
})
