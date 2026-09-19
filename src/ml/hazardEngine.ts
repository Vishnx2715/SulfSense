import { AlertItem, AlertPriority, QualityState, RiskState, SafetyThresholdConfig } from '../types';

export const DEFAULT_SAFETY_THRESHOLDS: SafetyThresholdConfig = {
  cautionDose: 40.0,    // ppm·min (corresponds to ~5 ppm for 8 mins or 1 ppm for 40 mins)
  warningDose: 100.0,   // ppm·min (action level)
  hazardousDose: 200.0, // ppm·min (immediate evacuation / respiratory PPE required)
  twa8HourLimit: 10.0,  // ppm average limit
  maxTempThreshold: 50.0,
  sensorDriftTolerance: 15.0,
};

export interface HazardEvaluation {
  riskState: RiskState;
  priority: AlertPriority;
  requiresWearableAlert: boolean;
  requiresSupervisorAlert: boolean;
  alertHeadline: string;
  recommendedAction: string;
}

/**
 * Industrial Safety Hazard Assessment Engine
 * Separated cleanly from mathematical dose estimation
 */
export function evaluateHazard(
  estimatedDose: number,
  quality: QualityState,
  thresholds: SafetyThresholdConfig = DEFAULT_SAFETY_THRESHOLDS
): HazardEvaluation {
  if (quality === 'INVALID') {
    return {
      riskState: 'DATA_INVALID',
      priority: 'MEDIUM',
      requiresWearableAlert: true,
      requiresSupervisorAlert: true,
      alertHeadline: 'Sensor Data Stream Invalid / Optical Obstruction',
      recommendedAction: 'Inspect dosimeter lens for contamination or replace chemical strip cartridge.',
    };
  }

  if (estimatedDose >= thresholds.hazardousDose) {
    return {
      riskState: 'HAZARDOUS',
      priority: 'CRITICAL',
      requiresWearableAlert: true,
      requiresSupervisorAlert: true,
      alertHeadline: 'CRITICAL H₂S CUMULATIVE DOSE THRESHOLD EXCEEDED',
      recommendedAction: 'IMMEDIATE EVACUATION: Worker must exit contaminated zone and report to safety muster station.',
    };
  }

  if (estimatedDose >= thresholds.warningDose) {
    return {
      riskState: 'WARNING',
      priority: 'HIGH',
      requiresWearableAlert: true,
      requiresSupervisorAlert: true,
      alertHeadline: 'H₂S Exposure Warning: Elevated Dose Detected',
      recommendedAction: 'Don respiratory protective equipment (SCBA/respirator) and verify ventilation.',
    };
  }

  if (estimatedDose >= thresholds.cautionDose) {
    return {
      riskState: 'CAUTION',
      priority: 'LOW',
      requiresWearableAlert: false,
      requiresSupervisorAlert: true,
      alertHeadline: 'H₂S Exposure Caution: Baseline Escalation',
      recommendedAction: 'Monitor area air turnover and prepare to rotate shift personnel.',
    };
  }

  return {
    riskState: 'NORMAL',
    priority: 'INFO',
    requiresWearableAlert: false,
    requiresSupervisorAlert: false,
    alertHeadline: 'Normal Atmospheric Dose Level',
    recommendedAction: 'Routine passive monitoring active.',
  };
}

/**
 * Creates standardized alert item for event logging and push notification
 */
export function createAlertRecord(
  workerId: string,
  workerName: string,
  deviceId: string,
  dose: number,
  hazard: HazardEvaluation,
  threshold: number
): AlertItem {
  return {
    id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    workerId,
    workerName,
    deviceId,
    timestamp: new Date().toISOString(),
    riskState: hazard.riskState,
    priority: hazard.priority,
    doseValue: dose,
    thresholdExceeded: threshold,
    message: `${hazard.alertHeadline} — Dose: ${dose.toFixed(1)} ppm·min. ${hazard.recommendedAction}`,
    acknowledged: false,
  };
}
