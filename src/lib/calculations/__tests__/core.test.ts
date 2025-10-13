// =============================================================================
// Core Financial Calculations - Unit Tests
// =============================================================================

import { describe, it, expect } from 'vitest'
import {
  calculateFutureValue,
  calculatePresentValue,
  calculateCAGR,
  calculateRealReturn,
  convertToRealReturn,
  convertToNominalReturn,
  inflationAdjustedIncome,
} from '../core'

describe('Core Financial Calculations', () => {
  describe('calculateFutureValue', () => {
    it('should calculate future value with contributions', () => {
      // R 100,000 starting, R 3,000/month, 8% return, 20 years
      const result = calculateFutureValue(100000, 3000, 8, 20)
      // Formula: FV = PV(1+r)^n + PMT[((1+r)^n - 1)/r]
      // FV = 100,000(1.08)^20 + 36,000[((1.08)^20 - 1)/0.08]
      // FV ≈ 466,095.71 + 1,647,430.72 = 2,113,526.43
      expect(result).toBeCloseTo(2113526, -2) // Allow 100 tolerance
    })

    it('should handle zero return rate', () => {
      const result = calculateFutureValue(100000, 3000, 0, 20)
      // 100k + (3000 * 12 * 20) = 820,000
      expect(result).toBe(820000)
    })

    it('should handle zero contributions', () => {
      const result = calculateFutureValue(100000, 0, 8, 20)
      // Only growth of present value: 100k * (1.08)^20
      expect(result).toBeCloseTo(466095.71, 1)
    })

    it('should handle zero years', () => {
      const result = calculateFutureValue(100000, 3000, 8, 0)
      expect(result).toBe(100000)
    })

    it('should handle negative inputs gracefully', () => {
      const result = calculateFutureValue(-100000, 3000, 8, 20)
      expect(result).toBe(0)
    })

    it('should handle large values', () => {
      const result = calculateFutureValue(1000000, 10000, 12, 30)
      expect(result).toBeGreaterThan(1000000)
    })
  })

  describe('calculatePresentValue', () => {
    it('should calculate present value with inflation adjustment', () => {
      // R 2,000,000 in 20 years, 6% inflation
      const result = calculatePresentValue(2000000, 6, 20)
      expect(result).toBeCloseTo(623612, -2)
    })

    it('should handle zero inflation', () => {
      const result = calculatePresentValue(2000000, 0, 20)
      expect(result).toBe(2000000)
    })

    it('should handle zero years', () => {
      const result = calculatePresentValue(2000000, 6, 0)
      expect(result).toBe(2000000)
    })

    it('should handle negative future value', () => {
      const result = calculatePresentValue(-100000, 6, 20)
      expect(result).toBe(0)
    })

    it('should handle high inflation', () => {
      const result = calculatePresentValue(1000000, 20, 10)
      expect(result).toBeLessThan(1000000)
    })
  })

  describe('calculateCAGR', () => {
    it('should calculate CAGR correctly', () => {
      // R 100,000 grew to R 200,000 over 10 years
      const result = calculateCAGR(100000, 200000, 10)
      expect(result).toBeCloseTo(7.18, 1)
    })

    it('should handle no growth', () => {
      const result = calculateCAGR(100000, 100000, 10)
      expect(result).toBe(0)
    })

    it('should handle negative growth', () => {
      const result = calculateCAGR(200000, 100000, 10)
      expect(result).toBeLessThan(0)
    })

    it('should handle zero years', () => {
      const result = calculateCAGR(100000, 200000, 0)
      expect(result).toBe(0)
    })

    it('should handle zero initial value', () => {
      const result = calculateCAGR(0, 200000, 10)
      expect(result).toBe(0)
    })

    it('should handle total loss', () => {
      const result = calculateCAGR(100000, 0, 10)
      expect(result).toBe(-100)
    })

    it('should calculate high growth correctly', () => {
      const result = calculateCAGR(10000, 1000000, 10)
      expect(result).toBeGreaterThan(50)
    })
  })

  describe('calculateRealReturn', () => {
    it('should calculate real return correctly', () => {
      // 10% nominal, 6% inflation
      const result = calculateRealReturn(10, 6)
      expect(result).toBeCloseTo(3.77, 1)
    })

    it('should handle zero inflation', () => {
      const result = calculateRealReturn(10, 0)
      expect(result).toBe(10)
    })

    it('should handle zero nominal return', () => {
      const result = calculateRealReturn(0, 6)
      expect(result).toBeLessThan(0)
    })

    it('should handle negative real return', () => {
      const result = calculateRealReturn(5, 10)
      expect(result).toBeLessThan(0)
    })

    it('should handle equal nominal and inflation', () => {
      const result = calculateRealReturn(6, 6)
      expect(result).toBeCloseTo(0, 1)
    })

    it('should handle high returns', () => {
      const result = calculateRealReturn(20, 6)
      expect(result).toBeGreaterThan(10)
    })
  })

  describe('convertToRealReturn', () => {
    it('should convert nominal to real return', () => {
      const result = convertToRealReturn(10, 6)
      expect(result).toBeCloseTo(3.77, 1)
    })

    it('should be same as calculateRealReturn', () => {
      const real1 = convertToRealReturn(12, 5)
      const real2 = calculateRealReturn(12, 5)
      expect(real1).toBe(real2)
    })
  })

  describe('convertToNominalReturn', () => {
    it('should convert real to nominal return', () => {
      const result = convertToNominalReturn(3.77, 6)
      expect(result).toBeCloseTo(10, 0)
    })

    it('should handle zero real return', () => {
      const result = convertToNominalReturn(0, 6)
      expect(result).toBeCloseTo(6, 1)
    })

    it('should handle negative real return', () => {
      const result = convertToNominalReturn(-2, 6)
      expect(result).toBeCloseTo(3.88, 1)
    })

    it('should be inverse of convertToRealReturn', () => {
      const nominal = 15
      const inflation = 6
      const real = convertToRealReturn(nominal, inflation)
      const backToNominal = convertToNominalReturn(real, inflation)
      expect(backToNominal).toBeCloseTo(nominal, 1)
    })
  })

  describe('inflationAdjustedIncome', () => {
    it('should calculate future income needs', () => {
      // R 20,000/month today, 6% inflation, 20 years
      const result = inflationAdjustedIncome(20000, 6, 20)
      expect(result).toBeCloseTo(64143, -2)
    })

    it('should handle zero inflation', () => {
      const result = inflationAdjustedIncome(20000, 0, 20)
      expect(result).toBe(20000)
    })

    it('should handle zero years', () => {
      const result = inflationAdjustedIncome(20000, 6, 0)
      expect(result).toBe(20000)
    })

    it('should handle negative income', () => {
      const result = inflationAdjustedIncome(-20000, 6, 20)
      expect(result).toBe(0)
    })

    it('should handle high inflation', () => {
      const result = inflationAdjustedIncome(10000, 15, 10)
      expect(result).toBeGreaterThan(40000)
    })

    it('should handle low inflation', () => {
      const result = inflationAdjustedIncome(10000, 2, 10)
      expect(result).toBeCloseTo(12190, 0)
    })
  })

  describe('Edge Cases and Boundaries', () => {
    it('should handle very small numbers', () => {
      const fv = calculateFutureValue(1, 1, 1, 1)
      expect(fv).toBeGreaterThan(0)
    })

    it('should handle very large numbers', () => {
      const fv = calculateFutureValue(10000000, 100000, 10, 30)
      expect(fv).toBeGreaterThan(10000000)
      expect(Number.isFinite(fv)).toBe(true)
    })

    it('should handle decimal years gracefully', () => {
      const fv = calculateFutureValue(100000, 3000, 8, 10.5)
      expect(fv).toBeGreaterThan(100000)
    })

    it('should round results to 2 decimal places', () => {
      const fv = calculateFutureValue(100000, 3000, 8.5, 15)
      const decimals = (fv.toString().split('.')[1] || '').length
      expect(decimals).toBeLessThanOrEqual(2)
    })
  })

  describe('Performance Tests', () => {
    it('should calculate FV in under 1ms', () => {
      const start = performance.now()
      calculateFutureValue(100000, 3000, 8, 20)
      const end = performance.now()
      expect(end - start).toBeLessThan(1)
    })

    it('should handle 1000 calculations quickly', () => {
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        calculateFutureValue(100000 + i, 3000 + i, 8, 20)
      }
      const end = performance.now()
      expect(end - start).toBeLessThan(100) // Under 100ms for 1000 calcs
    })
  })
})
