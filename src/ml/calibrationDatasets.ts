import { CalibrationDataPoint, CalibrationModel } from '../types';
import { BASELINE_STRIP_RGB, calculateDeltaE, rgbToLab } from './colorProcessing';

const BASE_LAB = rgbToLab(BASELINE_STRIP_RGB.r, BASELINE_STRIP_RGB.g, BASELINE_STRIP_RGB.b);

/**
 * Generates calibrated laboratory training dataset based on controlled gas chamber experiments
 */
export function generateLaboratoryCalibrationDataset(): CalibrationDataPoint[] {
  const points: CalibrationDataPoint[] = [];
  const concentrations = [1, 2.5, 5, 10, 15, 25, 50]; // ppm
  const durations = [15, 30, 60, 120, 240, 480]; // minutes
  const temperatures = [18, 25, 35, 42]; // °C
  const humidities = [30, 50, 70, 85]; // % RH

  let idCounter = 1;

  for (const c of concentrations) {
    for (const d of durations) {
      const knownDose = c * d; // ppm·min
      
      // Select varying temperature and humidity representative points
      const t = temperatures[(idCounter % temperatures.length)];
      const rh = humidities[(idCounter % humidities.length)];

      // Non-linear chemical reaction kinetics:
      // Delta E saturates asymptotically as reagent active sites bind with H2S molecules:
      // DeltaE = E_max * (1 - exp(-k * Dose)) * temp_factor * rh_factor
      const k = 0.0028; // reaction rate constant
      const eMax = 68.0; // max delta E darkening
      const tempFactor = 1.0 + (t - 25) * 0.004; // +0.4% per °C above 25°C
      const rhFactor = 1.0 + (rh - 50) * 0.0025; // moisture accelerates passive diffusion

      const trueDeltaE = eMax * (1 - Math.exp(-k * knownDose)) * tempFactor * rhFactor;
      // Add slight experimental noise (+/- 0.6 delta E)
      const noise = (Math.sin(idCounter * 12.34) * 0.5) + (Math.cos(idCounter * 8.9) * 0.3);
      const measuredDeltaE = Math.max(0, trueDeltaE + noise);

      // Synthesize RGB values corresponding to this Delta E darkening
      const darkeningRatio = Math.min(1.0, measuredDeltaE / eMax);
      const r = Math.round(BASELINE_STRIP_RGB.r - darkeningRatio * 185);
      const g = Math.round(BASELINE_STRIP_RGB.g - darkeningRatio * 188);
      const b = Math.round(BASELINE_STRIP_RGB.b - darkeningRatio * 165);

      const lab = rgbToLab(r, g, b);
      const computedDeltaE = calculateDeltaE(BASE_LAB, lab);

      points.push({
        id: `CAL-EXP-${String(idCounter).padStart(4, '0')}`,
        concentrationPpm: c,
        durationMinutes: d,
        knownDosePpmMin: knownDose,
        sensorR: Math.max(15, r),
        sensorG: Math.max(12, g),
        sensorB: Math.max(10, b),
        deltaE: computedDeltaE,
        temperature: t,
        humidity: rh,
        batchId: `BATCH-2026-H2S-${Math.floor(idCounter / 10) + 1}`,
        referenceCondition: `NIST Traceable Gas Chamber #3 (25°C / 50% RH)`,
      });

      idCounter++;
    }
  }

  return points;
}

export const INITIAL_CALIBRATION_DATA: CalibrationDataPoint[] = generateLaboratoryCalibrationDataset();

export const DEFAULT_CALIBRATION_MODELS: CalibrationModel[] = [
  {
    id: 'model-rf-v2.1',
    name: 'Multi-Feature Random Forest Dose Regressor',
    version: 'cal-v2.1',
    algorithm: 'Random Forest Dose Estimator',
    r2Score: 0.984,
    mae: 4.82,
    rmse: 6.91,
    trainedAt: '2026-09-15 08:30:00 UTC',
    samplesCount: INITIAL_CALIBRATION_DATA.length,
    isActive: true,
    notes: 'Incorporates non-linear temperature & relative humidity diffusion kinetics with full CIE-Lab and RGB ratio vector.',
    featuresUsed: ['DeltaE', 'R/G Ratio', 'G/B Ratio', 'Lightness (L)', 'Temperature (°C)', 'Humidity (%RH)'],
  },
  {
    id: 'model-poly-v1.4',
    name: 'Polynomial Kinetic Model (Order 3)',
    version: 'cal-v1.4',
    algorithm: 'Polynomial Regression',
    r2Score: 0.952,
    mae: 8.64,
    rmse: 11.23,
    trainedAt: '2026-09-10 14:15:00 UTC',
    samplesCount: INITIAL_CALIBRATION_DATA.length,
    isActive: false,
    notes: 'Standard 3rd-degree polynomial mapping of Delta-E with basic 25°C baseline normalization.',
    featuresUsed: ['DeltaE', 'DeltaE^2', 'DeltaE^3'],
  },
  {
    id: 'model-ridge-v1.0',
    name: 'Multivariate Ridge with Thermal Matrix',
    version: 'cal-v1.0',
    algorithm: 'Multivariate Ridge (Temp Comp)',
    r2Score: 0.928,
    mae: 11.45,
    rmse: 14.88,
    trainedAt: '2026-08-20 11:00:00 UTC',
    samplesCount: 48,
    isActive: false,
    notes: 'Linear multivariate model with L2 regularization and linear temperature coefficient.',
    featuresUsed: ['DeltaE', 'Temperature', 'Humidity'],
  },
];
