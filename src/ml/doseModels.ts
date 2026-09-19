import { CIELabColor, QualityState, RawColorData, RiskState } from '../types';
import { assessOpticalQuality, BASELINE_STRIP_RGB, calculateDeltaE, rgbToLab } from './colorProcessing';

export interface DoseInferenceResult {
  estimatedDose: number; // ppm·min
  doseUncertainty: number; // ± ppm·min
  readingQuality: QualityState;
  modelVersion: string;
  notes?: string;
  featureBreakdown: {
    deltaE: number;
    tempCompFactor: number;
    rhCompFactor: number;
    lightnessScore: number;
  };
}

const BASELINE_LAB = rgbToLab(BASELINE_STRIP_RGB.r, BASELINE_STRIP_RGB.g, BASELINE_STRIP_RGB.b);

/**
 * AI-Assisted Quantitative Dose Estimation Engine
 * Transforms calibrated optical response, temperature, and humidity into cumulative H2S exposure dose
 */
export function estimateCumulativeDose(
  raw: RawColorData,
  temperature: number = 25,
  humidity: number = 50,
  modelVersion: string = 'cal-v2.1'
): DoseInferenceResult {
  const opticalCheck = assessOpticalQuality(raw, temperature);
  
  if (opticalCheck.quality === 'INVALID') {
    return {
      estimatedDose: 0,
      doseUncertainty: 0,
      readingQuality: 'INVALID',
      modelVersion,
      notes: opticalCheck.reason,
      featureBreakdown: {
        deltaE: 0,
        tempCompFactor: 1,
        rhCompFactor: 1,
        lightnessScore: 0,
      },
    };
  }

  const currentLab: CIELabColor = rgbToLab(raw.r, raw.g, raw.b);
  const deltaE = calculateDeltaE(BASELINE_LAB, currentLab);

  // Environmental compensation equations derived from calibration kinetics:
  // k_temp(T) = 1 + (T - 25) * 0.004
  // k_rh(RH) = 1 + (RH - 50) * 0.0025
  const tempCompFactor = 1.0 + (temperature - 25) * 0.004;
  const rhCompFactor = 1.0 + (humidity - 50) * 0.0025;
  const combinedEnvFactor = Math.max(0.7, Math.min(1.4, tempCompFactor * rhCompFactor));

  // Normalized effective delta E compensated for temperature & moisture
  const effectiveDeltaE = deltaE / combinedEnvFactor;

  // Non-linear inverse saturation mapping:
  // DeltaE = E_max * (1 - exp(-k * Dose))
  // => Dose = -ln(1 - DeltaE / E_max) / k
  const eMax = 65.0;
  const k = 0.0028;

  let estimatedDose = 0;
  if (effectiveDeltaE <= 0.2) {
    estimatedDose = 0.0;
  } else if (effectiveDeltaE < eMax * 0.98) {
    const fraction = Math.min(0.975, effectiveDeltaE / eMax);
    estimatedDose = -Math.log(1 - fraction) / k;
  } else {
    // Saturated strip region (linear extrapolation with high uncertainty)
    const baseDoseAtSat = -Math.log(1 - 0.975) / k;
    estimatedDose = baseDoseAtSat + (effectiveDeltaE - eMax * 0.975) * 45;
  }

  // Model-specific tweaks
  if (modelVersion === 'cal-v1.4') {
    // 3rd order polynomial approximation
    const p1 = 4.2;
    const p2 = 0.085;
    const p3 = 0.0012;
    estimatedDose = effectiveDeltaE * p1 + Math.pow(effectiveDeltaE, 2) * p2 + Math.pow(effectiveDeltaE, 3) * p3;
  }

  estimatedDose = Math.max(0, Number(estimatedDose.toFixed(1)));

  // Uncertainty Estimation:
  // As Delta-E increases towards saturation, derivative d(Dose)/d(DeltaE) expands exponentially
  const sensitivityDerivative = 1 / (k * Math.max(0.05, eMax - effectiveDeltaE));
  let baseUncertainty = 3.5 + Math.abs(sensitivityDerivative) * 0.8;
  if (opticalCheck.quality === 'POOR') baseUncertainty *= 2.0;
  if (opticalCheck.quality === 'FAIR') baseUncertainty *= 1.35;
  
  const doseUncertainty = Math.max(1.5, Number(baseUncertainty.toFixed(1)));

  return {
    estimatedDose,
    doseUncertainty,
    readingQuality: opticalCheck.quality,
    modelVersion,
    featureBreakdown: {
      deltaE,
      tempCompFactor: Number(tempCompFactor.toFixed(3)),
      rhCompFactor: Number(rhCompFactor.toFixed(3)),
      lightnessScore: currentLab.L,
    },
  };
}

/**
 * Calculates real-time 8-Hour Time-Weighted Average (TWA) projection
 */
export function calculateTwaProjection(cumulativeDosePpmMin: number, elapsedMinutes: number): {
  currentAveragePpm: number;
  projected8HrTwaPpm: number;
} {
  const safeElapsed = Math.max(1, elapsedMinutes);
  const currentAveragePpm = cumulativeDosePpmMin / safeElapsed;
  // If shift continues at this steady rate for total 480 mins (8 hours)
  const projectedTotalDose = currentAveragePpm * 480;
  const projected8HrTwaPpm = projectedTotalDose / 480;

  return {
    currentAveragePpm: Number(currentAveragePpm.toFixed(2)),
    projected8HrTwaPpm: Number(projected8HrTwaPpm.toFixed(2)),
  };
}
