// =============================================================================
// SARS Tax Calculations - Unit Tests (2025/26)
// =============================================================================

import { describe, it, expect } from 'vitest'
import {
  calculateIncomeTax,
  calculateRALumpSumTax,
  calculateCGT,
  calculateDividendTax,
  calculateInterestTax,
  calculateWithdrawalTax,
  getMarginalTaxRate,
  getTaxFreeThreshold,
  TAX_CONSTANTS_2025,
} from '../tax'

describe('SARS Tax Calculations (2025/26)', () => {
  describe('calculateIncomeTax', () => {
    it('should calculate tax for first bracket (under R237,100)', () => {
      const tax = calculateIncomeTax(200000, 60)
      // 200k * 18% = 36,000 - 17,235 rebate = 18,765
      expect(tax).toBeCloseTo(18765, 0)
    })

    it('should calculate tax for R500,000 income (age 60)', () => {
      // Bracket: R370,501-R512,800 @ 31%, base tax R77,362
      // Tax before rebate: R77,362 + (R500,000 - R370,501) × 31% = R117,506.69
      // Less primary rebate R17,235 = R100,271.69
      const tax = calculateIncomeTax(500000, 60)
      expect(tax).toBeCloseTo(100271.69, 1)
    })

    it('should calculate tax for R500,000 income (age 70)', () => {
      // Same as above but with secondary rebate (R9,444)
      // R100,271.69 - R9,444 = R90,827.69
      const tax = calculateIncomeTax(500000, 70)
      expect(tax).toBeCloseTo(90827.69, 1)
    })

    it('should apply primary rebate only (age < 65)', () => {
      const tax1 = calculateIncomeTax(300000, 50)
      const tax2 = calculateIncomeTax(300000, 64)
      expect(tax1).toBe(tax2)
    })

    it('should apply secondary rebate (age 65+)', () => {
      const taxYoung = calculateIncomeTax(300000, 64)
      const taxOld = calculateIncomeTax(300000, 65)
      expect(taxOld).toBeLessThan(taxYoung)
      expect(taxYoung - taxOld).toBeCloseTo(9444, 0) // Secondary rebate
    })

    it('should apply tertiary rebate (age 75+)', () => {
      const tax70 = calculateIncomeTax(300000, 70)
      const tax75 = calculateIncomeTax(300000, 75)
      expect(tax75).toBeLessThan(tax70)
      expect(tax70 - tax75).toBeCloseTo(3145, 0) // Tertiary rebate
    })

    it('should return zero for zero income', () => {
      const tax = calculateIncomeTax(0, 60)
      expect(tax).toBe(0)
    })

    it('should return zero for negative income', () => {
      const tax = calculateIncomeTax(-10000, 60)
      expect(tax).toBe(0)
    })

    it('should handle income below tax threshold', () => {
      const tax = calculateIncomeTax(50000, 60)
      expect(tax).toBe(0) // Below threshold after rebate
    })

    it('should calculate tax for highest bracket', () => {
      const tax = calculateIncomeTax(2000000, 60)
      // Should be in 45% bracket
      expect(tax).toBeGreaterThan(600000)
    })

    it('should handle exact bracket boundaries', () => {
      const tax1 = calculateIncomeTax(237100, 60)
      const tax2 = calculateIncomeTax(237101, 60)
      expect(tax2).toBeGreaterThanOrEqual(tax1) // Allow equal at boundary
    })
  })

  describe('calculateRALumpSumTax', () => {
    it('should return zero for amounts under R550,000', () => {
      const tax = calculateRALumpSumTax(500000)
      expect(tax).toBe(0)
    })

    it('should return zero for R550,000 exactly', () => {
      const tax = calculateRALumpSumTax(550000)
      expect(tax).toBe(0)
    })

    it('should calculate tax for R1,000,000 lump sum', () => {
      // Bracket: R770,001-R1,155,000 @ 27%, base tax R39,600
      // Tax: R39,600 + (R1,000,000 - R770,001) × 27% = R101,699.73
      const tax = calculateRALumpSumTax(1000000)
      expect(tax).toBeCloseTo(101699.73, 1)
    })

    it('should calculate tax for second bracket (R550k-R770k)', () => {
      const tax = calculateRALumpSumTax(600000)
      // (600k - 550k) * 18% = 9,000
      expect(tax).toBeCloseTo(9000, 0)
    })

    it('should calculate tax for third bracket', () => {
      const tax = calculateRALumpSumTax(900000)
      // Base: 39,600 + (900k - 770k) * 27%
      expect(tax).toBeCloseTo(74700, 0)
    })

    it('should calculate tax for highest bracket', () => {
      const tax = calculateRALumpSumTax(2000000)
      // Base: 143,550 + (2M - 1.155M) * 36%
      expect(tax).toBeGreaterThan(400000)
    })

    it('should handle zero and negative amounts', () => {
      expect(calculateRALumpSumTax(0)).toBe(0)
      expect(calculateRALumpSumTax(-100000)).toBe(0)
    })

    it('should handle exact bracket boundaries', () => {
      const tax1 = calculateRALumpSumTax(770000)
      const tax2 = calculateRALumpSumTax(770001)
      expect(tax2).toBeGreaterThan(tax1)
    })
  })

  describe('calculateCGT', () => {
    it('should calculate CGT with annual exclusion', () => {
      // Example from spec: R200k gain, 39% marginal rate
      const cgt = calculateCGT(200000, 39)
      expect(cgt).toBeCloseTo(24960, 0)
    })

    it('should apply R40,000 annual exclusion', () => {
      const cgt = calculateCGT(40000, 39)
      expect(cgt).toBe(0) // Exactly at exclusion
    })

    it('should return zero for gains below exclusion', () => {
      const cgt = calculateCGT(30000, 39)
      expect(cgt).toBe(0)
    })

    it('should use 40% inclusion rate', () => {
      const cgt = calculateCGT(100000, 39)
      // (100k - 40k) * 40% = 24k taxable
      // 24k * 39% = 9,360
      expect(cgt).toBeCloseTo(9360, 0)
    })

    it('should handle zero marginal rate', () => {
      const cgt = calculateCGT(100000, 0)
      expect(cgt).toBe(0)
    })

    it('should handle high marginal rates', () => {
      const cgt = calculateCGT(200000, 45)
      expect(cgt).toBeCloseTo(28800, 0)
    })

    it('should handle zero and negative gains', () => {
      expect(calculateCGT(0, 39)).toBe(0)
      expect(calculateCGT(-100000, 39)).toBe(0)
    })

    it('should handle large capital gains', () => {
      const cgt = calculateCGT(5000000, 45)
      // (5M - 40k) * 40% * 45%
      expect(cgt).toBeGreaterThan(800000)
    })
  })

  describe('calculateDividendTax', () => {
    it('should calculate 20% withholding tax', () => {
      // Example from spec
      const tax = calculateDividendTax(50000)
      expect(tax).toBe(10000)
    })

    it('should handle zero dividends', () => {
      const tax = calculateDividendTax(0)
      expect(tax).toBe(0)
    })

    it('should handle negative dividends', () => {
      const tax = calculateDividendTax(-10000)
      expect(tax).toBe(0)
    })

    it('should calculate tax for large dividends', () => {
      const tax = calculateDividendTax(1000000)
      expect(tax).toBe(200000)
    })

    it('should calculate tax for small amounts', () => {
      const tax = calculateDividendTax(100)
      expect(tax).toBe(20)
    })
  })

  describe('calculateInterestTax', () => {
    it('should apply R23,800 exemption for age < 65', () => {
      // Example from spec: R40k interest, age 60, 39% rate
      const tax = calculateInterestTax(40000, 60, 39)
      expect(tax).toBeCloseTo(6318, 0)
    })

    it('should apply R34,500 exemption for age 65+', () => {
      // Example from spec: R40k interest, age 70, 39% rate
      const tax = calculateInterestTax(40000, 70, 39)
      expect(tax).toBeCloseTo(2145, 0)
    })

    it('should return zero for interest below exemption (young)', () => {
      const tax = calculateInterestTax(20000, 60, 39)
      expect(tax).toBe(0)
    })

    it('should return zero for interest below exemption (old)', () => {
      const tax = calculateInterestTax(30000, 70, 39)
      expect(tax).toBe(0)
    })

    it('should handle zero interest', () => {
      expect(calculateInterestTax(0, 60, 39)).toBe(0)
    })

    it('should handle negative interest', () => {
      expect(calculateInterestTax(-10000, 60, 39)).toBe(0)
    })

    it('should apply correct exemption at age boundary', () => {
      const tax64 = calculateInterestTax(30000, 64, 39)
      const tax65 = calculateInterestTax(30000, 65, 39)
      expect(tax64).toBeGreaterThan(tax65)
    })

    it('should handle high interest income', () => {
      const tax = calculateInterestTax(500000, 60, 45)
      expect(tax).toBeGreaterThan(200000)
    })
  })

  describe('calculateWithdrawalTax', () => {
    it('should use RA lump sum tax when isRALumpSum=true', () => {
      const tax = calculateWithdrawalTax(1000000, 65, true)
      const raLumpSumTax = calculateRALumpSumTax(1000000)
      expect(tax).toBe(raLumpSumTax)
    })

    it('should use income tax when isRALumpSum=false', () => {
      const tax = calculateWithdrawalTax(500000, 65, false)
      const incomeTax = calculateIncomeTax(500000, 65)
      expect(tax).toBe(incomeTax)
    })

    it('should default to income tax', () => {
      const tax1 = calculateWithdrawalTax(500000, 65)
      const tax2 = calculateWithdrawalTax(500000, 65, false)
      expect(tax1).toBe(tax2)
    })

    it('should handle zero withdrawal', () => {
      expect(calculateWithdrawalTax(0, 65, true)).toBe(0)
      expect(calculateWithdrawalTax(0, 65, false)).toBe(0)
    })

    it('should handle negative withdrawal', () => {
      expect(calculateWithdrawalTax(-10000, 65, true)).toBe(0)
      expect(calculateWithdrawalTax(-10000, 65, false)).toBe(0)
    })
  })

  describe('getMarginalTaxRate', () => {
    it('should return correct marginal rate for first bracket', () => {
      const rate = getMarginalTaxRate(100000, 60)
      expect(rate).toBeCloseTo(18, 1)
    })

    it('should return correct marginal rate for middle brackets', () => {
      const rate = getMarginalTaxRate(500000, 60)
      expect(rate).toBeCloseTo(31, 1)
    })

    it('should return correct marginal rate for highest bracket', () => {
      const rate = getMarginalTaxRate(2000000, 60)
      expect(rate).toBeCloseTo(45, 1)
    })

    it('should return zero for zero income', () => {
      const rate = getMarginalTaxRate(0, 60)
      expect(rate).toBe(0)
    })

    it('should handle income below threshold', () => {
      const rate = getMarginalTaxRate(50000, 60)
      // Below threshold but still in 18% bracket
      expect(rate).toBeCloseTo(0, 0) // Effective 0 due to rebates
    })
  })

  describe('getTaxFreeThreshold', () => {
    it('should calculate threshold for age < 65', () => {
      const threshold = getTaxFreeThreshold(60)
      // Primary rebate: 17,235 / 18% = 95,750
      expect(threshold).toBeCloseTo(95750, 0)
    })

    it('should calculate threshold for age 65+', () => {
      const threshold = getTaxFreeThreshold(70)
      // Primary + Secondary: (17,235 + 9,444) / 18% = 148,217
      expect(threshold).toBeCloseTo(148216.67, 0)
    })

    it('should calculate threshold for age 75+', () => {
      const threshold = getTaxFreeThreshold(75)
      // All rebates: (17,235 + 9,444 + 3,145) / 18% = 165,689
      expect(threshold).toBeCloseTo(165688.89, 0)
    })

    it('should increase threshold with age', () => {
      const threshold60 = getTaxFreeThreshold(60)
      const threshold70 = getTaxFreeThreshold(70)
      const threshold75 = getTaxFreeThreshold(75)
      expect(threshold70).toBeGreaterThan(threshold60)
      expect(threshold75).toBeGreaterThan(threshold70)
    })
  })

  describe('TAX_CONSTANTS_2025', () => {
    it('should export correct income tax brackets', () => {
      expect(TAX_CONSTANTS_2025.incomeTaxBrackets).toHaveLength(7)
      expect(TAX_CONSTANTS_2025.incomeTaxBrackets[0].rate).toBe(0.18)
      expect(TAX_CONSTANTS_2025.incomeTaxBrackets[6].rate).toBe(0.45)
    })

    it('should export correct rebates', () => {
      expect(TAX_CONSTANTS_2025.taxRebates.primary).toBe(17235)
      expect(TAX_CONSTANTS_2025.taxRebates.secondary).toBe(9444)
      expect(TAX_CONSTANTS_2025.taxRebates.tertiary).toBe(3145)
    })

    it('should export correct RA lump sum brackets', () => {
      expect(TAX_CONSTANTS_2025.raLumpSumBrackets).toHaveLength(4)
      expect(TAX_CONSTANTS_2025.raLumpSumBrackets[0].max).toBe(550000)
    })

    it('should export correct CGT rules', () => {
      expect(TAX_CONSTANTS_2025.cgtRules.inclusionRate).toBe(0.4)
      expect(TAX_CONSTANTS_2025.cgtRules.annualExclusion).toBe(40000)
    })

    it('should export correct dividend rate', () => {
      expect(TAX_CONSTANTS_2025.dividendWhtRate).toBe(0.2)
    })

    it('should export correct interest exemptions', () => {
      expect(TAX_CONSTANTS_2025.interestExemptions.under65).toBe(23800)
      expect(TAX_CONSTANTS_2025.interestExemptions.over65).toBe(34500)
    })
  })

  describe('Performance Tests', () => {
    it('should calculate income tax quickly', () => {
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        calculateIncomeTax(500000, 65)
      }
      const end = performance.now()
      expect(end - start).toBeLessThan(100)
    })

    it('should handle 1000 tax calculations under 100ms', () => {
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        calculateIncomeTax(i * 1000, 60 + (i % 30))
        calculateRALumpSumTax(i * 1000)
        calculateCGT(i * 1000, 39)
      }
      const end = performance.now()
      expect(end - start).toBeLessThan(100)
    })
  })
})
