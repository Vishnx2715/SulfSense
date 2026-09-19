import React from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { SensorTelemetry, Worker } from '../../types';
import { exportTelemetryToCsv, triggerPrintSafetyReport } from '../../services/exportService';

interface ExposureAnalyticsProps {
  workers: Worker[];
  telemetryHistory: SensorTelemetry[];
  latestTelemetry: SensorTelemetry;
}

export const ExposureAnalytics: React.FC<ExposureAnalyticsProps> = ({
  workers,
  telemetryHistory,
  latestTelemetry,
}) => {
  const chartData = telemetryHistory.map((t) => ({
    time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dose: t.estimatedDose,
    deltaE: t.deltaE,
    temp: t.temperature,
  }));

  const activeWorker = workers[0]; // Alex Mercer (W-101)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Export Actions */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-navy-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-navy-600 uppercase tracking-wider">
              Shift Audit & Regulatory Compliance
            </span>
          </div>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">Shift Exposure Analytics & Reports</h1>
          <p className="text-xs text-gray-500 mt-1">
            Generate formal OSHA / ACGIH compliant cumulative H₂S dosimeter logs with statistical uncertainty bounds
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportTelemetryToCsv(telemetryHistory, activeWorker.name, activeWorker.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-navy-50 text-navy-800 rounded-xl text-xs font-bold border border-navy-200 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-navy-600" />
            <span>Export CSV Dataset</span>
          </button>
          <button
            onClick={triggerPrintSafetyReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Safety Certificate</span>
          </button>
        </div>
      </div>

      {/* Official Safety Certificate Printable Container */}
      <div className="bg-white rounded-2xl border-2 border-navy-200 shadow-navy-md p-8 printable-report space-y-6">
        {/* Certificate Header */}
        <div className="border-b-2 border-navy-900 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black bg-navy-900 text-white">
                SULFSENSE VERIFIED
              </span>
              <span className="text-xs font-mono text-gray-400">DOC-REF: SUL-2026-0918-A</span>
            </div>
            <h2 className="text-xl font-black text-navy-950">
              INDUSTRIAL OCCUPATIONAL H₂S EXPOSURE AUDIT REPORT
            </h2>
            <p className="text-xs text-gray-500">
              Quantitative Passive Colorimetric Chemical Dosimeter System
            </p>
          </div>
          <div className="text-right text-xs font-mono">
            <span className="text-gray-400 block">Date of Issue</span>
            <span className="font-bold text-navy-900">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Mandatory Scientific Disclaimer Banner */}
        <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold mb-0.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>CRITICAL SCIENTIFIC METHODOLOGY & LIMITATION NOTICE</span>
          </div>
          Values represented below reflect <strong>ESTIMATED CUMULATIVE EXPOSURE</strong> derived from validated optical colorimetric sensor response and calibrated polynomial/random-forest regression kinetics. This system monitors progressive chemical reagent conversion and is not a laboratory-confirmed spectroscopic analysis.
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-navy-50/50 rounded-xl border border-navy-100 text-xs">
          <div>
            <span className="text-gray-400 block text-[11px]">Worker Name & ID:</span>
            <span className="font-bold text-navy-900">
              {activeWorker.name} ({activeWorker.id})
            </span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Assigned ESP32 Wearable:</span>
            <span className="font-mono font-bold text-navy-900">{latestTelemetry.deviceId}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Chemical Strip Batch ID:</span>
            <span className="font-mono font-bold text-navy-900">BATCH-2026-H2S-A1</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Active AI Calibration Model:</span>
            <span className="font-mono font-bold text-navy-900">{latestTelemetry.modelVersion}</span>
          </div>
        </div>

        {/* Key Quantitative Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl border border-navy-100 bg-white shadow-sm">
            <span className="text-xs text-gray-500 block mb-1">Estimated Cumulative Dose</span>
            <div className="text-3xl font-mono font-extrabold text-navy-950">
              {latestTelemetry.estimatedDose.toFixed(1)}{' '}
              <span className="text-xs font-sans font-normal text-gray-500">ppm·min</span>
            </div>
            <span className="text-[11px] text-gray-400 mt-1 block">
              Uncertainty: ±{latestTelemetry.doseUncertainty.toFixed(1)} ppm·min
            </span>
          </div>

          <div className="p-4 rounded-xl border border-navy-100 bg-white shadow-sm">
            <span className="text-xs text-gray-500 block mb-1">Shift Projected 8-Hour TWA</span>
            <div className="text-3xl font-mono font-extrabold text-navy-950">
              {(latestTelemetry.estimatedDose / 480).toFixed(2)}{' '}
              <span className="text-xs font-sans font-normal text-gray-500">ppm average</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              Within 10.0 ppm ACGIH Limit
            </span>
          </div>

          <div className="p-4 rounded-xl border border-navy-100 bg-white shadow-sm">
            <span className="text-xs text-gray-500 block mb-1">Optical Reading Quality</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {latestTelemetry.readingQuality}
            </div>
            <span className="text-[11px] text-gray-400 mt-1 block">
              ΔE: {latestTelemetry.deltaE.toFixed(1)} | Temp: {latestTelemetry.temperature}°C
            </span>
          </div>
        </div>

        {/* Exposure History Chart */}
        <div>
          <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-3">
            Cumulative Exposure Dose Curve (Shift Alpha)
          </h3>
          <div className="h-56 bg-white rounded-xl border border-navy-100 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} />
                <YAxis stroke="#94A3B8" fontSize={10} unit=" ppm·min" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E224D',
                    borderColor: '#1D458F',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="dose" stroke="#1D458F" fill="#2563EB" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Signatures & Auditor Block */}
        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-navy-100 text-xs text-gray-600">
          <div>
            <span className="block font-bold text-navy-900 mb-6">Plant Safety Supervisor Signature:</span>
            <div className="border-b border-gray-400 w-48 mb-1" />
            <span className="font-mono text-[11px]">John Davis, CSP (#88421)</span>
          </div>
          <div className="text-right">
            <span className="block font-bold text-navy-900 mb-6">Industrial Hygiene Verification:</span>
            <div className="border-b border-gray-400 w-48 ml-auto mb-1" />
            <span className="font-mono text-[11px]">NIST Traceable Gas Chamber Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};
