import React, { useState } from 'react';
import {
  Users,
  Radio,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Eye,
  Sliders,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { SensorTelemetry, Worker, DosimeterDevice, AlertItem } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { RiskBadge } from '../../components/common/RiskBadge';
import { DosimeterWristband3D } from '../../components/3d/DosimeterWristband3D';
import { ChemicalStripVisualizer } from '../../components/3d/ChemicalStripVisualizer';
import { WorkerWearableSimulator } from '../../components/wearable/WorkerWearableSimulator';

interface SupervisorDashboardProps {
  workers: Worker[];
  devices: DosimeterDevice[];
  alerts: AlertItem[];
  latestTelemetry: SensorTelemetry;
  onOpenWorkerProfile: (worker: Worker) => void;
  onOpenSimulator: () => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({
  workers,
  devices,
  alerts,
  latestTelemetry,
  onOpenWorkerProfile,
  onOpenSimulator,
}) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('W-101');

  const activeWorkersCount = workers.filter((w) => w.status === 'ACTIVE').length;
  const onlineDevicesCount = devices.filter((d) => d.status === 'ONLINE').length;
  const activeAlertsCount = alerts.filter((a) => !a.acknowledged).length;
  const attentionDevicesCount = devices.filter((d) => d.status === 'ERROR' || d.battery < 20).length;

  const highestDoseWorker = [...workers].sort((a, b) => b.currentDose - a.currentDose)[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome & System Status Bar */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-950 text-white rounded-2xl p-6 shadow-navy-lg border border-navy-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-300 font-bold uppercase tracking-wider">
              Industrial Safety Telemetry Online
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Passive H₂S Exposure Dosimeter Dashboard
          </h1>
          <p className="text-xs text-navy-200 mt-1 max-w-xl">
            Real-time optical colorimetry & AI-assisted cumulative dose estimation ($ppm \cdot min$) across active plant personnel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Sliders className="w-4 h-4" />
            <span>Simulate Gas Release</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Workers"
          value={`${activeWorkersCount} / ${workers.length}`}
          subtitle="Assigned to Active Shifts"
          icon={Users}
          trend={{ value: '+1 on shift', isPositive: true }}
          highlight="default"
        />
        <StatCard
          title="Connected Wristbands"
          value={`${onlineDevicesCount} Online`}
          subtitle="ESP32 Optical Telemetry"
          icon={Radio}
          trend={{ value: '100% gateway packet health', isPositive: true }}
          highlight="default"
        />
        <StatCard
          title="Attention Required"
          value={`${attentionDevicesCount + activeAlertsCount}`}
          subtitle="Strip expiry or dose warnings"
          icon={AlertTriangle}
          highlight={attentionDevicesCount + activeAlertsCount > 0 ? 'danger' : 'success'}
        />
        <StatCard
          title="Peak Shift Dose"
          value={`${highestDoseWorker ? highestDoseWorker.currentDose.toFixed(1) : '0'} ppm·min`}
          subtitle={`Worker: ${highestDoseWorker ? highestDoseWorker.name : 'None'}`}
          icon={Activity}
          highlight={highestDoseWorker && highestDoseWorker.currentDose > 100 ? 'warning' : 'default'}
        />
      </div>

      {/* Main Dual Section: Live Wristband 3D / OLED Wearable + Live Worker Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Interactive Dosimeter & Reaction Kinetics (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-navy-100 shadow-navy-sm p-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                <h3 className="text-sm font-bold text-navy-950">Primary Wearable Model (3D)</h3>
              </div>
              <span className="text-xs font-mono text-gray-500">Live Reaction Rendering</span>
            </div>

            {/* 3D Model Canvas */}
            <DosimeterWristband3D
              rawColor={latestTelemetry.rawColor}
              deltaE={latestTelemetry.deltaE}
              estimatedDose={latestTelemetry.estimatedDose}
              riskState={latestTelemetry.riskState}
            />
          </div>

          {/* Chemical Strip Reaction Kinetics */}
          <ChemicalStripVisualizer
            rawColor={latestTelemetry.rawColor}
            lab={latestTelemetry.lab}
            deltaE={latestTelemetry.deltaE}
            estimatedDose={latestTelemetry.estimatedDose}
          />

          {/* Worker Wearable OLED Display Simulator */}
          <WorkerWearableSimulator telemetry={latestTelemetry} />
        </div>

        {/* Right Column: Live Workforce Monitoring Table (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl border border-navy-100 shadow-navy-sm p-5 card-3d-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-navy-950">Live Workforce Exposure Roster</h2>
                <p className="text-xs text-gray-500">
                  Continuous optical color sensor streaming & AI cumulative dose inference
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 bg-navy-50 text-navy-700 rounded-lg border border-navy-100 font-semibold">
                Updated: Just Now
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Worker & Unit</th>
                    <th className="pb-3">Device ID</th>
                    <th className="pb-3">Estimated Cumulative Dose</th>
                    <th className="pb-3">Risk State</th>
                    <th className="pb-3">Device Status</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {workers.map((worker) => {
                    const isSelected = worker.id === selectedWorkerId;
                    // For the primary worker (W-101), use real-time telemetry from simulator!
                    const dose = worker.id === 'W-101' ? latestTelemetry.estimatedDose : worker.currentDose;
                    const uncertainty = worker.id === 'W-101' ? latestTelemetry.doseUncertainty : 4.5;
                    const risk = worker.id === 'W-101' ? latestTelemetry.riskState : worker.riskState;

                    return (
                      <tr
                        key={worker.id}
                        className={`hover:bg-navy-50/50 transition-colors ${
                          isSelected ? 'bg-navy-50/70 font-medium' : ''
                        }`}
                      >
                        <td className="py-3 pl-2">
                          <div className="font-bold text-navy-950">{worker.name}</div>
                          <div className="text-[11px] text-gray-500">{worker.department}</div>
                        </td>
                        <td className="py-3 font-mono text-gray-600">
                          {worker.assignedDeviceId || 'None'}
                        </td>
                        <td className="py-3">
                          <div className="font-mono font-extrabold text-navy-900 text-sm">
                            {dose.toFixed(1)}{' '}
                            <span className="text-[10px] text-gray-500 font-sans font-normal">
                              ppm·min
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            ±{uncertainty.toFixed(1)} ppm·min
                          </div>
                        </td>
                        <td className="py-3">
                          <RiskBadge state={risk} size="sm" />
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              worker.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                worker.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400'
                              }`}
                            />
                            {worker.status}
                          </span>
                        </td>
                        <td className="py-3 text-right pr-2">
                          <button
                            onClick={() => onOpenWorkerProfile(worker)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-navy-50 text-navy-700 font-semibold border border-navy-200 transition-all text-xs shadow-sm"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3 text-navy-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Configurable Exposure Criteria & Scientific Explanatory Card */}
          <div className="bg-white rounded-2xl border border-navy-100 shadow-navy-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-navy-600" />
                Configured Safety Limits & Thresholds
              </h3>
              <span className="text-[11px] text-gray-500">Validation Protocol: ISO 17025</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-emerald-800 font-semibold block text-[11px]">NORMAL</span>
                <span className="text-base font-extrabold font-mono text-emerald-950">&lt; 40</span>
                <span className="text-[10px] text-emerald-700 block">ppm·min cumulative</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                <span className="text-amber-800 font-semibold block text-[11px]">CAUTION</span>
                <span className="text-base font-extrabold font-mono text-amber-950">40 – 100</span>
                <span className="text-[10px] text-amber-700 block">ppm·min (Action Level)</span>
              </div>
              <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200">
                <span className="text-orange-800 font-semibold block text-[11px]">WARNING</span>
                <span className="text-base font-extrabold font-mono text-orange-950">100 – 200</span>
                <span className="text-[10px] text-orange-700 block">PPE SCBA Required</span>
              </div>
              <div className="p-3 rounded-xl bg-red-50/70 border border-red-200">
                <span className="text-red-800 font-semibold block text-[11px]">HAZARDOUS</span>
                <span className="text-base font-extrabold font-mono text-red-950">&gt; 200</span>
                <span className="text-[10px] text-red-700 block">Immediate Evacuation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
