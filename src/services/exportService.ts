import { SensorTelemetry, Worker } from '../types';

/**
 * Exports telemetry data series as formatted CSV file
 */
export function exportTelemetryToCsv(
  telemetryHistory: SensorTelemetry[],
  workerName: string = 'Worker',
  workerId: string = 'W-101'
) {
  const headers = [
    'Timestamp',
    'Worker ID',
    'Worker Name',
    'Device ID',
    'Raw R',
    'Raw G',
    'Raw B',
    'Raw Clear',
    'CIELAB L',
    'CIELAB a',
    'CIELAB b',
    'Delta E (Color Shift)',
    'Temperature (C)',
    'Humidity (%RH)',
    'Estimated Cumulative Dose (ppm*min)',
    'Dose Uncertainty (+/- ppm*min)',
    'Reading Quality',
    'Risk State',
    'Model Version'
  ];

  const rows = telemetryHistory.map((t) => [
    `"${t.timestamp}"`,
    `"${workerId}"`,
    `"${workerName}"`,
    `"${t.deviceId}"`,
    t.rawColor.r,
    t.rawColor.g,
    t.rawColor.b,
    t.rawColor.clear,
    t.lab.L,
    t.lab.a,
    t.lab.b,
    t.deltaE,
    t.temperature,
    t.humidity,
    t.estimatedDose,
    t.doseUncertainty,
    `"${t.readingQuality}"`,
    `"${t.riskState}"`,
    `"${t.modelVersion}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SulfSense_Exposure_Log_${workerId}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers browser print dialog formatted for safety compliance audits
 */
export function triggerPrintSafetyReport() {
  window.print();
}
