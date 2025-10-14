'use client';

import * as React from 'react';
import { SliderControl } from './SliderControl';

interface PercentageSliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  aiRecommendation?: number;
  tooltip?: string;
  decimalPlaces?: number;
  className?: string;
}

/**
 * Format percentage value
 */
const formatPercentage = (value: number, decimalPlaces: number = 1): string => {
  return `${value.toFixed(decimalPlaces)}%`;
};

/**
 * PercentageSliderControl Component
 *
 * Specialized slider control for percentage values.
 * Wraps SliderControl with percentage formatting.
 *
 * Formats values as: "8.5%" (default 1 decimal place)
 *
 * @example
 * ```tsx
 * <PercentageSliderControl
 *   label="Investment Return Rate"
 *   value={9.0}
 *   min={0}
 *   max={15}
 *   step={0.1}
 *   onChange={(val) => setReturnRate(val)}
 *   aiRecommendation={9.0}
 *   tooltip="Expected annual investment return rate"
 *   decimalPlaces={1}
 * />
 * ```
 */
export function PercentageSliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  aiRecommendation,
  tooltip,
  decimalPlaces = 1,
  className,
}: PercentageSliderControlProps) {
  const formatValue = React.useCallback(
    (val: number) => formatPercentage(val, decimalPlaces),
    [decimalPlaces]
  );

  return (
    <SliderControl
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={onChange}
      aiRecommendation={aiRecommendation}
      tooltip={tooltip}
      formatValue={formatValue}
      className={className}
    />
  );
}
