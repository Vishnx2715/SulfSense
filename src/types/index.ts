export type RiskState = 'NORMAL' | 'CAUTION' | 'WARNING' | 'HAZARDOUS' | 'DATA_INVALID';

export type QualityState = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'INVALID';

export type AlertPriority = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'CALIBRATING' | 'ERROR';

export type UserRole = 'supervisor' | 'worker' | 'admin';

export interface RawColorData {
  r: number; // 0 - 255 (or 16-bit ADC normalized)
  g: number;
  b: number;
  clear: number;
  gain?: number;
  integrationTimeMs?: number;
}

export interface CIELabColor {
  L: number; // Lightness 0-100
  a: number; // Green to Red -128 to 127
  b: number; // Blue to Yellow -128 to 127
}

export interface HSVColor {
  h: number; // Hue 0-360
  s: number; // Saturation 0-100%
  v: number; // Value 0-100%
}

export interface SensorTelemetry {
  deviceId: string;
  workerId: string;
  timestamp: string; // ISO string
  rawColor: RawColorData;
  lab: CIELabColor;
  hsv: HSVColor;
  deltaE: number; // Color difference from baseline
  temperature: number; // °C
  humidity: number; // % RH
  batteryPercent: number; // %
  rssi: number; // dBm
  estimatedDose: number; // ppm·min
  doseUncertainty: number; // ± ppm·min
  readingQuality: QualityState;
  riskState: RiskState;
  modelVersion: string;
  isSimulated: boolean;
}

export interface Worker {
  id: string;
  name: string;
  employeeCode: string;
  role: string;
  department: string;
  assignedDeviceId: string | null;
  shift: string; // e.g. 'Shift A (07:00 - 15:00)'
  currentDose: number; // ppm·min
  riskState: RiskState;
  status: 'ACTIVE' | 'ON_BREAK' | 'OFF_SHIFT';
  avatarUrl?: string;
  lastUpdate: string;
}

export interface DosimeterDevice {
  id: string;
  name: string;
  macAddress: string;
  assignedWorkerId: string | null;
  status: DeviceStatus;
  battery: number;
  firmwareVersion: string;
  stripBatchId: string;
  stripInstalledAt: string;
  stripExpiryHours: number;
  stripUsedHours: number;
  lastSync: string;
  rssi: number;
  calibrationProfile: string;
}

export interface AlertItem {
  id: string;
  workerId: string;
  workerName: string;
  deviceId: string;
  timestamp: string;
  riskState: RiskState;
  priority: AlertPriority;
  doseValue: number;
  thresholdExceeded: number;
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface CalibrationDataPoint {
  id: string;
  concentrationPpm: number;
  durationMinutes: number;
  knownDosePpmMin: number;
  sensorR: number;
  sensorG: number;
  sensorB: number;
  deltaE: number;
  temperature: number;
  humidity: number;
  batchId: string;
  referenceCondition: string;
}

export interface CalibrationModel {
  id: string;
  name: string;
  version: string;
  algorithm: 'Polynomial Regression' | 'Multivariate Ridge (Temp Comp)' | 'Random Forest Dose Estimator';
  r2Score: number;
  mae: number;
  rmse: number;
  trainedAt: string;
  samplesCount: number;
  isActive: boolean;
  notes: string;
  featuresUsed: string[];
}

export interface SafetyThresholdConfig {
  cautionDose: number; // e.g. 50 ppm·min
  warningDose: number; // e.g. 100 ppm·min
  hazardousDose: number; // e.g. 200 ppm·min
  twa8HourLimit: number; // e.g. 10 ppm avg (4800 ppm·min shift cap)
  maxTempThreshold: number; // 45°C
  sensorDriftTolerance: number;
}
