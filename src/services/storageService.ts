import { AlertItem, DosimeterDevice, Worker } from '../types';

export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'W-101',
    name: 'Alex Mercer',
    employeeCode: 'EMP-7402',
    role: 'Lead Desulfurization Technician',
    department: 'Claus Sulfur Recovery Unit #2',
    assignedDeviceId: 'H2S-ESP32-001',
    shift: 'Shift Alpha (06:00 - 14:00)',
    currentDose: 14.2,
    riskState: 'NORMAL',
    status: 'ACTIVE',
    lastUpdate: new Date().toISOString(),
  },
  {
    id: 'W-102',
    name: 'Elena Rostova',
    employeeCode: 'EMP-8819',
    role: 'Field Inspection Engineer',
    department: 'Hydrotreater Flare Header Zone',
    assignedDeviceId: 'H2S-ESP32-002',
    shift: 'Shift Alpha (06:00 - 14:00)',
    currentDose: 72.8,
    riskState: 'CAUTION',
    status: 'ACTIVE',
    lastUpdate: new Date().toISOString(),
  },
  {
    id: 'W-103',
    name: 'Marcus Vance',
    employeeCode: 'EMP-6190',
    role: 'Sour Gas Pipeline Operator',
    department: 'Wellhead Gathering Station B',
    assignedDeviceId: 'H2S-ESP32-003',
    shift: 'Shift Alpha (06:00 - 14:00)',
    currentDose: 134.5,
    riskState: 'WARNING',
    status: 'ACTIVE',
    lastUpdate: new Date().toISOString(),
  },
  {
    id: 'W-104',
    name: 'Priya Sharma',
    employeeCode: 'EMP-9034',
    role: 'Process Safety Chemist',
    department: 'Quality Assurance Lab',
    assignedDeviceId: 'H2S-ESP32-004',
    shift: 'Shift Alpha (06:00 - 14:00)',
    currentDose: 3.1,
    riskState: 'NORMAL',
    status: 'ACTIVE',
    lastUpdate: new Date().toISOString(),
  },
  {
    id: 'W-105',
    name: 'David Kim',
    employeeCode: 'EMP-5521',
    role: 'Maintenance Specialist',
    department: 'Amine Treating Unit Tank Farm',
    assignedDeviceId: 'H2S-ESP32-005',
    shift: 'Shift Alpha (06:00 - 14:00)',
    currentDose: 0,
    riskState: 'DATA_INVALID',
    status: 'ON_BREAK',
    lastUpdate: new Date().toISOString(),
  },
];

export const INITIAL_DEVICES: DosimeterDevice[] = [
  {
    id: 'H2S-ESP32-001',
    name: 'SulfSense Wristband #01',
    macAddress: 'C4:4F:33:1A:88:01',
    assignedWorkerId: 'W-101',
    status: 'ONLINE',
    battery: 94,
    firmwareVersion: 'v2.4.1-ota',
    stripBatchId: 'BATCH-2026-A1',
    stripInstalledAt: '2026-09-18 06:00:00',
    stripExpiryHours: 24,
    stripUsedHours: 4.5,
    lastSync: new Date().toISOString(),
    rssi: -58,
    calibrationProfile: 'cal-v2.1',
  },
  {
    id: 'H2S-ESP32-002',
    name: 'SulfSense Wristband #02',
    macAddress: 'C4:4F:33:1A:88:02',
    assignedWorkerId: 'W-102',
    status: 'ONLINE',
    battery: 81,
    firmwareVersion: 'v2.4.1-ota',
    stripBatchId: 'BATCH-2026-A1',
    stripInstalledAt: '2026-09-18 06:00:00',
    stripExpiryHours: 24,
    stripUsedHours: 4.5,
    lastSync: new Date().toISOString(),
    rssi: -64,
    calibrationProfile: 'cal-v2.1',
  },
  {
    id: 'H2S-ESP32-003',
    name: 'SulfSense Wristband #03',
    macAddress: 'C4:4F:33:1A:88:03',
    assignedWorkerId: 'W-103',
    status: 'ONLINE',
    battery: 73,
    firmwareVersion: 'v2.4.1-ota',
    stripBatchId: 'BATCH-2026-A1',
    stripInstalledAt: '2026-09-18 06:00:00',
    stripExpiryHours: 24,
    stripUsedHours: 4.5,
    lastSync: new Date().toISOString(),
    rssi: -72,
    calibrationProfile: 'cal-v2.1',
  },
  {
    id: 'H2S-ESP32-004',
    name: 'SulfSense Wristband #04',
    macAddress: 'C4:4F:33:1A:88:04',
    assignedWorkerId: 'W-104',
    status: 'ONLINE',
    battery: 99,
    firmwareVersion: 'v2.4.1-ota',
    stripBatchId: 'BATCH-2026-A2',
    stripInstalledAt: '2026-09-18 06:00:00',
    stripExpiryHours: 24,
    stripUsedHours: 4.5,
    lastSync: new Date().toISOString(),
    rssi: -52,
    calibrationProfile: 'cal-v2.1',
  },
  {
    id: 'H2S-ESP32-005',
    name: 'SulfSense Wristband #05',
    macAddress: 'C4:4F:33:1A:88:05',
    assignedWorkerId: 'W-105',
    status: 'ERROR',
    battery: 62,
    firmwareVersion: 'v2.3.8-legacy',
    stripBatchId: 'BATCH-2026-A1',
    stripInstalledAt: '2026-09-17 06:00:00',
    stripExpiryHours: 24,
    stripUsedHours: 28.5,
    lastSync: new Date().toISOString(),
    rssi: -88,
    calibrationProfile: 'cal-v1.4',
  },
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-1001',
    workerId: 'W-103',
    workerName: 'Marcus Vance',
    deviceId: 'H2S-ESP32-003',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    riskState: 'WARNING',
    priority: 'HIGH',
    doseValue: 134.5,
    thresholdExceeded: 100.0,
    message: 'H₂S Exposure Warning: Elevated Dose Detected in Wellhead Gathering Station B.',
    acknowledged: false,
  },
  {
    id: 'ALT-1002',
    workerId: 'W-102',
    workerName: 'Elena Rostova',
    deviceId: 'H2S-ESP32-002',
    timestamp: new Date(Date.now() - 34 * 60000).toISOString(),
    riskState: 'CAUTION',
    priority: 'LOW',
    doseValue: 72.8,
    thresholdExceeded: 40.0,
    message: 'Baseline Escalation: Flare header perimeter air circulation low.',
    acknowledged: true,
    acknowledgedBy: 'Supervisor John Davis',
    acknowledgedAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'ALT-1003',
    workerId: 'W-105',
    workerName: 'David Kim',
    deviceId: 'H2S-ESP32-005',
    timestamp: new Date(Date.now() - 48 * 60000).toISOString(),
    riskState: 'DATA_INVALID',
    priority: 'MEDIUM',
    doseValue: 0,
    thresholdExceeded: 0,
    message: 'Optical Strip Expiry Exceeded (>24h). Replacement badge cartridge required.',
    acknowledged: false,
  },
];

const LOCAL_STORAGE_KEY_WORKERS = 'sulfsense_workers_v1';
const LOCAL_STORAGE_KEY_DEVICES = 'sulfsense_devices_v1';
const LOCAL_STORAGE_KEY_ALERTS = 'sulfsense_alerts_v1';

export function getStoredWorkers(): Worker[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_WORKERS);
    return data ? JSON.parse(data) : INITIAL_WORKERS;
  } catch {
    return INITIAL_WORKERS;
  }
}

export function saveWorkers(workers: Worker[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY_WORKERS, JSON.stringify(workers));
}

export function getStoredDevices(): DosimeterDevice[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_DEVICES);
    return data ? JSON.parse(data) : INITIAL_DEVICES;
  } catch {
    return INITIAL_DEVICES;
  }
}

export function saveDevices(devices: DosimeterDevice[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY_DEVICES, JSON.stringify(devices));
}

export function getStoredAlerts(): AlertItem[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_ALERTS);
    return data ? JSON.parse(data) : INITIAL_ALERTS;
  } catch {
    return INITIAL_ALERTS;
  }
}

export function saveAlerts(alerts: AlertItem[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY_ALERTS, JSON.stringify(alerts));
}
